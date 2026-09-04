import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Share } from 'react-native';
import { C, R, shadow, money } from '../theme';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import { Btn, Badge, Empty, Field, Avatar } from '../components/UI';
import { Header } from './Product';
import { useApp } from '../store';
import { createShipment, getWhatsAppConnectUrl } from '../lib/shiprocket';
import { ShippingLabelModal } from '../components/ShippingLabel';

const ago = (t) => {
  const d = Math.floor((Date.now() - t) / 60000);
  if (d < 1) return 'just now';
  if (d < 60) return `${d}m ago`;
  if (d < 1440) return `${Math.floor(d / 60)}h ago`;
  return `${Math.floor(d / 1440)}d ago`;
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
        <Empty icon="bell-outline" title="No Notifications Yet" sub="Important order updates and alerts will appear here." />
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
            We only send critical order updates and genuine deals — no spam.
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

  const shareCode = u?.referral || 'TEM2026X';
  const shareMessage = `🛍️ Temsho — India's Verified Human Marketplace!\nNo bots, only real humans. Buy direct from verified producers.\n\nUse invite code: *${shareCode}* at checkout!\nJoin: https://temsho.in`;

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    Linking.openURL(url).catch(() => {});
  };

  const shareNative = () => {
    Share.share({ message: shareMessage }).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Refer & Share" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={[nt.card, shadow]}>
          <Text style={{ fontWeight: '900', color: C.ink, fontSize: 17 }}>Invite Friends to Temsho</Text>
          <Text style={{ color: C.ink2, fontSize: 13, lineHeight: 19, marginTop: 6 }}>
            Share your personal referral code with friends and family to help them discover verified human sellers across India.
          </Text>
          <View style={nt.codeBox}>
            <Text style={{ flex: 1, color: C.brand, fontWeight: '900', fontSize: 18, letterSpacing: 2 }}>{shareCode}</Text>
            <TouchableOpacity onPress={() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }} style={nt.copyBtn}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{copied ? 'Copied' : 'Copy'}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            <Btn title="Share on WhatsApp" icon="whatsapp" tone="green" style={{ flex: 1.3 }} onPress={shareWhatsApp} />
            <Btn title="Share Link" icon="share-variant" tone="ghost" style={{ flex: 0.8 }} onPress={shareNative} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* Seller Incoming Orders & Logistics */
export function SellerOrders({ go }) {
  const { state, dispatch } = useApp();
  const [activeLabelOrder, setActiveLabelOrder] = useState(null);
  const myIds = state.products.filter((p) => p.seller === 'me').map((p) => p.id);
  const mine = state.orders.filter((o) => o.items.some((it) => myIds.includes(it.id)) || true);

  const handleShiprocketDispatch = async (o) => {
    const res = await createShipment(o, state.shop);
    if (res.ok) {
      dispatch({ type: 'ATTACH_AWB', id: o.id, shipment: res.shipment });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Seller Orders & Dispatch" go={go} />

      {/* 4x6 Printable Shipping Label Modal */}
      {activeLabelOrder && (
        <ShippingLabelModal
          visible={!!activeLabelOrder}
          onClose={() => setActiveLabelOrder(null)}
          order={activeLabelOrder}
          sellerInfo={state.shop}
        />
      )}

      {mine.length === 0 ? (
        <Empty icon="tray-arrow-down" title="No Incoming Orders Yet" sub="Orders placed by customers for your products will appear here.">
          <Btn title="Dashboard" onPress={() => go(-1)} />
        </Empty>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {mine.map((o) => {
            const firstItem = o.items[0];
            const isCod = o.pay === 'cod';
            return (
              <View key={o.id} style={[nt.card, shadow, { marginBottom: 14 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontWeight: '900', color: C.ink, fontSize: 13.5 }}>Order #{o.id}</Text>
                  <View style={{ flex: 1 }} />
                  <Badge text={o.status} tone={o.status === 'Cancelled' ? 'red' : o.status === 'Delivered' ? 'green' : 'brand'} />
                </View>

                {o.items.map((it) => (
                  <Text key={it.id} style={{ color: C.ink, fontSize: 13, fontWeight: '700', marginTop: 8 }}>
                    {it.title} × {it.qty}
                  </Text>
                ))}

                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isCod ? '#FEF3C7' : '#ECFDF5', padding: 8, borderRadius: R.sm, marginTop: 8 }}>
                  <MC name={isCod ? 'cash' : 'check-circle'} size={16} color={isCod ? '#B45309' : C.green} />
                  <Text style={{ color: isCod ? '#92400E' : '#047857', fontSize: 11.5, fontWeight: '800', marginLeft: 6 }}>
                    {isCod ? `Cash on Delivery (Collect ${money(o.total)})` : 'Prepaid Order (Paid Online)'}
                  </Text>
                </View>

                <View style={{ backgroundColor: '#F8FAFC', borderRadius: R.sm, padding: 10, marginTop: 8, borderWidth: 1, borderColor: C.line }}>
                  <Text style={{ color: C.ink, fontSize: 11.5, fontWeight: '800' }}>
                    📍 Pickup From: {state.shop.pickup || `${state.shop.city || 'Seller Shop'}, ${state.shop.state || 'UP'}`} – PIN {state.shop.pin || '226010'}
                  </Text>
                  <Text style={{ color: C.ink2, fontSize: 11.5, marginTop: 4 }}>
                    🎯 Deliver To: {o.address?.name || 'Customer'} · {o.address?.line || ''}, {o.address?.city || ''} – PIN {o.address?.pin || ''}
                  </Text>
                  <Text style={{ color: C.ink3, fontSize: 11, marginTop: 3 }}>
                    📱 Customer Phone: +91 {o.address?.phone || o.customerPhone || '9044468663'}
                  </Text>
                </View>

                {o.shipment && (
                  <View style={nt.awbBadge}>
                    <MC name="truck-check" size={16} color={C.brand} />
                    <Text style={{ color: C.brand, fontWeight: '800', fontSize: 11.5, marginLeft: 6 }}>
                      {o.shipment.courier} · AWB: {o.shipment.awb}
                    </Text>
                  </View>
                )}

                {/* Print Parcel Shipping Label Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setActiveLabelOrder(o)}
                  style={nt.printLabelBtn}
                >
                  <MC name="printer-pos" size={17} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12.5, marginLeft: 6 }}>
                    📄 Print Shipping Label & Parcel Slip
                  </Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  {!o.shipment ? (
                    <Btn
                      title="Dispatch Shiprocket"
                      icon="truck-fast"
                      tone="brand"
                      style={{ flex: 1.2 }}
                      onPress={() => handleShiprocketDispatch(o)}
                    />
                  ) : (
                    <Btn
                      title="Advance Status"
                      icon="fast-forward"
                      tone="ghost"
                      style={{ flex: 1 }}
                      onPress={() => dispatch({ type: 'ADVANCE_ORDER', id: o.id })}
                    />
                  )}
                  <Btn
                    title="WhatsApp"
                    icon="whatsapp"
                    tone="green"
                    style={{ flex: 0.9 }}
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

export function Addresses({ go }) {
  const { state, dispatch } = useApp();
  const [add, setAdd] = useState(false);
  const [f, setF] = useState({ name: '', line: '', city: '', state: '', pin: '', phone: '' });

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Saved Addresses" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {state.addresses.map((a) => (
          <View key={a.id} style={[nt.card, shadow, { marginBottom: 12 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontWeight: '900', color: C.ink, fontSize: 14 }}>{a.name}</Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={() => dispatch({ type: 'RM_ADDRESS', id: a.id })}>
                <Text style={{ color: C.red, fontWeight: '800', fontSize: 12 }}>Remove</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: C.ink2, fontSize: 12.5, lineHeight: 19, marginTop: 6 }}>
              {a.line}, {a.city}, {a.state} – {a.pin}
            </Text>
            <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 4 }}>+91 {a.phone}</Text>
          </View>
        ))}

        {!add ? (
          <Btn title="Add New Address" icon="plus" tone="outline" onPress={() => setAdd(true)} />
        ) : (
          <View style={[nt.card, shadow]}>
            <Field label="Address Label" placeholder="Home / Office" value={f.name} onChangeText={(v) => setF({ ...f, name: v })} />
            <Field label="Full Address" placeholder="House / Flat No., Street, Area" value={f.line} onChangeText={(v) => setF({ ...f, line: v })} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}><Field label="City" placeholder="Lucknow" value={f.city} onChangeText={(v) => setF({ ...f, city: v })} /></View>
              <View style={{ flex: 1 }}><Field label="State" placeholder="Uttar Pradesh" value={f.state} onChangeText={(v) => setF({ ...f, state: v })} /></View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}><Field label="PIN Code" keyboardType="number-pad" placeholder="226010" value={f.pin} onChangeText={(v) => setF({ ...f, pin: v })} /></View>
              <View style={{ flex: 1 }}><Field label="Contact Mobile" keyboardType="number-pad" placeholder="10-digit number" value={f.phone} onChangeText={(v) => setF({ ...f, phone: v })} /></View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Btn title="Cancel" tone="ghost" style={{ flex: 1 }} onPress={() => setAdd(false)} />
              <Btn title="Save Address" style={{ flex: 1 }} disabled={!f.line || !f.city || !f.pin}
                onPress={() => {
                  dispatch({ type: 'ADDRESS', address: { ...f, id: 'a' + Date.now(), name: f.name || 'Delivery' } });
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

const nt = StyleSheet.create({
  row: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: R.lg, padding: 14, marginBottom: 10 },
  ico: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: C.surface, borderRadius: R.lg, padding: 16 },
  codeBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.brandSoft,
    borderRadius: R.md, padding: 12, marginTop: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#C7D2FE',
  },
  copyBtn: { backgroundColor: C.brand, paddingHorizontal: 16, paddingVertical: 9, borderRadius: R.sm },
  awbBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.brandSoft, borderRadius: R.sm, padding: 8, marginTop: 10 },
  printLabelBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.brand, paddingVertical: 10, borderRadius: R.md,
    marginTop: 10,
  },
});
