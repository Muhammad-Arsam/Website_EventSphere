'use client';

import React, { useState } from 'react';
import { EventTemplateData, TabName } from '@/types/template.types';
import {
  Calendar, MapPin, Clock, Ticket, Users, Mail, Phone,
  Globe, MessageCircle, Share2, ChevronRight, ExternalLink, ArrowUpRight,
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter } from 'react-icons/fa6';

interface Template2Props { data: EventTemplateData; }

const FONT_MAP: Record<string, string> = {
  'dm-sans': "'DM Sans', sans-serif",
  'playfair': "'Playfair Display', serif",
  'space-grotesk': "'Space Grotesk', sans-serif",
  'cabinet-grotesk': "'Cabinet Grotesk', sans-serif",
  'syne': "'Syne', sans-serif",
};
const FONT_LINKS: Record<string, string> = {
  'dm-sans': 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap',
  'playfair': 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&display=swap',
  'space-grotesk': 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap',
  'cabinet-grotesk': 'https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&display=swap',
  'syne': 'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap',
};
const TAB_META: Record<TabName, { label: string; number: string }> = {
  overview:  { label: 'Overview',  number: '01' },
  schedule:  { label: 'Schedule',  number: '02' },
  tickets:   { label: 'Tickets',   number: '03' },
  location:  { label: 'Location',  number: '04' },
  contact:   { label: 'Contact',   number: '05' },
  social:    { label: 'Social',    number: '06' },
};

export default function Template2({ data }: Template2Props) {
  const enabledTabs = (data.enabledTabs?.length ? data.enabledTabs : ['overview','schedule','tickets','location','contact','social']) as TabName[];
  const [activeTab, setActiveTab] = useState<TabName>('overview');

  const fontFamily = FONT_MAP[data.fontStyle || 'playfair'];
  const fontLink   = FONT_LINKS[data.fontStyle || 'playfair'];
  const primary    = data.primaryColor   || '#1a1a2e';
  const accent     = data.secondaryColor || '#e63946';
  const bg         = data.backgroundColor || '#f7f3ee';

  const fmt     = (dt: string) => new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(dt));
  const fmtTime = (dt: string) => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(dt));
  const fmtShort = (dt: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(dt));

  const avail        = data.tickets.filter(t => !t.soldOut);
  const startPrice   = avail.length > 0 ? Math.min(...avail.map(t => t.price)) : null;
  const locationStr  = `${data.venueName}, ${data.formattedAddress}`;
  const mapQ         = encodeURIComponent(locationStr);
  const socialItems  = Object.entries(data.socialLinks || {}).filter(([, v]) => v);

  const eventMs  = new Date(data.startDatetime).getTime() - Date.now();
  const diffDays = Math.max(0, Math.floor(eventMs / 86400000));
  const diffHrs  = Math.max(0, Math.floor((eventMs % 86400000) / 3600000));
  const diffMin  = Math.max(0, Math.floor((eventMs % 3600000) / 60000));
  const upcoming = eventMs > 0;

  const SOCIAL_ICONS: Record<string, React.ReactNode> = {
    facebook: <FaFacebook />, instagram: <FaInstagram />, twitter: <FaXTwitter />,
    linkedin: <FaLinkedin />, whatsapp: <MessageCircle className="w-4 h-4" />, website: <Globe className="w-4 h-4" />,
  };
  const SOCIAL_LABELS: Record<string, string> = {
    facebook: 'Facebook', instagram: 'Instagram', twitter: 'Twitter / X',
    linkedin: 'LinkedIn', whatsapp: 'WhatsApp', website: 'Website',
  };

  return (
    <div style={{ fontFamily, background: bg }} className="min-h-screen text-stone-900 selection:bg-yellow-200 selection:text-stone-900">
      {fontLink && <link rel="stylesheet" href={fontLink} />}

      {/* ── MASTHEAD ── */}
      {/* <header style={{ borderBottom: `3px solid ${primary}` }} className="sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="max-w-screen-xl mx-auto px-6 sm:px-10 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: accent }} />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Event</span>
            <span className="w-px h-4 bg-stone-300" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>Live</span>
          </div>
          <p className="text-xs text-stone-400 font-medium hidden sm:block">{fmtShort(data.startDatetime)}</p>
          <div className="flex gap-4">
            {data.tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="hidden md:block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5"
                style={{ color: i === 0 ? accent : primary, border: `1px solid ${i === 0 ? accent : primary}30` }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header> */}

      {/* ── COVER ── Full-bleed editorial split */}
      <section className="max-w-screen-xl mx-auto px-0 sm:px-10 pt-0 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[85vh]">

          {/* Left — text column */}
          <div className="flex flex-col justify-between p-8 sm:p-12 lg:pr-16 order-2 lg:order-1">
            <div>
              {/* Issue-style label */}
              <div className="flex items-center gap-3 mb-10">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400">Presented by</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: primary }}>{data.organizerName}</span>
              </div>

              {/* Title — editorial oversized */}
              <h1 className="text-[clamp(3rem,8vw,7rem)] font-black uppercase leading-[0.88] tracking-tighter mb-8 text-stone-950">
                {data.title}
              </h1>

              {/* Ruled divider with accent */}
              <div className="flex items-center gap-4 mb-8">
                <div className="h-0.5 w-16" style={{ background: accent }} />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
                  {fmt(data.startDatetime)}
                </span>
                <div className="h-0.5 flex-1" style={{ background: `${primary}15` }} />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-10">
                {data.tags.map((tag, i) => (
                  <span key={i} className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
                    style={{
                      background: i === 0 ? primary : 'transparent',
                      color: i === 0 ? '#fff' : primary,
                      border: `1.5px solid ${primary}`,
                    }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Countdown block */}
            {upcoming && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4">Starts in</p>
                <div className="flex gap-0 divide-x" style={{ borderColor: `${primary}20`, border: `1px solid ${primary}15` }}>
                  {[{ v: diffDays, l: 'Days' }, { v: diffHrs, l: 'Hrs' }, { v: diffMin, l: 'Min' }].map(({ v, l }) => (
                    <div key={l} className="flex-1 py-5 text-center">
                      <span className="block text-4xl sm:text-5xl font-black tabular-nums" style={{ color: primary }}>
                        {String(v).padStart(2, '0')}
                      </span>
                      <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 mt-1">{l}</span>
                    </div>
                  ))}
                  <div className="flex-1 py-5 flex flex-col items-center justify-center gap-2" style={{ background: primary }}>
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">From</span>
                    <span className="text-2xl font-black text-white">
                      {startPrice !== null ? `Rs.${startPrice.toLocaleString()}` : 'TBA'}
                    </span>
                    <button className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 transition-opacity hover:opacity-80"
                      style={{ background: accent, color: '#fff' }}>
                      Get Tickets
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right — image column */}
          <div className="relative order-1 lg:order-2 overflow-hidden min-h-[50vh] lg:min-h-full">
            <img
              src={data.imageUrl}
              alt={data.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Ink-wash overlay at bottom */}
            <div className="absolute inset-0"
              style={{ background: `linear-gradient(to top, ${primary}cc 0%, ${primary}40 40%, transparent 70%)` }} />
            {/* Venue badge pinned to bottom */}
            <div className="absolute bottom-6 left-6 right-6 p-4" style={{ background: `${primary}e8`, backdropFilter: 'blur(8px)' }}>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-white/60" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-0.5">Venue</p>
                  <p className="text-sm font-bold text-white leading-snug">{locationStr}</p>
                </div>
                <div className="ml-auto shrink-0 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-0.5">Time</p>
                  <p className="text-sm font-bold text-white">{fmtTime(data.startDatetime)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BODY ── Sidebar nav + content */}
      <section className="max-w-screen-xl mx-auto px-6 sm:px-10 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12 lg:gap-20">

          {/* Sidebar — vertical numbered nav */}
          <nav className="lg:sticky lg:top-20 lg:self-start">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-400 mb-6 pl-5">Contents</p>
            <ul className="space-y-1">
              {enabledTabs.map((tab) => {
                const { label, number } = TAB_META[tab];
                const isActive = activeTab === tab;
                return (
                  <li key={tab}>
                    <button
                      onClick={() => setActiveTab(tab)}
                      className="w-full flex items-center gap-4 px-5 py-3.5 text-left transition-all duration-150 group relative"
                      style={{
                        borderLeft: isActive ? `3px solid ${accent}` : '3px solid transparent',
                        background: isActive ? `${primary}08` : 'transparent',
                      }}>
                      <span className="text-[10px] font-black tabular-nums transition-colors"
                        style={{ color: isActive ? accent : '#a8a29e' }}>
                        {number}
                      </span>
                      <span className="text-sm font-bold transition-colors"
                        style={{ color: isActive ? primary : '#78716c' }}>
                        {label}
                      </span>
                      {isActive && (
                        <ChevronRight className="w-3.5 h-3.5 ml-auto" style={{ color: accent }} />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Sidebar ticket widget */}
            <div className="mt-10 hidden lg:block" style={{ border: `2px solid ${primary}` }}>
              <div className="p-5" style={{ background: primary }}>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/60 mb-1">Tickets from</p>
                <p className="text-3xl font-black text-white">
                  {startPrice !== null ? `Rs.${startPrice.toLocaleString()}` : 'TBA'}
                </p>
              </div>
              {data.tickets.slice(0, 3).map((t, i) => (
                <div key={t.id} className="flex justify-between items-center px-4 py-3"
                  style={{ borderTop: `1px solid ${primary}15`, background: i % 2 === 0 ? `${primary}05` : 'white' }}>
                  <span className="text-xs font-bold text-stone-600">{t.tierName}</span>
                  <span className="text-xs font-black" style={{ color: t.soldOut ? '#ef4444' : primary }}>
                    {t.soldOut ? 'Sold out' : `Rs.${t.price.toLocaleString()}`}
                  </span>
                </div>
              ))}
              <div className="p-4">
                <button className="w-full py-3 text-sm font-black uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-90"
                  style={{ background: accent }}>
                  Buy Now <ArrowUpRight className="w-4 h-4 inline ml-1" />
                </button>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <div className="min-w-0">

            {/* Section header rule */}
            <div className="flex items-baseline gap-6 mb-12">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
                {TAB_META[activeTab].number}
              </span>
              <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none" style={{ color: primary }}>
                {TAB_META[activeTab].label}
              </h2>
              <div className="flex-1 h-0.5 self-center" style={{ background: `${primary}15` }} />
            </div>

            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <div className="animate-in fade-in duration-300 space-y-10">
                {/* Pull-quote style description */}
                <div className="relative pl-8" style={{ borderLeft: `4px solid ${accent}` }}>
                  <p className="text-xl sm:text-2xl font-medium leading-relaxed text-stone-700 italic">
                    {data.description}
                  </p>
                </div>

                {/* Info cards — newspaper column style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ background: `${primary}15` }}>
                  {[
                    { label: 'Date', icon: <Calendar className="w-4 h-4" />, value: fmt(data.startDatetime) },
                    { label: 'Time', icon: <Clock className="w-4 h-4" />, value: `${fmtTime(data.startDatetime)} — ${fmtTime(data.endDatetime)}` },
                    { label: 'Venue', icon: <MapPin className="w-4 h-4" />, value: data.venueName },
                    { label: 'Organiser', icon: <Users className="w-4 h-4" />, value: data.organizerName },
                  ].map(({ label, icon, value }) => (
                    <div key={label} className="p-6 sm:p-8 flex gap-4 items-start bg-white">
                      <div className="p-2 shrink-0" style={{ background: `${primary}08`, color: primary }}>{icon}</div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-stone-400 mb-1">{label}</p>
                        <p className="font-bold text-stone-900 leading-snug">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SCHEDULE ── */}
            {activeTab === 'schedule' && (
              <div className="animate-in fade-in duration-300 space-y-0">
                {data.agenda.length === 0
                  ? <p className="text-stone-400 italic">No schedule published yet.</p>
                  : data.agenda.map((item, idx) => (
                    <div key={item.id} className="group grid grid-cols-[80px_1fr] gap-6 py-6"
                      style={{ borderBottom: `1px solid ${primary}12` }}>
                      {/* Time column */}
                      <div className="text-right">
                        <span className="text-xs font-black tabular-nums" style={{ color: accent }}>
                          {fmtTime(item.startTime)}
                        </span>
                        <div className="w-full h-px mt-1.5 mb-1" style={{ background: `${primary}20` }} />
                        <span className="text-[10px] text-stone-400">{fmtTime(item.endTime)}</span>
                      </div>
                      {/* Content column */}
                      <div className="flex items-start gap-4">
                        <span className="text-[9px] font-black tabular-nums text-stone-300 mt-0.5 shrink-0 w-6">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <h4 className="font-black text-stone-900 uppercase tracking-tight text-base leading-snug">{item.title}</h4>
                          {item.roomOrLocation && (
                            <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{item.roomOrLocation}
                            </p>
                          )}
                          {item.description && <p className="text-sm text-stone-500 mt-2 leading-relaxed">{item.description}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* ── TICKETS ── */}
            {activeTab === 'tickets' && (
              <div className="animate-in fade-in duration-300 space-y-3">
                {data.tickets.length === 0
                  ? <p className="text-stone-400 italic">No tickets available yet.</p>
                  : data.tickets.map((ticket, idx) => (
                    <div key={ticket.id}
                      className={`grid grid-cols-[1fr_auto] items-center gap-6 p-6 sm:p-8 transition-all ${ticket.soldOut ? 'opacity-50' : 'hover:-translate-y-0.5 cursor-pointer'}`}
                      style={{ border: `1.5px solid ${idx === 0 ? primary : `${primary}25`}`, background: idx === 0 ? `${primary}05` : 'white' }}>
                      <div className="flex items-center gap-5">
                        <div className="text-[9px] font-black tabular-nums text-stone-300 w-5 shrink-0">
                          {String(idx + 1).padStart(2, '0')}
                        </div>
                        <div className="p-2.5" style={{ background: `${primary}08`, color: primary }}>
                          <Ticket className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black uppercase tracking-tight text-stone-900">{ticket.tierName}</p>
                          {ticket.soldOut && <p className="text-xs font-bold text-red-500 mt-0.5">Sold Out</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black tabular-nums"
                          style={{ color: ticket.soldOut ? '#ef4444' : primary }}>
                          {ticket.soldOut ? '—' : `Rs.${ticket.price.toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                  ))}
                <div className="pt-4">
                  <button className="flex items-center gap-2 px-8 py-4 font-black uppercase tracking-[0.15em] text-sm text-white transition-opacity hover:opacity-90"
                    style={{ background: primary }}>
                    Register Now <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-stone-400 mt-3">Supports JazzCash · EasyPaisa</p>
                </div>
              </div>
            )}

            {/* ── LOCATION ── */}
            {activeTab === 'location' && (
              <div className="animate-in fade-in duration-300 space-y-6">
                <div className="overflow-hidden" style={{ border: `2px solid ${primary}` }}>
                  <iframe
                    src={`https://maps.google.com/maps?q=${mapQ}&output=embed&z=15`}
                    width="100%" height="420" style={{ border: 0, display: 'block' }}
                    allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                    title="Event Location"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ background: `${primary}15` }}>
                  <div className="bg-white p-6">
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-stone-400 mb-2">Address</p>
                    <p className="font-bold text-stone-900 leading-snug">{locationStr}</p>
                  </div>
                  <div className="bg-white p-6 flex items-end">
                    <a href={`https://maps.google.com/maps?q=${mapQ}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.15em] transition-opacity hover:opacity-70"
                      style={{ color: accent }}>
                      Open Maps <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* ── CONTACT ── */}
            {activeTab === 'contact' && (
              <div className="animate-in fade-in duration-300">
                <div className="space-y-px" style={{ outline: `1.5px solid ${primary}20` }}>
                  {[
                    { icon: <Users className="w-5 h-5" />, label: 'Organiser', value: data.organizerName },
                    { icon: <Mail className="w-5 h-5" />, label: 'Email', value: data.organizerEmail, href: data.organizerEmail ? `mailto:${data.organizerEmail}` : undefined },
                    { icon: <Phone className="w-5 h-5" />, label: 'Phone', value: data.organizerPhone, href: data.organizerPhone ? `tel:${data.organizerPhone}` : undefined },
                  ].filter(c => c.value).map((c, i) => (
                    <div key={c.label}
                      className="grid grid-cols-[160px_1fr] items-center gap-6 p-6 bg-white"
                      style={{ borderBottom: `1px solid ${primary}10` }}>
                      <div className="flex items-center gap-3">
                        <span style={{ color: accent }}>{c.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">{c.label}</span>
                      </div>
                      {c.href
                        ? <a href={c.href} className="font-bold hover:underline" style={{ color: primary }}>{c.value}</a>
                        : <p className="font-bold text-stone-900">{c.value}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SOCIAL ── */}
            {activeTab === 'social' && (
              <div className="animate-in fade-in duration-300 space-y-8">
                {socialItems.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {socialItems.map(([key, url]) => (
                      <a key={key} href={url as string} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between p-5 bg-white group transition-all hover:translate-x-1"
                        style={{ border: `1.5px solid ${primary}20` }}>
                        <div className="flex items-center gap-4">
                          <span className="text-xl" style={{ color: primary }}>{SOCIAL_ICONS[key]}</span>
                          <span className="font-bold text-stone-800">{SOCIAL_LABELS[key]}</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-stone-300 group-hover:text-stone-900 transition-colors" />
                      </a>
                    ))}
                  </div>
                )}
                <div className="p-6 bg-white" style={{ border: `1.5px solid ${primary}20` }}>
                  <div className="flex items-center gap-3 mb-4">
                    <Share2 className="w-4 h-4" style={{ color: accent }} />
                    <p className="font-black text-stone-900 uppercase tracking-tight text-sm">Share This Event</p>
                  </div>
                  <p className="text-stone-400 text-xs break-all font-mono mb-4">{typeof window !== 'undefined' ? window.location.href : ''}</p>
                  <button onClick={() => navigator.clipboard?.writeText(window.location.href)}
                    className="text-xs font-black uppercase tracking-[0.15em] px-5 py-2.5 text-white transition-opacity hover:opacity-80"
                    style={{ background: primary }}>
                    Copy Link
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ── MOBILE FOOTER ── */}
      <div className="fixed bottom-0 left-0 w-full sm:hidden z-50"
        style={{ background: primary, borderTop: `3px solid ${accent}` }}>
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50 mb-0.5">Entry from</p>
            <p className="text-xl font-black text-white">{startPrice !== null ? `Rs.${startPrice.toLocaleString()}` : 'TBA'}</p>
          </div>
          <button className="font-black py-3.5 px-8 text-sm uppercase tracking-[0.15em] transition-opacity hover:opacity-90"
            style={{ background: accent, color: '#fff' }}>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}