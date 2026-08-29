import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import { C, R, shadow } from '../theme';
import { Btn, Field, Badge, Avatar } from '../components/UI';
import { Header } from './Product';
import { useApp, LANGS } from '../store';

const Group = ({ title, sub, children }) => (
  <View style={{ marginTop: 22 }}>
    <Text style={se.gTitle}>{title}</Text>
    {!!sub && <Text style={se.gSub}>{sub}</Text>}
    <View style={[se.card, shadow]}>{children}</View>
  </View>
);

const Row = ({ icon, label, value, onPress, last, danger }) => (
  <TouchableOpacity disabled={!onPress} onPress={onPress} style={[se.row, last && { borderBottomWidth: 0 }]}>
    <MC name={icon} size={19} color={danger ? C.red : C.ink2} />
    <Text style={{ flex: 1, marginLeft: 14, color: danger ? C.red : C.ink, fontWeight: '600', fontSize: 14 }}>{label}</Text>
    {value != null && <Text numberOfLines={1} style={{ color: C.ink3, fontSize: 12.5, maxWidth: 130 }}>{value}</Text>}
    {!!onPress && <MC name="chevron-right" size={18} color={C.ink3} style={{ marginLeft: 6 }} />}
  </TouchableOpacity>
);

const Toggle = ({ icon, label, sub, on, onChange, last }) => (
  <View style={[se.row, last && { borderBottomWidth: 0 }]}>
    <MC name={icon} size={19} color={C.ink2} />
    <View style={{ flex: 1, marginLeft: 14 }}>
      <Text style={{ color: C.ink, fontWeight: '600', fontSize: 14 }}>{label}</Text>
      {!!sub && <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 2 }}>{sub}</Text>}
    </View>
    <Switch value={on} onValueChange={onChange} trackColor={{ true: C.brand, false: '#D6D9E4' }} thumbColor="#fff" />
  </View>
);

/* ---------------- Settings home ---------------- */
export function Settings({ go }) {
  const { state, dispatch, isOwner } = useApp();
  const u = state.user;
  const st = state.settings;
  const [confirmDel, setConfirmDel] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Settings" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => go('edit-profile')} style={[se.profile, shadow]}>
          <Avatar name={u?.name || 'A'} hue={C.brand} size={54} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16 }}>{u?.name}</Text>
            <Text style={{ color: C.ink3, fontSize: 12.5, marginTop: 2 }}>+91 {u?.phone}</Text>
            <Text style={{ color: C.brand, fontSize: 12, fontWeight: '800', marginTop: 6 }}>Profile edit karein</Text>
          </View>
          <MC name="chevron-right" size={20} color={C.ink3} />
        </TouchableOpacity>

        {isOwner && (
          <Group title="OWNER ACCESS (9044468663)">
            <Row icon="crown-outline" label="Admin Panel" value="App control" onPress={() => go('admin')} />
            <Row icon="cellphone-key" label="OTP Provider Setting" value={state.admin?.otpProvider || 'Supabase'} onPress={() => go('admin-otp')} />
            <Row icon="truck-delivery-outline" label="Shiprocket & Logistics" value="Courier Setup" onPress={() => go('admin-logistics')} last />
          </Group>
        )}

        <Group title="KHAATA" sub="Apni jaankari khud bhariye — koi document nahi maanga jaata">
          <Row icon="account-edit-outline" label="Naam, email, gender, DOB" onPress={() => go('edit-profile')} />
          <Row icon="map-marker-outline" label="Location aur addresses" value={u?.city || 'Set karein'} onPress={() => go('edit-location')} />
          <Row icon="cellphone-check" label="Mobile number" value={'+91 ' + (u?.phone || '')} onPress={() => go('change-phone')} last />
        </Group>

        <Group title="DUKAAN (SELLER)">
          {u?.isSeller ? (
            <>
              <Row icon="storefront-outline" label="Dukaan ki profile" value={state.shop.name || '—'} onPress={() => go('shop-settings')} />
              <Row icon="truck-outline" label="Pickup aur delivery" value={state.shop.pin || 'Set karein'} onPress={() => go('shop-settings')} />
              <Row icon="bank-outline" label="Payout — UPI ID" value={state.shop.upi || 'Add karein'} onPress={() => go('shop-settings')} last />
            </>
          ) : (
            <Row icon="storefront-plus-outline" label="Seller banein — apni dukaan kholein" onPress={() => go('become-seller')} last />
          )}
        </Group>

        <Group title="BHASHA">
          <Row icon="translate" label="App ki bhasha" value={st.lang} onPress={() => go('language')} last />
        </Group>

        <Group title="NOTIFICATIONS">
          <Toggle icon="package-variant" label="Order updates" sub="Packed, shipped, delivered"
            on={st.notifOrders} onChange={(v) => dispatch({ type: 'UPDATE_SETTINGS', patch: { notifOrders: v } })} />
          <Toggle icon="tag-outline" label="Offers aur deals" sub="Sale, coupon, price drop"
            on={st.notifOffers} onChange={(v) => dispatch({ type: 'UPDATE_SETTINGS', patch: { notifOffers: v } })} />
          <Toggle icon="whatsapp" label="WhatsApp par update" sub="Order ki jaankari WhatsApp par"
            on={st.notifWhatsapp} onChange={(v) => dispatch({ type: 'UPDATE_SETTINGS', patch: { notifWhatsapp: v } })} last />
        </Group>

        <Group title="PAYMENT">
          <Row icon="wallet-outline" label="Default payment" value={st.defaultPay === 'cod' ? 'Cash on Delivery' : st.defaultPay.toUpperCase()} onPress={() => go('payment-settings')} />
          <Row icon="cellphone" label="Saved UPI ID" value={st.upiId || 'Add karein'} onPress={() => go('payment-settings')} last />
        </Group>

        <Group title="PRIVACY & LEGAL (DPDP 2023)">
          <Toggle icon="history" label="Search history save karein" sub="Band karne par kuch save nahi hoga"
            on={st.saveHistory} onChange={(v) => dispatch({ type: 'UPDATE_SETTINGS', patch: { saveHistory: v } })} />
          <Row icon="shield-check-outline" label="Human-Only Policy" onPress={() => go('policy')} />
          <Row icon="file-document-outline" label="Privacy Policy & Terms" onPress={() => go('privacy-policy')} />
          <Row icon="headset" label="Insaan se baat karein" onPress={() => go('support')} last />
        </Group>

        <Group title="KHAATA BAND KAREIN">
          <Row icon="logout" label="Log out" danger onPress={() => dispatch({ type: 'LOGOUT' })} />
          <Row icon="delete-outline" label="Account delete karein" danger onPress={() => setConfirmDel(true)} last />
        </Group>

        {confirmDel && (
          <View style={[se.card, shadow, { marginTop: 12, padding: 16, borderWidth: 1.5, borderColor: C.red }]}>
            <Text style={{ color: C.ink, fontWeight: '800', fontSize: 14 }}>Pakka delete karna hai?</Text>
            <Text style={{ color: C.ink2, fontSize: 12.5, lineHeight: 19, marginTop: 6 }}>
              Aapka khaata, orders, wallet aur dukaan — sab hamesha ke liye mit jayega. Ye wapas nahi aayega.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <Btn title="Rehne dein" tone="ghost" style={{ flex: 1 }} onPress={() => setConfirmDel(false)} />
              <Btn title="Delete" tone="brand" style={{ flex: 1, backgroundColor: C.red }} onPress={() => dispatch({ type: 'DELETE_ACCOUNT' })} />
            </View>
          </View>
        )}

        <Text style={{ textAlign: 'center', color: C.ink3, fontSize: 11, marginTop: 26, lineHeight: 17 }}>
          Temsho v1.0.0{'\n'}Made in India · By humans, for humans
        </Text>
      </ScrollView>
    </View>
  );
}

/* ---------------- Edit profile ---------------- */
export function EditProfile({ go }) {
  const { state, dispatch } = useApp();
  const u = state.user;
  const [f, setF] = useState({
    name: u?.name || '', email: u?.email || '', gender: u?.gender || '',
    dob: u?.dob || '', alt: u?.alt || '',
  });
  const [done, setDone] = useState(false);

  const save = () => {
    dispatch({ type: 'UPDATE_USER', patch: f });
    setDone(true);
    setTimeout(() => go(-1), 700);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Profile edit karein" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        <View style={se.note}>
          <MC name="information-outline" size={16} color={C.brand} />
          <Text style={{ flex: 1, marginLeft: 9, color: C.ink2, fontSize: 11.5, lineHeight: 17 }}>
            Sab kuch aap khud bharte hain. Koi Aadhaar, PAN ya document upload nahi karna.
          </Text>
        </View>

        <View style={[se.card, shadow, { padding: 18, marginTop: 14 }]}>
          <Field label="Poora naam" placeholder="Jaise: Aman Verma" value={f.name} onChangeText={(v) => setF({ ...f, name: v })} />
          <Field label="Email (optional)" placeholder="aap@email.com" keyboardType="email-address" autoCapitalize="none" value={f.email} onChangeText={(v) => setF({ ...f, email: v })} />

          <Text style={se.lbl}>Gender (optional)</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {['Purush', 'Mahila', 'Anya'].map((g) => (
              <TouchableOpacity key={g} onPress={() => setF({ ...f, gender: f.gender === g ? '' : g })}
                style={[se.chip, f.gender === g && { backgroundColor: C.brand, borderColor: C.brand }]}>
                <Text style={{ color: f.gender === g ? '#fff' : C.ink2, fontSize: 13, fontWeight: '600' }}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Field label="Janam tarikh (optional)" placeholder="DD/MM/YYYY" value={f.dob} onChangeText={(v) => setF({ ...f, dob: v })} />
          <Field label="Doosra mobile number (optional)" placeholder="10 digit" keyboardType="number-pad" value={f.alt} onChangeText={(v) => setF({ ...f, alt: v.replace(/\D/g, '').slice(0, 10) })} />

          <View style={se.locked}>
            <MC name="lock-outline" size={15} color={C.ink3} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ color: C.ink2, fontSize: 12.5, fontWeight: '700' }}>+91 {u?.phone}</Text>
              <Text style={{ color: C.ink3, fontSize: 11, marginTop: 2 }}>Login number — badalne ke liye OTP lagega</Text>
            </View>
            <TouchableOpacity onPress={() => go('change-phone')}>
              <Text style={{ color: C.brand, fontWeight: '800', fontSize: 12 }}>Badlein</Text>
            </TouchableOpacity>
          </View>

          <Btn title={done ? 'Save ho gaya' : 'Save karein'} icon={done ? 'check' : 'content-save-outline'} tone={done ? 'green' : 'brand'} style={{ marginTop: 18 }} onPress={save} />
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------------- Location ---------------- */
export function EditLocation({ go }) {
  const { state, dispatch } = useApp();
  const u = state.user;
  const [f, setF] = useState({ city: u?.city || '', st: u?.st || '', pin: u?.pin || '' });
  const [done, setDone] = useState(false);

  const STATES = ['Uttar Pradesh', 'Delhi', 'Maharashtra', 'Bihar', 'Rajasthan', 'Madhya Pradesh', 'West Bengal', 'Tamil Nadu', 'Karnataka', 'Gujarat', 'Punjab', 'Kerala'];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Location" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        <View style={[se.card, shadow, { padding: 18 }]}>
          <Text style={{ color: C.ink, fontWeight: '800', fontSize: 15 }}>Aapka default ilaka</Text>
          <Text style={{ color: C.ink2, fontSize: 12.5, lineHeight: 19, marginTop: 5, marginBottom: 16 }}>
            Isse hum delivery time aur aas-paas ke sellers dikhate hain.
          </Text>

          <Field label="Sheher / gaon" placeholder="Jaise: Lucknow" value={f.city} onChangeText={(v) => setF({ ...f, city: v })} />
          <Text style={se.lbl}>Rajya</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {STATES.map((x) => (
              <TouchableOpacity key={x} onPress={() => setF({ ...f, st: x })}
                style={[se.chip, f.st === x && { backgroundColor: C.brand, borderColor: C.brand }]}>
                <Text style={{ color: f.st === x ? '#fff' : C.ink2, fontSize: 12, fontWeight: '600' }}>{x}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Field label="PIN code" placeholder="226010" keyboardType="number-pad" value={f.pin} onChangeText={(v) => setF({ ...f, pin: v.replace(/\D/g, '').slice(0, 6) })} />

          <Btn title={done ? 'Save ho gaya' : 'Save karein'} icon={done ? 'check' : 'content-save-outline'} tone={done ? 'green' : 'brand'}
            onPress={() => { dispatch({ type: 'UPDATE_USER', patch: f }); setDone(true); setTimeout(() => go(-1), 700); }} />
        </View>

        <TouchableOpacity onPress={() => go('addresses')} style={[se.card, shadow, se.linkCard]}>
          <MC name="map-marker-multiple-outline" size={20} color={C.brand} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: C.ink, fontWeight: '800', fontSize: 14 }}>Delivery addresses</Text>
            <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 2 }}>{state.addresses.length} saved</Text>
          </View>
          <MC name="chevron-right" size={20} color={C.ink3} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* ---------------- Change phone ---------------- */
export function ChangePhone({ go }) {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(0);
  const [ph, setPh] = useState('');
  const [otp, setOtp] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Mobile number badlein" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={[se.card, shadow, { padding: 18 }]}>
          <Text style={{ color: C.ink3, fontSize: 12 }}>Abhi ka number</Text>
          <Text style={{ color: C.ink, fontWeight: '900', fontSize: 17, marginTop: 3 }}>+91 {state.user?.phone}</Text>
          <View style={{ height: 1, backgroundColor: C.line, marginVertical: 16 }} />

          {step === 0 ? (
            <>
              <Field label="Naya mobile number" placeholder="10 digit" keyboardType="number-pad" value={ph} onChangeText={(v) => setPh(v.replace(/\D/g, '').slice(0, 10))} />
              <Btn title="OTP bhejein" disabled={ph.length !== 10} onPress={() => setStep(1)} />
            </>
          ) : (
            <>
              <Field label={`+91 ${ph} par bheja gaya OTP`} placeholder="4 digit" keyboardType="number-pad" value={otp} onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, 4))} />
              <Btn title="Number badlein" tone="green" disabled={otp.length !== 4}
                onPress={() => { dispatch({ type: 'UPDATE_USER', patch: { phone: ph } }); go(-1); }} />
            </>
          )}
          <Text style={{ color: C.ink3, fontSize: 11, textAlign: 'center', marginTop: 14, lineHeight: 16 }}>
            Sirf OTP se verify hota hai. Koi document nahi.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------------- Language ---------------- */
export function Language({ go }) {
  const { state, dispatch } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="App ki bhasha" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={[se.card, shadow]}>
          {LANGS.map((l, i) => (
            <TouchableOpacity key={l} onPress={() => dispatch({ type: 'UPDATE_SETTINGS', patch: { lang: l } })}
              style={[se.row, i === LANGS.length - 1 && { borderBottomWidth: 0 }]}>
              <MC name={state.settings.lang === l ? 'radiobox-marked' : 'radiobox-blank'} size={19} color={state.settings.lang === l ? C.brand : C.ink3} />
              <Text style={{ flex: 1, marginLeft: 14, color: C.ink, fontWeight: '600', fontSize: 14 }}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 14, lineHeight: 17, textAlign: 'center' }}>
          Support team bhi inhi bhashaon me baat karti hai — asli insaan, koi translator bot nahi.
        </Text>
      </ScrollView>
    </View>
  );
}

/* ---------------- Payment settings ---------------- */
export function PaymentSettings({ go }) {
  const { state, dispatch } = useApp();
  const st = state.settings;
  const [upi, setUpi] = useState(st.upiId);
  const PAY = [['cod', 'Cash on Delivery', 'cash'], ['upi', 'UPI', 'cellphone-check'], ['card', 'Card', 'credit-card-outline'], ['nb', 'Net Banking', 'bank-outline']];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Payment settings" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={se.gTitle}>DEFAULT PAYMENT</Text>
        <View style={[se.card, shadow]}>
          {PAY.map(([k, l, ic], i) => (
            <TouchableOpacity key={k} onPress={() => dispatch({ type: 'UPDATE_SETTINGS', patch: { defaultPay: k } })}
              style={[se.row, i === PAY.length - 1 && { borderBottomWidth: 0 }]}>
              <MC name={st.defaultPay === k ? 'radiobox-marked' : 'radiobox-blank'} size={19} color={st.defaultPay === k ? C.brand : C.ink3} />
              <MC name={ic} size={18} color={C.ink2} style={{ marginLeft: 12 }} />
              <Text style={{ flex: 1, marginLeft: 12, color: C.ink, fontWeight: '600', fontSize: 14 }}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[se.gTitle, { marginTop: 22 }]}>UPI ID SAVE KAREIN</Text>
        <View style={[se.card, shadow, { padding: 16 }]}>
          <Field placeholder="aapkanaam@upi" autoCapitalize="none" value={upi} onChangeText={setUpi} />
          <Btn title="Save karein" onPress={() => { dispatch({ type: 'UPDATE_SETTINGS', patch: { upiId: upi } }); go(-1); }} />
          <Text style={{ color: C.ink3, fontSize: 11, marginTop: 10, lineHeight: 16 }}>
            Hum card ya bank details store nahi karte. Refund isi UPI par aata hai.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------------- Shop settings (seller) ---------------- */
export function ShopSettings({ go }) {
  const { state, dispatch } = useApp();
  const sh = state.shop;
  const [f, setF] = useState({ ...sh });
  const [done, setDone] = useState(false);

  const save = () => {
    dispatch({ type: 'UPDATE_SHOP', patch: f });
    if (cloud.cloudOn()) {
      cloud.upsertShop(f, state.user?.cloudId || null).catch(() => {});
    }
    setDone(true);
    setTimeout(() => setDone(false), 1400);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Dukaan ki settings" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        <View style={se.note}>
          <MC name="information-outline" size={16} color={C.brand} />
          <Text style={{ flex: 1, marginLeft: 9, color: C.ink2, fontSize: 11.5, lineHeight: 17 }}>
            Jaise Flipkart/Meesho par seller apni dukaan ki jaankari bharta hai — waise hi, par koi KYC ya document nahi.
          </Text>
        </View>

        <Text style={[se.gTitle, { marginTop: 20 }]}>DUKAAN KI PEHCHAN</Text>
        <View style={[se.card, shadow, { padding: 18 }]}>
          <Field label="Dukaan ka naam" placeholder="Sharma Handloom" value={f.name} onChangeText={(v) => setF({ ...f, name: v })} />
          <Field label="Ek line me dukaan ke baare me" placeholder="Banarasi saree, seedha karghe se" value={f.tagline} onChangeText={(v) => setF({ ...f, tagline: v })} />
          <Field label="Contact number (buyer ko dikhega)" placeholder="10 digit" keyboardType="number-pad" value={f.contact} onChangeText={(v) => setF({ ...f, contact: v.replace(/\D/g, '').slice(0, 10) })} />
          <Field label="Dukaan khulne ka samay" placeholder="10:00 AM – 8:00 PM" value={f.hours} onChangeText={(v) => setF({ ...f, hours: v })} />
        </View>

        <Text style={[se.gTitle, { marginTop: 22 }]}>PICKUP AUR LOCATION</Text>
        <View style={[se.card, shadow, { padding: 18 }]}>
          <Field label="Pickup ka poora pata" placeholder="Dukaan / godam ka pata" multiline value={f.pickup} onChangeText={(v) => setF({ ...f, pickup: v })} style={{ height: 80, textAlignVertical: 'top' }} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}><Field label="Sheher" placeholder="Lucknow" value={f.city} onChangeText={(v) => setF({ ...f, city: v })} /></View>
            <View style={{ flex: 1 }}><Field label="Rajya" placeholder="Uttar Pradesh" value={f.state} onChangeText={(v) => setF({ ...f, state: v })} /></View>
          </View>
          <Field label="PIN code" placeholder="226010" keyboardType="number-pad" value={f.pin} onChangeText={(v) => setF({ ...f, pin: v.replace(/\D/g, '').slice(0, 6) })} />
        </View>

        <Text style={[se.gTitle, { marginTop: 22 }]}>PAISA — SEEDHA AAPKE PAAS</Text>
        <View style={se.okNote}>
          <MC name="cash-check" size={15} color={C.green} />
          <Text style={{ flex: 1, marginLeft: 8, color: '#0F7A4A', fontSize: 11.5, fontWeight: '700', lineHeight: 17 }}>
            Grahak ka paisa seedha aapke UPI/bank me aata hai. Temsho beech me paisa nahi rakhta.
          </Text>
        </View>
        <View style={[se.card, shadow, { padding: 18, marginTop: 10 }]}>
          <Text style={se.lbl}>Aap kaise paisa lenge?</Text>
          {[['acceptUpi', 'UPI se online', 'cellphone-check'],
            ['acceptCod', 'Cash on Delivery (nakad)', 'cash'],
            ['acceptBank', 'Bank transfer', 'bank-outline']].map(([k, l, ic]) => (
            <TouchableOpacity key={k} onPress={() => setF({ ...f, [k]: !f[k] })}
              style={[se.payOpt, f[k] && { borderColor: C.green, backgroundColor: C.greenSoft }]}>
              <MC name={f[k] ? 'checkbox-marked' : 'checkbox-blank-outline'} size={19} color={f[k] ? C.green : C.ink3} />
              <MC name={ic} size={18} color={C.ink2} style={{ marginLeft: 12 }} />
              <Text style={{ flex: 1, marginLeft: 10, color: C.ink, fontWeight: '700', fontSize: 13.5 }}>{l}</Text>
            </TouchableOpacity>
          ))}

          <View style={{ height: 14 }} />
          <Field label="Aapka naam (bank/UPI wala)" placeholder="Ramesh Kumar" value={f.payName} onChangeText={(v) => setF({ ...f, payName: v })} />
          <Field label="UPI ID" placeholder="9876543210@ybl" autoCapitalize="none" value={f.upi} onChangeText={(v) => setF({ ...f, upi: v })} />

          {f.acceptBank && (
            <>
              <Field label="Bank ka naam" placeholder="State Bank of India" value={f.bankName} onChangeText={(v) => setF({ ...f, bankName: v })} />
              <Field label="Account number" placeholder="XXXXXXXXXXXX" keyboardType="number-pad" value={f.accNo} onChangeText={(v) => setF({ ...f, accNo: v.replace(/\D/g, '') })} />
              <Field label="IFSC code" placeholder="SBIN0001234" autoCapitalize="characters" value={f.ifsc} onChangeText={(v) => setF({ ...f, ifsc: v.toUpperCase() })} />
            </>
          )}
        </View>

        <Text style={[se.gTitle, { marginTop: 22 }]}>POLICY</Text>
        <View style={[se.card, shadow, { padding: 18 }]}>
          <Field label="Return kitne din ka?" placeholder="7" keyboardType="number-pad" value={String(f.returnDays)} onChangeText={(v) => setF({ ...f, returnDays: v.replace(/\D/g, '').slice(0, 2) })} />
          <Field label="GSTIN (bilkul optional — chhod sakte hain)" placeholder="Khali chhod dein" autoCapitalize="characters" value={f.gst} onChangeText={(v) => setF({ ...f, gst: v.toUpperCase() })} />
          <View style={se.okNote}>
            <MC name="check-circle-outline" size={15} color={C.green} />
            <Text style={{ flex: 1, marginLeft: 8, color: '#0F7A4A', fontSize: 11.5, fontWeight: '700', lineHeight: 17 }}>
              GST ke bina bhi bech sakte hain. Koi Aadhaar, PAN ya shop licence nahi maanga jaata.
            </Text>
          </View>
        </View>

        <Btn title={done ? 'Save ho gaya' : 'Sab save karein'} icon={done ? 'check' : 'content-save-outline'}
          tone={done ? 'green' : 'brand'} style={{ marginTop: 20 }} onPress={save} />
      </ScrollView>
    </View>
  );
}

const se = StyleSheet.create({
  card: { backgroundColor: C.surface, borderRadius: R.lg, overflow: 'hidden' },
  profile: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: R.lg, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: C.line },
  gTitle: { color: C.ink3, fontSize: 11.5, fontWeight: '900', letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 },
  gSub: { color: C.ink3, fontSize: 11, marginBottom: 8, marginLeft: 4, marginTop: -4 },
  lbl: { color: C.ink2, fontSize: 12, fontWeight: '700', marginBottom: 8 },
  chip: { borderWidth: 1, borderColor: C.line, borderRadius: R.pill, paddingHorizontal: 14, paddingVertical: 8 },
  note: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.brandSoft, borderRadius: R.md, padding: 12 },
  okNote: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.greenSoft, borderRadius: R.sm, padding: 11, marginTop: 4 },
  payOpt: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: C.line, borderRadius: R.md, padding: 12, marginBottom: 8 },
  locked: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, borderRadius: R.md, padding: 13, marginTop: 4 },
  linkCard: { flexDirection: 'row', alignItems: 'center', padding: 16, marginTop: 14 },
});
