'use client';

import React, { useState, useEffect } from 'react';
import { EventTemplateData, TabName } from '@/types/template.types';
import {
  Calendar, MapPin, Clock, Ticket, Users, Mail, Phone,
  Globe, MessageCircle, Share2, ExternalLink, ArrowRight, Sparkles,
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter } from 'react-icons/fa6';

interface Template3Props { data: EventTemplateData; onCheckout: () => void; }

const FONT_MAP: Record<string, string> = {
  'dm-sans': "'DM Sans', sans-serif",
  'playfair': "'Playfair Display', serif",
  'space-grotesk': "'Space Grotesk', sans-serif",
  'cabinet-grotesk': "'Cabinet Grotesk', sans-serif",
  'syne': "'Syne', sans-serif",
};
const FONT_LINKS: Record<string, string> = {
  'dm-sans': 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap',
  'playfair': 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&display=swap',
  'space-grotesk': 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap',
  'cabinet-grotesk': 'https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&display=swap',
  'syne': 'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap',
};
const TAB_ICONS: Record<TabName, React.ReactNode> = {
  overview: <Sparkles className="w-4 h-4" />,
  schedule: <Clock className="w-4 h-4" />,
  tickets: <Ticket className="w-4 h-4" />,
  location: <MapPin className="w-4 h-4" />,
  contact: <Users className="w-4 h-4" />,
  social: <Share2 className="w-4 h-4" />,
};
const TAB_LABELS: Record<TabName, string> = {
  overview: 'Overview', schedule: 'Schedule', tickets: 'Tickets',
  location: 'Location', contact: 'Contact', social: 'Social',
};

export default function Template3({ data, onCheckout }: Template3Props) {
  const enabledTabs = (data.enabledTabs?.length ? data.enabledTabs : ['overview', 'schedule', 'tickets', 'location', 'contact', 'social']) as TabName[];
  const [activeTab, setActiveTab] = useState<TabName>('overview');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const fontFamily = FONT_MAP[data.fontStyle || 'space-grotesk'];
  const fontLink = FONT_LINKS[data.fontStyle || 'space-grotesk'];
  const primary = data.primaryColor || '#7c3aed';
  const secondary = data.secondaryColor || '#06b6d4';
  const bg = data.backgroundColor || '#0f0f1a';

  const fmt = (dt: string) => new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(dt));
  const fmtTime = (dt: string) => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(dt));

  const avail = data.tickets.filter(t => !t.soldOut);
  const startPrice = avail.length > 0 ? Math.min(...avail.map(t => t.price)) : null;
  const locationStr = `${data.venueName}, ${data.formattedAddress}`;
  const mapQ = encodeURIComponent(locationStr);
  const socialItems = Object.entries(data.socialLinks || {}).filter(([, v]) => v);

  const eventMs = new Date(data.startDatetime).getTime() - Date.now();
  const diffDays = Math.max(0, Math.floor(eventMs / 86400000));
  const diffHrs = Math.max(0, Math.floor((eventMs % 86400000) / 3600000));
  const diffMin = Math.max(0, Math.floor((eventMs % 3600000) / 60000));
  const diffSec = Math.max(0, Math.floor((eventMs % 60000) / 1000));
  const upcoming = eventMs > 0;

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

  /* ── Shared glass style helper ── */
  const glass = (opacity = 0.07, border = 0.12) => ({
    background: `rgba(255,255,255,${opacity})`,
    border: `1px solid rgba(255,255,255,${border})`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  } as React.CSSProperties);

  return (
    <div
      style={{ fontFamily, background: bg, color: '#e2e8f0' }}
      className="min-h-screen pb-28 sm:pb-16 selection:bg-violet-500/30"
    >
      {fontLink && <link rel="stylesheet" href={fontLink} />}

      {/* ── Ambient orbs ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{ background: primary }} />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full opacity-15 blur-[100px]"
          style={{ background: secondary }} />
        <div className="absolute -bottom-60 left-1/3 w-[700px] h-[400px] rounded-full opacity-10 blur-[120px]"
          style={{ background: primary }} />
      </div>

      {/* ── HERO ── */}
      <div className="relative min-h-screen flex flex-col z-10">

        {/* Full-screen image with glass overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={data.imageUrl}
            alt={data.title}
            className="w-full h-full object-cover object-center"
          />
          {/* Multi-layer dark glass */}
          <div className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${bg}e8 0%, ${bg}a0 40%, ${bg}60 70%, ${bg}d0 100%)` }} />
          <div className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse at 60% 40%, ${primary}22 0%, transparent 60%)` }} />
        </div>

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-6 sm:px-12 pt-16 pb-4">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full" style={glass(0.05, 0.1)}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: secondary }} />
            <span className="text-xs font-medium text-white/60 tracking-wide">{data.organizerName}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.tags.slice(0, 3).map((tag, i) => (
              <span key={i}
                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: i === 0 ? `${primary}40` : `rgba(255,255,255,0.07)`,
                  border: `1px solid ${i === 0 ? `${primary}60` : 'rgba(255,255,255,0.12)'}`,
                  color: i === 0 ? '#c4b5fd' : 'rgba(255,255,255,0.6)',
                }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 flex-1 flex flex-col justify-end px-6 sm:px-12 pb-12">
          <div className="max-w-4xl">
            <h1 className="text-[clamp(2.5rem,7vw,6.5rem)] font-black leading-[0.92] tracking-tighter text-white mb-6"
              style={{ textShadow: `0 0 80px ${primary}60` }}>
              {data.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 mb-10">
              <div className="flex items-center gap-2.5 text-white/70 text-sm font-medium">
                <Calendar className="w-4 h-4" style={{ color: secondary }} />
                {fmt(data.startDatetime)}
              </div>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2.5 text-white/70 text-sm font-medium">
                <Clock className="w-4 h-4" style={{ color: secondary }} />
                {fmtTime(data.startDatetime)}
              </div>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2.5 text-white/70 text-sm font-medium">
                <MapPin className="w-4 h-4" style={{ color: secondary }} />
                {data.venueName}
              </div>
            </div>

            {/* Countdown + CTA row */}
            <div className="flex flex-wrap items-stretch gap-4">
              {upcoming && (
                <div className="flex divide-x rounded-2xl overflow-hidden" style={glass(0.06, 0.12)}>
                  {[{ v: diffDays, l: 'D' }, { v: diffHrs, l: 'H' }, { v: diffMin, l: 'M' }, { v: diffSec, l: 'S' }].map(({ v, l }) => (
                    <div key={l} className="flex flex-col items-center justify-center px-5 py-4 gap-0.5"
                      style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                      <span className="text-2xl sm:text-3xl font-black tabular-nums text-white">
                        {String(v).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-white/40">{l}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* <button className="flex items-center gap-3 px-7 py-4 rounded-2xl font-bold text-sm text-white transition-all hover:scale-[1.03] hover:shadow-2xl active:scale-[0.98]"
                style={{
                  background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                  boxShadow: `0 8px 32px ${primary}50`,
                }}>
                {startPrice !== null ? `Get Tickets · Rs.${startPrice.toLocaleString()}` : 'Get Tickets'}
                <ArrowRight className="w-4 h-4" />
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT SECTION ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">

          {/* Content area */}
          <div className="min-w-0 space-y-6">

            {/* ── Floating pill tab bar (horizontal, scrollable) ── */}
            <div className="flex gap-1.5 p-1.5 rounded-2xl overflow-x-auto no-scrollbar w-full" style={glass(0.05, 0.1)}>
              {enabledTabs.map(tab => {
                const isActive = activeTab === tab;
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0"
                    style={isActive
                      ? { background: `linear-gradient(135deg, ${primary}, ${secondary})`, color: '#fff', boxShadow: `0 4px 20px ${primary}50` }
                      : { color: 'rgba(255,255,255,0.45)', background: 'transparent' }}>
                    <span style={{ opacity: isActive ? 1 : 0.7 }}>{TAB_ICONS[tab]}</span>
                    {TAB_LABELS[tab]}
                  </button>
                );
              })}
            </div>

            {/* Tab panels */}
            <div className="rounded-3xl overflow-hidden" style={glass(0.05, 0.1)}>

              {/* ── OVERVIEW ── */}
              {activeTab === 'overview' && (
                <div className="p-8 sm:p-10 space-y-8 animate-in fade-in duration-300">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: secondary }}>About</h3>
                    <p className="text-base leading-relaxed text-white/75 whitespace-pre-wrap font-light">{data.description}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { icon: <Calendar className="w-4 h-4" />, label: 'Date', value: fmt(data.startDatetime) },
                      { icon: <Clock className="w-4 h-4" />, label: 'Time', value: `${fmtTime(data.startDatetime)} — ${fmtTime(data.endDatetime)}` },
                      { icon: <MapPin className="w-4 h-4" />, label: 'Venue', value: data.venueName },
                      { icon: <Users className="w-4 h-4" />, label: 'Hosted by', value: data.organizerName },
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="flex items-center gap-4 p-4 rounded-2xl" style={glass(0.05, 0.08)}>
                        <div className="p-2.5 rounded-xl shrink-0" style={{ background: `${primary}30`, color: secondary }}>
                          {icon}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-0.5">{label}</p>
                          <p className="text-sm font-semibold text-white/90 leading-snug">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── SCHEDULE ── */}
              {activeTab === 'schedule' && (
                <div className="p-8 sm:p-10 space-y-3 animate-in fade-in duration-300">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: secondary }}>Programme</h3>
                  {data.agenda.length === 0
                    ? <p className="text-white/40 text-sm italic">No schedule published yet.</p>
                    : data.agenda.map((item, idx) => (
                      <div key={item.id}
                        className="flex gap-5 p-5 rounded-2xl transition-all hover:bg-white/5"
                        style={{ borderLeft: `2px solid ${idx % 2 === 0 ? primary : secondary}50` }}>
                        <div className="shrink-0 text-center">
                          <span className="block text-xs font-black tabular-nums" style={{ color: secondary }}>
                            {fmtTime(item.startTime)}
                          </span>
                          <div className="w-px h-5 mx-auto my-1 opacity-30" style={{ background: secondary }} />
                          <span className="block text-[10px] text-white/35">{fmtTime(item.endTime)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-sm leading-snug">{item.title}</h4>
                          {item.roomOrLocation && (
                            <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{item.roomOrLocation}
                            </p>
                          )}
                          {item.description && <p className="text-xs text-white/55 mt-2 leading-relaxed">{item.description}</p>}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* ── TICKETS ── */}
              {activeTab === 'tickets' && (
                <div className="p-8 sm:p-10 space-y-3 animate-in fade-in duration-300">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: secondary }}>Access Tiers</h3>
                  {data.tickets.length === 0
                    ? <p className="text-white/40 text-sm italic">No tickets available yet.</p>
                    : data.tickets.map((ticket, idx) => (
                      <div key={ticket.id}
                        className={`flex items-center justify-between p-5 rounded-2xl transition-all ${ticket.soldOut ? 'opacity-40' : 'hover:bg-white/5 cursor-pointer'}`}
                        style={{
                          border: `1px solid ${idx === 0 ? `${primary}50` : 'rgba(255,255,255,0.07)'}`,
                          background: idx === 0 ? `${primary}15` : 'rgba(255,255,255,0.03)',
                        }}>
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl" style={{ background: `${primary}25`, color: secondary }}>
                            <Ticket className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">{ticket.tierName}</p>
                            {ticket.soldOut && <p className="text-xs text-red-400 mt-0.5 font-medium">Sold Out</p>}
                          </div>
                        </div>
                        <p className="text-2xl font-black tabular-nums"
                          style={{ color: ticket.soldOut ? '#f87171' : 'white' }}>
                          {ticket.soldOut ? '—' : `Rs.${ticket.price.toLocaleString()}`}
                        </p>
                      </div>
                    ))}
                  {/* <div className="pt-4">
                    <button className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm text-white transition-all hover:scale-[1.02] hover:shadow-2xl"
                      style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})`, boxShadow: `0 8px 32px ${primary}40` }}>
                      Secure Your Ticket <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-white/30 mt-3 font-medium">JazzCash · EasyPaisa accepted</p>
                  </div> */}
                </div>
              )}

              {/* ── LOCATION ── */}
              {activeTab === 'location' && (
                <div className="animate-in fade-in duration-300">
                  <div className="overflow-hidden rounded-t-3xl">
                    <iframe
                      src={`https://maps.google.com/maps?q=${mapQ}&output=embed&z=15`}
                      width="100%" height="380"
                      style={{ border: 0, display: 'block', filter: 'brightness(0.85) contrast(1.1) saturate(0.9)' }}
                      allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                      title="Event Location"
                    />
                  </div>
                  <div className="p-6 sm:p-8 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-xl shrink-0" style={{ background: `${primary}30`, color: secondary }}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-white leading-snug">{locationStr}</p>
                        <a href={`https://maps.google.com/maps?q=${mapQ}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold mt-2 transition-opacity hover:opacity-70"
                          style={{ color: secondary }}>
                          Open in Maps <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── CONTACT ── */}
              {activeTab === 'contact' && (
                <div className="p-8 sm:p-10 space-y-3 animate-in fade-in duration-300">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: secondary }}>Get In Touch</h3>
                  {[
                    { icon: <Users className="w-4 h-4" />, label: 'Organiser', value: data.organizerName },
                    { icon: <Mail className="w-4 h-4" />, label: 'Email', value: data.organizerEmail, href: data.organizerEmail ? `mailto:${data.organizerEmail}` : undefined },
                    { icon: <Phone className="w-4 h-4" />, label: 'Phone', value: data.organizerPhone, href: data.organizerPhone ? `tel:${data.organizerPhone}` : undefined },
                  ].filter(c => c.value).map((c) => (
                    <div key={c.label} className="flex items-center gap-4 p-5 rounded-2xl" style={glass(0.05, 0.08)}>
                      <div className="p-2.5 rounded-xl shrink-0" style={{ background: `${primary}30`, color: secondary }}>
                        {c.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-0.5">{c.label}</p>
                        {c.href
                          ? <a href={c.href} className="font-semibold text-sm transition-opacity hover:opacity-70" style={{ color: secondary }}>{c.value}</a>
                          : <p className="font-semibold text-sm text-white">{c.value}</p>}
                      </div>
                    </div>
                  ))}
                  {!data.organizerEmail && !data.organizerPhone && (
                    <p className="text-white/30 text-sm italic">No contact info available.</p>
                  )}
                </div>
              )}

              {/* ── SOCIAL ── */}
              {activeTab === 'social' && (
                <div className="p-8 sm:p-10 space-y-6 animate-in fade-in duration-300">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: secondary }}>Connect</h3>
                  {socialItems.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {socialItems.map(([key, url]) => (
                        <a key={key} href={url as string} target="_blank" rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl transition-all hover:-translate-y-1 hover:bg-white/10 group"
                          style={glass(0.05, 0.1)}>
                          <span className="text-2xl transition-colors group-hover:text-white" style={{ color: secondary }}>
                            {SOCIAL_ICONS[key]}
                          </span>
                          <span className="text-xs font-semibold text-white/60 group-hover:text-white transition-colors">{SOCIAL_LABELS[key]}</span>
                        </a>
                      ))}
                    </div>
                  )}
                  <div className="p-5 rounded-2xl" style={glass(0.05, 0.1)}>
                    <div className="flex items-center gap-2 mb-3">
                      <Share2 className="w-4 h-4" style={{ color: secondary }} />
                      <p className="text-sm font-semibold text-white">Share this event</p>
                    </div>
                    <p className="text-white/30 text-xs break-all font-mono mb-4">
                      {typeof window !== 'undefined' ? window.location.href : ''}
                    </p>
                    <button onClick={() => navigator.clipboard?.writeText(window.location.href)}
                      className="text-xs font-bold px-5 py-2.5 rounded-xl text-white transition-all hover:scale-105"
                      style={{ background: `${primary}60`, border: `1px solid ${primary}80` }}>
                      Copy Link
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right — Sticky Glass Ticket Widget */}
          <div className="lg:sticky lg:top-8 lg:self-start space-y-4">

            {/* Ticket card */}
            <div className="rounded-3xl overflow-hidden" style={glass(0.07, 0.12)}>
              {/* Gradient header */}
              <div className="relative p-6 overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${primary}60, ${secondary}40)` }}>
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20 blur-2xl"
                  style={{ background: primary }} />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-1">Entry from</p>
                <p className="text-4xl font-black text-white mb-0.5">
                  {startPrice !== null ? `Rs.${startPrice.toLocaleString()}` : 'TBA'}
                </p>
                <p className="text-xs text-white/50 font-medium">per person</p>
              </div>

              {/* Tier list */}
              {data.tickets.length > 0 && (
                <div className="px-4 py-3 space-y-1">
                  {data.tickets.slice(0, 4).map((t, i) => (
                    <div key={t.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                      style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                      <span className="text-xs font-medium text-white/70">{t.tierName}</span>
                      <span className="text-xs font-bold" style={{ color: t.soldOut ? '#f87171' : secondary }}>
                        {t.soldOut ? 'Sold Out' : `Rs.${t.price.toLocaleString()}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Dashed separator */}
              <div className="mx-6 my-2 border-t border-dashed border-white/10" />

              {/* CTA */}
              <div className="p-5">
                <button
                  onClick={onCheckout}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm text-white transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})`, boxShadow: `0 8px 24px ${primary}50` }}>
                  Get Tickets <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-center gap-3 mt-3">
                  <div className="w-1.5 h-1.5 rounded-full opacity-50" style={{ background: secondary }} />
                  <span className="text-[10px] text-white/40 font-medium">JazzCash · EasyPaisa</span>
                  <div className="w-1.5 h-1.5 rounded-full opacity-50" style={{ background: secondary }} />
                </div>
              </div>
            </div>

            {/* Quick info glass card */}
            <div className="rounded-3xl p-5 space-y-3" style={glass(0.05, 0.1)}>
              {[
                { icon: <Calendar className="w-3.5 h-3.5" />, value: fmt(data.startDatetime) },
                { icon: <Clock className="w-3.5 h-3.5" />, value: `${fmtTime(data.startDatetime)} — ${fmtTime(data.endDatetime)}` },
                { icon: <MapPin className="w-3.5 h-3.5" />, value: locationStr },
              ].map(({ icon, value }) => (
                <div key={value} className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5" style={{ color: secondary }}>{icon}</span>
                  <p className="text-xs text-white/60 leading-snug font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE FOOTER ── */}
      <div className="fixed bottom-0 left-0 w-full sm:hidden z-50 p-4">
        <div className="flex items-center justify-between p-4 rounded-2xl"
          style={{ ...glass(0.15, 0.2), boxShadow: `0 -4px 40px ${primary}40` }}>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-0.5">Tickets from</p>
            <p className="text-xl font-black text-white">{startPrice !== null ? `Rs.${startPrice.toLocaleString()}` : 'TBA'}</p>
          </div>
          <button
            onClick={onCheckout}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white"
            style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
            Buy Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}