'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { publicService } from '@/api/publicService';
import { EventTemplateData, TabName } from '@/types/template.types';
import { Sponsor } from '@/types/sponsor.types';
import {
  Calendar, MapPin, Clock, Ticket, Users, Mail, Phone, Loader2, Zap,
  Globe, MessageCircle, Share2, ChevronRight, ExternalLink, ArrowUpRight,
  LayoutGrid, Star,
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter } from 'react-icons/fa6';

interface Template2Props {
  data: EventTemplateData & { sponsors?: Sponsor[] };
  onCheckout: () => void;
}

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

const TAB_LABELS: Record<TabName, string> = {
  overview: 'Overview',
  schedule: 'Schedule',
  tickets: 'Tickets',
  location: 'Location',
  contact: 'Contact',
  social: 'Social',
  sponsors: 'Sponsors',
  recover: 'Recover Tickets',
};

export default function Template2({ data, onCheckout }: Template2Props) {
  const HEADER_HEIGHT = 64;

  const bg = data.backgroundColor || '#f7f3ee';
  const primary = data.primaryColor || '#1a1a2e';
  const accent = data.secondaryColor || '#e63946';

  // Derived readable text colour from bg
  const getTextColor = (hex: string): string => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substr(0, 2), 16);
    const g = parseInt(h.substr(2, 2), 16);
    const b = parseInt(h.substr(4, 2), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? '#111111' : '#f5f5f5';
  };
  const textColor = getTextColor(bg);
  const isLightBg = textColor === '#111111';
  const surfaceColor = isLightBg ? `${primary}07` : `${primary}22`;
  const borderColor = isLightBg ? `${primary}18` : `${primary}45`;
  const mutedColor = isLightBg ? `${primary}75` : `${primary}95`;

  const fontFamily = FONT_MAP[data.fontStyle || 'playfair'];
  const fontLink = FONT_LINKS[data.fontStyle || 'playfair'];

  const fmt = (dt: string) =>
    new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(dt));
  const fmtShort = (dt: string) =>
    new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dt));
  const fmtTime = (dt: string) =>
    new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(dt));

  const enabledTabs = (data.enabledTabs?.length
    ? data.enabledTabs
    : ['overview', 'schedule', 'tickets', 'location', 'contact', 'social', 'recover']) as TabName[];

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

  const [activeTab, setActiveTab] = useState<TabName>('overview');
  const [scrolled, setScrolled] = useState(false);
  const sectionRefs = useRef<Record<TabName, HTMLElement | null>>({} as Record<TabName, HTMLElement | null>);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id as TabName;
          if (enabledTabs.includes(id)) setActiveTab(id);
        }
      }),
      { threshold: 0.2, rootMargin: `-${HEADER_HEIGHT + 16}px 0px 0px 0px` }
    );
    Object.values(sectionRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [enabledTabs]);

  const scrollTo = (tab: TabName) => {
    const el = sectionRefs.current[tab];
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); setActiveTab(tab); }
  };

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
    <div style={{ fontFamily, background: bg, color: textColor }} className="min-h-screen overflow-x-hidden pb-24 sm:pb-0">
      {fontLink && <link rel="stylesheet" href={fontLink} />}

      {/* ══════════════════════════════════════════
          FIXED HEADER
      ══════════════════════════════════════════ */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300"
        style={{
          background: scrolled ? `${bg}f2` : `${bg}`,
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: `1px solid ${scrolled ? borderColor : borderColor}`,
          boxShadow: scrolled ? `0 2px 20px ${primary}10` : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-10 h-full flex items-center justify-between gap-4">

          {/* Left: dot + name */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: accent }} />
            <span className="text-xs font-black uppercase tracking-[0.2em] truncate max-w-[200px]" style={{ color: primary }}>
              {data.title}
            </span>
          </div>

          {/* Center: nav tabs */}
          <nav className="flex items-center gap-0 overflow-x-auto no-scrollbar">
            {enabledTabs.map(tab => (
              <button
                key={tab}
                onClick={() => scrollTo(tab)}
                className="relative px-3 sm:px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] whitespace-nowrap transition-all duration-200 shrink-0"
                style={{ color: activeTab === tab ? accent : mutedColor }}
              >
                {TAB_LABELS[tab]}
                {activeTab === tab && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                    style={{ background: accent }}
                  />
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          HERO — starts after fixed header (pt-16)
      ══════════════════════════════════════════ */}
      <div className="pt-16">
        <section className="relative grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-64px)]">

          {/* LEFT — Image panel */}
          <div className="relative order-1 overflow-hidden min-h-[50vw] lg:min-h-full" style={{ minHeight: '400px' }}>
            <img
              src={data.imageUrl}
              alt={data.title}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Cinematic overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${primary}cc 0%, ${primary}44 45%, transparent 75%)`,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top, ${primary}ee 0%, transparent 50%)`,
              }}
            />

            {/* Tags pinned top-left */}
            <div className="absolute top-6 left-6 flex flex-wrap gap-2">
              {data.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                  style={{
                    background: i === 0 ? accent : `${bg}dd`,
                    color: i === 0 ? '#fff' : primary,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Venue badge pinned bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 p-5 sm:p-7"
              style={{ background: `linear-gradient(to top, ${primary}f5 60%, transparent)` }}
            >
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 mb-1">Venue</p>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accent }} />
                <p className="text-sm font-bold text-white leading-snug">{locationStr}</p>
              </div>
            </div>
          </div>

          {/* RIGHT — Text panel */}
          <div
            className="relative order-2 flex flex-col justify-center px-8 sm:px-14 lg:px-16 py-14 lg:py-20"
            style={{ background: bg }}
          >
            {/* Organiser eyebrow */}
            <div className="flex items-center gap-3 mb-7">
              <div className="h-0.5 w-10" style={{ background: accent }} />
              <span className="text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: mutedColor }}>
                By {data.organizerName}
              </span>
            </div>

            {/* Title */}
            <h1
              className="font-black leading-[0.9] tracking-tight mb-6"
              style={{
                color: primary,
                fontSize: 'clamp(2.8rem, 6.5vw, 5.5rem)',
              }}
            >
              {data.title}
            </h1>

            {/* Date row */}
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="w-4 h-4 shrink-0" style={{ color: accent }} />
              <p className="text-sm font-semibold" style={{ color: primary }}>
                {fmt(data.startDatetime)}
              </p>
            </div>

            {/* Countdown */}
            {upcoming && (
              <div className="mb-10">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-3" style={{ color: mutedColor }}>
                  Event Starts In
                </p>
                <div className="grid grid-cols-4 divide-x" style={{ borderColor, border: `1.5px solid ${borderColor}` }}>
                  {[
                    { v: diffDays, l: 'Days' },
                    { v: diffHrs, l: 'Hrs' },
                    { v: diffMin, l: 'Min' },
                    { v: diffSec, l: 'Sec' },
                  ].map(({ v, l }, i) => (
                    <div key={l} className="py-4 text-center" style={{ borderColor }}>
                      <span
                        className="block text-3xl sm:text-4xl font-black tabular-nums"
                        style={{ color: i === 0 ? accent : primary }}
                      >
                        {String(v).padStart(2, '0')}
                      </span>
                      <span className="block text-[9px] font-bold uppercase tracking-[0.18em] mt-1" style={{ color: mutedColor }}>
                        {l}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA row */}
            <div className="flex flex-wrap items-center gap-5">
              <button
                onClick={onCheckout}
                className="flex items-center gap-2 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] transition-all hover:opacity-85 active:scale-95"
                style={{ background: primary, color: bg }}
              >
                Register Now <ArrowUpRight className="w-4 h-4" />
              </button>
              {startPrice !== null && (
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: mutedColor }}>
                    Starting from
                  </p>
                  <p className="text-2xl font-black tabular-nums" style={{ color: accent }}>
                    Rs.{startPrice.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ══════════════════════════════════════════
          MAIN CONTENT SECTIONS
      ══════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-5 sm:px-10 pt-20 pb-28 space-y-28">

        {/* ── OVERVIEW ── */}
        {enabledTabs.includes('overview') && (
          <section
            id="overview"
            ref={el => { sectionRefs.current['overview'] = el; }}
            style={{ scrollMarginTop: HEADER_HEIGHT + 20 + 'px' }}
          >
            <SectionHeading label="Overview" number="01" accent={accent} primary={primary} mutedColor={mutedColor} bg={bg} />

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 lg:gap-16">
              {/* Description */}
              <div>
                <p
                  className="text-lg sm:text-xl leading-relaxed italic pl-7"
                  style={{ borderLeft: `4px solid ${accent}`, color: primary }}
                >
                  {data.description}
                </p>
              </div>

              {/* Quick-facts panel */}
              <div className="divide-y overflow-hidden" style={{ border: `1.5px solid ${borderColor}` }}>
                {[
                  { icon: <Calendar className="w-4 h-4" />, label: 'Date', val: fmtShort(data.startDatetime) },
                  { icon: <Clock className="w-4 h-4" />, label: 'Time', val: `${fmtTime(data.startDatetime)} – ${fmtTime(data.endDatetime)}` },
                  { icon: <MapPin className="w-4 h-4" />, label: 'Venue', val: data.venueName },
                  { icon: <Users className="w-4 h-4" />, label: 'Organiser', val: data.organizerName },
                ].map(({ icon, label, val }, i) => (
                  <div
                    key={label}
                    className="flex items-start gap-4 px-6 py-4"
                    style={{ background: i % 2 === 0 ? surfaceColor : 'transparent', borderColor }}
                  >
                    <span className="mt-0.5 shrink-0" style={{ color: accent }}>{icon}</span>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] mb-0.5" style={{ color: mutedColor }}>{label}</p>
                      <p className="text-sm font-bold leading-snug" style={{ color: primary }}>{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── SCHEDULE ── */}
        {enabledTabs.includes('schedule') && (
          <section
            id="schedule"
            ref={el => { sectionRefs.current['schedule'] = el; }}
            style={{ scrollMarginTop: HEADER_HEIGHT + 20 + 'px' }}
          >
            <SectionHeading label="Schedule" number="02" accent={accent} primary={primary} mutedColor={mutedColor} bg={bg} />

            <div className="mt-12 divide-y overflow-hidden" style={{ border: `1.5px solid ${borderColor}`, borderColor }}>
              {data.agenda.length === 0 ? (
                <div className="px-8 py-12 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-3 opacity-25" style={{ color: primary }} />
                  <p className="text-sm italic" style={{ color: mutedColor }}>No schedule published yet.</p>
                </div>
              ) : (
                data.agenda.map((item, idx) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 sm:grid-cols-[120px_1fr] transition-colors"
                    style={{ background: idx % 2 === 0 ? surfaceColor : bg, borderColor }}
                  >
                    {/* Time strip */}
                    <div
                      className="flex sm:flex-col items-center sm:items-center justify-between sm:justify-center gap-1 px-5 py-4 sm:py-6 border-b sm:border-b-0 sm:border-r"
                      style={{ borderColor, background: idx === 0 ? `${accent}12` : 'transparent' }}
                    >
                      <span className="text-xs font-black tabular-nums" style={{ color: accent }}>
                        {fmtTime(item.startTime)}
                      </span>
                      <span className="hidden sm:block w-4 h-px my-1.5" style={{ background: borderColor }} />
                      <span className="text-[10px] tabular-nums" style={{ color: mutedColor }}>
                        {fmtTime(item.endTime)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex items-start gap-5 px-6 py-5">
                      {item.imageUrl ? (
                        <div
                          className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden border"
                          style={{ borderColor }}
                        >
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div
                          className="shrink-0 w-10 h-10 flex items-center justify-center text-xs font-black border"
                          style={{ borderColor, color: accent, background: `${accent}12` }}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black uppercase tracking-tight text-sm sm:text-base leading-snug mb-1" style={{ color: primary }}>
                          {item.title}
                        </h4>
                        {item.roomOrLocation && (
                          <p className="text-xs flex items-center gap-1 mb-2" style={{ color: mutedColor }}>
                            <MapPin className="w-3 h-3 shrink-0" />{item.roomOrLocation}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-sm leading-relaxed" style={{ color: mutedColor }}>{item.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* ── TICKETS ── */}
        {enabledTabs.includes('tickets') && (
          <section
            id="tickets"
            ref={el => { sectionRefs.current['tickets'] = el; }}
            style={{ scrollMarginTop: HEADER_HEIGHT + 20 + 'px' }}
          >
            <SectionHeading label="Tickets" number="03" accent={accent} primary={primary} mutedColor={mutedColor} bg={bg} />

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.tickets.length === 0 ? (
                <div className="col-span-full flex flex-col items-center py-14" style={{ border: `1.5px solid ${borderColor}` }}>
                  <Ticket className="w-8 h-8 mb-3 opacity-20" style={{ color: primary }} />
                  <p className="text-sm italic" style={{ color: mutedColor }}>No tickets available yet.</p>
                </div>
              ) : (
                data.tickets.map((ticket, idx) => (
                  <div
                    key={ticket.id}
                    className={`relative flex flex-col p-7 transition-all duration-200 ${ticket.soldOut ? 'opacity-50' : 'hover:-translate-y-1.5 hover:shadow-lg'}`}
                    style={{
                      border: `2px solid ${idx === 0 ? primary : borderColor}`,
                      background: idx === 0 ? `${primary}07` : bg,
                      boxShadow: idx === 0 ? `0 4px 24px ${primary}12` : 'none',
                    }}
                  >
                    {/* Featured badge */}
                    {idx === 0 && !ticket.soldOut && (
                      <div
                        className="absolute -top-3 left-6 px-3 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5"
                        style={{ background: accent, color: '#fff' }}
                      >
                        <Star className="w-2.5 h-2.5 fill-current" /> Featured
                      </div>
                    )}

                    {/* Ticket icon */}
                    <div className="p-3 self-start mb-5" style={{ background: `${accent}14`, color: accent }}>
                      <Ticket className="w-5 h-5" />
                    </div>

                    {/* Number + Name */}
                    <p className="text-[9px] font-black uppercase tracking-[0.28em] mb-1" style={{ color: mutedColor }}>
                      Tier {String(idx + 1).padStart(2, '0')}
                    </p>
                    <h3 className="font-black uppercase tracking-tight text-lg leading-snug mb-auto" style={{ color: primary }}>
                      {ticket.tierName}
                    </h3>

                    {/* Price */}
                    <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${borderColor}` }}>
                      {ticket.soldOut ? (
                        <p className="font-black text-base" style={{ color: accent }}>Sold Out</p>
                      ) : (
                        <p className="text-3xl font-black tabular-nums" style={{ color: idx === 0 ? primary : accent }}>
                          Rs.{ticket.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {data.tickets.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <button
                  onClick={onCheckout}
                  className="flex items-center gap-2 px-8 py-4 font-black text-sm uppercase tracking-[0.12em] transition-all hover:opacity-85 active:scale-95"
                  style={{ background: accent, color: '#fff' }}
                >
                  Buy Tickets <ArrowUpRight className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2" style={{ color: mutedColor }}>
                  <Zap className="w-4 h-4" />
                  <p className="text-xs font-semibold">Supports JazzCash · EasyPaisa</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── LOCATION ── */}
        {enabledTabs.includes('location') && (
          <section
            id="location"
            ref={el => { sectionRefs.current['location'] = el; }}
            style={{ scrollMarginTop: HEADER_HEIGHT + 20 + 'px' }}
          >
            <SectionHeading label="Location" number="04" accent={accent} primary={primary} mutedColor={mutedColor} bg={bg} />

            <div className="mt-12 overflow-hidden" style={{ border: `2px solid ${primary}` }}>
              <iframe
                src={`https://maps.google.com/maps?q=${mapQ}&output=embed&z=15`}
                width="100%"
                height="400"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Event Location"
              />
              <div
                className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-4 px-7 py-5"
                style={{ background: surfaceColor, borderTop: `1px solid ${borderColor}` }}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accent }} />
                  <p className="text-sm font-bold leading-snug" style={{ color: primary }}>{locationStr}</p>
                </div>
                <a
                  href={`https://maps.google.com/maps?q=${mapQ}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] whitespace-nowrap transition-opacity hover:opacity-70"
                  style={{ color: accent }}
                >
                  Open Maps <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </section>
        )}

        {/* ── CONTACT ── */}
        {enabledTabs.includes('contact') && (
          <section
            id="contact"
            ref={el => { sectionRefs.current['contact'] = el; }}
            style={{ scrollMarginTop: HEADER_HEIGHT + 20 + 'px' }}
          >
            <SectionHeading label="Contact" number="05" accent={accent} primary={primary} mutedColor={mutedColor} bg={bg} />

            <div className="mt-12 divide-y overflow-hidden" style={{ border: `1.5px solid ${borderColor}`, borderColor }}>
              {[
                { icon: <Users className="w-5 h-5" />, label: 'Organiser', value: data.organizerName, href: undefined },
                { icon: <Mail className="w-5 h-5" />, label: 'Email', value: data.organizerEmail, href: data.organizerEmail ? `mailto:${data.organizerEmail}` : undefined },
                { icon: <Phone className="w-5 h-5" />, label: 'Phone', value: data.organizerPhone, href: data.organizerPhone ? `tel:${data.organizerPhone}` : undefined },
              ].filter(c => c.value).map((c, i) => (
                <div
                  key={c.label}
                  className="grid grid-cols-1 sm:grid-cols-[200px_1fr]"
                  style={{ borderColor }}
                >
                  <div
                    className="flex items-center gap-3 px-6 py-4 sm:border-r"
                    style={{ background: surfaceColor, borderColor }}
                  >
                    <span style={{ color: accent }}>{c.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: mutedColor }}>
                      {c.label}
                    </span>
                  </div>
                  <div className="flex items-center px-6 py-4">
                    {c.href ? (
                      <a href={c.href} className="font-bold text-sm hover:underline" style={{ color: accent }}>
                        {c.value}
                      </a>
                    ) : (
                      <p className="font-bold text-sm" style={{ color: primary }}>{c.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SOCIAL ── */}
        {enabledTabs.includes('social') && (
          <section
            id="social"
            ref={el => { sectionRefs.current['social'] = el; }}
            style={{ scrollMarginTop: HEADER_HEIGHT + 20 + 'px' }}
          >
            <SectionHeading label="Social & Share" number="06" accent={accent} primary={primary} mutedColor={mutedColor} bg={bg} />

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
              {socialItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {socialItems.map(([key, url]) => (
                    <a
                      key={key}
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-5 group transition-all hover:translate-x-1"
                      style={{ border: `1.5px solid ${borderColor}`, background: surfaceColor }}
                    >
                      <div className="flex items-center gap-4">
                        <span style={{ color: primary }}>{SOCIAL_ICONS[key]}</span>
                        <span className="font-bold text-sm" style={{ color: primary }}>{SOCIAL_LABELS[key]}</span>
                      </div>
                      <ArrowUpRight
                        className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        style={{ color: accent }}
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic" style={{ color: mutedColor }}>No social links added.</p>
              )}

              {/* Share card */}
              <div className="p-7" style={{ border: `2px solid ${primary}`, background: `${primary}05` }}>
                <div className="flex items-center gap-3 mb-4">
                  <Share2 className="w-4 h-4" style={{ color: accent }} />
                  <p className="font-black text-sm uppercase tracking-tight" style={{ color: primary }}>
                    Share This Event
                  </p>
                </div>
                <p className="text-xs break-all mb-5" style={{ color: mutedColor, fontFamily: 'monospace' }}>
                  {typeof window !== 'undefined' ? window.location.href : '—'}
                </p>
                <button
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  className="w-full py-3 text-xs font-black uppercase tracking-[0.15em] transition-opacity hover:opacity-80"
                  style={{ background: primary, color: bg }}
                >
                  Copy Link
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── SPONSORS ── */}
        {enabledTabs.includes('sponsors') && (
          <section
            id="sponsors"
            ref={el => { sectionRefs.current['sponsors'] = el; }}
            style={{ scrollMarginTop: HEADER_HEIGHT + 20 + 'px' }}
          >
            <SectionHeading label="Sponsors" number="07" accent={accent} primary={primary} mutedColor={mutedColor} bg={bg} />

            {!data.sponsors || data.sponsors.length === 0 ? (
              <div className="mt-12 flex flex-col items-center py-16" style={{ border: `1.5px solid ${borderColor}` }}>
                <Star className="w-8 h-8 mb-3 opacity-20" style={{ color: primary }} />
                <p className="text-sm italic" style={{ color: mutedColor }}>No sponsors listed yet.</p>
              </div>
            ) : (
              <div
                className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px"
                style={{ background: borderColor }}
              >
                {data.sponsors.map((sponsor, index) => {
                  const tierLabel =
                    sponsor.sponsorTier === 'PLATINUM' ? 'Platinum' :
                      sponsor.sponsorTier === 'GOLD' ? 'Gold' :
                        sponsor.sponsorTier === 'SILVER' ? 'Silver' : 'Bronze';
                  return (
                    <div
                      key={sponsor.id || index}
                      className="flex flex-col items-center justify-center gap-4 p-8 group transition-colors hover:brightness-95"
                      style={{ background: bg }}
                    >
                      {sponsor.logoUrl && (
                        <div className="w-20 h-20 flex items-center justify-center">
                          <img
                            src={sponsor.logoUrl}
                            alt={sponsor.name}
                            className="w-full h-full object-contain opacity-75 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                      )}
                      <div className="text-center">
                        <p className="font-black text-sm uppercase tracking-tight" style={{ color: primary }}>
                          {sponsor.name}
                        </p>
                        <span
                          className="mt-2 inline-block text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-0.5"
                          style={{ background: `${accent}14`, color: accent, border: `1px solid ${accent}35` }}
                        >
                          {tierLabel}
                        </span>
                      </div>
                      {sponsor.websiteUrl && (
                        <a
                          href={sponsor.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold transition-opacity hover:opacity-60"
                          style={{ color: primary }}
                        >
                          Visit site <ExternalLink className="w-3 h-3" />
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
            style={{ scrollMarginTop: HEADER_HEIGHT + 20 + 'px' }}
          >
            <SectionHeading label="Recover Tickets" number="08" accent={accent} primary={primary} mutedColor={mutedColor} bg={bg} />

            <div className="mt-12 max-w-2xl">
              <p className="text-sm leading-relaxed mb-6" style={{ color: mutedColor }}>
                Enter the email address you used to purchase tickets. We'll send you a link to recover your tickets.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label htmlFor="recovery-email-template2" className="block text-[9px] font-black uppercase tracking-[0.22em] mb-1.5" style={{ color: mutedColor }}>
                    Email Address
                  </label>
                  <input
                    id="recovery-email"
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border bg-transparent text-sm outline-none transition-all focus:outline-2 focus:outline-offset-0"
                    style={{
                      borderColor: `${primary}40`,
                      color: textColor,
                      outlineColor: primary,
                    }}
                  />
                </div>
                <button
                  onClick={handleRecoverTickets}
                  disabled={recovering}
                  className="shrink-0 px-6 py-3 text-sm font-black uppercase tracking-[0.12em] transition-all hover:opacity-85 disabled:opacity-50 flex items-center gap-2"
                  style={{ background: accent, color: '#fff' }}
                >
                  {recovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  {recovering ? 'Sending...' : 'Recover'}
                </button>
              </div>

              {recoveryMessage && (
                <div
                  className="mt-4 p-4 border text-sm"
                  style={{
                    borderColor: recoveryMessage.type === 'success' ? accent : '#ef4444',
                    background: recoveryMessage.type === 'success' ? `${accent}08` : 'rgba(239,68,68,0.06)',
                    color: recoveryMessage.type === 'success' ? accent : '#ef4444',
                  }}
                >
                  {recoveryMessage.text}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer style={{ background: primary }}>
        {/* Accent top border */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}44, transparent)` }} />

        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 items-center">

            {/* Left: event snapshot */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">
                {fmtShort(data.startDatetime)} · {data.venueName}
              </p>
              <h3 className="font-black text-xl uppercase leading-tight text-white mb-3">{data.title}</h3>
              <div className="flex flex-wrap gap-2">
                {data.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/50" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
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
                width={200}
                height={52}
                className="h-12 w-auto brightness-0 invert opacity-60 hover:opacity-100 transition-opacity"
              />
              <div className="flex items-center gap-3">
                <div className="h-px w-8" style={{ background: `${accent}60` }} />
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                <div className="h-px w-8" style={{ background: `${accent}60` }} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                Powered by Eventsphere
              </p>
            </div>

            {/* Right: actions */}
            <div className="flex flex-col items-start sm:items-end gap-4">
              <a
                href="/explore"
                className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-white/50 hover:text-white transition-colors"
              >
                <LayoutGrid className="w-4 h-4" />
                More Events
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════
          MOBILE STICKY FOOTER
      ══════════════════════════════════════════ */}
      <div
        className="fixed bottom-0 left-0 w-full sm:hidden z-50 flex items-center justify-between px-5 py-4"
        style={{ background: primary, borderTop: `3px solid ${accent}` }}
      >
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-0.5">Entry from</p>
          <p className="text-xl font-black text-white">
            {startPrice !== null ? `Rs.${startPrice.toLocaleString()}` : 'TBA'}
          </p>
        </div>
        <button
          onClick={onCheckout}
          className="flex items-center gap-2 py-3 px-6 text-sm font-black uppercase tracking-[0.12em] active:scale-95"
          style={{ background: accent, color: '#fff' }}
        >
          Buy Now <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Section Heading Component — elegant numbered rule
───────────────────────────────────────────────── */
function SectionHeading({
  label, number, accent, primary, mutedColor, bg,
}: {
  label: string; number: string;
  accent: string; primary: string; mutedColor: string; bg: string;
}) {
  return (
    <div className="flex items-end gap-5">
      {/* Number badge */}
      <div
        className="flex-none flex items-center justify-center w-11 h-11 text-sm font-black mb-1"
        style={{ background: accent, color: '#fff' }}
      >
        {number}
      </div>

      {/* Big label */}
      <div className="flex-1 min-w-0">
        <h2
          className="font-black uppercase leading-none tracking-tighter"
          style={{
            color: primary,
            fontSize: 'clamp(2.2rem, 5vw, 4rem)',
          }}
        >
          {label}
        </h2>
        {/* Gradient rule below */}
        <div
          className="h-0.5 mt-3"
          style={{ background: `linear-gradient(to right, ${accent}, ${accent}40, transparent)` }}
        />
      </div>
    </div>
  );
}