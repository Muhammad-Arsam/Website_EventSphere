'use client';

import React from 'react';
import { EventTemplateData } from '@/types/template.types';
import {
  Calendar, MapPin, Clock, Ticket, Users, ArrowUpRight,
} from 'lucide-react';

interface HeroT3Props {
  data: EventTemplateData;
  glass: (bg?: number, border?: number) => React.CSSProperties;
  mousePos: { x: number; y: number };
  upcoming: boolean;
  startPrice: number | null;
  bgColor: string;
  primary: string;
  secondary: string;
  textColor: string;
  mutedText: string;
  onCheckout: () => void;
  fmt: (dt: string) => string;
  fmtShort: (dt: string) => string;
  fmtTime: (dt: string) => string;
}

export default function HeroT3({
  data,
  glass,
  mousePos,
  upcoming,
  startPrice,
  bgColor,
  primary,
  secondary,
  textColor,
  mutedText,
  onCheckout,
  fmt,
  fmtShort,
  fmtTime,
}: HeroT3Props) {
  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-4 min-h-[88vh]">

        {/* ── BIG IMAGE BENTO CARD ── */}
        <div
          className="relative rounded-3xl overflow-hidden order-1 min-h-[500px] sm:min-h-[600px] lg:min-h-0 t3-card group w-full flex flex-col"
          style={{ ...glass(0.05, 0.1) }}
        >
          {/* Parallax image */}
          <img
            src={data.imageUrl}
            alt={data.title}
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{
              transform: `scale(1.1) translate(${mousePos.x * -10}px, ${mousePos.y * -7}px)`,
              transition: 'transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)',
            }}
          />

          <div className="t3-shimmer" />

          {/* Gradients */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: `linear-gradient(to top, ${bgColor}f8 0%, ${bgColor}b0 35%, ${bgColor}10 65%, transparent 100%)`,
            }}
          />
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: `linear-gradient(135deg, ${primary}35 0%, transparent 45%, ${secondary}22 100%)`,
            }}
          />
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              boxShadow: `inset 0 0 80px rgba(0,0,0,0.35), inset 0 0 200px rgba(0,0,0,0.15)`,
            }}
          />

          {/* Animated border */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none t3-glow"
            style={{ border: `1.5px solid ${primary}40` }}
          />
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{ border: `1.5px solid ${secondary}50`, boxShadow: `inset 0 0 60px ${secondary}10` }}
          />

          {/* Spinning rings */}
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
          <div
            className="absolute top-[58px] right-[84px] w-2 h-2 rounded-full pointer-events-none hidden lg:block t3-pulse-slow"
            style={{ background: secondary, boxShadow: `0 0 10px ${secondary}` }}
          />

          {/* Corner brackets */}
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

          {/* Tags */}
          <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20 flex flex-wrap gap-2 max-w-[55%] sm:max-w-[65%] lg:max-w-none">
            {data.tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
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

          {/* Status badge */}
          <div
            className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20 flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full backdrop-blur-md t3-float"
            style={{
              background: 'rgba(0,0,0,0.55)',
              border: `1px solid ${secondary}60`,
              boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px ${secondary}20`,
            }}
          >
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 shrink-0">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                style={{ background: secondary, animationDuration: '1.6s' }}
              />
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-30"
                style={{ background: secondary, animationDuration: '2.2s', animationDelay: '0.4s' }}
              />
              <span
                className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2"
                style={{ background: secondary, boxShadow: `0 0 8px ${secondary}` }}
              />
            </span>
            <span
              className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest"
              style={{ color: secondary }}
            >
              {upcoming ? 'Upcoming' : 'Live Now'}
            </span>
          </div>

          {/* Floating dots */}
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

          {/* Hero text */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 z-20 t3-slide-up">
            <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
              <div
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 t3-pulse-slow"
                style={{
                  background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                  boxShadow: `0 0 14px ${primary}60`,
                }}
              >
                <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
              </div>
              <div className="h-px w-4 sm:w-6" style={{ background: `linear-gradient(to right, ${primary}80, transparent)` }} />
              <span className="text-[10px] sm:text-xs font-bold text-white/80 uppercase tracking-widest line-clamp-1">
                {data.organizerName}
              </span>
            </div>

            <h1
              className="font-black leading-[0.9] tracking-tighter text-white mb-4 sm:mb-5"
              style={{
                fontSize: 'clamp(2rem, 6vw, 5.5rem)',
                textShadow: `0 4px 30px rgba(0,0,0,0.65), 0 0 80px ${primary}45`,
              }}
            >
              {data.title}
            </h1>

            <div className="flex flex-wrap gap-2">
              {[
                { icon: <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />, val: fmtShort(data.startDatetime), col: secondary },
                { icon: <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />, val: fmtTime(data.startDatetime), col: primary },
                { icon: <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />, val: data.venueName, col: secondary },
              ].map(({ icon, val, col }, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-semibold backdrop-blur-md transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
                  style={{
                    background: 'rgba(0,0,0,0.45)',
                    color: 'rgba(255,255,255,0.95)',
                    border: `1px solid ${col}50`,
                    boxShadow: `0 2px 12px rgba(0,0,0,0.3), 0 0 0 0 ${col}`,
                  }}
                >
                  <span style={{ color: col }}>{icon}</span>
                  {val}
                </span>
              ))}
            </div>

            <div
              className="mt-4 sm:mt-5 h-px w-full"
              style={{
                background: `linear-gradient(to right, ${primary}70, ${secondary}50, transparent)`,
              }}
            />
          </div>
        </div>

        {/* ── RIGHT BENTO COLUMN ── */}
        <div className="flex flex-col gap-4 order-2">

          {/* ═══════ COUNTDOWN CARD ═══════ */}
          {upcoming && (
            <div
              className="rounded-3xl p-6 relative overflow-hidden t3-card group"
              style={{ ...glass(0.09, 0.16) }}
            >
              <div
                className="absolute -inset-1 rounded-3xl opacity-20 pointer-events-none t3-spin-s"
                style={{
                  background: `conic-gradient(from 0deg, ${primary}, ${secondary}, ${primary})`,
                  filter: 'blur(12px)',
                }}
              />
              <div
                className="absolute top-0 inset-x-0 h-0.5 rounded-t-3xl"
                style={{ background: `linear-gradient(to right, ${primary}, ${secondary})` }}
              />
              <div
                className="absolute top-0 left-0 h-0.5 w-16 rounded-t-3xl pointer-events-none"
                style={{
                  background: `linear-gradient(to right, transparent, #fff, transparent)`,
                  animation: 't3-shimmer 3s ease-in-out infinite',
                }}
              />
              <div
                className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none opacity-25 t3-pulse-slow"
                style={{ background: `radial-gradient(circle, ${primary}, transparent)`, filter: 'blur(28px)' }}
              />
              <div
                className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full pointer-events-none opacity-20 t3-pulse-slow"
                style={{ background: `radial-gradient(circle, ${secondary}, transparent)`, filter: 'blur(24px)', animationDelay: '1.8s' }}
              />

              <div className="flex items-center justify-between mb-5 relative z-10">
                <p
                  className="text-[10px] font-black uppercase tracking-[0.28em] flex items-center gap-2"
                  style={{ color: mutedText }}
                >
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

              <div className="grid grid-cols-4 gap-2 relative z-10">
                {[
                  { v: Math.max(0, Math.floor((new Date(data.startDatetime).getTime() - Date.now()) / 86400000)), l: 'Days' },
                  { v: Math.max(0, Math.floor((new Date(data.startDatetime).getTime() - Date.now()) % 86400000 / 3600000)), l: 'Hrs' },
                  { v: Math.max(0, Math.floor((new Date(data.startDatetime).getTime() - Date.now()) % 3600000 / 60000)), l: 'Min' },
                  { v: Math.max(0, Math.floor((new Date(data.startDatetime).getTime() - Date.now()) % 60000 / 1000)), l: 'Sec' },
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
                      <div
                        className="absolute inset-x-0 top-0 h-px pointer-events-none"
                        style={{
                          background: `linear-gradient(to right, transparent, ${isFirst ? primary : i === 3 ? secondary : 'rgba(255,255,255,0.3)'}80, transparent)`,
                        }}
                      />
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

          {/* ═══════ DATE / TIME / VENUE INFO CARD ═══════ */}
          <div
            className="rounded-3xl p-5 relative overflow-hidden t3-card flex-1 group"
            style={{ ...glass(0.07, 0.13) }}
          >
            <div
              className="absolute top-0 inset-x-0 h-0.5 rounded-t-3xl"
              style={{ background: `linear-gradient(to right, ${secondary}, ${primary})` }}
            />
            <div
              className="absolute top-0 left-0 h-0.5 w-12 pointer-events-none"
              style={{
                background: `linear-gradient(to right, transparent, #fff, transparent)`,
                animation: 't3-shimmer 4s ease-in-out 1s infinite',
              }}
            />
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

          {/* ═══════ CTA CARD ═══════ */}
          <div
            className="rounded-3xl p-6 relative overflow-hidden t3-card group"
            style={{
              background: `linear-gradient(145deg, ${primary}50, ${secondary}28)`,
              border: `1px solid ${primary}55`,
              boxShadow: `0 16px 50px ${primary}35, 0 4px 16px rgba(0,0,0,0.2)`,
            }}
          >
            <div
              className="absolute -inset-0.5 rounded-3xl pointer-events-none opacity-30 t3-spin-s"
              style={{
                background: `conic-gradient(from 0deg, ${primary}00, ${primary}, ${secondary}, ${primary}00)`,
                filter: 'blur(8px)',
              }}
            />
            <div
              className="absolute top-0 inset-x-0 h-0.5 rounded-t-3xl"
              style={{ background: `linear-gradient(to right, ${primary}, ${secondary}, ${primary})` }}
            />
            <div
              className="absolute -top-14 -right-14 w-44 h-44 rounded-full pointer-events-none opacity-35 t3-pulse-slow"
              style={{ background: `radial-gradient(circle, ${secondary}cc, transparent)`, filter: 'blur(30px)' }}
            />
            <div
              className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full pointer-events-none opacity-30 t3-pulse-slow"
              style={{ background: `radial-gradient(circle, ${primary}cc, transparent)`, filter: 'blur(25px)', animationDelay: '1.5s' }}
            />
            <div className="t3-shimmer" />
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
              <p
                className="text-[10px] font-black uppercase tracking-[0.25em] mb-1"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                Entry from
              </p>
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
                <span
                  className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    animation: 't3-shimmer 1.2s ease infinite',
                    transition: 'opacity 0.2s ease',
                  }}
                />
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
  );
}