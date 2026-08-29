import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { C, R, shadow, money } from '../theme';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import { Btn, Badge, Empty, Thumb, Field } from '../components/UI';
import { Header, Bill, sx } from './Product';
import { useApp, COUPONS } from '../store';
import { SELLERS } from '../data/catalog';
import { UpiQR, PayNowBtn } from '../components/Upi';
import { DELIVERY_MODES, checkPincodeServiceability, getWhatsAppConnectUrl } from '../lib/shiprocket';
import * as cloud from '../lib/cloud';

const PAY = [
  { id: 'cod', name: 'Cash on Delivery', sub: 'Saman milne par seller ko nakad dein', icon: 'cash' },
  { id: 'upi', name: 'UPI — seedha seller ko', sub: 'GPay / PhonePe / Paytm se seller ke UPI par', icon: 'cellphone-check' },
  { id: 'qr', name: 'Seller ka QR scan karein', sub: 'Apne UPI app se QR scan kijiye', icon: 'qrcode-scan' },
  { id: 'card', name: 'Card / Net Banking', sub: 'Visa, RuPay, Mastercard, 50+ banks', icon: 'credit-card-outline' },
];

const Radio = ({ on }) => (
  <MC name={on ? 'radiobox-marked' : 'radiobox-blank'} size={19} color={on ? C.brand : C.ink3} />
);

export function Checkout({ go }) {
  const { state, cartLines, subtotal, saved, delivery, total, dispatch, coupon, couponOff } = useApp();
  const [addr, setAddr] = useState(state.addresses[0]?.id);
  const [pay, setPay] = useState('cod');
  const [delMode, setDelMode] = useState(state.deliveryMode || 'standard');
  const [useWallet, setUseWallet] = useState(false);
  const [code, setCode] = useState('');
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ name: '', line: '', city: '', state: '', pin: '', phone: '' });

  const activeAddress = state.addresses.find((x) => x.id === addr) || state.addresses[0];
  const pinInfo = checkPincodeServiceability(activeAddress?.pin || '226010');

  if (cartLines.length === 0)
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <Header title="Checkout" go={go} />
        <Empty icon="cart-outline" title="Cart khali hai" sub="Pehle kuch add karein.">
          <Btn title="Home jayein" onPress={() => go('home')} />
        </Empty>
      </View>
    );

  const walletUsed = useWallet ? Math.min(state.wallet, total) : 0;
  const payable = total - walletUsed;

  // har seller ka apna hissa — paisa seedha unhe
  const sellerPays = Object.values(
    cartLines.reduce((acc, l) => {
      const isMine = l.product.seller === 'me';
      const key = l.product.seller;
      const info = isMine
        ? { name: state.shop.name || 'Meri dukaan', upi: state.shop.upi || 'set nahi' }
        : { name: SELLERS[key]?.name || 'Seller', upi: (SELLERS[key]?.name || 'seller').split(' ')[0].toLowerCase() + '@upi' };
      if (!acc[key]) acc[key] = { key, ...info, amount: 0 };
      acc[key].amount += l.product.price * l.qty;
      return acc;
    }, {})
  );

  const place = async () => {
    const a = activeAddress;
    const estDays = delMode === 'local' ? 1 : delMode === 'indiapost' ? 5 : pinInfo.estimatedDays || 3;
    const etaFormatted = new Date(Date.now() + estDays * 86400000).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });

    const orderId = 'TM' + Math.floor(100000 + Math.random() * 900000);
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
      total: payable,
      pay,
      address: a,
      status: 'Confirmed',
      coupon: coupon?.code || null,
      walletUsed,
      deliveryMode: delMode,
      eta: etaFormatted,
      pincode: a?.pin || '226010',
    };

    dispatch({ type: 'PLACE_ORDER', order });

    // Cloud push if connected
    if (cloud.cloudOn()) {
      cloud.pushOrder(order, state.user?.cloudId || null).catch(() => {});
    }

    go('success', { id: order.id, eta: order.eta });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Checkout" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 130 }}>
        {/* 1. DELIVERY ADDRESS */}
        <Text style={ck.sec}>1 · Delivery address</Text>
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
            <Text style={{ color: C.brand, fontWeight: '800', fontSize: 13, marginLeft: 5 }}>Naya address add karein</Text>
          </TouchableOpacity>
        ) : (
          <View style={[ck.form, shadow]}>
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
              <Btn title="Cancel" tone="ghost" style={{ flex: 1 }} onPress={() => setAdding(false)} />
              <Btn
                title="Save"
                style={{ flex: 1 }}
                disabled={!f.line || !f.city || !f.pin}
                onPress={() => {
                  const a = { ...f, id: 'a' + Date.now(), name: f.name || 'Naya' };
                  dispatch({ type: 'ADDRESS', address: a });
                  setAddr(a.id);
                  setAdding(false);
                  setF({ name: '', line: '', city: '', state: '', pin: '', phone: '' });
                }}
              />
            </View>
          </View>
        )}

        {/* 2. DELIVERY & LOGISTICS METHOD */}
        <Text style={[ck.sec, { marginTop: 22 }]}>2 · Delivery ka Tareeka</Text>
        <View style={[ck.box, shadow, { marginBottom: 12 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <MC name="map-marker-check" size={18} color={C.green} />
            <Text style={{ flex: 1, marginLeft: 8, color: C.ink, fontWeight: '800', fontSize: 13 }}>
              PIN {activeAddress?.pin || '226010'} · {pinInfo.city}, {pinInfo.state}
            </Text>
            <Badge text="Serviceable" tone="green" small />
          </View>

          {DELIVERY_MODES.map((dm) => {
            const isSel = delMode === dm.id;
            return (
              <TouchableOpacity
                key={dm.id}
                onPress={() => {
                  setDelMode(dm.id);
                  dispatch({ type: 'SET_DELIVERY_MODE', mode: dm.id });
                }}
                style={[ck.delCard, isSel && ck.delCardOn]}
              >
                <Radio on={isSel} />
                <View style={[ck.delIco, { backgroundColor: isSel ? C.brand : C.brandSoft }]}>
                  <MC name={dm.icon} size={20} color={isSel ? '#fff' : C.brand} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontWeight: '800', color: C.ink, fontSize: 13.5 }}>{dm.title}</Text>
                    <View style={ck.estBadge}><Text style={{ color: C.brand, fontSize: 10, fontWeight: '800' }}>{dm.days}</Text></View>
                  </View>
                  <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 2 }}>{dm.tagline}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 3. ORDER SUMMARY */}
        <Text style={[ck.sec, { marginTop: 14 }]}>3 · Order summary</Text>
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

        {/* 4. COUPON & WALLET */}
        <Text style={[ck.sec, { marginTop: 22 }]}>4 · Coupon aur Wallet</Text>
        <View style={[ck.box, shadow]}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Field
                placeholder="Coupon code daalein"
                autoCapitalize="characters"
                value={code}
                onChangeText={(v) => setCode(v.toUpperCase())}
              />
            </View>
            <Btn
              title="Lagayein"
              tone="brand"
              style={{ paddingHorizontal: 18, height: 48 }}
              onPress={() => dispatch({ type: 'COUPON', code })}
            />
          </View>
          {!!state.coupon && (
            <View style={[ck.couponOn, !coupon && { backgroundColor: C.redSoft }]}>
              <MC name={coupon ? 'check-circle' : 'close-circle'} size={15} color={coupon ? C.green : C.red} />
              <Text style={{ flex: 1, marginLeft: 7, color: coupon ? '#0F7A4A' : C.red, fontSize: 12.5, fontWeight: '700' }}>
                {coupon ? `${coupon.code} laga — ${money(couponOff)} bachaye` : `${state.coupon} is order par nahi lagega`}
              </Text>
              <TouchableOpacity onPress={() => { dispatch({ type: 'COUPON', code: null }); setCode(''); }}>
                <Text style={{ color: C.ink2, fontWeight: '800', fontSize: 12 }}>Hatayein</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '800', marginTop: 14, marginBottom: 8 }}>UPLABDH OFFERS</Text>
          {COUPONS.map((c) => {
            const usable = subtotal >= c.min;
            return (
              <TouchableOpacity
                key={c.code}
                disabled={!usable}
                onPress={() => { setCode(c.code); dispatch({ type: 'COUPON', code: c.code }); }}
                style={[ck.cpn, !usable && { opacity: 0.45 }, state.coupon === c.code && { borderColor: C.green, backgroundColor: C.greenSoft }]}
              >
                <View style={ck.cpnTag}><Text style={{ color: C.brand, fontWeight: '900', fontSize: 11 }}>{c.code}</Text></View>
                <Text style={{ flex: 1, marginLeft: 10, color: C.ink2, fontSize: 12, lineHeight: 17 }}>{c.desc}</Text>
              </TouchableOpacity>
            );
          })}

          {state.wallet > 0 && (
            <TouchableOpacity onPress={() => setUseWallet(!useWallet)} style={[ck.wallet, useWallet && { borderColor: C.green, backgroundColor: C.greenSoft }]}>
              <MC name={useWallet ? 'checkbox-marked' : 'checkbox-blank-outline'} size={19} color={useWallet ? C.green : C.ink3} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ color: C.ink, fontWeight: '800', fontSize: 13 }}>Temsho Wallet use karein</Text>
                <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 2 }}>Balance {money(state.wallet)}</Text>
              </View>
              {useWallet && <Text style={{ color: C.green, fontWeight: '900', fontSize: 13 }}>− {money(walletUsed)}</Text>}
            </TouchableOpacity>
          )}
        </View>

        {/* 5. PAYMENT */}
        <Text style={[ck.sec, { marginTop: 22 }]}>5 · Payment — Seedha Seller ko</Text>

        <View style={ck.directBox}>
          <MC name="shield-check-outline" size={18} color={C.green} />
          <Text style={{ flex: 1, marginLeft: 10, color: '#0F7A4A', fontSize: 11.5, fontWeight: '700', lineHeight: 17 }}>
            Aapka paisa SEEDHA seller ko jaata hai. Temsho beech me paisa nahi rakhta.
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
                    UPI: <Text style={{ fontWeight: '800', color: C.ink }}>{sp.upi}</Text>
                  </Text>
                </View>
                {pay === 'upi' && (
                  <PayNowBtn upi={sp.upi} name={sp.name} amount={sp.amount} note={'Temsho'} />
                )}
                {pay === 'qr' && (
                  <View style={{ marginTop: 14 }}>
                    <UpiQR upi={sp.upi} name={sp.name} amount={sp.amount} note={'Temsho'} size={150} />
                  </View>
                )}
              </>
            )}
            {pay === 'cod' && (
              <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 8 }}>
                Delivery ke waqt {money(sp.amount)} nakad dein
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
            total={payable}
            couponOff={couponOff + walletUsed}
            couponCode={walletUsed ? 'coupon + wallet' : coupon?.code}
          />
        </View>

        <View style={ck.human}>
          <MC name="account-check-outline" size={17} color={C.green} />
          <Text style={{ flex: 1, marginLeft: 10, color: C.ink2, fontSize: 11.5, lineHeight: 17 }}>
            Har order ek verified insaan pack karta hai. Dikkat aayi to asli support agent se turant baat kar sakte hain.
          </Text>
        </View>
      </ScrollView>

      <View style={sx.bottomBar}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.ink3, fontSize: 11 }}>Dena hai</Text>
          <Text style={{ color: C.ink, fontWeight: '900', fontSize: 19 }}>{money(payable)}</Text>
        </View>
        <Btn title="Order place karein" tone="green" style={{ flex: 1.3 }} onPress={place} />
      </View>
    </View>
  );
}

export function Success({ go, params }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
      <View style={ck.tick}><MC name="check-bold" size={44} color={C.green} /></View>
      <Text style={{ fontSize: 22, fontWeight: '900', color: C.ink, marginTop: 20 }}>Order ho gaya!</Text>
      <Text style={{ color: C.ink2, fontSize: 13.5, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
        Order ID <Text style={{ fontWeight: '800', color: C.ink }}>{params?.id}</Text>{'\n'}
        Anumaanit delivery: <Text style={{ fontWeight: '800', color: C.green }}>{params?.eta}</Text>
      </Text>
      <View style={ck.humanCard}>
        <MC name="account-tie-outline" size={22} color={C.brand} />
        <Text style={{ flex: 1, marginLeft: 10, color: C.ink2, fontSize: 12, lineHeight: 18 }}>
          Seller ko aapka order mil gaya hai. Vo khud confirmation message ya call karenge — koi automated bot nahi.
        </Text>
      </View>
      <Btn title="Mere orders dekhein" style={{ alignSelf: 'stretch', marginTop: 24 }} onPress={() => go('orders')} />
      <Btn title="Aur shopping karein" tone="outline" style={{ alignSelf: 'stretch', marginTop: 10 }} onPress={() => go('home')} />
    </View>
  );
}

export function Orders({ go }) {
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState('all');
  const [retFor, setRetFor] = useState(null);

  const REASONS = ['Saman kharab mila', 'Galat item aaya', 'Size fit nahi hua', 'Quality expected se kam', 'Ab zarurat nahi'];
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
        <Header title="Mere Orders" go={go} />
        <Empty icon="package-variant" title="Abhi koi order nahi" sub="Aapke orders yahan dikhenge.">
          <Btn title="Shopping karein" onPress={() => go('home')} />
        </Empty>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Mere Orders" go={go} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 50, flexGrow: 0, backgroundColor: C.surface }} contentContainerStyle={{ paddingHorizontal: 12, alignItems: 'center' }}>
        {[['all', 'Sab'], ['active', 'Chal rahe'], ['done', 'Delivered'], ['other', 'Cancel / Return']].map(([k, l]) => (
          <TouchableOpacity key={k} onPress={() => setTab(k)} style={[ck.tab, tab === k && { borderBottomColor: C.brand }]}>
            <Text style={{ color: tab === k ? C.brand : C.ink3, fontWeight: tab === k ? '800' : '600', fontSize: 13 }}>{l}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {list.length === 0 && (
          <Text style={{ color: C.ink3, textAlign: 'center', marginTop: 40, fontSize: 13 }}>Is filter me koi order nahi.</Text>
        )}
        {list.map((o) => {
          const si = steps.indexOf(o.status);
          const bad = ['Cancelled', 'Return Requested'].includes(o.status);
          const firstItem = o.items[0];

          return (
            <View key={o.id} style={[ck.box, shadow, { marginBottom: 14 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontWeight: '900', color: C.ink, fontSize: 13.5 }}>#{o.id}</Text>
                <View style={{ flex: 1 }} />
                <Badge text={o.status} tone={o.status === 'Cancelled' ? 'red' : o.status === 'Return Requested' ? 'accent' : o.status === 'Delivered' ? 'green' : 'brand'} />
              </View>
              <Text style={{ color: C.ink3, fontSize: 11, marginBottom: 12 }}>
                {new Date(o.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                <View style={{ flexDirection: 'row', marginTop: 6, marginBottom: 4 }}>
                  {steps.map((st2, i) => (
                    <View key={st2} style={{ flex: 1, alignItems: 'center', paddingHorizontal: 1 }}>
                      <View style={{ height: 4, alignSelf: 'stretch', backgroundColor: i <= si ? C.green : C.line, borderRadius: 2 }} />
                      <Text numberOfLines={1} style={{ fontSize: 8.5, color: i <= si ? C.green : C.ink3, fontWeight: '700', marginTop: 5 }}>{st2}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Shipment / AWB info */}
              {o.shipment && (
                <View style={ck.awbBox}>
                  <MC name="truck-fast" size={17} color={C.brand} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={{ color: C.ink, fontWeight: '800', fontSize: 12 }}>
                      {o.shipment.courier} · AWB: {o.shipment.awb}
                    </Text>
                    <Text style={{ color: C.ink3, fontSize: 10.5, marginTop: 1 }}>
                      Pickup: {o.shipment.pickupScheduled}
                    </Text>
                  </View>
                </View>
              )}

              {o.returnReason && (
                <Text style={{ color: C.ink2, fontSize: 11.5, marginTop: 8, fontStyle: 'italic' }}>Wajah: {o.returnReason}</Text>
              )}

              <View style={{ height: 1, backgroundColor: C.line, marginVertical: 10 }} />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.ink2, fontSize: 12 }}>
                    {o.status === 'Delivered' ? 'Mil gaya' : 'Delivery'}: <Text style={{ fontWeight: '800', color: C.ink }}>{o.eta}</Text>
                  </Text>
                  <Text style={{ color: C.ink3, fontSize: 11, marginTop: 2 }}>
                    {o.pay === 'cod' ? 'Cash on Delivery' : 'Paid online'}{o.coupon ? ` · ${o.coupon}` : ''}
                  </Text>
                </View>
                <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16 }}>{money(o.total)}</Text>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {!bad && o.status !== 'Delivered' && (
                  <>
                    <Btn
                      title="Next Status"
                      icon="fast-forward"
                      tone="ghost"
                      style={{ flex: 1, minWidth: 110 }}
                      onPress={() => dispatch({ type: 'ADVANCE_ORDER', id: o.id })}
                    />
                    <Btn title="Cancel" tone="outline" style={{ flex: 0.7, minWidth: 90 }} onPress={() => dispatch({ type: 'CANCEL_ORDER', id: o.id })} />
                  </>
                )}
                {o.status === 'Delivered' && (
                  <>
                    <Btn title="Return / Refund" tone="outline" style={{ flex: 1, minWidth: 130 }} onPress={() => setRetFor(retFor === o.id ? null : o.id)} />
                    <Btn title="Dobara khareedein" tone="ghost" style={{ flex: 1, minWidth: 130 }} onPress={() => { o.items.forEach((it) => dispatch({ type: 'ADD_CART', id: it.id })); go('cart'); }} />
                  </>
                )}
                <Btn
                  title="WhatsApp Seller"
                  icon="whatsapp"
                  tone="green"
                  style={{ flex: 1, minWidth: 130 }}
                  onPress={() => {
                    const waUrl = getWhatsAppConnectUrl('9044468663', o.id, firstItem?.title);
                    Linking.openURL(waUrl).catch(() => {});
                  }}
                />
                <Btn title="Human Support" icon="headset" tone="ghost" style={{ flex: 1, minWidth: 130 }} onPress={() => go('support')} />
              </View>

              {retFor === o.id && (
                <View style={ck.retBox}>
                  <Text style={{ fontWeight: '800', color: C.ink, fontSize: 13, marginBottom: 8 }}>Return ki wajah chunein</Text>
                  {REASONS.map((r) => (
                    <TouchableOpacity key={r} onPress={() => { dispatch({ type: 'RETURN_ORDER', id: o.id, reason: r }); setRetFor(null); }} style={ck.retOpt}>
                      <Text style={{ color: C.ink2, fontSize: 12.5 }}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                  <Text style={{ color: C.ink3, fontSize: 10.5, marginTop: 6, lineHeight: 15 }}>
                    7 din ke andar free pickup. Paisa 3–5 din me wallet ya bank me.
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
  addBtn: { paddingVertical: 12, alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#C7CAEA', borderRadius: R.md },
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
  wallet: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: C.line, borderRadius: R.md, padding: 12, marginTop: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 2.5, borderBottomColor: 'transparent' },
  retBox: { backgroundColor: C.bg, borderRadius: R.md, padding: 12, marginTop: 12 },
  retOpt: { backgroundColor: C.surface, borderRadius: R.sm, padding: 10, marginBottom: 6, borderWidth: 1, borderColor: C.line },
  humanCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: R.lg, padding: 14, marginTop: 22 },
  awbBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.brandSoft, borderRadius: R.sm, padding: 9, marginTop: 10 },
});
