'use client';

import React, { useState } from 'react';
import { EventTemplateData, TabName } from '@/types/template.types';
import {
  Calendar, MapPin, Clock, Ticket, Users, Mail, Phone,
  Globe, MessageCircle,
  Share2, ChevronRight, ExternalLink,
} from 'lucide-react';
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaXTwitter,
} from "react-icons/fa6";
interface Template2Props {
  data: EventTemplateData;
}

const FONT_MAP: Record<string, string> = {
  'dm-sans': "'DM Sans', sans-serif",
  'playfair': "'Playfair Display', serif",
  'space-grotesk': "'Space Grotesk', sans-serif",
  'cabinet-grotesk': "'Cabinet Grotesk', sans-serif",
  'syne': "'Syne', sans-serif",
};

const FONT_LINKS: Record<string, string> = {
  'dm-sans': 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap',
  'playfair': 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&display=swap',
  'space-grotesk': 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap',
  'cabinet-grotesk': 'https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&display=swap',
  'syne': 'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap',
};

const TAB_LABELS: Record<TabName, string> = {
  overview: 'Overview',
  schedule: 'Schedule',
  tickets: 'Tickets',
  location: 'Location',
  contact: 'Contact',
  social: 'Social',
};

export default function Template2({ data }: Template2Props) {
  const enabledTabs = data.enabledTabs?.length ? data.enabledTabs : ['overview', 'schedule', 'tickets', 'location', 'contact', 'social'] as TabName[];
  const [activeTab, setActiveTab] = useState<TabName>('overview');

  const fontFamily = FONT_MAP[data.fontStyle || 'playfair'];
  const fontLink = FONT_LINKS[data.fontStyle || 'playfair'];
  const bgColor = data.backgroundColor || '#FAFAFA';

  const formatDate = (dt: string) => new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(dt));
  const formatTime = (dt: string) => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(dt));

  const availableTickets = data.tickets.filter(t => !t.soldOut);
  const startingPrice = availableTickets.length > 0 ? Math.min(...availableTickets.map(t => t.price)) : null;
  const locationDisplay = `${data.venueName}, ${data.formattedAddress}`;
  const mapQuery = encodeURIComponent(locationDisplay);

  const socialEntries = Object.entries(data.socialLinks || {}).filter(([, v]) => v);

  const SOCIAL_ICONS: Record<string, React.ReactNode> = {
    facebook: <FaFacebook className="w-5 h-5" />,
    instagram: <FaInstagram className="w-5 h-5" />,
    twitter: <FaXTwitter className="w-5 h-5" />,
    linkedin: <FaLinkedin className="w-5 h-5" />,
    whatsapp: <MessageCircle className="w-5 h-5" />,
    website: <Globe className="w-5 h-5" />,
  };

  const SOCIAL_LABELS: Record<string, string> = {
    facebook: 'Facebook', instagram: 'Instagram', twitter: 'Twitter / X',
    linkedin: 'LinkedIn', whatsapp: 'WhatsApp', website: 'Website',
  };

  const eventDate = new Date(data.startDatetime);
  const now = new Date();
  const diffMs = eventDate.getTime() - now.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const diffHours = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const diffMins = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));
  const isUpcoming = diffMs > 0;

  return (
    <div style={{ fontFamily, backgroundColor: bgColor }} className="min-h-screen text-slate-800 pb-24 sm:pb-0 selection:bg-amber-100">
      {fontLink && <link rel="stylesheet" href={fontLink} />}

      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 pt-16 sm:pt-24 pb-12 text-center">
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {data.tags.map((tag, idx) => (
            <span key={idx} className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest bg-white border rounded-full shadow-sm"
              style={{ color: data.secondaryColor, borderColor: `${data.secondaryColor}40` }}>
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.15]" style={{ color: data.primaryColor }}>
          {data.title}
        </h1>
        <p className="text-lg text-slate-500 font-medium">
          Hosted by <span className="font-bold border-b-2" style={{ borderColor: data.secondaryColor, color: data.primaryColor }}>{data.organizerName}</span>
        </p>
      </div>

      {/* Hero Image */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 mb-16 sm:mb-24">
        <div className="relative group w-full h-[40vh] sm:h-[50vh] lg:h-[60vh] rounded-4xl sm:rounded-[3rem] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.35)] bg-white">

          {/* Ambient Glow */}
          <div className="absolute -inset-10 opacity-40 blur-3xl pointer-events-none"
            style={{
              background: `
          radial-gradient(circle at top left, ${data.primaryColor}35 0%, transparent 40%),
          radial-gradient(circle at bottom right, ${data.secondaryColor || data.primaryColor}25 0%, transparent 40%)
        `
            }}
          />

          {/* Image */}
          <img
            src={data.imageUrl}
            alt={data.title}
            className="relative z-10 w-full h-full object-contain object-center opacity-95 transition-transform duration-700 group-hover:scale-[1.02]"
          />

          {/* Soft Overlay */}
          <div
            className="absolute inset-0 z-20"
            style={{
              background: `
          linear-gradient(
            to bottom,
            rgba(15, 23, 42, 0.15),
            rgba(15, 23, 42, 0.35)
          )
        `,
            }}
          />

          {/* Border Ring */}
          <div className="absolute inset-0 z-30 ring-1 ring-inset ring-white/10 rounded-4xl sm:rounded-[3rem]" />

          {/* Bottom Glow */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32 z-20"
            style={{
              background: `
          linear-gradient(
            to top,
            rgba(2, 6, 23, 0.65),
            transparent
          )
        `,
            }}
          />
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          {/* Left */}
          <div className="lg:col-span-8 space-y-10">

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { icon: <Calendar className="w-4 h-4" />, label: 'When', primary: formatDate(data.startDatetime), secondary: `${formatTime(data.startDatetime)} — ${formatTime(data.endDatetime)}` },
                { icon: <MapPin className="w-4 h-4" />, label: 'Where', primary: locationDisplay, secondary: null },
              ].map((info) => (
                <div key={info.label} className="flex gap-5 relative group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full transition-all duration-300 group-hover:w-1.5" style={{ backgroundColor: data.secondaryColor }} />
                  <div className="pl-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">{info.icon}{info.label}</h3>
                    <p className="text-xl font-bold" style={{ color: data.primaryColor }}>{info.primary}</p>
                    {info.secondary && <p className="text-slate-500 mt-1 font-medium">{info.secondary}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Countdown */}
            {isUpcoming && (
              <div className="flex gap-8 py-6 border-y border-slate-100">
                {[{ v: diffDays, l: 'Days' }, { v: diffHours, l: 'Hours' }, { v: diffMins, l: 'Mins' }].map(({ v, l }) => (
                  <div key={l} className="text-center">
                    <span className="block text-4xl font-extrabold" style={{ color: data.primaryColor }}>{String(v).padStart(2, '0')}</span>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{l}</span>
                  </div>
                ))}
                <div className="flex items-center ml-auto">
                  <span className="text-sm text-slate-400 font-medium">Until the event</span>
                </div>
              </div>
            )}

            {/* Tab Nav */}
            <div className="flex gap-1 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
              {enabledTabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="flex-1 min-w-fit px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap"
                  style={activeTab === tab ? { backgroundColor: data.primaryColor, color: '#fff' } : { color: '#64748b' }}>
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-3xl font-extrabold mb-6" style={{ color: data.primaryColor }}>Event Overview</h2>
                <p className="leading-relaxed text-slate-600 whitespace-pre-wrap font-medium text-lg">{data.description}</p>
              </div>
            )}

            {/* Tab: Schedule */}
            {activeTab === 'schedule' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h2 className="text-3xl font-extrabold mb-6" style={{ color: data.primaryColor }}>Schedule</h2>
                {data.agenda.length === 0 ? <p className="text-slate-400">No schedule added yet.</p> : (
                  <div className="space-y-4">
                    {data.agenda.map((item, idx) => (
                      <div key={item.id} className="flex gap-5 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="shrink-0">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: data.secondaryColor }}>
                            {idx + 1}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-3 mb-2">
                            <span className="text-xs font-bold px-3 py-1 rounded-full border" style={{ color: data.secondaryColor, borderColor: `${data.secondaryColor}40`, backgroundColor: `${data.secondaryColor}08` }}>
                              <Clock className="w-3 h-3 inline mr-1" />{new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(item.startTime))} — {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(item.endTime))}
                            </span>
                            {item.roomOrLocation && <span className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{item.roomOrLocation}</span>}
                          </div>
                          <h4 className="font-bold text-slate-900 text-base">{item.title}</h4>
                          {item.description && <p className="text-slate-500 text-sm mt-1">{item.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Tickets */}
            {activeTab === 'tickets' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h2 className="text-3xl font-extrabold mb-6" style={{ color: data.primaryColor }}>Tickets</h2>
                {data.tickets.length === 0 ? <p className="text-slate-400">No ticket tiers available yet.</p> : (
                  <div className="space-y-3">
                    {data.tickets.map(ticket => (
                      <div key={ticket.id} className={`flex items-center justify-between p-6 rounded-3xl border transition-all ${ticket.soldOut ? 'border-slate-100 bg-slate-50 opacity-60' : 'border-slate-100 bg-white shadow-sm hover:shadow-md'}`}>
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-2xl" style={{ backgroundColor: `${data.secondaryColor}15`, color: data.secondaryColor }}>
                            <Ticket className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-base">{ticket.tierName}</p>
                            {ticket.soldOut && <span className="text-xs text-red-500 font-semibold">Sold Out</span>}
                          </div>
                        </div>
                        <p className="text-2xl font-extrabold" style={{ color: ticket.soldOut ? '#ef4444' : data.primaryColor }}>
                          {ticket.soldOut ? '—' : `Rs. ${ticket.price.toLocaleString()}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Location */}
            {activeTab === 'location' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h2 className="text-3xl font-extrabold mb-6" style={{ color: data.primaryColor }}>Location</h2>
                <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-lg">
                  <iframe src={`https://maps.google.com/maps?q=${mapQuery}&output=embed&z=15`} width="100%" height="380" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Event Location" />
                </div>
                <div className="flex items-start gap-3 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <MapPin className="w-5 h-5 shrink-0 mt-0.5" style={{ color: data.secondaryColor }} />
                  <div>
                    <p className="font-semibold text-slate-800">{locationDisplay}</p>
                    <a href={`https://maps.google.com/maps?q=${mapQuery}`} target="_blank" rel="noopener noreferrer"
                      className="text-sm font-semibold mt-1 inline-flex items-center gap-1 hover:underline" style={{ color: data.secondaryColor }}>
                      Open in Google Maps <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Contact */}
            {activeTab === 'contact' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h2 className="text-3xl font-extrabold mb-6" style={{ color: data.primaryColor }}>Contact</h2>
                <div className="space-y-3">
                  {[
                    { icon: <Users className="w-5 h-5" />, label: 'Organizer', value: data.organizerName },
                    { icon: <Mail className="w-5 h-5" />, label: 'Email', value: data.organizerEmail, href: data.organizerEmail ? `mailto:${data.organizerEmail}` : undefined },
                    { icon: <Phone className="w-5 h-5" />, label: 'Phone', value: data.organizerPhone, href: data.organizerPhone ? `tel:${data.organizerPhone}` : undefined },
                  ].filter(c => c.value).map(c => (
                    <div key={c.label} className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-3xl shadow-sm">
                      <div className="p-3 rounded-2xl shrink-0" style={{ backgroundColor: `${data.secondaryColor}15`, color: data.secondaryColor }}>{c.icon}</div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{c.label}</p>
                        {c.href ? <a href={c.href} className="font-semibold hover:underline" style={{ color: data.primaryColor }}>{c.value}</a>
                          : <p className="font-semibold text-slate-800">{c.value}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Social */}
            {activeTab === 'social' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-3xl font-extrabold mb-6" style={{ color: data.primaryColor }}>Social & Share</h2>
                {socialEntries.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {socialEntries.map(([key, url]) => (
                      <a key={key} href={url as string} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                        <div className="p-3 rounded-2xl shrink-0" style={{ backgroundColor: `${data.secondaryColor}15`, color: data.secondaryColor }}>{SOCIAL_ICONS[key]}</div>
                        <span className="font-semibold text-slate-800">{SOCIAL_LABELS[key]}</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 ml-auto group-hover:translate-x-1 transition-transform" />
                      </a>
                    ))}
                  </div>
                )}
                <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Share2 className="w-5 h-5" style={{ color: data.secondaryColor }} />
                    <p className="font-bold text-slate-800">Share this event</p>
                  </div>
                  <p className="text-slate-400 text-sm break-all">{typeof window !== 'undefined' ? window.location.href : ''}</p>
                  <button onClick={() => navigator.clipboard?.writeText(window.location.href)}
                    className="mt-3 text-xs font-bold px-4 py-2 rounded-xl text-white transition-all"
                    style={{ backgroundColor: data.primaryColor }}>
                    Copy Link
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Sticky Widget */}
          <div className="lg:col-span-4 relative z-20">
            <div className="bg-white border border-slate-100 rounded-4xl p-8 sm:p-10 sticky top-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] hidden sm:block space-y-6">
              <div>
                <h3 className="text-2xl font-extrabold mb-1" style={{ color: data.primaryColor }}>Reserve Your Seat</h3>
                <p className="text-slate-500 text-sm font-medium">Limited availability.</p>
              </div>
              <div className="pb-6 border-b border-slate-100">
                <span className="block text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Registration</span>
                <span className="text-5xl font-extrabold tracking-tight" style={{ color: data.primaryColor }}>
                  {startingPrice !== null ? `Rs. ${startingPrice.toLocaleString()}` : 'TBA'}
                </span>
                <span className="text-slate-400 font-medium ml-2">/ person</span>
              </div>
              {data.tickets.length > 0 && (
                <div className="space-y-2">
                  {data.tickets.slice(0, 3).map(t => (
                    <div key={t.id} className="flex justify-between items-center px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-sm font-medium text-slate-600">{t.tierName}</span>
                      <span className={`text-sm font-bold ${t.soldOut ? 'text-red-400' : ''}`} style={!t.soldOut ? { color: data.primaryColor } : {}}>
                        {t.soldOut ? 'Sold Out' : `Rs. ${t.price.toLocaleString()}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <button className="w-full text-white text-lg font-bold py-4 px-8 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl"
                style={{ backgroundColor: data.primaryColor }}>
                Register Now
              </button>
              <div className="flex flex-col items-center gap-2 text-slate-400 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Verified Secure Checkout
                </div>
                <span>Supports JazzCash & EasyPaisa</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200 p-5 sm:hidden flex items-center justify-between z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Entry Pass</p>
          <p className="text-2xl font-extrabold" style={{ color: data.primaryColor }}>
            {startingPrice !== null ? `Rs. ${startingPrice.toLocaleString()}` : 'TBA'}
          </p>
        </div>
        <button className="text-white font-bold py-3.5 px-8 rounded-xl shadow-lg" style={{ backgroundColor: data.primaryColor }}>Register</button>
      </div>
    </div>
  );
}