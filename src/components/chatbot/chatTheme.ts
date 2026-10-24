// Builds the chatbot colors from the organizer's landing page colors.

export const FONT_MAP: Record<string, string> = {
  'dm-sans': "'DM Sans', sans-serif",
  playfair: "'Playfair Display', serif",
  'space-grotesk': "'Space Grotesk', sans-serif",
  'cabinet-grotesk': "'Cabinet Grotesk', sans-serif",
  syne: "'Syne', sans-serif",
};

const DEFAULT_PRIMARY = '#06b6d4';
const DEFAULT_SECONDARY = '#3b82f6';
const DEFAULT_BG = '#0B0F19'; // same default as the Publishing tab

const parseHex = (hex: string): [number, number, number] | null => {
  const h = (hex || '').trim().replace('#', '');
  if (/^[0-9a-f]{3}$/i.test(h)) {
    return [0, 1, 2].map((i) => parseInt(h[i] + h[i], 16)) as [number, number, number];
  }
  if (/^[0-9a-f]{6}$/i.test(h)) {
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
  }
  return null;
};

export const withAlpha = (hex: string, alpha: number): string => {
  const rgb = parseHex(hex);
  if (!rgb) return `rgba(0,0,0,${alpha})`;
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
};

// 0 (black) to 1 (white)
const luminance = (hex: string): number => {
  const rgb = parseHex(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Mixes two hex colors. t = 0 gives a, t = 1 gives b.
const mixHex = (a: string, b: string, t: number): string => {
  const ra = parseHex(a);
  const rb = parseHex(b);
  if (!ra || !rb) return a;
  const c = ra.map((v, i) => Math.round(v + (rb[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

export interface ChatPalette {
  isDark: boolean;
  primary: string;
  secondary: string;
  gradient: string; // primary -> secondary
  onGradient: string; // readable text color on the gradient
  panelBg: string;
  panelBackground: string; // colorful layered background of the chat panel
  dotPattern: string; // faint dot grid drawn over the background
  footerBg: string;
  botBubbleShadow: string;
  panelBorder: string;
  panelShadow: string;
  text: string;
  muted: string;
  botBubbleBg: string;
  botBubbleBorder: string;
  inputBg: string;
  inputBorder: string;
  chipBg: string;
  chipBorder: string;
  errorBg: string;
  errorBorder: string;
  errorText: string;
  glow: string; // soft colored glow
}

export const buildChatPalette = (
  primaryIn?: string,
  secondaryIn?: string,
  backgroundIn?: string,
): ChatPalette => {
  const primary = parseHex(primaryIn || '') ? (primaryIn as string) : DEFAULT_PRIMARY;
  const secondary = parseHex(secondaryIn || '') ? (secondaryIn as string) : DEFAULT_SECONDARY;
  const bg = parseHex(backgroundIn || '') ? (backgroundIn as string) : DEFAULT_BG;

  const isDark = luminance(bg) < 0.4;
  const avgLum = (luminance(primary) + luminance(secondary)) / 2;

  const panelBackground = isDark
    ? [
        `radial-gradient(120% 70% at 0% 0%, ${withAlpha(primary, 0.30)} 0%, transparent 55%)`,
        `radial-gradient(100% 70% at 100% 100%, ${withAlpha(secondary, 0.26)} 0%, transparent 60%)`,
        `linear-gradient(180deg, ${mixHex(bg, primary, 0.12)} 0%, ${mixHex(bg, '#000000', 0.30)} 100%)`,
      ].join(', ')
    : [
        `radial-gradient(110% 60% at 100% 0%, ${withAlpha(primary, 0.24)} 0%, transparent 55%)`,
        `radial-gradient(100% 60% at 0% 100%, ${withAlpha(secondary, 0.22)} 0%, transparent 60%)`,
        `linear-gradient(180deg, ${mixHex(bg, primary, 0.09)} 0%, ${mixHex(bg, secondary, 0.16)} 100%)`,
      ].join(', ');

  return {
    isDark,
    primary,
    secondary,
    gradient: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
    onGradient: avgLum > 0.45 ? '#0f172a' : '#ffffff',
    panelBg: withAlpha(bg, isDark ? 0.94 : 0.97),
    panelBackground,
    dotPattern: `radial-gradient(${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'} 1px, transparent 1px)`,
    footerBg: isDark ? 'rgba(0,0,0,0.28)' : 'rgba(255,255,255,0.65)',
    botBubbleShadow: isDark ? '0 8px 24px -14px rgba(0,0,0,0.8)' : `0 8px 22px -12px ${withAlpha(primary, 0.45)}`,
    panelBorder: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.10)',
    panelShadow: isDark
      ? `0 30px 80px -20px rgba(0,0,0,0.7), 0 0 60px -25px ${withAlpha(primary, 0.55)}`
      : `0 30px 80px -24px rgba(15,23,42,0.35), 0 0 60px -30px ${withAlpha(primary, 0.5)}`,
    text: isDark ? '#f1f5f9' : '#0f172a',
    muted: isDark ? 'rgba(241,245,249,0.60)' : 'rgba(15,23,42,0.55)',
    botBubbleBg: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.88)',
    botBubbleBorder: isDark ? 'rgba(255,255,255,0.12)' : withAlpha(primary, 0.18),
    inputBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
    inputBorder: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)',
    chipBg: withAlpha(primary, isDark ? 0.12 : 0.08),
    chipBorder: withAlpha(primary, isDark ? 0.40 : 0.35),
    errorBg: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
    errorBorder: isDark ? 'rgba(239,68,68,0.40)' : 'rgba(239,68,68,0.30)',
    errorText: isDark ? '#fecaca' : '#b91c1c',
    glow: withAlpha(primary, 0.45),
  };
};