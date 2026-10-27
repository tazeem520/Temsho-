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
  const shareMessage = `🛍️ Temsho — India's Trusted Online Marketplace!\nBuy direct from verified Indian sellers.\n\nUse invite code: *${shareCode}* at checkout!\nJoin: https://temsho.in`;

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
            Share your personal referral code with friends and family to help them discover verified Indian sellers and quality products.
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

/* Seller Incoming Orders & Logistics (Flipkart Seller Hub Standard) */
export function SellerOrders({ go }) {
  const { state, dispatch } = useApp();
  const [activeLabelOrder, setActiveLabelOrder] = useState(null);
  const [tab, setTab] = useState('all'); // 'all' | 'new' | 'transit' | 'delivered' | 'returns'
  const [spfModal, setSpfModal] = useState(null);
  const [spfReason, setSpfReason] = useState('Wrong/Damaged item returned by customer');
  const [spfNotes, setSpfNotes] = useState('');

  const myIds = state.products.filter((p) => p.seller === 'me').map((p) => p.id);
  const allMine = state.orders.filter((o) => o.items.some((it) => myIds.includes(it.id)) || true);

  const mine = allMine.filter((o) => {
    if (tab === 'new') return !o.shipment && o.status !== 'Cancelled';
    if (tab === 'transit') return o.shipment && !['Delivered', 'Cancelled', 'Return Requested'].includes(o.status);
    if (tab === 'delivered') return o.status === 'Delivered';
    if (tab === 'returns') return o.status === 'Return Requested' || o.status === 'Refund Completed' || o.spfClaim;
    return true;
  });

  const handleShiprocketDispatch = async (o) => {
    const res = await createShipment(o, state.shop);
    if (res.ok) {
      dispatch({ type: 'ATTACH_AWB', id: o.id, shipment: res.shipment });
    }
  };

  const submitSpfClaim = () => {
    if (!spfModal) return;
    dispatch({
      type: 'RAISE_SPF_CLAIM',
      orderId: spfModal.id,
      amount: spfModal.total,
      reason: spfReason,
      notes: spfNotes,
      sellerPhone: state.user?.phone,
    });
    setSpfModal(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Seller Orders & Logistics Hub" go={go} />

      {/* SPF Protection Claim Modal */}
      {spfModal && (
        <Modal animationType="slide" transparent visible={!!spfModal}>
          <View style={nt.modalOverlay}>
            <View style={[nt.spfModalCard, shadow]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <MC name="shield-lock" size={22} color={C.brand} />
                <Text style={{ fontSize: 16, fontWeight: '900', color: C.ink, marginLeft: 8, flex: 1 }}>
                  Seller Protection Fund (SPF) Claim
                </Text>
                <TouchableOpacity onPress={() => setSpfModal(null)} style={{ padding: 4 }}>
                  <MC name="close" size={22} color={C.ink3} />
                </TouchableOpacity>
              </View>

              <Text style={{ color: C.ink2, fontSize: 12, lineHeight: 18, marginBottom: 12 }}>
                Flipkart Security Guarantee: If a customer returned a wrong/damaged item or the courier lost the parcel, Temsho SPF covers 100% of your product cost.
              </Text>

              <View style={nt.spfInfoBox}>
                <Text style={{ fontWeight: '800', color: C.ink, fontSize: 13 }}>Order #{spfModal.id}</Text>
                <Text style={{ color: C.green, fontWeight: '900', fontSize: 14, marginTop: 2 }}>
                  Claim Amount: {money(spfModal.total)}
                </Text>
              </View>

              <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '800', marginTop: 10, marginBottom: 6 }}>
                Select Claim Issue *
              </Text>
              {[
                'Wrong/Different item received in return parcel',
                'Item damaged / used condition returned by customer',
                'Empty parcel / Missing items in return package',
                'Parcel lost or stolen by courier partner in transit',
              ].map((re) => (
                <TouchableOpacity
                  key={re}
                  onPress={() => setSpfReason(re)}
                  style={[
                    nt.spfReasonOpt,
                    spfReason === re && { borderColor: C.brand, backgroundColor: C.brandSoft },
                  ]}
                >
                  <MC name={spfReason === re ? 'radiobox-marked' : 'radiobox-blank'} size={17} color={spfReason === re ? C.brand : C.ink3} />
                  <Text style={{ color: C.ink, fontSize: 12, fontWeight: spfReason === re ? '800' : '500', marginLeft: 8, flex: 1 }}>
                    {re}
                  </Text>
                </TouchableOpacity>
              ))}

              <Field
                label="Additional Incident Details (Optional)"
                placeholder="Explain the damage or unboxing details…"
                value={spfNotes}
                onChangeText={setSpfNotes}
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <Btn title="Cancel" tone="ghost" style={{ flex: 1 }} onPress={() => setSpfModal(null)} />
                <Btn title="Submit SPF Claim" icon="shield-check" tone="green" style={{ flex: 1.4 }} onPress={submitSpfClaim} />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* 4x6 Printable Shipping Label Modal */}
      {activeLabelOrder && (
        <ShippingLabelModal
          visible={!!activeLabelOrder}
          onClose={() => setActiveLabelOrder(null)}
          order={activeLabelOrder}
          sellerInfo={state.shop}
        />
      )}

      {/* Flipkart Seller Orders Pipeline Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 48, flexGrow: 0, backgroundColor: C.surface }} contentContainerStyle={{ paddingHorizontal: 12, alignItems: 'center' }}>
        {[
          ['all', `All (${allMine.length})`],
          ['new', '📦 Ready to Ship'],
          ['transit', '🚚 In Transit'],
          ['delivered', '✅ Delivered'],
          ['returns', '🔄 Returns & SPF'],
        ].map(([k, l]) => (
          <TouchableOpacity key={k} onPress={() => setTab(k)} style={[nt.pipelineTab, tab === k && nt.pipelineTabActive]}>
            <Text style={[nt.pipelineTabTxt, tab === k && nt.pipelineTabTxtActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {mine.length === 0 ? (
        <Empty icon="tray-arrow-down" title="No Orders Under This Filter" sub="Incoming customer orders and logistics dispatches will appear here.">
          <Btn title="View All Orders" onPress={() => setTab('all')} />
        </Empty>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {mine.map((o) => {
            const firstItem = o.items[0];
            const isCod = o.pay === 'cod';
            const isReturn = o.status === 'Return Requested' || o.status === 'Refund Completed';
            const hasSpf = !!o.spfClaim;

            return (
              <View key={o.id} style={[nt.card, shadow, { marginBottom: 14 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontWeight: '900', color: C.ink, fontSize: 13.5 }}>Order #{o.id}</Text>
                  <View style={{ flex: 1 }} />
                  <Badge
                    text={hasSpf ? 'SPF PROTECTED' : o.status}
                    tone={hasSpf ? 'green' : o.status === 'Cancelled' ? 'red' : isReturn ? 'accent' : o.status === 'Delivered' ? 'green' : 'brand'}
                  />
                </View>

                {o.items.map((it, itIdx) => (
                  <Text key={it.id || itIdx} style={{ color: C.ink, fontSize: 13, fontWeight: '700', marginTop: 8 }}>
                    {it.title} {it.size ? `· [${it.size.includes('Year') || it.size.includes('Month') || it.size.includes('Y') ? 'Age: ' : 'Size: '}${it.size}]` : ''} × {it.qty}
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
                    📱 Customer Phone: +91 {o.address?.phone || o.customerPhone || '9044461613'}
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

                {/* Return Notice & SPF Protection */}
                {isReturn && (
                  <View style={[nt.spfBadgeBox, hasSpf && { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                    <MC name={hasSpf ? 'shield-check' : 'alert-circle'} size={18} color={hasSpf ? '#059669' : '#B45309'} />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={{ color: hasSpf ? '#064E3B' : '#78350F', fontSize: 12, fontWeight: '800' }}>
                        {hasSpf ? 'SPF Claim Approved — 100% Loss Covered ✅' : 'Customer Return Requested'}
                      </Text>
                      <Text style={{ color: hasSpf ? '#047857' : '#92400E', fontSize: 11, marginTop: 1 }}>
                        {hasSpf ? `Claim Ref: ${o.spfClaim?.id} · Reason: ${o.spfClaim?.reason}` : `Reason: ${o.returnReason || 'Product Return'}. Doorstep reverse pickup active.`}
                      </Text>
                    </View>
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
                    📄 Print 4×6 Shipping Slip & Barcode
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

                  {/* Flipkart SPF Claim Button for Returns */}
                  {isReturn && !hasSpf && (
                    <Btn
                      title="Raise SPF Claim"
                      icon="shield-alert-outline"
                      tone="outline"
                      style={{ flex: 1.2 }}
                      onPress={() => setSpfModal(o)}
                    />
                  )}

                  <Btn
                    title="WhatsApp"
                    icon="whatsapp"
                    tone="green"
                    style={{ flex: 0.9 }}
                    onPress={() => {
                      const url = getWhatsAppConnectUrl(o.address?.phone || '9044461613', o.id, firstItem?.title);
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
  pipelineTab: {
    paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 2.5, borderBottomColor: 'transparent',
  },
  pipelineTabActive: {
    borderBottomColor: C.brand,
  },
  pipelineTabTxt: {
    fontSize: 12.5, fontWeight: '700', color: C.ink3,
  },
  pipelineTabTxtActive: {
    color: C.brand, fontWeight: '900',
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  spfModalCard: {
    backgroundColor: C.surface, borderRadius: R.xl, padding: 20, width: '100%', maxWidth: 390,
  },
  spfInfoBox: {
    backgroundColor: '#F8FAFC', borderRadius: R.md, padding: 12, borderWidth: 1, borderColor: C.line,
  },
  spfReasonOpt: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg,
    borderRadius: R.sm, padding: 10, marginBottom: 6, borderWidth: 1, borderColor: C.line,
  },
  spfBadgeBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7',
    padding: 10, borderRadius: R.sm, marginTop: 8, borderWidth: 1, borderColor: '#FDE68A',
  },
});
