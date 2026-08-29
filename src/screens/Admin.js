import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import { C, R, shadow, money } from '../theme';
import { Btn, Field, Badge, Thumb, Empty } from '../components/UI';
import { Header } from './Product';
import { useApp } from '../store';
import * as cloud from '../lib/cloud';
import { SELLERS } from '../data/catalog';
import { OTP_PROVIDERS_LIST } from '../lib/otp';

const Card = ({ children, style }) => <View style={[ad.card, shadow, style]}>{children}</View>;

const Toggle = ({ icon, label, sub, on, onChange, last }) => (
  <View style={[ad.row, last && { borderBottomWidth: 0 }]}>
    <MC name={icon} size={19} color={C.ink2} />
    <View style={{ flex: 1, marginLeft: 14 }}>
      <Text style={{ color: C.ink, fontWeight: '600', fontSize: 14 }}>{label}</Text>
      {!!sub && <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 2 }}>{sub}</Text>}
    </View>
    <Switch value={on} onValueChange={onChange} trackColor={{ true: C.brand, false: '#D1D5DB' }} thumbColor="#fff" />
  </View>
);

/* =============== ADMIN HOME =============== */
export function Admin({ go }) {
  const { state, isOwner, admin, cloudOn } = useApp();
  if (!isOwner)
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <Header title="Admin" go={go} />
        <Empty icon="lock-outline" title="Access Restricted" sub="This management panel is only accessible to the verified owner account (9044468663)." />
      </View>
    );

  const totalSales = state.orders.filter((o) => o.status !== 'Cancelled').reduce((t, o) => t + o.total, 0);
  const liveProducts = state.products.length;
  const sellers = Object.keys(SELLERS).length + (state.user?.isSeller ? 1 : 0);

  const Tile = ({ icon, label, value, tint }) => (
    <View style={[ad.tile, shadow]}>
      <View style={[ad.tileIco, { backgroundColor: tint + '1A' }]}><MC name={icon} size={18} color={tint} /></View>
      <Text style={{ color: C.ink, fontWeight: '900', fontSize: 19, marginTop: 8 }}>{value}</Text>
      <Text style={{ color: C.ink3, fontSize: 11, marginTop: 2 }}>{label}</Text>
    </View>
  );

  const Link = ({ icon, label, sub, to, last, tone }) => (
    <TouchableOpacity onPress={() => go(to)} style={[ad.row, last && { borderBottomWidth: 0 }]}>
      <MC name={icon} size={19} color={tone || C.ink2} />
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={{ color: C.ink, fontWeight: '700', fontSize: 14 }}>{label}</Text>
        {!!sub && <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 2 }}>{sub}</Text>}
      </View>
      <MC name="chevron-right" size={19} color={C.ink3} />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={ad.head}>
        <TouchableOpacity onPress={() => go(-1)} style={{ paddingRight: 12 }}>
          <MC name="chevron-left" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900' }}>Admin Control Panel</Text>
          <Text style={{ color: '#ffffffaa', fontSize: 11, marginTop: 2 }}>Owner Management (9044468663)</Text>
        </View>
        <View style={ad.ownerTag}>
          <MC name="crown" size={12} color="#3B2A00" />
          <Text style={{ color: '#3B2A00', fontSize: 10, fontWeight: '900', marginLeft: 4 }}>OWNER</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {admin.maintenance && (
          <View style={ad.warn}>
            <MC name="alert-outline" size={17} color={C.red} />
            <Text style={{ flex: 1, marginLeft: 9, color: C.red, fontSize: 12, fontWeight: '800' }}>
              App is currently in Maintenance Mode — purchases are temporarily paused.
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <Tile icon="cash-multiple" label="Total Marketplace Sales" value={money(totalSales)} tint={C.green} />
          <Tile icon="package-variant" label="Total Orders" value={state.orders.length} tint={C.brand} />
          <Tile icon="tag-multiple-outline" label="Active Products" value={liveProducts} tint={C.accent} />
          <Tile icon="storefront-outline" label="Active Sellers" value={sellers} tint="#DB2777" />
        </View>

        <View style={[ad.cloudBox, cloudOn ? { backgroundColor: C.greenSoft } : { backgroundColor: C.redSoft }]}>
          <MC name={cloudOn ? 'cloud-check-outline' : 'cloud-off-outline'} size={19} color={cloudOn ? C.green : C.red} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ color: cloudOn ? '#059669' : C.red, fontWeight: '900', fontSize: 13 }}>
              {cloudOn ? 'Supabase Realtime Cloud Connected' : 'Database Offline Mode'}
            </Text>
            <Text style={{ color: C.ink2, fontSize: 11, marginTop: 2, lineHeight: 16 }}>
              {cloudOn
                ? 'All buyers and sellers are synchronized in real-time.'
                : 'Supabase database credentials are offline.'}
            </Text>
          </View>
        </View>

        <Text style={ad.sec}>4 CORE SYSTEMS</Text>
        <Card>
          <Link icon="cellphone-key" label="1 · OTP Authentication Engine" sub={`Current: ${admin.otpProvider || 'Supabase / Standard'}`} to="admin-otp" />
          <Link icon="database-sync-outline" label="2 · Cloud Database & Realtime Sync" sub={cloudOn ? 'Online & Synchronized' : 'Offline'} to="admin-database" />
          <Link icon="truck-delivery-outline" label="3 · Logistics & Delivery Charges" sub="Delivery fees, Free delivery threshold" to="admin-logistics" />
          <Link icon="google-play" label="4 · Play Store & Legal Readiness" sub="Privacy Policy, Data Safety, Assets" to="admin-playstore" last />
        </Card>

        <Text style={ad.sec}>GENERAL APP SETTINGS</Text>
        <Card>
          <Link icon="rename-box" label="App Name & Branding" sub={admin.appName} to="admin-brand" />
          <Link icon="cash-sync" label="Pricing, Delivery & Commissions" sub={`Free delivery above ${money(admin.freeDeliveryAbove)}`} to="admin-money" />
          <Link icon="toggle-switch-outline" label="Feature Toggles" sub="COD, UPI, WhatsApp OTP, Seller onboarding" to="admin-features" last />
        </Card>

        <Text style={ad.sec}>COMMUNICATIONS & CONTENT</Text>
        <Card>
          <Link icon="bullhorn-outline" label="Broadcast Push Notifications" sub="Send messages to all app users" to="admin-broadcast" />
          <Link icon="format-list-bulleted" label="Manage Marketplace Listings" sub="Review or remove items" to="admin-products" last />
        </Card>
      </ScrollView>
    </View>
  );
}

/* =============== 1. OTP PROVIDER SWITCHER =============== */
export function AdminOtp({ go }) {
  const { admin, dispatch } = useApp();
  const [active, setActive] = useState(admin.otpProvider || 'supabase');
  const [done, setDone] = useState(false);

  const save = (id) => {
    setActive(id);
    dispatch({ type: 'ADMIN_SET', patch: { otpProvider: id } });
    if (cloud.cloudOn()) cloud.pushSettings({ ...admin, otpProvider: id }).catch(() => {});
    setDone(true);
    setTimeout(() => setDone(false), 1400);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="OTP Provider Settings" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={ad.sec}>SELECT ACTIVE OTP PROVIDER</Text>
        <Card>
          {OTP_PROVIDERS_LIST.map((p, i) => {
            const isSel = active === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => save(p.id)}
                style={[ad.row, i === OTP_PROVIDERS_LIST.length - 1 && { borderBottomWidth: 0 }, isSel && { backgroundColor: C.brandSoft }]}
              >
                <MC name={p.icon} size={22} color={isSel ? C.brand : C.ink2} />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={{ color: C.ink, fontWeight: '800', fontSize: 14 }}>{p.name}</Text>
                  <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 2 }}>{p.desc}</Text>
                </View>
                {isSel && (
                  <View style={ad.activeTag}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>ACTIVE</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </Card>

        {done && (
          <View style={[ad.warn, { backgroundColor: C.greenSoft, marginTop: 16 }]}>
            <MC name="check-circle" size={17} color={C.green} />
            <Text style={{ flex: 1, marginLeft: 9, color: '#059669', fontSize: 12, fontWeight: '800' }}>
              OTP engine updated successfully!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* =============== 2. CLOUD DATABASE MONITOR =============== */
export function AdminDatabase({ go }) {
  const { state, cloudOn } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Database & Realtime Sync" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={[ad.card, shadow, { padding: 18 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MC name={cloudOn ? 'cloud-check' : 'cloud-alert'} size={28} color={cloudOn ? C.green : C.red} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16 }}>
                {cloudOn ? 'Supabase Database Active' : 'Database Offline'}
              </Text>
              <Text style={{ color: C.ink3, fontSize: 12, marginTop: 2 }}>Region: South Asia (Mumbai) · NANO</Text>
            </View>
          </View>
        </View>

        <Text style={ad.sec}>TABLE METRICS</Text>
        <Card>
          <View style={ad.row}>
            <Text style={{ flex: 1, color: C.ink, fontWeight: '700' }}>Products Table</Text>
            <Badge text={`${state.products.length} items`} tone="brand" />
          </View>
          <View style={ad.row}>
            <Text style={{ flex: 1, color: C.ink, fontWeight: '700' }}>Orders Table</Text>
            <Badge text={`${state.orders.length} orders`} tone="green" />
          </View>
          <View style={ad.row}>
            <Text style={{ flex: 1, color: C.ink, fontWeight: '700' }}>Customer Addresses</Text>
            <Badge text={`${state.addresses.length} saved`} tone="accent" />
          </View>
          <View style={[ad.row, { borderBottomWidth: 0 }]}>
            <Text style={{ flex: 1, color: C.ink, fontWeight: '700' }}>Storage (Product Photos)</Text>
            <Badge text="Public Bucket Active" tone="green" />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

/* =============== 3. LOGISTICS =============== */
export function AdminLogistics({ go }) {
  const { admin, dispatch } = useApp();
  const [f, setF] = useState({
    deliveryFee: String(admin.deliveryFee || 49),
    localDeliveryFee: String(admin.localDeliveryFee || 29),
    freeDeliveryAbove: String(admin.freeDeliveryAbove || 499),
  });
  const [done, setDone] = useState(false);

  const save = () => {
    dispatch({
      type: 'ADMIN_SET',
      patch: {
        deliveryFee: Number(f.deliveryFee),
        localDeliveryFee: Number(f.localDeliveryFee),
        freeDeliveryAbove: Number(f.freeDeliveryAbove),
      },
    });
    if (cloud.cloudOn()) {
      cloud.pushSettings({
        ...admin,
        deliveryFee: Number(f.deliveryFee),
        localDeliveryFee: Number(f.localDeliveryFee),
        freeDeliveryAbove: Number(f.freeDeliveryAbove),
      }).catch(() => {});
    }
    setDone(true);
    setTimeout(() => setDone(false), 1400);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Logistics & Delivery" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Card style={{ padding: 18 }}>
          <Text style={{ fontWeight: '900', color: C.ink, fontSize: 15, marginBottom: 14 }}>Delivery Charges (₹)</Text>
          <Field label="Standard Courier Delivery Fee (₹)" keyboardType="number-pad" value={f.deliveryFee} onChangeText={(v) => setF({ ...f, deliveryFee: v.replace(/\D/g, '') })} />
          <Field label="Local / In-City Delivery Fee (₹)" keyboardType="number-pad" value={f.localDeliveryFee} onChangeText={(v) => setF({ ...f, localDeliveryFee: v.replace(/\D/g, '') })} />
          <Field label="Free Delivery Threshold (Cart Total ₹)" keyboardType="number-pad" value={f.freeDeliveryAbove} onChangeText={(v) => setF({ ...f, freeDeliveryAbove: v.replace(/\D/g, '') })} />

          <Btn title={done ? 'Saved Successfully' : 'Save Changes'} icon={done ? 'check' : 'content-save-outline'} tone={done ? 'green' : 'brand'} style={{ marginTop: 12 }} onPress={save} />
        </Card>

        <Text style={ad.sec}>SUPPORTED COURIER PARTNERS</Text>
        <Card>
          {['Delhivery Express (Surface & Air)', 'BlueDart Express', 'DTDC Courier', 'Ekart Logistics', 'India Post / Speed Post', 'Seller Local Self-Delivery'].map((c, i, arr) => (
            <View key={c} style={[ad.row, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <MC name="check-circle" size={17} color={C.green} />
              <Text style={{ flex: 1, marginLeft: 12, color: C.ink, fontWeight: '700', fontSize: 13.5 }}>{c}</Text>
              <Badge text="ENABLED" tone="green" small />
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

/* =============== 4. PLAY STORE READINESS =============== */
export function AdminPlayStore({ go }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Play Store Readiness" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={[ad.card, shadow, { padding: 18 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MC name="google-play" size={28} color="#0F9D58" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16 }}>Google Play Console Ready</Text>
              <Text style={{ color: C.ink3, fontSize: 12, marginTop: 2 }}>Package: com.temsho.app · v1.0.0</Text>
            </View>
          </View>
        </View>

        <Text style={ad.sec}>COMPLIANCE CHECKLIST</Text>
        <Card>
          <View style={ad.row}>
            <MC name="check-circle" size={18} color={C.green} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: C.ink, fontWeight: '700', fontSize: 13.5 }}>App Icon (512×512 HD)</Text>
              <Text style={{ color: C.ink3, fontSize: 11 }}>assets/icon.png configured</Text>
            </View>
            <Badge text="Ready" tone="green" small />
          </View>
          <View style={ad.row}>
            <MC name="check-circle" size={18} color={C.green} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: C.ink, fontWeight: '700', fontSize: 13.5 }}>Feature Graphic (1024×500)</Text>
              <Text style={{ color: C.ink3, fontSize: 11 }}>assets/play-feature-graphic.png ready</Text>
            </View>
            <Badge text="Ready" tone="green" small />
          </View>
          <View style={ad.row}>
            <MC name="check-circle" size={18} color={C.green} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: C.ink, fontWeight: '700', fontSize: 13.5 }}>DPDP 2023 Privacy Policy</Text>
              <Text style={{ color: C.ink3, fontSize: 11 }}>PRIVACY-POLICY.md compliant</Text>
            </View>
            <Badge text="Ready" tone="green" small />
          </View>
          <View style={[ad.row, { borderBottomWidth: 0 }]}>
            <MC name="check-circle" size={18} color={C.green} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: C.ink, fontWeight: '700', fontSize: 13.5 }}>EAS Build Config (APK & AAB)</Text>
              <Text style={{ color: C.ink3, fontSize: 11 }}>eas.json configured for cloud build</Text>
            </View>
            <Badge text="Ready" tone="green" small />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

/* =============== BRAND SETTINGS =============== */
export function AdminBrand({ go }) {
  const { admin, dispatch } = useApp();
  const [f, setF] = useState({ appName: admin.appName, tagline: admin.tagline, supportName: admin.supportName, supportHours: admin.supportHours, announcement: admin.announcement });
  const [done, setDone] = useState(false);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Brand & Identity" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Card style={{ padding: 18 }}>
          <Field label="App Display Name" placeholder="Temsho" value={f.appName} onChangeText={(v) => setF({ ...f, appName: v })} />
          <Field label="Tagline" placeholder="India's Verified Human Marketplace" value={f.tagline} onChangeText={(v) => setF({ ...f, tagline: v })} />
          <Field label="Support Executive Name" placeholder="Priya S." value={f.supportName} onChangeText={(v) => setF({ ...f, supportName: v })} />
          <Field label="Support Operational Hours" placeholder="24x7" value={f.supportHours} onChangeText={(v) => setF({ ...f, supportHours: v })} />
          <Field label="Home Announcement Banner (Optional)" placeholder="e.g. Grand Savings Festival Live!" value={f.announcement} onChangeText={(v) => setF({ ...f, announcement: v })} />
          <Btn title={done ? 'Saved Successfully' : 'Save Changes'} icon={done ? 'check' : 'content-save-outline'} tone={done ? 'green' : 'brand'}
            onPress={() => {
              dispatch({ type: 'ADMIN_SET', patch: f });
              if (cloud.cloudOn()) cloud.pushSettings({ ...admin, ...f }).catch(() => {});
              setDone(true); setTimeout(() => setDone(false), 1400);
            }} />
        </Card>
      </ScrollView>
    </View>
  );
}

/* =============== PRICING & MONEY =============== */
export function AdminMoney({ go }) {
  const { admin, dispatch } = useApp();
  const [f, setF] = useState({
    freeDeliveryAbove: String(admin.freeDeliveryAbove), deliveryFee: String(admin.deliveryFee),
    referralAmount: String(admin.referralAmount || 100),
    commissionPct: String(admin.commissionPct || 0),
  });
  const [done, setDone] = useState(false);
  const num = (v) => Number(v || 0);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Pricing & Delivery" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Card style={{ padding: 18 }}>
          <Field label="Free Delivery Above (₹)" keyboardType="number-pad" value={f.freeDeliveryAbove} onChangeText={(v) => setF({ ...f, freeDeliveryAbove: v.replace(/\D/g, '') })} />
          <Field label="Standard Delivery Charge (₹)" keyboardType="number-pad" value={f.deliveryFee} onChangeText={(v) => setF({ ...f, deliveryFee: v.replace(/\D/g, '') })} />
          <Field label="Referral Reward (₹)" keyboardType="number-pad" value={f.referralAmount} onChangeText={(v) => setF({ ...f, referralAmount: v.replace(/\D/g, '') })} />
          <Field label="Seller Platform Commission (%)" keyboardType="number-pad" value={f.commissionPct} onChangeText={(v) => setF({ ...f, commissionPct: v.replace(/\D/g, '') })} />
          <Btn title={done ? 'Saved Successfully' : 'Save Changes'} icon={done ? 'check' : 'content-save-outline'} tone={done ? 'green' : 'brand'} style={{ marginTop: 14 }}
            onPress={() => {
              dispatch({ type: 'ADMIN_SET', patch: {
                freeDeliveryAbove: num(f.freeDeliveryAbove), deliveryFee: num(f.deliveryFee),
                referralAmount: num(f.referralAmount), commissionPct: num(f.commissionPct),
              }});
              setDone(true); setTimeout(() => setDone(false), 1400);
            }} />
        </Card>
      </ScrollView>
    </View>
  );
}

/* =============== FEATURE TOGGLES =============== */
export function AdminFeatures({ go }) {
  const { admin, dispatch } = useApp();
  const set = (patch) => dispatch({ type: 'ADMIN_SET', patch });
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Feature Toggles" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={[ad.sec, { marginTop: 0 }]}>PAYMENT CHANNELS</Text>
        <Card>
          <Toggle icon="cash" label="Cash on Delivery (COD)" sub="Allow customers to pay cash upon arrival" on={admin.allowCod} onChange={(v) => set({ allowCod: v })} />
          <Toggle icon="cellphone-check" label="Direct UPI Payments" sub="Allow instant UPI payments to sellers" on={admin.allowUpi} onChange={(v) => set({ allowUpi: v })} last />
        </Card>

        <Text style={ad.sec}>AUTHENTICATION</Text>
        <Card>
          <Toggle icon="whatsapp" label="WhatsApp OTP Delivery" sub="Allow users to receive OTP on WhatsApp" on={admin.allowWhatsappOtp} onChange={(v) => set({ allowWhatsappOtp: v })} last />
        </Card>

        <Text style={ad.sec}>SELLER ONBOARDING</Text>
        <Card>
          <Toggle icon="storefront-plus-outline" label="Open Seller Registration" sub="Allow anyone to open a shop" on={admin.allowAnyoneToSell} onChange={(v) => set({ allowAnyoneToSell: v })} />
          <Toggle icon="camera-outline" label="Require Real Photos" sub="Require sellers to upload real photos" on={admin.requirePhotoToList} onChange={(v) => set({ requirePhotoToList: v })} last />
        </Card>

        <Text style={ad.sec}>SYSTEM STATUS</Text>
        <Card style={{ borderWidth: admin.maintenance ? 1.5 : 0, borderColor: C.red }}>
          <Toggle icon="wrench-outline" label="Maintenance Mode" sub="Pause customer shopping temporarily" on={admin.maintenance} onChange={(v) => set({ maintenance: v })} last />
        </Card>

        <Btn title="Reset to Defaults" tone="ghost" icon="restore" style={{ marginTop: 20 }}
          onPress={() => dispatch({ type: 'ADMIN_RESET' })} />
      </ScrollView>
    </View>
  );
}

/* =============== BROADCAST NOTIFICATIONS =============== */
export function AdminBroadcast({ go }) {
  const { dispatch } = useApp();
  const [f, setF] = useState({ title: '', body: '' });
  const [sent, setSent] = useState(false);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Broadcast Notifications" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Card style={{ padding: 18 }}>
          <Field label="Notification Title" placeholder="e.g. Grand Savings Festival is Live!" value={f.title} onChangeText={(v) => setF({ ...f, title: v })} />
          <Field label="Notification Message" placeholder="e.g. Enjoy up to 70% off across verified Indian artisan listings." multiline value={f.body} onChangeText={(v) => setF({ ...f, body: v })} style={{ height: 90, textAlignVertical: 'top' }} />
          <Btn title={sent ? 'Sent Successfully' : 'Broadcast to All Users'} icon={sent ? 'check' : 'send'} tone={sent ? 'green' : 'brand'} disabled={!f.title}
            onPress={() => { dispatch({ type: 'ADMIN_BROADCAST', title: f.title, body: f.body }); setSent(true); setTimeout(() => go(-1), 800); }} />
        </Card>
      </ScrollView>
    </View>
  );
}

/* =============== PRODUCT MANAGEMENT =============== */
export function AdminProducts({ go }) {
  const { state, dispatch } = useApp();
  const [q, setQ] = useState('');
  const list = state.products.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title={`Manage Products (${state.products.length})`} go={go} />
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <Field placeholder="Search listings by title..." value={q} onChangeText={setQ} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 40 }}>
        {list.map((p) => (
          <View key={p.id} style={[ad.prod, shadow]}>
            <View style={{ width: 54 }}><Thumb img={p.img} title={p.title} tint={p.tint} size={54} /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text numberOfLines={2} style={{ color: C.ink, fontWeight: '700', fontSize: 13 }}>{p.title}</Text>
              <Text style={{ color: C.ink2, fontSize: 12, marginTop: 3 }}>
                {money(p.price)} · {SELLERS[p.seller]?.name || state.shop.name || 'Verified Seller'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => dispatch({ type: 'ADMIN_REMOVE_PRODUCT', id: p.id })} style={ad.del}>
              <MC name="delete-outline" size={18} color={C.red} />
            </TouchableOpacity>
          </View>
        ))}
        {list.length === 0 && <Text style={{ color: C.ink3, textAlign: 'center', marginTop: 40 }}>No products found matching query.</Text>}
      </ScrollView>
    </View>
  );
}

const ad = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingTop: 46, paddingHorizontal: 16, paddingBottom: 16 },
  ownerTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.accent, paddingHorizontal: 9, paddingVertical: 5, borderRadius: R.pill },
  card: { backgroundColor: C.surface, borderRadius: R.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: C.line },
  sec: { color: C.ink3, fontSize: 11.5, fontWeight: '900', letterSpacing: 0.8, marginTop: 22, marginBottom: 8, marginLeft: 4 },
  tile: { flexGrow: 1, minWidth: '46%', backgroundColor: C.surface, borderRadius: R.lg, padding: 14 },
  tileIco: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  warn: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.redSoft, borderRadius: R.md, padding: 12, marginBottom: 14 },
  cloudBox: { flexDirection: 'row', alignItems: 'center', borderRadius: R.md, padding: 13, marginTop: 18 },
  prod: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: R.md, padding: 10, marginBottom: 10 },
  del: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.redSoft, alignItems: 'center', justifyContent: 'center' },
  activeTag: { backgroundColor: C.green, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
});
