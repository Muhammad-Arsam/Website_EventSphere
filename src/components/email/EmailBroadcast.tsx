'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, ChevronDown, Loader2, Send, Mail, Users, History, Plus } from 'lucide-react';
import { eventService } from '@/api/eventService';
import { emailService } from '@/api/emailService';
import { EventResponse } from '@/types/event.types';
import { BroadcastRecord } from '@/types/email.types';
import Alert from '@/components/ui/alert/Alert';

export default function EmailBroadcast() {
    const [events, setEvents] = useState<EventResponse[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [isEventsLoading, setIsEventsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isFetchingBroadcasts, setIsFetchingBroadcasts] = useState(false);
    const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>([]);

    // Alert state
    const [alert, setAlert] = useState<{
        variant: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message: string;
    } | null>(null);
    const [alertKey, setAlertKey] = useState(0); // 👈 NEW: force remount

    const showAlert = (
        variant: 'success' | 'error' | 'warning' | 'info',
        title: string,
        message: string
    ) => {
        setAlert({ variant, title, message });
        setAlertKey(prev => prev + 1); // 👈 NEW: increment key
    };

    // Email form states
    const [emailType, setEmailType] = useState<'broadcast' | 'custom'>('broadcast');
    const [subject, setSubject] = useState('');
    const [messageBody, setMessageBody] = useState('');
    const [customEmails, setCustomEmails] = useState<string[]>([]);
    const [customEmailInput, setCustomEmailInput] = useState('');

    // Fetch events (only published)
    useEffect(() => {
        const orgId = localStorage.getItem('orgId');
        if (!orgId) {
            showAlert('error', 'Organization Error', 'Organization not found. Please log in again.');
            setIsEventsLoading(false);
            return;
        }

        const fetchEvents = async () => {
            try {
                setIsEventsLoading(true);
                const data = await eventService.getOrgEvents(orgId);
                const published = data.filter(e => e.status === 'PUBLISHED');
                setEvents(published);
                if (published.length > 0) {
                    setSelectedEventId(published[0].id);
                }
            } catch (err: any) {
                showAlert('error', 'Loading Failed', err.message || 'Failed to load events.');
            } finally {
                setIsEventsLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Fetch broadcast history when event changes
    useEffect(() => {
        if (!selectedEventId) return;
        const fetchBroadcasts = async () => {
            try {
                setIsFetchingBroadcasts(true);
                const data = await emailService.getAllBroadcasts(selectedEventId);
                setBroadcasts(data);
            } catch (err: any) {
                console.error(err);
                setBroadcasts([]);
            } finally {
                setIsFetchingBroadcasts(false);
            }
        };
        fetchBroadcasts();
    }, [selectedEventId]);

    const handleAddCustomEmail = () => {
        if (customEmailInput.trim() && !customEmails.includes(customEmailInput.trim())) {
            setCustomEmails([...customEmails, customEmailInput.trim()]);
            setCustomEmailInput('');
        }
    };

    const handleRemoveCustomEmail = (email: string) => {
        setCustomEmails(customEmails.filter(e => e !== email));
    };

    const handleSendEmail = async () => {
        if (!selectedEventId) return;
        if (!subject.trim() || !messageBody.trim()) {
            showAlert('error', 'Missing Fields', 'Subject and message body are required.');
            return;
        }
        if (emailType === 'custom' && customEmails.length === 0) {
            showAlert('error', 'No Recipients', 'At least one recipient email is required for custom email.');
            return;
        }

        setIsSending(true);

        try {
            if (emailType === 'broadcast') {
                await emailService.sendBroadcastEmail(selectedEventId, {
                    subject,
                    messageBody,
                });
                showAlert('success', 'Broadcast Sent', 'Broadcast email sent to all attendees!');
            } else {
                await emailService.sendCustomEmail(selectedEventId, {
                    email: customEmails,
                    subject,
                    messageBody,
                });
                showAlert('success', 'Email Sent', 'Custom email sent successfully!');
            }
            // Clear form after successful send
            setSubject('');
            setMessageBody('');
            setCustomEmails([]);
            // Refresh broadcast list
            const updated = await emailService.getAllBroadcasts(selectedEventId);
            setBroadcasts(updated);
        } catch (err: any) {
            showAlert('error', 'Send Failed', err.message || 'Failed to send email.');
        } finally {
            setIsSending(false);
        }
    };

    const selectedEvent = events.find(e => e.id === selectedEventId);

    if (isEventsLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse h-11 w-72 rounded-xl bg-gray-100 dark:bg-gray-800" />
                <div className="animate-pulse h-96 rounded-2xl bg-gray-100 dark:bg-gray-800" />
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
                <p className="text-sm text-gray-400">Publish an event to enable email broadcasts.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Toast Alerts */}
            {alert && (
                <div className="fixed top-6 right-6 z-99999 w-full max-w-sm drop-shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <Alert
                        key={alertKey} // 👈 NEW: forces a fresh instance each time
                        variant={alert.variant}
                        title={alert.title}
                        message={alert.message}
                    />
                </div>
            )}

            {/* Rest of your UI remains exactly the same */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-700 via-brand-500 to-brand-900 p-8 text-white shadow-xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_40%)]" />
                <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-sm font-medium text-white/70">Email Campaigns</p>
                        <h2 className="mt-2 text-3xl font-bold lg:text-4xl">{selectedEvent?.title}</h2>
                        <p className="mt-3 max-w-2xl text-white/80">Send broadcast emails to all attendees or custom emails to specific people.</p>
                    </div>
                    <div className="relative w-full lg:w-auto lg:min-w-[320px]">
                        <select
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
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

            {/* Email Form Card */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/3">
                <div className="border-b border-gray-200 p-5 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-brand-500" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Compose Email</h3>
                    </div>
                </div>
                <div className="p-5 space-y-5">
                    {/* Type Toggle */}
                    <div className="flex gap-3 border-b border-gray-200 pb-3 dark:border-gray-800">
                        <button
                            onClick={() => setEmailType('broadcast')}
                            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${emailType === 'broadcast'
                                ? 'bg-brand-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                                }`}
                        >
                            <Users className="h-4 w-4" />
                            Broadcast to All Attendees
                        </button>
                        <button
                            onClick={() => setEmailType('custom')}
                            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${emailType === 'custom'
                                ? 'bg-brand-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                                }`}
                        >
                            <Plus className="h-4 w-4" />
                            Custom Emails
                        </button>
                    </div>

                    {/* Custom Emails List */}
                    {emailType === 'custom' && (
                        <div className="space-y-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Recipients</label>
                            <div className="flex flex-wrap gap-2">
                                {customEmails.map(email => (
                                    <span key={email} className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-sm text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
                                        {email}
                                        <button onClick={() => handleRemoveCustomEmail(email)} className="ml-1 hover:text-red-600">×</button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={customEmailInput}
                                    onChange={(e) => setCustomEmailInput(e.target.value)}
                                    placeholder="attendee@example.com"
                                    className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
                                />
                                <button
                                    onClick={handleAddCustomEmail}
                                    className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300 dark:bg-gray-700"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Your event update..."
                            className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
                        />
                    </div>

                    {/* Message Body */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                        <textarea
                            rows={6}
                            value={messageBody}
                            onChange={(e) => setMessageBody(e.target.value)}
                            placeholder="Write your email content here..."
                            className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
                        />
                    </div>

                    <button
                        onClick={handleSendEmail}
                        disabled={isSending}
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
                    >
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {isSending ? 'Sending...' : 'Send Email'}
                    </button>
                </div>
            </div>

            {/* Broadcast History */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/3">
                <div className="border-b border-gray-200 p-5 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-brand-500" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Broadcast History</h3>
                    </div>
                </div>
                <div className="p-5">
                    {isFetchingBroadcasts ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                    ) : broadcasts.length === 0 ? (
                        <p className="text-center text-gray-400">No emails sent yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {broadcasts.map((broadcast) => (
                                <div key={broadcast.id} className="rounded-lg border border-gray-100 p-4 dark:border-gray-800">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{broadcast.subject}</p>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{broadcast.messageBody}</p>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(broadcast.sentAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                                        <Users className="h-3 w-3" />
                                        Sent to {broadcast.recipientCount} recipients
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}