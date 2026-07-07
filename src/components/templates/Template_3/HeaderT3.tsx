'use client';

import React from 'react';
import { TabName } from '@/types/template.types';
import { Zap } from 'lucide-react';

interface HeaderT3Props {
  data: {
    title: string;
  };
  enabledTabs: TabName[];
  activeTab: TabName;
  scrolled: boolean;
  onCheckout: () => void;
  scrollTo: (tab: TabName) => void;
  glass: (bg?: number, border?: number) => React.CSSProperties;
  primary: string;
  secondary: string;
  textColor: string;
  mutedText: string;
  TAB_LABELS: Record<TabName, string>;
}

export default function HeaderT3({
  data,
  enabledTabs,
  activeTab,
  scrolled,
  onCheckout,
  scrollTo,
  glass,
  primary,
  secondary,
  textColor,
  mutedText,
  TAB_LABELS,
}: HeaderT3Props) {
  return (
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
              className="relative shrink-0 px-3 sm:px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest whitespace-nowrap rounded-full overflow-hidden group"
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
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.07)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 32px ${primary}70, 0 0 0 2px ${secondary}60, inset 0 1px 0 rgba(255,255,255,0.25)`;
          }}
          onMouseLeave={(e) => {
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
  );
}