'use client';

import React, { useState, useEffect } from 'react';
import { EventTemplateData, TabName } from '@/types/template.types';
import {
  Calendar, MapPin, Clock, Ticket, Users, Mail, Phone,
  Globe, MessageCircle, Share2, ChevronRight, ExternalLink, Zap,
} from 'lucide-react';
import {
  FaFacebook, FaInstagram, FaLinkedin, FaXTwitter,
} from 'react-icons/fa6';

interface Template1Props {
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
  overview: 'Overview', schedule: 'Schedule', tickets: 'Tickets',
  location: 'Location', contact: 'Contact', social: 'Social',
};

export default function Template1({ data }: Template1Props) {
  const enabledTabs = data.enabledTabs?.length
    ? data.enabledTabs
    : (['overview', 'schedule', 'tickets', 'location', 'contact', 'social'] as TabName[]);
  const [activeTab, setActiveTab] = useState<TabName>('overview');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const fontFamily = FONT_MAP[data.fontStyle || 'syne'];
  const fontLink = FONT_LINKS[data.fontStyle || 'syne'];
  const accent = data.primaryColor || '#00fff7';
  const accent2 = data.secondaryColor || '#ff00c8';
  const bgColor = data.backgroundColor || '#030712';

  const fmt = (dt: string) =>
    new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(dt));
  const fmtTime = (dt: string) =>
    new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(dt));

  const availTickets = data.tickets.filter(t => !t.soldOut);
  const startPrice = availTickets.length > 0 ? Math.min(...availTickets.map(t => t.price)) : null;
  const locationDisplay = `${data.venueName}, ${data.formattedAddress}`;
  const mapQuery = encodeURIComponent(locationDisplay);
  const socialEntries = Object.entries(data.socialLinks || {}).filter(([, v]) => v);

  const now = new Date();
  const eventMs = new Date(data.startDatetime).getTime() - now.getTime();
  const diffDays = Math.max(0, Math.floor(eventMs / 86400000));
  const diffHours = Math.max(0, Math.floor((eventMs % 86400000) / 3600000));
  const diffMins = Math.max(0, Math.floor((eventMs % 3600000) / 60000));
  const diffSecs = Math.max(0, Math.floor((eventMs % 60000) / 1000));
  const isUpcoming = eventMs > 0;

  const SOCIAL_ICONS: Record<string, React.ReactNode> = {
    facebook: <FaFacebook className="w-5 h-5" />, instagram: <FaInstagram className="w-5 h-5" />,
    twitter: <FaXTwitter className="w-5 h-5" />, linkedin: <FaLinkedin className="w-5 h-5" />,
    whatsapp: <MessageCircle className="w-5 h-5" />, website: <Globe className="w-5 h-5" />,
  };
  const SOCIAL_LABELS: Record<string, string> = {
    facebook: 'Facebook', instagram: 'Instagram', twitter: 'Twitter / X',
    linkedin: 'LinkedIn', whatsapp: 'WhatsApp', website: 'Website',
  };

  const scanStyle = {
    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)`,
  };

  const glowBox = (color: string) => ({
    border: `1px solid ${color}30`,
    boxShadow: `0 0 20px ${color}15, inset 0 0 20px ${color}05`,
  });

  return (
    <div
      style={{ fontFamily, background: bgColor }}
      className="min-h-screen text-slate-100 pb-24 sm:pb-0 overflow-x-hidden"
    >
      {fontLink && <link rel="stylesheet" href={fontLink} />}

      {/* Animated grid background */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: `
          linear-gradient(${accent}08 1px, transparent 1px),
          linear-gradient(90deg, ${accent}08 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Hero */}
      <div className="relative min-h-screen flex flex-col justify-end overflow-hidden">
        {/* BG image */}
        <div className="absolute inset-0">
          {/* Background Image */}
          <img
            src={data.imageUrl}
            alt={data.title}
            className="w-full h-full object-contain sm:object-cover object-center opacity-45 scale-105"
          />

          {/* Soft glow overlays */}
          <div
            className="absolute inset-0"
            style={{
              background: `
        radial-gradient(circle at top left, ${accent}22 0%, transparent 35%),
        radial-gradient(circle at bottom right, ${accent2}20 0%, transparent 35%)
      `,
            }}
          />

          {/* Dark readable overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `
        linear-gradient(
          to bottom,
          rgba(3, 7, 18, 0.45) 0%,
          rgba(3, 7, 18, 0.55) 45%,
          rgba(3, 7, 18, 0.92) 100%
        )
      `,
            }}
          />

          {/* Scan effect */}
          <div
            style={scanStyle}
            className="absolute inset-0 opacity-20 pointer-events-none"
          />
        </div>

        {/* Corner brackets */}
        {/* <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: accent }} />
        <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: accent }} />
        <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: accent2 }} />
        <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: accent2 }} /> */}

        {/* Status bar */}
        {/* <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2 border text-xs font-mono uppercase tracking-widest"
          style={{ borderColor: `${accent}40`, color: accent, background: `${accent}08` }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
          Live Event
        </div> */}

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pb-16 w-full">
          <div className="flex flex-wrap gap-2 mb-8">
            {data.tags.map((tag, i) => (
              <span key={i} className="px-3 py-1 text-xs font-mono uppercase tracking-widest border"
                style={{ color: i % 2 === 0 ? accent : accent2, borderColor: i % 2 === 0 ? `${accent}50` : `${accent2}50`, background: i % 2 === 0 ? `${accent}0a` : `${accent2}0a` }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Glitchy title */}
          <h1 className="text-5xl sm:text-7xl lg:text-[6rem] font-black uppercase leading-[0.9] tracking-tighter mb-6 relative">
            <span className="relative inline-block text-white" style={{ textShadow: `2px 0 0 ${accent}60, -2px 0 0 ${accent2}60` }}>
              {data.title}
            </span>
          </h1>

          <div className="flex flex-wrap items-center gap-6 mb-8">
            <p className="text-slate-400 text-sm font-mono uppercase tracking-widest">
              <span style={{ color: accent }}>//</span> {data.organizerName}
            </p>
            <div className="h-px flex-1 max-w-32" style={{ background: `linear-gradient(to right, ${accent}80, transparent)` }} />
            <p className="text-slate-400 text-sm font-mono">
              <span style={{ color: accent2 }}>&gt;</span> {fmt(data.startDatetime)}
            </p>
          </div>

          {/* Countdown */}
          {isUpcoming && (
            <div className="flex flex-wrap gap-4">
              {[{ v: diffDays, l: 'DAYS' }, { v: diffHours, l: 'HRS' }, { v: diffMins, l: 'MIN' }, { v: diffSecs, l: 'SEC' }].map(({ v, l }) => (
                <div key={l} className="text-center min-w-[70px] border py-3 px-4" style={{ borderColor: `${accent}30`, background: `${accent}05` }}>
                  <span className="block text-3xl sm:text-4xl font-black font-mono tabular-nums" style={{ color: accent }}>
                    {String(v).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 tracking-widest">{l}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main body */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left — Tabs */}
          <div className="lg:col-span-8 space-y-8">

            {/* Quick info strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: <Calendar className="w-4 h-4" />, label: 'DATE & TIME', val: `${fmt(data.startDatetime)} · ${fmtTime(data.startDatetime)} — ${fmtTime(data.endDatetime)}`, color: accent },
                { icon: <MapPin className="w-4 h-4" />, label: 'LOCATION', val: locationDisplay, color: accent2 },
              ].map(({ icon, label, val, color }) => (
                <div key={label} className="p-5 flex gap-4 items-start" style={glowBox(color)}>
                  <div className="p-2 border shrink-0" style={{ borderColor: `${color}40`, color, background: `${color}10` }}>{icon}</div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color }}>{label}</p>
                    <p className="text-sm text-slate-300 leading-snug">{val}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tab nav */}
            <div className="flex gap-0 border overflow-x-auto no-scrollbar" style={{ borderColor: `${accent}20` }}>
              {enabledTabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="flex-1 min-w-fit px-4 py-3 text-xs font-mono uppercase tracking-widest transition-all duration-200 whitespace-nowrap border-r last:border-r-0"
                  style={{
                    borderColor: `${accent}20`,
                    background: activeTab === tab ? `${accent}15` : 'transparent',
                    color: activeTab === tab ? accent : '#64748b',
                    boxShadow: activeTab === tab ? `inset 0 -2px 0 ${accent}` : 'none',
                  }}>
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>

            {/* Tab content panels */}
            <div className="min-h-[300px]">

              {activeTab === 'overview' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h2 className="text-xs font-mono uppercase tracking-widest mb-6" style={{ color: accent }}>
                    <span style={{ color: accent2 }}>//</span> About This Event
                  </h2>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-base" style={{ fontFamily }}>
                    {data.description}
                  </p>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <h2 className="text-xs font-mono uppercase tracking-widest mb-6" style={{ color: accent }}>
                    <span style={{ color: accent2 }}>//</span> Schedule
                  </h2>
                  {data.agenda.length === 0 ? (
                    <p className="text-slate-500 font-mono text-sm">[ NO_SCHEDULE_DEFINED ]</p>
                  ) : data.agenda.map((item, idx) => (
                    <div key={item.id} className="flex gap-4 p-5 transition-all hover:translate-x-1" style={glowBox(idx % 2 === 0 ? accent : accent2)}>
                      <div className="shrink-0 w-8 h-8 border flex items-center justify-center text-xs font-mono font-bold"
                        style={{ borderColor: accent, color: accent, background: `${accent}10` }}>{idx + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-3 mb-1.5">
                          <span className="text-[10px] font-mono px-2 py-0.5 border" style={{ color: accent, borderColor: `${accent}40`, background: `${accent}08` }}>
                            <Clock className="w-3 h-3 inline mr-1" />
                            {fmtTime(item.startTime)} — {fmtTime(item.endTime)}
                          </span>
                          {item.roomOrLocation && (
                            <span className="text-[10px] font-mono text-slate-500">
                              <MapPin className="w-3 h-3 inline mr-1" />{item.roomOrLocation}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-white text-sm uppercase tracking-wide">{item.title}</h4>
                        {item.description && <p className="text-slate-400 text-xs mt-1 leading-relaxed">{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'tickets' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <h2 className="text-xs font-mono uppercase tracking-widest mb-6" style={{ color: accent }}>
                    <span style={{ color: accent2 }}>//</span> Ticket Tiers
                  </h2>
                  {data.tickets.length === 0 ? (
                    <p className="text-slate-500 font-mono text-sm">[ NO_TICKETS_DEFINED ]</p>
                  ) : data.tickets.map((ticket, idx) => (
                    <div key={ticket.id} className={`flex items-center justify-between p-5 transition-all ${ticket.soldOut ? 'opacity-40' : 'hover:translate-x-1'}`}
                      style={glowBox(idx % 2 === 0 ? accent : accent2)}>
                      <div className="flex items-center gap-4">
                        <div className="p-2 border" style={{ borderColor: `${accent}40`, color: accent, background: `${accent}10` }}>
                          <Ticket className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm uppercase tracking-wide">{ticket.tierName}</p>
                          {ticket.soldOut && <span className="text-xs font-mono text-red-400">SOLD_OUT</span>}
                        </div>
                      </div>
                      <p className="text-2xl font-black font-mono" style={{ color: ticket.soldOut ? '#ef4444' : accent }}>
                        {ticket.soldOut ? '—' : `Rs.${ticket.price.toLocaleString()}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'location' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h2 className="text-xs font-mono uppercase tracking-widest mb-6" style={{ color: accent }}>
                    <span style={{ color: accent2 }}>//</span> Location
                  </h2>
                  <div className="overflow-hidden border" style={{ borderColor: `${accent}30` }}>
                    <iframe src={`https://maps.google.com/maps?q=${mapQuery}&output=embed&z=15`}
                      width="100%" height="360" style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) saturate(0.8)' }}
                      allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Event Location" />
                  </div>
                  <div className="flex items-start gap-3 p-4 border" style={{ borderColor: `${accent}30`, background: `${accent}05` }}>
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accent }} />
                    <div>
                      <p className="text-white font-semibold text-sm">{locationDisplay}</p>
                      <a href={`https://maps.google.com/maps?q=${mapQuery}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-mono mt-1 inline-flex items-center gap-1 hover:underline" style={{ color: accent }}>
                        OPEN_IN_MAPS <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <h2 className="text-xs font-mono uppercase tracking-widest mb-6" style={{ color: accent }}>
                    <span style={{ color: accent2 }}>//</span> Contact
                  </h2>
                  {[
                    { icon: <Users className="w-4 h-4" />, label: 'ORGANIZER', value: data.organizerName },
                    { icon: <Mail className="w-4 h-4" />, label: 'EMAIL', value: data.organizerEmail, href: data.organizerEmail ? `mailto:${data.organizerEmail}` : undefined },
                    { icon: <Phone className="w-4 h-4" />, label: 'PHONE', value: data.organizerPhone, href: data.organizerPhone ? `tel:${data.organizerPhone}` : undefined },
                  ].filter(c => c.value).map((c) => (
                    <div key={c.label} className="flex items-center gap-4 p-4 border" style={{ borderColor: `${accent}25`, background: `${accent}05` }}>
                      <div className="p-2 border shrink-0" style={{ borderColor: `${accent}40`, color: accent, background: `${accent}10` }}>{c.icon}</div>
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: accent }}>{c.label}</p>
                        {c.href
                          ? <a href={c.href} className="text-sm font-semibold hover:underline" style={{ color: accent2 }}>{c.value}</a>
                          : <p className="text-sm font-semibold text-white">{c.value}</p>}
                      </div>
                    </div>
                  ))}
                  {!data.organizerEmail && !data.organizerPhone && (
                    <p className="text-slate-500 font-mono text-sm">[ NO_CONTACT_INFO ]</p>
                  )}
                </div>
              )}

              {activeTab === 'social' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-xs font-mono uppercase tracking-widest mb-6" style={{ color: accent }}>
                    <span style={{ color: accent2 }}>//</span> Social & Share
                  </h2>
                  {socialEntries.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {socialEntries.map(([key, url]) => (
                        <a key={key} href={url as string} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 border transition-all hover:translate-x-1 group"
                          style={{ borderColor: `${accent}30`, background: `${accent}05` }}>
                          <div className="p-2 border" style={{ borderColor: `${accent}40`, color: accent, background: `${accent}10` }}>{SOCIAL_ICONS[key]}</div>
                          <span className="text-sm font-mono text-slate-300">{SOCIAL_LABELS[key]}</span>
                          <ChevronRight className="w-3 h-3 text-slate-600 ml-auto group-hover:translate-x-1 transition-transform" style={{ color: accent }} />
                        </a>
                      ))}
                    </div>
                  )}
                  <div className="p-5 border" style={{ borderColor: `${accent2}30`, background: `${accent2}05` }}>
                    <div className="flex items-center gap-3 mb-3">
                      <Share2 className="w-4 h-4" style={{ color: accent2 }} />
                      <p className="font-mono text-xs uppercase tracking-widest text-white">Share This Event</p>
                    </div>
                    <p className="text-slate-500 text-xs break-all font-mono">{typeof window !== 'undefined' ? window.location.href : ''}</p>
                    <button onClick={() => navigator.clipboard?.writeText(window.location.href)}
                      className="mt-3 text-xs font-mono px-4 py-2 border uppercase tracking-widest transition-all hover:bg-white hover:text-black"
                      style={{ borderColor: accent2, color: accent2 }}>
                      COPY_LINK
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right — Ticket widget */}
          <div className="lg:col-span-4">
            <div className="sticky top-8 p-8 border hidden sm:block space-y-6" style={{ ...glowBox(accent), background: '#030712' }}>
              {/* Corner accents */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t border-l" style={{ borderColor: accent }} />
              <div className="absolute top-3 right-3 w-4 h-4 border-t border-r" style={{ borderColor: accent }} />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l" style={{ borderColor: accent2 }} />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r" style={{ borderColor: accent2 }} />

              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: accent }}>
                  <Zap className="w-3 h-3 inline mr-1" />Access Pass
                </p>
                <p className="text-3xl font-black text-white">
                  {startPrice !== null ? `Rs. ${startPrice.toLocaleString()}` : 'TBA'}
                </p>
                <p className="text-slate-500 text-xs font-mono mt-1">starting price</p>
              </div>

              <div className="border-t border-dashed" style={{ borderColor: `${accent}20` }} />

              {data.tickets.length > 0 && (
                <div className="space-y-2">
                  {data.tickets.slice(0, 4).map((t, i) => (
                    <div key={t.id} className="flex items-center justify-between px-3 py-2.5 border"
                      style={{ borderColor: `${i % 2 === 0 ? accent : accent2}25`, background: `${i % 2 === 0 ? accent : accent2}05` }}>
                      <span className="text-xs font-mono text-slate-300">{t.tierName}</span>
                      <span className="text-xs font-mono font-bold" style={{ color: t.soldOut ? '#ef4444' : accent }}>
                        {t.soldOut ? 'SOLD_OUT' : `Rs.${t.price.toLocaleString()}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button className="w-full py-4 text-black font-black text-sm uppercase tracking-widest transition-all hover:opacity-90 hover:-translate-y-0.5 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent2})` }}>
                <span className="relative z-10">Get Access</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-slate-600 text-[10px] font-mono uppercase tracking-widest">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                JazzCash · EasyPaisa
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile footer */}
      <div className="fixed bottom-0 left-0 w-full border-t sm:hidden flex items-center justify-between p-5 z-50"
        style={{ background: '#030712', borderColor: `${accent}30`, boxShadow: `0 -10px 40px ${accent}10` }}>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: accent }}>Price</p>
          <p className="text-2xl font-black font-mono text-white">
            {startPrice !== null ? `Rs.${startPrice.toLocaleString()}` : 'TBA'}
          </p>
        </div>
        <button className="font-black py-3.5 px-8 text-black text-sm uppercase tracking-widest"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent2})` }}>
          Get Access
        </button>
      </div>
    </div>
  );
}