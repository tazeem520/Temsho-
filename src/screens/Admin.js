import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Image } from 'react-native';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { C, R, shadow, money } from '../theme';
import { Btn, Field, Badge, Thumb, Empty } from '../components/UI';
import { Header } from './Product';
import { useApp } from '../store';
import * as cloud from '../lib/cloud';
import { SELLERS, CATEGORIES } from '../data/catalog';
import { OTP_PROVIDERS_LIST } from '../lib/otp';

const Card = ({ children, style }) => <View style={[ad.card, shadow, style]}>{children}</View>;

const Toggle = ({ icon, label, sub, on, onChange, last }) => (
  <View style={[ad.row, last && { borderBottomWidth: 0 }]}>
    <MC name={icon} size={19} color={C.ink2} />
    <View style={{ flex: 1, marginLeft: 14 }}>
      <Text style={{ color: C.ink, fontWeight: '600', fontSize: 14 }}>{label}</Text>
      {!!sub && <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 2 }}>{sub}</Text>}
    </View>
    <Switch value={on} onValueChange={onChange} trackColor={{ true: C.brand, false: '#D1D5DB' }} thumbColor="#fff" />
  </View>
);

/* =============== ADMIN HOME =============== */
export function Admin({ go }) {
  const { state, isOwner, admin, cloudOn } = useApp();
  if (!isOwner)
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <Header title="Admin" go={go} />
        <Empty icon="lock-outline" title="Access Restricted" sub="This management panel is only accessible to the verified owner account (9044468663)." />
      </View>
    );

  const totalSales = state.orders.filter((o) => o.status !== 'Cancelled').reduce((t, o) => t + o.total, 0);
  const liveProducts = state.products.length;
  const sellers = Object.keys(SELLERS).length + (state.user?.isSeller ? 1 : 0);
  const totalCoupons = (state.adminCoupons || []).length;
  const totalBanners = (state.adminBanners || []).length;

  const Tile = ({ icon, label, value, tint }) => (
    <View style={[ad.tile, shadow]}>
      <View style={[ad.tileIco, { backgroundColor: tint + '1A' }]}><MC name={icon} size={18} color={tint} /></View>
      <Text style={{ color: C.ink, fontWeight: '900', fontSize: 19, marginTop: 8 }}>{value}</Text>
      <Text style={{ color: C.ink3, fontSize: 11, marginTop: 2 }}>{label}</Text>
    </View>
  );

  const Link = ({ icon, label, sub, to, last, tone }) => (
    <TouchableOpacity onPress={() => go(to)} style={[ad.row, last && { borderBottomWidth: 0 }]}>
      <MC name={icon} size={19} color={tone || C.ink2} />
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={{ color: C.ink, fontWeight: '700', fontSize: 14 }}>{label}</Text>
        {!!sub && <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 2 }}>{sub}</Text>}
      </View>
      <MC name="chevron-right" size={19} color={C.ink3} />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={ad.head}>
        <TouchableOpacity onPress={() => go(-1)} style={{ paddingRight: 12 }}>
          <MC name="chevron-left" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900' }}>Admin Control Panel</Text>
          <Text style={{ color: '#ffffffaa', fontSize: 11, marginTop: 2 }}>Owner Management (9044468663)</Text>
        </View>
        <View style={ad.ownerTag}>
          <MC name="crown" size={12} color="#3B2A00" />
          <Text style={{ color: '#3B2A00', fontSize: 10, fontWeight: '900', marginLeft: 4 }}>OWNER</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {admin.maintenance && (
          <View style={ad.warn}>
            <MC name="alert-outline" size={17} color={C.red} />
            <Text style={{ flex: 1, marginLeft: 9, color: C.red, fontSize: 12, fontWeight: '800' }}>
              App is currently in Maintenance Mode — purchases are temporarily paused.
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <Tile icon="cash-multiple" label="Total Marketplace Sales" value={money(totalSales)} tint={C.green} />
          <Tile icon="package-variant" label="Total Orders" value={state.orders.length} tint={C.brand} />
          <Tile icon="tag-multiple-outline" label="Active Products" value={liveProducts} tint={C.accent} />
          <Tile icon="storefront-outline" label="Active Sellers" value={sellers} tint="#DB2777" />
        </View>

        <View style={[ad.cloudBox, cloudOn ? { backgroundColor: C.greenSoft } : { backgroundColor: C.redSoft }]}>
          <MC name={cloudOn ? 'cloud-check-outline' : 'cloud-off-outline'} size={19} color={cloudOn ? C.green : C.red} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ color: cloudOn ? '#059669' : C.red, fontWeight: '900', fontSize: 13 }}>
              {cloudOn ? 'Supabase Realtime Cloud Connected' : 'Database Offline Mode'}
            </Text>
            <Text style={{ color: C.ink2, fontSize: 11, marginTop: 2, lineHeight: 16 }}>
              {cloudOn
                ? 'All buyers and sellers are synchronized in real-time.'
                : 'Supabase database credentials are offline.'}
            </Text>
          </View>
        </View>

        <Text style={ad.sec}>4 CORE SYSTEMS</Text>
        <Card>
          <Link icon="cellphone-key" label="1 · OTP Authentication Engine" sub={`Current: ${admin.otpProvider || 'Supabase / Standard'}`} to="admin-otp" />
          <Link icon="database-sync-outline" label="2 · Cloud Database & Realtime Sync" sub={cloudOn ? 'Online & Synchronized' : 'Offline'} to="admin-database" />
          <Link icon="truck-delivery-outline" label="3 · Logistics & Delivery Charges" sub="Delivery fees, Free delivery threshold" to="admin-logistics" />
          <Link icon="google-play" label="4 · Play Store & Legal Readiness" sub="Privacy Policy, Data Safety, Assets" to="admin-playstore" last />
        </Card>

        <Text style={ad.sec}>PROMOTIONS & MEDIA (OWNER DYNAMIC TOOLS)</Text>
        <Card>
          <Link icon="image-multiple-outline" label="Posters & Banners Manager" sub={`${totalBanners} promotional banners live`} to="admin-banners" />
          <Link icon="ticket-percent-outline" label="Coupon Generator & Manager" sub={`${totalCoupons} active custom coupons`} to="admin-coupons" last />
        </Card>

        <Text style={ad.sec}>GENERAL APP SETTINGS</Text>
        <Card>
          <Link icon="rename-box" label="App Name & Branding" sub={admin.appName} to="admin-brand" />
          <Link icon="cash-sync" label="Pricing, Delivery & Commissions" sub={`Free delivery above ${money(admin.freeDeliveryAbove)}`} to="admin-money" />
          <Link icon="toggle-switch-outline" label="Feature Toggles" sub="COD, UPI, WhatsApp OTP, Seller onboarding" to="admin-features" last />
        </Card>

        <Text style={ad.sec}>COMMUNICATIONS & CONTENT</Text>
        <Card>
          <Link icon="bullhorn-outline" label="Broadcast Push Notifications" sub="Send messages to all app users" to="admin-broadcast" />
          <Link icon="format-list-bulleted" label="Manage Marketplace Listings" sub="Review or remove items" to="admin-products" last />
        </Card>
      </ScrollView>
    </View>
  );
}

/* =============== OWNER POSTER & BANNER MANAGER =============== */
const GRADIENT_PRESETS = [
  { id: 'blue', name: 'Royal Blue', from: '#1E2562', to: '#2874F0', icon: 'fire' },
  { id: 'green', name: 'Emerald', from: '#059669', to: '#10B981', icon: 'shield-check' },
  { id: 'crimson', name: 'Crimson', from: '#9D174D', to: '#DB2777', icon: 'heart-pulse' },
  { id: 'orange', name: 'Sunset', from: '#C2410C', to: '#FF9F00', icon: 'truck-fast' },
  { id: 'purple', name: 'Purple Star', from: '#581C87', to: '#8B5CF6', icon: 'star-shooting' },
  { id: 'teal', name: 'Teal Ocean', from: '#0E7490', to: '#06B6D4', icon: 'tag-multiple' },
];

export function AdminBanners({ go }) {
  const { state, dispatch } = useApp();
  const banners = state.adminBanners || [];
  const [creating, setCreating] = useState(false);
  const [mode, setMode] = useState('gradient'); // 'gradient' | 'image'
  const [f, setF] = useState({
    title: '',
    sub: '',
    tag: 'FESTIVE OFFER',
    preset: 'blue',
    imgUri: null,
    linkTo: 'offers',
    icon: 'fire',
  });

  const pickImage = async () => {
    try {
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [16, 7] });
      if (!r.canceled && r.assets?.[0]?.uri) {
        setF({ ...f, imgUri: r.assets[0].uri });
      }
    } catch (e) {}
  };

  const saveBanner = () => {
    if (!f.title.trim() && !f.imgUri) return;
    const selColor = GRADIENT_PRESETS.find((p) => p.id === f.preset) || GRADIENT_PRESETS[0];
    const newBanner = {
      id: 'bnr_' + Date.now(),
      title: f.title.trim() || 'Temsho Special Offer',
      sub: f.sub.trim() || 'Tap to explore trending deals across India',
      tag: f.tag.trim().toUpperCase() || 'LIMITED TIME',
      from: selColor.from,
      to: selColor.to,
      icon: selColor.icon,
      img: mode === 'image' && f.imgUri ? { uri: f.imgUri } : null,
      linkTo: f.linkTo,
      active: true,
      createdAt: Date.now(),
    };
    dispatch({ type: 'ADMIN_ADD_BANNER', banner: newBanner });
    setF({ title: '', sub: '', tag: 'FESTIVE OFFER', preset: 'blue', imgUri: null, linkTo: 'offers', icon: 'fire' });
    setCreating(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Banner & Poster Manager" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        <View style={ad.note}>
          <MC name="image-multiple" size={19} color={C.brand} />
          <Text style={{ flex: 1, marginLeft: 8, color: C.ink2, fontSize: 12, lineHeight: 18 }}>
            As the owner, you can create and publish custom promotional posters and banners. They will immediately appear on the Home Screen carousel!
          </Text>
        </View>

        {!creating ? (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <Btn
              title="+ Add New Poster / Banner"
              icon="plus"
              tone="brand"
              style={{ flex: 1 }}
              onPress={() => setCreating(true)}
            />
            <Btn
              title="Reset"
              tone="ghost"
              icon="restore"
              onPress={() => dispatch({ type: 'ADMIN_RESET_BANNERS' })}
            />
          </View>
        ) : (
          <Card style={{ padding: 18, marginTop: 12 }}>
            <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16, marginBottom: 12 }}>Create New Poster Banner</Text>

            {/* Poster Format Toggle */}
            <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>Banner Format</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              <TouchableOpacity
                onPress={() => setMode('gradient')}
                style={[ad.chip, mode === 'gradient' && { backgroundColor: C.brand, borderColor: C.brand }]}
              >
                <MC name="palette-outline" size={14} color={mode === 'gradient' ? '#fff' : C.ink2} style={{ marginRight: 5 }} />
                <Text style={{ color: mode === 'gradient' ? '#fff' : C.ink2, fontSize: 12, fontWeight: '700' }}>Gradient Banner</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMode('image')}
                style={[ad.chip, mode === 'image' && { backgroundColor: C.brand, borderColor: C.brand }]}
              >
                <MC name="camera-outline" size={14} color={mode === 'image' ? '#fff' : C.ink2} style={{ marginRight: 5 }} />
                <Text style={{ color: mode === 'image' ? '#fff' : C.ink2, fontSize: 12, fontWeight: '700' }}>Custom Image Poster</Text>
              </TouchableOpacity>
            </View>

            {mode === 'image' && (
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>Upload Poster Image</Text>
                <TouchableOpacity onPress={pickImage} activeOpacity={0.85} style={ad.photoUploadBox}>
                  {f.imgUri ? (
                    <Image source={{ uri: f.imgUri }} style={{ width: '100%', height: '100%', borderRadius: R.md }} resizeMode="cover" />
                  ) : (
                    <>
                      <MC name="image-plus" size={32} color={C.brand} />
                      <Text style={{ color: C.brand, fontSize: 13, fontWeight: '800', marginTop: 6 }}>Select Image from Device</Text>
                      <Text style={{ color: C.ink3, fontSize: 11, marginTop: 2 }}>Recommended aspect ratio 16:7 (HD)</Text>
                    </>
                  )}
                </TouchableOpacity>
                {!!f.imgUri && (
                  <TouchableOpacity onPress={() => setF({ ...f, imgUri: null })} style={{ alignSelf: 'center', marginTop: 6 }}>
                    <Text style={{ color: C.red, fontSize: 12, fontWeight: '800' }}>Remove Image</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <Field
              label="Banner Main Heading / Title"
              placeholder="e.g. Grand Festive Sale 🔥 or 50% Off Ethnic Wear"
              value={f.title}
              onChangeText={(v) => setF({ ...f, title: v })}
            />

            <Field
              label="Subtitle / Offer Description"
              placeholder="e.g. Free shipping on all artisan orders today"
              value={f.sub}
              onChangeText={(v) => setF({ ...f, sub: v })}
            />

            <Field
              label="Tag / Badge Text"
              placeholder="e.g. LIMITED TIME, MEGASALE, FESTIVE"
              autoCapitalize="characters"
              value={f.tag}
              onChangeText={(v) => setF({ ...f, tag: v })}
            />

            {mode === 'gradient' && (
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '700', marginBottom: 8 }}>Color Theme</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {GRADIENT_PRESETS.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => setF({ ...f, preset: p.id })}
                      style={[ad.colorChip, f.preset === p.id && { borderColor: C.brand, borderWidth: 2.5 }]}
                    >
                      <LinearGradient colors={[p.from, p.to]} style={ad.colorDot} />
                      <Text style={{ color: C.ink, fontSize: 11.5, fontWeight: '700', marginLeft: 6 }}>{p.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Target Screen */}
            <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>Where should it open?</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {[
                ['offers', 'Deals Screen', 'sale'],
                ['category', 'Categories', 'view-grid'],
                ['become-seller', 'Seller Hub', 'storefront'],
              ].map(([t, l, ic]) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setF({ ...f, linkTo: t })}
                  style={[ad.chip, f.linkTo === t && { backgroundColor: C.brand, borderColor: C.brand }]}
                >
                  <MC name={ic} size={14} color={f.linkTo === t ? '#fff' : C.ink2} style={{ marginRight: 4 }} />
                  <Text style={{ color: f.linkTo === t ? '#fff' : C.ink2, fontSize: 12, fontWeight: '700' }}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Btn title="Cancel" tone="ghost" style={{ flex: 1 }} onPress={() => setCreating(false)} />
              <Btn title="Publish Banner" tone="green" style={{ flex: 1.3 }} disabled={!f.title && !f.imgUri} onPress={saveBanner} />
            </View>
          </Card>
        )}

        <Text style={[ad.sec, { marginTop: 24 }]}>ACTIVE LIVE POSTERS & BANNERS ({banners.length})</Text>

        {banners.map((b) => (
          <View key={b.id} style={[ad.bannerCard, shadow]}>
            {/* Visual Mini Banner Preview */}
            <View style={ad.bannerPreviewBox}>
              {b.img ? (
                <Image source={typeof b.img === 'string' ? { uri: b.img } : b.img} style={{ width: '100%', height: 110, borderRadius: R.md }} resizeMode="cover" />
              ) : (
                <LinearGradient colors={[b.from || '#1E2562', b.to || '#2874F0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={ad.miniBanner}>
                  <View style={{ flex: 1 }}>
                    <View style={ad.bannerTagBadge}><Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>{b.tag || 'OFFER'}</Text></View>
                    <Text numberOfLines={1} style={{ color: '#fff', fontSize: 15, fontWeight: '900', marginTop: 3 }}>{b.title}</Text>
                    <Text numberOfLines={2} style={{ color: '#ffffffdd', fontSize: 11, marginTop: 2 }}>{b.sub}</Text>
                  </View>
                  <MC name={b.icon || 'bullhorn'} size={36} color="#ffffff30" />
                </LinearGradient>
              )}
            </View>

            {/* Controls */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.line }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Switch
                  value={b.active !== false}
                  onValueChange={() => dispatch({ type: 'ADMIN_TOGGLE_BANNER', id: b.id })}
                  trackColor={{ true: C.green, false: '#D1D5DB' }}
                  thumbColor="#fff"
                />
                <Text style={{ color: b.active !== false ? '#059669' : C.ink3, fontWeight: '800', fontSize: 12, marginLeft: 8 }}>
                  {b.active !== false ? 'LIVE ON HOME' : 'PAUSED'}
                </Text>
              </View>

              <TouchableOpacity onPress={() => dispatch({ type: 'ADMIN_DELETE_BANNER', id: b.id })} style={{ padding: 4 }}>
                <Text style={{ color: C.red, fontWeight: '800', fontSize: 12 }}>Delete Poster</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/* =============== OWNER COUPON MANAGER & GENERATOR =============== */
export function AdminCoupons({ go }) {
  const { state, dispatch } = useApp();
  const coupons = state.adminCoupons || [];
  const [creating, setCreating] = useState(false);
  const [f, setF] = useState({
    code: '',
    type: 'flat', // 'flat' | 'percent' | 'freeship'
    value: '50',
    min: '299',
    max: '300',
    desc: '',
  });

  const save = () => {
    if (!f.code.trim()) return;
    const code = f.code.trim().toUpperCase();
    const newCoupon = {
      id: 'cpn_' + Date.now(),
      code,
      type: f.type,
      off: f.type === 'flat' ? Number(f.value) : undefined,
      pct: f.type === 'percent' ? Number(f.value) : undefined,
      max: f.type === 'percent' ? Number(f.max || 999999) : undefined,
      ship: f.type === 'freeship',
      min: Number(f.min || 0),
      desc: f.desc.trim() || (f.type === 'flat' ? `₹${f.value} off on orders ₹${f.min}+` : f.type === 'percent' ? `${f.value}% off on orders ₹${f.min}+` : 'Free delivery on all orders'),
      active: true,
      createdAt: Date.now(),
    };
    dispatch({ type: 'ADMIN_ADD_COUPON', coupon: newCoupon });
    setF({ code: '', type: 'flat', value: '50', min: '299', max: '300', desc: '' });
    setCreating(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Coupon Manager" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={ad.note}>
          <MC name="ticket-percent" size={19} color={C.brand} />
          <Text style={{ flex: 1, marginLeft: 8, color: C.ink2, fontSize: 12, lineHeight: 18 }}>
            As the owner, you can generate custom discount codes anytime. Customers can enter these codes at checkout to receive instant discounts.
          </Text>
        </View>

        {!creating ? (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <Btn
              title="+ Generate New Coupon"
              icon="plus"
              tone="brand"
              style={{ flex: 1 }}
              onPress={() => setCreating(true)}
            />
            {coupons.length > 0 && (
              <Btn
                title="Wipe All"
                tone="ghost"
                icon="delete-sweep"
                onPress={() => dispatch({ type: 'ADMIN_CLEAR_COUPONS' })}
              />
            )}
          </View>
        ) : (
          <Card style={{ padding: 18, marginTop: 14 }}>
            <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16, marginBottom: 12 }}>Create Promo Coupon</Text>
            
            <Field
              label="Coupon Code (Letters/Numbers)"
              placeholder="e.g. FESTIVE50, MEGA100, WELCOME"
              autoCapitalize="characters"
              value={f.code}
              onChangeText={(v) => setF({ ...f, code: v.toUpperCase() })}
            />

            <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>Discount Type</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              {[
                ['flat', 'Flat ₹ Off', 'cash'],
                ['percent', '% Percent Off', 'percent'],
                ['freeship', 'Free Shipping', 'truck-fast'],
              ].map(([t, l, ic]) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setF({ ...f, type: t })}
                  style={[ad.chip, f.type === t && { backgroundColor: C.brand, borderColor: C.brand }]}
                >
                  <MC name={ic} size={14} color={f.type === t ? '#fff' : C.ink2} style={{ marginRight: 4 }} />
                  <Text style={{ color: f.type === t ? '#fff' : C.ink2, fontSize: 12, fontWeight: '700' }}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {f.type !== 'freeship' && (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Field
                    label={f.type === 'flat' ? 'Discount Amount (₹)' : 'Discount Rate (%)'}
                    keyboardType="number-pad"
                    placeholder="100"
                    value={f.value}
                    onChangeText={(v) => setF({ ...f, value: v.replace(/\D/g, '') })}
                  />
                </View>
                {f.type === 'percent' && (
                  <View style={{ flex: 1 }}>
                    <Field
                      label="Max Discount Cap (₹)"
                      keyboardType="number-pad"
                      placeholder="400"
                      value={f.max}
                      onChangeText={(v) => setF({ ...f, max: v.replace(/\D/g, '') })}
                    />
                  </View>
                )}
              </View>
            )}

            <Field
              label="Minimum Order Value (₹)"
              keyboardType="number-pad"
              placeholder="499"
              value={f.min}
              onChangeText={(v) => setF({ ...f, min: v.replace(/\D/g, '') })}
            />

            <Field
              label="Description (Optional)"
              placeholder="e.g. ₹100 discount on cart value ₹799+"
              value={f.desc}
              onChangeText={(v) => setF({ ...f, desc: v })}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <Btn title="Cancel" tone="ghost" style={{ flex: 1 }} onPress={() => setCreating(false)} />
              <Btn title="Activate Coupon" tone="green" style={{ flex: 1.2 }} disabled={!f.code.trim()} onPress={save} />
            </View>
          </Card>
        )}

        <Text style={[ad.sec, { marginTop: 22 }]}>ACTIVE OWNER COUPONS ({coupons.length})</Text>
        {coupons.length === 0 ? (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <MC name="ticket-percent-outline" size={32} color={C.ink3} />
            <Text style={{ color: C.ink, fontWeight: '800', fontSize: 14, marginTop: 8 }}>No Active Coupons</Text>
            <Text style={{ color: C.ink3, fontSize: 12, marginTop: 4, textAlign: 'center' }}>
              All old coupons have been cleared. Tap "+ Generate New Coupon" to create one.
            </Text>
          </Card>
        ) : (
          coupons.map((c) => (
            <View key={c.id} style={[ad.couponCard, shadow]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={ad.couponCodeBadge}>
                  <Text style={{ color: C.brand, fontWeight: '900', fontSize: 14, letterSpacing: 1 }}>{c.code}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ color: C.ink, fontWeight: '800', fontSize: 13 }}>
                    {c.type === 'freeship' ? 'Free Delivery' : c.off ? `₹${c.off} FLAT OFF` : `${c.pct}% OFF`}
                  </Text>
                  <Text style={{ color: C.ink3, fontSize: 11, marginTop: 2 }}>Min Order: ₹{c.min || 0}</Text>
                </View>
                <Switch
                  value={c.active !== false}
                  onValueChange={() => dispatch({ type: 'ADMIN_TOGGLE_COUPON', id: c.id })}
                  trackColor={{ true: C.green, false: '#D1D5DB' }}
                  thumbColor="#fff"
                />
              </View>

              <Text style={{ color: C.ink2, fontSize: 12, marginTop: 8 }}>{c.desc}</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.line }}>
                <Badge text={c.active !== false ? 'LIVE & WORKING' : 'PAUSED'} tone={c.active !== false ? 'green' : 'grey'} small />
                <TouchableOpacity onPress={() => dispatch({ type: 'ADMIN_DELETE_COUPON', id: c.id })}>
                  <Text style={{ color: C.red, fontWeight: '800', fontSize: 12 }}>Delete Coupon</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

/* =============== 1. OTP PROVIDER SWITCHER =============== */
export function AdminOtp({ go }) {
  const { admin, dispatch } = useApp();
  const [active, setActive] = useState(admin.otpProvider || 'supabase');
  const [done, setDone] = useState(false);

  const save = (id) => {
    setActive(id);
    dispatch({ type: 'ADMIN_SET', patch: { otpProvider: id } });
    if (cloud.cloudOn()) cloud.pushSettings({ ...admin, otpProvider: id }).catch(() => {});
    setDone(true);
    setTimeout(() => setDone(false), 1400);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="OTP Provider Settings" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={ad.sec}>SELECT ACTIVE OTP PROVIDER</Text>
        <Card>
          {OTP_PROVIDERS_LIST.map((p, i) => {
            const isSel = active === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => save(p.id)}
                style={[ad.row, i === OTP_PROVIDERS_LIST.length - 1 && { borderBottomWidth: 0 }, isSel && { backgroundColor: C.brandSoft }]}
              >
                <MC name={p.icon} size={22} color={isSel ? C.brand : C.ink2} />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={{ color: C.ink, fontWeight: '800', fontSize: 14 }}>{p.name}</Text>
                  <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 2 }}>{p.desc}</Text>
                </View>
                {isSel && (
                  <View style={ad.activeTag}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>ACTIVE</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </Card>

        {done && (
          <View style={[ad.warn, { backgroundColor: C.greenSoft, marginTop: 16 }]}>
            <MC name="check-circle" size={17} color={C.green} />
            <Text style={{ flex: 1, marginLeft: 9, color: '#059669', fontSize: 12, fontWeight: '800' }}>
              OTP engine updated successfully!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* =============== 2. CLOUD DATABASE MONITOR =============== */
export function AdminDatabase({ go }) {
  const { state, cloudOn } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Database & Realtime Sync" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={[ad.card, shadow, { padding: 18 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MC name={cloudOn ? 'cloud-check' : 'cloud-alert'} size={28} color={cloudOn ? C.green : C.red} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16 }}>
                {cloudOn ? 'Supabase Database Active' : 'Database Offline'}
              </Text>
              <Text style={{ color: C.ink3, fontSize: 12, marginTop: 2 }}>Region: South Asia (Mumbai) · NANO</Text>
            </View>
          </View>
        </View>

        <Text style={ad.sec}>TABLE METRICS</Text>
        <Card>
          <View style={ad.row}>
            <Text style={{ flex: 1, color: C.ink, fontWeight: '700' }}>Products Table</Text>
            <Badge text={`${state.products.length} items`} tone="brand" />
          </View>
          <View style={ad.row}>
            <Text style={{ flex: 1, color: C.ink, fontWeight: '700' }}>Orders Table</Text>
            <Badge text={`${state.orders.length} orders`} tone="green" />
          </View>
          <View style={ad.row}>
            <Text style={{ flex: 1, color: C.ink, fontWeight: '700' }}>Customer Addresses</Text>
            <Badge text={`${state.addresses.length} saved`} tone="accent" />
          </View>
          <View style={[ad.row, { borderBottomWidth: 0 }]}>
            <Text style={{ flex: 1, color: C.ink, fontWeight: '700' }}>Storage (Product Photos)</Text>
            <Badge text="Public Bucket Active" tone="green" />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

/* =============== 3. LOGISTICS =============== */
export function AdminLogistics({ go }) {
  const { admin, dispatch } = useApp();
  const [f, setF] = useState({
    deliveryFee: String(admin.deliveryFee || 49),
    localDeliveryFee: String(admin.localDeliveryFee || 29),
    freeDeliveryAbove: String(admin.freeDeliveryAbove || 499),
  });
  const [done, setDone] = useState(false);

  const save = () => {
    dispatch({
      type: 'ADMIN_SET',
      patch: {
        deliveryFee: Number(f.deliveryFee),
        localDeliveryFee: Number(f.localDeliveryFee),
        freeDeliveryAbove: Number(f.freeDeliveryAbove),
      },
    });
    if (cloud.cloudOn()) {
      cloud.pushSettings({
        ...admin,
        deliveryFee: Number(f.deliveryFee),
        localDeliveryFee: Number(f.localDeliveryFee),
        freeDeliveryAbove: Number(f.freeDeliveryAbove),
      }).catch(() => {});
    }
    setDone(true);
    setTimeout(() => setDone(false), 1400);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Logistics & Delivery" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Card style={{ padding: 18 }}>
          <Text style={{ fontWeight: '900', color: C.ink, fontSize: 15, marginBottom: 14 }}>Delivery Charges (₹)</Text>
          <Field label="Standard Courier Delivery Fee (₹)" keyboardType="number-pad" value={f.deliveryFee} onChangeText={(v) => setF({ ...f, deliveryFee: v.replace(/\D/g, '') })} />
          <Field label="Local / In-City Delivery Fee (₹)" keyboardType="number-pad" value={f.localDeliveryFee} onChangeText={(v) => setF({ ...f, localDeliveryFee: v.replace(/\D/g, '') })} />
          <Field label="Free Delivery Threshold (Cart Total ₹)" keyboardType="number-pad" value={f.freeDeliveryAbove} onChangeText={(v) => setF({ ...f, freeDeliveryAbove: v.replace(/\D/g, '') })} />

          <Btn title={done ? 'Saved Successfully' : 'Save Changes'} icon={done ? 'check' : 'content-save-outline'} tone={done ? 'green' : 'brand'} style={{ marginTop: 12 }} onPress={save} />
        </Card>

        <Text style={ad.sec}>SUPPORTED COURIER PARTNERS</Text>
        <Card>
          {['Delhivery Express (Surface & Air)', 'BlueDart Express', 'DTDC Courier', 'Ekart Logistics', 'India Post / Speed Post', 'Seller Local Self-Delivery'].map((c, i, arr) => (
            <View key={c} style={[ad.row, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <MC name="check-circle" size={17} color={C.green} />
              <Text style={{ flex: 1, marginLeft: 12, color: C.ink, fontWeight: '700', fontSize: 13.5 }}>{c}</Text>
              <Badge text="ENABLED" tone="green" small />
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

/* =============== 4. PLAY STORE READINESS =============== */
export function AdminPlayStore({ go }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Play Store Readiness" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={[ad.card, shadow, { padding: 18 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MC name="google-play" size={28} color="#0F9D58" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16 }}>Google Play Console Ready</Text>
              <Text style={{ color: C.ink3, fontSize: 12, marginTop: 2 }}>Package: com.temsho.app · v1.0.0</Text>
            </View>
          </View>
        </View>

        <Text style={ad.sec}>COMPLIANCE CHECKLIST</Text>
        <Card>
          <View style={ad.row}>
            <MC name="check-circle" size={18} color={C.green} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: C.ink, fontWeight: '700', fontSize: 13.5 }}>App Icon (512×512 HD)</Text>
              <Text style={{ color: C.ink3, fontSize: 11 }}>assets/icon.png configured</Text>
            </View>
            <Badge text="Ready" tone="green" small />
          </View>
          <View style={ad.row}>
            <MC name="check-circle" size={18} color={C.green} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: C.ink, fontWeight: '700', fontSize: 13.5 }}>Feature Graphic (1024×500)</Text>
              <Text style={{ color: C.ink3, fontSize: 11 }}>assets/play-feature-graphic.png ready</Text>
            </View>
            <Badge text="Ready" tone="green" small />
          </View>
          <View style={ad.row}>
            <MC name="check-circle" size={18} color={C.green} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: C.ink, fontWeight: '700', fontSize: 13.5 }}>DPDP 2023 Privacy Policy</Text>
              <Text style={{ color: C.ink3, fontSize: 11 }}>PRIVACY-POLICY.md compliant</Text>
            </View>
            <Badge text="Ready" tone="green" small />
          </View>
          <View style={[ad.row, { borderBottomWidth: 0 }]}>
            <MC name="check-circle" size={18} color={C.green} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: C.ink, fontWeight: '700', fontSize: 13.5 }}>EAS Build Config (APK & AAB)</Text>
              <Text style={{ color: C.ink3, fontSize: 11 }}>eas.json configured for cloud build</Text>
            </View>
            <Badge text="Ready" tone="green" small />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

/* =============== BRAND SETTINGS =============== */
export function AdminBrand({ go }) {
  const { admin, dispatch } = useApp();
  const [f, setF] = useState({ appName: admin.appName, tagline: admin.tagline, supportName: admin.supportName, supportHours: admin.supportHours, announcement: admin.announcement });
  const [done, setDone] = useState(false);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Brand & Identity" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Card style={{ padding: 18 }}>
          <Field label="App Display Name" placeholder="Temsho" value={f.appName} onChangeText={(v) => setF({ ...f, appName: v })} />
          <Field label="Tagline" placeholder="India's Verified Human Marketplace" value={f.tagline} onChangeText={(v) => setF({ ...f, tagline: v })} />
          <Field label="Support Executive Name" placeholder="Priya S." value={f.supportName} onChangeText={(v) => setF({ ...f, supportName: v })} />
          <Field label="Support Operational Hours" placeholder="24x7" value={f.supportHours} onChangeText={(v) => setF({ ...f, supportHours: v })} />
          <Field label="Home Announcement Banner (Optional)" placeholder="e.g. Grand Savings Festival Live!" value={f.announcement} onChangeText={(v) => setF({ ...f, announcement: v })} />
          <Btn title={done ? 'Saved Successfully' : 'Save Changes'} icon={done ? 'check' : 'content-save-outline'} tone={done ? 'green' : 'brand'}
            onPress={() => {
              dispatch({ type: 'ADMIN_SET', patch: f });
              if (cloud.cloudOn()) cloud.pushSettings({ ...admin, ...f }).catch(() => {});
              setDone(true); setTimeout(() => setDone(false), 1400);
            }} />
        </Card>
      </ScrollView>
    </View>
  );
}

/* =============== PRICING & MONEY =============== */
export function AdminMoney({ go }) {
  const { admin, dispatch } = useApp();
  const [f, setF] = useState({
    freeDeliveryAbove: String(admin.freeDeliveryAbove), deliveryFee: String(admin.deliveryFee),
    referralAmount: String(admin.referralAmount || 100),
    commissionPct: String(admin.commissionPct || 0),
  });
  const [done, setDone] = useState(false);
  const num = (v) => Number(v || 0);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Pricing & Delivery" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Card style={{ padding: 18 }}>
          <Field label="Free Delivery Above (₹)" keyboardType="number-pad" value={f.freeDeliveryAbove} onChangeText={(v) => setF({ ...f, freeDeliveryAbove: v.replace(/\D/g, '') })} />
          <Field label="Standard Delivery Charge (₹)" keyboardType="number-pad" value={f.deliveryFee} onChangeText={(v) => setF({ ...f, deliveryFee: v.replace(/\D/g, '') })} />
          <Field label="Referral Reward (₹)" keyboardType="number-pad" value={f.referralAmount} onChangeText={(v) => setF({ ...f, referralAmount: v.replace(/\D/g, '') })} />
          <Field label="Seller Platform Commission (%)" keyboardType="number-pad" value={f.commissionPct} onChangeText={(v) => setF({ ...f, commissionPct: v.replace(/\D/g, '') })} />
          <Btn title={done ? 'Saved Successfully' : 'Save Changes'} icon={done ? 'check' : 'content-save-outline'} tone={done ? 'green' : 'brand'} style={{ marginTop: 14 }}
            onPress={() => {
              dispatch({ type: 'ADMIN_SET', patch: {
                freeDeliveryAbove: num(f.freeDeliveryAbove), deliveryFee: num(f.deliveryFee),
                referralAmount: num(f.referralAmount), commissionPct: num(f.commissionPct),
              }});
              setDone(true); setTimeout(() => setDone(false), 1400);
            }} />
        </Card>
      </ScrollView>
    </View>
  );
}

/* =============== FEATURE TOGGLES =============== */
export function AdminFeatures({ go }) {
  const { admin, dispatch } = useApp();
  const set = (patch) => dispatch({ type: 'ADMIN_SET', patch });
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Feature Toggles" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={[ad.sec, { marginTop: 0 }]}>PAYMENT CHANNELS</Text>
        <Card>
          <Toggle icon="cash" label="Cash on Delivery (COD)" sub="Allow customers to pay cash upon arrival" on={admin.allowCod} onChange={(v) => set({ allowCod: v })} />
          <Toggle icon="cellphone-check" label="Direct UPI Payments" sub="Allow instant UPI payments to sellers" on={admin.allowUpi} onChange={(v) => set({ allowUpi: v })} last />
        </Card>

        <Text style={ad.sec}>AUTHENTICATION</Text>
        <Card>
          <Toggle icon="whatsapp" label="WhatsApp OTP Delivery" sub="Allow users to receive OTP on WhatsApp" on={admin.allowWhatsappOtp} onChange={(v) => set({ allowWhatsappOtp: v })} last />
        </Card>

        <Text style={ad.sec}>SELLER ONBOARDING</Text>
        <Card>
          <Toggle icon="storefront-plus-outline" label="Open Seller Registration" sub="Allow anyone to open a shop" on={admin.allowAnyoneToSell} onChange={(v) => set({ allowAnyoneToSell: v })} />
          <Toggle icon="camera-outline" label="Require Real Photos" sub="Require sellers to upload real photos" on={admin.requirePhotoToList} onChange={(v) => set({ requirePhotoToList: v })} last />
        </Card>

        <Text style={ad.sec}>SYSTEM STATUS</Text>
        <Card style={{ borderWidth: admin.maintenance ? 1.5 : 0, borderColor: C.red }}>
          <Toggle icon="wrench-outline" label="Maintenance Mode" sub="Pause customer shopping temporarily" on={admin.maintenance} onChange={(v) => set({ maintenance: v })} last />
        </Card>

        <Btn title="Reset to Defaults" tone="ghost" icon="restore" style={{ marginTop: 20 }}
          onPress={() => dispatch({ type: 'ADMIN_RESET' })} />
      </ScrollView>
    </View>
  );
}

/* =============== BROADCAST NOTIFICATIONS =============== */
export function AdminBroadcast({ go }) {
  const { dispatch } = useApp();
  const [f, setF] = useState({ title: '', body: '' });
  const [sent, setSent] = useState(false);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Broadcast Notifications" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Card style={{ padding: 18 }}>
          <Field label="Notification Title" placeholder="e.g. Grand Savings Festival is Live!" value={f.title} onChangeText={(v) => setF({ ...f, title: v })} />
          <Field label="Notification Message" placeholder="e.g. Enjoy up to 70% off across verified Indian artisan listings." multiline value={f.body} onChangeText={(v) => setF({ ...f, body: v })} style={{ height: 90, textAlignVertical: 'top' }} />
          <Btn title={sent ? 'Sent Successfully' : 'Broadcast to All Users'} icon={sent ? 'check' : 'send'} tone={sent ? 'green' : 'brand'} disabled={!f.title}
            onPress={() => { dispatch({ type: 'ADMIN_BROADCAST', title: f.title, body: f.body }); setSent(true); setTimeout(() => go(-1), 800); }} />
        </Card>
      </ScrollView>
    </View>
  );
}

/* =============== PRODUCT MANAGEMENT =============== */
export function AdminProducts({ go }) {
  const { state, dispatch } = useApp();
  const [q, setQ] = useState('');
  const list = state.products.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title={`Manage Products (${state.products.length})`} go={go} />
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <Field placeholder="Search listings by title..." value={q} onChangeText={setQ} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 40 }}>
        {list.map((p) => (
          <View key={p.id} style={[ad.prod, shadow]}>
            <View style={{ width: 54 }}><Thumb img={p.img} title={p.title} tint={p.tint} size={54} /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text numberOfLines={2} style={{ color: C.ink, fontWeight: '700', fontSize: 13 }}>{p.title}</Text>
              <Text style={{ color: C.ink2, fontSize: 12, marginTop: 3 }}>
                {money(p.price)} · {SELLERS[p.seller]?.name || state.shop.name || 'Verified Seller'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => dispatch({ type: 'ADMIN_REMOVE_PRODUCT', id: p.id })} style={ad.del}>
              <MC name="delete-outline" size={18} color={C.red} />
            </TouchableOpacity>
          </View>
        ))}
        {list.length === 0 && <Text style={{ color: C.ink3, textAlign: 'center', marginTop: 40 }}>No products found matching query.</Text>}
      </ScrollView>
    </View>
  );
}

const ad = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingTop: 46, paddingHorizontal: 16, paddingBottom: 16 },
  ownerTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.accent, paddingHorizontal: 9, paddingVertical: 5, borderRadius: R.pill },
  card: { backgroundColor: C.surface, borderRadius: R.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: C.line },
  sec: { color: C.ink3, fontSize: 11.5, fontWeight: '900', letterSpacing: 0.8, marginTop: 22, marginBottom: 8, marginLeft: 4 },
  tile: { flexGrow: 1, minWidth: '46%', backgroundColor: C.surface, borderRadius: R.lg, padding: 14 },
  tileIco: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  warn: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.redSoft, borderRadius: R.md, padding: 12, marginBottom: 14 },
  cloudBox: { flexDirection: 'row', alignItems: 'center', borderRadius: R.md, padding: 13, marginTop: 18 },
  prod: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: R.md, padding: 10, marginBottom: 10 },
  del: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.redSoft, alignItems: 'center', justifyContent: 'center' },
  activeTag: { backgroundColor: C.green, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  note: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.brandSoft, borderRadius: R.sm, padding: 11, marginBottom: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.line, borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 7 },
  colorChip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.line, borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 6 },
  colorDot: { width: 16, height: 16, borderRadius: 8 },
  photoUploadBox: { height: 130, borderRadius: R.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#C7D2FE', backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  bannerCard: { backgroundColor: C.surface, borderRadius: R.lg, padding: 14, marginBottom: 14 },
  bannerPreviewBox: { borderRadius: R.md, overflow: 'hidden' },
  miniBanner: { height: 100, borderRadius: R.md, padding: 12, flexDirection: 'row', alignItems: 'center' },
  bannerTagBadge: { backgroundColor: '#ffffff26', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  couponCard: { backgroundColor: C.surface, borderRadius: R.lg, padding: 14, marginBottom: 12 },
  couponCodeBadge: { backgroundColor: C.brandSoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: R.sm, borderWidth: 1, borderStyle: 'dashed', borderColor: '#C7D2FE' },
});
