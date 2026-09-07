import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Image, Linking, Share, Modal } from 'react-native';
import { C, R, shadow, money } from '../theme';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Btn, Field, Badge, HumanTag, Empty, Thumb, Avatar } from '../components/UI';
import { Header } from './Product';
import { CATEGORIES } from '../data/catalog';
import { useApp } from '../store';
import * as cloud from '../lib/cloud';
import { UpiQR } from '../components/Upi';

/* ---------------- ACCOUNT HOME (CLEAN NO-OVERLAP LAYOUT) ---------------- */
export function Account({ go }) {
  const { state, dispatch, unread, isOwner } = useApp();
  const u = state.user;
  const wish = state.products.filter((p) => state.wishlist.includes(p.id));

  const shareMessage = `🛍️ Temsho — India's Verified Human Marketplace!\nNo bots, 100% real human sellers. Buy directly with full transparency.\n\nInvite Code: *${u?.referral || 'TEM2026X'}*\nDownload App: https://temsho.in`;

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    Linking.openURL(url).catch(() => {});
  };

  const Row = ({ e, t, s, onPress, tone, badge }) => (
    <TouchableOpacity onPress={onPress} style={ac.row}>
      <MC name={e} size={20} color={tone === 'red' ? C.red : C.ink2} />
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={{ color: tone === 'red' ? C.red : C.ink, fontWeight: '700', fontSize: 14 }}>{t}</Text>
        {!!s && <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 2 }}>{s}</Text>}
      </View>
      {!!badge && <View style={{ marginRight: 6 }}><Badge text={badge} tone="accent" small /></View>}
      <MC name="chevron-right" size={20} color={C.ink3} />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* 1. Clean Header without Negative Margin Overlaps */}
      <View style={ac.headerWrap}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 19, fontWeight: '900' }}>My Account</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => go('settings')} style={ac.gear}>
            <MC name="cog-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Profile Info Card Inside Header Flow */}
        <View style={[ac.profileBox, shadow]}>
          <Avatar name={u?.name || 'User'} hue={C.brand} size={54} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16.5 }}>{u?.name || 'Valued User'}</Text>
            <Text style={{ color: C.ink3, fontSize: 13, marginTop: 2, fontWeight: '600' }}>+91 {u?.phone}</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, alignItems: 'center' }}>
              <HumanTag small />
              {u?.isSeller && <Badge text="VERIFIED SELLER" tone="accent" small />}
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 14, paddingBottom: 50 }}>
        {/* Share with Friends Banner */}
        <TouchableOpacity activeOpacity={0.85} onPress={shareWhatsApp} style={[ac.shareBanner, shadow]}>
          <MC name="whatsapp" size={24} color="#25D366" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: C.ink, fontWeight: '900', fontSize: 13.5 }}>Invite Friends to Temsho</Text>
            <Text style={{ color: C.ink3, fontSize: 11, marginTop: 1 }}>Share the genuine human marketplace via WhatsApp</Text>
          </View>
          <MC name="share-variant" size={18} color={C.brand} />
        </TouchableOpacity>

        {/* OWNER ADMIN CTA */}
        {isOwner && (
          <TouchableOpacity activeOpacity={0.9} onPress={() => go('admin')} style={[ac.ownerCta, shadow]}>
            <View style={ac.crown}><MC name="crown" size={22} color={C.accent} /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>Owner Admin Panel</Text>
              <Text style={{ color: '#ffffffcc', fontSize: 12, marginTop: 2 }}>Seller Directory, Payouts & Audit Ledger (9044468663)</Text>
            </View>
            <MC name="chevron-right" size={22} color="#fff" />
          </TouchableOpacity>
        )}

        {/* SELLER CTA */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => go(u?.isSeller ? 'seller' : 'become-seller')} style={[ac.sellCta, shadow]}>
          <View style={ac.sellIco}><MC name="storefront-outline" size={24} color="#fff" /></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>
              {u?.isSeller ? 'Open Seller Dashboard' : 'Start Selling on Temsho'}
            </Text>
            <Text style={{ color: '#ffffffcc', fontSize: 12, marginTop: 3 }}>
              {u?.isSeller ? `${u.shopName || state.shop?.name || 'My Shop'} · ${u.shopCity || state.shop?.city || 'India'}` : '0% commission · Direct UPI / Bank Payouts'}
            </Text>
          </View>
          <MC name="chevron-right" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Main Orders & Activity Links */}
        <View style={[ac.card, shadow, { marginTop: 14 }]}>
          <Row e="package-variant" t="My Orders" s={`${state.orders.length} orders placed`} onPress={() => go('orders')} />
          <Row e="bell-outline" t="Notifications" s={unread > 0 ? `${unread} new updates` : 'All caught up'} onPress={() => go('notifications')} />
          <Row e="heart-outline" t="Wishlist" s={`${wish.length} saved items`} onPress={() => go('wishlist')} />
          <Row e="map-marker-outline" t="Saved Delivery Addresses" s={`${state.addresses.length} saved addresses`} onPress={() => go('addresses')} />
        </View>

        {/* Support & Legal */}
        <View style={[ac.card, shadow, { marginTop: 14 }]}>
          <Row e="headset" t="Contact Real Human Support" s="24x7 dedicated human team" onPress={() => go('support')} />
          <Row e="shield-check-outline" t="No Bot, Only Humans Policy" s="Our marketplace commitment" onPress={() => go('policy')} />
          <Row e="file-document-outline" t="Privacy Policy & Terms" s="DPDP Act 2023 compliant" onPress={() => go('privacy-policy')} />
          <Row e="cog-outline" t="Settings & Preferences" s="Profile, location, language" onPress={() => go('settings')} />
          <Row e="logout" t="Log Out" tone="red" onPress={() => dispatch({ type: 'LOGOUT' })} />
        </View>

        <Text style={{ textAlign: 'center', color: C.ink3, fontSize: 11.5, marginTop: 24, lineHeight: 18 }}>
          Temsho v1.0.8{'\n'}Crafted in India · Built by humans, for humans
        </Text>
      </ScrollView>
    </View>
  );
}

export function Wishlist({ go }) {
  const { state, dispatch } = useApp();
  const items = state.products.filter((p) => state.wishlist.includes(p.id));
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Wishlist" go={go} />
      {items.length === 0 ? (
        <Empty icon="heart-outline" title="Your wishlist is empty" sub="Tap the heart icon on any product page to save items here.">
          <Btn title="Browse Products" onPress={() => go('category', { cat: null })} />
        </Empty>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {items.map((p) => (
            <View key={p.id} style={[ac.wishRow, shadow]}>
              <TouchableOpacity style={{ width: 70 }} onPress={() => go('product', { id: p.id })}>
                <Thumb img={p.img} title={p.title} tint={p.tint} size={70} />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text numberOfLines={2} style={{ color: C.ink, fontWeight: '600', fontSize: 13.5 }}>{p.title}</Text>
                <Text style={{ fontWeight: '900', color: C.ink, marginTop: 6 }}>{money(p.price)}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <TouchableOpacity onPress={() => { dispatch({ type: 'ADD_CART', id: p.id }); go('cart'); }} style={ac.mini}>
                    <Text style={{ color: C.brand, fontWeight: '800', fontSize: 12 }}>Add to Cart</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => dispatch({ type: 'WISH', id: p.id })} style={ac.mini}>
                    <Text style={{ color: C.red, fontWeight: '800', fontSize: 12 }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

/* ---------------- SELLER ONBOARDING (WITH PAYMENT METHODS) ---------------- */
export function BecomeSeller({ go }) {
  const { state, dispatch } = useApp();
  const [f, setF] = useState({
    shop: '',
    pickup: '',
    city: '',
    state: 'Uttar Pradesh',
    pin: '',
    contact: state.user?.phone || '',
    payName: state.user?.name || '',
    upi: '',
    bankName: '',
    accNo: '',
    ifsc: '',
    acceptUpi: true,
    acceptCod: true,
    acceptBank: true,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const ok =
    f.shop.trim() &&
    f.city.trim() &&
    f.pin.trim().length === 6 &&
    f.pickup.trim() &&
    f.payName.trim() &&
    (f.upi.trim() || (f.accNo.trim() && f.ifsc.trim()));

  const launchShop = async () => {
    if (!ok) {
      setErr('Please fill in all mandatory shop details and your Bank / UPI payout information.');
      return;
    }
    setErr('');
    setSaving(true);

    const shopData = {
      name: f.shop.trim(),
      city: f.city.trim(),
      state: f.state.trim(),
      pin: f.pin.trim(),
      pickup: f.pickup.trim(),
      contact: f.contact || state.user?.phone,
      payName: f.payName.trim(),
      upi: f.upi.trim(),
      bankName: f.bankName.trim() || 'Direct Bank Settlement',
      accNo: f.accNo.trim(),
      ifsc: f.ifsc.trim().toUpperCase(),
      acceptUpi: f.acceptUpi,
      acceptCod: f.acceptCod,
      acceptBank: f.acceptBank,
      sellerPhone: state.user?.phone,
    };

    if (cloud.cloudOn()) {
      try {
        const uRes = await cloud.upsertUser({ ...state.user, isSeller: true });
        if (uRes?.id) {
          await cloud.upsertShop(shopData, uRes.id);
        }
      } catch (e) {}
    }

    dispatch({
      type: 'BECOME_SELLER',
      shopName: f.shop.trim(),
      shopCity: f.city.trim(),
      shop: shopData,
    });

    setSaving(false);
    go('seller');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Start Selling" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        {/* Banner */}
        <View style={[ac.card, shadow, { padding: 18 }]}>
          <View style={ac.bigIco}><MC name="storefront-outline" size={26} color={C.brand} /></View>
          <Text style={{ fontSize: 18, fontWeight: '900', color: C.ink, marginTop: 12 }}>
            Anyone Can Sell on Temsho
          </Text>
          <Text style={{ color: C.ink2, fontSize: 13, lineHeight: 20, marginTop: 6 }}>
            Set up your shop in 2 minutes. Enter your dispatch address and bank/UPI payout details to receive 100% of your earnings directly.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <Badge text="0% Commission" tone="green" />
            <Badge text="Direct Bank / UPI Payouts" tone="accent" />
            <Badge text="Doorstep Courier Pickup" tone="green" />
            <Badge text="No Documents Needed" tone="brand" />
          </View>
        </View>

        <View style={ac.freeNote}>
          <MC name="truck-fast" size={18} color={C.green} />
          <Text style={{ flex: 1, marginLeft: 10, color: '#059669', fontSize: 12, fontWeight: '700', lineHeight: 18 }}>
            Couriers (Delhivery/Ekart/India Post) pick parcels directly from your entered doorstep address.
          </Text>
        </View>

        {/* 1. SHOP DETAILS */}
        <Text style={ac.step}>1 · SHOP & DISPATCH ADDRESS</Text>
        <View style={[ac.card, shadow, { padding: 18 }]}>
          <View style={ac.numBox}>
            <MC name="cellphone-check" size={19} color={C.green} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ color: C.ink, fontWeight: '800', fontSize: 13 }}>+91 {state.user?.phone}</Text>
              <Text style={{ color: C.green, fontSize: 11, fontWeight: '700', marginTop: 2 }}>Verified Dispatch Phone</Text>
            </View>
          </View>
          <Field label="Shop / Business Name *" placeholder="e.g. Sharma Handloom or Rahul Crafts" value={f.shop} onChangeText={(v) => setF({ ...f, shop: v })} />
          <Field label="Pickup Street Address (Where courier picks up parcels) *" placeholder="Shop No., House No., Street, Landmark, Area" multiline value={f.pickup} onChangeText={(v) => setF({ ...f, pickup: v })} style={{ height: 75, textAlignVertical: 'top' }} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}><Field label="City / District *" placeholder="Lucknow" value={f.city} onChangeText={(v) => setF({ ...f, city: v })} /></View>
            <View style={{ flex: 1 }}><Field label="State *" placeholder="Uttar Pradesh" value={f.state} onChangeText={(v) => setF({ ...f, state: v })} /></View>
          </View>
          <Field label="Dispatch PIN Code (6-digit) *" placeholder="226010" keyboardType="number-pad" value={f.pin} onChangeText={(v) => setF({ ...f, pin: v.replace(/\D/g, '').slice(0, 6) })} />
        </View>

        {/* 2. PAYMENT & SETTLEMENT DETAILS (MANDATORY) */}
        <Text style={ac.step}>2 · SELLER BANK & PAYOUT DETAILS (MANDATORY)</Text>
        <View style={[ac.card, shadow, { padding: 18 }]}>
          <Text style={{ color: C.ink2, fontSize: 12.5, lineHeight: 18, marginBottom: 14 }}>
            Please enter your bank account or UPI ID. 100% of product payments flow directly to your account.
          </Text>

          <Field
            label="Account Holder Name (as in Bank) *"
            placeholder="e.g. Rahul Sharma"
            value={f.payName}
            onChangeText={(v) => setF({ ...f, payName: v })}
          />

          <Field
            label="Seller Payout UPI ID *"
            placeholder="e.g. 9876543210@paytm or shopname@upi"
            autoCapitalize="none"
            value={f.upi}
            onChangeText={(v) => setF({ ...f, upi: v })}
          />

          <Field
            label="Bank Name (Optional)"
            placeholder="e.g. State Bank of India, HDFC Bank, PNB"
            value={f.bankName}
            onChangeText={(v) => setF({ ...f, bankName: v })}
          />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1.2 }}>
              <Field
                label="Bank Account Number"
                placeholder="Account No."
                keyboardType="number-pad"
                value={f.accNo}
                onChangeText={(v) => setF({ ...f, accNo: v.replace(/\D/g, '') })}
              />
            </View>
            <View style={{ flex: 0.8 }}>
              <Field
                label="IFSC Code"
                placeholder="SBIN0001234"
                autoCapitalize="characters"
                value={f.ifsc}
                onChangeText={(v) => setF({ ...f, ifsc: v.toUpperCase() })}
              />
            </View>
          </View>

          <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '700', marginTop: 10, marginBottom: 8 }}>Accepted Payment Channels</Text>
          <TouchableOpacity onPress={() => setF({ ...f, acceptUpi: !f.acceptUpi })} style={[ac.payOpt, f.acceptUpi && ac.payOn]}>
            <MC name={f.acceptUpi ? 'checkbox-marked' : 'checkbox-blank-outline'} size={20} color={f.acceptUpi ? C.green : C.ink3} />
            <MC name="cellphone-check" size={19} color={C.brand} style={{ marginLeft: 12 }} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ color: C.ink, fontWeight: '800', fontSize: 13 }}>Direct UPI Payments (GPay/PhonePe)</Text>
              <Text style={{ color: C.ink3, fontSize: 11, marginTop: 1 }}>Instant settlement to your UPI ID</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setF({ ...f, acceptCod: !f.acceptCod })} style={[ac.payOpt, f.acceptCod && ac.payOn, { marginTop: 8 }]}>
            <MC name={f.acceptCod ? 'checkbox-marked' : 'checkbox-blank-outline'} size={20} color={f.acceptCod ? C.green : C.ink3} />
            <MC name="cash" size={19} color={C.brand} style={{ marginLeft: 12 }} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ color: C.ink, fontWeight: '800', fontSize: 13 }}>Cash on Delivery (COD)</Text>
              <Text style={{ color: C.ink3, fontSize: 11, marginTop: 1 }}>Cash collected by courier and remitted to you</Text>
            </View>
          </TouchableOpacity>
        </View>

        {!!err && (
          <View style={[ac.freeNote, { backgroundColor: C.redSoft, marginTop: 12 }]}>
            <MC name="alert-circle" size={18} color={C.red} />
            <Text style={{ flex: 1, marginLeft: 8, color: C.red, fontSize: 12, fontWeight: '800' }}>{err}</Text>
          </View>
        )}

        <Btn
          title={saving ? 'Launching Shop…' : 'Launch My Shop & Start Selling'}
          icon="storefront-plus-outline"
          tone="green"
          disabled={!ok || saving}
          style={{ marginTop: 20 }}
          onPress={launchShop}
        />
      </ScrollView>
    </View>
  );
}

/* ---------------- SELLER DASHBOARD (WITH UNLIMITED PHOTOS, SIZES & AGE VARIANTS) ---------------- */
const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '28', '30', '32', '34', '36', '38', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'Free Size'];
const KIDS_AGE_VARIANTS = [
  '0-6 Months', '6-12 Months', '1-2 Years', '2-3 Years', '3-4 Years', '4-5 Years',
  '5-6 Years', '6-7 Years', '7-8 Years', '8-9 Years', '9-10 Years', '11-12 Years', '13-14 Years', '15-16 Years'
];

export function Seller({ go }) {
  const { state, dispatch } = useApp();
  const u = state.user;
  const userPhone = u?.phone || '';
  const mine = state.products.filter(
    (p) => p.seller === 'me' || p.sellerPhone === userPhone || p.sellerName === u.shopName || p.sellerName === state.shop?.name
  );
  const [add, setAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customSizeText, setCustomSizeText] = useState('');
  const [f, setF] = useState({
    title: '',
    price: '',
    mrp: '',
    cat: 'fashion',
    desc: '',
    images: [],
    video: null,
    variantType: 'size', // 'none' | 'size' | 'age'
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  });

  const handleSelectCat = (catId) => {
    if (catId === 'kids') {
      setF((x) => ({
        ...x,
        cat: catId,
        variantType: 'age',
        sizes: ['1-2 Years', '2-3 Years', '3-4 Years', '5-6 Years', '7-8 Years'],
      }));
    } else if (catId === 'fashion') {
      setF((x) => ({
        ...x,
        cat: catId,
        variantType: 'size',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      }));
    } else if (catId === 'footwear') {
      setF((x) => ({
        ...x,
        cat: catId,
        variantType: 'size',
        sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
      }));
    } else {
      setF((x) => ({
        ...x,
        cat: catId,
        variantType: 'none',
        sizes: [],
      }));
    }
  };

  const toggleVariant = (item) => {
    const cur = f.sizes || [];
    if (cur.includes(item)) {
      setF((x) => ({ ...x, sizes: cur.filter((s) => s !== item) }));
    } else {
      setF((x) => ({ ...x, sizes: [...cur, item] }));
    }
  };

  const addCustomVariant = () => {
    const text = customSizeText.trim();
    if (!text) return;
    const cur = f.sizes || [];
    if (!cur.includes(text)) {
      setF((x) => ({ ...x, sizes: [...cur, text] }));
    }
    setCustomSizeText('');
  };

  const pickPhotos = async () => {
    try {
      const r = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 0,
      });
      if (!r.canceled && r.assets && r.assets.length > 0) {
        const newImgs = r.assets.map((a) => ({ uri: a.uri }));
        setF((x) => ({ ...x, images: [...(x.images || []), ...newImgs] }));
      }
    } catch (e) {
      try {
        const r2 = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
        if (!r2.canceled && r2.assets?.[0]?.uri) {
          setF((x) => ({ ...x, images: [...(x.images || []), { uri: r2.assets[0].uri }] }));
        }
      } catch (err) {}
    }
  };

  const takePhoto = async () => {
    try {
      const r = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (!r.canceled && r.assets?.[0]?.uri) {
        setF((x) => ({ ...x, images: [...(x.images || []), { uri: r.assets[0].uri }] }));
      }
    } catch (e) {}
  };

  const pickVideo = async () => {
    try {
      const r = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        videoMaxDuration: 180,
        quality: 0.7,
      });
      if (!r.canceled && r.assets?.[0]?.uri) {
        setF((x) => ({ ...x, video: { uri: r.assets[0].uri, duration: r.assets[0].duration || 0 } }));
      }
    } catch (e) {}
  };

  const removePhoto = (idx) => {
    setF((x) => ({ ...x, images: (x.images || []).filter((_, i) => i !== idx) }));
  };

  const makeCoverPhoto = (idx) => {
    if (idx === 0) return;
    setF((x) => {
      const list = [...(x.images || [])];
      const target = list.splice(idx, 1)[0];
      return { ...x, images: [target, ...list] };
    });
  };

  const save = async () => {
    const cat = CATEGORIES.find((c) => c.id === f.cat);
    setSaving(true);
    const mainImg = (f.images && f.images[0]) ? (f.images[0].uri || f.images[0]) : null;
    const allImgs = (f.images || []).map((im) => (typeof im === 'object' && im !== null && im.uri ? im.uri : im));

    let cloudProd = null;
    if (cloud.cloudOn()) {
      try {
        cloudProd = await cloud.pushProduct(
          {
            ...f,
            img: mainImg,
            images: allImgs.length > 0 ? allImgs : (mainImg ? [mainImg] : []),
            video: f.video?.uri || null,
            price: Number(f.price),
            mrp: Number(f.mrp || f.price),
            sellerPhone: userPhone,
            variantType: f.variantType || 'none',
            sizes: f.variantType !== 'none' ? (f.sizes || []) : [],
          },
          state.user?.cloudId,
          state.shop?.cloudId
        );
      } catch (e) {}
    }

    const localProd = cloudProd || {
      id: 'my' + Date.now(),
      title: f.title,
      cat: f.cat,
      price: Number(f.price),
      mrp: Number(f.mrp || f.price),
      rating: 0,
      ratingCount: 0,
      seller: 'me',
      sellerPhone: userPhone,
      sellerName: u.shopName || state.shop?.name || 'My Shop',
      sellerCity: u.shopCity || state.shop?.city || 'India',
      sellerUpi: state.shop?.upi || '',
      img: mainImg,
      images: allImgs.length > 0 ? allImgs : (mainImg ? [mainImg] : []),
      video: f.video?.uri || null,
      variantType: f.variantType || 'none',
      sizes: f.variantType !== 'none' ? (f.sizes || []) : [],
      tint: cat?.tint || '#F3F4F6',
      desc: f.desc || 'Product listed by verified seller.',
      tags: ['New Arrival', 'Cash on Delivery'],
    };

    dispatch({ type: 'ADD_PRODUCT', product: localProd });

    // Sync from cloud database
    if (cloud.cloudOn()) {
      cloud.pullProducts().then((list) => {
        if (list && list.length > 0) dispatch({ type: 'CLOUD_PRODUCTS', list });
      }).catch(() => {});
    }

    setSaving(false);
    setF({
      title: '',
      price: '',
      mrp: '',
      cat: 'fashion',
      desc: '',
      images: [],
      video: null,
      variantType: 'size',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    });
    setAdd(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Seller Dashboard" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Shop Header Card */}
        <View style={[ac.shopCard, shadow]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={ac.av}><MC name="storefront-outline" size={22} color={C.brand} /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: '900', color: C.ink, fontSize: 15 }}>{u.shopName || state.shop?.name || 'My Shop'}</Text>
              <Text style={{ color: C.ink3, fontSize: 12, marginTop: 2 }}>{u.shopCity || state.shop?.city || 'India'} · +91 {userPhone}</Text>
            </View>
            <HumanTag small />
          </View>
          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            {[['Listings', mine.length], ['Orders', state.orders.length], ['Rating', '5.0 ⭐'], ['Commission', '0%']].map(([l, v]) => (
              <View key={l} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16 }}>{v}</Text>
                <Text style={{ color: C.ink3, fontSize: 10.5, marginTop: 2 }}>{l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bank & Payout Badge with Direct Add/Edit Option */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => go('shop-settings')}
          style={[ac.payoutBadge, shadow]}
        >
          <MC name="bank-check" size={20} color={C.green} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ color: C.ink, fontSize: 13, fontWeight: '800' }}>
              Payout Account: {state.shop?.upi || state.shop?.bankName || 'Direct UPI Active'}
            </Text>
            <Text style={{ color: C.ink3, fontSize: 11, marginTop: 1 }}>
              Holder: {state.shop?.payName || u.name} · Tap to update Bank/UPI details
            </Text>
          </View>
          <View style={ac.editBtnSmall}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 11 }}>EDIT</Text>
          </View>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <Btn title="Orders & Dispatch" icon="tray-arrow-down" tone="ghost" style={{ flex: 1 }} onPress={() => go('seller-orders')} />
          <Btn title="Shop & Payment Settings" icon="cog-outline" tone="ghost" style={{ flex: 1.1 }} onPress={() => go('shop-settings')} />
        </View>

        {!add ? (
          <Btn title="List a New Product" icon="plus" tone="accent" style={{ marginTop: 12 }} onPress={() => setAdd(true)} />
        ) : (
          <View style={[ac.card, shadow, { padding: 18, marginTop: 16 }]}>
            <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16, marginBottom: 14 }}>New Product Listing</Text>
            <Field label="Product Title *" placeholder="e.g. Handcrafted Cotton Kurti / Kids Denim" value={f.title} onChangeText={(v) => setF({ ...f, title: v })} />
            
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Field label="Selling Price (₹) *" keyboardType="number-pad" placeholder="799" value={f.price} onChangeText={(v) => setF({ ...f, price: v.replace(/\D/g, '') })} />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="MRP (₹)" keyboardType="number-pad" placeholder="1499" value={f.mrp} onChangeText={(v) => setF({ ...f, mrp: v.replace(/\D/g, '') })} />
              </View>
            </View>

            {/* Category Selector */}
            <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => handleSelectCat(c.id)}
                  style={[
                    ac.chip,
                    { flexDirection: 'row', alignItems: 'center' },
                    f.cat === c.id && { backgroundColor: C.brand, borderColor: C.brand }
                  ]}
                >
                  <MC name={c.icon} size={13} color={f.cat === c.id ? '#fff' : C.ink2} style={{ marginRight: 5 }} />
                  <Text style={{ color: f.cat === c.id ? '#fff' : C.ink2, fontSize: 12.5, fontWeight: '600' }}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* SIZE / AGE IN YEARS VARIANTS CONFIGURATION */}
            <View style={{ marginBottom: 16, backgroundColor: '#F8FAFC', borderRadius: R.md, padding: 12, borderWidth: 1, borderColor: C.line }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: C.ink, fontSize: 13, fontWeight: '800' }}>
                  Product Sizes & Age Options
                </Text>
                {f.variantType !== 'none' && (
                  <Text style={{ color: C.brand, fontSize: 11, fontWeight: '800' }}>
                    {f.sizes?.length || 0} options selected
                  </Text>
                )}
              </View>

              {/* 3 Variant Modes: No Size, Sizes, Kids Age */}
              <View style={ac.variantTabRow}>
                {[
                  { id: 'none', label: 'No Size (One Size)' },
                  { id: 'size', label: 'Sizes (S, M, L...)' },
                  { id: 'age', label: 'Kids Age (Years/Months)' },
                ].map((tab) => {
                  const on = f.variantType === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      onPress={() => setF({
                        ...f,
                        variantType: tab.id,
                        sizes: tab.id === 'size' ? (f.sizes?.length > 0 ? f.sizes : ['S', 'M', 'L', 'XL'])
                          : tab.id === 'age' ? (f.sizes?.length > 0 ? f.sizes : ['1-2 Years', '2-3 Years', '3-4 Years'])
                          : [],
                      })}
                      style={[ac.variantTabBtn, on && ac.variantTabBtnActive]}
                    >
                      <Text style={[ac.variantTabLabel, on && ac.variantTabLabelActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* SIZES CHIPS */}
              {f.variantType === 'size' && (
                <View style={{ marginTop: 6 }}>
                  <Text style={{ color: C.ink3, fontSize: 11, fontWeight: '700', marginBottom: 6 }}>
                    Tap to select available sizes:
                  </Text>
                  <View style={ac.pillGrid}>
                    {STANDARD_SIZES.map((sz) => {
                      const sel = (f.sizes || []).includes(sz);
                      return (
                        <TouchableOpacity
                          key={sz}
                          onPress={() => toggleVariant(sz)}
                          style={[ac.pillItem, sel && ac.pillItemActive]}
                        >
                          <Text style={[ac.pillText, sel && ac.pillTextActive]}>{sz}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Add Custom Size Input */}
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                    <TextInput
                      value={customSizeText}
                      onChangeText={setCustomSizeText}
                      placeholder="Add custom size (e.g. 40, UK 8.5)"
                      placeholderTextColor={C.ink3}
                      style={{
                        flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line,
                        borderRadius: R.sm, paddingHorizontal: 10, paddingVertical: 6, fontSize: 12, color: C.ink,
                      }}
                    />
                    <TouchableOpacity
                      onPress={addCustomVariant}
                      style={{ backgroundColor: C.brand, paddingHorizontal: 12, justifyContent: 'center', borderRadius: R.sm }}
                    >
                      <Text style={{ color: '#fff', fontSize: 11.5, fontWeight: '800' }}>+ Add Size</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* KIDS AGE IN YEARS/MONTHS CHIPS */}
              {f.variantType === 'age' && (
                <View style={{ marginTop: 6 }}>
                  <Text style={{ color: C.ink3, fontSize: 11, fontWeight: '700', marginBottom: 6 }}>
                    Tap to select available Age / Years:
                  </Text>
                  <View style={ac.pillGrid}>
                    {KIDS_AGE_VARIANTS.map((ag) => {
                      const sel = (f.sizes || []).includes(ag);
                      return (
                        <TouchableOpacity
                          key={ag}
                          onPress={() => toggleVariant(ag)}
                          style={[ac.pillItem, sel && ac.pillItemActive]}
                        >
                          <Text style={[ac.pillText, sel && ac.pillTextActive]}>{ag}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Add Custom Age Input */}
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                    <TextInput
                      value={customSizeText}
                      onChangeText={setCustomSizeText}
                      placeholder="Add custom age (e.g. 10-12 Years, Newborn)"
                      placeholderTextColor={C.ink3}
                      style={{
                        flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line,
                        borderRadius: R.sm, paddingHorizontal: 10, paddingVertical: 6, fontSize: 12, color: C.ink,
                      }}
                    />
                    <TouchableOpacity
                      onPress={addCustomVariant}
                      style={{ backgroundColor: C.brand, paddingHorizontal: 12, justifyContent: 'center', borderRadius: R.sm }}
                    >
                      <Text style={{ color: '#fff', fontSize: 11.5, fontWeight: '800' }}>+ Add Age</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Unlimited Photos Upload Section */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: C.ink, fontSize: 13, fontWeight: '800' }}>Product Photos (Unlimited)</Text>
              <Text style={{ color: C.brand, fontSize: 11, fontWeight: '800' }}>
                📸 {f.images?.length || 0} photos uploaded
              </Text>
            </View>

            {/* Photos Preview Horizontal Scroll */}
            {f.images && f.images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                {f.images.map((img, idx) => (
                  <View key={idx} style={ac.photoThumbWrapper}>
                    <Image source={typeof img === 'string' ? { uri: img } : img} style={ac.photoThumb} resizeMode="cover" />
                    {idx === 0 ? (
                      <View style={ac.mainTag}><Text style={{ color: '#fff', fontSize: 8.5, fontWeight: '900' }}>MAIN</Text></View>
                    ) : (
                      <TouchableOpacity onPress={() => makeCoverPhoto(idx)} style={ac.makeCoverPill}>
                        <Text style={{ color: '#fff', fontSize: 7.5, fontWeight: '800' }}>Set Main</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => removePhoto(idx)} style={ac.removePhotoIco}>
                      <MC name="close" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              <TouchableOpacity onPress={pickPhotos} activeOpacity={0.85} style={[ac.uploadBoxBtn, { flex: 1 }]}>
                <MC name="image-multiple-outline" size={20} color={C.brand} />
                <Text style={{ color: C.brand, fontSize: 12, fontWeight: '800', marginLeft: 6 }}>+ Add Photos (Unlimited)</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={takePhoto} activeOpacity={0.85} style={[ac.uploadBoxBtn, { flex: 0.9 }]}>
                <MC name="camera-outline" size={20} color={C.brand} />
                <Text style={{ color: C.brand, fontSize: 12, fontWeight: '800', marginLeft: 6 }}>Camera</Text>
              </TouchableOpacity>
            </View>

            {/* Product Video Upload Section */}
            <Text style={{ color: C.ink, fontSize: 13, fontWeight: '800', marginBottom: 6 }}>Product Video (Optional)</Text>
            {f.video ? (
              <View style={[ac.videoCard, shadow]}>
                <MC name="video-check" size={24} color={C.green} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ color: C.ink, fontWeight: '800', fontSize: 12.5 }}>Video Attached</Text>
                  <Text style={{ color: C.ink3, fontSize: 11, marginTop: 1 }}>Buyers can watch 360° product video</Text>
                </View>
                <TouchableOpacity onPress={() => setF((x) => ({ ...x, video: null }))} style={{ padding: 6 }}>
                  <MC name="trash-can-outline" size={20} color={C.red} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={pickVideo} activeOpacity={0.85} style={[ac.uploadBoxBtn, { marginBottom: 14, borderStyle: 'dashed' }]}>
                <MC name="video-plus-outline" size={22} color={C.brand} />
                <Text style={{ color: C.brand, fontSize: 12.5, fontWeight: '800', marginLeft: 8 }}>Upload Product Video</Text>
              </TouchableOpacity>
            )}

            <View style={{ height: 6 }} />
            <Field label="Description & Highlights" placeholder="Material, size details, origin and specifications…" multiline value={f.desc} onChangeText={(v) => setF({ ...f, desc: v })} style={{ height: 90, textAlignVertical: 'top' }} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Btn title="Cancel" tone="ghost" style={{ flex: 1 }} onPress={() => setAdd(false)} />
              <Btn title={saving ? "Publishing..." : "Publish Live"} tone="green" style={{ flex: 1 }} disabled={saving || !f.title || !f.price || (!f.images || f.images.length === 0)} onPress={save} />
            </View>
          </View>
        )}

        <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16, marginTop: 24, marginBottom: 12 }}>
          Active Listings ({mine.length})
        </Text>
        {mine.length === 0 ? (
          <View style={[ac.card, shadow, { padding: 24, alignItems: 'center' }]}>
            <MC name="package-variant" size={30} color={C.ink3} />
            <Text style={{ color: C.ink2, fontSize: 13, marginTop: 8, textAlign: 'center' }}>No active listings yet. Tap the button above to add your first product.</Text>
          </View>
        ) : (
          mine.map((p) => (
            <TouchableOpacity key={p.id} onPress={() => go('product', { id: p.id })} style={[ac.wishRow, shadow]}>
              <View style={{ width: 62 }}><Thumb img={p.img} title={p.title} tint={p.tint} size={62} /></View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text numberOfLines={2} style={{ color: C.ink, fontWeight: '700', fontSize: 13.5 }}>{p.title}</Text>
                <Text style={{ color: C.ink, fontWeight: '900', marginTop: 4 }}>{money(p.price)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  <Badge text="ACTIVE" tone="green" small />
                  {p.images && p.images.length > 1 && <Badge text={`${p.images.length} Photos`} tone="brand" small />}
                  {p.sizes && p.sizes.length > 0 && <Badge text={`${p.sizes.length} ${p.variantType === 'age' ? 'Ages' : 'Sizes'}`} tone="accent" small />}
                  {p.video && <Badge text="Video" tone="accent" small />}
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  dispatch({ type: 'RM_PRODUCT', id: p.id });
                  if (cloud.cloudOn()) cloud.removeProduct(p.id).catch(() => {});
                }}
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.redSoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: R.sm }}
              >
                <MC name="trash-can-outline" size={15} color={C.red} />
                <Text style={{ color: C.red, fontSize: 11.5, fontWeight: '800', marginLeft: 4 }}>Delete</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

/* ---------------- REAL HUMAN SUPPORT ---------------- */
export function Support({ go }) {
  const { state, dispatch } = useApp();
  const [t, setT] = useState('');
  
  const send = () => {
    if (!t.trim()) return;
    const userMsg = { id: 'm' + Date.now(), who: 'me', text: t.trim(), at: Date.now() };
    dispatch({ type: 'CHAT', msg: userMsg });
    setT('');
  };

  const openWhatsApp = () => {
    const url = `https://wa.me/919044468663?text=${encodeURIComponent('Hello Temsho Support! I need assistance with my account/order.')}`;
    Linking.openURL(url).catch(() => {});
  };

  const callSupport = () => {
    Linking.openURL('tel:9044468663').catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Real Human Support" go={go} />
      <View style={ac.agentBar}>
        <Avatar name="Temsho Support" hue={C.brand} size={44} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontWeight: '900', color: C.ink, fontSize: 14 }}>Temsho Dedicated Helpdesk</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.green }} />
            <Text style={{ color: C.green, fontSize: 11.5, fontWeight: '700', marginLeft: 5 }}>Online · 100% Real Humans</Text>
          </View>
        </View>
        <TouchableOpacity onPress={openWhatsApp} style={ac.callBtn}>
          <MC name="whatsapp" size={20} color={C.green} />
        </TouchableOpacity>
        <TouchableOpacity onPress={callSupport} style={[ac.callBtn, { marginLeft: 8 }]}>
          <MC name="phone" size={18} color={C.brand} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 20 }}>
        <View style={ac.notice}>
          <Text style={{ color: C.ink2, fontSize: 11.5, textAlign: 'center', lineHeight: 17 }}>
            No AI chatbots or simulated replies.{'\n'}Direct connection to genuine human executive via WhatsApp & Call.
          </Text>
        </View>

        {/* WhatsApp Instant Connect Card */}
        <TouchableOpacity onPress={openWhatsApp} activeOpacity={0.85} style={[ac.shareBanner, shadow, { marginBottom: 14, backgroundColor: '#ECFDF5' }]}>
          <MC name="whatsapp" size={26} color="#25D366" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: C.ink, fontWeight: '900', fontSize: 14 }}>Chat on WhatsApp (+91 9044468663)</Text>
            <Text style={{ color: C.ink3, fontSize: 11, marginTop: 2 }}>Instant response from real human support staff</Text>
          </View>
          <MC name="chevron-right" size={20} color={C.green} />
        </TouchableOpacity>

        {state.supportChat.map((m) => (
          <View key={m.id} style={{ alignItems: m.who === 'me' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
            {m.who === 'agent' && <Text style={{ color: C.ink3, fontSize: 10.5, marginBottom: 4, marginLeft: 6 }}>{m.agent}</Text>}
            <View style={[ac.bubble, m.who === 'me' ? ac.mine : ac.theirs]}>
              <Text style={{ color: m.who === 'me' ? '#fff' : C.ink, fontSize: 13.5, lineHeight: 20 }}>{m.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={ac.inputBar}>
        <TextInput
          value={t}
          onChangeText={setT}
          onSubmitEditing={send}
          placeholder="Type your message to support..."
          placeholderTextColor={C.ink3}
          style={{ flex: 1, fontSize: 14, color: C.ink, paddingVertical: 10, paddingHorizontal: 14, outlineStyle: 'none' }}
        />
        <TouchableOpacity onPress={send} style={ac.sendBtn}><MC name="send" size={17} color="#fff" /></TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------------- POLICY ---------------- */
export function Policy({ go }) {
  const items = [
    ['cellphone-check', 'Mobile Number Login Only', 'No Aadhaar, no PAN, no biometric checks. Fast, secure OTP verification.'],
    ['numeric-1-circle-outline', 'One Number = One Human', 'Strict prevention of duplicate accounts, automated bots, and bot farms.'],
    ['headset', 'Real Human Support', 'Zero AI chatbots on support. You always talk to a dedicated human representative.'],
    ['star-check-outline', 'Genuine Reviews Only', 'Reviews can only be posted after confirmed deliveries. Paid or fake reviews are strictly banned.'],
    ['cancel', 'No Dark Patterns', 'No artificial urgency timers or manipulated viewer counts. Complete pricing transparency.'],
    ['database-lock-outline', 'India Data Residency', 'User data is securely processed in India and never sold to third-party brokers.'],
  ];
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Human-Only Policy" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={[ac.card, shadow, { padding: 20 }]}>
          <View style={ac.bigIco}><MC name="account-check-outline" size={26} color={C.brand} /></View>
          <Text style={{ fontSize: 20, fontWeight: '900', color: C.ink, marginTop: 12 }}>No Bots. Only Humans.</Text>
          <Text style={{ color: C.ink2, fontSize: 13.5, lineHeight: 21, marginTop: 8 }}>
            Temsho is designed as an open, authentic marketplace where buyers, sellers, and support staff are 100% genuine humans.
          </Text>
        </View>
        {items.map(([e, t, d]) => (
          <View key={t} style={[ac.card, shadow, { padding: 16, marginTop: 12, flexDirection: 'row' }]}>
            <MC name={e} size={22} color={C.brand} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ fontWeight: '800', color: C.ink, fontSize: 14 }}>{t}</Text>
              <Text style={{ color: C.ink2, fontSize: 12.5, lineHeight: 19, marginTop: 4 }}>{d}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/* ---------------- PRIVACY POLICY ---------------- */
export function PrivacyPolicyScreen({ go }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Privacy Policy & Terms" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={[ac.card, shadow, { padding: 18 }]}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: C.ink }}>Temsho Privacy Policy</Text>
          <Text style={{ color: C.ink3, fontSize: 11, marginTop: 4 }}>Digital Personal Data Protection Act (DPDP) 2023 Compliant</Text>

          <Text style={ac.policySec}>1. Information We Collect</Text>
          <Text style={ac.policyTxt}>• Mobile number (for OTP authentication)</Text>
          <Text style={ac.policyTxt}>• Delivery address (for shipping and logistics)</Text>
          <Text style={ac.policyTxt}>• Shop name and payout UPI ID (for sellers)</Text>
          <Text style={ac.policyTxt}>• We do NOT collect Aadhaar, PAN, or sensitive biometric data.</Text>

          <Text style={ac.policySec}>2. How We Use Information</Text>
          <Text style={ac.policyTxt}>• To process orders, coordinate delivery, and provide customer support.</Text>
          <Text style={ac.policyTxt}>• We never sell or lease user information to third-party advertising networks.</Text>

          <Text style={ac.policySec}>3. Payment Security</Text>
          <Text style={ac.policyTxt}>• Payments flow directly from buyer to seller via UPI / COD.</Text>
          <Text style={ac.policyTxt}>• Temsho does not store credit card PINs or banking credentials.</Text>

          <Text style={ac.policySec}>4. Right to Erasure & Deletion</Text>
          <Text style={ac.policyTxt}>• Users can permanently delete their account and associated data anytime in App Settings.</Text>

          <Text style={ac.policySec}>5. Grievance Officer</Text>
          <Text style={ac.policyTxt}>• Support Desk, Temsho Technologies India</Text>
          <Text style={ac.policyTxt}>• WhatsApp: +91 9044468663 · Email: support@temsho.in</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const ac = StyleSheet.create({
  headerWrap: {
    backgroundColor: C.brand,
    paddingTop: 46,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: R.lg,
    padding: 16,
    marginTop: 14,
  },
  av: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: C.surface, borderRadius: R.lg, overflow: 'hidden' },
  ownerCta: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: R.lg, padding: 16, marginTop: 14 },
  ownerPayCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5',
    borderRadius: R.lg, padding: 14, marginTop: 8, borderWidth: 1.5, borderColor: '#A7F3D0',
  },
  crownSmall: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center' },
  crown: { width: 44, height: 44, borderRadius: 13, backgroundColor: '#ffffff1f', alignItems: 'center', justifyContent: 'center' },
  gear: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ffffff2a', alignItems: 'center', justifyContent: 'center' },
  shareBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', borderRadius: R.lg, padding: 14, borderWidth: 1, borderColor: '#A7F3D0' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: C.line },
  sellCta: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.brand, borderRadius: R.lg, padding: 16, marginTop: 12 },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: R.lg,
    padding: 14,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
  },
  payoutIco: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  editBtnSmall: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: R.sm,
  },
  wishRow: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: R.lg, padding: 12, marginBottom: 12 },
  mini: { borderWidth: 1, borderColor: C.line, borderRadius: R.sm, paddingHorizontal: 10, paddingVertical: 6 },
  step: { color: C.ink3, fontSize: 11.5, fontWeight: '900', letterSpacing: 0.8, marginTop: 22, marginBottom: 8, marginLeft: 4 },
  freeNote: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.greenSoft, borderRadius: R.md, padding: 13, marginTop: 14 },
  payOpt: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: C.line, borderRadius: R.md, padding: 13 },
  payOn: { borderColor: C.green, backgroundColor: C.greenSoft },
  numBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.greenSoft, borderRadius: R.md, padding: 12, marginBottom: 16 },
  shopCard: { backgroundColor: C.surface, borderRadius: R.lg, padding: 16 },
  payoutBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5',
    borderRadius: R.md, padding: 12, marginTop: 12, borderWidth: 1, borderColor: '#A7F3D0',
  },
  chip: { borderWidth: 1, borderColor: C.line, borderRadius: R.pill, paddingHorizontal: 13, paddingVertical: 7, marginRight: 8 },
  photoBox: {
    height: 150, borderRadius: R.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#C7D2FE',
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  photoThumbWrapper: { width: 74, height: 74, borderRadius: R.md, marginRight: 8, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: C.line },
  photoThumb: { width: '100%', height: '100%' },
  mainTag: { position: 'absolute', bottom: 2, left: 2, backgroundColor: C.brand, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3 },
  makeCoverPill: { position: 'absolute', bottom: 2, right: 2, backgroundColor: 'rgba(15,23,42,0.85)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3 },
  removePhotoIco: { position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.65)', width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  variantTabRow: { flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: R.md, padding: 3, marginBottom: 10 },
  variantTabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', justifyContent: 'center', borderRadius: R.sm },
  variantTabBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  variantTabLabel: { fontSize: 11, fontWeight: '700', color: C.ink3 },
  variantTabLabelActive: { color: C.brand, fontWeight: '900' },
  pillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  pillItem: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: R.sm, borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff' },
  pillItemActive: { backgroundColor: C.brand, borderColor: C.brand },
  pillText: { fontSize: 12, fontWeight: '700', color: C.ink },
  pillTextActive: { color: '#fff', fontWeight: '900' },
  uploadBoxBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.brandSoft, borderWidth: 1.5, borderColor: C.brand,
    borderRadius: R.md, paddingVertical: 12, paddingHorizontal: 10,
  },
  videoCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.greenSoft,
    borderRadius: R.md, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#86EFAC',
  },
  sellIco: { width: 44, height: 44, borderRadius: 13, backgroundColor: '#ffffff2a', alignItems: 'center', justifyContent: 'center' },
  bigIco: { width: 52, height: 52, borderRadius: 16, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' },
  agentBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, padding: 14, borderBottomWidth: 1, borderBottomColor: C.line },
  callBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
  notice: { backgroundColor: C.brandSoft, borderRadius: R.md, padding: 12, marginBottom: 16 },
  bubble: { maxWidth: '82%', borderRadius: R.lg, paddingHorizontal: 14, paddingVertical: 11 },
  mine: { backgroundColor: C.brand, borderBottomRightRadius: 4 },
  theirs: { backgroundColor: C.surface, borderBottomLeftRadius: 4 },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderTopWidth: 1,
    borderTopColor: C.line, padding: 10, paddingBottom: 18,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  policySec: { fontWeight: '900', color: C.ink, fontSize: 13.5, marginTop: 14, marginBottom: 4 },
  policyTxt: { color: C.ink2, fontSize: 12.5, lineHeight: 19, marginBottom: 2 },
});
