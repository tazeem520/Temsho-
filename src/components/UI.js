import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { C, R, shadow, money } from '../theme';

export const Icon = ({ name, size = 18, color = C.ink, style }) => (
  <MaterialCommunityIcons name={name} size={size} color={color} style={style} />
);

export const Badge = ({ text, tone = 'brand', small }) => {
  const tones = {
    brand: [C.brandSoft, C.brand],
    green: [C.greenSoft, C.green],
    accent: [C.accentSoft, '#D97706'],
    red: [C.redSoft, C.red],
    purple: [C.purpleSoft, C.purple],
    grey: ['#F3F4F6', C.ink2],
  };
  const [bg, fg] = tones[tone] || tones.brand;
  return (
    <View style={[st.badge, { backgroundColor: bg }, small && { paddingVertical: 2, paddingHorizontal: 6 }]}>
      <Text style={{ color: fg, fontSize: small ? 10 : 11, fontWeight: '800' }}>{text}</Text>
    </View>
  );
};

/* Verified Assured Badge */
export const TemshoAssuredBadge = ({ small }) => (
  <View style={[st.assuredBadge, small && { paddingVertical: 2, paddingHorizontal: 6 }]}>
    <MaterialCommunityIcons name="check-decagram" size={small ? 12 : 14} color="#059669" />
    <Text style={[st.assuredText, small && { fontSize: 9.5 }]}>Verified Assured</Text>
  </View>
);

export const HumanTag = ({ small }) => (
  <View style={[st.human, small && { paddingVertical: 2, paddingHorizontal: 6 }]}>
    <MaterialCommunityIcons name="shield-check" size={small ? 11 : 13} color="#059669" />
    <Text style={{ color: '#059669', fontSize: small ? 9 : 10.5, fontWeight: '800', marginLeft: 4 }}>
      VERIFIED SELLER
    </Text>
  </View>
);

export const Stars = ({ value = 4.5, count, size = 10 }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <View style={st.star}>
      <Text style={{ color: '#fff', fontSize: size, fontWeight: '800' }}>{Number(value || 4.5).toFixed(1)}</Text>
      <MaterialCommunityIcons name="star" size={size - 1} color="#fff" style={{ marginLeft: 2 }} />
    </View>
    {count != null && <Text style={{ color: C.ink3, fontSize: 11, marginLeft: 6 }}>({count})</Text>}
  </View>
);

/* Flash Deal Countdown Timer */
export const CountdownTimer = ({ hours = 4, minutes = 28, seconds = 45 }) => {
  const [sec, setSec] = useState(hours * 3600 + minutes * 60 + seconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSec((s) => (s > 0 ? s - 1 : 14400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n) => String(n).padStart(2, '0');

  return (
    <View style={st.timerWrap}>
      <MaterialCommunityIcons name="clock-outline" size={14} color={C.redDark} />
      <Text style={st.timerText}>{pad(h)}h : {pad(m)}m : {pad(s)}s left</Text>
    </View>
  );
};

export const Btn = ({ title, onPress, tone = 'brand', style, disabled, icon }) => {
  const map = {
    brand: [C.brand, '#fff'],
    accent: [C.accent, '#111827'],
    outline: ['transparent', C.brand],
    green: [C.green, '#fff'],
    ghost: ['#F3F4F6', C.ink],
  };
  const [bg, fg] = map[tone] || map.brand;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
      style={[
        st.btn,
        { backgroundColor: bg, opacity: disabled ? 0.45 : 1 },
        tone === 'outline' && { borderWidth: 1.5, borderColor: C.brand },
        style,
      ]}
    >
      {!!icon && <MaterialCommunityIcons name={icon} size={17} color={fg} style={{ marginRight: 7 }} />}
      <Text style={{ color: fg, fontWeight: '800', fontSize: 14.5 }}>{title}</Text>
    </TouchableOpacity>
  );
};

export const Field = ({ label, ...p }) => (
  <View style={{ marginBottom: 14 }}>
    {!!label && <Text style={st.label}>{label}</Text>}
    <TextInput placeholderTextColor={C.ink3} style={st.input} {...p} />
  </View>
);

export const Thumb = ({ img, title = '', tint, size = 90, radius = R.md }) => {
  let source = null;
  if (img) {
    if (typeof img === 'string' && img.trim()) source = { uri: img.trim() };
    else if (img.uri && typeof img.uri === 'string' && img.uri.trim()) source = { uri: img.uri.trim() };
    else if (typeof img === 'number') source = img;
  }
  if (source) {
    return (
      <Image
        source={source}
        resizeMode="cover"
        style={{ width: '100%', height: size, borderRadius: radius, backgroundColor: '#F3F4F6' }}
      />
    );
  }
  return (
    <View style={{ width: '100%', height: size, backgroundColor: tint || '#F3F4F6', borderRadius: radius, alignItems: 'center', justifyContent: 'center' }}>
      <MaterialCommunityIcons name="image-outline" size={Math.max(22, size * 0.25)} color="#00000030" />
      {size > 75 && (
        <Text style={{ marginTop: 6, fontSize: 10, color: '#00000055', fontWeight: '800', letterSpacing: 0.3, textAlign: 'center', paddingHorizontal: 6 }}>
          SELLER PHOTO
        </Text>
      )}
    </View>
  );
};

export const Avatar = ({ name = '?', hue = C.brand, size = 44 }) => {
  const safeName = String(name || '?').trim();
  const initials = safeName ? safeName.split(/\s+/).slice(0, 2).map((w) => w?.[0] || '').join('').toUpperCase() : '?';
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: (hue || C.brand) + '1A', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: hue || C.brand, fontWeight: '800', fontSize: size * 0.38 }}>
        {initials || '?'}
      </Text>
    </View>
  );
};

/* Modern Product Card */
export const ProductCard = ({ p, onPress, width, sellerName }) => {
  if (!p) return null;
  const mrp = Number(p.mrp) || Number(p.price) || 0;
  const price = Number(p.price) || 0;
  const off = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const mainImg = p.img || (p.images && p.images[0]) || null;
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[st.card, shadow, { width }]}>
      <View style={{ position: 'relative' }}>
        <Thumb img={mainImg} title={p.title} tint={p.tint} size={138} radius={0} />
        {off >= 10 && (
          <View style={st.dealTag}>
            <Text style={{ color: '#fff', fontSize: 9.5, fontWeight: '900' }}>{off}% OFF</Text>
          </View>
        )}
      </View>
      <View style={{ padding: 10 }}>
        <Text numberOfLines={2} style={{ color: C.ink, fontSize: 12.5, fontWeight: '600', minHeight: 34, lineHeight: 17 }}>
          {p.title || 'Product'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 5 }}>
          <Text style={{ color: C.ink, fontSize: 16, fontWeight: '900' }}>{money(price)}</Text>
          {mrp > price && (
            <Text style={{ color: C.ink3, fontSize: 11, textDecorationLine: 'line-through', marginLeft: 6 }}>
              {money(mrp)}
            </Text>
          )}
          {off > 0 && <Text style={{ color: C.green, fontSize: 11.5, fontWeight: '800', marginLeft: 6 }}>{off}%</Text>}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <Stars value={p.rating || 4.8} count={p.ratingCount || 0} size={9} />
          <TemshoAssuredBadge small />
        </View>

        {p.sizes && p.sizes.length > 0 && (
          <Text numberOfLines={1} style={{ color: C.brand, fontSize: 10.5, fontWeight: '700', marginTop: 4 }}>
            {p.variantType === 'age' ? 'Ages: ' : 'Sizes: '}
            {p.sizes.slice(0, 3).join(', ')}{p.sizes.length > 3 ? '...' : ''}
          </Text>
        )}

        {!!sellerName && (
          <Text numberOfLines={1} style={{ color: C.ink3, fontSize: 10.5, marginTop: 4 }}>
            By {sellerName}
          </Text>
        )}
        <View style={{ marginTop: 6, alignSelf: 'flex-start' }}>
          <Badge text="Free Delivery" tone="green" small />
        </View>
      </View>
    </TouchableOpacity>
  );
};

/* Ratings Breakdown Bar Chart */
export const RatingsBreakdown = ({ rating = 4.8, totalCount = 120 }) => {
  const bars = [
    { star: 5, pct: 75, color: C.green },
    { star: 4, pct: 16, color: '#10B981' },
    { star: 3, pct: 5, color: C.accent },
    { star: 2, pct: 2, color: C.orange },
    { star: 1, pct: 2, color: C.red },
  ];

  return (
    <View style={st.ratingBox}>
      <View style={{ alignItems: 'center', justifyContent: 'center', paddingRight: 16, borderRightWidth: 1, borderRightColor: C.line }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text style={{ fontSize: 32, fontWeight: '900', color: C.ink }}>{Number(rating).toFixed(1)}</Text>
          <MaterialCommunityIcons name="star" size={22} color={C.accent} style={{ marginLeft: 4 }} />
        </View>
        <Text style={{ color: C.ink3, fontSize: 11, marginTop: 2 }}>{totalCount} Ratings &</Text>
        <Text style={{ color: C.ink3, fontSize: 11 }}>Verified Reviews</Text>
      </View>

      <View style={{ flex: 1, marginLeft: 16 }}>
        {bars.map((b) => (
          <View key={b.star} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ width: 14, fontSize: 11, fontWeight: '700', color: C.ink2 }}>{b.star}★</Text>
            <View style={st.barTrack}>
              <View style={[st.barFill, { width: `${b.pct}%`, backgroundColor: b.color }]} />
            </View>
            <Text style={{ width: 30, textAlign: 'right', fontSize: 10.5, color: C.ink3, fontWeight: '600' }}>{b.pct}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

/* Bank & UPI Offers Accordion */
export const BankOffers = () => {
  const offers = [
    { title: 'UPI Instant Discount', desc: 'Flat ₹50 discount on orders above ₹499 via UPI', code: 'AUTO-APPLIED' },
    { title: 'New Customer Welcome', desc: 'Extra ₹50 off on first order with coupon NAYA50', code: 'NAYA50' },
    { title: 'Mega Savings Coupon', desc: '₹100 discount on cart values ₹799+ with coupon TEM100', code: 'TEM100' },
    { title: 'Free Express Shipping', desc: 'Zero delivery charges on all orders above ₹499', code: 'FREESHIP' },
  ];

  return (
    <View style={st.bankWrap}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <MaterialCommunityIcons name="tag-multiple" size={17} color={C.green} />
        <Text style={{ color: C.ink, fontWeight: '900', fontSize: 13.5, marginLeft: 8 }}>Available Offers & Coupons</Text>
      </View>
      {offers.map((o, idx) => (
        <View key={idx} style={st.offerRow}>
          <MaterialCommunityIcons name="tag-outline" size={14} color={C.green} style={{ marginTop: 2 }} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={{ color: C.ink, fontWeight: '700', fontSize: 12 }}>{o.title}: <Text style={{ fontWeight: '400', color: C.ink2 }}>{o.desc}</Text></Text>
          </View>
        </View>
      ))}
    </View>
  );
};

/* Specifications Table */
export const SpecTable = ({ specs }) => {
  if (!specs || Object.keys(specs).length === 0) return null;
  const entries = Object.entries(specs);

  return (
    <View style={st.specBox}>
      {entries.map(([k, v], i) => (
        <View key={k} style={[st.specRow, i === entries.length - 1 && { borderBottomWidth: 0 }]}>
          <Text style={{ width: '42%', color: C.ink3, fontSize: 12.5, fontWeight: '600' }}>{k}</Text>
          <Text style={{ flex: 1, color: C.ink, fontSize: 12.5, fontWeight: '700' }}>{v}</Text>
        </View>
      ))}
    </View>
  );
};

export const Section = ({ title, action, onAction, subtitle, children }) => (
  <View style={{ marginTop: 20 }}>
    <View style={st.secHead}>
      <View>
        <Text style={{ color: C.ink, fontSize: 16.5, fontWeight: '900' }}>{title}</Text>
        {!!subtitle && <Text style={{ color: C.ink3, fontSize: 11, marginTop: 1 }}>{subtitle}</Text>}
      </View>
      {!!action && (
        <TouchableOpacity onPress={onAction} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: C.brand, fontWeight: '800', fontSize: 12.5 }}>{action}</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color={C.brand} />
        </TouchableOpacity>
      )}
    </View>
    {children}
  </View>
);

export const Empty = ({ icon = 'inbox-outline', title, sub, children }) => (
  <View style={{ alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30 }}>
    <View style={st.emptyIcon}>
      <MaterialCommunityIcons name={icon} size={34} color={C.ink3} />
    </View>
    <Text style={{ color: C.ink, fontSize: 17, fontWeight: '800', marginTop: 16, textAlign: 'center' }}>{title}</Text>
    <Text style={{ color: C.ink2, fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 19 }}>{sub}</Text>
    {!!children && <View style={{ marginTop: 18, alignSelf: 'stretch' }}>{children}</View>}
  </View>
);

const st = StyleSheet.create({
  badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: R.pill, alignSelf: 'flex-start' },
  assuredBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5',
    paddingVertical: 3, paddingHorizontal: 7, borderRadius: R.sm, borderWidth: 1, borderColor: '#A7F3D0',
  },
  assuredText: { color: '#059669', fontSize: 10.5, fontWeight: '900', marginLeft: 4 },
  human: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.greenSoft,
    paddingVertical: 3, paddingHorizontal: 7, borderRadius: R.pill,
  },
  star: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.green, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  timerWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: R.pill },
  timerText: { color: C.redDark, fontSize: 11, fontWeight: '800', marginLeft: 4 },
  btn: { flexDirection: 'row', borderRadius: R.md, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  label: { color: C.ink2, fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: R.md,
    paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: C.ink,
  },
  card: { backgroundColor: C.surface, borderRadius: R.lg, overflow: 'hidden' },
  dealTag: {
    position: 'absolute', top: 8, left: 8, backgroundColor: C.red,
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4,
  },
  secHead: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, marginBottom: 12,
  },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  ratingBox: { flexDirection: 'row', backgroundColor: C.bg, borderRadius: R.md, padding: 14, marginVertical: 12 },
  barTrack: { flex: 1, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, marginHorizontal: 8, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  bankWrap: { backgroundColor: '#F0FDF4', borderRadius: R.md, padding: 12, borderWidth: 1, borderColor: '#BBF7D0', marginTop: 14 },
  offerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  specBox: { backgroundColor: C.surface, borderRadius: R.md, borderWidth: 1, borderColor: C.line, marginTop: 10 },
  specRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: C.line },
});
