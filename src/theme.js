// Temsho — design tokens (original identity, kisi app ki copy nahi)
export const C = {
  bg: '#F6F7FB',
  surface: '#FFFFFF',
  ink: '#141726',
  ink2: '#5A6076',
  ink3: '#9AA0B4',
  line: '#E7E9F2',

  // Brand: deep indigo + warm marigold (India-inspired)
  brand: '#2B2D6E',
  brandSoft: '#EDEEFA',
  accent: '#F5A623',
  accentSoft: '#FFF3DF',
  green: '#12A150',
  greenSoft: '#E4F7EC',
  red: '#E5484D',
  redSoft: '#FDECEC',
};

export const R = { sm: 8, md: 12, lg: 18, xl: 26, pill: 999 };

export const S = (n) => n * 4;

export const shadow = {
  shadowColor: '#1B1E3B',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

export const money = (n) =>
  '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
