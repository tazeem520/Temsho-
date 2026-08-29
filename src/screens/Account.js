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

/* ---------------- Account ---------------- */
export function Account({ go }) {
  const { state, dispatch, unread, isOwner } = useApp();
  const u = state.user;
  const wish = state.products.filter((p) => state.wishlist.includes(p.id));

  const shareMessage = `🛍️ Temsho — Poore Bharat ka apna bazaar!\nNo bot, only humans! Har order par seedha seller se khareedo.\n\nInvite code: *${u?.referral || 'TEM2026X'}*\nDownload karo: https://temsho.in`;

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
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Mera Account</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => go('settings')} style={ac.gear}>
            <MC name="cog-outline" size={19} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={[ac.profile, shadow]}>
          <Avatar name={u?.name || 'A'} hue={C.brand} size={52} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16 }}>{u?.name}</Text>
            <Text style={{ color: C.ink3, fontSize: 12.5, marginTop: 2 }}>+91 {u?.phone}</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
              <HumanTag small />
              {u?.isSeller && <Badge text="SELLER" tone="accent" small />}
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 60, paddingBottom: 40 }}>
        {/* Wallet & Referral */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => go('wallet')} style={[ac.walletStrip, shadow]}>
          <View style={ac.walIco}><MC name="wallet-outline" size={19} color={C.accent} /></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: C.ink3, fontSize: 11, fontWeight: '700' }}>TEMSHO WALLET</Text>
            <Text style={{ color: C.ink, fontSize: 18, fontWeight: '900', marginTop: 1 }}>{money(state.wallet)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: C.brand, fontSize: 11.5, fontWeight: '800' }}>Refer karein</Text>
            <Text style={{ color: C.ink3, fontSize: 10.5, marginTop: 2 }}>₹100 payein</Text>
          </View>
        </TouchableOpacity>

        {/* Share Banner */}
        <TouchableOpacity activeOpacity={0.85} onPress={shareWhatsApp} style={[ac.shareBanner, shadow]}>
          <MC name="whatsapp" size={24} color="#25D366" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: C.ink, fontWeight: '900', fontSize: 13.5 }}>Doston ko Temsho bhejein</Text>
            <Text style={{ color: C.ink3, fontSize: 11, marginTop: 1 }}>WhatsApp par 1-tap me share karein</Text>
          </View>
          <MC name="share-variant" size={18} color={C.brand} />
        </TouchableOpacity>

        {/* Main Links */}
        <View style={[ac.card, shadow, { marginTop: 16 }]}>
          <Row e="package-variant" t="Mere orders" s={`${state.orders.length} orders`} onPress={() => go('orders')} />
          <Row e="bell-outline" t="Notifications" s={unread > 0 ? `${unread} naye` : 'Sab padh liye'} onPress={() => go('notifications')} />
          <Row e="heart-outline" t="Wishlist" s={`${wish.length} saved items`} onPress={() => go('wishlist')} />
          <Row e="map-marker-outline" t="Mere addresses" s={`${state.addresses.length} saved`} onPress={() => go('addresses')} />
        </View>

        {/* OWNER ADMIN CTA */}
        {isOwner && (
          <TouchableOpacity activeOpacity={0.9} onPress={() => go('admin')} style={[ac.ownerCta, shadow]}>
            <View style={ac.crown}><MC name="crown" size={20} color={C.accent} /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>Admin Panel</Text>
              <Text style={{ color: '#ffffffaa', fontSize: 12, marginTop: 3 }}>App control (9044468663)</Text>
            </View>
            <MC name="chevron-right" size={22} color="#fff" />
          </TouchableOpacity>
        )}

        {/* SELLER CTA */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => go(u?.isSeller ? 'seller' : 'become-seller')} style={[ac.sellCta, shadow]}>
          <View style={ac.sellIco}><MC name="storefront-outline" size={22} color="#fff" /></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>
              {u?.isSeller ? 'Seller Dashboard kholein' : 'Temsho par bechna shuru karein'}
            </Text>
            <Text style={{ color: '#ffffffcc', fontSize: 12, marginTop: 3 }}>
              {u?.isSeller ? `${u.shopName || 'Meri Dukaan'} · ${u.shopCity || 'India'}` : '0% commission · koi document/approval nahi'}
            </Text>
          </View>
          <MC name="chevron-right" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Support & Legal */}
        <View style={[ac.card, shadow, { marginTop: 16 }]}>
          <Row e="headset" t="Insaan se baat karein" s="24x7 real support, koi bot nahi" onPress={() => go('support')} />
          <Row e="shield-check-outline" t="No Bot, Only Humans Policy" s="Hamara insaani vachan" onPress={() => go('policy')} />
          <Row e="file-document-outline" t="Privacy Policy & Terms" s="DPDP Act 2023 compliant" onPress={() => go('privacy-policy')} />
          <Row e="cog-outline" t="Settings" s="Naam, location, bhasha, payment, dukaan" onPress={() => go('settings')} />
          <Row e="logout" t="Log out" tone="red" onPress={() => dispatch({ type: 'LOGOUT' })} />
        </View>

        <Text style={{ textAlign: 'center', color: C.ink3, fontSize: 11, marginTop: 24, lineHeight: 17 }}>
          Temsho v1.0.0{'\n'}Made in India · By humans, for humans
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
        <Empty icon="heart-outline" title="Wishlist khali hai" sub="Product page par dil ka nishan dabakar yahan save karein.">
          <Btn title="Products dekhein" onPress={() => go('category', { cat: null })} />
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
                    <Text style={{ color: C.brand, fontWeight: '800', fontSize: 12 }}>Cart me daalein</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => dispatch({ type: 'WISH', id: p.id })} style={ac.mini}>
                    <Text style={{ color: C.red, fontWeight: '800', fontSize: 12 }}>Hatayein</Text>
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

/* ---------------- Seller onboarding ---------------- */
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
      <Header title="Bechna shuru karein" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        <View style={[ac.card, shadow, { padding: 18 }]}>
          <View style={ac.bigIco}><MC name="storefront-outline" size={26} color={C.brand} /></View>
          <Text style={{ fontSize: 18, fontWeight: '900', color: C.ink, marginTop: 12 }}>
            Koi bhi bech sakta hai
          </Text>
          <Text style={{ color: C.ink2, fontSize: 13, lineHeight: 20, marginTop: 6 }}>
            Dukaan ho ya na ho — ghar ka bana saman, purana samaan, kheti ka maal, handmade cheezein,
            kuch bhi bech sakte hain. Na koi approval, na koi document, na koi fees.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <Badge text="Koi approval nahi" tone="green" />
            <Badge text="0% commission" tone="green" />
            <Badge text="No documents" tone="brand" />
            <Badge text="Paisa seedha aapko" tone="accent" />
          </View>
        </View>

        <View style={ac.freeNote}>
          <MC name="cash-check" size={18} color={C.green} />
          <Text style={{ flex: 1, marginLeft: 10, color: '#0F7A4A', fontSize: 12, fontWeight: '700', lineHeight: 18 }}>
            Grahak ka paisa SEEDHA aapke UPI ya haath me aayega. Temsho beech me paisa nahi rakhta,
            isliye koi kaatna-katauti nahi.
          </Text>
        </View>

        <Text style={ac.step}>1 · AAPKI DUKAAN</Text>
        <View style={[ac.card, shadow, { padding: 18 }]}>
          <View style={ac.numBox}>
            <MC name="cellphone-check" size={19} color={C.green} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ color: C.ink, fontWeight: '800', fontSize: 13 }}>+91 {state.user?.phone}</Text>
              <Text style={{ color: C.green, fontSize: 11, fontWeight: '700', marginTop: 2 }}>OTP se verified</Text>
            </View>
          </View>
          <Field label="Dukaan / aapka naam" placeholder="Jaise: Sharma Handloom ya Ramesh Kumar" value={f.shop} onChangeText={(v) => setF({ ...f, shop: v })} />
          <Field label="Sheher / gaon" placeholder="Lucknow, Uttar Pradesh" value={f.city} onChangeText={(v) => setF({ ...f, city: v })} />
        </View>

        <Text style={ac.step}>2 · PAISA KAISE LENGE?</Text>
        <View style={[ac.card, shadow, { padding: 18 }]}>
          <TouchableOpacity onPress={() => setF({ ...f, acceptUpi: !f.acceptUpi })} style={[ac.payOpt, f.acceptUpi && ac.payOn]}>
            <MC name={f.acceptUpi ? 'checkbox-marked' : 'checkbox-blank-outline'} size={20} color={f.acceptUpi ? C.green : C.ink3} />
            <MC name="cellphone-check" size={19} color={C.brand} style={{ marginLeft: 12 }} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ color: C.ink, fontWeight: '800', fontSize: 13.5 }}>UPI — online paisa</Text>
              <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 2 }}>GPay / PhonePe / Paytm par seedha aayega</Text>
            </View>
          </TouchableOpacity>

          {f.acceptUpi && (
            <View style={{ marginTop: 12 }}>
              <Field label="Aapka naam (jaise bank me hai)" placeholder="Ramesh Kumar" value={f.payName} onChangeText={(v) => setF({ ...f, payName: v })} />
              <Field label="Aapki UPI ID" placeholder="9876543210@ybl ya naam@upi" autoCapitalize="none" value={f.upi} onChangeText={(v) => setF({ ...f, upi: v })} />
              <Text style={{ color: C.ink3, fontSize: 11, marginTop: -6, marginBottom: 8, lineHeight: 16 }}>
                UPI ID apne GPay/PhonePe app me "My UPI ID" me mil jayegi.
              </Text>
            </View>
          )}

          <TouchableOpacity onPress={() => setF({ ...f, acceptCod: !f.acceptCod })} style={[ac.payOpt, f.acceptCod && ac.payOn, { marginTop: 10 }]}>
            <MC name={f.acceptCod ? 'checkbox-marked' : 'checkbox-blank-outline'} size={20} color={f.acceptCod ? C.green : C.ink3} />
            <MC name="cash" size={19} color={C.brand} style={{ marginLeft: 12 }} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ color: C.ink, fontWeight: '800', fontSize: 13.5 }}>Cash on Delivery</Text>
              <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 2 }}>Saman dete waqt nakad lein</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Btn
          title="Meri dukaan kholein"
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

/* ---------------- Seller dashboard ---------------- */
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
        rating: 4.5, ratingCount: 0, seller: 'me',
        sellerName: u.shopName, sellerCity: u.shopCity,
        img: f.img, tint: cat?.tint || '#EFF1F6',
        desc: f.desc || 'Seller dwara listed product.',
        tags: ['New', 'Cash on Delivery'],
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
              <Text style={{ fontWeight: '900', color: C.ink, fontSize: 15 }}>{u.shopName || 'Meri Dukaan'}</Text>
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
          <Btn title="Dukaan settings" icon="cog-outline" tone="ghost" style={{ flex: 1 }} onPress={() => go('shop-settings')} />
        </View>

        {!add ? (
          <Btn title="Naya product list karein" icon="plus" tone="accent" style={{ marginTop: 12 }} onPress={() => setAdd(true)} />
        ) : (
          <View style={[ac.card, shadow, { padding: 18, marginTop: 16 }]}>
            <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16, marginBottom: 14 }}>Naya product</Text>
            <Field label="Product ka naam" placeholder="Jaise: Cotton kurta" value={f.title} onChangeText={(v) => setF({ ...f, title: v })} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}><Field label="Bechne ka daam ₹" keyboardType="number-pad" placeholder="799" value={f.price} onChangeText={(v) => setF({ ...f, price: v.replace(/\D/g, '') })} /></View>
              <View style={{ flex: 1 }}><Field label="MRP ₹" keyboardType="number-pad" placeholder="1499" value={f.mrp} onChangeText={(v) => setF({ ...f, mrp: v.replace(/\D/g, '') })} /></View>
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
            <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>Product ki photo — camera ya gallery se</Text>
            <TouchableOpacity onPress={pickPhoto} activeOpacity={0.85} style={ac.photoBox}>
              {f.img ? (
                <Image source={f.img} resizeMode="cover" style={{ width: '100%', height: '100%', borderRadius: R.md }} />
              ) : (
                <>
                  <MC name="camera-plus-outline" size={26} color={C.ink3} />
                  <Text style={{ color: C.ink2, fontSize: 12.5, fontWeight: '700', marginTop: 8 }}>Photo chunein</Text>
                  <Text style={{ color: C.ink3, fontSize: 10.5, marginTop: 3, textAlign: 'center', paddingHorizontal: 20 }}>Apne saman ki asli photo</Text>
                </>
              )}
            </TouchableOpacity>
            {!!f.img && (
              <TouchableOpacity onPress={() => setF({ ...f, img: null })} style={{ alignSelf: 'center', marginTop: 8, marginBottom: 6 }}>
                <Text style={{ color: C.red, fontSize: 12, fontWeight: '700' }}>Photo hatayein</Text>
              </TouchableOpacity>
            )}
            <View style={{ height: 14 }} />
            <Field label="Description" placeholder="Material, size, details…" multiline value={f.desc} onChangeText={(v) => setF({ ...f, desc: v })} style={{ height: 90, textAlignVertical: 'top' }} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Btn title="Cancel" tone="ghost" style={{ flex: 1 }} onPress={() => setAdd(false)} />
              <Btn title="Live karein" tone="green" style={{ flex: 1 }} disabled={!f.title || !f.price || !f.img} onPress={save} />
            </View>
          </View>
        )}

        <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16, marginTop: 24, marginBottom: 12 }}>Meri listings</Text>
        {mine.length === 0 ? (
          <View style={[ac.card, shadow, { padding: 24, alignItems: 'center' }]}>
            <MC name="package-variant" size={30} color={C.ink3} />
            <Text style={{ color: C.ink2, fontSize: 13, marginTop: 8, textAlign: 'center' }}>Abhi koi listing nahi. Upar se apna pehla product add karein.</Text>
          </View>
        ) : (
          mine.map((p) => (
            <TouchableOpacity key={p.id} onPress={() => go('product', { id: p.id })} style={[ac.wishRow, shadow]}>
              <View style={{ width: 62 }}><Thumb img={p.img} title={p.title} tint={p.tint} size={62} /></View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text numberOfLines={2} style={{ color: C.ink, fontWeight: '700', fontSize: 13.5 }}>{p.title}</Text>
                <Text style={{ color: C.ink, fontWeight: '900', marginTop: 4 }}>{money(p.price)} <Text style={{ color: C.ink3, fontWeight: '400', fontSize: 11, textDecorationLine: 'line-through' }}>{money(p.mrp)}</Text></Text>
                <View style={{ marginTop: 6 }}><Badge text="LIVE" tone="green" small /></View>
              </View>
              <TouchableOpacity onPress={() => dispatch({ type: 'RM_PRODUCT', id: p.id })} style={{ padding: 8 }}>
                <Text style={{ color: C.red, fontSize: 12, fontWeight: '800' }}>Hatayein</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

/* ---------------- Human support ---------------- */
const AGENT_REPLIES = [
  'Ji bilkul, main abhi dekh ke batati hoon. Ek minute.',
  'Maine aapka order check kar liya — sab theek hai, kal tak nikal jayega.',
  'Agar aap chahein to main seller ko abhi call laga deti hoon.',
  'Main aapke liye return request khol deti hoon, paisa 3 din me wapas aa jayega.',
  'Aur kuch madad chahiye? Main yahin hoon.',
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
      <Header title="Support" go={go} />
      <View style={ac.agentBar}>
        <Avatar name="Priya S" hue={C.brand} size={44} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontWeight: '900', color: C.ink, fontSize: 14 }}>Priya S. · Support Executive</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.green }} />
            <Text style={{ color: C.green, fontSize: 11.5, fontWeight: '700', marginLeft: 5 }}>Online · asli insaan, koi bot nahi</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            const url = `https://wa.me/919044468663?text=${encodeURIComponent('Namaste Temsho Support! Mujhe ek madad chahiye.')}`;
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
            Temsho par har support message ek verified insaan likhta hai.{'\n'}Hindi, English, Bhojpuri, Tamil, Bangla + 6 aur bhashayein.
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
          placeholder="Apni baat likhein…"
          placeholderTextColor={C.ink3}
          style={{ flex: 1, fontSize: 14, color: C.ink, paddingVertical: 10, paddingHorizontal: 14, outlineStyle: 'none' }}
        />
        <TouchableOpacity onPress={send} style={ac.sendBtn}><MC name="send" size={17} color="#fff" /></TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------------- Policy ---------------- */
export function Policy({ go }) {
  const items = [
    ['cellphone-check', 'Sirf mobile number', 'Login ke liye bas OTP. Na Aadhaar, na PAN, na GST, na selfie — koi document nahi maangte.'],
    ['numeric-1-circle-outline', 'Ek number = ek insaan', 'Har mobile number par sirf ek account. Duplicate, emulator aur bulk sign-up turant block.'],
    ['headset', 'Insaani support', 'Support par koi AI chatbot nahi. Aapse hamesha ek asli employee baat karega.'],
    ['star-check-outline', 'Sirf asli reviews', 'Review sirf verified khareedar hi likh sakta hai, order ke baad. Paid fake reviews par lifetime ban.'],
    ['cancel', 'No dark patterns', 'Nakli countdown timer, nakli "5 log dekh rahe hain" — kuch bhi nahi. Jo dikhega, wahi sach hoga.'],
    ['database-lock-outline', 'Data India me', 'Sirf aapka number aur pata save hota hai, wo bhi Bharat ke servers par. Kabhi bech-a nahi jaata.'],
  ];
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Human-Only Policy" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={[ac.card, shadow, { padding: 20 }]}>
          <View style={ac.bigIco}><MC name="account-check-outline" size={26} color={C.brand} /></View>
          <Text style={{ fontSize: 20, fontWeight: '900', color: C.ink, marginTop: 12 }}>No Bots. Only Humans.</Text>
          <Text style={{ color: C.ink2, fontSize: 13.5, lineHeight: 21, marginTop: 8 }}>
            Temsho ek aisa bazaar hai jahan har taraf asli insaan hain — khareedne wala bhi, bechne wala bhi,
            aur madad karne wala bhi. Aur ye sab sirf ek mobile number se — koi document nahi.
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

/* ---------------- Privacy Policy & Terms (DPDP 2023 Compliant) ---------------- */
export function PrivacyPolicyScreen({ go }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Privacy Policy & Terms" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={[ac.card, shadow, { padding: 18 }]}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: C.ink }}>Temsho Privacy Policy</Text>
          <Text style={{ color: C.ink3, fontSize: 11, marginTop: 4 }}>Digital Personal Data Protection Act (DPDP) 2023 Compliant</Text>

          <Text style={ac.policySec}>1. Hum kya data lete hain?</Text>
          <Text style={ac.policyTxt}>• Mobile number (OTP login ke liye)</Text>
          <Text style={ac.policyTxt}>• Delivery address (Order pahunchane ke liye)</Text>
          <Text style={ac.policyTxt}>• Dukaan ka naam aur UPI ID (Sirf sellers ke liye)</Text>
          <Text style={ac.policyTxt}>• Hum koi Aadhaar, PAN ya biometric data KABHI nahi lete.</Text>

          <Text style={ac.policySec}>2. Data ka upyog kaise hota hai?</Text>
          <Text style={ac.policyTxt}>• Sirf order complete karne aur delivery update bhejne ke liye.</Text>
          <Text style={ac.policyTxt}>• Aapka data kisi teesri party ya advertiser ko KABHI nahi becha jaata.</Text>

          <Text style={ac.policySec}>3. Paisa aur Payment Suraksha</Text>
          <Text style={ac.policyTxt}>• Paisa seedha buyer ke UPI se seller ke UPI par jaata hai.</Text>
          <Text style={ac.policyTxt}>• Temsho aapke credit/debit card numbers ya bank PIN store nahi karta.</Text>

          <Text style={ac.policySec}>4. Data Deletion ka Adhikar</Text>
          <Text style={ac.policyTxt}>• Aap app ki Settings me jakar 1-click me apna khaata aur saara data hamesha ke liye delete kar sakte hain.</Text>

          <Text style={ac.policySec}>5. Grievance Officer & Contact</Text>
          <Text style={ac.policyTxt}>• Grievance Officer: Support Desk, Temsho Technologies India</Text>
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
  ownerCta: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1B1E3B', borderRadius: R.lg, padding: 16, marginTop: 16 },
  crown: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#ffffff1f', alignItems: 'center', justifyContent: 'center' },
  gear: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#ffffff2a', alignItems: 'center', justifyContent: 'center' },
  walletStrip: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: R.lg, padding: 16 },
  shareBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E9F9EF', borderRadius: R.lg, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#A3E8B8' },
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
    height: 150, borderRadius: R.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#C7CAEA',
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  walIco: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' },
  sellIco: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#ffffff2a', alignItems: 'center', justifyContent: 'center' },
  bigIco: { width: 52, height: 52, borderRadius: 16, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' },
  agentBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, padding: 14, borderBottomWidth: 1, borderBottomColor: C.line },
  callBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E9F9EF', alignItems: 'center', justifyContent: 'center' },
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
