'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { publicService } from '@/api/publicService';
import { EventTemplateData, TabName } from '@/types/template.types';
import { Sponsor } from '@/types/sponsor.types';
import {
  Calendar, MapPin, Clock, Ticket, Users, Mail, Phone,
  Globe, MessageCircle, Share2, ExternalLink, ArrowUpRight,
  ChevronRight, LayoutGrid, Zap, Loader2
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter } from 'react-icons/fa6';

interface Template3Props {
  data: EventTemplateData & { sponsors?: Sponsor[] };
  onCheckout: () => void;
}

/* ── Font maps ── */
const FONT_MAP: Record<string, string> = {
  'dm-sans': "'DM Sans', sans-serif",
  'playfair': "'Playfair Display', serif",
  'space-grotesk': "'Space Grotesk', sans-serif",
  'cabinet-grotesk': "'Cabinet Grotesk', sans-serif",
  'syne': "'Syne', sans-serif",
};
const FONT_LINKS: Record<string, string> = {
  'dm-sans': 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap',
  'playfair': 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&display=swap',
  'space-grotesk': 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap',
  'cabinet-grotesk': 'https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&display=swap',
  'syne': 'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap',
};
const TAB_LABELS: Record<TabName, string> = {
  overview: 'Overview', schedule: 'Schedule', tickets: 'Tickets',
  location: 'Location', contact: 'Contact', social: 'Social', sponsors: 'Sponsors',
  recover: 'Recover Tickets',
};
const TIER_COLORS: Record<string, string> = {
  PLATINUM: '#e5e7eb', GOLD: '#fbbf24', SILVER: '#9ca3af', BRONZE: '#cd7f32',
};

export default function Template3({ data, onCheckout }: Template3Props) {
  /* ── Colours ── */
  const bgColor = data.backgroundColor || '#0d0d14';
  const primary = data.primaryColor || '#7c3aed';
  const secondary = data.secondaryColor || '#06b6d4';

  const lum = (hex: string) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };
  const isLight = lum(bgColor) > 0.5;
  const textColor = isLight ? '#111118' : '#f0f0f8';
  const mutedText = isLight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.45)';
  const cardBg = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)';
  const cardBorder = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';

  const fontFamily = FONT_MAP[data.fontStyle || 'space-grotesk'];
  const fontLink = FONT_LINKS[data.fontStyle || 'space-grotesk'];

  /* ── Formatters ── */
  const fmt = (dt: string) => new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(dt));
  const fmtShort = (dt: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dt));
  const fmtTime = (dt: string) => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(dt));

  /* ── Derived ── */
  const enabledTabs = (data.enabledTabs?.length
    ? data.enabledTabs
    : ['overview', 'schedule', 'tickets', 'location', 'contact', 'social', 'recover']) as TabName[];

  const avail = data.tickets.filter(t => !t.soldOut);
  const startPrice = avail.length > 0 ? Math.min(...avail.map(t => t.price)) : null;
  const locationStr = `${data.venueName}, ${data.formattedAddress}`;
  const mapQ = encodeURIComponent(locationStr);
  const socialItems = Object.entries(data.socialLinks || {}).filter(([, v]) => v);

  /* ── Countdown ── */
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(id); }, []);
  const eventMs = new Date(data.startDatetime).getTime() - Date.now();
  const diffDays = Math.max(0, Math.floor(eventMs / 86400000));
  const diffHrs = Math.max(0, Math.floor((eventMs % 86400000) / 3600000));
  const diffMin = Math.max(0, Math.floor((eventMs % 3600000) / 60000));
  const diffSec = Math.max(0, Math.floor((eventMs % 60000) / 1000));
  const upcoming = eventMs > 0;

  /* ── Scroll spy ── */
  const [activeTab, setActiveTab] = useState<TabName>('overview');
  const sectionRefs = useRef<Record<TabName, HTMLElement | null>>({} as Record<TabName, HTMLElement | null>);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id as TabName;
          if (enabledTabs.includes(id)) setActiveTab(id);
        }
      }),
      { threshold: 0.2, rootMargin: '-72px 0px 0px 0px' }
    );
    Object.values(sectionRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [enabledTabs]);

  const scrollTo = (tab: TabName) => {
    sectionRefs.current[tab]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveTab(tab);
  };

  /* ── Social ── */
  const SOCIAL_ICONS: Record<string, React.ReactNode> = {
    facebook: <FaFacebook className="w-4 h-4" />, instagram: <FaInstagram className="w-4 h-4" />,
    twitter: <FaXTwitter className="w-4 h-4" />, linkedin: <FaLinkedin className="w-4 h-4" />,
    whatsapp: <MessageCircle className="w-4 h-4" />, website: <Globe className="w-4 h-4" />,
  };
  const SOCIAL_LABELS: Record<string, string> = {
    facebook: 'Facebook', instagram: 'Instagram', twitter: 'Twitter / X',
    linkedin: 'LinkedIn', whatsapp: 'WhatsApp', website: 'Website',
  };

  // ── Recover Tickets state ──────────────────────────────────────────
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recovering, setRecovering] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRecoverTickets = async () => {
    if (!recoveryEmail.trim()) {
      setRecoveryMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }
    setRecovering(true);
    setRecoveryMessage(null);
    try {
      const result = await publicService.recoverTickets(data.eventId, recoveryEmail.trim());
      setRecoveryMessage({ type: 'success', text: result.message || 'Recovery email sent successfully!' });
      setRecoveryEmail('');
    } catch (err: any) {
      setRecoveryMessage({ type: 'error', text: err.message || 'Failed to recover tickets. Please try again.' });
    } finally {
      setRecovering(false);
    }
  };

  return (
    <div style={{ fontFamily, background: bgColor, color: textColor }} className="min-h-screen overflow-x-hidden">

      {fontLink && <link rel="stylesheet" href={fontLink} />}

      {/* ══════════════════════════════════════════
          HEADER — Left logo + right side inline nav
          Unique: horizontal bar split into 3 zones
          with a colour-strip accent at bottom
      ══════════════════════════════════════════ */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-[60px]"
        style={{
          background: bgColor,
          borderBottom: `2px solid ${primary}`,
          boxShadow: `0 4px 32px ${primary}22`,
        }}
      >
        {/* Thin rainbow accent line at very top */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: `linear-gradient(90deg, ${primary}, ${secondary}, ${primary})` }}
        />

        <div className="max-w-[1400px] mx-auto h-full flex items-center">
          {/* Zone A: Brand (fixed 240px) */}
          <div
            className="shrink-0 flex items-center gap-3 px-6 h-full border-r"
            style={{ borderColor: `${primary}30`, minWidth: '200px' }}
          >
            <span
              className="text-xs font-bold uppercase tracking-[0.15em] truncate"
              style={{ color: textColor }}
            >
              {data.title}
            </span>
          </div>

          {/* Zone B: Nav tabs (flex, scrollable) */}
          <nav className="flex-1 flex items-center overflow-x-auto no-scrollbar h-full">
            {enabledTabs.map(tab => (
              <button
                key={tab}
                onClick={() => scrollTo(tab)}
                className="relative shrink-0 h-full px-5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-all duration-150"
                style={{
                  color: activeTab === tab ? primary : mutedText,
                  background: activeTab === tab ? `${primary}0d` : 'transparent',
                }}
              >
                {TAB_LABELS[tab]}
                {/* Bottom indicator */}
                {activeTab === tab && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ background: primary }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Zone C: CTA */}
          <div className="shrink-0 px-5 hidden sm:block">
            <button
              onClick={onCheckout}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:brightness-110 active:scale-95"
              style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
            >
              <Ticket className="w-3.5 h-3.5" /> Buy Tickets
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          HERO — Magazine layout: image RIGHT fills
          60% of viewport; text panel LEFT has all
          info. NO duplicate countdown in section.
      ══════════════════════════════════════════ */}
      <div className="pt-[60px]">
        <div className="relative min-h-[calc(100vh-60px)] grid grid-cols-1 lg:grid-cols-[1fr_55%]">

          {/* LEFT — Content panel */}
          <div
            className="relative z-10 flex flex-col justify-between px-8 sm:px-14 py-12 lg:py-16"
            style={{ background: bgColor }}
          >
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-10">
              {data.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    color: i % 2 === 0 ? primary : secondary,
                    background: i % 2 === 0 ? `${primary}15` : `${secondary}15`,
                    border: `1px solid ${i % 2 === 0 ? `${primary}40` : `${secondary}40`}`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Giant title */}
            <div className="flex-1 flex flex-col justify-center">
              <h1
                className="font-black leading-[0.88] tracking-tighter mb-8"
                style={{ fontSize: 'clamp(3rem,7vw,7rem)', color: textColor }}
              >
                {data.title}
              </h1>

              {/* Organiser + date strip */}
              <div
                className="flex flex-col gap-2 mb-10 pl-4"
                style={{ borderLeft: `3px solid ${primary}` }}
              >
                <p className="text-sm font-semibold" style={{ color: textColor }}>
                  {data.organizerName}
                </p>
                <p className="text-sm" style={{ color: mutedText }}>
                  <Calendar className="w-3.5 h-3.5 inline mr-1.5" style={{ color: secondary }} />
                  {fmt(data.startDatetime)}
                </p>
                <p className="text-sm" style={{ color: mutedText }}>
                  <MapPin className="w-3.5 h-3.5 inline mr-1.5" style={{ color: secondary }} />
                  {data.venueName}
                </p>
              </div>

              {/* Countdown — horizontal blocks */}
              {upcoming && (
                <div className="mb-10">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.25em] mb-4"
                    style={{ color: mutedText }}
                  >
                    Starts in
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {[{ v: diffDays, l: 'Days' }, { v: diffHrs, l: 'Hrs' }, { v: diffMin, l: 'Min' }, { v: diffSec, l: 'Sec' }].map(({ v, l }, i) => (
                      <div
                        key={l}
                        className="flex flex-col items-center justify-center min-w-[72px] py-3 px-4"
                        style={{
                          background: i === 0 ? `${primary}20` : cardBg,
                          border: `1px solid ${i === 0 ? `${primary}50` : cardBorder}`,
                        }}
                      >
                        <span
                          className="text-3xl sm:text-4xl font-black tabular-nums leading-none"
                          style={{ color: i === 0 ? primary : textColor }}
                        >
                          {String(v).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: mutedText }}>
                          {l}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={onCheckout}
                  className="flex items-center gap-2.5 px-7 py-4 font-bold text-sm uppercase tracking-wider text-white transition-all hover:brightness-110 active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                    boxShadow: `0 6px 30px ${primary}40`,
                  }}
                >
                  <Ticket className="w-4 h-4" />
                  {startPrice !== null ? `Get Tickets · Rs.${startPrice.toLocaleString()}` : 'Get Tickets'}
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT — Full-bleed image */}
          <div className="relative order-first lg:order-last min-h-[50vw] lg:min-h-0">
            <img
              src={data.imageUrl}
              alt={data.title}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Gradient fade to left (bridges into content panel) */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, ${bgColor} 0%, ${bgColor}00 30%)`,
              }}
            />
            {/* Bottom fade for mobile */}
            <div
              className="absolute inset-0 lg:hidden"
              style={{
                background: `linear-gradient(to top, ${bgColor} 0%, ${bgColor}00 40%)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MAIN CONTENT — 2-col: content + sticky aside
      ══════════════════════════════════════════ */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-12 pt-16 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start">

          {/* ── Primary content column ── */}
          <div className="space-y-20 min-w-0">

            {/* ── OVERVIEW ── */}
            {enabledTabs.includes('overview') && (
              <section id="overview" ref={el => { sectionRefs.current['overview'] = el; }} style={{ scrollMarginTop: '80px' }}>
                <Stripe label="Overview" primary={primary} secondary={secondary} textColor={textColor} />
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-8">
                  <p className="text-base sm:text-lg leading-relaxed font-light" style={{ color: textColor }}>
                    {data.description}
                  </p>
                  <div className="space-y-3">
                    {[
                      { icon: <Calendar className="w-4 h-4" />, label: 'Date', val: fmtShort(data.startDatetime) },
                      { icon: <Clock className="w-4 h-4" />, label: 'Time', val: `${fmtTime(data.startDatetime)} – ${fmtTime(data.endDatetime)}` },
                      { icon: <MapPin className="w-4 h-4" />, label: 'Venue', val: data.venueName },
                      { icon: <Users className="w-4 h-4" />, label: 'Organiser', val: data.organizerName },
                    ].map(({ icon, label, val }) => (
                      <div key={label} className="flex items-start gap-3 p-3" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                        <span className="shrink-0 mt-0.5" style={{ color: secondary }}>{icon}</span>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.22em]" style={{ color: mutedText }}>{label}</p>
                          <p className="text-sm font-semibold leading-snug mt-0.5" style={{ color: textColor }}>{val}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ── SCHEDULE ── */}
            {enabledTabs.includes('schedule') && (
              <section id="schedule" ref={el => { sectionRefs.current['schedule'] = el; }} style={{ scrollMarginTop: '80px' }}>
                <Stripe label="Schedule" primary={primary} secondary={secondary} textColor={textColor} />
                <div className="mt-8 space-y-3">
                  {data.agenda.length === 0
                    ? <p className="text-sm italic" style={{ color: mutedText }}>No schedule published yet.</p>
                    : data.agenda.map((item, idx) => {
                      const col = idx % 2 === 0 ? primary : secondary;
                      return (
                        <div
                          key={item.id}
                          className="grid grid-cols-1 sm:grid-cols-[100px_1fr] overflow-hidden transition-transform hover:-translate-y-px"
                          style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderLeft: `3px solid ${col}` }}
                        >
                          {/* Time column */}
                          <div className="flex sm:flex-col justify-between sm:justify-center gap-1 px-4 py-4 sm:border-r" style={{ borderColor: cardBorder }}>
                            <span className="text-xs font-black tabular-nums" style={{ color: col }}>{fmtTime(item.startTime)}</span>
                            <span className="text-[10px]" style={{ color: mutedText }}>{fmtTime(item.endTime)}</span>
                          </div>
                          {/* Content */}
                          <div className="flex items-start gap-4 px-5 py-4">
                            {item.imageUrl ? (
                              <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 overflow-hidden border" style={{ borderColor: col + '60' }}>
                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div
                                className="shrink-0 w-9 h-9 flex items-center justify-center text-xs font-black"
                                style={{ background: `${col}18`, color: col }}
                              >
                                {String(idx + 1).padStart(2, '0')}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm leading-snug" style={{ color: textColor }}>{item.title}</h4>
                              {item.roomOrLocation && (
                                <p className="text-xs flex items-center gap-1 mt-1" style={{ color: mutedText }}>
                                  <MapPin className="w-3 h-3 shrink-0" />{item.roomOrLocation}
                                </p>
                              )}
                              {item.description && (
                                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: mutedText }}>{item.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>
            )}

            {/* ── TICKETS ── */}
            {enabledTabs.includes('tickets') && (
              <section id="tickets" ref={el => { sectionRefs.current['tickets'] = el; }} style={{ scrollMarginTop: '80px' }}>
                <Stripe label="Tickets" primary={primary} secondary={secondary} textColor={textColor} />
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {data.tickets.length === 0
                    ? <p className="text-sm italic col-span-full" style={{ color: mutedText }}>No tickets available yet.</p>
                    : data.tickets.map((ticket, idx) => {
                      const isFeat = idx === 0;
                      return (
                        <div
                          key={ticket.id}
                          className={`flex flex-col p-6 transition-all ${ticket.soldOut ? 'opacity-50' : 'hover:-translate-y-1.5 hover:shadow-lg'}`}
                          style={isFeat ? {
                            background: `linear-gradient(145deg, ${primary}22, ${secondary}12)`,
                            border: `2px solid ${primary}50`,
                            boxShadow: `0 8px 32px ${primary}20`,
                          } : { background: cardBg, border: `1px solid ${cardBorder}` }}
                        >
                          <div
                            className="w-9 h-9 flex items-center justify-center mb-4"
                            style={{ background: `${isFeat ? primary : secondary}20`, color: isFeat ? primary : secondary }}
                          >
                            <Ticket className="w-4 h-4" />
                          </div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.22em] mb-1" style={{ color: mutedText }}>
                            Tier {String(idx + 1).padStart(2, '0')}
                          </p>
                          <h3 className="font-black text-base uppercase tracking-tight leading-snug mb-auto" style={{ color: textColor }}>
                            {ticket.tierName}
                          </h3>
                          <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${cardBorder}` }}>
                            <p className="text-2xl font-black tabular-nums" style={{ color: ticket.soldOut ? '#ef4444' : isFeat ? primary : secondary }}>
                              {ticket.soldOut ? 'Sold Out' : `Rs.${ticket.price.toLocaleString()}`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
                {data.tickets.length > 0 && (
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <button
                      onClick={onCheckout}
                      className="flex items-center gap-2 px-7 py-3.5 font-bold text-sm uppercase tracking-wider text-white transition-all hover:brightness-110 active:scale-95"
                      style={{ background: `linear-gradient(135deg,${primary},${secondary})`, boxShadow: `0 6px 24px ${primary}35` }}
                    >
                      Buy Tickets <ArrowUpRight className="w-4 h-4" />
                    </button>
                    <p className="text-xs" style={{ color: mutedText }}>JazzCash · EasyPaisa accepted</p>
                  </div>
                )}
              </section>
            )}

            {/* ── LOCATION ── */}
            {enabledTabs.includes('location') && (
              <section id="location" ref={el => { sectionRefs.current['location'] = el; }} style={{ scrollMarginTop: '80px' }}>
                <Stripe label="Location" primary={primary} secondary={secondary} textColor={textColor} />
                <div className="mt-8 overflow-hidden" style={{ border: `1px solid ${cardBorder}` }}>
                  <iframe
                    src={`https://maps.google.com/maps?q=${mapQ}&output=embed&z=15`}
                    width="100%" height="380"
                    style={{ border: 0, display: 'block', filter: isLight ? 'none' : 'brightness(0.8) contrast(1.05)' }}
                    allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                    title="Event Location"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4"
                    style={{ background: cardBg, borderTop: `1px solid ${cardBorder}` }}>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: secondary }} />
                      <p className="text-sm font-semibold leading-snug" style={{ color: textColor }}>{locationStr}</p>
                    </div>
                    <a
                      href={`https://maps.google.com/maps?q=${mapQ}`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap hover:underline"
                      style={{ color: primary }}
                    >
                      Open Maps <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </section>
            )}

            {/* ── CONTACT ── */}
            {enabledTabs.includes('contact') && (
              <section id="contact" ref={el => { sectionRefs.current['contact'] = el; }} style={{ scrollMarginTop: '80px' }}>
                <Stripe label="Contact" primary={primary} secondary={secondary} textColor={textColor} />
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: <Users className="w-5 h-5" />, label: 'Organiser', value: data.organizerName, href: undefined },
                    { icon: <Mail className="w-5 h-5" />, label: 'Email', value: data.organizerEmail, href: data.organizerEmail ? `mailto:${data.organizerEmail}` : undefined },
                    { icon: <Phone className="w-5 h-5" />, label: 'Phone', value: data.organizerPhone, href: data.organizerPhone ? `tel:${data.organizerPhone}` : undefined },
                  ].filter(c => c.value).map((c, i) => {
                    const col = i % 2 === 0 ? primary : secondary;
                    return (
                      <div key={c.label} className="flex flex-col gap-3 p-5 transition-all hover:-translate-y-0.5"
                        style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderTop: `2px solid ${col}` }}>
                        <span className="w-10 h-10 flex items-center justify-center" style={{ background: `${col}18`, color: col }}>
                          {c.icon}
                        </span>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.22em] mb-1" style={{ color: mutedText }}>{c.label}</p>
                          {c.href
                            ? <a href={c.href} className="font-bold text-sm hover:underline" style={{ color: col }}>{c.value}</a>
                            : <p className="font-bold text-sm" style={{ color: textColor }}>{c.value}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── SOCIAL ── */}
            {enabledTabs.includes('social') && (
              <section id="social" ref={el => { sectionRefs.current['social'] = el; }} style={{ scrollMarginTop: '80px' }}>
                <Stripe label="Social & Share" primary={primary} secondary={secondary} textColor={textColor} />
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
                  {socialItems.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {socialItems.map(([key, url]) => (
                        <a key={key} href={url as string} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 group transition-all hover:-translate-y-0.5"
                          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                          <span className="w-8 h-8 flex items-center justify-center shrink-0" style={{ background: `${primary}18`, color: primary }}>
                            {SOCIAL_ICONS[key]}
                          </span>
                          <span className="text-sm font-semibold" style={{ color: textColor }}>{SOCIAL_LABELS[key]}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 ml-auto shrink-0" style={{ color: mutedText }} />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm italic" style={{ color: mutedText }}>No social links added.</p>
                  )}
                  <div className="p-5" style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderTop: `2px solid ${secondary}` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Share2 className="w-4 h-4" style={{ color: secondary }} />
                      <p className="font-bold text-sm" style={{ color: textColor }}>Share</p>
                    </div>
                    <p className="text-xs break-all font-mono mb-4" style={{ color: mutedText }}>
                      {typeof window !== 'undefined' ? window.location.href : ''}
                    </p>
                    <button onClick={() => navigator.clipboard?.writeText(window.location.href)}
                      className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-white"
                      style={{ background: `linear-gradient(135deg,${primary},${secondary})` }}>
                      Copy Link
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* ── SPONSORS ── */}
            {enabledTabs.includes('sponsors') && (
              <section id="sponsors" ref={el => { sectionRefs.current['sponsors'] = el; }} style={{ scrollMarginTop: '80px' }}>
                <Stripe label="Sponsors" primary={primary} secondary={secondary} textColor={textColor} />
                {!data.sponsors || data.sponsors.length === 0 ? (
                  <p className="text-sm italic mt-8" style={{ color: mutedText }}>No sponsors listed yet.</p>
                ) : (
                  <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {data.sponsors.map(s => {
                      const tc = TIER_COLORS[s.sponsorTier] || TIER_COLORS.BRONZE;
                      return (
                        <div key={s.id}
                          className="flex flex-col items-center gap-4 p-5 transition-all hover:-translate-y-1 group"
                          style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderTop: `2px solid ${tc}` }}>
                          {s.logoUrl && (
                            <div className="w-16 h-16 flex items-center justify-center p-2" style={{ background: `${tc}12` }}>
                              <img src={s.logoUrl} alt={s.name} className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                            </div>
                          )}
                          <div className="text-center">
                            <p className="font-bold text-sm leading-tight mb-2" style={{ color: textColor }}>{s.name}</p>
                            <span className="text-[9px] font-black uppercase tracking-[0.18em] px-2 py-0.5"
                              style={{ color: tc, background: `${tc}15`, border: `1px solid ${tc}30` }}>
                              {s.sponsorTier}
                            </span>
                          </div>
                          {s.websiteUrl && (
                            <a href={s.websiteUrl} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                              style={{ color: secondary }}>
                              Visit <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* ── RECOVER TICKETS ── */}
            {enabledTabs.includes('recover') && (
              <section
                id="recover"
                ref={el => { sectionRefs.current['recover'] = el; }}
                style={{ scrollMarginTop: '80px' }}
              >
                <Stripe label="Recover Tickets" primary={primary} secondary={secondary} textColor={textColor} />

                <div className="mt-8">
                  <p className="text-sm leading-relaxed mb-6" style={{ color: mutedText }}>
                    Enter the email address you used to purchase tickets. We'll send you a link to recover your tickets.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label htmlFor="recovery-email" className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: primary }}>
                        Email Address
                      </label>
                      <input
                        id="recovery-email"
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-lg border bg-transparent text-sm outline-none transition-all focus:outline-2 focus:outline-offset-0"
                        style={{
                          borderColor: cardBorder,
                          color: textColor,
                          outlineColor: primary,
                          background: cardBg,
                        }}
                      />
                    </div>
                    <button
                      onClick={handleRecoverTickets}
                      disabled={recovering}
                      className="shrink-0 px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider text-white transition-all hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
                      style={{
                        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                        boxShadow: `0 4px 16px ${primary}30`,
                      }}
                    >
                      {recovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      {recovering ? 'Sending...' : 'Recover'}
                    </button>
                  </div>

                  {recoveryMessage && (
                    <div
                      className="mt-4 p-4 rounded-lg border text-sm"
                      style={{
                        borderColor: recoveryMessage.type === 'success' ? `${primary}50` : '#ef4444',
                        background: recoveryMessage.type === 'success' ? `${primary}10` : 'rgba(239,68,68,0.08)',
                        color: recoveryMessage.type === 'success' ? primary : '#ef4444',
                      }}
                    >
                      {recoveryMessage.text}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* ── Sticky ticket sidebar ── */}
          <div className="hidden lg:block">
            <div
              className="sticky space-y-0 overflow-hidden"
              style={{ top: '80px', border: `1px solid ${cardBorder}` }}
            >
              {/* Header bar */}
              <div
                className="px-6 py-5"
                style={{ background: `linear-gradient(135deg,${primary}22,${secondary}12)`, borderBottom: `1px solid ${cardBorder}` }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-1" style={{ color: mutedText }}>Entry from</p>
                <p className="text-3xl font-black tabular-nums" style={{ color: textColor }}>
                  {startPrice !== null ? `Rs.${startPrice.toLocaleString()}` : 'TBA'}
                </p>
              </div>

              {/* Tier list */}
              {data.tickets.length > 0 && (
                <div className="divide-y" style={{ borderColor: cardBorder }}>
                  {data.tickets.slice(0, 5).map((t, i) => (
                    <div key={t.id} className="flex items-center justify-between px-5 py-3"
                      style={{ background: i % 2 === 0 ? cardBg : 'transparent', borderColor: cardBorder }}>
                      <span className="text-xs font-medium" style={{ color: mutedText }}>{t.tierName}</span>
                      <span className="text-xs font-black" style={{ color: t.soldOut ? '#ef4444' : i === 0 ? primary : secondary }}>
                        {t.soldOut ? 'Sold Out' : `Rs.${t.price.toLocaleString()}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="p-5" style={{ borderTop: `1px solid ${cardBorder}` }}>
                <button
                  onClick={onCheckout}
                  className="w-full flex items-center justify-center gap-2 py-4 font-black text-sm uppercase tracking-wider text-white transition-all hover:brightness-110 active:scale-95"
                  style={{ background: `linear-gradient(135deg,${primary},${secondary})`, boxShadow: `0 6px 24px ${primary}35` }}
                >
                  <Ticket className="w-4 h-4" /> Get Tickets
                </button>
                <p className="text-center text-[10px] mt-3 font-medium" style={{ color: mutedText }}>
                  JazzCash · EasyPaisa
                </p>
              </div>

              {/* Quick info */}
              <div className="px-5 pb-5 space-y-2.5" style={{ borderTop: `1px solid ${cardBorder}`, paddingTop: '16px' }}>
                {[
                  { icon: <Calendar className="w-3.5 h-3.5" />, val: fmtShort(data.startDatetime) },
                  { icon: <Clock className="w-3.5 h-3.5" />, val: `${fmtTime(data.startDatetime)} – ${fmtTime(data.endDatetime)}` },
                  { icon: <MapPin className="w-3.5 h-3.5" />, val: locationStr },
                ].map(({ icon, val }) => (
                  <div key={val} className="flex items-start gap-2.5">
                    <span className="shrink-0 mt-0.5" style={{ color: secondary }}>{icon}</span>
                    <p className="text-xs leading-snug" style={{ color: mutedText }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          FOOTER — same structure as T1 & T2
      ══════════════════════════════════════════ */}
      <footer className="relative z-10 mt-8">
        <div className="h-px w-full" style={{ background: `linear-gradient(90deg,transparent,${primary},${secondary},transparent)` }} />
        <div className="py-14" style={{ background: bgColor }}>
          <div className="max-w-[1400px] mx-auto px-6 sm:px-12 grid grid-cols-1 sm:grid-cols-3 gap-10 items-center">

            {/* Left: event snapshot */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.28em] mb-2" style={{ color: mutedText }}>
                {fmtShort(data.startDatetime)} · {data.venueName}
              </p>
              <h3 className="font-black text-lg uppercase leading-tight mb-3" style={{ color: textColor }}>{data.title}</h3>
              <div className="flex flex-wrap gap-2">
                {data.tags.slice(0, 3).map((tag, i) => (
                  <span key={i}
                    className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest"
                    style={{ color: i % 2 === 0 ? primary : secondary, border: `1px solid ${i % 2 === 0 ? `${primary}40` : `${secondary}40`}` }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Centre: logo */}
            <div className="flex flex-col items-center gap-4">
              <Image
                src="/images/logo/eventsphere-logo.png"
                alt="Eventsphere"
                width={200} height={52}
                className="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
              />
              <div className="flex items-center gap-3">
                <div className="h-px w-10" style={{ background: `${primary}50` }} />
                <div className="w-2 h-2" style={{ background: `linear-gradient(135deg,${primary},${secondary})` }} />
                <div className="h-px w-10" style={{ background: `${secondary}50` }} />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: mutedText }}>
                Powered by <span style={{ color: primary }}>Eventsphere</span>
              </p>
            </div>

            {/* Right: explore */}
            <div className="flex flex-col items-start sm:items-end gap-4">
              <a href="/explore"
                className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-70"
                style={{ color: secondary }}>
                <LayoutGrid className="w-4 h-4" />
                More Events
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════
          MOBILE STICKY CTA
      ══════════════════════════════════════════ */}
      <div
        className="fixed bottom-0 left-0 w-full sm:hidden z-50 flex items-center justify-between px-5 py-4"
        style={{ background: bgColor, borderTop: `2px solid ${primary}`, boxShadow: `0 -8px 32px ${primary}20` }}
      >
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: mutedText }}>From</p>
          <p className="text-xl font-black tabular-nums" style={{ color: textColor }}>
            {startPrice !== null ? `Rs.${startPrice.toLocaleString()}` : 'TBA'}
          </p>
        </div>
        <button
          onClick={onCheckout}
          className="flex items-center gap-2 px-6 py-3 font-bold text-sm uppercase tracking-wider text-white active:scale-95"
          style={{ background: `linear-gradient(135deg,${primary},${secondary})` }}
        >
          Buy Now <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Section heading — horizontal stripe with label
   punched out; unique to T3
───────────────────────────────────────────────── */
function Stripe({
  label, primary, secondary, textColor,
}: {
  label: string; primary: string; secondary: string; textColor: string;
}) {
  return (
    <div className="flex items-center gap-0 overflow-hidden">
      {/* Colour block */}
      <div
        className="shrink-0 px-4 py-3 mr-5"
        style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
      >
        <span className="text-xs font-black uppercase tracking-[0.18em] text-white whitespace-nowrap">
          {label}
        </span>
      </div>
      {/* Rule */}
      <div
        className="flex-1 h-px"
        style={{ background: `linear-gradient(to right, ${primary}50, transparent)` }}
      />
    </div>
  );
}