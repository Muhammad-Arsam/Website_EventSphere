'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { EventTemplateData, TabName } from '@/types/template.types';
import { publicService } from '@/api/publicService';
import { Sponsor } from '@/types/sponsor.types';
import {
  Calendar, MapPin, Clock, Ticket, Users, Mail, Phone, CheckCircle, Shield, Loader2, FileText,
  Globe, MessageCircle, Share2, ChevronRight, ExternalLink, Zap, LayoutGrid, Terminal, Star,
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter } from 'react-icons/fa6';

interface Template1Props {
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
  'dm-sans': 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap',
  'playfair': 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&display=swap',
  'space-grotesk': 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap',
  'cabinet-grotesk': 'https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&display=swap',
  'syne': 'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap',
};
const TAB_LABELS: Record<TabName, string> = {
  overview: 'Overview', schedule: 'Schedule', tickets: 'Tickets',
  location: 'Location', contact: 'Contact', social: 'Social', sponsors: 'Sponsors',
  recover: 'Recover Tickets',
};
const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  PLATINUM: { bg: 'rgba(229,231,235,0.12)', text: '#e5e7eb', border: '#e5e7eb' },
  GOLD: { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', border: '#fbbf24' },
  SILVER: { bg: 'rgba(156,163,175,0.12)', text: '#9ca3af', border: '#9ca3af' },
  BRONZE: { bg: 'rgba(205,127,50,0.12)', text: '#cd7f32', border: '#cd7f32' },
};

export default function Template1({ data, onCheckout }: Template1Props) {
  const HEADER_HEIGHT = 64;

  const bgColor = data.backgroundColor || '#030712';
  const primary = data.primaryColor || '#00fff7';
  const secondary = data.secondaryColor || '#ff00c8';

  const getTextColor = (bg: string) => {
    const hex = bg.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16), g = parseInt(hex.substr(2, 2), 16), b = parseInt(hex.substr(4, 2), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? '#1a1a1a' : '#f0f0f0';
  };
  const textColor = getTextColor(bgColor);
  const mutedText = textColor === '#f0f0f0' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';

  const fontFamily = FONT_MAP[data.fontStyle || 'syne'];
  const fontLink = FONT_LINKS[data.fontStyle || 'syne'];

  const fmt = (dt: string) =>
    new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(dt));
  const fmtTime = (dt: string) =>
    new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(dt));
  const fmtShort = (dt: string) =>
    new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dt));

  const enabledTabs = (data.enabledTabs?.length
    ? data.enabledTabs
    : ['overview', 'schedule', 'tickets', 'location', 'contact', 'social', 'recover']) as TabName[];

  const availTickets = data.tickets.filter(t => !t.soldOut);
  const startPrice = availTickets.length > 0 ? Math.min(...availTickets.map(t => t.price)) : null;
  const locationDisplay = `${data.venueName}, ${data.formattedAddress}`;
  const mapQuery = encodeURIComponent(locationDisplay);
  const socialEntries = Object.entries(data.socialLinks || {}).filter(([, v]) => v);

  const eventMs = new Date(data.startDatetime).getTime() - Date.now();
  const diffDays = Math.max(0, Math.floor(eventMs / 86400000));
  const diffHrs = Math.max(0, Math.floor((eventMs % 86400000) / 3600000));
  const diffMins = Math.max(0, Math.floor((eventMs % 3600000) / 60000));
  const diffSecs = Math.max(0, Math.floor((eventMs % 60000) / 1000));
  const isUpcoming = eventMs > 0;

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

  const sectionRefs = useRef<Record<TabName, HTMLElement | null>>({} as Record<TabName, HTMLElement | null>);
  const [activeTab, setActiveTab] = useState<TabName>('overview');
  const [tick, setTick] = useState(0);

  // Re-render every second for live countdown
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id as TabName;
          if (enabledTabs.includes(id)) setActiveTab(id);
        }
      }),
      { threshold: 0.25, rootMargin: `-${HEADER_HEIGHT + 8}px 0px 0px 0px` }
    );
    Object.values(sectionRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [enabledTabs]);

  const scrollTo = (tab: TabName) => {
    const el = sectionRefs.current[tab];
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); setActiveTab(tab); }
  };

  // Core style helpers
  const glowBorder = (color: string) => ({
    border: `1px solid ${color}35`,
    boxShadow: `0 0 24px ${color}12, inset 0 0 16px ${color}06`,
  });
  const scanLines = {
    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)`,
  };

  return (
    <div style={{ fontFamily, background: bgColor, color: textColor }} className="min-h-screen overflow-x-hidden pb-24 sm:pb-0">
      {fontLink && <link rel="stylesheet" href={fontLink} />}

      {/* ── Ambient grid ── */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(${primary}07 1px, transparent 1px), linear-gradient(90deg, ${primary}07 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
        }}
      />
      {/* Corner accent glows */}
      <div className="fixed top-0 left-0 w-96 h-96 pointer-events-none z-0 opacity-20"
        style={{ background: `radial-gradient(circle, ${primary}40 0%, transparent 70%)` }} />
      <div className="fixed bottom-0 right-0 w-96 h-96 pointer-events-none z-0 opacity-15"
        style={{ background: `radial-gradient(circle, ${secondary}40 0%, transparent 70%)` }} />

      {/* ══════════════════════════════════════════
          FIXED HEADER — pill nav
      ══════════════════════════════════════════ */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-16 border-b backdrop-blur-xl"
        style={{ background: `${bgColor}d0`, borderColor: `${primary}28` }}
      >
        {/* Animated gradient scan line at very top */}
        <div
          className="absolute top-0 inset-x-0 h-0.5 animate-pulse"
          style={{ background: `linear-gradient(90deg, transparent, ${primary}, ${secondary}, transparent)` }}
        />

        {/* Subtle moving grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(${primary}15 1px, transparent 1px), linear-gradient(90deg, ${primary}15 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-12 h-full flex items-center justify-between gap-4">

          {/* ── Logo mark ── */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0 group">
            {/* Pulsing bracket */}
            <div className="relative flex items-center justify-center w-7 h-7 border"
              style={{ borderColor: `${primary}50`, background: `${primary}10` }}
            >
              <span className="absolute inset-0 animate-ping rounded-none opacity-20"
                style={{ background: primary, animationDuration: '2.5s' }} />
              <Terminal className="w-3.5 h-3.5 relative z-10" style={{ color: primary }} />
            </div>
            <div className="flex flex-col">
              <span
                className="text-[11px] font-mono uppercase tracking-[0.22em] truncate max-w-40 leading-tight transition-all group-hover:tracking-[0.28em] duration-300"
                style={{ color: primary }}
              >
                {data.title}
              </span>
              <span className="text-[8px] font-mono uppercase tracking-widest" style={{ color: mutedText }}>
                {fmtShort(data.startDatetime)}
              </span>
            </div>
          </div>

          {/* ── Pill nav ── */}
          <div
            className="flex items-center rounded-full overflow-hidden overflow-x-auto no-scrollbar border relative"
            style={{ borderColor: `${primary}28`, background: `${primary}06` }}
          >
            {/* Inner glow on the pill */}
            <div className="absolute inset-0 rounded-full pointer-events-none"
              style={{ boxShadow: `inset 0 0 20px ${primary}08` }} />

            {enabledTabs.map(tab => (
              <button
                key={tab}
                onClick={() => scrollTo(tab)}
                className="relative px-4 sm:px-5 py-2 text-[11px] font-mono uppercase tracking-widest transition-all duration-200 whitespace-nowrap shrink-0 group"
                style={{
                  background: activeTab === tab ? `${primary}22` : 'transparent',
                  color: activeTab === tab ? primary : mutedText,
                }}
              >
                {/* Active indicator — glowing bottom line */}
                {activeTab === tab && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5"
                    style={{ background: `linear-gradient(to right, transparent, ${primary}, transparent)`, boxShadow: `0 0 8px ${primary}` }}
                  />
                )}
                {/* Hover top dot */}
                <span
                  className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: secondary }}
                />
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>

          {/* ── CTA button ── */}
          <button
            onClick={onCheckout}
            className="hidden sm:flex items-center gap-2 shrink-0 relative group"
            style={{ padding: '2px' }}
          >
            {/* Animated gradient border — rotates on hover */}
            <span
              className="absolute inset-0 pointer-events-none transition-all duration-500"
              style={{
                background: `linear-gradient(135deg, ${primary}, ${secondary}, ${primary})`,
                backgroundSize: '200% 200%',
                opacity: 0.8,
                boxShadow: `0 0 0px ${primary}00`,
              }}
            />
            {/* Glow halo that expands on hover */}
            <span
              className="absolute -inset-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"
              style={{ background: `linear-gradient(135deg, ${primary}60, ${secondary}60)` }}
            />

            {/* Inner surface */}
            <span
              className="relative flex items-center gap-2 px-5 py-2.5 text-xs font-mono uppercase tracking-widest overflow-hidden transition-all duration-300 group-hover:-translate-y-0.5 group-active:scale-95"
              style={{ background: bgColor, color: primary, zIndex: 1 }}
            >
              {/* Bottom-up fill sweep */}
              <span
                className="absolute inset-0 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"
                style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
              />

              {/* Shimmer on top of fill */}
              <span
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 delay-100 pointer-events-none z-10"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }}
              />

              {/* Expanding corner brackets */}
              <span
                className="absolute top-0.5 left-0.5 w-2 h-2 border-t-2 border-l-2 transition-all duration-300 group-hover:w-full group-hover:h-full group-hover:opacity-0 z-20"
                style={{ borderColor: primary }}
              />
              <span
                className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b-2 border-r-2 transition-all duration-300 group-hover:w-full group-hover:h-full group-hover:opacity-0 z-20"
                style={{ borderColor: secondary }}
              />

              {/* Scan line on hover */}
              <span
                className="absolute inset-x-0 h-px opacity-0 group-hover:opacity-40 transition-opacity duration-300 z-20"
                style={{ top: '50%', background: `linear-gradient(to right, transparent, #000, transparent)` }}
              />

              {/* Icon */}
              <Zap
                className="w-3.5 h-3.5 relative z-30 transition-all duration-300 group-hover:rotate-12 group-hover:scale-125"
                style={{ color: 'inherit' }}
              />

              {/* Label */}
              <span className="relative z-30 group-hover:text-black transition-colors duration-300 group-hover:tracking-[0.2em]">
                Get Access
              </span>
            </span>
          </button>

        </div>

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 inset-x-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${primary}50, ${secondary}50, transparent)` }}
        />
      </header>

      {/* ══════════════════════════════════════════
          HERO — full-screen cinematic
      ══════════════════════════════════════════ */}
      <div className="pt-16 relative">
        <div className="relative min-h-[calc(100vh-64px)] flex flex-col justify-end overflow-hidden">

          {/* ── Background image ── */}
          <div className="absolute inset-0">
            <img
              src={data.imageUrl}
              alt={data.title}
              className="w-full h-full object-cover object-center opacity-65"
            />

            {/* Vignette — softer edges */}
            <div className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)' }} />

            {/* Left-side dark fade so text is readable */}
            <div className="absolute inset-0"
              style={{ background: `linear-gradient(to right, ${bgColor}cc 0%, ${bgColor}55 40%, transparent 70%)` }} />

            {/* Bottom fade to page bg */}
            <div className="absolute inset-0"
              style={{ background: `linear-gradient(to bottom, transparent 0%, ${bgColor}20 55%, ${bgColor}e0 82%, ${bgColor} 100%)` }} />

            {/* Colour wash — much lighter so image shows through clearly */}
            <div className="absolute inset-0" style={{
              background: `radial-gradient(ellipse at 15% 15%, ${primary}18 0%, transparent 40%),
                 radial-gradient(ellipse at 85% 85%, ${secondary}12 0%, transparent 40%)`,
            }} />

            {/* Scan-lines — very subtle */}
            <div style={scanLines} className="absolute inset-0 opacity-[0.06] pointer-events-none" />

            {/* Animated vertical light sweep */}
            <div
              className="absolute inset-y-0 w-px opacity-15 animate-pulse pointer-events-none"
              style={{ left: '65%', background: `linear-gradient(to bottom, transparent, ${primary}, transparent)`, animationDuration: '4s' }}
            />
          </div>

          {/* ── Top-right floating event date badge ── */}
          <div className="absolute top-6 right-6 z-20 hidden sm:flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 px-3 py-1.5 border backdrop-blur-sm"
              style={{ borderColor: `${primary}40`, background: `${bgColor}80` }}>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: primary }} />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: primary }} />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: primary }}>
                {isUpcoming ? 'Upcoming' : 'Live Now'}
              </span>
            </div>
            <span className="text-[9px] font-mono uppercase tracking-widest px-1" style={{ color: mutedText }}>
              {fmtShort(data.startDatetime)}
            </span>
          </div>

          {/* ── Hero content ── */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pb-14 w-full">

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {data.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs font-mono uppercase tracking-widest border backdrop-blur-sm"
                  style={{
                    color: i % 2 === 0 ? primary : secondary,
                    borderColor: i % 2 === 0 ? `${primary}55` : `${secondary}55`,
                    background: i % 2 === 0 ? `${primary}12` : `${secondary}12`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <div className="relative mb-6">
              {/* Ghost watermark behind title */}
              <span
                className="absolute -top-4 left-0 font-black uppercase leading-none select-none pointer-events-none opacity-[0.03] tracking-tighter"
                style={{ color: primary, fontSize: 'clamp(4rem, 12vw, 11rem)' }}
                aria-hidden
              >
                {data.title}
              </span>
              <h1
                className="relative font-black uppercase leading-[0.88] tracking-tighter"
                style={{
                  color: textColor,
                  fontSize: 'clamp(3.2rem, 8.5vw, 8rem)',
                  textShadow: `3px 0 0 ${primary}55, -3px 0 0 ${secondary}45, 0 0 80px ${primary}20`,
                }}
              >
                {data.title}
              </h1>
              {/* Underline sweep */}
              <div className="mt-3 h-0.5 w-32"
                style={{ background: `linear-gradient(to right, ${primary}, ${secondary}60, transparent)` }} />
            </div>

            {/* Organiser + date row */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border flex items-center justify-center shrink-0"
                  style={{ borderColor: `${primary}50`, background: `${primary}12` }}>
                  <Terminal className="w-3 h-3" style={{ color: primary }} />
                </div>
                <span className="text-xs font-mono uppercase tracking-widest" style={{ color: mutedText }}>
                  {data.organizerName}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="h-px w-8" style={{ background: `linear-gradient(to right, ${primary}60, transparent)` }} />
                <div className="w-1 h-1" style={{ background: primary }} />
                <div className="h-px w-8" style={{ background: `linear-gradient(to left, ${secondary}60, transparent)` }} />
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: secondary }} />
                <span className="text-xs font-mono" style={{ color: mutedText }}>
                  {fmt(data.startDatetime)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
                <span className="text-xs font-mono" style={{ color: mutedText }}>
                  {fmtTime(data.startDatetime)}
                </span>
              </div>
            </div>

            {/* Countdown */}
            {isUpcoming && (
              <div className="space-y-3">
                <p className="text-[9px] font-mono uppercase tracking-[0.3em] flex items-center gap-2" style={{ color: mutedText }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: secondary }} />
                  Event starts in
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { v: diffDays, l: 'DAYS', color: primary },
                    { v: diffHrs, l: 'HRS', color: secondary },
                    { v: diffMins, l: 'MIN', color: primary },
                    { v: diffSecs, l: 'SEC', color: secondary },
                  ].map(({ v, l, color }, i) => (
                    <div
                      key={l}
                      className="relative min-w-20 text-center py-4 px-4 group overflow-hidden"
                      style={{ border: `1px solid ${color}40`, background: `${color}08` }}
                    >
                      {/* Corner pip top-left */}
                      <span className="absolute top-1 left-1 w-1.5 h-1.5" style={{ background: color }} />
                      {/* Corner pip bottom-right */}
                      <span className="absolute bottom-1 right-1 w-1 h-1" style={{ background: `${color}80` }} />
                      {/* Hover glow */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{ background: `radial-gradient(ellipse at 50% 100%, ${color}20 0%, transparent 70%)` }} />
                      {/* Top accent line */}
                      <div className="absolute top-0 inset-x-0 h-0.5"
                        style={{ background: `linear-gradient(to right, transparent, ${color}80, transparent)` }} />

                      <span
                        className="block text-3xl sm:text-4xl font-black font-mono tabular-nums relative z-10"
                        style={{ color, textShadow: `0 0 20px ${color}60` }}
                      >
                        {String(v).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-mono tracking-[0.22em] mt-1 block relative z-10" style={{ color: mutedText }}>
                        {l}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-12 pt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* ── Left content column ── */}
          <div className="lg:col-span-8 space-y-16">

            {/* Quick info strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: <Calendar className="w-5 h-5" />,
                  label: 'Date & Time',
                  val: fmt(data.startDatetime),
                  sub: `${fmtTime(data.startDatetime)} — ${fmtTime(data.endDatetime)}`,
                  color: primary,
                },
                {
                  icon: <MapPin className="w-5 h-5" />,
                  label: 'Location',
                  val: data.venueName,
                  sub: data.formattedAddress,
                  color: secondary,
                },
              ].map(({ icon, label, val, sub, color }) => (
                <div
                  key={label}
                  className="relative flex flex-col gap-4 p-5 overflow-hidden group transition-all duration-300 hover:-translate-y-0.5"
                  style={glowBorder(color)}
                >
                  {/* Animated corner accent — top left */}
                  <span
                    className="absolute top-0 left-0 w-8 h-0.5 transition-all duration-500 group-hover:w-16"
                    style={{ background: color }}
                  />
                  <span
                    className="absolute top-0 left-0 w-0.5 h-8 transition-all duration-500 group-hover:h-16"
                    style={{ background: color }}
                  />
                  {/* Bottom right mirror */}
                  <span
                    className="absolute bottom-0 right-0 w-8 h-0.5 transition-all duration-500 group-hover:w-16"
                    style={{ background: color }}
                  />
                  <span
                    className="absolute bottom-0 right-0 w-0.5 h-8 transition-all duration-500 group-hover:h-16"
                    style={{ background: color }}
                  />

                  {/* Radial glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at 20% 50%, ${color}14 0%, transparent 70%)` }}
                  />

                  {/* Scan line sweep */}
                  <div
                    className="absolute inset-y-0 w-px opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none"
                    style={{ left: '50%', background: color }}
                  />

                  {/* Top row — icon + label */}
                  <div className="flex items-center gap-3 relative z-10">
                    <div
                      className="p-2.5 border shrink-0 relative overflow-hidden transition-all duration-300 group-hover:scale-110"
                      style={{ borderColor: `${color}45`, color, background: `${color}12` }}
                    >
                      {/* Icon box inner pulse */}
                      <span
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-pulse pointer-events-none"
                        style={{ background: `${color}18` }}
                      />
                      <span className="relative z-10">{icon}</span>
                    </div>
                    <div>
                      <p
                        className="text-[9px] font-mono uppercase tracking-[0.25em] mb-0.5"
                        style={{ color: `${color}90` }}
                      >
                        {label}
                      </p>
                      {/* Animated underline */}
                      <div
                        className="h-px w-0 group-hover:w-full transition-all duration-500"
                        style={{ background: `linear-gradient(to right, ${color}, transparent)` }}
                      />
                    </div>
                  </div>

                  {/* Value */}
                  <div className="relative z-10 pl-1">
                    <p
                      className="text-sm font-bold leading-snug mb-1"
                      style={{ color: textColor }}
                    >
                      {val}
                    </p>
                    <p
                      className="text-xs font-mono leading-snug"
                      style={{ color: mutedText }}
                    >
                      {sub}
                    </p>
                  </div>

                  {/* Bottom — animated data readout */}
                  <div className="relative z-10 flex items-center gap-2 overflow-hidden">
                    {/* Pulsing dot */}
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span
                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                        style={{ background: color }}
                      />
                      <span
                        className="relative inline-flex rounded-full h-1.5 w-1.5"
                        style={{ background: color }}
                      />
                    </span>

                    {/* Scrolling mono text */}
                    <div className="overflow-hidden flex-1 h-4">
                      <p
                        className="text-[9px] font-mono uppercase tracking-widest animate-marquee whitespace-nowrap"
                        style={{ color: `${color}80`, animationDuration: '10s' }}
                      >
                        {label === 'Date & Time'
                          ? `${fmt(data.startDatetime)} · ${fmtTime(data.startDatetime)} — ${fmtTime(data.endDatetime)} · ${fmt(data.startDatetime)} · ${fmtTime(data.startDatetime)} — ${fmtTime(data.endDatetime)}`
                          : `${locationDisplay} · ${locationDisplay} · ${locationDisplay}`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── OVERVIEW ── */}
            {enabledTabs.includes('overview') && (
              <section
                id="overview"
                ref={el => { sectionRefs.current['overview'] = el; }}
                style={{ scrollMarginTop: HEADER_HEIGHT + 16 + 'px' }}
              >
                <CyberHeading label="About This Event" primary={primary} secondary={secondary} />

                <div className="mt-6 relative">
                  {/* Left accent border with gradient fade */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-0.5"
                    style={{ background: `linear-gradient(to bottom, ${primary}, ${secondary}60, transparent)` }}
                  />

                  {/* Subtle background wash */}
                  <div
                    className="absolute inset-0 pointer-events-none rounded-sm"
                    style={{ background: `linear-gradient(135deg, ${primary}06 0%, transparent 60%)` }}
                  />

                  {/* Description text */}
                  <div className="pl-6 pr-4 py-4 relative z-10">
                    {/* Terminal prompt line */}
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
                      <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: mutedText }}>
                        Event Description
                      </span>
                      <span
                        className="inline-block w-2 h-3.5 ml-1 animate-pulse"
                        style={{ background: primary, animationDuration: '1s' }}
                      />
                    </div>

                    {/* Description broken into paragraphs with stagger */}
                    {data.description.split('\n').filter(Boolean).length > 1
                      ? data.description.split('\n').filter(Boolean).map((para, i) => (
                        <p
                          key={i}
                          className="text-sm leading-relaxed mb-3 last:mb-0"
                          style={{ color: textColor, opacity: 1 }}
                        >
                          {i === 0 ? para : para}
                        </p>
                      ))
                      : (
                        <p className="text-sm leading-relaxed" style={{ color: textColor }}>
                          {data.description}
                        </p>
                      )
                    }

                    {/* Bottom readout bar */}
                    <div className="flex items-center gap-3 mt-6 pt-4 border-t" style={{ borderColor: `${primary}18` }}>
                      <span className="relative flex h-1.5 w-1.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                          style={{ background: primary }} />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: primary }} />
                      </span>
                      <div className="flex-1 overflow-hidden h-3">
                        <p
                          className="text-[9px] font-mono uppercase tracking-widest animate-marquee whitespace-nowrap"
                          style={{ color: mutedText, animationDuration: '14s' }}
                        >
                          {data.organizerName} · {data.venueName} · {fmt(data.startDatetime)} · {fmtTime(data.startDatetime)} · {data.organizerName} · {data.venueName} · {fmt(data.startDatetime)} · {fmtTime(data.startDatetime)}
                        </p>
                      </div>
                      <span className="text-[9px] font-mono shrink-0" style={{ color: `${primary}60` }}>
                        EOF
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── SCHEDULE ── */}
            {enabledTabs.includes('schedule') && (
              <section
                id="schedule"
                ref={el => { sectionRefs.current['schedule'] = el; }}
                style={{ scrollMarginTop: HEADER_HEIGHT + 16 + 'px' }}
              >
                <CyberHeading label="Schedule" primary={primary} secondary={secondary} />

                {data.agenda.length === 0 ? (
                  <div className="mt-6 flex items-center gap-3 p-5 border font-mono text-sm"
                    style={{ borderColor: `${primary}25`, background: `${primary}05`, color: mutedText }}>
                    <Clock className="w-4 h-4 shrink-0" style={{ color: primary }} />
                    No schedule defined yet.
                  </div>
                ) : (
                  <div className="mt-6 relative">
                    {/* Vertical timeline line */}
                    <div className="absolute left-[27px] top-0 bottom-0 w-px"
                      style={{ background: `linear-gradient(to bottom, ${primary}60, ${secondary}40, transparent)` }} />

                    <div className="space-y-4">
                      {data.agenda.map((item, idx) => {
                        const color = idx % 2 === 0 ? primary : secondary;
                        return (
                          <div
                            key={item.id}
                            className="flex items-start gap-4 group transition-all duration-300 hover:translate-x-1"
                          >
                            {/* Timeline node */}
                            <div className="shrink-0 relative z-10 mt-5">
                              {item.imageUrl ? (
                                <div className="w-14 h-14 overflow-hidden border-2 transition-all duration-300 group-hover:scale-105"
                                  style={{ borderColor: color }}>
                                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="w-14 h-14 border flex items-center justify-center text-xs font-mono font-black relative overflow-hidden transition-all duration-300 group-hover:scale-105"
                                  style={{ borderColor: color, color, background: `${color}10` }}>
                                  <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5" style={{ background: color }} />
                                  {/* Inner pulse on hover */}
                                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-pulse"
                                    style={{ background: `${color}15` }} />
                                  <span className="relative z-10">{String(idx + 1).padStart(2, '0')}</span>
                                </div>
                              )}
                              {/* Connector dot */}
                              <span className="absolute -left-[13px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border transition-all duration-300 group-hover:scale-150"
                                style={{ background: color, borderColor: color, boxShadow: `0 0 6px ${color}` }} />
                            </div>

                            {/* Card */}
                            <div className="flex-1 min-w-0 relative overflow-hidden"
                              style={{
                                border: `1px solid ${color}30`,
                                background: `${color}05`,
                                boxShadow: `0 0 20px ${color}08`,
                              }}>
                              {/* Top accent line */}
                              <div className="h-0.5 w-0 group-hover:w-full transition-all duration-500"
                                style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />

                              <div className="p-4">
                                {/* Time + room chips */}
                                <div className="flex flex-wrap gap-2 mb-2.5">
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 border"
                                    style={{ color, borderColor: `${color}40`, background: `${color}0a` }}>
                                    <Clock className="w-3 h-3" />
                                    {fmtTime(item.startTime)} — {fmtTime(item.endTime)}
                                  </span>
                                  {item.roomOrLocation && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 border"
                                      style={{ color: mutedText, borderColor: `${color}20` }}>
                                      <MapPin className="w-3 h-3" />{item.roomOrLocation}
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-bold text-sm uppercase tracking-wide mb-1" style={{ color: textColor }}>
                                  {item.title}
                                </h4>
                                {item.description && (
                                  <p className="text-xs leading-relaxed" style={{ color: mutedText }}>
                                    {item.description}
                                  </p>
                                )}
                              </div>

                              {/* Bottom right index */}
                              <div className="absolute bottom-2 right-3 text-[9px] font-mono font-black opacity-10 select-none"
                                style={{ color, fontSize: '2rem', lineHeight: 1 }}>
                                {String(idx + 1).padStart(2, '0')}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* ── TICKETS ── */}
            {enabledTabs.includes('tickets') && (
              <section
                id="tickets"
                ref={el => { sectionRefs.current['tickets'] = el; }}
                style={{ scrollMarginTop: HEADER_HEIGHT + 16 + 'px' }}
              >
                <CyberHeading label="Ticket Tiers" primary={primary} secondary={secondary} />

                {data.tickets.length === 0 ? (
                  <div className="mt-6 flex items-center gap-3 p-5 border font-mono text-sm"
                    style={{ borderColor: `${primary}25`, background: `${primary}05`, color: mutedText }}>
                    <Ticket className="w-4 h-4 shrink-0" style={{ color: primary }} />
                    No tickets defined yet.
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {[...data.tickets].sort((a, b) => a.price - b.price).map((ticket, idx) => {
                      const color = idx % 2 === 0 ? primary : secondary;
                      return (
                        <div
                          key={ticket.id}
                          className={`relative overflow-hidden flex items-center justify-between p-5 transition-all duration-300 group ${ticket.soldOut ? 'opacity-40' : 'hover:translate-x-1 '}`}
                          style={{ border: `1px solid ${color}30`, background: `${color}05` }}
                        >
                          {/* Animated left fill on hover */}
                          {!ticket.soldOut && (
                            <div className="absolute inset-y-0 left-0 w-0 group-hover:w-1 transition-all duration-300"
                              style={{ background: color }} />
                          )}
                          {/* Top sweep line */}
                          <div className="absolute top-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
                            style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />
                          {/* Ghost number */}
                          <div className="absolute right-24 top-1/2 -translate-y-1/2 text-[3rem] font-black font-mono opacity-[0.04] select-none pointer-events-none"
                            style={{ color }}>
                            {String(idx + 1).padStart(2, '0')}
                          </div>

                          <div className="flex items-center gap-4 relative z-10">
                            <div className="p-2.5 border relative overflow-hidden transition-all duration-300 group-hover:scale-110"
                              style={{ borderColor: `${color}45`, color, background: `${color}12` }}>
                              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-pulse"
                                style={{ background: `${color}20` }} />
                              <Ticket className="w-4 h-4 relative z-10" />
                            </div>
                            <div>
                              <p className="font-bold text-sm uppercase tracking-wide" style={{ color: textColor }}>
                                {ticket.tierName}
                              </p>
                              {ticket.soldOut
                                ? <span className="text-[10px] font-mono tracking-widest" style={{ color: '#ef4444' }}>SOLD OUT</span>
                                : <span className="text-[10px] font-mono tracking-widest" style={{ color: `${color}80` }}>AVAILABLE</span>
                              }
                            </div>
                          </div>

                          <div className="relative z-10 text-right">
                            <p className="text-2xl font-black font-mono tabular-nums"
                              style={{ color: ticket.soldOut ? '#ef4444' : color }}>
                              {ticket.soldOut ? '—' : `Rs.${ticket.price.toLocaleString()}`}
                            </p>
                            {!ticket.soldOut && (
                              <p className="text-[9px] font-mono uppercase tracking-widest mt-0.5" style={{ color: mutedText }}>
                                per person
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* ── LOCATION ── */}
            {enabledTabs.includes('location') && (
              <section
                id="location"
                ref={el => { sectionRefs.current['location'] = el; }}
                style={{ scrollMarginTop: HEADER_HEIGHT + 16 + 'px' }}
              >
                <CyberHeading label="Location" primary={primary} secondary={secondary} />

                <div className="mt-6 relative group">
                  {/* Map container */}
                  <div className="relative overflow-hidden border" style={{ borderColor: `${primary}35` }}>
                    {/* Corner brackets that expand on hover */}
                    <span className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 z-10 transition-all duration-500 group-hover:w-8 group-hover:h-8"
                      style={{ borderColor: primary }} />
                    <span className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 z-10 transition-all duration-500 group-hover:w-8 group-hover:h-8"
                      style={{ borderColor: primary }} />
                    <span className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 z-10 transition-all duration-500 group-hover:w-8 group-hover:h-8"
                      style={{ borderColor: secondary }} />
                    <span className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 z-10 transition-all duration-500 group-hover:w-8 group-hover:h-8"
                      style={{ borderColor: secondary }} />
                    <iframe
                      src={`https://maps.google.com/maps?q=${mapQuery}&output=embed&z=15`}
                      width="100%"
                      height="340"
                      style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) saturate(0.75)', display: 'block' }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Event Location"
                    />
                  </div>

                  {/* Info strip below map */}
                  <div className="relative overflow-hidden flex items-start justify-between gap-4 p-4 border border-t-0"
                    style={{ borderColor: `${primary}30`, background: `${primary}07` }}>
                    {/* Animated top accent */}
                    <div className="absolute top-0 inset-x-0 h-px"
                      style={{ background: `linear-gradient(to right, ${primary}60, ${secondary}40, transparent)` }} />
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2 border shrink-0" style={{ borderColor: `${primary}40`, color: primary, background: `${primary}12` }}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-mono uppercase tracking-[0.2em] mb-1" style={{ color: mutedText }}>Venue Address</p>
                        <p className="font-semibold text-sm leading-snug" style={{ color: textColor }}>{locationDisplay}</p>
                      </div>
                    </div>
                    <a
                      href={`https://maps.google.com/maps?q=${mapQuery}`}
                      target="_blank" rel="noopener noreferrer"
                      className="shrink-0 flex items-center gap-1.5 px-3 py-2 border text-[10px] font-mono uppercase tracking-widest transition-all hover:translate-x-1 group/link"
                      style={{ borderColor: `${primary}40`, color: primary, background: `${primary}08` }}
                    >
                      <ExternalLink className="w-3 h-3 transition-transform group-hover/link:rotate-12" />
                      Open Maps
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
                style={{ scrollMarginTop: HEADER_HEIGHT + 16 + 'px' }}
              >
                <CyberHeading label="Contact" primary={primary} secondary={secondary} />

                <div className="mt-6 space-y-3">
                  {[
                    { icon: <Users className="w-4 h-4" />, label: 'ORGANIZER', value: data.organizerName, href: undefined, color: primary },
                    { icon: <Mail className="w-4 h-4" />, label: 'EMAIL', value: data.organizerEmail, href: data.organizerEmail ? `mailto:${data.organizerEmail}` : undefined, color: secondary },
                    { icon: <Phone className="w-4 h-4" />, label: 'PHONE', value: data.organizerPhone, href: data.organizerPhone ? `tel:${data.organizerPhone}` : undefined, color: primary },
                  ].filter(c => c.value).map((c, i) => (
                    <div
                      key={c.label}
                      className="relative overflow-hidden flex items-center gap-4 p-4 border group transition-all duration-300 hover:translate-x-1"
                      style={{ borderColor: `${c.color}28`, background: `${c.color}05` }}
                    >
                      {/* Hover fill */}
                      <div className="absolute inset-y-0 left-0 w-0.5 transition-all duration-300 group-hover:w-1"
                        style={{ background: c.color }} />
                      {/* Top sweep */}
                      <div className="absolute top-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
                        style={{ background: `linear-gradient(to right, ${c.color}, transparent)` }} />

                      <div className="p-2.5 border shrink-0 relative overflow-hidden transition-all duration-300 group-hover:scale-110"
                        style={{ borderColor: `${c.color}45`, color: c.color, background: `${c.color}12` }}>
                        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-pulse"
                          style={{ background: `${c.color}20` }} />
                        <span className="relative z-10">{c.icon}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-mono uppercase tracking-[0.22em] mb-0.5" style={{ color: `${c.color}80` }}>
                          {c.label}
                        </p>
                        {c.href
                          ? <a href={c.href} className="text-sm font-semibold hover:underline truncate block" style={{ color: c.color }}>{c.value}</a>
                          : <p className="text-sm font-semibold truncate" style={{ color: textColor }}>{c.value}</p>
                        }
                      </div>

                      {c.href && (
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-12"
                          style={{ color: c.color }} />
                      )}
                    </div>
                  ))}
                  {!data.organizerEmail && !data.organizerPhone && (
                    <p className="font-mono text-sm" style={{ color: mutedText }}>[ NO_CONTACT_INFO ]</p>
                  )}
                </div>
              </section>
            )}

            {/* ── SOCIAL ── */}
            {enabledTabs.includes('social') && (
              <section
                id="social"
                ref={el => { sectionRefs.current['social'] = el; }}
                style={{ scrollMarginTop: HEADER_HEIGHT + 16 + 'px' }}
              >
                <CyberHeading label="Social & Share" primary={primary} secondary={secondary} />

                <div className="mt-6 space-y-4">
                  {socialEntries.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {socialEntries.map(([key, url], i) => {
                        const color = i % 2 === 0 ? primary : secondary;
                        return (
                          <a
                            key={key}
                            href={url as string}
                            target="_blank" rel="noopener noreferrer"
                            className="relative overflow-hidden flex items-center gap-3 p-4 border transition-all duration-300 hover:translate-x-1 group"
                            style={{ borderColor: `${color}30`, background: `${color}06` }}
                          >
                            {/* Left fill bar */}
                            <div className="absolute inset-y-0 left-0 w-0 group-hover:w-0.5 transition-all duration-300"
                              style={{ background: color }} />
                            {/* Top sweep */}
                            <div className="absolute top-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
                              style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />
                            <div className="p-2 border relative overflow-hidden transition-all duration-300 group-hover:scale-110"
                              style={{ borderColor: `${color}45`, color, background: `${color}12` }}>
                              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-pulse"
                                style={{ background: `${color}20` }} />
                              <span className="relative z-10">{SOCIAL_ICONS[key]}</span>
                            </div>
                            <span className="text-sm font-mono flex-1" style={{ color: mutedText }}>{SOCIAL_LABELS[key]}</span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
                              style={{ color }} />
                          </a>
                        );
                      })}
                    </div>
                  )}

                  {/* Share card */}
                  <div className="relative overflow-hidden p-5 border group"
                    style={{ borderColor: `${secondary}35`, background: `${secondary}06` }}>
                    {/* Top gradient */}
                    <div className="absolute top-0 inset-x-0 h-0.5"
                      style={{ background: `linear-gradient(to right, transparent, ${secondary}60, transparent)` }} />
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 border" style={{ borderColor: `${secondary}40`, color: secondary, background: `${secondary}12` }}>
                        <Share2 className="w-4 h-4" />
                      </div>
                      <p className="font-mono text-xs uppercase tracking-widest font-bold" style={{ color: textColor }}>
                        Share This Event
                      </p>
                    </div>
                    {/* URL display */}
                    <div className="flex items-center gap-2 px-3 py-2 border mb-3 overflow-hidden"
                      style={{ borderColor: `${secondary}25`, background: `${secondary}08` }}>
                      <span className="text-[9px] font-mono" style={{ color: secondary }}>URL</span>
                      <div className="w-px h-3 shrink-0" style={{ background: `${secondary}40` }} />
                      <p className="text-[10px] font-mono truncate flex-1" style={{ color: mutedText }}>
                        {typeof window !== 'undefined' ? window.location.href : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard?.writeText(window.location.href)}
                      className="relative overflow-hidden w-full py-2.5 text-[10px] font-mono border uppercase tracking-widest transition-all hover:brightness-125 group/btn flex items-center justify-center gap-2"
                      style={{ borderColor: `${secondary}45`, color: secondary, background: `${secondary}08` }}
                    >
                      <span className="absolute inset-0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"
                        style={{ background: `linear-gradient(90deg, transparent, ${secondary}20, transparent)` }} />
                      <Share2 className="w-3 h-3 relative z-10" />
                      <span className="relative z-10">Copy Link</span>
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
                style={{ scrollMarginTop: HEADER_HEIGHT + 16 + 'px' }}
              >
                <CyberHeading label="Sponsors" primary={primary} secondary={secondary} />

                {!data.sponsors || data.sponsors.length === 0 ? (
                  <div className="mt-6 flex items-center gap-3 p-5 border font-mono text-sm"
                    style={{ borderColor: `${primary}25`, background: `${primary}05`, color: mutedText }}>
                    <Star className="w-4 h-4 shrink-0" style={{ color: primary }} />
                    No sponsors listed yet.
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {[...data.sponsors].sort((a, b) => {
                      const order = { PLATINUM: 0, GOLD: 1, SILVER: 2, BRONZE: 3 };
                      return (order[a.sponsorTier as keyof typeof order] ?? 4) - (order[b.sponsorTier as keyof typeof order] ?? 4);
                    }).map((sponsor, i) => {
                      const ts = TIER_COLORS[sponsor.sponsorTier] || TIER_COLORS.BRONZE;
                      return (
                        <div
                          key={sponsor.id || i}
                          className="relative flex items-center gap-5 p-5 border overflow-hidden transition-all duration-300 hover:translate-x-1 group"
                          style={{ borderColor: `${ts.border}28`, background: `${ts.border}06` }}
                        >
                          {/* Animated left accent bar */}
                          <div className="absolute left-0 inset-y-0 w-0.5 transition-all duration-300 group-hover:w-1"
                            style={{ background: ts.border }} />

                          {/* Top sweep line */}
                          <div className="absolute top-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
                            style={{ background: `linear-gradient(to right, ${ts.border}, transparent)` }} />

                          {/* Radial glow */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                            style={{ background: `radial-gradient(ellipse at 0% 50%, ${ts.border}20 0%, transparent 60%)` }} />

                          {/* Logo box */}
                          <div
                            className="shrink-0 w-16 h-16 flex items-center justify-center border relative overflow-hidden transition-all duration-300 group-hover:scale-105"
                            style={{ borderColor: `${ts.border}35`, background: `${ts.border}0a` }}
                          >
                            <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5" style={{ background: ts.border }} />
                            <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5" style={{ background: ts.border }} />
                            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-pulse"
                              style={{ background: `${ts.border}15` }} />
                            {sponsor.logoUrl
                              ? <img src={sponsor.logoUrl} alt={sponsor.name}
                                className="w-10 h-10 object-contain relative z-10 opacity-80 group-hover:opacity-100 transition-opacity" />
                              : <Star className="w-6 h-6 relative z-10" style={{ color: ts.border }} />
                            }
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 relative z-10">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <p className="font-black text-sm uppercase tracking-tight" style={{ color: textColor }}>
                                {sponsor.name}
                              </p>
                              <div
                                className="flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest"
                                style={{ color: ts.text, background: `${ts.border}15`, borderLeft: `2px solid ${ts.border}` }}
                              >
                                <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: ts.border }} />
                                {sponsor.sponsorTier}
                              </div>
                            </div>
                            {sponsor.websiteUrl && (
                              <a
                                href={sponsor.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest transition-all duration-300 hover:gap-2.5"
                                style={{ color: ts.border }}
                              >
                                <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                                Visit Website
                              </a>
                            )}
                          </div>

                          {/* Right index number */}
                          <div className="shrink-0 text-right relative z-10">
                            <span
                              className="text-[2.5rem] font-black font-mono leading-none select-none opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-300"
                              style={{ color: ts.border }}
                            >
                              {String(i + 1).padStart(2, '0')}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Bottom summary strip */}
                    <div
                      className="flex items-center justify-between px-5 py-3 border-t mt-2"
                      style={{ borderColor: `${primary}20` }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                            style={{ background: primary }} />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5"
                            style={{ background: primary }} />
                        </span>
                        <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: mutedText }}>
                          {data.sponsors.length} official sponsor{data.sponsors.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        {data.sponsors.map((s, i) => (
                          <span
                            key={i}
                            className="w-1 h-1 rounded-full"
                            style={{ background: (TIER_COLORS[s.sponsorTier] || TIER_COLORS.BRONZE).border }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* ── RECOVER TICKETS ── */}
            {enabledTabs.includes('recover' as TabName) && (
              <section
                id="recover"
                ref={el => { sectionRefs.current['recover' as TabName] = el; }}
                style={{ scrollMarginTop: HEADER_HEIGHT + 16 + 'px' }}
              >
                <CyberHeading label="Recover Tickets" primary={primary} secondary={secondary} />
                <div className="mt-6 space-y-4">
                  <p className="text-sm leading-relaxed" style={{ color: mutedText }}>
                    Enter the email address you used to purchase tickets. We'll send you a link to recover your tickets.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label htmlFor="recovery-email" className="block text-[10px] font-mono uppercase tracking-widest mb-1.5" style={{ color: primary }}>
                        Email Address
                      </label>
                      <input
                        id="recovery-email"
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 border bg-transparent text-sm outline-none transition-all"
                        style={{ borderColor: `${primary}40`, color: textColor, outlineColor: primary }}
                      />
                    </div>
                    <button
                      onClick={handleRecoverTickets}
                      disabled={recovering}
                      className="shrink-0 px-6 py-3 font-mono text-sm uppercase tracking-widest transition-all hover:opacity-80 disabled:opacity-50 flex items-center gap-2"
                      style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})`, color: '#000' }}
                    >
                      {recovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      {recovering ? 'Sending...' : 'Recover'}
                    </button>
                  </div>
                  {recoveryMessage && (
                    <div className="p-4 border text-sm"
                      style={{
                        borderColor: recoveryMessage.type === 'success' ? `${primary}50` : '#ef4444',
                        background: recoveryMessage.type === 'success' ? `${primary}10` : 'rgba(239,68,68,0.08)',
                        color: recoveryMessage.type === 'success' ? primary : '#ef4444',
                      }}>
                      {recoveryMessage.text}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* ── Right column ── */}
          <div className="lg:col-span-4 hidden lg:flex flex-col gap-10">

            {/* ── 1. TICKET WIDGET ── */}
            <div className="border relative overflow-hidden" style={{ ...glowBorder(primary), background: bgColor }}>

              {/* Rotating ring decorations */}
              <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full border-2 opacity-[0.07] animate-spin"
                style={{ borderColor: primary, animationDuration: '14s' }} />
              <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full border opacity-[0.07] animate-spin"
                style={{ borderColor: secondary, animationDuration: '9s', animationDirection: 'reverse' }} />

              {/* Corner brackets */}
              <span className="absolute top-2.5 left-2.5 w-4 h-4 border-t border-l z-10" style={{ borderColor: primary }} />
              <span className="absolute top-2.5 right-2.5 w-4 h-4 border-t border-r z-10" style={{ borderColor: primary }} />
              <span className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b border-l z-10" style={{ borderColor: secondary }} />
              <span className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b border-r z-10" style={{ borderColor: secondary }} />

              {/* Header */}
              <div className="px-7 pt-7 pb-5">
                <div className="flex items-end justify-between mb-1">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: primary }}>
                      <Zap className="w-3 h-3 animate-pulse" /> Access Pass
                    </p>
                    <p className="text-4xl font-black tabular-nums leading-none" style={{ color: textColor }}>
                      {startPrice !== null ? `Rs.${startPrice.toLocaleString()}` : 'TBA'}
                    </p>
                  </div>
                  {/* Live badge */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 border mb-1"
                    style={{ borderColor: `${primary}35`, background: `${primary}08` }}>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: primary }} />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: primary }} />
                    </span>
                    <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: primary }}>Live</span>
                  </div>
                </div>
                <p className="text-xs font-mono mt-1" style={{ color: mutedText }}>lowest available price</p>
              </div>

              {/* Divider */}
              <div className="h-px mx-7" style={{ background: `linear-gradient(to right, ${primary}40, ${secondary}30, transparent)` }} />

              {/* Ticket rows — sorted ascending */}
              {data.tickets.length > 0 && (
                <div className="px-4 py-4 space-y-2">
                  {[...data.tickets]
                    .sort((a, b) => a.price - b.price)
                    .slice(0, 4)
                    .map((t, i) => {
                      const color = i % 2 === 0 ? primary : secondary;
                      return (
                        <div
                          key={t.id}
                          className="relative flex items-center justify-between px-3 py-2.5 border overflow-hidden transition-all duration-300 hover:translate-x-1 group"
                          style={{ borderColor: `${color}28`, background: `${color}07` }}
                        >
                          {/* Left fill on hover */}
                          <div className="absolute inset-y-0 left-0 w-0 group-hover:w-0.5 transition-all duration-300"
                            style={{ background: color }} />
                          {/* Top sweep */}
                          <div className="absolute top-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
                            style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />

                          <div className="flex items-center gap-2 relative z-10">
                            <div className="p-1 border relative overflow-hidden transition-all duration-200 group-hover:scale-110"
                              style={{ borderColor: `${color}40`, color, background: `${color}12` }}>
                              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-pulse"
                                style={{ background: `${color}20` }} />
                              <Ticket className="w-3 h-3 relative z-10" />
                            </div>
                            <span className="text-xs font-mono" style={{ color: mutedText }}>{t.tierName}</span>
                          </div>

                          <div className="relative z-10 text-right">
                            <span className="text-xs font-mono font-bold" style={{ color: t.soldOut ? '#ef4444' : color }}>
                              {t.soldOut ? 'SOLD OUT' : `Rs.${t.price.toLocaleString()}`}
                            </span>
                            {/* Rank badge */}
                            <span className="block text-[8px] font-mono uppercase tracking-widest mt-0.5"
                              style={{ color: `${color}60` }}>
                              #{String(i + 1).padStart(2, '0')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* CTA button */}
              <div className="px-7 pb-2">
                <button
                  onClick={onCheckout}
                  className="w-full py-4 font-black text-sm uppercase tracking-widest transition-all hover:-translate-y-0.5 active:scale-95 relative overflow-hidden group"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})`, color: '#000' }}
                >
                  {/* Shimmer */}
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                    Get Access
                  </span>
                </button>
              </div>

              {/* Payment footer */}
              <div className="px-7 py-4 border-t flex items-center justify-between"
                style={{ borderColor: `${primary}18`, background: `${primary}04` }}>
                <p className="text-[9px] font-mono uppercase tracking-widest flex items-center gap-1.5" style={{ color: mutedText }}>
                  <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Secure Checkout
                </p>
                <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: mutedText }}>
                  JazzCash · EasyPaisa
                </p>
              </div>
            </div>

            {/* ── 2. LIVE COUNTDOWN ── */}
            {isUpcoming && (
              <div className="p-6 border relative overflow-hidden" style={{ borderColor: `${secondary}35`, background: `${secondary}06` }}>
                {/* Horizontal scan sweep animation */}
                <div className="absolute inset-y-0 w-px animate-pulse opacity-40"
                  style={{ left: '50%', background: secondary }} />
                <div className="absolute inset-0 pointer-events-none"
                  style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 4px, ${secondary}04 4px, ${secondary}04 5px)` }} />
                <div className="flex items-center gap-2 mb-4">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: secondary }} />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: secondary }} />
                  </span>
                  <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: secondary }}>Live Countdown</p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { v: diffDays, l: 'DAYS' },
                    { v: diffHrs, l: 'HRS' },
                    { v: diffMins, l: 'MIN' },
                    { v: diffSecs, l: 'SEC' },
                  ].map(({ v, l }, i) => (
                    <div key={l} className="text-center py-3 relative"
                      style={{ background: `${i === 0 ? primary : secondary}10`, border: `1px solid ${i === 0 ? primary : secondary}35` }}>
                      <span className="absolute top-0.5 left-0.5 w-1 h-1" style={{ background: i === 0 ? primary : secondary }} />
                      <span className="block text-xl font-black font-mono tabular-nums" style={{ color: i === 0 ? primary : secondary }}>
                        {String(v).padStart(2, '0')}
                      </span>
                      <span className="text-[8px] font-mono tracking-widest block mt-0.5" style={{ color: mutedText }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 3. EVENT INFO PANEL ── */}
            <div className="border relative overflow-hidden font-mono" style={{ borderColor: `${primary}30`, background: bgColor }}>
              {/* Header bar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: `${primary}20`, background: `${primary}08` }}>
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5" style={{ color: primary }} />
                  <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: primary }}>Event Info</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: primary }} />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: primary }} />
                  </span>
                  <span className="text-[9px] uppercase tracking-widest" style={{ color: mutedText }}>Live</span>
                </div>
              </div>

              {/* Scrolling ticker */}
              <div className="overflow-hidden border-b py-1.5" style={{ borderColor: `${primary}15` }}>
                <div className="flex gap-8 animate-marquee whitespace-nowrap" style={{ animationDuration: '18s' }}>
                  {[...Array(3)].map((_, rep) => (
                    <span key={rep} className="flex items-center gap-8 shrink-0">
                      <span className="text-[9px] font-mono uppercase tracking-widest flex items-center gap-1.5" style={{ color: primary }}>
                        <Calendar className="w-2.5 h-2.5 inline shrink-0" /> {fmtShort(data.startDatetime)}
                      </span>
                      <span className="text-[9px] font-mono uppercase tracking-widest flex items-center gap-1.5" style={{ color: secondary }}>
                        <MapPin className="w-2.5 h-2.5 inline shrink-0" /> {data.venueName}
                      </span>
                      <span className="text-[9px] font-mono uppercase tracking-widest flex items-center gap-1.5" style={{ color: primary }}>
                        <Clock className="w-2.5 h-2.5 inline shrink-0" /> {fmtTime(data.startDatetime)}
                      </span>
                      <span className="text-[9px] font-mono uppercase tracking-widest flex items-center gap-1.5" style={{ color: secondary }}>
                        <Users className="w-2.5 h-2.5 inline shrink-0" /> {data.organizerName}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 divide-x divide-y" style={{ borderColor: `${primary}15` }}>
                {[
                  { icon: <Users className="w-3 h-3" />, label: 'Organizer', val: data.organizerName, color: primary },
                  { icon: <MapPin className="w-3 h-3" />, label: 'Venue', val: data.venueName, color: secondary },
                  { icon: <Clock className="w-3 h-3" />, label: 'Starts At', val: fmtTime(data.startDatetime), color: primary },
                  { icon: <Calendar className="w-3 h-3" />, label: 'Date', val: fmtShort(data.startDatetime), color: secondary },
                  { icon: <Ticket className="w-3 h-3" />, label: 'Tickets', val: `${data.tickets.length} tier${data.tickets.length !== 1 ? 's' : ''}`, color: primary },
                  { icon: <Zap className="w-3 h-3" />, label: 'Status', val: isUpcoming ? 'Upcoming' : 'Live Now', color: secondary },
                ].map(({ icon, label, val, color }, i) => (
                  <div
                    key={label}
                    className="px-4 py-3 transition-all hover:brightness-125 group"
                    style={{ background: i % 2 === 0 ? `${primary}04` : `${secondary}04`, borderColor: `${primary}15` }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="transition-transform group-hover:scale-110" style={{ color }}>{icon}</span>
                      <p className="text-[9px] uppercase tracking-[0.18em]" style={{ color: mutedText }}>{label}</p>
                    </div>
                    <p className="text-xs font-bold truncate" style={{ color }}>{val}</p>
                  </div>
                ))}
              </div>

              {/* Footer status bar */}
              <div className="px-4 py-2.5 flex items-center gap-3 border-t" style={{ borderColor: `${primary}15`, background: `${primary}05` }}>
                <CheckCircle className="w-3 h-3 shrink-0" style={{ color: primary }} />
                <span className="text-[9px] font-mono uppercase tracking-widest flex-1" style={{ color: mutedText }}>
                  Event details verified
                </span>
                <div className="flex-1 h-0.5 overflow-hidden" style={{ background: `${primary}15` }}>
                  <div className="h-full w-2/3 animate-pulse"
                    style={{ background: `linear-gradient(to right, ${primary}, ${secondary})` }} />
                </div>
              </div>
            </div>

            {/* ── 4. AVAILABILITY METER ── */}
            {data.tickets.length > 0 && (
              <div className="border relative overflow-hidden" style={{ borderColor: `${secondary}30`, background: bgColor }}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: `${secondary}20`, background: `${secondary}08` }}>
                  <div className="flex items-center gap-2">
                    <Ticket className="w-3.5 h-3.5" style={{ color: secondary }} />
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: secondary }}>Availability</span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 border" style={{ color: primary, borderColor: `${primary}40`, background: `${primary}10` }}>
                    {data.tickets.filter(t => !t.soldOut).length}/{data.tickets.length} OPEN
                  </span>
                </div>

                <div className="p-5 space-y-5">
                  {data.tickets.map((t, i) => {
                    // Deterministic % based on index — never changes
                    const fillPct = t.soldOut ? 100 : [78, 52, 35, 65, 44, 88][i % 6];
                    const remaining = 100 - fillPct;
                    const barColor = t.soldOut ? '#ef4444' : i % 2 === 0 ? primary : secondary;
                    const urgency = remaining < 25 ? 'CRITICAL' : remaining < 50 ? 'LIMITED' : 'AVAILABLE';
                    const urgencyColor = remaining < 25 ? '#ef4444' : remaining < 50 ? '#fbbf24' : barColor;

                    return (
                      <div key={t.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 shrink-0" style={{ background: barColor }} />
                            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: textColor }}>{t.tierName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono px-1.5 py-0.5 border" style={{ color: urgencyColor, borderColor: `${urgencyColor}40`, background: `${urgencyColor}10` }}>
                              {t.soldOut ? 'SOLD OUT' : urgency}
                            </span>
                            <span className="text-[10px] font-mono font-bold" style={{ color: barColor }}>
                              {t.soldOut ? '0%' : `${remaining}%`}
                            </span>
                          </div>
                        </div>

                        {/* Track */}
                        <div className="relative h-2 w-full overflow-hidden" style={{ background: `${barColor}18` }}>
                          {/* Fill bar */}
                          <div
                            className="absolute inset-y-0 left-0 transition-all duration-1000"
                            style={{ width: `${fillPct}%`, background: `linear-gradient(to right, ${barColor}60, ${barColor})` }}
                          />
                          {/* Shimmer overlay on non-sold-out */}
                          {!t.soldOut && (
                            <div
                              className="absolute inset-y-0 w-12 animate-shimmer"
                              style={{
                                left: `${fillPct - 10}%`,
                                background: `linear-gradient(to right, transparent, ${barColor}80, transparent)`,
                                animationDuration: `${2 + i * 0.5}s`,
                              }}
                            />
                          )}
                        </div>

                        {/* Segment ticks */}
                        <div className="flex justify-between">
                          {[0, 25, 50, 75, 100].map(tick => (
                            <span key={tick} className="text-[8px] font-mono" style={{ color: `${mutedText}` }}>
                              {tick}%
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pulsing footer */}
                <div className="px-5 py-3 border-t flex items-center gap-2" style={{ borderColor: `${secondary}20`, background: `${secondary}06` }}>
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: secondary }} />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: secondary }} />
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: mutedText }}>
                    Availability updates in real time
                  </span>
                </div>
              </div>
            )}

            {/* ── 5. GLITCH BANNER ── */}
            <div
              className="relative overflow-hidden flex flex-col items-center justify-center text-center"
              style={{ background: bgColor, border: `1px solid ${primary}35` }}
            >
              {/* Animated diagonal stripes */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.06] animate-marquee"
                style={{
                  backgroundImage: `repeating-linear-gradient(45deg, ${primary} 0px, ${primary} 1px, transparent 1px, transparent 14px)`,
                  animationDuration: '20s',
                }}
              />

              {/* Top glow bar */}
              <div className="absolute top-0 inset-x-0 h-0.5"
                style={{ background: `linear-gradient(to right, transparent, ${primary}, ${secondary}, transparent)` }} />

              {/* Corner brackets — all four */}
              <span className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: primary }} />
              <span className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: primary }} />
              <span className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: secondary }} />
              <span className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: secondary }} />

              {/* Radial glow behind text */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 50%, ${primary}18 0%, transparent 70%)` }} />

              {/* Content */}
              <div className="relative z-10 px-8 py-8 flex flex-col items-center gap-5">

                {/* Eyebrow */}
                <div className="flex items-center gap-3">
                  <div className="h-px w-8" style={{ background: `linear-gradient(to right, transparent, ${secondary})` }} />
                  <span className="text-[9px] font-mono uppercase tracking-[0.35em] flex items-center gap-1.5" style={{ color: secondary }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: secondary }} />
                    Limited Spots
                  </span>
                  <div className="h-px w-8" style={{ background: `linear-gradient(to left, transparent, ${secondary})` }} />
                </div>

                {/* Main glitch headline */}
                <div className="relative select-none">
                  <p
                    className="text-3xl font-black uppercase leading-[0.9] tracking-tighter"
                    style={{
                      color: primary,
                      textShadow: `3px 0 0 ${secondary}70, -3px 0 0 ${primary}50, 0 0 40px ${primary}60`,
                    }}
                  >
                    Secure<br />Your Spot
                  </p>
                  {/* Ghost glitch layers */}
                  <p
                    className="absolute inset-0 text-3xl font-black uppercase leading-[0.9] tracking-tighter pointer-events-none opacity-30 animate-pulse"
                    style={{ color: secondary, transform: 'translate(3px, -1px)', textShadow: 'none', animationDuration: '2s' }}
                    aria-hidden
                  >
                    Secure<br />Your Spot
                  </p>
                </div>

                {/* Sub-line */}
                <p className="text-[11px] font-mono leading-relaxed max-w-[200px]" style={{ color: mutedText }}>
                  Join <span style={{ color: primary }}>{data.organizerName}</span> at{' '}
                  <span style={{ color: secondary }}>{data.venueName}</span> — before it sells out.
                </p>

                {/* Horizontal rule with dots */}
                <div className="flex items-center gap-2 w-full">
                  <div className="flex-1 h-px" style={{ background: `${primary}30` }} />
                  <span className="w-1 h-1" style={{ background: primary }} />
                  <span className="w-1.5 h-1.5" style={{ background: secondary }} />
                  <span className="w-1 h-1" style={{ background: primary }} />
                  <div className="flex-1 h-px" style={{ background: `${primary}30` }} />
                </div>

                {/* Price call-out */}
                {startPrice !== null && (
                  <div className="w-full flex items-center justify-between px-4 py-3 border"
                    style={{ borderColor: `${primary}30`, background: `${primary}08` }}>
                    <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: mutedText }}>
                      From
                    </span>
                    <span className="text-xl font-black tabular-nums" style={{ color: primary }}>
                      Rs.{startPrice.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-1"
                      style={{ background: `${secondary}20`, color: secondary }}>
                      Best Deal
                    </span>
                  </div>
                )}

                {/* CTA button — full width with shimmer */}
                <button
                  onClick={onCheckout}
                  className="w-full py-4 relative overflow-hidden font-black text-sm uppercase tracking-[0.15em] transition-all hover:-translate-y-0.5 hover:opacity-90 active:scale-95 group"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})`, color: '#000' }}
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    Register Now
                  </span>
                </button>

                {/* Trust badges row */}
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  {[
                    { icon: <CheckCircle className="w-3 h-3" />, label: 'Instant Confirmation' },
                    { icon: <Zap className="w-3 h-3" />, label: 'Fast Checkout' },
                    { icon: <Shield className="w-3 h-3" />, label: 'Secure Payment' },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-1">
                      <span style={{ color: primary }}>{icon}</span>
                      <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: mutedText }}>{label}</span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Bottom glow bar */}
              <div className="absolute bottom-0 inset-x-0 h-0.5"
                style={{ background: `linear-gradient(to right, transparent, ${secondary}, ${primary}, transparent)` }} />
            </div>

          </div>{/* end right column */}
        </div>{/* end grid */}
      </div>{/* end main content */}

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer
        className="relative z-10 mt-8"
        style={{ background: `${bgColor}f5` }}
      >
        {/* Gradient rule */}
        <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${primary}, ${secondary}, transparent)` }} />

        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 items-center">

            {/* Left: event snapshot */}
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.3em] mb-2" style={{ color: mutedText }}>
                {fmtShort(data.startDatetime)} · {data.venueName}
              </p>
              <h3 className="font-black text-lg uppercase leading-tight mb-3" style={{ color: textColor }}>
                {data.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest border"
                    style={{ color: i % 2 === 0 ? primary : secondary, borderColor: i % 2 === 0 ? `${primary}40` : `${secondary}40` }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Centre: logo + dots */}
            <div className="flex flex-col items-center gap-4">
              <Image
                src="/images/logo/eventsphere-logo.png"
                alt="Eventsphere"
                width={220}
                height={60}
                className="h-14 w-auto opacity-70 hover:opacity-100 transition-opacity drop-shadow-lg"
              />
              <div className="flex items-center gap-3">
                <div className="h-px w-8" style={{ background: `${primary}50` }} />
                <div className="w-1.5 h-1.5" style={{ background: primary }} />
                <div className="h-px w-8" style={{ background: `${secondary}50` }} />
              </div>
              <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: mutedText }}>
                Powered by <span style={{ color: primary }}>Eventsphere</span>
              </p>
            </div>

            {/* Right: explore + CTA */}
            <div className="flex flex-col items-start sm:items-end gap-4">
              <a
                href="/explore"
                className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest transition-colors hover:opacity-80"
                style={{ color: primary }}
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
        className="fixed bottom-0 left-0 w-full border-t sm:hidden flex items-center justify-between px-5 py-4 z-50"
        style={{ background: bgColor, borderColor: `${primary}35`, boxShadow: `0 -12px 40px ${primary}12` }}
      >
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: primary }}>Price</p>
          <p className="text-2xl font-black font-mono tabular-nums" style={{ color: textColor }}>
            {startPrice !== null ? `Rs.${startPrice.toLocaleString()}` : 'TBA'}
          </p>
        </div>
        <button
          onClick={onCheckout}
          className="font-black py-3.5 px-8 text-sm uppercase tracking-widest active:scale-95"
          style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})`, color: '#000' }}
        >
          Get Access
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Cyberpunk Section Heading
───────────────────────────────────────────────── */
function CyberHeading({ label, primary, secondary }: { label: string; primary: string; secondary: string }) {
  return (
    <div className="relative mb-2">
      {/* Background ghost text */}
      <span
        className="absolute -top-4 left-0 text-[4rem] font-black uppercase leading-none select-none pointer-events-none opacity-[0.04] tracking-tighter"
        style={{ color: primary, fontSize: 'clamp(3rem, 7vw, 5rem)' }}
        aria-hidden
      >
        {label}
      </span>

      <div className="relative flex items-center gap-4">
        {/* Animated left accent — two stacked bars */}
        <div className="shrink-0 flex flex-col gap-1">
          <div className="w-8 h-0.5" style={{ background: `linear-gradient(to right, ${primary}, ${primary}00)` }} />
          <div className="w-5 h-0.5" style={{ background: `linear-gradient(to right, ${secondary}, ${secondary}00)` }} />
          <div className="w-3 h-0.5" style={{ background: `linear-gradient(to right, ${primary}80, ${primary}00)` }} />
        </div>

        {/* Label */}
        <h2
          className="font-black uppercase tracking-tight leading-none relative"
          style={{
            color: primary,
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            textShadow: `0 0 30px ${primary}60, 2px 0 0 ${secondary}40`,
          }}
        >
          {label}
          {/* Underline sweep */}
          <span
            className="absolute -bottom-1.5 left-0 w-full h-px"
            style={{ background: `linear-gradient(to right, ${primary}90, ${secondary}50, transparent)` }}
          />
        </h2>

        {/* Right dashed rule */}
        <div className="flex-1 flex items-center gap-1.5">
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${primary}30, transparent)` }} />
          <span className="font-mono text-[10px] shrink-0" style={{ color: `${secondary}70` }}>[/]</span>
        </div>
      </div>
    </div>
  );
}