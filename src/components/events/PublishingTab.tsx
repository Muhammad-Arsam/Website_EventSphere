'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    Globe, GlobeLock, Link2, Palette, LayoutTemplate, Loader2,
    CheckCircle2, ExternalLink, RefreshCw, Info, Type, Phone, Mail, Globe2,
    MessageCircle, PanelsTopLeft,
} from 'lucide-react';
import {
    FaFacebook,
    FaInstagram,
    FaLinkedin,
    FaXTwitter,
} from "react-icons/fa6";
import { eventService } from '@/api/eventService';
import { LandingPage } from '@/types/event.types';
import { ThemeConfigJson, TemplateName, FontStyle, TabName, SocialLinks } from '@/types/template.types';
import Alert from '@/components/ui/alert/Alert';

interface PublishingTabProps {
    eventId: string;
    eventStatus: string;
    onStatusChange: (newStatus: string) => void;
}

const TEMPLATE_OPTIONS: { value: TemplateName; label: string; description: string }[] = [
    { value: 'STANDARD', label: 'Standard', description: 'Best for tech conferences, concerts, and high-energy events.' },
    { value: 'MINIMAL', label: 'Minimal', description: 'Best for corporate summits, formal galas, and premium workshops.' },
    { value: 'MODERN', label: 'Modern', description: 'Best for creative festivals, hackathons, and modern pop-up events.' },
];

const FONT_OPTIONS: { value: FontStyle; label: string; preview: string }[] = [
    { value: 'dm-sans', label: 'DM Sans', preview: 'Clean & Modern' },
    { value: 'playfair', label: 'Playfair Display', preview: 'Elegant & Serif' },
    { value: 'space-grotesk', label: 'Space Grotesk', preview: 'Techy & Bold' },
    { value: 'cabinet-grotesk', label: 'Cabinet Grotesk', preview: 'Editorial & Strong' },
    { value: 'syne', label: 'Syne', preview: 'Artistic & Unique' },
];

// ─── Updated TAB_OPTIONS with Sponsors ────────────────────────────────
const TAB_OPTIONS: { value: TabName; label: string; description: string }[] = [
    { value: 'overview', label: 'Overview', description: 'Description, date & location info' },
    { value: 'schedule', label: 'Schedule', description: 'Agenda & timeline of sessions' },
    { value: 'tickets', label: 'Tickets', description: 'All ticket tiers with pricing' },
    { value: 'location', label: 'Location', description: 'Interactive map embed' },
    { value: 'contact', label: 'Contact', description: 'Organizer contact details' },
    { value: 'social', label: 'Social', description: 'Social links & share buttons' },
    { value: 'sponsors', label: 'Sponsors', description: 'Display sponsor logos & tiers' },
    { value: 'recover', label: 'Recover Tickets', description: 'Allow attendees to recover their tickets by email' },
];

const SOCIAL_FIELDS: { key: keyof SocialLinks; label: string; icon: React.ReactNode; placeholder: string }[] = [
    { key: 'facebook', label: 'Facebook', icon: <FaFacebook className="w-4 h-4" />, placeholder: 'https://facebook.com/yourpage' },
    { key: 'instagram', label: 'Instagram', icon: <FaInstagram className="w-4 h-4" />, placeholder: 'https://instagram.com/yourhandle' },
    { key: 'twitter', label: 'Twitter / X', icon: <FaXTwitter className="w-4 h-4" />, placeholder: 'https://x.com/yourhandle' },
    { key: 'linkedin', label: 'LinkedIn', icon: <FaLinkedin className="w-4 h-4" />, placeholder: 'https://linkedin.com/in/yourprofile' },
    { key: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-4 h-4" />, placeholder: 'https://wa.me/923001234567' },
    { key: 'website', label: 'Website', icon: <Globe2 className="w-4 h-4" />, placeholder: 'https://yourwebsite.com' },
];

export default function PublishingTab({ eventId, eventStatus, onStatusChange }: PublishingTabProps) {
    const [isPublishing, setIsPublishing] = useState(false);
    const [toast, setToast] = useState<{
        variant: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message: string;
        id: number;
    } | null>(null);

    const [landingPage, setLandingPage] = useState<LandingPage | null>(null);
    const [isLandingPageLoading, setIsLandingPageLoading] = useState(true);
    const [isSavingConfig, setIsSavingConfig] = useState(false);

    // Form state
    const [slug, setSlug] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#06b6d4');
    const [secondaryColor, setSecondaryColor] = useState('#3b82f6');
    const [backgroundColor, setBackgroundColor] = useState('#0B0F19');
    const [fontStyle, setFontStyle] = useState<FontStyle>('dm-sans');
    const [templateName, setTemplateName] = useState<TemplateName>('STANDARD');
    const [organizerName, setOrganizerName] = useState('');
    const [organizerEmail, setOrganizerEmail] = useState('');
    const [organizerPhone, setOrganizerPhone] = useState('');
    const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
    const [enabledTabs, setEnabledTabs] = useState<TabName[]>([
        'overview', 'schedule', 'tickets', 'location', 'contact', 'social', 'sponsors', 'recover'
    ]);

    const isPublished = eventStatus === 'PUBLISHED' || eventStatus === 'PB';

    const fetchLandingPageSettings = useCallback(async () => {
        setIsLandingPageLoading(true);
        try {
            const data = await eventService.getLandingPageSettings(eventId);
            setLandingPage(data);
            setSlug(data.slug || '');
            const parsed = eventService.parseLandingPageTheme(data);
            if (parsed) {
                setPrimaryColor(parsed.primaryColor || '#06b6d4');
                setSecondaryColor(parsed.secondaryColor || '#3b82f6');
                setBackgroundColor(parsed.backgroundColor || '#0B0F19');
                setFontStyle(parsed.fontStyle || 'dm-sans');
                setTemplateName(parsed.templateName || 'STANDARD');
                setOrganizerName(parsed.organizerName || '');
                setOrganizerEmail(parsed.organizerEmail || '');
                setOrganizerPhone(parsed.organizerPhone || '');
                setSocialLinks(parsed.socialLinks || {});
                const tabs = parsed.enabledTabs || ['overview', 'schedule', 'tickets', 'location', 'contact', 'social', 'sponsors', 'recover'];
                setEnabledTabs(tabs);
            }
        } catch {
            setLandingPage(null);
        } finally {
            setIsLandingPageLoading(false);
        }
    }, [eventId]);

    useEffect(() => { fetchLandingPageSettings(); }, [fetchLandingPageSettings]);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }, [toast?.id]);

    const handlePublishToggle = async () => {
        setIsPublishing(true);
        try {
            if (isPublished) {
                const msg = await eventService.unpublishEvent(eventId);
                onStatusChange('DRAFT');
                setToast({ variant: 'success', title: 'Event Unpublished', message: msg || 'Event unpublished successfully.', id: Date.now() });
            } else {
                const msg = await eventService.publishEvent(eventId);
                onStatusChange('PUBLISHED');
                setToast({ variant: 'success', title: 'Event Published', message: msg || 'Event published successfully.', id: Date.now() });
            }
        } catch (err: any) {
            setToast({ variant: 'error', title: 'Action Failed', message: err.message || 'Something went wrong.', id: Date.now() });
        } finally {
            setIsPublishing(false);
        }
    };

    const handleTabToggle = (tab: TabName) => {
        if (tab === 'overview') return; // overview always enabled
        setEnabledTabs(prev =>
            prev.includes(tab) ? prev.filter(t => t !== tab) : [...prev, tab]
        );
    };

    const handleSocialLinkChange = (key: keyof SocialLinks, value: string) => {
        setSocialLinks(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveConfig = async () => {
        if (!slug.trim()) {
            setToast({ variant: 'error', title: 'Validation Error', message: 'Slug is required.', id: Date.now() });
            return;
        }
        setIsSavingConfig(true);
        try {
            const themeConfig: ThemeConfigJson = {
                primaryColor, secondaryColor, backgroundColor,
                fontStyle, templateName, organizerName,
                organizerEmail, organizerPhone, socialLinks, enabledTabs,
            };
            const updated = await eventService.configureLandingPage(eventId, {
                slug: slug.trim(),
                themeConfigJson: themeConfig,
            });
            setLandingPage(updated);
            setToast({ variant: 'success', title: 'Configuration Saved', message: 'Landing page configuration saved successfully!', id: Date.now() });
        } catch (err: any) {
            setToast({ variant: 'error', title: 'Save Failed', message: err.message || 'Failed to save configuration.', id: Date.now() });
        } finally {
            setIsSavingConfig(false);
        }
    };

    // const landingPageUrl = slug ? `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/explore/${slug}` : null;
    const landingPageUrl = slug ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://web-eventsphere.vercel.app'}/explore/${slug}` : null;


    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">

            {toast && (
                <div className="fixed top-6 right-6 z-99999 w-full max-w-sm drop-shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <Alert key={toast.id} variant={toast.variant} title={toast.title} message={toast.message} />
                </div>
            )}

            {/* ── Section 1: Publish Status ── */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <Globe className="w-5 h-5 text-brand-600" />
                    <h3 className="font-bold text-gray-900">Event Status</h3>
                </div>
                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${isPublished ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-500 border-amber-100'}`}>
                            {isPublished ? <Globe className="w-6 h-6" /> : <GlobeLock className="w-6 h-6" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full ${isPublished ? 'bg-green-500' : 'bg-amber-400'}`}></span>
                                <span className="font-bold text-gray-900 text-lg">{isPublished ? 'Published' : 'Draft'}</span>
                            </div>
                            <p className="text-sm text-gray-500 max-w-md">
                                {isPublished
                                    ? 'Your event is live and visible to attendees. They can discover and purchase tickets.'
                                    : 'Your event is in draft mode. Only you can see it. Publish to make it visible to attendees.'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handlePublishToggle}
                        disabled={isPublishing}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed ${isPublished ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-200'}`}
                    >
                        {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : isPublished ? <GlobeLock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                        {isPublishing ? 'Processing...' : isPublished ? 'Unpublish Event' : 'Publish Event'}
                    </button>
                </div>
            </div>

            {/* ── Section 2: Landing Page Configuration ── */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <LayoutTemplate className="w-5 h-5 text-brand-600" />
                        <h3 className="font-bold text-gray-900">Landing Page</h3>
                    </div>
                    <button onClick={fetchLandingPageSettings} disabled={isLandingPageLoading} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all" title="Refresh">
                        <RefreshCw className={`w-4 h-4 ${isLandingPageLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {isLandingPageLoading ? (
                    <div className="flex items-center justify-center min-h-[200px]">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                    </div>
                ) : (
                    <div className="p-6 space-y-10">

                        {!landingPage && (
                            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-blue-700">
                                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                                <p>No landing page configured yet. Fill in the details below and save to create your public event page.</p>
                            </div>
                        )}

                        {landingPage && landingPageUrl && (
                            <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Link2 className="w-5 h-5 text-brand-500 shrink-0" />
                                    <span className="text-sm font-medium text-gray-700 truncate">{landingPageUrl}</span>
                                </div>
                                <a href={landingPageUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:border-brand-300 hover:text-brand-600 transition-all shrink-0 shadow-sm">
                                    <ExternalLink className="w-4 h-4" />
                                    Preview
                                </a>
                            </div>
                        )}

                        {/* ── Slug ── */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Event Slug <span className="text-red-500">*</span></label>
                            <p className="text-xs text-gray-400">Use lowercase letters, numbers, and hyphens only.</p>
                            <div className="flex items-center rounded-2xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent transition-all">
                                <span className="px-4 py-3 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 whitespace-nowrap font-medium">
                                    eventsphere.vercel.app/explore/
                                </span>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    placeholder="my-awesome-event"
                                    className="flex-1 px-4 py-3 text-sm text-gray-900 bg-white outline-none placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        {/* ── Organizer Info ── */}
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-700">Organizer Info</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-500">Display Name <span className="text-red-500">*</span></label>
                                    <input type="text" value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} placeholder="e.g. KIET Events Team" className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder:text-gray-400" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-500 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</label>
                                    <input type="email" value={organizerEmail} onChange={(e) => setOrganizerEmail(e.target.value)} placeholder="contact@kiet.edu.pk" className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder:text-gray-400" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone</label>
                                    <input type="tel" value={organizerPhone} onChange={(e) => setOrganizerPhone(e.target.value)} placeholder="+92 300 1234567" className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder:text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* ── Template Selector ── */}
                        <div className="space-y-3">
                            <label className="flex text-sm font-semibold text-gray-700 items-center gap-2">
                                <LayoutTemplate className="w-4 h-4 text-gray-400" /> Page Template
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {TEMPLATE_OPTIONS.map((opt) => (
                                    <button key={opt.value} type="button" onClick={() => setTemplateName(opt.value)}
                                        className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${templateName === opt.value ? 'border-brand-500 bg-brand-50/50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`font-bold text-sm ${templateName === opt.value ? 'text-brand-700' : 'text-gray-800'}`}>{opt.label}</span>
                                            {templateName === opt.value && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                                        </div>
                                        <p className="text-xs text-gray-500 leading-relaxed">{opt.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Font Selector ── */}
                        <div className="space-y-3">
                            <label className="flex text-sm font-semibold text-gray-700 items-center gap-2">
                                <Type className="w-4 h-4 text-gray-400" /> Font Style
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {FONT_OPTIONS.map((opt) => (
                                    <button key={opt.value} type="button" onClick={() => setFontStyle(opt.value)}
                                        className={`p-3 rounded-2xl border-2 text-left transition-all duration-200 ${fontStyle === opt.value ? 'border-brand-500 bg-brand-50/50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                                        <span className={`block font-bold text-sm mb-0.5 ${fontStyle === opt.value ? 'text-brand-700' : 'text-gray-800'}`}>{opt.label}</span>
                                        <span className="text-xs text-gray-400">{opt.preview}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Colors ── */}
                        <div className="space-y-3">
                            <label className="flex text-sm font-semibold text-gray-700 items-center gap-2">
                                <Palette className="w-4 h-4 text-gray-400" /> Brand Colors
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { label: 'Primary Color', value: primaryColor, onChange: setPrimaryColor },
                                    { label: 'Secondary Color', value: secondaryColor, onChange: setSecondaryColor },
                                    { label: 'Background Color', value: backgroundColor, onChange: setBackgroundColor },
                                ].map((c) => (
                                    <div key={c.label} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 bg-gray-50/50">
                                        <div className="relative shrink-0">
                                            <div className="w-12 h-12 rounded-xl border-2 border-white shadow-md cursor-pointer" style={{ backgroundColor: c.value }} />
                                            <input type="color" value={c.value} onChange={(e) => c.onChange(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-xl" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700">{c.label}</p>
                                            <p className="text-xs text-gray-400 font-mono mt-0.5">{c.value.toUpperCase()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="h-3 rounded-full w-full shadow-inner" style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }} />
                        </div>

                        {/* ── Tabs Configuration ── */}
                        <div className="space-y-3">
                            <label className="flex text-sm font-semibold text-gray-700 items-center gap-2">
                                <PanelsTopLeft className="w-4 h-4 text-gray-400" /> Page Tabs
                            </label>
                            <p className="text-xs text-gray-400">Select which tabs appear on your public landing page. Overview is always shown.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {TAB_OPTIONS.map((tab) => {
                                    const isEnabled = enabledTabs.includes(tab.value);
                                    const isLocked = tab.value === 'overview';
                                    return (
                                        <button
                                            key={tab.value}
                                            type="button"
                                            onClick={() => handleTabToggle(tab.value)}
                                            disabled={isLocked}
                                            className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${isEnabled
                                                ? 'border-brand-500 bg-brand-50/50'
                                                : 'border-gray-200 bg-white'
                                                } ${isLocked
                                                    ? 'opacity-70 cursor-not-allowed'
                                                    : 'hover:border-gray-300 cursor-pointer'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`font-bold text-sm ${isEnabled ? 'text-brand-700' : 'text-gray-800'}`}>
                                                    {tab.label}
                                                </span>
                                                {isEnabled && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                                                {isLocked && <span className="text-xs text-gray-400 font-medium">Always on</span>}
                                            </div>
                                            <p className="text-xs text-gray-500">{tab.description}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Social Links ── */}
                        <div className="space-y-3">
                            <label className="flex text-sm font-semibold text-gray-700 items-center gap-2">
                                <Globe2 className="w-4 h-4 text-gray-400" /> Social Links
                            </label>
                            <p className="text-xs text-gray-400">These appear on the Social tab of your landing page.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {SOCIAL_FIELDS.map((field) => (
                                    <div key={field.key} className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50/50 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent transition-all">
                                        <span className="text-gray-400 shrink-0">{field.icon}</span>
                                        <input
                                            type="url"
                                            value={socialLinks[field.key] || ''}
                                            onChange={(e) => handleSocialLinkChange(field.key, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-2">
                            <button onClick={handleSaveConfig} disabled={isSavingConfig}
                                className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl font-semibold text-sm hover:bg-brand-700 transition-all shadow-md shadow-brand-200 disabled:opacity-60 disabled:cursor-not-allowed">
                                {isSavingConfig
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                    : <><CheckCircle2 className="w-4 h-4" /> Save Configuration</>
                                }
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}