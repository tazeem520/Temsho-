import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Linking } from 'react-native';
import { C, R, shadow, money } from '../theme';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import { Btn, Badge, Empty, Thumb, Field } from '../components/UI';
import { Header, Bill } from './Product';
import { useApp } from '../store';
import { SELLERS } from '../data/catalog';
import { UpiQR, PayNowBtn } from '../components/Upi';
import { getWhatsAppConnectUrl } from '../lib/shiprocket';
import * as cloud from '../lib/cloud';

const PAY = [
  { id: 'cod', name: 'Cash on Delivery', sub: 'Pay in cash upon doorstep delivery', icon: 'cash' },
  { id: 'upi', name: 'Direct UPI Payment', sub: 'Instant payment via GPay / PhonePe / Paytm', icon: 'cellphone-check' },
  { id: 'qr', name: 'Scan Seller QR Code', sub: 'Scan and pay directly using any UPI app', icon: 'qrcode-scan' },
  { id: 'card', name: 'Card / Net Banking', sub: 'Visa, RuPay, Mastercard & 50+ banks', icon: 'credit-card-outline' },
];

const Radio = ({ on }) => (
  <MC name={on ? 'radiobox-marked' : 'radiobox-blank'} size={19} color={on ? C.brand : C.ink3} />
);

export function Checkout({ go }) {
  const { state, cartLines, subtotal, saved, delivery, total, dispatch, coupon, couponOff, activeCoupons } = useApp();
  const [addr, setAddr] = useState(state.addresses[0]?.id);
  const [pay, setPay] = useState('cod');
  const [code, setCode] = useState('');
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ name: '', line: '', city: '', state: '', pin: '', phone: '' });

  const activeAddress = state.addresses.find((x) => x.id === addr) || state.addresses[0];

  if (cartLines.length === 0)
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <Header title="Checkout" go={go} />
        <Empty icon="cart-outline" title="Your cart is empty" sub="Add items to your cart before proceeding to checkout.">
          <Btn title="Go to Home" onPress={() => go('home')} />
        </Empty>
      </View>
    );

  // Split amounts per seller for direct settlement
  const sellerPays = Object.values(
    cartLines.reduce((acc, l) => {
      if (!l?.product) return acc;
      const isMine = l.product.seller === 'me';
      const key = l.product.seller || 'seller';
      const info = isMine
        ? { name: state.shop?.name || 'My Shop', upi: state.shop?.upi || 'temsho@upi' }
        : { name: l.product.sellerName || SELLERS[key]?.name || 'Verified Seller', upi: l.product.sellerUpi || 'temsho@upi' };
      if (!acc[key]) acc[key] = { key, ...info, amount: 0 };
      acc[key].amount += (Number(l.product.price) || 0) * (Number(l.qty) || 1);
      return acc;
    }, {})
  );

  const place = async () => {
    const a = activeAddress;
    const etaFormatted = new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });

    const orderId = 'TM' + Math.floor(100000 + Math.random() * 900000);
    const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));
    const order = {
      id: orderId,
      at: Date.now(),
      items: cartLines.map((l) => ({
        id: l.id,
        title: l.product.title,
        img: l.product.img,
        tint: l.product.tint,
        qty: l.qty,
        price: l.product.price,
      })),
      total,
      pay,
      address: a,
      customerName: a?.name || state.user?.name || 'Customer',
      customerPhone: a?.phone || state.user?.phone || '9044468663',
      status: 'Confirmed',
      coupon: coupon?.code || null,
      deliveryMode: 'standard',
      eta: etaFormatted,
      pincode: a?.pin || '226010',
      deliveryOtp,
      qrData: `TEMSHO://DELIVERY/${orderId}?otp=${deliveryOtp}`,
    };

    dispatch({ type: 'PLACE_ORDER', order });

    if (cloud.cloudOn()) {
      cloud.pushOrder(order, state.user?.cloudId || null).catch(() => {});
    }

    go('success', { id: order.id, eta: order.eta, otp: order.deliveryOtp });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Checkout" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 130 }}>
        {/* 1. DELIVERY ADDRESS */}
        <Text style={ck.sec}>1 · Delivery Address</Text>
        {state.addresses.map((a) => (
          <TouchableOpacity key={a.id} onPress={() => setAddr(a.id)} style={[ck.opt, addr === a.id && ck.optOn]}>
            <Radio on={addr === a.id} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ fontWeight: '800', color: C.ink, fontSize: 13.5 }}>{a.name}</Text>
              <Text style={{ color: C.ink2, fontSize: 12.5, marginTop: 3, lineHeight: 18 }}>
                {a.line}, {a.city}, {a.state} – {a.pin}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <MC name="phone-outline" size={11} color={C.ink3} />
                <Text style={{ color: C.ink3, fontSize: 11.5, marginLeft: 4 }}>{a.phone}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {!adding ? (
          <TouchableOpacity onPress={() => setAdding(true)} style={[ck.addBtn, { flexDirection: 'row' }]}>
            <MC name="plus" size={15} color={C.brand} />
            <Text style={{ color: C.brand, fontWeight: '800', fontSize: 13, marginLeft: 5 }}>Add New Delivery Address</Text>
          </TouchableOpacity>
        ) : (
          <View style={[ck.form, shadow]}>
            <Field label="Address Label" placeholder="Home / Office" value={f.name} onChangeText={(v) => setF({ ...f, name: v })} />
            <Field label="Full Address" placeholder="House / Flat No., Street, Area" value={f.line} onChangeText={(v) => setF({ ...f, line: v })} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}><Field label="City" placeholder="e.g. Lucknow" value={f.city} onChangeText={(v) => setF({ ...f, city: v })} /></View>
              <View style={{ flex: 1 }}><Field label="State" placeholder="e.g. Uttar Pradesh" value={f.state} onChangeText={(v) => setF({ ...f, state: v })} /></View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}><Field label="PIN Code" keyboardType="number-pad" placeholder="226010" value={f.pin} onChangeText={(v) => setF({ ...f, pin: v })} /></View>
              <View style={{ flex: 1 }}><Field label="Contact Mobile" keyboardType="number-pad" placeholder="10-digit number" value={f.phone} onChangeText={(v) => setF({ ...f, phone: v })} /></View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Btn title="Cancel" tone="ghost" style={{ flex: 1 }} onPress={() => setAdding(false)} />
              <Btn
                title="Save Address"
                style={{ flex: 1 }}
                disabled={!f.line || !f.city || !f.pin}
                onPress={() => {
                  const a = { ...f, id: 'a' + Date.now(), name: f.name || 'Delivery' };
                  dispatch({ type: 'ADDRESS', address: a });
                  setAddr(a.id);
                  setAdding(false);
                  setF({ name: '', line: '', city: '', state: '', pin: '', phone: '' });
                }}
              />
            </View>
          </View>
        )}

        {/* 2. ORDER SUMMARY */}
        <Text style={[ck.sec, { marginTop: 22 }]}>2 · Order Summary</Text>
        <View style={[ck.box, shadow]}>
          {cartLines.map((l) => (
            <View key={l.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ width: 46 }}><Thumb img={l.product.img} title={l.product.title} tint={l.product.tint} size={46} radius={10} /></View>
              <Text numberOfLines={1} style={{ flex: 1, marginLeft: 10, color: C.ink, fontSize: 13 }}>{l.product.title}</Text>
              <Text style={{ color: C.ink2, fontSize: 12, marginHorizontal: 8 }}>x{l.qty}</Text>
              <Text style={{ color: C.ink, fontWeight: '800', fontSize: 13 }}>{money(l.product.price * l.qty)}</Text>
            </View>
          ))}
        </View>

        {/* 3. COUPONS */}
        <Text style={[ck.sec, { marginTop: 22 }]}>3 · Promo Codes & Coupons</Text>
        <View style={[ck.box, shadow]}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Field
                placeholder="Enter Promo Coupon Code"
                autoCapitalize="characters"
                value={code}
                onChangeText={(v) => setCode(v.toUpperCase())}
              />
            </View>
            <Btn
              title="Apply"
              tone="brand"
              style={{ paddingHorizontal: 18, height: 48 }}
              onPress={() => dispatch({ type: 'COUPON', code })}
            />
          </View>
          {!!state.coupon && (
            <View style={[ck.couponOn, !coupon && { backgroundColor: C.redSoft }]}>
              <MC name={coupon ? 'check-circle' : 'close-circle'} size={15} color={coupon ? C.green : C.red} />
              <Text style={{ flex: 1, marginLeft: 7, color: coupon ? '#059669' : C.red, fontSize: 12.5, fontWeight: '700' }}>
                {coupon ? `${coupon.code} applied — Saved ${money(couponOff)}` : `"${state.coupon}" is not valid or does not meet minimum cart requirements`}
              </Text>
              <TouchableOpacity onPress={() => { dispatch({ type: 'COUPON', code: null }); setCode(''); }}>
                <Text style={{ color: C.ink2, fontWeight: '800', fontSize: 12 }}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeCoupons && activeCoupons.length > 0 && (
            <>
              <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '800', marginTop: 14, marginBottom: 8 }}>ACTIVE PROMO CODES</Text>
              {activeCoupons.map((c) => {
                const usable = subtotal >= (c.min || 0);
                return (
                  <TouchableOpacity
                    key={c.id || c.code}
                    disabled={!usable}
                    onPress={() => { setCode(c.code); dispatch({ type: 'COUPON', code: c.code }); }}
                    style={[ck.cpn, !usable && { opacity: 0.45 }, state.coupon === c.code && { borderColor: C.green, backgroundColor: C.greenSoft }]}
                  >
                    <View style={ck.cpnTag}><Text style={{ color: C.brand, fontWeight: '900', fontSize: 11 }}>{c.code}</Text></View>
                    <Text style={{ flex: 1, marginLeft: 10, color: C.ink2, fontSize: 12, lineHeight: 17 }}>{c.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </View>

        {/* 4. PAYMENT METHOD */}
        <Text style={[ck.sec, { marginTop: 22 }]}>4 · Payment — Direct to Seller</Text>

        <View style={ck.directBox}>
          <MC name="shield-check-outline" size={18} color={C.green} />
          <Text style={{ flex: 1, marginLeft: 10, color: '#059669', fontSize: 11.5, fontWeight: '700', lineHeight: 17 }}>
            Your payment goes DIRECTLY to the verified seller. Temsho does not hold your funds.
          </Text>
        </View>

        {sellerPays.map((sp) => (
          <View key={sp.key} style={[ck.sellerPay, shadow]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MC name="storefront-outline" size={17} color={C.brand} />
              <Text style={{ flex: 1, marginLeft: 9, color: C.ink, fontWeight: '800', fontSize: 13 }}>{sp.name}</Text>
              <Text style={{ color: C.ink, fontWeight: '900', fontSize: 14 }}>{money(sp.amount)}</Text>
            </View>
            {(pay === 'upi' || pay === 'qr') && (
              <>
                <View style={ck.upiRow}>
                  <MC name="cellphone-check" size={15} color={C.green} />
                  <Text style={{ flex: 1, marginLeft: 8, color: C.ink2, fontSize: 12 }}>
                    Seller UPI: <Text style={{ fontWeight: '800', color: C.ink }}>{sp.upi}</Text>
                  </Text>
                </View>
                {pay === 'upi' && (
                  <PayNowBtn upi={sp.upi} name={sp.name} amount={sp.amount} note={'Temsho Order'} />
                )}
                {pay === 'qr' && (
                  <View style={{ marginTop: 14 }}>
                    <UpiQR upi={sp.upi} name={sp.name} amount={sp.amount} note={'Temsho Order'} size={150} />
                  </View>
                )}
              </>
            )}
            {pay === 'cod' && (
              <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 8 }}>
                Pay {money(sp.amount)} in cash upon delivery
              </Text>
            )}
          </View>
        ))}

        {PAY.map((m) => (
          <TouchableOpacity key={m.id} onPress={() => setPay(m.id)} style={[ck.opt, pay === m.id && ck.optOn]}>
            <Radio on={pay === m.id} />
            <MC name={m.icon} size={19} color={C.ink2} style={{ marginLeft: 12 }} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ fontWeight: '700', color: C.ink, fontSize: 13.5 }}>{m.name}</Text>
              <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 2 }}>{m.sub}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ marginTop: 18 }}>
          <Bill
            subtotal={subtotal}
            saved={saved}
            delivery={delivery}
            total={total}
            couponOff={couponOff}
            couponCode={coupon?.code}
          />
        </View>

        <View style={ck.human}>
          <MC name="account-check-outline" size={17} color={C.green} />
          <Text style={{ flex: 1, marginLeft: 10, color: C.ink2, fontSize: 11.5, lineHeight: 17 }}>
            Every order is verified and dispatched by real humans. Dedicated human support is available 24x7.
          </Text>
        </View>
      </ScrollView>

      <View style={sx.bottomBar}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.ink3, fontSize: 11 }}>Payable Amount</Text>
          <Text style={{ color: C.ink, fontWeight: '900', fontSize: 19 }}>{money(total)}</Text>
        </View>
        <Btn title="Place Order" tone="green" style={{ flex: 1.3 }} onPress={place} />
      </View>
    </View>
  );
}

export function Success({ go, params }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <View style={ck.tick}><MC name="check-bold" size={44} color={C.green} /></View>
      <Text style={{ fontSize: 22, fontWeight: '900', color: C.ink, marginTop: 18 }}>Order Confirmed!</Text>
      <Text style={{ color: C.ink2, fontSize: 13.5, textAlign: 'center', marginTop: 6, lineHeight: 20 }}>
        Order ID: <Text style={{ fontWeight: '800', color: C.ink }}>#{params?.id}</Text>{'\n'}
        Estimated Delivery: <Text style={{ fontWeight: '800', color: C.green }}>{params?.eta}</Text>
      </Text>

      {/* Doorstep Delivery OTP Card */}
      <View style={ck.otpHighlight}>
        <MC name="shield-key" size={24} color={C.brand} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ color: C.brandNavy, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>Doorstep Delivery OTP</Text>
          <Text style={{ color: C.brand, fontSize: 26, fontWeight: '900', letterSpacing: 4, marginTop: 2 }}>
            {params?.otp || '5921'}
          </Text>
          <Text style={{ color: C.ink3, fontSize: 11, marginTop: 3 }}>
            Share this 4-digit code with the delivery partner when they arrive.
          </Text>
        </View>
      </View>

      <Btn title="View My Orders" tone="brand" style={{ alignSelf: 'stretch', marginTop: 20 }} onPress={() => go('orders')} />
      <Btn title="Continue Shopping" tone="ghost" style={{ alignSelf: 'stretch', marginTop: 8 }} onPress={() => go('home')} />
    </View>
  );
}

export function Orders({ go }) {
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState('all');
  const [retFor, setRetFor] = useState(null);

  const REASONS = ['Item damaged during transit', 'Wrong product delivered', 'Size does not fit', 'Quality did not match description', 'No longer required'];
  const steps = ['Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

  const list = state.orders.filter((o) =>
    tab === 'all' ? true :
    tab === 'active' ? !['Delivered', 'Cancelled', 'Return Requested'].includes(o.status) :
    tab === 'done' ? o.status === 'Delivered' :
    ['Cancelled', 'Return Requested'].includes(o.status)
  );

  if (state.orders.length === 0)
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <Header title="My Orders" go={go} />
        <Empty icon="package-variant" title="No Orders Yet" sub="Your past and current orders will be listed here.">
          <Btn title="Start Shopping" onPress={() => go('home')} />
        </Empty>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="My Orders" go={go} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 50, flexGrow: 0, backgroundColor: C.surface }} contentContainerStyle={{ paddingHorizontal: 12, alignItems: 'center' }}>
        {[['all', 'All Orders'], ['active', 'In Transit'], ['done', 'Delivered'], ['other', 'Cancelled / Returns']].map(([k, l]) => (
          <TouchableOpacity key={k} onPress={() => setTab(k)} style={[ck.tab, tab === k && { borderBottomColor: C.brand }]}>
            <Text style={{ color: tab === k ? C.brand : C.ink3, fontWeight: tab === k ? '800' : '600', fontSize: 13 }}>{l}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {list.length === 0 && (
          <Text style={{ color: C.ink3, textAlign: 'center', marginTop: 40, fontSize: 13 }}>No orders found under this filter.</Text>
        )}
        {list.map((o) => {
          const si = steps.indexOf(o.status);
          const bad = ['Cancelled', 'Return Requested'].includes(o.status);
          const isDone = o.status === 'Delivered';
          const firstItem = o.items[0];
          const otp = o.deliveryOtp || '5821';

          return (
            <View key={o.id} style={[ck.box, shadow, { marginBottom: 14 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontWeight: '900', color: C.ink, fontSize: 13.5 }}>#{o.id}</Text>
                <View style={{ flex: 1 }} />
                <Badge text={o.status} tone={o.status === 'Cancelled' ? 'red' : o.status === 'Return Requested' ? 'accent' : o.status === 'Delivered' ? 'green' : 'brand'} />
              </View>
              <Text style={{ color: C.ink3, fontSize: 11, marginBottom: 12 }}>
                Placed on {new Date(o.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>

              {o.items.map((it) => (
                <TouchableOpacity key={it.id} onPress={() => go('product', { id: it.id })} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <View style={{ width: 46 }}><Thumb img={it.img} title={it.title} tint={it.tint} size={46} radius={10} /></View>
                  <Text numberOfLines={2} style={{ flex: 1, marginLeft: 10, color: C.ink, fontSize: 13 }}>{it.title}</Text>
                  <Text style={{ color: C.ink2, fontSize: 12 }}>x{it.qty}</Text>
                </TouchableOpacity>
              ))}

              {/* Progress Steps */}
              {!bad && (
                <View style={{ flexDirection: 'row', marginTop: 6, marginBottom: 8 }}>
                  {steps.map((st2, i) => (
                    <View key={st2} style={{ flex: 1, alignItems: 'center', paddingHorizontal: 1 }}>
                      <View style={{ height: 4, alignSelf: 'stretch', backgroundColor: i <= si ? C.green : C.line, borderRadius: 2 }} />
                      <Text numberOfLines={1} style={{ fontSize: 8.5, color: i <= si ? C.green : C.ink3, fontWeight: '700', marginTop: 5 }}>{st2}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* DOORSTEP DELIVERY OTP BANNER */}
              {!bad && !isDone && (
                <View style={ck.otpBanner}>
                  <MC name="shield-key" size={20} color={C.brand} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ color: C.ink, fontSize: 11.5, fontWeight: '800' }}>
                      Doorstep Delivery OTP: <Text style={{ color: C.brand, fontSize: 16, fontWeight: '900', letterSpacing: 2 }}>{otp}</Text>
                    </Text>
                    <Text style={{ color: C.ink3, fontSize: 10.5, marginTop: 1 }}>
                      Share this 4-digit OTP with the delivery partner upon parcel arrival.
                    </Text>
                  </View>
                </View>
              )}

              {/* Delivery Agent Confirmation info */}
              {isDone && o.deliveredBy && (
                <View style={ck.deliveredByBox}>
                  <MC name="check-decagram" size={16} color={C.green} />
                  <Text style={{ color: '#059669', fontSize: 11.5, fontWeight: '700', marginLeft: 6 }}>
                    Verified Delivery by {o.deliveredBy}
                  </Text>
                </View>
              )}

              {/* Shipment info */}
              {o.shipment && (
                <View style={ck.awbBox}>
                  <MC name="truck-fast" size={17} color={C.brand} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={{ color: C.ink, fontWeight: '800', fontSize: 12 }}>
                      {o.shipment.courier} · AWB: {o.shipment.awb}
                    </Text>
                    <Text style={{ color: C.ink3, fontSize: 10.5, marginTop: 1 }}>
                      Scheduled Pickup: {o.shipment.pickupScheduled}
                    </Text>
                  </View>
                </View>
              )}

              {o.returnReason && (
                <Text style={{ color: C.ink2, fontSize: 11.5, marginTop: 8, fontStyle: 'italic' }}>Reason: {o.returnReason}</Text>
              )}

              <View style={{ height: 1, backgroundColor: C.line, marginVertical: 10 }} />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.ink2, fontSize: 12 }}>
                    {o.status === 'Delivered' ? 'Delivered on' : 'Estimated Delivery'}: <Text style={{ fontWeight: '800', color: C.ink }}>{o.eta}</Text>
                  </Text>
                  <Text style={{ color: C.ink3, fontSize: 11, marginTop: 2 }}>
                    {o.pay === 'cod' ? 'Cash on Delivery' : 'Paid Online'}{o.coupon ? ` · Coupon ${o.coupon}` : ''}
                  </Text>
                </View>
                <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16 }}>{money(o.total)}</Text>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {!bad && o.status !== 'Delivered' && (
                  <Btn title="Cancel Order" tone="outline" style={{ flex: 1, minWidth: 120 }} onPress={() => dispatch({ type: 'CANCEL_ORDER', id: o.id })} />
                )}
                {o.status === 'Delivered' && (
                  <>
                    <Btn title="Request Return" tone="outline" style={{ flex: 1, minWidth: 130 }} onPress={() => setRetFor(retFor === o.id ? null : o.id)} />
                    <Btn title="Buy Again" tone="ghost" style={{ flex: 1, minWidth: 130 }} onPress={() => { o.items.forEach((it) => dispatch({ type: 'ADD_CART', id: it.id })); go('cart'); }} />
                  </>
                )}
                <Btn
                  title="Contact Seller"
                  icon="whatsapp"
                  tone="green"
                  style={{ flex: 1, minWidth: 130 }}
                  onPress={() => {
                    const waUrl = getWhatsAppConnectUrl('9044468663', o.id, firstItem?.title);
                    Linking.openURL(waUrl).catch(() => {});
                  }}
                />
                <Btn title="Human Support" icon="headset" tone="ghost" style={{ flex: 1, minWidth: 120 }} onPress={() => go('support')} />
              </View>

              {retFor === o.id && (
                <View style={ck.retBox}>
                  <Text style={{ fontWeight: '800', color: C.ink, fontSize: 13, marginBottom: 8 }}>Select Return Reason</Text>
                  {REASONS.map((r) => (
                    <TouchableOpacity key={r} onPress={() => { dispatch({ type: 'RETURN_ORDER', id: o.id, reason: r }); setRetFor(null); }} style={ck.retOpt}>
                      <Text style={{ color: C.ink2, fontSize: 12.5 }}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                  <Text style={{ color: C.ink3, fontSize: 10.5, marginTop: 6, lineHeight: 15 }}>
                    Free doorstep pickup within 7 days.
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const sx = StyleSheet.create({
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.line,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
  },
});

const ck = StyleSheet.create({
  sec: { fontSize: 13, fontWeight: '900', color: C.ink3, letterSpacing: 0.6, marginBottom: 10, textTransform: 'uppercase' },
  opt: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: R.md,
    padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: C.line,
  },
  optOn: { borderColor: C.brand, backgroundColor: C.brandSoft },
  delCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, borderRadius: R.md,
    padding: 12, marginBottom: 8, borderWidth: 1.5, borderColor: C.line,
  },
  delCardOn: { borderColor: C.brand, backgroundColor: C.brandSoft },
  delIco: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  estBadge: { backgroundColor: C.brandSoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  addBtn: { paddingVertical: 12, alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#C7D2FE', borderRadius: R.md },
  form: { backgroundColor: C.surface, borderRadius: R.lg, padding: 16, marginTop: 12 },
  box: { backgroundColor: C.surface, borderRadius: R.lg, padding: 14 },
  directBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.greenSoft, borderRadius: R.md, padding: 12, marginBottom: 12 },
  sellerPay: { backgroundColor: C.bg, borderRadius: R.md, padding: 12, marginBottom: 10 },
  upiRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.greenSoft, borderRadius: R.sm, padding: 8, marginTop: 8 },
  human: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.greenSoft, borderRadius: R.md, padding: 12, marginTop: 14 },
  tick: { width: 100, height: 100, borderRadius: 50, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center' },
  couponOn: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.greenSoft, borderRadius: R.sm, padding: 10, marginTop: 2, marginBottom: 4 },
  cpn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: C.line, borderStyle: 'dashed', borderRadius: R.sm, padding: 10, marginBottom: 8 },
  cpnTag: { backgroundColor: C.brandSoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  tab: { paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 2.5, borderBottomColor: 'transparent' },
  retBox: { backgroundColor: C.bg, borderRadius: R.md, padding: 12, marginTop: 12 },
  retOpt: { backgroundColor: C.surface, borderRadius: R.sm, padding: 10, marginBottom: 6, borderWidth: 1, borderColor: C.line },
  humanCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: R.lg, padding: 14, marginTop: 22 },
  awbBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.brandSoft, borderRadius: R.sm, padding: 9, marginTop: 10 },
  otpHighlight: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.brandSoft, borderRadius: R.lg, padding: 14, marginTop: 16, width: '100%', borderWidth: 1.5, borderColor: '#C7D2FE' },
  otpBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.brandSoft, borderRadius: R.md, padding: 10, marginVertical: 8, borderWidth: 1, borderColor: '#C7D2FE' },
  printSlipBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.brand,
    borderRadius: R.lg, padding: 14, marginTop: 14, width: '100%',
  },
  qrSmallBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 6, borderRadius: R.sm, borderWidth: 1, borderColor: C.brand },
  deliveredByBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.greenSoft, borderRadius: R.sm, padding: 8, marginVertical: 6 },
  qrModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  qrModalCard: { backgroundColor: C.surface, borderRadius: R.xl, padding: 20, alignItems: 'center', width: '100%', maxWidth: 360 },
  qrCodeContainer: { backgroundColor: '#fff', padding: 12, borderRadius: R.md, borderWidth: 1, borderColor: C.line, marginVertical: 8 },
  qrOtpBox: { backgroundColor: C.brandSoft, paddingVertical: 10, paddingHorizontal: 18, borderRadius: R.md, alignItems: 'center', marginTop: 10, width: '100%' },
});
