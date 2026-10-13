'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import {
    AlertTriangle,
    CalendarDays,
    Camera,
    CameraOff,
    CheckCircle,
    ChevronDown,
    Keyboard,
    Loader2,
    MapPin,
    ScanLine,
    Users,
    XCircle,
} from 'lucide-react';
import { eventService, ScanTicketError } from '@/api/eventService';
import { analyticsService } from '@/api/analyticsService';
import { getOrgId } from '@/utils/token';
import { EventResponse, ScanTicketResponse } from '@/types/event.types';
import { EventAnalytics } from '@/types/analytics.types';

type LocationStatus = 'idle' | 'waiting' | 'ready' | 'denied' | 'unavailable' | 'unsupported';

type ScanResult =
    | { kind: 'success'; data: ScanTicketResponse }
    | { kind: 'error'; message: string; status?: number };

interface HistoryItem {
    id: number;
    time: string;
    label: string;
    ok: boolean;
}

interface Coords {
    latitude: number;
    longitude: number;
}

const SAME_CODE_COOLDOWN_MS = 5000; // ignore the same QR code again for 5 seconds
const SUCCESS_AUTO_CLEAR_MS = 3500; // success card disappears and scanning continues
const DECODE_INTERVAL_MS = 120; // ~8 decode attempts per second is enough and saves battery

export default function CheckInScanner() {
    // ---------- events ----------
    const [events, setEvents] = useState<EventResponse[]>([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [isEventsLoading, setIsEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState<string | null>(null);

    // ---------- scanner / camera ----------
    const [isScanning, setIsScanning] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    // ---------- location ----------
    const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
    const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);

    // ---------- scan result ----------
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [stats, setStats] = useState<EventAnalytics | null>(null);
    const [manualCode, setManualCode] = useState('');

    // ---------- refs (values needed inside the camera loop without re-creating it) ----------
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const positionRef = useRef<Coords | null>(null);
    const processingRef = useRef(false); // true while a request is running
    const holdRef = useRef(false); // true while a result card is on screen
    const lastCodeRef = useRef('');
    const lastCodeAtRef = useRef(0);
    const lastDecodeAtRef = useRef(0);
    const historyIdRef = useRef(0);
    const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const selectedEventIdRef = useRef('');
    const submitRef = useRef<(code: string) => void>(() => { });

    const selectedEvent = events.find((e) => e.id === selectedEventId);

    useEffect(() => {
        selectedEventIdRef.current = selectedEventId;
    }, [selectedEventId]);

    // ---------------------------------------------------------------------------
    // Load the organizer's published events (same approach as the Tickets page)
    // ---------------------------------------------------------------------------
    useEffect(() => {
        const orgId = getOrgId();
        if (!orgId) {
            setEventsError('Organization not found. Please log in again.');
            setIsEventsLoading(false);
            return;
        }

        const fetchEvents = async () => {
            try {
                setIsEventsLoading(true);
                const data = await eventService.getOrgEvents(orgId);
                const published = data.filter((e) => e.status === 'PUBLISHED');
                setEvents(published);
                if (published.length > 0) setSelectedEventId(published[0].id);
            } catch (err) {
                setEventsError(err instanceof Error ? err.message : 'Failed to load events.');
            } finally {
                setIsEventsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // ---------------------------------------------------------------------------
    // Check-in counters
    // ---------------------------------------------------------------------------
    const refreshStats = useCallback(async (eventId: string) => {
        try {
            const data = await analyticsService.getEventAnalytics(eventId);
            // ignore the answer if the organizer already switched to another event
            if (eventId === selectedEventIdRef.current) setStats(data);
        } catch {
            // counters are optional; never block scanning because of them
        }
    }, []);

    useEffect(() => {
        setStats(null);
        if (selectedEventId) refreshStats(selectedEventId);
    }, [selectedEventId, refreshStats]);

    // ---------------------------------------------------------------------------
    // Location (the scan endpoint expects the scanner's latitude / longitude)
    // ---------------------------------------------------------------------------
    const startLocationWatch = useCallback(() => {
        if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
            setLocationStatus('unsupported');
            return;
        }
        if (watchIdRef.current !== null) return;

        setLocationStatus('waiting');
        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                positionRef.current = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                setLocationAccuracy(Math.round(pos.coords.accuracy));
                setLocationStatus('ready');
            },
            (err) => {
                // keep using the last good position if we already have one
                if (positionRef.current) return;
                setLocationStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable');
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
        );
    }, []);

    const stopLocationWatch = useCallback(() => {
        if (watchIdRef.current !== null && typeof navigator !== 'undefined') {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }
        watchIdRef.current = null;
    }, []);

    // One-time position request, used when the organizer types a code manually
    const getPositionOnce = useCallback((): Promise<Coords | null> => {
        return new Promise((resolve) => {
            if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
                setLocationStatus('unsupported');
                resolve(null);
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                    positionRef.current = coords;
                    setLocationAccuracy(Math.round(pos.coords.accuracy));
                    setLocationStatus('ready');
                    resolve(coords);
                },
                (err) => {
                    setLocationStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable');
                    resolve(null);
                },
                { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
            );
        });
    }, []);

    // ---------------------------------------------------------------------------
    // Sending the scan to the backend
    // ---------------------------------------------------------------------------
    const clearResult = useCallback(() => {
        if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
        clearTimerRef.current = null;
        holdRef.current = false;
        setResult(null);
    }, []);

    const addHistory = useCallback((label: string, ok: boolean) => {
        historyIdRef.current += 1;
        const item: HistoryItem = {
            id: historyIdRef.current,
            time: new Date().toLocaleTimeString(),
            label,
            ok,
        };
        setHistory((prev) => [item, ...prev].slice(0, 10));
    }, []);

    const submitCode = useCallback(
        async (rawCode: string) => {
            const code = rawCode.trim();
            const eventId = selectedEventIdRef.current;
            if (!code || !eventId || processingRef.current) return;

            // Same QR code seen again within a few seconds -> ignore (camera sees it many times)
            const now = Date.now();
            if (code === lastCodeRef.current && now - lastCodeAtRef.current < SAME_CODE_COOLDOWN_MS) return;
            lastCodeRef.current = code;
            lastCodeAtRef.current = now;

            processingRef.current = true;
            holdRef.current = true;
            setIsProcessing(true);
            setResult(null);
            if (clearTimerRef.current) clearTimeout(clearTimerRef.current);

            try {
                // Use the live position if we have one, otherwise try once.
                const coords = positionRef.current ?? (await getPositionOnce());

                // The backend needs the scanner's latitude and longitude (it crashes without them),
                // so do not send the request until we have a location.
                if (!coords) {
                    const message =
                        'Location is required to check in attendees. Allow location access for this site in your browser, then scan again.';
                    setResult({ kind: 'error', message });
                    addHistory(message, false);
                    lastCodeRef.current = ''; // allow the same QR code to be retried right away
                    return;
                }

                const data = await eventService.scanTicket(eventId, {
                    qrCodeHash: code,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                });

                setResult({ kind: 'success', data });
                addHistory(`${data.assignedName} (${data.tierName})`, true);
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(80);
                refreshStats(eventId);

                // success: let the camera continue automatically after a short pause
                clearTimerRef.current = setTimeout(() => {
                    holdRef.current = false;
                    setResult(null);
                }, SUCCESS_AUTO_CLEAR_MS);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Check-in failed.';
                const status = err instanceof ScanTicketError ? err.status : undefined;
                setResult({ kind: 'error', message, status });
                addHistory(message, false);
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([100, 60, 100]);
                // errors stay on screen until the organizer taps "Scan next"
            } finally {
                processingRef.current = false;
                setIsProcessing(false);
            }
        },
        [addHistory, getPositionOnce, refreshStats]
    );

    // keep the latest submit function available to the camera loop
    useEffect(() => {
        submitRef.current = submitCode;
    }, [submitCode]);

    // ---------------------------------------------------------------------------
    // Camera loop
    // ---------------------------------------------------------------------------
    const tick = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const now = performance.now();

        if (
            video &&
            canvas &&
            video.readyState === video.HAVE_ENOUGH_DATA &&
            !holdRef.current &&
            !processingRef.current &&
            now - lastDecodeAtRef.current >= DECODE_INTERVAL_MS
        ) {
            lastDecodeAtRef.current = now;

            // Scale the frame down: jsQR is much faster on ~640px images
            const scale = Math.min(1, 640 / Math.max(video.videoWidth, video.videoHeight));
            const width = Math.max(1, Math.floor(video.videoWidth * scale));
            const height = Math.max(1, Math.floor(video.videoHeight * scale));
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
                ctx.drawImage(video, 0, 0, width, height);
                const image = ctx.getImageData(0, 0, width, height);
                const found = jsQR(image.data, width, height, { inversionAttempts: 'dontInvert' });
                if (found && found.data) submitRef.current(found.data);
            }
        }

        rafRef.current = requestAnimationFrame(tick);
    }, []);

    const stopScanner = useCallback(() => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        stopLocationWatch();
        setIsScanning(false);
    }, [stopLocationWatch]);

    const startScanner = async () => {
        setCameraError(null);

        if (!selectedEventId) return;
        if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
            setCameraError(
                'The camera is not available in this browser or this page is not secure. Open the site over HTTPS (or localhost) in a modern browser.'
            );
            return;
        }

        try {
            setIsStarting(true);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' } }, // back camera on phones
                audio: false,
            });
            streamRef.current = stream;

            const video = videoRef.current;
            if (!video) {
                stream.getTracks().forEach((t) => t.stop());
                return;
            }
            video.srcObject = stream;
            await video.play();

            startLocationWatch();
            setIsScanning(true);
            rafRef.current = requestAnimationFrame(tick);
        } catch (err) {
            const name = err instanceof DOMException ? err.name : '';
            if (name === 'NotAllowedError' || name === 'SecurityError') {
                setCameraError('Camera permission was denied. Allow camera access in your browser settings and try again.');
            } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
                setCameraError('No camera was found on this device.');
            } else if (name === 'NotReadableError') {
                setCameraError('The camera is being used by another app. Close it and try again.');
            } else {
                setCameraError('Could not start the camera.');
            }
        } finally {
            setIsStarting(false);
        }
    };

    // Always release the camera, GPS and timers when leaving the page
    useEffect(() => {
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            streamRef.current?.getTracks().forEach((track) => track.stop());
            if (watchIdRef.current !== null && typeof navigator !== 'undefined') {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
            if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
        };
    }, []);

    const handleEventChange = (id: string) => {
        stopScanner();
        clearResult();
        setHistory([]);
        lastCodeRef.current = '';
        setSelectedEventId(id);
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualCode.trim()) return;
        submitCode(manualCode);
        setManualCode('');
    };

    // ---------------------------------------------------------------------------
    // UI helpers
    // ---------------------------------------------------------------------------
    const errorHint = (status?: number): string | null => {
        if (status === 401) return 'Your session has expired. Please sign in again.';
        if (status === 403) return 'You do not have permission to check in attendees for this event.';
        return null;
    };

    const locationLabel: Record<LocationStatus, string> = {
        idle: 'Location is requested when you start scanning.',
        waiting: 'Getting your location...',
        ready: `Location ready${locationAccuracy !== null ? ` (accuracy about ${locationAccuracy} m)` : ''}.`,
        denied: 'Location permission denied. Allow location for this site to check attendees in.',
        unavailable: 'Could not get your location. Check that location is turned on for your device.',
        unsupported: 'This browser does not support location.',
    };

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------
    if (isEventsLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse h-40 rounded-3xl bg-gray-100 dark:bg-gray-800" />
                <div className="animate-pulse h-96 rounded-2xl bg-gray-100 dark:bg-gray-800" />
            </div>
        );
    }

    if (eventsError) {
        return (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-500/10 dark:text-red-400">
                {eventsError}
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center dark:border-gray-800">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
                    <CalendarDays className="w-7 h-7 text-brand-500" />
                </div>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">No Published Events</p>
                <p className="text-sm text-gray-400">Publish an event to start checking attendees in.</p>
            </div>
        );
    }

    const eventHasNoCoordinates =
        selectedEvent && (selectedEvent.lat === undefined || selectedEvent.lat === null || selectedEvent.lon === undefined || selectedEvent.lon === null);

    return (
        <div className="space-y-8">
            {/* Hero + event picker */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-700 via-brand-500 to-brand-900 p-8 text-white shadow-xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_40%)]" />
                <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-sm font-medium text-white/70">Ticket Check-In</p>
                        <h2 className="mt-2 text-3xl font-bold lg:text-4xl">{selectedEvent?.title}</h2>
                        <p className="mt-3 max-w-2xl text-white/80">
                            Scan an attendee&apos;s QR code to check them in. Each ticket can only be used once.
                        </p>
                    </div>
                    <div className="relative w-full lg:w-auto lg:min-w-[320px]">
                        <select
                            value={selectedEventId}
                            onChange={(e) => handleEventChange(e.target.value)}
                            className="w-full appearance-none rounded-2xl border border-white/20 bg-white/10 px-5 py-3 pr-12 text-sm font-semibold text-white backdrop-blur-xl outline-none transition-all hover:bg-white/15"
                        >
                            {events.map((event) => (
                                <option key={event.id} value={event.id} className="text-black">
                                    {event.title}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
                    </div>
                </div>
            </div>

            {eventHasNoCoordinates && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/30 dark:bg-amber-500/10 dark:text-amber-300">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                        This event has no venue coordinates saved. If the server compares your location with the venue, check-ins may
                        be rejected. Add the venue location in the event details first.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* LEFT: camera + manual entry */}
                <div className="space-y-6">
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/3">
                        <div className="relative aspect-square w-full bg-gray-900 sm:aspect-video lg:aspect-square">
                            <video ref={videoRef} muted playsInline className={`h-full w-full object-cover ${isScanning ? '' : 'hidden'}`} />
                            <canvas ref={canvasRef} className="hidden" />

                            {isScanning && (
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                    <div className="h-3/5 w-3/5 rounded-2xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                                </div>
                            )}

                            {isScanning && isProcessing && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <Loader2 className="h-10 w-10 animate-spin text-white" />
                                </div>
                            )}

                            {!isScanning && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white/80">
                                    <ScanLine className="h-12 w-12" />
                                    <p className="text-sm">The camera is off. Start scanning to check attendees in.</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 p-5">
                            {cameraError && (
                                <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-500/10 dark:text-red-400">
                                    <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>{cameraError}</span>
                                </div>
                            )}

                            {isScanning ? (
                                <button
                                    onClick={stopScanner}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    <CameraOff className="h-4 w-4" />
                                    Stop scanning
                                </button>
                            ) : (
                                <button
                                    onClick={startScanner}
                                    disabled={isStarting}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isStarting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                                    {isStarting ? 'Starting camera...' : 'Start scanning'}
                                </button>
                            )}

                            <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                <span>{locationLabel[locationStatus]}</span>
                            </div>
                        </div>
                    </div>

                    {/* Manual entry fallback */}
                    <form
                        onSubmit={handleManualSubmit}
                        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/3"
                    >
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                            <Keyboard className="h-4 w-4 text-brand-500" />
                            Enter code manually
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <input
                                type="text"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                                placeholder="Paste the ticket QR code value"
                                autoComplete="off"
                                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                            <button
                                type="submit"
                                disabled={!manualCode.trim() || isProcessing}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                Check in
                            </button>
                        </div>
                    </form>
                </div>

                {/* RIGHT: result, counters, history */}
                <div className="space-y-6">
                    <div aria-live="polite" className="min-h-[200px]">
                        {isProcessing && !result && (
                            <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-white/3">
                                <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Checking ticket...</p>
                            </div>
                        )}

                        {!isProcessing && !result && (
                            <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-white/3">
                                <ScanLine className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                                <p className="mt-3 text-sm text-gray-400">The result of the next scan will appear here.</p>
                            </div>
                        )}

                        {result?.kind === 'success' && (
                            <div className="rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-900/30 dark:bg-green-500/10">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-9 w-9 text-green-600 dark:text-green-400" />
                                    <div>
                                        <p className="text-lg font-bold text-green-800 dark:text-green-300">Checked in</p>
                                        <p className="text-sm text-green-700/80 dark:text-green-300/80">Ticket accepted.</p>
                                    </div>
                                </div>
                                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <dt className="text-xs text-green-700/70 dark:text-green-300/70">Attendee</dt>
                                        <dd className="font-semibold text-gray-900 dark:text-white">{result.data.assignedName}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs text-green-700/70 dark:text-green-300/70">Ticket type</dt>
                                        <dd className="font-semibold text-gray-900 dark:text-white">{result.data.tierName}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs text-green-700/70 dark:text-green-300/70">Check-in time</dt>
                                        <dd className="font-semibold text-gray-900 dark:text-white">
                                            {new Date(result.data.checkInTime).toLocaleTimeString()}
                                        </dd>
                                    </div>
                                    {typeof result.data.distanceMeters === 'number' && (
                                        <div>
                                            <dt className="text-xs text-green-700/70 dark:text-green-300/70">Distance from venue</dt>
                                            <dd className="font-semibold text-gray-900 dark:text-white">
                                                {Math.round(result.data.distanceMeters)} m
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        )}

                        {result?.kind === 'error' && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-500/10">
                                <div className="flex items-start gap-3">
                                    <XCircle className="h-9 w-9 shrink-0 text-red-600 dark:text-red-400" />
                                    <div>
                                        <p className="text-lg font-bold text-red-800 dark:text-red-300">Check-in failed</p>
                                        <p className="mt-1 text-sm text-red-700 dark:text-red-300/90">{result.message}</p>
                                        {errorHint(result.status) && (
                                            <p className="mt-2 text-xs text-red-600/80 dark:text-red-300/70">{errorHint(result.status)}</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={clearResult}
                                    className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                                >
                                    Scan next
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Counters */}
                    {stats && (
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-white/3">
                                <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCheckedIn}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Checked in</p>
                            </div>
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-white/3">
                                <Users className="mx-auto h-5 w-5 text-amber-500" />
                                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPendingEntry}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Pending entry</p>
                            </div>
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-white/3">
                                <CalendarDays className="mx-auto h-5 w-5 text-brand-500" />
                                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTicketsSold}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Tickets sold</p>
                            </div>
                        </div>
                    )}

                    {/* Session history */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/3">
                        <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Recent scans (this session)</p>
                        {history.length === 0 ? (
                            <p className="text-sm text-gray-400">No scans yet.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                                {history.map((item) => (
                                    <li key={item.id} className="flex items-start gap-3 py-2.5 text-sm">
                                        {item.ok ? (
                                            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                                        ) : (
                                            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                                        )}
                                        <span className="flex-1 text-gray-700 dark:text-gray-300">{item.label}</span>
                                        <span className="shrink-0 text-xs text-gray-400">{item.time}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}