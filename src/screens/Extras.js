import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Share } from 'react-native';
import { C, R, shadow, money } from '../theme';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import { Btn, Badge, Empty, Field, Avatar } from '../components/UI';
import { Header } from './Product';
import { useApp } from '../store';
import { createShipment, getWhatsAppConnectUrl } from '../lib/shiprocket';

const ago = (t) => {
  const d = Math.floor((Date.now() - t) / 60000);
  if (d < 1) return 'abhi';
  if (d < 60) return d + ' min pehle';
  if (d < 1440) return Math.floor(d / 60) + ' ghante pehle';
  return Math.floor(d / 1440) + ' din pehle';
};

export function Notifications({ go }) {
  const { state, dispatch } = useApp();
  useEffect(() => {
    const t = setTimeout(() => dispatch({ type: 'READ_NOTIFS' }), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Notifications" go={go} />
      {state.notifications.length === 0 ? (
        <Empty icon="bell-outline" title="Koi notification nahi" sub="Order updates aur offers yahan aayenge." />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {state.notifications.map((n) => (
            <View key={n.id} style={[nt.row, shadow, !n.read && { borderLeftWidth: 3, borderLeftColor: C.accent }]}>
              <View style={[nt.ico, { backgroundColor: (n.tone || C.brand) + '18' }]}>
                <MC name={n.icon || 'bell-outline'} size={18} color={n.tone || C.brand} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontWeight: '800', color: C.ink, fontSize: 13.5 }}>{n.title}</Text>
                <Text style={{ color: C.ink2, fontSize: 12.5, lineHeight: 18, marginTop: 3 }}>{n.body}</Text>
                <Text style={{ color: C.ink3, fontSize: 10.5, marginTop: 6 }}>{ago(n.at)}</Text>
              </View>
            </View>
          ))}
          <Text style={{ color: C.ink3, fontSize: 11, textAlign: 'center', marginTop: 16, lineHeight: 16 }}>
            Hum sirf order aur asli offers ke notification bhejte hain — spam nahi.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

export function Wallet({ go }) {
  const { state } = useApp();
  const u = state.user;
  const [copied, setCopied] = useState(false);
  const earned = state.orders.filter((o) => o.status !== 'Cancelled').map((o) => ({
    id: o.id, amt: Math.round(o.total * 0.01), at: o.at,
  }));

  const shareCode = u?.referral || 'TEM2026X';
  const shareMessage = `🛍️ Temsho — Poore Bharat ka apna bazaar!\nNo bot, only humans! Har order par seedha seller se khareedo.\n\nMera invite code lagao: *${shareCode}* aur pehle order par paao ₹100 cashback!\nJoin karo: https://temsho.in`;

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    Linking.openURL(url).catch(() => {});
  };

  const shareNative = () => {
    Share.share({ message: shareMessage }).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Wallet aur Referral" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={[nt.walletCard, shadow]}>
          <Text style={{ color: '#ffffffbb', fontSize: 12, fontWeight: '700' }}>TEMSHO WALLET BALANCE</Text>
          <Text style={{ color: '#fff', fontSize: 36, fontWeight: '900', marginTop: 6 }}>{money(state.wallet)}</Text>
          <Text style={{ color: '#ffffffcc', fontSize: 11.5, marginTop: 8, lineHeight: 17 }}>
            Har order par 1% cashback. Checkout par seedha use kar sakte hain.
          </Text>
        </View>

        <View style={[nt.card, shadow, { marginTop: 16 }]}>
          <Text style={{ fontWeight: '900', color: C.ink, fontSize: 15 }}>Dost ko bulayein, ₹100 payein</Text>
          <Text style={{ color: C.ink2, fontSize: 12.5, lineHeight: 19, marginTop: 6 }}>
            Aapka dost is code se join karke pehla order kare — aap dono ko ₹100 wallet me.
          </Text>
          <View style={nt.codeBox}>
            <Text style={{ flex: 1, color: C.brand, fontWeight: '900', fontSize: 18, letterSpacing: 2 }}>{shareCode}</Text>
            <TouchableOpacity onPress={() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }} style={nt.copyBtn}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{copied ? 'Copied' : 'Copy'}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <Btn title="WhatsApp par bhejein" icon="whatsapp" tone="green" style={{ flex: 1.2 }} onPress={shareWhatsApp} />
            <Btn title="Share" icon="share-variant" tone="ghost" style={{ flex: 0.8 }} onPress={shareNative} />
          </View>
        </View>

        <Text style={{ fontWeight: '900', color: C.ink, fontSize: 15, marginTop: 24, marginBottom: 10 }}>Cashback history</Text>
        {earned.length === 0 ? (
          <View style={[nt.card, shadow, { alignItems: 'center', paddingVertical: 26 }]}>
            <MC name="wallet-outline" size={28} color={C.ink3} />
            <Text style={{ color: C.ink2, fontSize: 12.5, marginTop: 10 }}>Abhi koi cashback nahi. Pehla order karein.</Text>
          </View>
        ) : (
          earned.map((e) => (
            <View key={e.id} style={[nt.row, shadow]}>
              <View style={[nt.ico, { backgroundColor: C.greenSoft }]}><MC name="cash-plus" size={17} color={C.green} /></View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: C.ink, fontWeight: '700', fontSize: 13 }}>Order #{e.id} par cashback</Text>
                <Text style={{ color: C.ink3, fontSize: 11, marginTop: 2 }}>{new Date(e.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
              </View>
              <Text style={{ color: C.green, fontWeight: '900' }}>+{money(e.amt)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

/* Seller ke incoming orders & Logistics Dispatch */
export function SellerOrders({ go }) {
  const { state, dispatch } = useApp();
  const myIds = state.products.filter((p) => p.seller === 'me').map((p) => p.id);
  const mine = state.orders.filter((o) => o.items.some((it) => myIds.includes(it.id)) || true); // show orders for test
  const [dispatching, setDispatching] = useState(null);

  const handleShiprocketDispatch = async (o) => {
    const res = await createShipment(o, state.shop);
    if (res.ok) {
      dispatch({ type: 'ATTACH_AWB', id: o.id, shipment: res.shipment });
      setDispatching(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Aaye hue Orders & Dispatch" go={go} />
      {mine.length === 0 ? (
        <Empty icon="tray-arrow-down" title="Abhi koi order nahi aaya" sub="Jab koi aapka product khareedega, wo yahan dikhega.">
          <Btn title="Dashboard" onPress={() => go(-1)} />
        </Empty>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {mine.map((o) => {
            const firstItem = o.items[0];
            return (
              <View key={o.id} style={[nt.card, shadow, { marginBottom: 12 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontWeight: '900', color: C.ink, fontSize: 13.5 }}>#{o.id}</Text>
                  <View style={{ flex: 1 }} />
                  <Badge text={o.status} tone={o.status === 'Cancelled' ? 'red' : 'green'} />
                </View>

                {o.items.map((it) => (
                  <Text key={it.id} style={{ color: C.ink2, fontSize: 12.5, marginTop: 8 }}>
                    {it.title}  ×{it.qty}
                  </Text>
                ))}

                <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 8, lineHeight: 17 }}>
                  Delivery: {o.address?.name || 'Customer'} · {o.address?.city}, {o.address?.state} – {o.address?.pin}
                </Text>

                {/* AWB tag if shipped */}
                {o.shipment && (
                  <View style={nt.awbBadge}>
                    <MC name="truck-check" size={16} color={C.brand} />
                    <Text style={{ color: C.brand, fontWeight: '800', fontSize: 11.5, marginLeft: 6 }}>
                      {o.shipment.courier} · AWB: {o.shipment.awb}
                    </Text>
                  </View>
                )}

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  {!o.shipment ? (
                    <Btn
                      title="Shiprocket Dispatch"
                      icon="truck-fast"
                      tone="brand"
                      style={{ flex: 1.3 }}
                      onPress={() => handleShiprocketDispatch(o)}
                    />
                  ) : (
                    <Btn
                      title="Next Status"
                      icon="fast-forward"
                      tone="ghost"
                      style={{ flex: 1 }}
                      onPress={() => dispatch({ type: 'ADVANCE_ORDER', id: o.id })}
                    />
                  )}
                  <Btn
                    title="Call / WhatsApp"
                    icon="whatsapp"
                    tone="green"
                    style={{ flex: 1 }}
                    onPress={() => {
                      const url = getWhatsAppConnectUrl(o.address?.phone || '9044468663', o.id, firstItem?.title);
                      Linking.openURL(url).catch(() => {});
                    }}
                  />
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const nt = StyleSheet.create({
  row: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: R.lg, padding: 14, marginBottom: 10 },
  ico: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: C.surface, borderRadius: R.lg, padding: 16 },
  walletCard: { backgroundColor: C.brand, borderRadius: R.xl, padding: 22 },
  codeBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.brandSoft,
    borderRadius: R.md, padding: 12, marginTop: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#C7CAEA',
  },
  copyBtn: { backgroundColor: C.brand, paddingHorizontal: 16, paddingVertical: 9, borderRadius: R.sm },
  awbBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.brandSoft, borderRadius: R.sm, padding: 8, marginTop: 10 },
});

export function Addresses({ go }) {
  const { state, dispatch } = useApp();
  const [add, setAdd] = useState(false);
  const [f, setF] = useState({ name: '', line: '', city: '', state: '', pin: '', phone: '' });

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Mere Addresses" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {state.addresses.map((a) => (
          <View key={a.id} style={[nt.card, shadow, { marginBottom: 12 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontWeight: '900', color: C.ink, fontSize: 14 }}>{a.name}</Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={() => dispatch({ type: 'RM_ADDRESS', id: a.id })}>
                <Text style={{ color: C.red, fontWeight: '800', fontSize: 12 }}>Hatayein</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: C.ink2, fontSize: 12.5, lineHeight: 19, marginTop: 6 }}>
              {a.line}, {a.city}, {a.state} – {a.pin}
            </Text>
            <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 4 }}>{a.phone}</Text>
          </View>
        ))}

        {!add ? (
          <Btn title="Naya address add karein" icon="plus" tone="outline" onPress={() => setAdd(true)} />
        ) : (
          <View style={[nt.card, shadow]}>
            <Field label="Address ka naam" placeholder="Ghar / Office" value={f.name} onChangeText={(v) => setF({ ...f, name: v })} />
            <Field label="Poora pata" placeholder="House no, street, area" value={f.line} onChangeText={(v) => setF({ ...f, line: v })} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}><Field label="Sheher" placeholder="Lucknow" value={f.city} onChangeText={(v) => setF({ ...f, city: v })} /></View>
              <View style={{ flex: 1 }}><Field label="Rajya" placeholder="Uttar Pradesh" value={f.state} onChangeText={(v) => setF({ ...f, state: v })} /></View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}><Field label="PIN code" keyboardType="number-pad" placeholder="226010" value={f.pin} onChangeText={(v) => setF({ ...f, pin: v })} /></View>
              <View style={{ flex: 1 }}><Field label="Mobile" keyboardType="number-pad" placeholder="10 digit" value={f.phone} onChangeText={(v) => setF({ ...f, phone: v })} /></View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Btn title="Cancel" tone="ghost" style={{ flex: 1 }} onPress={() => setAdd(false)} />
              <Btn title="Save" style={{ flex: 1 }} disabled={!f.line || !f.city || !f.pin}
                onPress={() => {
                  dispatch({ type: 'ADDRESS', address: { ...f, id: 'a' + Date.now(), name: f.name || 'Naya' } });
                  setF({ name: '', line: '', city: '', state: '', pin: '', phone: '' });
                  setAdd(false);
                }} />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
