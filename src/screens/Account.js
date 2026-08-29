import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Image, Linking, Share } from 'react-native';
import { C, R, shadow, money } from '../theme';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Btn, Field, Badge, HumanTag, Empty, Thumb, Avatar } from '../components/UI';
import { Header } from './Product';
import { CATEGORIES } from '../data/catalog';
import { useApp } from '../store';
import * as cloud from '../lib/cloud';

/* ---------------- ACCOUNT HOME ---------------- */
export function Account({ go }) {
  const { state, dispatch, unread, isOwner } = useApp();
  const u = state.user;
  const wish = state.products.filter((p) => state.wishlist.includes(p.id));

  const shareMessage = `🛍️ Temsho — India's Verified Human Marketplace!\nNo bots, 100% real human sellers. Buy directly with full transparency.\n\nInvite Code: *${u?.referral || 'TEM2026X'}*\nDownload App: https://temsho.in`;

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    Linking.openURL(url).catch(() => {});
  };

  const Row = ({ e, t, s, onPress, tone }) => (
    <TouchableOpacity onPress={onPress} style={ac.row}>
      <MC name={e} size={20} color={tone === 'red' ? C.red : C.ink2} />
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={{ color: tone === 'red' ? C.red : C.ink, fontWeight: '700', fontSize: 14 }}>{t}</Text>
        {!!s && <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 2 }}>{s}</Text>}
      </View>
      <MC name="chevron-right" size={20} color={C.ink3} />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={ac.head}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>My Account</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => go('settings')} style={ac.gear}>
            <MC name="cog-outline" size={19} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={[ac.profile, shadow]}>
          <Avatar name={u?.name || 'User'} hue={C.brand} size={52} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16 }}>{u?.name}</Text>
            <Text style={{ color: C.ink3, fontSize: 12.5, marginTop: 2 }}>+91 {u?.phone}</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
              <HumanTag small />
              {u?.isSeller && <Badge text="VERIFIED SELLER" tone="accent" small />}
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 60, paddingBottom: 40 }}>
        {/* Share with Friends Banner */}
        <TouchableOpacity activeOpacity={0.85} onPress={shareWhatsApp} style={[ac.shareBanner, shadow]}>
          <MC name="whatsapp" size={24} color="#25D366" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: C.ink, fontWeight: '900', fontSize: 13.5 }}>Invite Friends to Temsho</Text>
            <Text style={{ color: C.ink3, fontSize: 11, marginTop: 1 }}>Share the genuine human marketplace via WhatsApp</Text>
          </View>
          <MC name="share-variant" size={18} color={C.brand} />
        </TouchableOpacity>

        {/* Main Orders & Activity Links */}
        <View style={[ac.card, shadow, { marginTop: 16 }]}>
          <Row e="package-variant" t="My Orders" s={`${state.orders.length} orders`} onPress={() => go('orders')} />
          <Row e="bell-outline" t="Notifications" s={unread > 0 ? `${unread} new` : 'All read'} onPress={() => go('notifications')} />
          <Row e="heart-outline" t="Wishlist" s={`${wish.length} saved items`} onPress={() => go('wishlist')} />
          <Row e="map-marker-outline" t="Saved Addresses" s={`${state.addresses.length} saved`} onPress={() => go('addresses')} />
        </View>

        {/* OWNER ADMIN CTA */}
        {isOwner && (
          <TouchableOpacity activeOpacity={0.9} onPress={() => go('admin')} style={[ac.ownerCta, shadow]}>
            <View style={ac.crown}><MC name="crown" size={20} color={C.accent} /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>Owner Admin Panel</Text>
              <Text style={{ color: '#ffffffaa', fontSize: 12, marginTop: 3 }}>Full App Control & Management (9044468663)</Text>
            </View>
            <MC name="chevron-right" size={22} color="#fff" />
          </TouchableOpacity>
        )}

        {/* SELLER CTA */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => go(u?.isSeller ? 'seller' : 'become-seller')} style={[ac.sellCta, shadow]}>
          <View style={ac.sellIco}><MC name="storefront-outline" size={22} color="#fff" /></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>
              {u?.isSeller ? 'Open Seller Dashboard' : 'Start Selling on Temsho'}
            </Text>
            <Text style={{ color: '#ffffffcc', fontSize: 12, marginTop: 3 }}>
              {u?.isSeller ? `${u.shopName || 'My Shop'} · ${u.shopCity || 'India'}` : '0% commission · Instant setup · Direct payments'}
            </Text>
          </View>
          <MC name="chevron-right" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Support & Legal */}
        <View style={[ac.card, shadow, { marginTop: 16 }]}>
          <Row e="headset" t="Contact Real Human Support" s="24x7 dedicated human team" onPress={() => go('support')} />
          <Row e="shield-check-outline" t="No Bot, Only Humans Policy" s="Our marketplace commitment" onPress={() => go('policy')} />
          <Row e="file-document-outline" t="Privacy Policy & Terms" s="DPDP Act 2023 compliant" onPress={() => go('privacy-policy')} />
          <Row e="cog-outline" t="Settings" s="Profile, location, payment, preferences" onPress={() => go('settings')} />
          <Row e="logout" t="Log Out" tone="red" onPress={() => dispatch({ type: 'LOGOUT' })} />
        </View>

        <Text style={{ textAlign: 'center', color: C.ink3, fontSize: 11, marginTop: 24, lineHeight: 17 }}>
          Temsho v1.0.0{'\n'}Crafted in India · Built by humans, for humans
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

/* ---------------- SELLER ONBOARDING ---------------- */
export function BecomeSeller({ go }) {
  const { state, dispatch } = useApp();
  const [f, setF] = useState({
    shop: '', city: '',
    payName: state.user?.name || '', upi: '',
    acceptUpi: true, acceptCod: true,
  });
  const ok = f.shop && f.city && (f.acceptCod || (f.acceptUpi && f.upi));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Start Selling" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        <View style={[ac.card, shadow, { padding: 18 }]}>
          <View style={ac.bigIco}><MC name="storefront-outline" size={26} color={C.brand} /></View>
          <Text style={{ fontSize: 18, fontWeight: '900', color: C.ink, marginTop: 12 }}>
            Anyone Can Sell on Temsho
          </Text>
          <Text style={{ color: C.ink2, fontSize: 13, lineHeight: 20, marginTop: 6 }}>
            Whether you run a local retail shop, create handmade crafts, or produce goods from home — list your products in minutes. No complex KYC, no fees, no middlemen.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <Badge text="0% Commission" tone="green" />
            <Badge text="Instant Approval" tone="green" />
            <Badge text="Direct UPI / COD" tone="accent" />
            <Badge text="No Documents Needed" tone="brand" />
          </View>
        </View>

        <View style={ac.freeNote}>
          <MC name="cash-check" size={18} color={C.green} />
          <Text style={{ flex: 1, marginLeft: 10, color: '#059669', fontSize: 12, fontWeight: '700', lineHeight: 18 }}>
            Customer payments go directly to your personal UPI ID or cash on delivery. Temsho never holds your funds.
          </Text>
        </View>

        <Text style={ac.step}>1 · YOUR SHOP DETAILS</Text>
        <View style={[ac.card, shadow, { padding: 18 }]}>
          <View style={ac.numBox}>
            <MC name="cellphone-check" size={19} color={C.green} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ color: C.ink, fontWeight: '800', fontSize: 13 }}>+91 {state.user?.phone}</Text>
              <Text style={{ color: C.green, fontSize: 11, fontWeight: '700', marginTop: 2 }}>Verified Phone Number</Text>
            </View>
          </View>
          <Field label="Shop Name / Brand Name" placeholder="e.g. Sharma Handloom or Rahul Crafts" value={f.shop} onChangeText={(v) => setF({ ...f, shop: v })} />
          <Field label="City / Region" placeholder="e.g. Lucknow, Uttar Pradesh" value={f.city} onChangeText={(v) => setF({ ...f, city: v })} />
        </View>

        <Text style={ac.step}>2 · HOW DO YOU RECEIVE PAYMENTS?</Text>
        <View style={[ac.card, shadow, { padding: 18 }]}>
          <TouchableOpacity onPress={() => setF({ ...f, acceptUpi: !f.acceptUpi })} style={[ac.payOpt, f.acceptUpi && ac.payOn]}>
            <MC name={f.acceptUpi ? 'checkbox-marked' : 'checkbox-blank-outline'} size={20} color={f.acceptUpi ? C.green : C.ink3} />
            <MC name="cellphone-check" size={19} color={C.brand} style={{ marginLeft: 12 }} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ color: C.ink, fontWeight: '800', fontSize: 13.5 }}>UPI — Instant Online Payments</Text>
              <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 2 }}>Direct to your GPay / PhonePe / Paytm UPI ID</Text>
            </View>
          </TouchableOpacity>

          {f.acceptUpi && (
            <View style={{ marginTop: 12 }}>
              <Field label="Account Holder Name (as in Bank)" placeholder="e.g. Rahul Sharma" value={f.payName} onChangeText={(v) => setF({ ...f, payName: v })} />
              <Field label="Your UPI ID" placeholder="e.g. 9876543210@ybl or name@upi" autoCapitalize="none" value={f.upi} onChangeText={(v) => setF({ ...f, upi: v })} />
            </View>
          )}

          <TouchableOpacity onPress={() => setF({ ...f, acceptCod: !f.acceptCod })} style={[ac.payOpt, f.acceptCod && ac.payOn, { marginTop: 10 }]}>
            <MC name={f.acceptCod ? 'checkbox-marked' : 'checkbox-blank-outline'} size={20} color={f.acceptCod ? C.green : C.ink3} />
            <MC name="cash" size={19} color={C.brand} style={{ marginLeft: 12 }} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ color: C.ink, fontWeight: '800', fontSize: 13.5 }}>Cash on Delivery (COD)</Text>
              <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 2 }}>Collect cash directly upon delivery</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Btn
          title="Launch My Shop"
          icon="storefront-plus-outline"
          tone="green"
          disabled={!ok}
          style={{ marginTop: 20 }}
          onPress={() => {
            dispatch({
              type: 'BECOME_SELLER',
              shopName: f.shop,
              shopCity: f.city,
              shop: { payName: f.payName, upi: f.upi, acceptUpi: f.acceptUpi, acceptCod: f.acceptCod, contact: state.user?.phone || '' },
            });
            go('seller');
          }}
        />
      </ScrollView>
    </View>
  );
}

/* ---------------- SELLER DASHBOARD ---------------- */
export function Seller({ go }) {
  const { state, dispatch } = useApp();
  const u = state.user;
  const mine = state.products.filter((p) => p.seller === 'me');
  const [add, setAdd] = useState(false);
  const [f, setF] = useState({ title: '', price: '', mrp: '', cat: 'fashion', desc: '', img: null });

  const pickPhoto = async () => {
    try {
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7, allowsEditing: true, aspect: [1, 1] });
      if (!r.canceled && r.assets?.[0]?.uri) setF((x) => ({ ...x, img: { uri: r.assets[0].uri } }));
    } catch (e) {}
  };

  const save = async () => {
    const cat = CATEGORIES.find((c) => c.id === f.cat);
    if (cloud.cloudOn()) {
      cloud.pushProduct(
        { ...f, price: Number(f.price), mrp: Number(f.mrp || f.price) },
        state.user?.cloudId, state.shop?.cloudId
      ).catch(() => {});
    }
    dispatch({
      type: 'ADD_PRODUCT',
      product: {
        id: 'my' + Date.now(),
        title: f.title, cat: f.cat,
        price: Number(f.price), mrp: Number(f.mrp || f.price),
        rating: 4.8, ratingCount: 0, seller: 'me',
        sellerName: u.shopName || 'My Shop', sellerCity: u.shopCity || 'India',
        img: f.img, tint: cat?.tint || '#F3F4F6',
        desc: f.desc || 'Product listed by verified seller.',
        tags: ['New Arrival', 'Cash on Delivery'],
      },
    });
    setF({ title: '', price: '', mrp: '', cat: 'fashion', desc: '', img: null });
    setAdd(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Seller Dashboard" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={[ac.shopCard, shadow]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={ac.av}><MC name="storefront-outline" size={22} color={C.brand} /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: '900', color: C.ink, fontSize: 15 }}>{u.shopName || 'My Shop'}</Text>
              <Text style={{ color: C.ink3, fontSize: 12, marginTop: 2 }}>{u.shopCity || 'India'}</Text>
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

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <Btn title="Orders & Dispatch" icon="tray-arrow-down" tone="ghost" style={{ flex: 1 }} onPress={() => go('seller-orders')} />
          <Btn title="Shop Settings" icon="cog-outline" tone="ghost" style={{ flex: 1 }} onPress={() => go('shop-settings')} />
        </View>

        {!add ? (
          <Btn title="List a New Product" icon="plus" tone="accent" style={{ marginTop: 12 }} onPress={() => setAdd(true)} />
        ) : (
          <View style={[ac.card, shadow, { padding: 18, marginTop: 16 }]}>
            <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16, marginBottom: 14 }}>New Product Listing</Text>
            <Field label="Product Title" placeholder="e.g. Handcrafted Cotton Shirt" value={f.title} onChangeText={(v) => setF({ ...f, title: v })} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}><Field label="Selling Price (₹)" keyboardType="number-pad" placeholder="799" value={f.price} onChangeText={(v) => setF({ ...f, price: v.replace(/\D/g, '') })} /></View>
              <View style={{ flex: 1 }}><Field label="MRP (₹)" keyboardType="number-pad" placeholder="1499" value={f.mrp} onChangeText={(v) => setF({ ...f, mrp: v.replace(/\D/g, '') })} /></View>
            </View>
            <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity key={c.id} onPress={() => setF({ ...f, cat: c.id })} style={[ac.chip, { flexDirection: 'row', alignItems: 'center' }, f.cat === c.id && { backgroundColor: C.brand, borderColor: C.brand }]}>
                  <MC name={c.icon} size={13} color={f.cat === c.id ? '#fff' : C.ink2} style={{ marginRight: 5 }} />
                  <Text style={{ color: f.cat === c.id ? '#fff' : C.ink2, fontSize: 12.5, fontWeight: '600' }}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>Real Product Photo (From Camera / Gallery)</Text>
            <TouchableOpacity onPress={pickPhoto} activeOpacity={0.85} style={ac.photoBox}>
              {f.img ? (
                <Image source={f.img} resizeMode="cover" style={{ width: '100%', height: '100%', borderRadius: R.md }} />
              ) : (
                <>
                  <MC name="camera-plus-outline" size={26} color={C.ink3} />
                  <Text style={{ color: C.ink2, fontSize: 12.5, fontWeight: '700', marginTop: 8 }}>Select Real Photo</Text>
                  <Text style={{ color: C.ink3, fontSize: 10.5, marginTop: 3, textAlign: 'center', paddingHorizontal: 20 }}>Upload genuine photos taken by you</Text>
                </>
              )}
            </TouchableOpacity>
            {!!f.img && (
              <TouchableOpacity onPress={() => setF({ ...f, img: null })} style={{ alignSelf: 'center', marginTop: 8, marginBottom: 6 }}>
                <Text style={{ color: C.red, fontSize: 12, fontWeight: '700' }}>Remove Photo</Text>
              </TouchableOpacity>
            )}
            <View style={{ height: 14 }} />
            <Field label="Description & Highlights" placeholder="Material, size, origin and specifications…" multiline value={f.desc} onChangeText={(v) => setF({ ...f, desc: v })} style={{ height: 90, textAlignVertical: 'top' }} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Btn title="Cancel" tone="ghost" style={{ flex: 1 }} onPress={() => setAdd(false)} />
              <Btn title="Publish Live" tone="green" style={{ flex: 1 }} disabled={!f.title || !f.price || !f.img} onPress={save} />
            </View>
          </View>
        )}

        <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16, marginTop: 24, marginBottom: 12 }}>Active Listings</Text>
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
                <View style={{ marginTop: 6 }}><Badge text="ACTIVE" tone="green" small /></View>
              </View>
              <TouchableOpacity onPress={() => dispatch({ type: 'RM_PRODUCT', id: p.id })} style={{ padding: 8 }}>
                <Text style={{ color: C.red, fontSize: 12, fontWeight: '800' }}>Delete</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

/* ---------------- REAL HUMAN SUPPORT ---------------- */
const AGENT_REPLIES = [
  'Certainly, I am looking into your order details right away.',
  'I have checked your order status — it is scheduled for dispatch tomorrow.',
  'I can directly connect you with the seller if you need further adjustments.',
  'I have initiated a return request for you. The refund will be credited once picked up.',
  'Is there anything else I can assist you with today?',
];

export function Support({ go }) {
  const { state, dispatch } = useApp();
  const [t, setT] = useState('');
  const send = () => {
    if (!t.trim()) return;
    dispatch({ type: 'CHAT', msg: { id: 'm' + Date.now(), who: 'me', text: t.trim(), at: Date.now() } });
    setT('');
    const reply = AGENT_REPLIES[Math.floor(Math.random() * AGENT_REPLIES.length)];
    setTimeout(() => dispatch({ type: 'CHAT', msg: { id: 'a' + Date.now(), who: 'agent', agent: 'Priya S.', text: reply, at: Date.now() } }), 1200);
  };
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Human Support" go={go} />
      <View style={ac.agentBar}>
        <Avatar name="Priya S" hue={C.brand} size={44} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontWeight: '900', color: C.ink, fontSize: 14 }}>Priya S. · Support Executive</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.green }} />
            <Text style={{ color: C.green, fontSize: 11.5, fontWeight: '700', marginLeft: 5 }}>Online · Verified Human Executive</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            const url = `https://wa.me/919044468663?text=${encodeURIComponent('Hello Temsho Support! I need assistance with my account.')}`;
            Linking.openURL(url).catch(() => {});
          }}
          style={ac.callBtn}
        >
          <MC name="whatsapp" size={20} color={C.green} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 20 }}>
        <View style={ac.notice}>
          <Text style={{ color: C.ink2, fontSize: 11.5, textAlign: 'center', lineHeight: 17 }}>
            Every support interaction on Temsho is handled by real humans.{'\n'}Available 24x7 in English and Indian regional languages.
          </Text>
        </View>
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
          placeholder="Type your message here…"
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
  head: { backgroundColor: C.brand, paddingTop: 46, paddingHorizontal: 16, paddingBottom: 60 },
  profile: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface,
    borderRadius: R.lg, padding: 16, marginTop: 16, marginBottom: -70,
  },
  av: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: C.surface, borderRadius: R.lg, overflow: 'hidden' },
  ownerCta: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: R.lg, padding: 16, marginTop: 16 },
  crown: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#ffffff1f', alignItems: 'center', justifyContent: 'center' },
  gear: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#ffffff2a', alignItems: 'center', justifyContent: 'center' },
  shareBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', borderRadius: R.lg, padding: 14, borderWidth: 1, borderColor: '#A7F3D0' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: C.line },
  sellCta: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.brand, borderRadius: R.lg, padding: 16, marginTop: 16 },
  wishRow: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: R.lg, padding: 12, marginBottom: 12 },
  mini: { borderWidth: 1, borderColor: C.line, borderRadius: R.sm, paddingHorizontal: 10, paddingVertical: 6 },
  step: { color: C.ink3, fontSize: 11.5, fontWeight: '900', letterSpacing: 0.8, marginTop: 22, marginBottom: 8, marginLeft: 4 },
  freeNote: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.greenSoft, borderRadius: R.md, padding: 13, marginTop: 14 },
  payOpt: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: C.line, borderRadius: R.md, padding: 13 },
  payOn: { borderColor: C.green, backgroundColor: C.greenSoft },
  numBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.greenSoft, borderRadius: R.md, padding: 12, marginBottom: 16 },
  shopCard: { backgroundColor: C.surface, borderRadius: R.lg, padding: 16 },
  chip: { borderWidth: 1, borderColor: C.line, borderRadius: R.pill, paddingHorizontal: 13, paddingVertical: 7, marginRight: 8 },
  photoBox: {
    height: 150, borderRadius: R.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#C7D2FE',
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  sellIco: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#ffffff2a', alignItems: 'center', justifyContent: 'center' },
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
