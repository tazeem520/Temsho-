import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import { C, R, shadow } from '../theme';
import { Btn, Field, Avatar } from '../components/UI';
import { Header } from './Product';
import { useApp, LANGS } from '../store';
import * as cloud from '../lib/cloud';

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
    <Switch value={on} onValueChange={onChange} trackColor={{ true: C.brand, false: '#D1D5DB' }} thumbColor="#fff" />
  </View>
);

/* ---------------- SETTINGS HOME ---------------- */
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
          <Avatar name={u?.name || 'User'} hue={C.brand} size={54} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16 }}>{u?.name}</Text>
            <Text style={{ color: C.ink3, fontSize: 12.5, marginTop: 2 }}>+91 {u?.phone}</Text>
            <Text style={{ color: C.brand, fontSize: 12, fontWeight: '800', marginTop: 6 }}>Edit Profile</Text>
          </View>
          <MC name="chevron-right" size={20} color={C.ink3} />
        </TouchableOpacity>

        {isOwner && (
          <Group title="OWNER ACCESS (9044468663)">
            <Row icon="crown-outline" label="Admin Control Panel" value="Manage App" onPress={() => go('admin')} />
            <Row icon="history" label="Activity & Audit Ledger" value={`${(state.auditLog || []).length} events`} onPress={() => go('admin-audit')} />
            <Row icon="bank-outline" label="Owner Payout & Settlement" value="₹49 Delivery UPI" onPress={() => go('admin-owner-payment')} />
            <Row icon="cellphone-key" label="OTP Engine Settings" value={state.admin?.otpProvider || 'Fast2SMS'} onPress={() => go('admin-otp')} />
            <Row icon="truck-delivery-outline" label="Logistics & Delivery Rates" value="Courier Setup" onPress={() => go('admin-logistics')} last />
          </Group>
        )}

        <Group title="ACCOUNT & PROFILE" sub="Manage your profile information">
          <Row icon="account-edit-outline" label="Name, Email, Gender, Birthday" onPress={() => go('edit-profile')} />
          <Row icon="map-marker-outline" label="Location & Delivery Addresses" value={u?.city || 'Set Location'} onPress={() => go('edit-location')} />
          <Row icon="cellphone-check" label="Mobile Number" value={'+91 ' + (u?.phone || '')} onPress={() => go('change-phone')} last />
        </Group>

        <Group title="SELLER & SHOP MANAGEMENT">
          {u?.isSeller ? (
            <>
              <Row icon="storefront-outline" label="Shop Profile & Name" value={state.shop.name || 'Active'} onPress={() => go('shop-settings')} />
              <Row icon="truck-outline" label="Pickup Location & PIN" value={state.shop.pin || 'Set PIN'} onPress={() => go('shop-settings')} />
              <Row icon="bank-outline" label="Bank & Payout UPI" value={state.shop.upi || 'Active'} onPress={() => go('shop-settings')} last />
            </>
          ) : (
            <Row icon="storefront-plus-outline" label="Become a Seller — Open Your Shop" onPress={() => go('become-seller')} last />
          )}
        </Group>

        <Group title="APP LANGUAGE">
          <Row icon="translate" label="Display Language" value={st.lang} onPress={() => go('language')} last />
        </Group>

        <Group title="NOTIFICATIONS & ALERTS">
          <Toggle icon="package-variant" label="Order Status Updates" sub="Packed, shipped, delivered notifications"
            on={st.notifOrders} onChange={(v) => dispatch({ type: 'UPDATE_SETTINGS', patch: { notifOrders: v } })} />
          <Toggle icon="tag-outline" label="Offers & Price Drops" sub="Deals, coupons, flash discounts"
            on={st.notifOffers} onChange={(v) => dispatch({ type: 'UPDATE_SETTINGS', patch: { notifOffers: v } })} />
          <Toggle icon="whatsapp" label="WhatsApp Notifications" sub="Receive order tracking on WhatsApp"
            on={st.notifWhatsapp} onChange={(v) => dispatch({ type: 'UPDATE_SETTINGS', patch: { notifWhatsapp: v } })} last />
        </Group>

        <Group title="PRIVACY & LEGAL">
          <Toggle icon="history" label="Save Search History" sub="Keep recent searches for fast access"
            on={st.saveHistory} onChange={(v) => dispatch({ type: 'UPDATE_SETTINGS', patch: { saveHistory: v } })} />
          <Row icon="shield-check-outline" label="Trust & Marketplace Policy" onPress={() => go('policy')} />
          <Row icon="file-document-outline" label="Privacy Policy & Terms" onPress={() => go('privacy-policy')} />
          <Row icon="headset" label="Customer Support & Helpdesk" onPress={() => go('support')} last />
        </Group>

        <Group title="DANGER ZONE">
          <Row icon="logout" label="Log Out" danger onPress={() => dispatch({ type: 'LOGOUT' })} />
          <Row icon="delete-outline" label="Delete Account & Data" danger onPress={() => setConfirmDel(true)} last />
        </Group>

        {confirmDel && (
          <View style={[se.card, shadow, { marginTop: 12, padding: 16, borderWidth: 1.5, borderColor: C.red }]}>
            <Text style={{ color: C.ink, fontWeight: '800', fontSize: 14 }}>Permanently Delete Account?</Text>
            <Text style={{ color: C.ink2, fontSize: 12.5, lineHeight: 19, marginTop: 6 }}>
              All your account details, order history, and shop listings will be permanently deleted in compliance with DPDP Act. This action cannot be undone.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <Btn title="Cancel" tone="ghost" style={{ flex: 1 }} onPress={() => setConfirmDel(false)} />
              <Btn title="Delete Permanently" tone="brand" style={{ flex: 1, backgroundColor: C.red }} onPress={() => dispatch({ type: 'DELETE_ACCOUNT' })} />
            </View>
          </View>
        )}

        <Text style={{ textAlign: 'center', color: C.ink3, fontSize: 11, marginTop: 26, lineHeight: 17 }}>
          Temsho v1.0.8{'\n'}Made in India · Direct & Transparent Marketplace
        </Text>
      </ScrollView>
    </View>
  );
}

/* ---------------- EDIT PROFILE ---------------- */
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
      <Header title="Edit Profile" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        <View style={[se.card, shadow, { padding: 18 }]}>
          <Field label="Full Name" placeholder="e.g. Rahul Sharma" value={f.name} onChangeText={(v) => setF({ ...f, name: v })} />
          <Field label="Email Address (Optional)" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" value={f.email} onChangeText={(v) => setF({ ...f, email: v })} />

          <Text style={se.lbl}>Gender (Optional)</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {['Male', 'Female', 'Other'].map((g) => (
              <TouchableOpacity key={g} onPress={() => setF({ ...f, gender: f.gender === g ? '' : g })}
                style={[se.chip, f.gender === g && { backgroundColor: C.brand, borderColor: C.brand }]}>
                <Text style={{ color: f.gender === g ? '#fff' : C.ink2, fontSize: 13, fontWeight: '600' }}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Field label="Date of Birth (Optional)" placeholder="DD/MM/YYYY" value={f.dob} onChangeText={(v) => setF({ ...f, dob: v })} />
          <Field label="Alternate Mobile (Optional)" placeholder="10-digit number" keyboardType="number-pad" value={f.alt} onChangeText={(v) => setF({ ...f, alt: v.replace(/\D/g, '').slice(0, 10) })} />

          <View style={se.locked}>
            <MC name="lock-outline" size={15} color={C.ink3} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ color: C.ink2, fontSize: 12.5, fontWeight: '700' }}>+91 {u?.phone}</Text>
              <Text style={{ color: C.ink3, fontSize: 11, marginTop: 2 }}>Primary login number</Text>
            </View>
            <TouchableOpacity onPress={() => go('change-phone')}>
              <Text style={{ color: C.brand, fontWeight: '800', fontSize: 12 }}>Change</Text>
            </TouchableOpacity>
          </View>

          <Btn title={done ? 'Saved Successfully' : 'Save Changes'} icon={done ? 'check' : 'content-save-outline'} tone={done ? 'green' : 'brand'} style={{ marginTop: 18 }} onPress={save} />
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------------- LOCATION ---------------- */
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
          <Text style={{ color: C.ink, fontWeight: '800', fontSize: 15 }}>Default Delivery Location</Text>
          <Text style={{ color: C.ink2, fontSize: 12.5, lineHeight: 19, marginTop: 5, marginBottom: 16 }}>
            Helps us compute accurate delivery times and local shipping estimates.
          </Text>

          <Field label="City / District" placeholder="e.g. Lucknow" value={f.city} onChangeText={(v) => setF({ ...f, city: v })} />
          <Text style={se.lbl}>State</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {STATES.map((x) => (
              <TouchableOpacity key={x} onPress={() => setF({ ...f, st: x })}
                style={[se.chip, f.st === x && { backgroundColor: C.brand, borderColor: C.brand }]}>
                <Text style={{ color: f.st === x ? '#fff' : C.ink2, fontSize: 12, fontWeight: '600' }}>{x}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Field label="PIN Code" placeholder="226010" keyboardType="number-pad" value={f.pin} onChangeText={(v) => setF({ ...f, pin: v.replace(/\D/g, '').slice(0, 6) })} />

          <Btn title={done ? 'Saved Successfully' : 'Save Location'} icon={done ? 'check' : 'content-save-outline'} tone={done ? 'green' : 'brand'}
            onPress={() => { dispatch({ type: 'UPDATE_USER', patch: f }); setDone(true); setTimeout(() => go(-1), 700); }} />
        </View>

        <TouchableOpacity onPress={() => go('addresses')} style={[se.card, shadow, se.linkCard]}>
          <MC name="map-marker-multiple-outline" size={20} color={C.brand} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: C.ink, fontWeight: '800', fontSize: 14 }}>Manage Delivery Addresses</Text>
            <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 2 }}>{state.addresses.length} saved addresses</Text>
          </View>
          <MC name="chevron-right" size={20} color={C.ink3} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* ---------------- CHANGE PHONE ---------------- */
export function ChangePhone({ go }) {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(0);
  const [ph, setPh] = useState('');
  const [otp, setOtp] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Change Mobile Number" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={[se.card, shadow, { padding: 18 }]}>
          <Text style={{ color: C.ink3, fontSize: 12 }}>Current Registered Number</Text>
          <Text style={{ color: C.ink, fontWeight: '900', fontSize: 17, marginTop: 3 }}>+91 {state.user?.phone}</Text>
          <View style={{ height: 1, backgroundColor: C.line, marginVertical: 16 }} />

          {step === 0 ? (
            <>
              <Field label="New Mobile Number" placeholder="10-digit number" keyboardType="number-pad" value={ph} onChangeText={(v) => setPh(v.replace(/\D/g, '').slice(0, 10))} />
              <Btn title="Send Verification Code" disabled={ph.length !== 10} onPress={() => setStep(1)} />
            </>
          ) : (
            <>
              <Field label={`Verification Code sent to +91 ${ph}`} placeholder="4-digit code" keyboardType="number-pad" value={otp} onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, 4))} />
              <Btn title="Confirm & Update" tone="green" disabled={otp.length !== 4}
                onPress={() => { dispatch({ type: 'UPDATE_USER', patch: { phone: ph } }); go(-1); }} />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------------- LANGUAGE ---------------- */
export function Language({ go }) {
  const { state, dispatch } = useApp();
  const [savedLang, setSavedLang] = useState(state.settings.lang || 'English');

  const selectLanguage = (l) => {
    setSavedLang(l);
    dispatch({ type: 'UPDATE_SETTINGS', patch: { lang: l } });
    setTimeout(() => {
      go(-1);
    }, 300);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Select App Language / भाषा" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        <Text style={[se.gTitle, { marginTop: 4, marginBottom: 10 }]}>CHOOSE YOUR PREFERRED LANGUAGE</Text>
        <View style={[se.card, shadow]}>
          {LANGS.map((l, i) => {
            const isSelected = savedLang === l;
            return (
              <TouchableOpacity
                key={l}
                activeOpacity={0.7}
                onPress={() => selectLanguage(l)}
                style={[
                  se.row,
                  isSelected && { backgroundColor: '#EFF6FF' },
                  i === LANGS.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <MC
                  name={isSelected ? 'check-circle' : 'circle-outline'}
                  size={21}
                  color={isSelected ? C.brand : C.ink3}
                />
                <Text
                  style={{
                    flex: 1,
                    marginLeft: 14,
                    color: isSelected ? C.brand : C.ink,
                    fontWeight: isSelected ? '900' : '600',
                    fontSize: 14.5,
                  }}
                >
                  {l}
                </Text>
                {isSelected && (
                  <View style={{ backgroundColor: C.brandSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}>
                    <Text style={{ color: C.brand, fontWeight: '800', fontSize: 11 }}>Active</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={{ color: C.ink3, fontSize: 11.5, textAlign: 'center', marginTop: 18, lineHeight: 17 }}>
          Language preference is automatically synced across your buyer, seller, and admin screens.
        </Text>
      </ScrollView>
    </View>
  );
}

/* ---------------- PAYMENT SETTINGS ---------------- */
export function PaymentSettings({ go }) {
  const { state, dispatch } = useApp();
  const st = state.settings;
  const [upi, setUpi] = useState(st.upiId);
  const PAY = [['cod', 'Cash on Delivery', 'cash'], ['upi', 'Direct UPI', 'cellphone-check'], ['card', 'Card / Net Banking', 'credit-card-outline']];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Payment Settings" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={se.gTitle}>DEFAULT PAYMENT PREFERENCE</Text>
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

        <Text style={[se.gTitle, { marginTop: 22 }]}>SAVE UPI ID</Text>
        <View style={[se.card, shadow, { padding: 16 }]}>
          <Field placeholder="yourname@upi" autoCapitalize="none" value={upi} onChangeText={setUpi} />
          <Btn title="Save UPI ID" onPress={() => { dispatch({ type: 'UPDATE_SETTINGS', patch: { upiId: upi } }); go(-1); }} />
          <Text style={{ color: C.ink3, fontSize: 11, marginTop: 10, lineHeight: 16 }}>
            Temsho does not store credit card PINs or banking credentials. Direct settlements only.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------------- SHOP SETTINGS (SELLER) ---------------- */
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
      <Header title="Shop Settings" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        <Text style={se.gTitle}>SHOP IDENTITY</Text>
        <View style={[se.card, shadow, { padding: 18 }]}>
          <Field label="Shop / Business Name" placeholder="e.g. Sharma Handloom" value={f.name} onChangeText={(v) => setF({ ...f, name: v })} />
          <Field label="Shop Tagline / Bio" placeholder="e.g. Authentic Handcrafted Silk & Apparel" value={f.tagline} onChangeText={(v) => setF({ ...f, tagline: v })} />
          <Field label="Contact Phone (Visible to Customers)" placeholder="10-digit number" keyboardType="number-pad" value={f.contact} onChangeText={(v) => setF({ ...f, contact: v.replace(/\D/g, '').slice(0, 10) })} />
          <Field label="Operational Hours" placeholder="10:00 AM – 8:00 PM" value={f.hours} onChangeText={(v) => setF({ ...f, hours: v })} />
        </View>

        <Text style={[se.gTitle, { marginTop: 22 }]}>PICKUP & DISPATCH LOCATION</Text>
        <View style={[se.card, shadow, { padding: 18 }]}>
          <Field label="Full Pickup Address" placeholder="Shop / Warehouse full address" multiline value={f.pickup} onChangeText={(v) => setF({ ...f, pickup: v })} style={{ height: 80, textAlignVertical: 'top' }} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}><Field label="City" placeholder="Lucknow" value={f.city} onChangeText={(v) => setF({ ...f, city: v })} /></View>
            <View style={{ flex: 1 }}><Field label="State" placeholder="Uttar Pradesh" value={f.state} onChangeText={(v) => setF({ ...f, state: v })} /></View>
          </View>
          <Field label="PIN Code" placeholder="226010" keyboardType="number-pad" value={f.pin} onChangeText={(v) => setF({ ...f, pin: v.replace(/\D/g, '').slice(0, 6) })} />
        </View>

        <Text style={[se.gTitle, { marginTop: 22 }]}>BANK & PAYOUT DETAILS</Text>
        <View style={[se.card, shadow, { padding: 18 }]}>
          <Text style={se.lbl}>Accepted Payment Channels</Text>
          {[['acceptUpi', 'Direct UPI Payments', 'cellphone-check'],
            ['acceptCod', 'Cash on Delivery (COD)', 'cash'],
            ['acceptBank', 'Direct Bank Transfer', 'bank-outline']].map(([k, l, ic]) => (
            <TouchableOpacity key={k} onPress={() => setF({ ...f, [k]: !f[k] })}
              style={[se.payOpt, f[k] && { borderColor: C.green, backgroundColor: C.greenSoft }]}>
              <MC name={f[k] ? 'checkbox-marked' : 'checkbox-blank-outline'} size={19} color={f[k] ? C.green : C.ink3} />
              <MC name={ic} size={18} color={C.ink2} style={{ marginLeft: 12 }} />
              <Text style={{ flex: 1, marginLeft: 10, color: C.ink, fontWeight: '700', fontSize: 13.5 }}>{l}</Text>
            </TouchableOpacity>
          ))}

          <View style={{ height: 14 }} />
          <Field label="Account Holder Name (as in Bank)" placeholder="Rahul Sharma" value={f.payName} onChangeText={(v) => setF({ ...f, payName: v })} />
          <Field label="Seller Payout UPI ID" placeholder="9876543210@ybl" autoCapitalize="none" value={f.upi} onChangeText={(v) => setF({ ...f, upi: v })} />

          <Field label="Bank Name" placeholder="State Bank of India" value={f.bankName} onChangeText={(v) => setF({ ...f, bankName: v })} />
          <Field label="Account Number" placeholder="XXXXXXXXXXXX" keyboardType="number-pad" value={f.accNo} onChangeText={(v) => setF({ ...f, accNo: v.replace(/\D/g, '') })} />
          <Field label="IFSC Code" placeholder="SBIN0001234" autoCapitalize="characters" value={f.ifsc} onChangeText={(v) => setF({ ...f, ifsc: v.toUpperCase() })} />
        </View>

        <Text style={[se.gTitle, { marginTop: 22 }]}>POLICY & TAXES</Text>
        <View style={[se.card, shadow, { padding: 18 }]}>
          <Field label="Return Window (Days)" placeholder="7" keyboardType="number-pad" value={String(f.returnDays)} onChangeText={(v) => setF({ ...f, returnDays: v.replace(/\D/g, '').slice(0, 2) })} />
          <Field label="GSTIN (Optional)" placeholder="Leave blank if not registered" autoCapitalize="characters" value={f.gst} onChangeText={(v) => setF({ ...f, gst: v.toUpperCase() })} />
        </View>

        <Btn title={done ? 'Saved Successfully' : 'Save All Settings'} icon={done ? 'check' : 'content-save-outline'}
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
  payOpt: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: C.line, borderRadius: R.md, padding: 12, marginBottom: 8 },
  locked: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, borderRadius: R.md, padding: 13, marginTop: 4 },
  linkCard: { flexDirection: 'row', alignItems: 'center', padding: 16, marginTop: 14 },
});
