'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { publicService } from '@/api/publicService';
import { EventTemplateData, TabName } from '@/types/template.types';
import { Sponsor } from '@/types/sponsor.types';
import {
  Calendar, MapPin, Clock, Ticket, Users, Mail, Phone,
  Globe, MessageCircle, Share2, ExternalLink, ArrowUpRight,
  ChevronRight, LayoutGrid, Zap, Loader2, Star, CheckCircle,
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter } from 'react-icons/fa6';

interface Template3Props {
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
  'dm-sans': 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap',
  'playfair': 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&display=swap',
  'space-grotesk': 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap',
  'cabinet-grotesk': 'https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&display=swap',
  'syne': 'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap',
};

const TAB_LABELS: Record<TabName, string> = {
  overview: 'Overview', schedule: 'Schedule', tickets: 'Tickets',
  location: 'Location', contact: 'Contact', social: 'Social',
  sponsors: 'Sponsors', recover: 'Recover',
};

const TIER_COLORS: Record<string, string> = {
  PLATINUM: '#e5e7eb', GOLD: '#fbbf24', SILVER: '#9ca3af', BRONZE: '#cd7f32',
};

export default function Template3({ data, onCheckout }: Template3Props) {
  /* ── Colours ── */
  const bgColor = data.backgroundColor || '#080b14';
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

  /* Glass card helper — T3's signature visual language */
  const glass = (bg = 0.06, border = 0.12): React.CSSProperties => ({
    background: isLight ? `rgba(255,255,255,${bg + 0.35})` : `rgba(255,255,255,${bg})`,
    border: `1px solid rgba(255,255,255,${border})`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  });

  /* ── Typography ── */
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
  const [, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(id); }, []);
  const eventMs = new Date(data.startDatetime).getTime() - Date.now();
  const diffDays = Math.max(0, Math.floor(eventMs / 86400000));
  const diffHrs = Math.max(0, Math.floor((eventMs % 86400000) / 3600000));
  const diffMin = Math.max(0, Math.floor((eventMs % 3600000) / 60000));
  const diffSec = Math.max(0, Math.floor((eventMs % 60000) / 1000));
  const upcoming = eventMs > 0;

  /* ── Scroll / active tab ── */
  const [activeTab, setActiveTab] = useState<TabName>('overview');
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const sectionRefs = useRef<Record<TabName, HTMLElement | null>>({} as Record<TabName, HTMLElement | null>);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Parallax mouse tracker for hero */
  useEffect(() => {
    const onMove = (e: MouseEvent) => setMousePos({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 });
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

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
    facebook: <FaFacebook className="w-4 h-4" />,
    instagram: <FaInstagram className="w-4 h-4" />,
    twitter: <FaXTwitter className="w-4 h-4" />,
    linkedin: <FaLinkedin className="w-4 h-4" />,
    whatsapp: <MessageCircle className="w-4 h-4" />,
    website: <Globe className="w-4 h-4" />,
  };
  const SOCIAL_LABELS: Record<string, string> = {
    facebook: 'Facebook', instagram: 'Instagram', twitter: 'Twitter / X',
    linkedin: 'LinkedIn', whatsapp: 'WhatsApp', website: 'Website',
  };

  /* ── Recover ── */
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recovering, setRecovering] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const handleRecoverTickets = async () => {
    if (!recoveryEmail.trim()) { setRecoveryMessage({ type: 'error', text: 'Please enter your email address.' }); return; }
    setRecovering(true); setRecoveryMessage(null);
    try {
      const result = await publicService.recoverTickets(data.eventId, recoveryEmail.trim());
      setRecoveryMessage({ type: 'success', text: result.message || 'Recovery email sent successfully!' });
      setRecoveryEmail('');
    } catch (err: any) {
      setRecoveryMessage({ type: 'error', text: err.message || 'Failed to recover tickets. Please try again.' });
    } finally { setRecovering(false); }
  };

  /* ── Inline keyframes injected once ── */
  const css = `
    @keyframes t3-float  { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-14px)} }
    @keyframes t3-spin-s { from{transform:rotate(0deg)}        to{transform:rotate(360deg)}     }
    @keyframes t3-spin-r { from{transform:rotate(360deg)}      to{transform:rotate(0deg)}       }
    @keyframes t3-pulse  { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
    @keyframes t3-shimmer{ 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)}             }
    @keyframes t3-slide-up{ from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
    @keyframes t3-glow   { 0%,100%{box-shadow:0 0 20px ${primary}40} 50%{box-shadow:0 0 50px ${primary}80,0 0 100px ${secondary}30} }
    @keyframes t3-bounce-x{ 0%,100%{transform:translateX(0)} 50%{transform:translateX(4px)} }
    @keyframes t3-blob1  { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
    @keyframes t3-blob2  { 0%,100%{border-radius:40% 60% 60% 30%/30% 60% 40% 60%} 50%{border-radius:60% 40% 30% 60%/60% 40% 60% 30%} }
    .t3-float            { animation: t3-float   6s ease-in-out infinite; }
    .t3-spin-s           { animation: t3-spin-s 18s linear infinite; }
    .t3-spin-r           { animation: t3-spin-r 12s linear infinite; }
    .t3-pulse-slow       { animation: t3-pulse   4s ease-in-out infinite; }
    .t3-slide-up         { animation: t3-slide-up 0.6s ease forwards; }
    .t3-glow             { animation: t3-glow    3s ease-in-out infinite; }
    .t3-bounce-x         { animation: t3-bounce-x 2s ease-in-out infinite; }
    .t3-blob1            { animation: t3-blob1  10s ease-in-out infinite; }
    .t3-blob2            { animation: t3-blob2  14s ease-in-out infinite; }
    .t3-card:hover .t3-shimmer { animation: t3-shimmer 0.7s ease forwards; }
    .t3-shimmer          { position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent);transform:translateX(-100%);pointer-events:none; }
    .no-scrollbar::-webkit-scrollbar{display:none}
    .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
  `;

  /* ── Render ── */
  return (
    <div style={{ fontFamily, background: bgColor, color: textColor }} className="min-h-screen overflow-x-hidden pb-24 sm:pb-0">
      <style>{css}</style>
      {fontLink && <link rel="stylesheet" href={fontLink} />}

      {/* ════════════════════════════════════════
          ANIMATED BACKGROUND LAYER
          Morphing blobs + soft mesh — unique to T3
      ════════════════════════════════════════ */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Primary blob */}
        <div
          className="absolute t3-blob1 t3-pulse-slow"
          style={{
            width: '60vw', height: '60vw',
            top: '-15vw', left: '-10vw',
            background: `radial-gradient(ellipse, ${primary}35 0%, ${primary}08 55%, transparent 75%)`,
            filter: 'blur(60px)',
          }}
        />
        {/* Secondary blob */}
        <div
          className="absolute t3-blob2 t3-pulse-slow"
          style={{
            width: '50vw', height: '50vw',
            bottom: '-10vw', right: '-10vw',
            background: `radial-gradient(ellipse, ${secondary}30 0%, ${secondary}06 55%, transparent 75%)`,
            filter: 'blur(50px)',
            animationDelay: '2s',
          }}
        />
        {/* Centre accent */}
        <div
          className="absolute t3-pulse-slow"
          style={{
            width: '40vw', height: '40vw',
            top: '40%', left: '30%',
            background: `radial-gradient(circle, ${primary}12 0%, ${secondary}06 50%, transparent 70%)`,
            filter: 'blur(80px)',
            animationDelay: '1s',
          }}
        />
        {/* Subtle dot-grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, ${textColor} 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* ════════════════════════════════════════
    FLOATING PILL HEADER
════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4 pt-4 pointer-events-none">

        {/* Rotating gradient halo behind the pill */}
        <div
          className="absolute pointer-events-none t3-spin-s"
          style={{
            width: '420px',
            height: '68px',
            borderRadius: '999px',
            background: `conic-gradient(from 0deg, ${primary}00, ${primary}80, ${secondary}80, ${primary}00)`,
            filter: 'blur(14px)',
            opacity: scrolled ? 0.55 : 0.25,
            transition: 'opacity 0.5s ease',
          }}
        />

        <div
          className="pointer-events-auto relative flex items-center gap-0.5 px-2 py-2 transition-all duration-500 no-scrollbar overflow-x-auto"
          style={{
            ...glass(scrolled ? 0.16 : 0.08, scrolled ? 0.25 : 0.14),
            borderRadius: '999px',
            boxShadow: scrolled
              ? `0 8px 40px ${primary}45, 0 2px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)`
              : `0 4px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.1)`,
            maxWidth: '100%',
            /* Animated gradient border via outline trick */
            outline: scrolled ? `1.5px solid ${primary}50` : '1.5px solid rgba(255,255,255,0.12)',
            outlineOffset: '-1px',
            transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* ── Live dot + title ── */}
          <div
            className="hidden sm:flex items-center gap-2.5 pl-4 pr-4 py-1.5 mr-1 shrink-0"
            style={{ borderRight: `1px solid rgba(255,255,255,0.12)` }}
          >
            {/* Triple-ring live pulse */}
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span
                className="absolute inline-flex h-full w-full rounded-full opacity-30 animate-ping"
                style={{ background: secondary, animationDuration: '1.8s' }}
              />
              <span
                className="absolute inline-flex h-full w-full rounded-full opacity-20 animate-ping"
                style={{ background: secondary, animationDuration: '2.4s', animationDelay: '0.3s' }}
              />
              <span
                className="relative inline-flex h-2.5 w-2.5 rounded-full"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${secondary}ff, ${secondary}99)`,
                  boxShadow: `0 0 8px ${secondary}90`,
                }}
              />
            </span>

            {/* Title with shimmer sweep on mount */}
            <span
              className="text-[11px] font-black uppercase tracking-[0.16em] truncate max-w-[140px] relative overflow-hidden"
              style={{ color: textColor }}
            >
              {data.title}
              {/* One-time shimmer sweep */}
              <span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)`,
                  animation: 't3-shimmer 1.8s ease 0.4s 1 forwards',
                  transform: 'translateX(-100%)',
                }}
              />
            </span>
          </div>

          {/* ── Nav pills ── */}
          {enabledTabs.map((tab, i) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => scrollTo(tab)}
                className="relative shrink-0 px-3 sm:px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] whitespace-nowrap rounded-full overflow-hidden group"
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${primary}, ${secondary})`
                    : 'transparent',
                  color: isActive ? '#fff' : mutedText,
                  boxShadow: isActive
                    ? `0 4px 18px ${primary}55, 0 0 0 1px ${primary}40`
                    : 'none',
                  transform: isActive ? 'scale(1.06)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                  animationDelay: `${i * 60}ms`,
                }}
              >
                {/* Active: continuous shimmer sweep */}
                {isActive && (
                  <span
                    className="absolute inset-0 pointer-events-none rounded-full"
                    style={{
                      background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)',
                      animation: 't3-shimmer 2.2s ease infinite',
                    }}
                  />
                )}

                {/* Active: bottom glow line */}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full pointer-events-none"
                    style={{
                      width: '60%',
                      background: `linear-gradient(to right, ${primary}, ${secondary})`,
                      boxShadow: `0 0 8px ${secondary}90`,
                      animation: 't3-pulse 2s ease-in-out infinite',
                    }}
                  />
                )}

                {/* Hover glow fill for inactive */}
                {!isActive && (
                  <span
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at 50% 120%, ${primary}30, transparent 70%)`,
                      transition: 'opacity 0.25s ease',
                    }}
                  />
                )}

                <span className="relative z-10">{TAB_LABELS[tab]}</span>
              </button>
            );
          })}

          {/* ── CTA pill ── */}
          <button
            onClick={onCheckout}
            className="hidden sm:flex items-center gap-2 ml-2 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white rounded-full shrink-0 active:scale-95 relative overflow-hidden group"
            style={{
              background: `linear-gradient(135deg, ${primary}, ${secondary})`,
              boxShadow: `0 4px 20px ${primary}55, inset 0 1px 0 rgba(255,255,255,0.2)`,
              transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.07)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 32px ${primary}70, 0 0 0 2px ${secondary}60, inset 0 1px 0 rgba(255,255,255,0.25)`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 20px ${primary}55, inset 0 1px 0 rgba(255,255,255,0.2)`;
            }}
          >
            {/* Rotating gradient sweep on hover */}
            <span
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                animation: 't3-shimmer 1s ease infinite',
                transition: 'opacity 0.2s ease',
              }}
            />
            {/* Outer glow ring on hover */}
            <span
              className="absolute -inset-0.5 rounded-full opacity-0 group-hover:opacity-100 pointer-events-none"
              style={{
                background: `linear-gradient(135deg, ${primary}40, ${secondary}40)`,
                filter: 'blur(6px)',
                transition: 'opacity 0.3s ease',
                zIndex: -1,
              }}
            />

            <Zap
              className="w-3.5 h-3.5 relative z-10 group-hover:rotate-12 transition-transform duration-300"
              style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' }}
            />
            <span className="relative z-10">Get In</span>
          </button>
        </div>
      </header>

      {/* ════════════════════════════════════════
    HERO — Bento grid
════════════════════════════════════════ */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-4 min-h-[88vh]">

          {/* ── BIG IMAGE BENTO CARD ── */}
          <div
            className="relative rounded-3xl overflow-hidden order-1 min-h-[55vw] lg:min-h-0 t3-card group"
            style={{ ...glass(0.05, 0.1) }}
          >
            {/* ── Parallax image ── */}
            <img
              src={data.imageUrl}
              alt={data.title}
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{
                transform: `scale(1.1) translate(${mousePos.x * -10}px, ${mousePos.y * -7}px)`,
                transition: 'transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)',
              }}
            />

            {/* ── Shimmer sweep (hover) ── */}
            <div className="t3-shimmer" />

            {/* ── Layered gradients ── */}
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: `linear-gradient(to top, ${bgColor}f8 0%, ${bgColor}a0 32%, ${bgColor}30 58%, transparent 100%)`,
              }}
            />
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: `linear-gradient(135deg, ${primary}35 0%, transparent 45%, ${secondary}22 100%)`,
              }}
            />
            {/* Vignette edges */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                boxShadow: `inset 0 0 80px rgba(0,0,0,0.35), inset 0 0 200px rgba(0,0,0,0.15)`,
              }}
            />

            {/* ── Animated border — rotates on hover ── */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none t3-glow"
              style={{ border: `1.5px solid ${primary}40` }}
            />
            {/* Secondary colour border that fades in on hover */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{ border: `1.5px solid ${secondary}50`, boxShadow: `inset 0 0 60px ${secondary}10` }}
            />

            {/* ── Spinning decorative rings ── */}
            <div
              className="absolute top-6 right-14 w-20 h-20 t3-spin-s pointer-events-none hidden lg:block"
              style={{
                border: `1.5px dashed ${primary}50`,
                borderRadius: '50%',
                boxShadow: `0 0 12px ${primary}20`,
              }}
            />
            <div
              className="absolute top-11 right-19 w-10 h-10 t3-spin-r pointer-events-none hidden lg:block"
              style={{
                border: `1.5px solid ${secondary}45`,
                borderRadius: '50%',
                boxShadow: `0 0 8px ${secondary}20`,
              }}
            />
            {/* Dot in the centre of the rings */}
            <div
              className="absolute top-[58px] right-[84px] w-2 h-2 rounded-full pointer-events-none hidden lg:block t3-pulse-slow"
              style={{ background: secondary, boxShadow: `0 0 10px ${secondary}` }}
            />

            {/* ── Corner accent brackets ── */}
            <span
              className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 rounded-tl-lg pointer-events-none transition-all duration-500 group-hover:w-10 group-hover:h-10"
              style={{ borderColor: `${primary}80` }}
            />
            <span
              className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 rounded-tr-lg pointer-events-none transition-all duration-500 group-hover:w-10 group-hover:h-10"
              style={{ borderColor: `${secondary}80` }}
            />
            <span
              className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 rounded-bl-lg pointer-events-none transition-all duration-500 group-hover:w-10 group-hover:h-10"
              style={{ borderColor: `${secondary}80` }}
            />
            <span
              className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 rounded-br-lg pointer-events-none transition-all duration-500 group-hover:w-10 group-hover:h-10"
              style={{ borderColor: `${primary}80` }}
            />

            {/* ── Tags — top left, primary/secondary alternating ── */}
            <div className="absolute top-5 left-5 z-10 flex flex-wrap gap-2">
              {data.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
                  style={{
                    background: i % 2 === 0
                      ? `linear-gradient(135deg, ${primary}ee, ${primary}bb)`
                      : `linear-gradient(135deg, ${secondary}ee, ${secondary}bb)`,
                    color: '#fff',
                    border: `1px solid ${i % 2 === 0 ? `${primary}` : `${secondary}`}`,
                    boxShadow: i % 2 === 0
                      ? `0 4px 16px ${primary}60, inset 0 1px 0 rgba(255,255,255,0.2)`
                      : `0 4px 16px ${secondary}60, inset 0 1px 0 rgba(255,255,255,0.2)`,
                    animationDelay: `${i * 0.12}s`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* ── Status badge — top right ── */}
            <div
              className="absolute top-5 right-5 z-10 flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-md t3-float"
              style={{
                background: 'rgba(0,0,0,0.55)',
                border: `1px solid ${secondary}60`,
                boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px ${secondary}20`,
              }}
            >
              {/* Triple-ring pulse */}
              <span className="relative flex h-2 w-2 shrink-0">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                  style={{ background: secondary, animationDuration: '1.6s' }}
                />
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-30"
                  style={{ background: secondary, animationDuration: '2.2s', animationDelay: '0.4s' }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ background: secondary, boxShadow: `0 0 8px ${secondary}` }}
                />
              </span>
              <span
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: secondary }}
              >
                {upcoming ? 'Upcoming' : 'Live Now'}
              </span>
            </div>

            {/* ── Floating particle dots ── */}
            {[
              { top: '18%', left: '12%', size: 3, delay: '0s', col: primary },
              { top: '30%', left: '85%', size: 2, delay: '0.8s', col: secondary },
              { top: '55%', left: '8%', size: 2, delay: '1.4s', col: secondary },
              { top: '70%', left: '78%', size: 3, delay: '0.5s', col: primary },
            ].map((p, i) => (
              <div
                key={i}
                className="absolute rounded-full pointer-events-none t3-float hidden lg:block"
                style={{
                  top: p.top, left: p.left,
                  width: p.size, height: p.size,
                  background: p.col,
                  boxShadow: `0 0 6px ${p.col}`,
                  opacity: 0.6,
                  animationDelay: p.delay,
                }}
              />
            ))}

            {/* ── Hero text — bottom ── */}
            <div className="absolute bottom-0 left-0 right-0 p-7 z-10 t3-slide-up">

              {/* Organiser row */}
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 t3-pulse-slow"
                  style={{
                    background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                    boxShadow: `0 0 14px ${primary}60`,
                  }}
                >
                  <Users className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="h-px w-6" style={{ background: `linear-gradient(to right, ${primary}80, transparent)` }} />
                <span className="text-xs font-bold text-white/75 uppercase tracking-widest">
                  {data.organizerName}
                </span>
              </div>

              {/* Title */}
              <h1
                className="font-black leading-[0.88] tracking-tighter text-white mb-5"
                style={{
                  fontSize: 'clamp(2.4rem, 5.5vw, 5.5rem)',
                  textShadow: `0 4px 30px rgba(0,0,0,0.65), 0 0 80px ${primary}45`,
                }}
              >
                {data.title}
              </h1>

              {/* Date + venue + time chips */}
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: <Calendar className="w-3 h-3" />, val: fmtShort(data.startDatetime), col: secondary },
                  { icon: <Clock className="w-3 h-3" />, val: fmtTime(data.startDatetime), col: primary },
                  { icon: <MapPin className="w-3 h-3" />, val: data.venueName, col: secondary },
                ].map(({ icon, val, col }, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
                    style={{
                      background: 'rgba(0,0,0,0.45)',
                      color: 'rgba(255,255,255,0.92)',
                      border: `1px solid ${col}50`,
                      boxShadow: `0 2px 12px rgba(0,0,0,0.3), 0 0 0 0 ${col}`,
                    }}
                  >
                    <span style={{ color: col }}>{icon}</span>
                    {val}
                  </span>
                ))}
              </div>

              {/* Bottom gradient line */}
              <div
                className="mt-5 h-px w-full"
                style={{
                  background: `linear-gradient(to right, ${primary}70, ${secondary}50, transparent)`,
                }}
              />
            </div>
          </div>

          {/* ── RIGHT BENTO COLUMN ── */}
          <div className="flex flex-col gap-4 order-2">

            {/* ════════════════════════════════════════
      COUNTDOWN BENTO CARD
  ════════════════════════════════════════ */}
            {upcoming && (
              <div
                className="rounded-3xl p-6 relative overflow-hidden t3-card group"
                style={{ ...glass(0.09, 0.16) }}
              >
                {/* Rotating conic gradient halo */}
                <div
                  className="absolute -inset-1 rounded-3xl opacity-20 pointer-events-none t3-spin-s"
                  style={{
                    background: `conic-gradient(from 0deg, ${primary}, ${secondary}, ${primary})`,
                    filter: 'blur(12px)',
                  }}
                />

                {/* Top accent line — animated width */}
                <div
                  className="absolute top-0 inset-x-0 h-0.5 rounded-t-3xl"
                  style={{ background: `linear-gradient(to right, ${primary}, ${secondary})` }}
                />
                {/* Moving shimmer along the top line */}
                <div
                  className="absolute top-0 left-0 h-0.5 w-16 rounded-t-3xl pointer-events-none"
                  style={{
                    background: `linear-gradient(to right, transparent, #fff, transparent)`,
                    animation: 't3-shimmer 3s ease-in-out infinite',
                  }}
                />

                {/* Pulsing background blob */}
                <div
                  className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none opacity-25 t3-pulse-slow"
                  style={{ background: `radial-gradient(circle, ${primary}, transparent)`, filter: 'blur(28px)' }}
                />
                <div
                  className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full pointer-events-none opacity-20 t3-pulse-slow"
                  style={{ background: `radial-gradient(circle, ${secondary}, transparent)`, filter: 'blur(24px)', animationDelay: '1.8s' }}
                />

                {/* Header row */}
                <div className="flex items-center justify-between mb-5 relative z-10">
                  <p
                    className="text-[10px] font-black uppercase tracking-[0.28em] flex items-center gap-2"
                    style={{ color: mutedText }}
                  >
                    {/* Triple-ring pulse */}
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
                        style={{ background: secondary, animationDuration: '1.6s' }} />
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-25"
                        style={{ background: secondary, animationDuration: '2.4s', animationDelay: '0.4s' }} />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full"
                        style={{ background: secondary, boxShadow: `0 0 8px ${secondary}` }} />
                    </span>
                    Starts In
                  </p>
                  {/* Gradient pill label */}
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${primary}40, ${secondary}30)`,
                      color: secondary,
                      border: `1px solid ${secondary}40`,
                    }}
                  >
                    Live
                  </span>
                </div>

                {/* Countdown tiles */}
                <div className="grid grid-cols-4 gap-2 relative z-10">
                  {[
                    { v: diffDays, l: 'Days' },
                    { v: diffHrs, l: 'Hrs' },
                    { v: diffMin, l: 'Min' },
                    { v: diffSec, l: 'Sec' },
                  ].map(({ v, l }, i) => {
                    const col = i === 0 ? primary : i === 3 ? secondary : textColor;
                    const isFirst = i === 0;
                    return (
                      <div
                        key={l}
                        className="relative text-center py-4 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-110 hover:-translate-y-1 cursor-default"
                        style={{
                          background: isFirst
                            ? `linear-gradient(145deg, ${primary}40, ${primary}20)`
                            : i === 3
                              ? `linear-gradient(145deg, ${secondary}30, ${secondary}15)`
                              : 'rgba(255,255,255,0.06)',
                          border: `1px solid ${isFirst ? `${primary}60` : i === 3 ? `${secondary}45` : 'rgba(255,255,255,0.1)'}`,
                          boxShadow: isFirst
                            ? `0 6px 24px ${primary}35, inset 0 1px 0 rgba(255,255,255,0.12)`
                            : i === 3
                              ? `0 4px 16px ${secondary}25`
                              : 'none',
                          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                        }}
                      >
                        {/* Top shimmer line */}
                        <div
                          className="absolute inset-x-0 top-0 h-px pointer-events-none"
                          style={{
                            background: `linear-gradient(to right, transparent, ${isFirst ? primary : i === 3 ? secondary : 'rgba(255,255,255,0.3)'}80, transparent)`,
                          }}
                        />
                        {/* Glow orb behind number */}
                        <div
                          className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"
                          style={{
                            background: `radial-gradient(ellipse at 50% 120%, ${col}25, transparent 70%)`,
                          }}
                        />
                        <span
                          className="block text-2xl sm:text-3xl font-black tabular-nums leading-none mb-1 relative z-10"
                          style={{
                            color: col,
                            textShadow: isFirst ? `0 0 20px ${primary}80` : i === 3 ? `0 0 16px ${secondary}60` : 'none',
                          }}
                        >
                          {String(v).padStart(2, '0')}
                        </span>
                        <span
                          className="text-[9px] font-bold uppercase tracking-widest relative z-10"
                          style={{ color: mutedText }}
                        >
                          {l}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════
      DATE / TIME / VENUE INFO CARD
  ════════════════════════════════════════ */}
            <div
              className="rounded-3xl p-5 relative overflow-hidden t3-card flex-1 group"
              style={{ ...glass(0.07, 0.13) }}
            >
              {/* Top accent */}
              <div
                className="absolute top-0 inset-x-0 h-0.5 rounded-t-3xl"
                style={{ background: `linear-gradient(to right, ${secondary}, ${primary})` }}
              />
              {/* Moving shimmer on top line */}
              <div
                className="absolute top-0 left-0 h-0.5 w-12 pointer-events-none"
                style={{
                  background: `linear-gradient(to right, transparent, #fff, transparent)`,
                  animation: 't3-shimmer 4s ease-in-out 1s infinite',
                }}
              />

              {/* Subtle corner glow */}
              <div
                className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none opacity-10 t3-pulse-slow"
                style={{ background: `radial-gradient(circle, ${primary}, transparent)`, filter: 'blur(20px)' }}
              />

              <div className="space-y-1 relative z-10">
                {[
                  { icon: <Calendar className="w-4 h-4" />, label: 'Date', val: fmt(data.startDatetime), col: primary },
                  { icon: <Clock className="w-4 h-4" />, label: 'Time', val: `${fmtTime(data.startDatetime)} – ${fmtTime(data.endDatetime)}`, col: secondary },
                  { icon: <MapPin className="w-4 h-4" />, label: 'Venue', val: data.venueName, col: primary },
                  { icon: <Users className="w-4 h-4" />, label: 'Organiser', val: data.organizerName, col: secondary },
                ].map(({ icon, label, val, col }, i, arr) => (
                  <div key={label}>
                    <div
                      className="flex items-start gap-3 px-3 py-3 rounded-2xl transition-all duration-300 hover:translate-x-1 group/row cursor-default"
                      style={{ background: 'transparent' }}
                      onMouseEnter={e => (e.currentTarget.style.background = `${col}0d`)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Icon box */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover/row:scale-110 group-hover/row:shadow-lg"
                        style={{
                          background: `${col}20`,
                          color: col,
                          boxShadow: `0 0 0 0 ${col}40`,
                          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                        }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = `0 0 16px ${col}50`)}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0 ${col}40`)}
                      >
                        {icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className="text-[9px] font-black uppercase tracking-widest mb-0.5"
                          style={{ color: mutedText }}
                        >
                          {label}
                        </p>
                        <p
                          className="text-sm font-semibold leading-snug"
                          style={{ color: textColor }}
                        >
                          {val}
                        </p>
                      </div>

                      {/* Arrow hint on hover */}
                      <ArrowUpRight
                        className="w-3.5 h-3.5 shrink-0 mt-1 opacity-0 group-hover/row:opacity-100 transition-all duration-300 group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5"
                        style={{ color: col }}
                      />
                    </div>

                    {i < arr.length - 1 && (
                      <div
                        className="mx-3 h-px"
                        style={{ background: `linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent)` }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ════════════════════════════════════════
      CTA BENTO CARD
  ════════════════════════════════════════ */}
            <div
              className="rounded-3xl p-6 relative overflow-hidden t3-card group"
              style={{
                background: `linear-gradient(145deg, ${primary}50, ${secondary}28)`,
                border: `1px solid ${primary}55`,
                boxShadow: `0 16px 50px ${primary}35, 0 4px 16px rgba(0,0,0,0.2)`,
              }}
            >
              {/* Rotating conic border halo */}
              <div
                className="absolute -inset-0.5 rounded-3xl pointer-events-none opacity-30 t3-spin-s"
                style={{
                  background: `conic-gradient(from 0deg, ${primary}00, ${primary}, ${secondary}, ${primary}00)`,
                  filter: 'blur(8px)',
                }}
              />

              {/* Top accent */}
              <div
                className="absolute top-0 inset-x-0 h-0.5 rounded-t-3xl"
                style={{ background: `linear-gradient(to right, ${primary}, ${secondary}, ${primary})` }}
              />

              {/* Large animated orbs */}
              <div
                className="absolute -top-14 -right-14 w-44 h-44 rounded-full pointer-events-none opacity-35 t3-pulse-slow"
                style={{ background: `radial-gradient(circle, ${secondary}cc, transparent)`, filter: 'blur(30px)' }}
              />
              <div
                className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full pointer-events-none opacity-30 t3-pulse-slow"
                style={{ background: `radial-gradient(circle, ${primary}cc, transparent)`, filter: 'blur(25px)', animationDelay: '1.5s' }}
              />
              {/* Centre shimmer sweep */}
              <div className="t3-shimmer" />

              {/* Floating sparkle dots */}
              {[
                { top: '12%', right: '18%', size: 3, delay: '0s' },
                { top: '40%', right: '8%', size: 2, delay: '0.9s' },
                { top: '70%', right: '25%', size: 2, delay: '1.6s' },
              ].map((p, i) => (
                <div
                  key={i}
                  className="absolute rounded-full pointer-events-none t3-float"
                  style={{
                    top: p.top, right: p.right,
                    width: p.size, height: p.size,
                    background: '#fff',
                    opacity: 0.5,
                    animationDelay: p.delay,
                  }}
                />
              ))}

              <div className="relative z-10">
                {/* Label */}
                <p
                  className="text-[10px] font-black uppercase tracking-[0.25em] mb-1"
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                >
                  Entry from
                </p>

                {/* Price — glowing */}
                <p
                  className="text-4xl font-black text-white tabular-nums mb-2"
                  style={{
                    textShadow: `0 0 30px rgba(255,255,255,0.3), 0 2px 12px rgba(0,0,0,0.4)`,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {startPrice !== null ? `Rs.${startPrice.toLocaleString()}` : 'TBA'}
                </p>
                <p className="text-[10px] mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>per person · all tiers available</p>

                {/* CTA button */}
                <button
                  onClick={onCheckout}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white relative overflow-hidden group/btn"
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.35)',
                    backdropFilter: 'blur(12px)',
                    transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.28)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.18)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.2)';
                  }}
                >
                  {/* Shimmer sweep on hover */}
                  <span
                    className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      animation: 't3-shimmer 1.2s ease infinite',
                      transition: 'opacity 0.2s ease',
                    }}
                  />
                  {/* Glow behind button on hover */}
                  <span
                    className="absolute -inset-1 rounded-2xl opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.15), transparent 70%)`,
                    }}
                  />

                  <Ticket
                    className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover/btn:rotate-12 group-hover/btn:scale-110"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.7))' }}
                  />
                  <span className="relative z-10">Get Tickets</span>
                  <ArrowUpRight
                    className="w-4 h-4 relative z-10 t3-bounce-x"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }}
                  />
                </button>

                {/* Payment methods row */}
                <div className="flex items-center justify-center gap-3 mt-4">
                  <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.12)' }} />
                  <p className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    JazzCash · EasyPaisa
                  </p>
                  <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.12)' }} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          MAIN SECTIONS — Glass bento cards
      ════════════════════════════════════════ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-32 space-y-20">

        {/* ── OVERVIEW ── */}
        {enabledTabs.includes('overview') && (
          <section id="overview" ref={el => { sectionRefs.current['overview'] = el; }} style={{ scrollMarginTop: '80px' }}>
            <GlassHeading label="Overview" primary={primary} secondary={secondary} textColor={textColor} />

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">

              {/* ════════════════════════════════════════
          DESCRIPTION CARD — enhanced
      ════════════════════════════════════════ */}
              <div
                className="rounded-3xl p-8 relative overflow-hidden t3-card group"
                style={{ ...glass(0.06, 0.12) }}
              >
                {/* Top accent with moving shimmer */}
                <div className="absolute top-0 inset-x-0 h-0.5 rounded-t-3xl"
                  style={{ background: `linear-gradient(to right, ${primary}, ${secondary})` }} />
                <div
                  className="absolute top-0 left-0 h-0.5 w-20 rounded-t-3xl pointer-events-none"
                  style={{
                    background: `linear-gradient(to right, transparent, #fff, transparent)`,
                    animation: 't3-shimmer 4s ease-in-out infinite',
                  }}
                />

                {/* Corner glow orbs */}
                <div
                  className="absolute -bottom-14 -right-14 w-44 h-44 rounded-full pointer-events-none opacity-12 t3-pulse-slow"
                  style={{ background: `radial-gradient(circle, ${primary}, transparent)`, filter: 'blur(32px)' }}
                />
                <div
                  className="absolute -top-10 -left-10 w-32 h-32 rounded-full pointer-events-none opacity-8 t3-pulse-slow"
                  style={{ background: `radial-gradient(circle, ${secondary}, transparent)`, filter: 'blur(28px)', animationDelay: '2s' }}
                />

                {/* Hover border glow */}
                <div
                  className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ boxShadow: `inset 0 0 40px ${primary}12, 0 0 40px ${primary}10` }}
                />

                {/* Shimmer sweep */}
                <div className="t3-shimmer" />

                {/* Opening quote mark */}
                <div
                  className="absolute top-5 right-7 text-[5rem] font-black leading-none pointer-events-none select-none opacity-[0.04] group-hover:opacity-[0.07] transition-opacity duration-500"
                  style={{ color: primary }}
                >
                  "
                </div>

                {/* Description text */}
                <p
                  className="text-base sm:text-lg leading-[1.85] font-light relative z-10"
                  style={{ color: textColor }}
                >
                  {data.description}
                </p>

                {/* Bottom rule with dot */}
                <div className="flex items-center gap-3 mt-7 relative z-10">
                  <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${primary}50, transparent)` }} />
                  <div
                    className="w-2 h-2 rounded-full t3-pulse-slow"
                    style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                  />
                  <div className="h-px flex-1" style={{ background: `linear-gradient(to left, ${secondary}50, transparent)` }} />
                </div>

                {/* Tags row */}
                {data.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 relative z-10">
                    {data.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
                        style={{
                          background: i % 2 === 0 ? `${primary}20` : `${secondary}20`,
                          color: i % 2 === 0 ? primary : secondary,
                          border: `1px solid ${i % 2 === 0 ? `${primary}40` : `${secondary}40`}`,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ════════════════════════════════════════
          RIGHT PANEL — Event Snapshot (replaces quick facts)
          4 mini bento tiles in a 2x2 grid
          + a "Join" CTA strip at the bottom
      ════════════════════════════════════════ */}
              <div className="flex flex-col gap-4">

                {/* 2×2 mini bento grid */}
                <div className="grid grid-cols-2 gap-3 flex-1">
                  {[
                    {
                      icon: <Calendar className="w-5 h-5" />,
                      label: 'Date',
                      val: fmtShort(data.startDatetime),
                      col: primary,
                      delay: '0s',
                    },
                    {
                      icon: <Clock className="w-5 h-5" />,
                      label: 'Duration',
                      val: (() => {
                        const start = new Date(data.startDatetime);
                        const end = new Date(data.endDatetime);
                        const mins = Math.round((end.getTime() - start.getTime()) / 60000);
                        const h = Math.floor(mins / 60);
                        const m = mins % 60;
                        return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}`.trim() : `${m}m`;
                      })(),
                      col: secondary,
                      delay: '0.1s',
                    },
                    {
                      icon: <MapPin className="w-5 h-5" />,
                      label: 'Venue',
                      val: data.venueName,
                      col: secondary,
                      delay: '0.2s',
                    },
                    {
                      icon: <Ticket className="w-5 h-5" />,
                      label: 'From',
                      val: startPrice !== null ? `Rs.${startPrice.toLocaleString()}` : 'Free',
                      col: primary,
                      delay: '0.3s',
                    },
                  ].map(({ icon, label, val, col, delay }) => (
                    <div
                      key={label}
                      className="rounded-2xl p-4 relative overflow-hidden t3-card group/tile flex flex-col gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-default"
                      style={{
                        ...glass(0.07, 0.13),
                        animationDelay: delay,
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${col}30`;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      }}
                    >
                      {/* Top accent line */}
                      <div
                        className="absolute top-0 inset-x-0 h-0.5 rounded-t-2xl"
                        style={{ background: `linear-gradient(to right, ${col}, ${col}00)` }}
                      />
                      {/* Background glow on hover */}
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover/tile:opacity-100 transition-opacity duration-400 pointer-events-none"
                        style={{ background: `radial-gradient(ellipse at 0% 0%, ${col}15, transparent 70%)` }}
                      />
                      {/* Shimmer */}
                      <div className="t3-shimmer" />

                      {/* Icon */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover/tile:scale-110 group-hover/tile:shadow-lg relative z-10"
                        style={{
                          background: `${col}22`,
                          color: col,
                          boxShadow: `0 0 0 0 ${col}`,
                          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                        }}
                      >
                        {icon}
                      </div>

                      {/* Label + value */}
                      <div className="relative z-10 min-w-0">
                        <p
                          className="text-[9px] font-black uppercase tracking-[0.22em] mb-0.5"
                          style={{ color: mutedText }}
                        >
                          {label}
                        </p>
                        <p
                          className="text-sm font-black leading-snug truncate"
                          style={{ color: textColor }}
                        >
                          {val}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Organiser strip */}
                <div
                  className="rounded-2xl px-5 py-4 flex items-center gap-4 relative overflow-hidden t3-card group/org"
                  style={{ ...glass(0.07, 0.13) }}
                >
                  <div
                    className="absolute top-0 inset-x-0 h-0.5 rounded-t-2xl"
                    style={{ background: `linear-gradient(to right, ${secondary}, ${primary})` }}
                  />
                  <div className="t3-shimmer" />

                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 t3-pulse-slow relative z-10"
                    style={{
                      background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                      boxShadow: `0 0 16px ${primary}50`,
                    }}
                  >
                    <Users className="w-4 h-4 text-white" />
                  </div>

                  <div className="flex-1 min-w-0 relative z-10">
                    <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: mutedText }}>
                      Organized by
                    </p>
                    <p className="text-sm font-black truncate" style={{ color: textColor }}>
                      {data.organizerName}
                    </p>
                  </div>

                  <div
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover/org:opacity-100 transition-all duration-300 group-hover/org:translate-x-0.5 relative z-10"
                    style={{ background: `${primary}25`, color: primary }}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* "Secure your spot" CTA strip */}
                <button
                  onClick={onCheckout}
                  className="rounded-2xl px-5 py-4 flex items-center justify-between gap-3 relative overflow-hidden group/cta transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${primary}50, ${secondary}30)`,
                    border: `1px solid ${primary}50`,
                    boxShadow: `0 8px 28px ${primary}25`,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 12px 40px ${primary}45`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 28px ${primary}25`;
                  }}
                >
                  {/* Shimmer sweep */}
                  <span
                    className="absolute inset-0 opacity-0 group-hover/cta:opacity-100 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                      animation: 't3-shimmer 1.4s ease infinite',
                      transition: 'opacity 0.2s ease',
                    }}
                  />
                  {/* Rotating halo */}
                  <div
                    className="absolute -inset-1 rounded-2xl pointer-events-none opacity-0 group-hover/cta:opacity-20 t3-spin-s transition-opacity duration-300"
                    style={{
                      background: `conic-gradient(from 0deg, ${primary}00, ${primary}, ${secondary}, ${primary}00)`,
                      filter: 'blur(6px)',
                    }}
                  />

                  <div className="relative z-10">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-0.5">
                      Limited Spots
                    </p>
                    <p className="text-sm font-black text-white leading-none">
                      Secure Your Spot
                    </p>
                  </div>

                  <div
                    className="relative z-10 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover/cta:scale-110 group-hover/cta:rotate-12"
                    style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
                  >
                    <ArrowUpRight
                      className="w-4 h-4 text-white"
                      style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' }}
                    />
                  </div>
                </button>

              </div>
            </div>
          </section>
        )}

        {/* ── SCHEDULE ── */}
        {enabledTabs.includes('schedule') && (
          <section id="schedule" ref={el => { sectionRefs.current['schedule'] = el; }} style={{ scrollMarginTop: '80px' }}>
            <GlassHeading label="Schedule" primary={primary} secondary={secondary} textColor={textColor} />

            <div className="mt-8 space-y-4">
              {data.agenda.length === 0 ? (
                <div className="rounded-3xl p-16 text-center relative overflow-hidden t3-card" style={{ ...glass(0.06, 0.12) }}>
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at 50% 60%, ${primary}12, transparent 70%)` }} />
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 t3-pulse-slow"
                    style={{ background: `${primary}20`, border: `1px solid ${primary}30` }}
                  >
                    <Clock className="w-7 h-7" style={{ color: primary }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: mutedText }}>No schedule published yet.</p>
                </div>
              ) : (
                data.agenda.map((item, idx) => {
                  const col = idx % 2 === 0 ? primary : secondary;
                  const colAlt = idx % 2 === 0 ? secondary : primary;
                  const isEven = idx % 2 === 0;

                  return (
                    <div
                      key={item.id}
                      className="rounded-3xl overflow-hidden relative t3-card group"
                      style={{
                        ...glass(0.06, 0.12),
                        transition: 'all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px ${col}30, 0 4px 20px rgba(0,0,0,0.2)`;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      }}
                    >
                      {/* ── Top accent gradient line ── */}
                      <div
                        className="absolute top-0 inset-x-0 h-0.5 z-10"
                        style={{ background: `linear-gradient(to right, ${col}, ${colAlt}60, transparent)` }}
                      />
                      {/* Moving shimmer along top line */}
                      <div
                        className="absolute top-0 left-0 h-0.5 w-24 pointer-events-none z-10"
                        style={{
                          background: `linear-gradient(to right, transparent, rgba(255,255,255,0.9), transparent)`,
                          animation: `t3-shimmer ${3 + idx * 0.4}s ease-in-out ${idx * 0.3}s infinite`,
                        }}
                      />

                      {/* ── Hover background sweep ── */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                          background: `linear-gradient(135deg, ${col}0a 0%, transparent 50%, ${colAlt}06 100%)`,
                        }}
                      />

                      {/* ── Animated corner accent ── */}
                      <div
                        className="absolute bottom-0 right-0 w-24 h-24 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: `radial-gradient(circle, ${colAlt}20, transparent)`,
                          filter: 'blur(16px)',
                          transform: 'translate(30%, 30%)',
                        }}
                      />

                      {/* ── Shimmer sweep on hover ── */}
                      <div className="t3-shimmer" />

                      {/* ── Index number watermark ── */}
                      <div
                        className="absolute right-5 top-1/2 -translate-y-1/2 font-black leading-none select-none pointer-events-none opacity-[0.035] group-hover:opacity-[0.065] transition-opacity duration-500"
                        style={{ color: col, fontSize: 'clamp(3.5rem, 6vw, 5rem)' }}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr]">

                        {/* ── TIME COLUMN ── */}
                        <div
                          className="relative flex sm:flex-col items-center sm:items-center justify-between sm:justify-center gap-2 px-5 py-5 sm:py-7 overflow-hidden"
                          style={{
                            background: isEven
                              ? `linear-gradient(160deg, ${primary}22, ${primary}0a)`
                              : `linear-gradient(160deg, ${secondary}22, ${secondary}0a)`,
                            borderRight: '1px solid rgba(255,255,255,0.07)',
                          }}
                        >
                          {/* Hover fill */}
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                            style={{ background: `${col}12` }}
                          />

                          {/* Vertical timeline dot + line */}
                          <div className="hidden sm:flex flex-col items-center gap-1 absolute top-3 left-1/2 -translate-x-1/2">
                            <div
                              className="w-2 h-2 rounded-full t3-pulse-slow shrink-0"
                              style={{ background: col, boxShadow: `0 0 8px ${col}` }}
                            />
                          </div>

                          <div className="relative z-10 text-center">
                            <span
                              className="block text-xs font-black tabular-nums"
                              style={{
                                color: col,
                                textShadow: `0 0 12px ${col}60`,
                              }}
                            >
                              {fmtTime(item.startTime)}
                            </span>
                            <div
                              className="hidden sm:block w-4 h-px my-2 mx-auto"
                              style={{ background: `${col}50` }}
                            />
                            <span className="text-[10px] font-medium" style={{ color: mutedText }}>
                              {fmtTime(item.endTime)}
                            </span>
                          </div>

                          {/* Duration pill */}
                          {(() => {
                            const start = new Date(item.startTime);
                            const end = new Date(item.endTime);
                            const mins = Math.round((end.getTime() - start.getTime()) / 60000);
                            if (isNaN(mins) || mins <= 0) return null;
                            const h = Math.floor(mins / 60);
                            const m = mins % 60;
                            const label = h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`;
                            return (
                              <div
                                className="relative z-10 mt-1 sm:mt-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                                style={{
                                  background: `${col}20`,
                                  color: col,
                                  border: `1px solid ${col}35`,
                                }}
                              >
                                {label}
                              </div>
                            );
                          })()}
                        </div>

                        {/* ── CONTENT COLUMN ── */}
                        <div className="flex items-start gap-5 px-6 py-6 relative z-10">

                          {/* Image or number badge */}
                          {item.imageUrl ? (
                            <div
                              className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden relative"
                              style={{
                                border: `2px solid ${col}45`,
                                boxShadow: `0 4px 20px ${col}25`,
                                transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                              }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.transform = 'scale(1.08) rotate(2deg)';
                                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${col}45`;
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.transform = 'scale(1) rotate(0deg)';
                                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${col}25`;
                              }}
                            >
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              {/* Image overlay glow */}
                              <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                                style={{ background: `linear-gradient(135deg, ${col}30, transparent)` }}
                              />
                            </div>
                          ) : (
                            <div
                              className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black relative overflow-hidden"
                              style={{
                                background: `linear-gradient(135deg, ${col}30, ${col}15)`,
                                color: col,
                                border: `1px solid ${col}40`,
                                boxShadow: `0 4px 16px ${col}20`,
                                transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                              }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.transform = 'scale(1.12) rotate(-4deg)';
                                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 28px ${col}45`;
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.transform = 'scale(1) rotate(0deg)';
                                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${col}20`;
                              }}
                            >
                              {/* Inner shimmer */}
                              <div
                                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)' }}
                              />
                              <span className="relative z-10">{String(idx + 1).padStart(2, '0')}</span>
                            </div>
                          )}

                          {/* Text content */}
                          <div className="flex-1 min-w-0">
                            <h4
                              className="font-black text-sm sm:text-base leading-snug mb-2 transition-colors duration-300"
                              style={{ color: textColor }}
                            >
                              {item.title}
                            </h4>

                            {item.roomOrLocation && (
                              <p
                                className="text-xs flex items-center gap-1.5 mb-2 w-fit px-2.5 py-1 rounded-full"
                                style={{
                                  color: mutedText,
                                  background: `${col}12`,
                                  border: `1px solid ${col}25`,
                                }}
                              >
                                <MapPin className="w-3 h-3 shrink-0" style={{ color: col }} />
                                {item.roomOrLocation}
                              </p>
                            )}

                            {item.description && (
                              <p
                                className="text-xs sm:text-sm leading-relaxed"
                                style={{ color: mutedText }}
                              >
                                {item.description}
                              </p>
                            )}

                            {/* Bottom accent line — slides in on hover */}
                            <div
                              className="mt-3 h-px w-0 group-hover:w-full transition-all duration-500 rounded-full"
                              style={{ background: `linear-gradient(to right, ${col}60, transparent)` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* ── TICKETS ── */}
        {enabledTabs.includes('tickets') && (
          <section id="tickets" ref={el => { sectionRefs.current['tickets'] = el; }} style={{ scrollMarginTop: '80px' }}>
            <GlassHeading label="Tickets" primary={primary} secondary={secondary} textColor={textColor} />

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {data.tickets.length === 0 ? (
                <div className="col-span-full rounded-3xl p-16 text-center relative overflow-hidden t3-card" style={{ ...glass(0.06, 0.12) }}>
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at 50% 60%, ${primary}10, transparent 70%)` }} />
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 t3-pulse-slow"
                    style={{ background: `${primary}20`, border: `1px solid ${primary}30` }}
                  >
                    <Ticket className="w-7 h-7" style={{ color: primary }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: mutedText }}>No tickets available yet.</p>
                </div>
              ) : (
                [...data.tickets].sort((a, b) => a.price - b.price).map((ticket, idx) => {
                  const isFeat = idx === 0;
                  const col = idx % 2 === 0 ? primary : secondary;
                  const colAlt = idx % 2 === 0 ? secondary : primary;

                  return (
                    <div
                      key={ticket.id}
                      className={`rounded-3xl flex flex-col relative overflow-hidden t3-card group ${ticket.soldOut ? 'opacity-50' : ''}`}
                      style={{
                        ...(isFeat ? {
                          background: `linear-gradient(145deg, ${primary}40, ${secondary}20)`,
                          border: `1px solid ${primary}60`,
                          boxShadow: `0 16px 50px ${primary}30`,
                        } : glass(0.07, 0.13)),
                        transition: 'all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)',
                      }}
                      onMouseEnter={e => {
                        if (ticket.soldOut) return;
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)';
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 24px 60px ${col}40, 0 4px 20px rgba(0,0,0,0.2)`;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                        (e.currentTarget as HTMLElement).style.boxShadow = isFeat
                          ? `0 16px 50px ${primary}30`
                          : 'none';
                      }}
                    >
                      {/* ── Rotating conic halo (featured only) ── */}
                      {isFeat && (
                        <div
                          className="absolute -inset-0.5 rounded-3xl pointer-events-none opacity-25 t3-spin-s"
                          style={{
                            background: `conic-gradient(from 0deg, ${primary}00, ${primary}, ${secondary}, ${primary}00)`,
                            filter: 'blur(8px)',
                          }}
                        />
                      )}

                      {/* ── Top accent line with shimmer ── */}
                      <div
                        className="absolute top-0 inset-x-0 h-0.5 rounded-t-3xl z-10"
                        style={{ background: `linear-gradient(to right, ${col}, ${colAlt}60, transparent)` }}
                      />
                      <div
                        className="absolute top-0 left-0 h-0.5 w-20 rounded-t-3xl pointer-events-none z-10"
                        style={{
                          background: `linear-gradient(to right, transparent, rgba(255,255,255,0.9), transparent)`,
                          animation: `t3-shimmer ${3.5 + idx * 0.5}s ease-in-out ${idx * 0.4}s infinite`,
                        }}
                      />

                      {/* ── Hover bg sweep ── */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ background: `linear-gradient(160deg, ${col}0e 0%, transparent 55%, ${colAlt}08 100%)` }}
                      />

                      {/* ── Glow orbs ── */}
                      <div
                        className="absolute -top-14 -right-14 w-44 h-44 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 t3-pulse-slow"
                        style={{ background: `radial-gradient(circle, ${col}50, transparent)`, filter: 'blur(32px)' }}
                      />
                      {isFeat && (
                        <div
                          className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full pointer-events-none opacity-30 t3-pulse-slow"
                          style={{ background: `radial-gradient(circle, ${colAlt}80, transparent)`, filter: 'blur(28px)', animationDelay: '1.5s' }}
                        />
                      )}

                      {/* ── Shimmer sweep ── */}
                      <div className="t3-shimmer" />

                      {/* ── Ghost tier number watermark ── */}
                      <div
                        className="absolute bottom-4 right-5 font-black leading-none select-none pointer-events-none opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500"
                        style={{ color: col, fontSize: 'clamp(4rem, 7vw, 6rem)' }}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </div>

                      <div className="p-7 flex flex-col flex-1 relative z-10">

                        {/* ── Top row: icon + badge ── */}
                        <div className="flex items-start justify-between mb-6">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, ${col}30, ${col}15)`,
                              border: `1px solid ${col}40`,
                              boxShadow: `0 4px 16px ${col}20`,
                              transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.transform = 'scale(1.12) rotate(-6deg)';
                              (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 28px ${col}50`;
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.transform = 'scale(1) rotate(0deg)';
                              (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${col}20`;
                            }}
                          >
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)' }}
                            />
                            <Ticket
                              className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:rotate-12"
                              style={{ color: col, filter: `drop-shadow(0 0 6px ${col}80)` }}
                            />
                          </div>

                          {/* Badges */}
                          <div className="flex flex-col items-end gap-1.5">
                            {isFeat && !ticket.soldOut && (
                              <span
                                className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full t3-pulse-slow"
                                style={{
                                  background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                                  color: '#fff',
                                  boxShadow: `0 4px 16px ${primary}50`,
                                }}
                              >
                                ★ Best Value
                              </span>
                            )}
                            {ticket.soldOut && (
                              <span
                                className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                                style={{
                                  background: 'rgba(239,68,68,0.15)',
                                  color: '#ef4444',
                                  border: '1px solid rgba(239,68,68,0.3)',
                                }}
                              >
                                Sold Out
                              </span>
                            )}
                            <span
                              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                              style={{
                                background: `${col}18`,
                                color: col,
                                border: `1px solid ${col}30`,
                              }}
                            >
                              Tier {String(idx + 1).padStart(2, '0')}
                            </span>
                          </div>
                        </div>

                        {/* ── Tier name ── */}
                        <h3
                          className="font-black text-xl uppercase tracking-tight leading-snug mb-1"
                          style={{ color: textColor }}
                        >
                          {ticket.tierName}
                        </h3>
                        <p className="text-[10px] font-semibold mb-auto" style={{ color: mutedText }}>
                          {ticket.soldOut ? 'This tier is no longer available' : 'Per person · All access'}
                        </p>

                        {/* ── Divider with animated dots ── */}
                        <div className="flex items-center gap-2 my-5">
                          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${col}40, transparent)` }} />
                          {[0, 1, 2].map(i => (
                            <div
                              key={i}
                              className="w-1 h-1 rounded-full t3-pulse-slow"
                              style={{
                                background: i === 1 ? col : `${col}50`,
                                animationDelay: `${i * 0.3}s`,
                              }}
                            />
                          ))}
                          <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, ${col}40, transparent)` }} />
                        </div>

                        {/* ── Price row ── */}
                        <div className="flex items-end justify-between">
                          <div>
                            <p
                              className="text-3xl sm:text-4xl font-black tabular-nums leading-none"
                              style={{
                                color: ticket.soldOut ? '#ef4444' : col,
                                textShadow: ticket.soldOut ? 'none' : `0 0 24px ${col}50`,
                                letterSpacing: '-0.02em',
                              }}
                            >
                              {ticket.soldOut ? '—' : `Rs.${ticket.price.toLocaleString()}`}
                            </p>
                            {!ticket.soldOut && (
                              <p
                                className="text-[10px] mt-1 uppercase tracking-widest font-bold"
                                style={{ color: mutedText }}
                              >
                                per person
                              </p>
                            )}
                          </div>

                          {/* Arrow CTA */}
                          {!ticket.soldOut && (
                            <button
                              onClick={onCheckout}
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden group/arrow"
                              style={{
                                background: `${col}20`,
                                border: `1px solid ${col}40`,
                                transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                              }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = col;
                                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.12)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 20px ${col}60`;
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = `${col}20`;
                                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                              }}
                            >
                              <ArrowUpRight
                                className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover/arrow:-translate-y-0.5 group-hover/arrow:translate-x-0.5"
                                style={{ color: col }}
                              />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── BOTTOM CTA BAR ── */}
            {data.tickets.length > 0 && (
              <div
                className="mt-8 rounded-3xl p-6 relative overflow-hidden t3-card flex flex-wrap items-center justify-between gap-5 group"
                style={{
                  ...glass(0.07, 0.13),
                  border: `1px solid ${primary}30`,
                }}
              >
                {/* Top accent */}
                <div
                  className="absolute top-0 inset-x-0 h-0.5 rounded-t-3xl"
                  style={{ background: `linear-gradient(to right, ${primary}, ${secondary})` }}
                />
                {/* Moving shimmer */}
                <div
                  className="absolute top-0 left-0 h-0.5 w-24 pointer-events-none"
                  style={{
                    background: `linear-gradient(to right, transparent, rgba(255,255,255,0.9), transparent)`,
                    animation: 't3-shimmer 3s ease-in-out infinite',
                  }}
                />
                {/* Background glow */}
                <div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 0% 50%, ${primary}10, transparent 60%)` }}
                />
                <div className="t3-shimmer" />

                {/* Left: price summary */}
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: mutedText }}>
                    Tickets starting from
                  </p>
                  <p
                    className="text-2xl font-black tabular-nums"
                    style={{
                      color: primary,
                      textShadow: `0 0 20px ${primary}50`,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Rs.{startPrice?.toLocaleString() ?? 'TBA'}
                  </p>
                </div>

                {/* Right: CTA + payment */}
                <div className="flex flex-wrap items-center gap-4 relative z-10">
                  {/* Payment badges */}
                  <div className="flex items-center gap-2">
                    {['JazzCash', 'EasyPaisa'].map((method, i) => (
                      <span
                        key={method}
                        className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full"
                        style={{
                          background: i === 0 ? `${primary}18` : `${secondary}18`,
                          color: i === 0 ? primary : secondary,
                          border: `1px solid ${i === 0 ? `${primary}30` : `${secondary}30`}`,
                        }}
                      >
                        {method}
                      </span>
                    ))}
                  </div>

                  {/* Main CTA */}
                  <button
                    onClick={onCheckout}
                    className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider text-white relative overflow-hidden group/btn"
                    style={{
                      background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                      boxShadow: `0 8px 28px ${primary}45`,
                      transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 14px 40px ${primary}65`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 28px ${primary}45`;
                    }}
                  >
                    {/* Shimmer on hover */}
                    <span
                      className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 pointer-events-none"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)',
                        animation: 't3-shimmer 1.2s ease infinite',
                        transition: 'opacity 0.2s ease',
                      }}
                    />
                    <Ticket
                      className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover/btn:rotate-12"
                      style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' }}
                    />
                    <span className="relative z-10">Buy Tickets</span>
                    <ArrowUpRight
                      className="w-4 h-4 relative z-10 t3-bounce-x"
                      style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.5))' }}
                    />
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── LOCATION ── */}
        {enabledTabs.includes('location') && (
          <section id="location" ref={el => { sectionRefs.current['location'] = el; }} style={{ scrollMarginTop: '80px' }}>
            <GlassHeading label="Location" primary={primary} secondary={secondary} textColor={textColor} />

            <div
              className="mt-8 rounded-3xl overflow-hidden group relative transition-all duration-700"
              style={{
                ...glass(0.06, 0.12),
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 24px 60px ${primary}25, 0 10px 20px rgba(0,0,0,0.2)`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
              }}
            >
              {/* Top Gradient Accent */}
              <div
                className="absolute top-0 inset-x-0 h-0.5 z-20"
                style={{ background: `linear-gradient(to right, ${primary}, ${secondary}, ${primary})`, backgroundSize: '200% auto', animation: 't3-shimmer 4s linear infinite' }}
              />

              {/* Map Container */}
              <div className="relative overflow-hidden">
                {/* Animated Corner Brackets */}
                <span
                  className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 z-10 transition-all duration-500 group-hover:w-14 group-hover:h-14 group-hover:opacity-100 opacity-60"
                  style={{ borderColor: primary, filter: `drop-shadow(0 0 8px ${primary})` }}
                />
                <span
                  className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 z-10 transition-all duration-500 group-hover:w-14 group-hover:h-14 group-hover:opacity-100 opacity-60"
                  style={{ borderColor: secondary, filter: `drop-shadow(0 0 8px ${secondary})` }}
                />
                <span
                  className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 z-10 transition-all duration-500 group-hover:w-14 group-hover:h-14 group-hover:opacity-100 opacity-60"
                  style={{ borderColor: secondary, filter: `drop-shadow(0 0 8px ${secondary})` }}
                />
                <span
                  className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 z-10 transition-all duration-500 group-hover:w-14 group-hover:h-14 group-hover:opacity-100 opacity-60"
                  style={{ borderColor: primary, filter: `drop-shadow(0 0 8px ${primary})` }}
                />

                {/* Hover Overlay Sweep */}
                <div
                  className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: `radial-gradient(circle at center, transparent 40%, ${primary}15 100%)` }}
                />

                <iframe
                  src={`https://maps.google.com/maps?q=${mapQ}&output=embed&z=15`}
                  width="100%" height="400"
                  className="transition-all duration-700 group-hover:scale-[1.02]"
                  style={{ border: 0, display: 'block', filter: isLight ? 'none' : 'brightness(0.75) contrast(1.1) saturate(0.8)' }}
                  allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  title="Event Location"
                />
              </div>

              {/* Footer Info Section */}
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-7 py-5 relative z-10"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: `linear-gradient(to bottom, transparent, ${primary}05)` }}
              >
                <div className="flex items-start gap-4">
                  {/* Pulsing Map Pin Container */}
                  <div className="relative">
                    <div
                      className="absolute inset-0 rounded-xl opacity-40 animate-ping"
                      style={{ background: secondary }}
                    />
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative z-10 transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-6"
                      style={{ background: `${secondary}22`, color: secondary, border: `1px solid ${secondary}40` }}
                    >
                      <MapPin className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80 transition-opacity duration-300 group-hover:opacity-100" style={{ color: mutedText }}>
                      Venue Address
                    </p>
                    <p className="text-sm font-bold transition-all duration-300 group-hover:translate-x-1" style={{ color: textColor }}>
                      {locationStr}
                    </p>
                  </div>
                </div>

                {/* Enhanced Maps Button */}
                <a
                  href={`https://maps.google.com/maps?q=${mapQ}`}
                  target="_blank" rel="noopener noreferrer"
                  className="relative overflow-hidden group/btn inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl transition-all duration-300 hover:-translate-y-1 whitespace-nowrap"
                  style={{ background: `${primary}15`, color: primary, border: `1px solid ${primary}40` }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = `${primary}25`;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 20px ${primary}30`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = `${primary}15`;
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  {/* Button Hover Shimmer */}
                  <span
                    className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      animation: 't3-shimmer 1.5s ease infinite'
                    }}
                  />
                  <span className="relative z-10">Open Maps</span>
                  <ExternalLink className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                </a>
              </div>
            </div>
          </section>
        )}

        {/* ── CONTACT ── */}
        {enabledTabs.includes('contact') && (
          <section id="contact" ref={el => { sectionRefs.current['contact'] = el; }} style={{ scrollMarginTop: '80px' }}>
            <GlassHeading label="Contact" primary={primary} secondary={secondary} textColor={textColor} />

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { icon: <Users className="w-5 h-5" />, label: 'Organiser', value: data.organizerName, href: undefined },
                { icon: <Mail className="w-5 h-5" />, label: 'Email', value: data.organizerEmail, href: data.organizerEmail ? `mailto:${data.organizerEmail}` : undefined },
                { icon: <Phone className="w-5 h-5" />, label: 'Phone', value: data.organizerPhone, href: data.organizerPhone ? `tel:${data.organizerPhone}` : undefined },
              ].filter(c => c.value).map((c, i) => {
                const col = i % 2 === 0 ? primary : secondary;
                const colAlt = i % 2 === 0 ? secondary : primary;
                const hasLink = !!c.href;

                return (
                  <div
                    key={c.label}
                    className="rounded-3xl p-6 flex flex-col gap-5 relative t3-card group transition-all duration-500 overflow-visible"
                    style={{
                      ...glass(0.06, 0.12),
                      transition: 'all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)'
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 45px ${col}20, 0 4px 15px rgba(0,0,0,0.15)`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                  >
                    {/* Background Morphing Shape 1 - Continuously morphs and pulses */}
                    <div
                      className="absolute t3-blob1 t3-pulse-slow pointer-events-none opacity-20"
                      style={{
                        inset: '-10%',
                        background: `radial-gradient(ellipse at center, ${col}25, transparent 70%)`,
                        filter: 'blur(32px)',
                        animationDelay: `${i * 0.4}s`
                      }}
                    />

                    {/* Background Morphing Shape 2 - Alternating color, continuous morph */}
                    <div
                      className="absolute t3-blob2 t3-pulse-slow pointer-events-none opacity-15"
                      style={{
                        inset: '-15%',
                        background: `radial-gradient(ellipse at center, ${colAlt}15, transparent 65%)`,
                        filter: 'blur(32px)',
                        animationDelay: `${(i * 0.4) + 1}s`
                      }}
                    />

                    {/* Upper Corner Faint Light Spill */}
                    <div
                      className="absolute -top-12 -left-12 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl pointer-events-none"
                      style={{ background: col }}
                    />

                    <div className="t3-shimmer" />

                    {/* Top Row: Icon Box & Staggered Connect Tag */}
                    <div className="flex items-center justify-between relative z-10">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-125 group-hover:-rotate-12 group-hover:shadow-glow relative"
                        style={{
                          background: `linear-gradient(135deg, ${col}25, ${col}08)`,
                          color: col,
                          border: `1px solid ${col}35`,
                          boxShadow: `0 4px 12px ${col}10`
                        }}
                      >
                        {/* Subtle Inner Lens Flare Reflection */}
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15), transparent)' }} />
                        <span style={{ filter: `drop-shadow(0 0 6px ${col}60)` }}>{c.icon}</span>
                      </div>

                      {hasLink && (
                        <span
                          className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full opacity-40 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-x-1 shimmer"
                          style={{
                            background: `${col}12`,
                            color: col,
                            border: `1px solid ${col}20`
                          }}
                        >
                          Connect
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Staggered Text Content & Interactive Link States */}
                    <div className="relative z-10 flex flex-col grow justify-between t3-slide-up" style={{ animationDelay: `${i * 0.12}s` }}>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] mb-1 opacity-70 group-hover:opacity-100 transition-opacity duration-300" style={{ color: mutedText }}>
                          {c.label}
                        </p>

                        {hasLink ? (
                          <a
                            href={c.href}
                            className="inline-flex items-center gap-1.5 font-black text-sm tracking-tight transition-all duration-300 relative group/link break-all mt-0.5"
                            style={{ color: col }}
                          >
                            <span className="relative py-0.5 overflow-hidden">
                              {c.value}
                              {/* Interactive slide underline shimmer marker */}
                              <span
                                className="absolute bottom-0 left-0 w-0 h-px transition-all duration-300 group-hover/link:w-full shimmer"
                                style={{ backgroundColor: col }}
                              />
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover/link:opacity-100 transform transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 shrink-0" />
                          </a>
                        ) : (
                          <p className="font-extrabold text-sm tracking-tight break-all transition-all duration-300 group-hover:translate-x-0.5 mt-0.5" style={{ color: textColor }}>
                            {c.value}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Pulsing conceptual interconnected line */}
                    <div
                      className="absolute -bottom-1 right-1/4 h-px w-1/2 opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                      style={{ background: `linear-gradient(to right, ${col}60, transparent)` }}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── SOCIAL ── */}
        {enabledTabs.includes('social') && (
          <section id="social" ref={el => { sectionRefs.current['social'] = el; }} style={{ scrollMarginTop: '80px' }}>
            <GlassHeading label="Social & Share" primary={primary} secondary={secondary} textColor={textColor} />

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
              {/* Left: Social Links Grid */}
              {socialItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {socialItems.map(([key, url], i) => {
                    const col = i % 2 === 0 ? primary : secondary;
                    return (
                      <a
                        key={key}
                        href={url as string}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-2xl group transition-all duration-500 overflow-hidden relative t3-card t3-slide-up"
                        style={{
                          ...glass(0.06, 0.12),
                          transition: 'all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)',
                          animationDelay: `${i * 0.1}s`
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px) scale(1.02)';
                          (e.currentTarget as HTMLElement).style.boxShadow = `0 15px 30px ${col}15, 0 4px 10px rgba(0,0,0,0.1)`;
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)';
                          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                        }}
                      >
                        {/* Expandable Top Edge Accent */}
                        <div
                          className="absolute top-0 left-0 h-0.5 w-8 rounded-t-2xl transition-all duration-500 group-hover:w-full"
                          style={{ background: `linear-gradient(to right, ${col}, ${col}40)` }}
                        />

                        {/* Ambient Radial Hover Glow */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                          style={{ background: `radial-gradient(circle at right center, ${col}15 0%, transparent 60%)` }}
                        />

                        <div className="t3-shimmer" />

                        {/* Animated Icon Box */}
                        <span
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 relative z-10"
                          style={{
                            background: `linear-gradient(135deg, ${col}25, ${col}08)`,
                            color: col,
                            border: `1px solid ${col}30`,
                            boxShadow: `0 4px 12px ${col}15`
                          }}
                        >
                          {/* Subtle Inner Reflection */}
                          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)' }} />
                          <span className="relative z-10 transition-transform duration-300 group-hover:scale-110" style={{ filter: `drop-shadow(0 0 4px ${col}50)` }}>
                            {SOCIAL_ICONS[key]}
                          </span>
                        </span>

                        {/* Network Name */}
                        <span
                          className="text-sm font-extrabold flex-1 relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                          style={{ color: textColor }}
                        >
                          {SOCIAL_LABELS[key]}
                        </span>

                        {/* Sweeping Arrow Icon */}
                        <div className="overflow-hidden relative w-5 h-5 flex items-center justify-center">
                          <ArrowUpRight
                            className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-3 translate-y-3 group-hover:translate-x-0 group-hover:translate-y-0 absolute"
                            style={{ color: col }}
                          />
                        </div>
                      </a>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full rounded-2xl border border-dashed" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <p className="text-sm font-medium tracking-wide opacity-50" style={{ color: mutedText }}>No social links configured.</p>
                </div>
              )}

              {/* Right: Dynamic Share Card */}
              <div
                className="rounded-3xl p-6 flex flex-col relative overflow-hidden t3-card group/share transition-all duration-500 h-full"
                style={{
                  ...glass(0.06, 0.12),
                  transition: 'all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 25px 50px ${primary}15, 0 8px 20px rgba(0,0,0,0.1)`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                {/* Animated Corner Gradient Background */}
                <div
                  className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-20 group-hover/share:opacity-40 transition-opacity duration-700 blur-3xl pointer-events-none"
                  style={{ background: primary }}
                />
                <div
                  className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full opacity-10 group-hover/share:opacity-30 transition-opacity duration-700 blur-3xl pointer-events-none"
                  style={{ background: secondary }}
                />

                {/* Top Connecting Gradient Line */}
                <div className="absolute top-0 inset-x-0 h-1 rounded-t-3xl transition-opacity duration-300 opacity-70 group-hover/share:opacity-100"
                  style={{ background: `linear-gradient(to right, ${secondary}, ${primary})`, animation: 't3-shimmer 3s linear infinite', backgroundSize: '200% auto' }} />

                <div className="t3-shimmer" />

                <div className="flex items-center gap-3 mb-5 relative z-10">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl animate-ping opacity-30" style={{ background: secondary }} />
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center relative z-10 transition-transform duration-500 group-hover/share:rotate-12"
                      style={{ background: `${secondary}25`, color: secondary, border: `1px solid ${secondary}40`, boxShadow: `0 4px 15px ${secondary}15` }}>
                      <Share2 className="w-4 h-4" style={{ filter: `drop-shadow(0 0 4px ${secondary}80)` }} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 opacity-80" style={{ color: mutedText }}>Spread the word</p>
                    <p className="font-extrabold text-base tracking-tight" style={{ color: textColor }}>Share Event</p>
                  </div>
                </div>

                {/* Read-Only URL Box */}
                <div className="relative mb-auto mt-2">
                  <p className="text-[11px] break-all font-mono py-3 px-4 rounded-xl relative z-10 transition-colors duration-300 overflow-hidden line-clamp-2"
                    style={{
                      color: mutedText,
                      background: 'rgba(0,0,0,0.15)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)'
                    }}>
                    {typeof window !== 'undefined' ? window.location.href : 'https://your-event.url'}
                  </p>
                  {/* Subtle glowing ring on share card hover */}
                  <div className="absolute inset-0 rounded-xl border border-transparent group-hover/share:border-white/10 transition-colors duration-500 pointer-events-none" />
                </div>

                {/* High-Fidelity Copy Button */}
                <button
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  className="w-full mt-5 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-95 active:translate-y-0 relative z-10 overflow-hidden group/btn flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                    boxShadow: `0 10px 20px -5px ${primary}40`
                  }}
                >
                  {/* Sweeping Button Shimmer Accent */}
                  <span className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      animation: 't3-shimmer 1.5s ease infinite',
                      backgroundSize: '200% auto'
                    }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    Copy Link
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── SPONSORS ── */}
        {enabledTabs.includes('sponsors') && (
          <section id="sponsors" ref={el => { sectionRefs.current['sponsors'] = el; }} style={{ scrollMarginTop: '80px' }}>
            <GlassHeading label="Sponsors" primary={primary} secondary={secondary} textColor={textColor} />

            {!data.sponsors || data.sponsors.length === 0 ? (
              <div
                className="mt-8 rounded-3xl p-12 text-center relative overflow-hidden group transition-all duration-500 hover:shadow-xl"
                style={{ ...glass() }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ background: `radial-gradient(circle at center, ${primary}10 0%, transparent 50%)` }} />
                <Star className="w-12 h-12 mx-auto mb-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-pulse" style={{ color: primary }} />
                <p className="text-sm font-medium tracking-wide" style={{ color: mutedText }}>No sponsors listed yet.</p>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...data.sponsors].sort((a, b) => {
                  const o = { PLATINUM: 0, GOLD: 1, SILVER: 2, BRONZE: 3 };
                  return (o[a.sponsorTier as keyof typeof o] ?? 4) - (o[b.sponsorTier as keyof typeof o] ?? 4);
                }).map((s, i) => {
                  const tc = TIER_COLORS[s.sponsorTier] || TIER_COLORS.BRONZE;

                  return (
                    <div
                      key={s.id || i}
                      className="rounded-3xl p-6 flex items-center gap-5 relative overflow-hidden group t3-card transition-all duration-500"
                      style={{
                        ...glass(0.06, 0.12),
                        transition: 'all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)'
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)';
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 45px ${tc}20, 0 4px 15px rgba(0,0,0,0.1)`;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      }}
                    >
                      {/* Dynamic Top Indicator Line */}
                      <div
                        className="absolute top-0 left-0 h-0.5 w-12 rounded-t-3xl transition-all duration-500 group-hover:w-full"
                        style={{ background: `linear-gradient(to right, ${tc}, ${tc}40)` }}
                      />

                      {/* Dual Ambient Background Glows */}
                      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ background: `radial-gradient(ellipse at 0% 50%, ${tc}12, transparent 70%)` }} />
                      <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-700 blur-2xl pointer-events-none"
                        style={{ background: tc }} />

                      <div className="t3-shimmer" />

                      {/* Animated Logo Box */}
                      <div
                        className="shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 z-10"
                        style={{
                          background: `linear-gradient(135deg, ${tc}20, ${tc}05)`,
                          border: `1px solid ${tc}30`,
                          boxShadow: `0 4px 12px ${tc}15`
                        }}
                      >
                        {/* Inner Lens Flare Reflection */}
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.25), transparent)' }} />

                        {/* Blinking Tech Dot */}
                        <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full animate-ping opacity-60" style={{ background: tc }} />
                        <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full" style={{ background: tc }} />

                        {s.logoUrl ? (
                          <img src={s.logoUrl} alt={s.name} className="w-10 h-10 object-contain opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" />
                        ) : (
                          <Star className="w-6 h-6 transition-all duration-500 group-hover:scale-110" style={{ color: tc, filter: `drop-shadow(0 0 6px ${tc}60)` }} />
                        )}
                      </div>

                      {/* Info Section */}
                      <div className="flex-1 min-w-0 relative z-10">
                        <p className="font-extrabold text-sm uppercase tracking-tight truncate mb-2 transition-transform duration-300 group-hover:translate-x-1" style={{ color: textColor }}>
                          {s.name}
                        </p>

                        <span
                          className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full transition-all duration-300 group-hover:shadow-md"
                          style={{ color: tc, background: `${tc}15`, border: `1px solid ${tc}30` }}
                        >
                          <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: tc, boxShadow: `0 0 4px ${tc}` }} />
                          {s.sponsorTier}
                        </span>

                        {s.websiteUrl && (
                          <a href={s.websiteUrl} target="_blank" rel="noopener noreferrer"
                            className="mt-2.5 flex items-center gap-1.5 text-xs font-bold transition-all duration-300 group/link w-max"
                            style={{ color: tc }}>
                            <span className="relative overflow-hidden py-0.5">
                              Visit Site
                              {/* Sliding underline marker */}
                              <span className="absolute bottom-0 left-0 w-0 h-px transition-all duration-300 group-hover/link:w-full" style={{ backgroundColor: tc }} />
                            </span>
                            <ExternalLink className="w-3 h-3 opacity-60 group-hover/link:opacity-100 transition-all duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                          </a>
                        )}
                      </div>

                      {/* Ghost Number / Watermark */}
                      <span
                        className="shrink-0 text-[3.5rem] font-black leading-none select-none opacity-[0.04] group-hover:opacity-[0.12] transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2 pointer-events-none"
                        style={{ color: tc }}
                      >
                        {String(i + 1).padStart(2, '00')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ── RECOVER TICKETS ── */}
        {enabledTabs.includes('recover') && (
          <section id="recover" ref={el => { sectionRefs.current['recover'] = el; }} style={{ scrollMarginTop: '80px' }}>
            <GlassHeading label="Recover Tickets" primary={primary} secondary={secondary} textColor={textColor} />

            <div className="mt-8 max-w-2xl relative">
              <div
                className="rounded-3xl p-8 relative overflow-hidden t3-card group transition-all duration-500"
                style={{
                  ...glass(0.06, 0.12),
                  transition: 'all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 25px 50px ${primary}15, 0 8px 20px rgba(0,0,0,0.1)`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                {/* Dynamic Top Edge Indicator Line */}
                <div
                  className="absolute top-0 left-0 h-1 w-24 rounded-t-3xl transition-all duration-700 group-hover:w-full opacity-80 group-hover:opacity-100"
                  style={{ background: `linear-gradient(to right, ${primary}, ${secondary})` }}
                />

                {/* Ambient Glowing Background Orbs */}
                <div
                  className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-700 blur-3xl pointer-events-none"
                  style={{ background: secondary }}
                />
                <div
                  className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-700 blur-3xl pointer-events-none"
                  style={{ background: primary }}
                />

                <div className="t3-shimmer" />

                {/* Content Header */}
                <div className="relative z-10 mb-8 flex gap-4 items-start">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${primary}25, ${primary}05)`,
                      border: `1px solid ${primary}30`,
                      color: primary
                    }}
                  >
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)' }} />
                    <Mail className="w-5 h-5" style={{ filter: `drop-shadow(0 0 6px ${primary}50)` }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold tracking-tight mb-1" style={{ color: textColor }}>Lost your tickets?</h3>
                    <p className="text-sm leading-relaxed opacity-80" style={{ color: mutedText }}>
                      Enter the email address you used during purchase. We'll send you your tickets again.
                    </p>
                  </div>
                </div>

                {/* Form Elements */}
                <div className="flex flex-col sm:flex-row gap-4 items-end relative z-10">
                  <div className="flex-1 w-full group/input">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 transition-colors duration-300 group-focus-within/input:text-white" style={{ color: mutedText }}>
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={recoveryEmail}
                        onChange={e => setRecoveryEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-5 py-3.5 rounded-xl text-sm font-medium outline-none transition-all duration-300 peer"
                        style={{
                          background: 'rgba(0,0,0,0.2)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: textColor,
                          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = primary;
                          e.currentTarget.style.background = 'rgba(0,0,0,0.3)';
                          e.currentTarget.style.boxShadow = `0 0 0 4px ${primary}15, inset 0 2px 10px rgba(0,0,0,0.2)`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                          e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                          e.currentTarget.style.boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.1)';
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleRecoverTickets}
                    disabled={recovering || !recoveryEmail}
                    className="shrink-0 w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:active:scale-100 flex items-center justify-center gap-2.5 relative overflow-hidden group/btn"
                    style={{
                      background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                      boxShadow: `0 8px 25px -5px ${primary}50`
                    }}
                  >
                    {/* Button Hover Shimmer */}
                    <span className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        animation: 't3-shimmer 2s ease infinite',
                        backgroundSize: '200% auto'
                      }}
                    />

                    <span className="relative z-10 flex items-center gap-2 transition-transform duration-300 group-hover/btn:scale-105">
                      {recovering ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                      )}
                      {recovering ? 'Sending…' : 'Recover'}
                    </span>
                  </button>
                </div>

                {/* Animated Feedback Message */}
                {recoveryMessage && (
                  <div
                    className="mt-6 p-4 rounded-xl text-sm font-medium relative z-10 flex items-center gap-3 overflow-hidden t3-slide-up"
                    style={{
                      border: `1px solid ${recoveryMessage.type === 'success' ? `${primary}40` : 'rgba(239,68,68,0.4)'}`,
                      background: recoveryMessage.type === 'success' ? `linear-gradient(to right, ${primary}15, ${primary}05)` : 'linear-gradient(to right, rgba(239,68,68,0.15), rgba(239,68,68,0.05))',
                      color: recoveryMessage.type === 'success' ? primary : '#ef4444',
                      animation: 't3-fade-in 0.4s cubic-bezier(0.34, 1.2, 0.64, 1) forwards'
                    }}
                  >
                    {/* Left Accent Bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: recoveryMessage.type === 'success' ? primary : '#ef4444' }} />

                    {recoveryMessage.type === 'success' ? (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: `${primary}20` }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: primary }} />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-red-500/20">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                      </div>
                    )}

                    <span className="flex-1 drop-shadow-md">{recoveryMessage.text}</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ════════════════════════════════════════
    FOOTER — premium glass card, interactive anchor
════════════════════════════════════════ */}
      <footer className="relative z-10 mt-12 px-4 sm:px-6 lg:px-8 pb-12">
        <div
          className="max-w-[1440px] mx-auto rounded-3xl overflow-hidden relative group transition-all duration-700 hover:shadow-2xl t3-card"
          style={{
            ...glass(0.08, 0.15),
            boxShadow: `0 10px 40px -10px rgba(0,0,0,0.2)`
          }}
        >
          {/* Animated Shimmering Top Border */}
          <div
            className="absolute top-0 inset-x-0 h-1 opacity-80 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `linear-gradient(90deg, transparent, ${primary}, ${secondary}, transparent)`,
              animation: 't3-shimmer 3s ease-in-out infinite',
              backgroundSize: '200% auto'
            }}
          />

          {/* Ambient Interactive Background Orbs */}
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-700 opacity-60 group-hover:opacity-100"
            style={{ background: `radial-gradient(ellipse at 50% 120%, ${primary}15, transparent 70%)` }} />
          <div className="absolute -left-32 -bottom-32 w-96 h-96 rounded-full blur-[100px] pointer-events-none opacity-0 group-hover:opacity-20 transition-all duration-1000"
            style={{ background: primary }} />
          <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full blur-[100px] pointer-events-none opacity-0 group-hover:opacity-20 transition-all duration-1000"
            style={{ background: secondary }} />

          <div className="px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-12 items-center relative z-10">

            {/* Left: Event Snapshot */}
            <div className="flex flex-col items-start transition-transform duration-500 group-hover:translate-x-2">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-2.5 flex items-center gap-2 opacity-80" style={{ color: mutedText }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: primary }} />
                {fmtShort(data.startDatetime)} <span className="opacity-50">·</span> {data.venueName}
              </p>
              <h3 className="font-extrabold text-xl lg:text-2xl uppercase tracking-tight leading-tight mb-4 line-clamp-2" style={{ color: textColor }}>
                {data.title}
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {data.tags.slice(0, 3).map((tag, i) => {
                  const col = i % 2 === 0 ? primary : secondary;
                  return (
                    <span
                      key={i}
                      className="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 cursor-default relative overflow-hidden group/tag"
                      style={{
                        color: col,
                        background: `${col}15`,
                        border: `1px solid ${col}30`,
                        boxShadow: `0 4px 10px ${col}00`
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = `${col}25`;
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 12px ${col}30`;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = `${col}15`;
                        (e.currentTarget as HTMLElement).style.boxShadow = `none`;
                      }}
                    >
                      {/* Subtle tag sheen */}
                      <span className="absolute inset-0 opacity-0 group-hover/tag:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)' }} />
                      <span className="relative z-10">{tag}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Centre: Logo & Branding */}
            <div className="flex flex-col items-center gap-5 relative group/logo cursor-pointer">
              {/* Glow behind logo */}
              <div className="absolute inset-0 rounded-full blur-2xl opacity-0 group-hover/logo:opacity-30 transition-opacity duration-700 pointer-events-none" style={{ background: secondary }} />

              <Image
                src="/images/logo/eventsphere-logo.png"
                alt="Eventsphere"
                width={200} height={52}
                className="h-12 w-auto opacity-50 group-hover/logo:opacity-100 transition-all duration-500 group-hover/logo:scale-105 drop-shadow-xl relative z-10"
              />

              <div className="flex items-center gap-4 transition-transform duration-500 group-hover/logo:scale-110">
                <div className="h-px w-12 transition-all duration-500 group-hover/logo:w-16" style={{ background: `linear-gradient(90deg, transparent, ${primary}80)` }} />
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-4 h-4 rounded-full animate-ping opacity-40" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }} />
                  <div className="w-2 h-2 rounded-full relative z-10" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})`, boxShadow: `0 0 10px ${primary}` }} />
                </div>
                <div className="h-px w-12 transition-all duration-500 group-hover/logo:w-16" style={{ background: `linear-gradient(270deg, transparent, ${secondary}80)` }} />
              </div>

              <p className="text-[10px] font-bold uppercase tracking-[0.25em] transition-opacity duration-300" style={{ color: mutedText }}>
                Powered by <span className="font-black transition-colors duration-300" style={{ color: primary }}>Eventsphere</span>
              </p>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-col items-start md:items-end gap-5 transition-transform duration-500 group-hover:-translate-x-2">
              <a
                href="/explore"
                className="group/link inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all duration-300 hover:opacity-100 opacity-70 relative"
                style={{ color: secondary }}
              >
                <LayoutGrid className="w-4 h-4 transition-transform duration-300 group-hover/link:-rotate-12 group-hover/link:scale-110" />
                <span className="relative overflow-hidden py-1">
                  More Events
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover/link:w-full" style={{ background: secondary }} />
                </span>
                <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1.5 transition-transform duration-300" />
              </a>

              
            </div>

          </div>
        </div>
      </footer>

      {/* MOBILE STICKY CTA */}
      <div
        className="fixed bottom-0 left-0 w-full sm:hidden z-50 px-4 py-3"
        style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <div
          className="flex items-center justify-between p-4 rounded-2xl"
          style={{
            ...glass(0.15, 0.2),
            boxShadow: `0 -4px 40px ${primary}30`,
          }}
        >
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: mutedText }}>From</p>
            <p className="text-xl font-black tabular-nums" style={{ color: textColor }}>
              {startPrice !== null ? `Rs.${startPrice.toLocaleString()}` : 'TBA'}
            </p>
          </div>
          <button
            onClick={onCheckout}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider text-white active:scale-95 transition-all"
            style={{ background: `linear-gradient(135deg,${primary},${secondary})` }}
          >
            Buy Now <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Glass Section Heading — unique to T3
   Gradient pill label + ghost oversized text
───────────────────────────────────────────────── */
function GlassHeading({ label, primary, secondary, textColor }: {
  label: string; primary: string; secondary: string; textColor: string;
}) {
  return (
    <div className="relative flex items-center gap-5 overflow-hidden">
      {/* Ghost oversized label behind */}
      <span
        className="absolute left-20 top-1/2 -translate-y-1/2 font-black uppercase leading-none select-none pointer-events-none opacity-[0.035] tracking-tighter"
        style={{ color: primary, fontSize: 'clamp(4rem, 8vw, 7rem)' }}
        aria-hidden
      >
        {label}
      </span>

      {/* Gradient pill */}
      <div
        className="relative z-10 shrink-0 px-5 py-2.5 rounded-full text-sm font-black uppercase tracking-[0.15em] text-white transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden group"
        style={{
          background: `linear-gradient(135deg, ${primary}, ${secondary})`,
          boxShadow: `0 6px 24px ${primary}40`,
        }}
      >
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)' }} />
        <span className="relative z-10">{label}</span>
      </div>

      {/* Fading rule */}
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${primary}50, transparent)` }} />
    </div>
  );
}