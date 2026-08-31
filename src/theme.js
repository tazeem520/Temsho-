// ============================================================
//  TEMSHO — Vibrant Modern E-Commerce Design System
//  Colors, typography, shadows, and spacing tokens
// ============================================================

export const C = {
  bg: '#F4F6FB',
  surface: '#FFFFFF',
  ink: '#111827',
  ink2: '#4B5563',
  ink3: '#9CA3AF',
  line: '#E5E7EB',

  // Primary brand palette (Vibrant Deep Indigo & Electric Blue)
  brand: '#2874F0',
  brandNavy: '#1E2562',
  brandDark: '#1A56DB',
  brandSoft: '#EFF6FF',

  // Accent & Gold (Warm Amber / E-Commerce Gold)
  accent: '#FF9F00',
  accentDark: '#D97706',
  accentSoft: '#FFFBEB',

  // Success Emerald Green
  green: '#10B981',
  greenDark: '#059669',
  greenSoft: '#ECFDF5',

  // Danger Red
  red: '#EF4444',
  redDark: '#DC2626',
  redSoft: '#FEF2F2',

  // Vibrant Category & Highlight Tints
  purple: '#8B5CF6',
  purpleSoft: '#F5F3FF',
  orange: '#F97316',
  orangeSoft: '#FFF7ED',
  teal: '#06B6D4',
  tealSoft: '#ECFEFF',
  pink: '#EC4899',
  pinkSoft: '#FDF2F8',
};

export const R = { sm: 8, md: 12, lg: 18, xl: 24, pill: 999 };

export const S = (n) => n * 4;

export const shadow = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

export const money = (n) => {
  const num = Math.round(Number(n) || 0);
  const str = Math.abs(num).toString();
  let lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  return (num < 0 ? '-₹' : '₹') + formatted;
};
