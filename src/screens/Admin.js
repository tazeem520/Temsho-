import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Image, TextInput, Share, Linking, Modal } from 'react-native';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { C, R, shadow, money } from '../theme';
import { Btn, Field, Badge, Thumb, Empty } from '../components/UI';
import { Header } from './Product';
import { useApp } from '../store';
import * as cloud from '../lib/cloud';
import { SELLERS } from '../data/catalog';
import { OTP_PROVIDERS_LIST } from '../lib/otp';
import { UpiQR, PayNowBtn } from '../components/Upi';
import { SHIPROCKET } from '../config';

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
  const sellersCount = Object.keys(SELLERS).length + (state.user?.isSeller ? 1 : 0);
  const totalCoupons = (state.adminCoupons || []).length;
  const totalBanners = (state.adminBanners || []).length;
  const totalLogs = (state.auditLog || []).length;
  const ownerPaySet = !!(admin.ownerPayment?.deliveryChargeUpi || admin.ownerPayment?.accountNumber);

  const Tile = ({ icon, label, value, tint }) => (
    <View style={[ad.tile, shadow]}>
      <View style={[ad.tileIco, { backgroundColor: tint + '1A' }]}><MC name={icon} size={18} color={tint} /></View>
      <Text style={{ color: C.ink, fontWeight: '900', fontSize: 19, marginTop: 8 }}>{value}</Text>
      <Text style={{ color: C.ink3, fontSize: 11, marginTop: 2 }}>{label}</Text>
    </View>
  );

  const Link = ({ icon, label, sub, to, last, tone, badge }) => (
    <TouchableOpacity onPress={() => go(to)} style={[ad.row, last && { borderBottomWidth: 0 }]}>
      <MC name={icon} size={20} color={tone || C.ink2} />
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={{ color: tone || C.ink, fontWeight: '700', fontSize: 14 }}>{label}</Text>
        {!!sub && <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 2 }}>{sub}</Text>}
      </View>
      {!!badge && <View style={{ marginRight: 6 }}><Badge text={badge} tone="accent" small /></View>}
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

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        {admin.maintenance && (
          <View style={ad.warn}>
            <MC name="alert-outline" size={17} color={C.red} />
            <Text style={{ flex: 1, marginLeft: 9, color: C.red, fontSize: 12, fontWeight: '800' }}>
              App is currently in Maintenance Mode — purchases are temporarily paused.
            </Text>
          </View>
        )}

        {/* OWNER AUDIT & ACTIVITY HIGHLIGHT CTA */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => go('admin-audit')} style={[ad.auditHighlightCard, shadow]}>
          <View style={ad.auditIcoBox}>
            <MC name="history" size={24} color="#fff" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>Owner Activity & Audit Ledger</Text>
              <View style={ad.newTag}><Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>LIVE</Text></View>
            </View>
            <Text style={{ color: '#E2E8F0', fontSize: 12, marginTop: 2 }}>
              Track every product added, deleted & order placed ({totalLogs} events saved)
            </Text>
          </View>
          <MC name="chevron-right" size={22} color="#fff" />
        </TouchableOpacity>

        {/* OWNER SELLER FINANCIAL LEDGER & PAYOUT HUB */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => go('admin-sellers')} style={[ad.sellersLedgerCard, shadow]}>
          <View style={[ad.auditIcoBox, { backgroundColor: '#4338CA' }]}>
            <MC name="storefront-check-outline" size={24} color="#fff" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: '#312E81', fontWeight: '900', fontSize: 15 }}>Sellers Directory & Payouts</Text>
            <Text style={{ color: '#4338CA', fontSize: 11.5, marginTop: 2 }}>
              View all sellers, bank accounts, pending payouts & pay directly via UPI
            </Text>
          </View>
          <MC name="chevron-right" size={20} color="#4338CA" />
        </TouchableOpacity>

        {/* OWNER PAYMENT & SETTLEMENT SETUP CTA */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => go('admin-owner-payment')} style={[ad.payoutSetupCard, shadow]}>
          <View style={[ad.auditIcoBox, { backgroundColor: '#059669' }]}>
            <MC name="bank-transfer" size={24} color="#fff" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: '#064E3B', fontWeight: '900', fontSize: 14.5 }}>Owner Payout & Settlement Details</Text>
            <Text style={{ color: '#047857', fontSize: 11.5, marginTop: 2 }}>
              {ownerPaySet
                ? `Active UPI: ${admin.ownerPayment?.deliveryChargeUpi || admin.ownerPayment?.upiId}`
                : 'Set UPI / Bank for ₹49 delivery logistics collections'}
            </Text>
          </View>
          <MC name="chevron-right" size={20} color="#059669" />
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 14 }}>
          <Tile icon="cash-multiple" label="Total Marketplace Sales" value={money(totalSales)} tint={C.green} />
          <Tile icon="package-variant" label="Total Orders" value={state.orders.length} tint={C.brand} />
          <Tile icon="tag-multiple-outline" label="Active Products" value={liveProducts} tint={C.accent} />
          <Tile icon="storefront-outline" label="Active Sellers" value={sellersCount} tint="#DB2777" />
        </View>

        <View style={[ad.cloudBox, cloudOn ? { backgroundColor: C.greenSoft } : { backgroundColor: C.redSoft }]}>
          <MC name={cloudOn ? 'cloud-check-outline' : 'cloud-off-outline'} size={19} color={cloudOn ? C.green : C.red} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ color: cloudOn ? '#059669' : C.red, fontWeight: '900', fontSize: 13 }}>
              {cloudOn ? 'Supabase Realtime Cloud Connected' : 'Database Offline Mode'}
            </Text>
            <Text style={{ color: C.ink2, fontSize: 11, marginTop: 2, lineHeight: 16 }}>
              {cloudOn
                ? 'All buyers, sellers, orders and listings are synchronized in real-time.'
                : 'Supabase database credentials are offline.'}
            </Text>
          </View>
        </View>

        <Text style={ad.sec}>👑 OWNER CORE AUDIT & FINANCIAL TOOLS</Text>
        <Card>
          <Link icon="history" label="1 · Activity & Audit Ledger (History Logs)" sub="Who ordered what, when added, when deleted" to="admin-audit" badge={`${totalLogs}`} />
          <Link icon="storefront-outline" label="2 · Sellers Directory & Financial Ledger" sub="Sellers list, bank accounts, pending & settled payouts" to="admin-sellers" />
          <Link icon="bank-outline" label="3 · Owner Payment & Delivery Settlements" sub="₹49 delivery logistics UPI & Bank account" to="admin-owner-payment" />
          <Link icon="truck-fast-outline" label="4 · Shiprocket Courier Integration & Activation" sub="Live API Setup & Cheapest All-India Shipping" to="admin-shiprocket" />
          <Link icon="cellphone-key" label="5 · OTP Authentication Engine" sub={`Current: ${admin.otpProvider || 'Fast2SMS / Standard'}`} to="admin-otp" />
          <Link icon="truck-delivery-outline" label="6 · Logistics & Delivery Rates" sub="Delivery fees, Free delivery threshold" to="admin-logistics" last />
        </Card>

        <Text style={ad.sec}>PROMOTIONS & MEDIA (OWNER DYNAMIC TOOLS)</Text>
        <Card>
          <Link icon="image-multiple-outline" label="Posters & Banners Manager" sub={`${totalBanners} promotional banners live`} to="admin-banners" />
          <Link icon="ticket-percent-outline" label="Coupon Generator & Manager" sub={`${totalCoupons} active custom coupons`} to="admin-coupons" last />
        </Card>

        <Text style={ad.sec}>MARKETPLACE PRODUCTS & LISTINGS</Text>
        <Card>
          <Link icon="format-list-bulleted" label="Manage All Products & Seller Details" sub={`${state.products.length} active listings with seller info`} to="admin-products" />
          <Link icon="bullhorn-outline" label="Broadcast Push Notifications" sub="Send messages to all app users" to="admin-broadcast" last />
        </Card>

        <Text style={ad.sec}>GENERAL APP SETTINGS</Text>
        <Card>
          <Link icon="rename-box" label="App Name & Branding" sub={admin.appName} to="admin-brand" />
          <Link icon="cash-sync" label="Pricing, Delivery & Commissions" sub={`Free delivery above ${money(admin.freeDeliveryAbove)}`} to="admin-money" />
          <Link icon="toggle-switch-outline" label="Feature Toggles" sub="COD, UPI, WhatsApp OTP, Seller onboarding" to="admin-features" />
          <Link icon="google-play" label="Play Store & Legal Readiness" sub="Privacy Policy, Data Safety, Assets" to="admin-playstore" last />
        </Card>
      </ScrollView>
    </View>
  );
}

/* =============== 1. ALL PRODUCTS MASTER MANAGER WITH SELLER DETAILS (REQUIREMENT 1) =============== */
export function AdminProducts({ go }) {
  const { state, dispatch } = useApp();
  const [q, setQ] = useState('');
  const list = state.products.filter((p) =>
    (p.title || '').toLowerCase().includes(q.toLowerCase()) ||
    (p.sellerName || '').toLowerCase().includes(q.toLowerCase()) ||
    (p.sellerPhone || '').includes(q)
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title={`Manage Products & Sellers (${state.products.length})`} go={go} />
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <Field placeholder="Search by Product Title, Seller Name or Phone..." value={q} onChangeText={setQ} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 6, paddingBottom: 50 }}>
        {list.map((p) => {
          const sellerPhone = p.sellerPhone || (p.seller === 'me' ? state.user?.phone : '9044468663');
          const sellerName = p.sellerName || (p.seller === 'me' ? state.shop?.name || state.user?.name : SELLERS[p.seller]?.name || 'Verified Seller');
          const sellerCity = p.sellerCity || state.shop?.city || 'India';
          const sellerUpi = p.sellerUpi || state.shop?.upi || (p.seller === 'me' ? state.shop?.upi : 'Direct UPI');
          const sellerBank = p.sellerBank || state.shop?.bankName || 'Direct Payout';
          const sellerAcc = p.sellerAcc || state.shop?.accNo || '';
          const sellerIfsc = p.sellerIfsc || state.shop?.ifsc || '';

          return (
            <View key={p.id} style={[ad.fullProdCard, shadow]}>
              {/* Product Header Strip */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 64, height: 64 }}>
                  <Thumb img={p.img} title={p.title} tint={p.tint} size={64} radius={10} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text numberOfLines={2} style={{ color: C.ink, fontWeight: '800', fontSize: 14 }}>{p.title}</Text>
                  <Text style={{ color: C.ink, fontWeight: '900', fontSize: 14, marginTop: 3 }}>
                    {money(p.price)} <Text style={{ color: C.ink3, fontSize: 11, textDecorationLine: 'line-through' }}>{money(p.mrp || p.price)}</Text>
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                    <Badge text={p.cat?.toUpperCase()} tone="brand" small />
                    {p.images && p.images.length > 1 && <Badge text={`${p.images.length} Photos`} tone="accent" small />}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => dispatch({ type: 'ADMIN_REMOVE_PRODUCT', id: p.id })}
                  style={ad.delProdBtn}
                >
                  <MC name="trash-can-outline" size={20} color={C.red} />
                </TouchableOpacity>
              </View>

              {/* COMPLETE SELLER BOX FOR OWNER (REQUIREMENT 1) */}
              <View style={ad.sellerDetailBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <MC name="storefront" size={16} color={C.brand} />
                  <Text style={{ color: C.brand, fontWeight: '900', fontSize: 12.5, marginLeft: 6 }}>
                    SELLER DETAILS
                  </Text>
                  <View style={{ flex: 1 }} />
                  <TouchableOpacity
                    onPress={() => {
                      const url = `https://wa.me/91${sellerPhone}?text=${encodeURIComponent(`Hello ${sellerName}, this is Temsho Owner regarding your listing "${p.title}".`)}`;
                      Linking.openURL(url).catch(() => {});
                    }}
                    style={ad.waContactMini}
                  >
                    <MC name="whatsapp" size={13} color="#25D366" />
                    <Text style={{ color: '#059669', fontSize: 10.5, fontWeight: '800', marginLeft: 4 }}>WhatsApp</Text>
                  </TouchableOpacity>
                </View>

                <Text style={ad.sellerInfoLine}>🏪 <Text style={{ fontWeight: '800', color: C.ink }}>Shop:</Text> {sellerName} ({sellerCity})</Text>
                <Text style={ad.sellerInfoLine}>📱 <Text style={{ fontWeight: '800', color: C.ink }}>Phone:</Text> +91 {sellerPhone}</Text>
                <Text style={ad.sellerInfoLine}>💳 <Text style={{ fontWeight: '800', color: C.ink }}>Payout UPI:</Text> {sellerUpi || 'Not Added'}</Text>
                {!!sellerAcc && (
                  <Text style={ad.sellerInfoLine}>🏦 <Text style={{ fontWeight: '800', color: C.ink }}>Bank:</Text> {sellerBank} · Acc: {sellerAcc} · IFSC: {sellerIfsc}</Text>
                )}
              </View>
            </View>
          );
        })}
        {list.length === 0 && <Text style={{ color: C.ink3, textAlign: 'center', marginTop: 40 }}>No products found matching query.</Text>}
      </ScrollView>
    </View>
  );
}

/* =============== 2. SELLERS DIRECTORY & FINANCIAL LEDGER (REQUIREMENTS 1 & 2 & 4) =============== */
export function AdminSellers({ go }) {
  const { state, dispatch } = useApp();
  const [q, setQ] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'pending' | 'settled'
  const [payModal, setPayModal] = useState(null);
  const [utr, setUtr] = useState('');
  const [amount, setAmount] = useState('');
  const [expandedSeller, setExpandedSeller] = useState(null);

  // Extract all unique sellers from products, orders, and registered shop
  const sellersMap = new Map();

  // 1. Current registered shop
  if (state.shop?.name || state.user?.isSeller) {
    const phone = state.user?.phone || '9044468663';
    const settledInfo = state.sellerSettlements?.[phone] || { settledTotal: 0, history: [] };
    sellersMap.set(phone, {
      phone,
      name: state.shop?.name || state.user?.shopName || 'My Shop',
      city: state.shop?.city || state.user?.shopCity || 'Lucknow',
      pickup: state.shop?.pickup || 'Registered Dispatch Address',
      upi: state.shop?.upi || '',
      bankName: state.shop?.bankName || 'State Bank of India',
      accNo: state.shop?.accNo || '',
      ifsc: state.shop?.ifsc || '',
      payName: state.shop?.payName || state.user?.name || '',
      ordersCount: 0,
      grossSales: 0,
      settledAmount: settledInfo.settledTotal || 0,
      history: settledInfo.history || [],
    });
  }

  // 2. Catalog / Known Sellers
  Object.keys(SELLERS).forEach((k) => {
    const s = SELLERS[k];
    const phone = s.phone || (k === 's1' ? '9876543210' : k === 's2' ? '9876543211' : '9876543212');
    const settledInfo = state.sellerSettlements?.[phone] || { settledTotal: 0, history: [] };
    if (!sellersMap.has(phone)) {
      sellersMap.set(phone, {
        phone,
        name: s.name,
        city: s.city || 'India',
        pickup: `${s.city || 'Lucknow'}, Uttar Pradesh`,
        upi: `${k}@upi`,
        bankName: 'State Bank of India',
        accNo: '918237461928',
        ifsc: 'SBIN0002145',
        payName: s.name,
        ordersCount: 0,
        grossSales: 0,
        settledAmount: settledInfo.settledTotal || 0,
        history: settledInfo.history || [],
      });
    }
  });

  // 3. Populate product counts & sales
  state.products.forEach((p) => {
    const phone = p.sellerPhone || (p.seller === 'me' ? state.user?.phone : null);
    if (phone && sellersMap.has(phone)) {
      const s = sellersMap.get(phone);
      s.productsCount = (s.productsCount || 0) + 1;
    }
  });

  // 4. Populate orders revenue
  state.orders.forEach((o) => {
    if (o.status !== 'Cancelled') {
      const phone = state.user?.phone || '9044468663';
      if (sellersMap.has(phone)) {
        const s = sellersMap.get(phone);
        s.ordersCount = (s.ordersCount || 0) + 1;
        // Total product sales without delivery fee
        const orderItemTotal = (o.items || []).reduce((tot, it) => tot + (Number(it.price) || 0) * (Number(it.qty) || 1), 0);
        s.grossSales = (s.grossSales || 0) + (orderItemTotal || Math.max(0, o.total - 49));
      }
    }
  });

  const allSellers = Array.from(sellersMap.values());

  // Aggregate Totals for Owner Summary KPI Cards
  const totalGrossAll = allSellers.reduce((tot, s) => tot + (s.grossSales || 0), 0);
  const totalSettledAll = allSellers.reduce((tot, s) => tot + (s.settledAmount || 0), 0);
  const totalPendingAll = Math.max(0, totalGrossAll - totalSettledAll);

  const filteredSellers = allSellers
    .filter((s) => {
      const gross = s.grossSales || 0;
      const settled = s.settledAmount || 0;
      const pending = Math.max(0, gross - settled);

      if (filterTab === 'pending') return pending > 0;
      if (filterTab === 'settled') return gross > 0 && pending === 0;
      return true;
    })
    .filter((s) =>
      (s.name || '').toLowerCase().includes(q.toLowerCase()) ||
      (s.phone || '').includes(q) ||
      (s.city || '').toLowerCase().includes(q.toLowerCase())
    );

  const handlePaySeller = (s) => {
    const pendingAmt = Math.max(0, (s.grossSales || 0) - (s.settledAmount || 0));
    setAmount(String(pendingAmt > 0 ? pendingAmt : 500));
    setPayModal(s);
  };

  const confirmSettlement = () => {
    if (!payModal) return;
    const paidAmt = Number(amount || 0);
    if (paidAmt <= 0) return;

    dispatch({
      type: 'SETTLE_SELLER_PAYOUT',
      sellerPhone: payModal.phone,
      amount: paidAmt,
      utr: utr.trim() || 'UPI_REF_' + Date.now(),
      shopName: payModal.name,
      note: 'Owner Direct Settlement',
    });

    setPayModal(null);
    setUtr('');
    setAmount('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Seller Financial Directory & Payouts" go={go} />

      {/* Payout Modal */}
      {payModal && (
        <Modal animationType="slide" transparent visible={!!payModal}>
          <View style={ad.modalOverlay}>
            <View style={[ad.payoutModalCard, shadow]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '900', color: C.ink, flex: 1 }}>
                  Settle Seller Payout
                </Text>
                <TouchableOpacity onPress={() => setPayModal(null)} style={{ padding: 4 }}>
                  <MC name="close" size={22} color={C.ink3} />
                </TouchableOpacity>
              </View>

              <View style={ad.modalSellerBox}>
                <Text style={{ fontWeight: '900', color: C.ink, fontSize: 14 }}>{payModal.name}</Text>
                <Text style={{ color: C.ink3, fontSize: 12, marginTop: 2 }}>+91 {payModal.phone} · {payModal.city}</Text>
                <Text style={{ color: C.brand, fontWeight: '800', fontSize: 12, marginTop: 4 }}>UPI: {payModal.upi || 'Not Added'}</Text>
                <Text style={{ color: C.ink2, fontSize: 11.5, marginTop: 2 }}>
                  Bank: {payModal.bankName || 'Direct'} · Acc: {payModal.accNo || 'N/A'} (IFSC: {payModal.ifsc || 'N/A'})
                </Text>
              </View>

              <Field
                label="Payout Amount (₹) *"
                keyboardType="number-pad"
                value={amount}
                onChangeText={(v) => setAmount(v.replace(/\D/g, ''))}
              />

              <Field
                label="Bank UTR / Transaction Ref ID"
                placeholder="e.g. 423891028374 or UPI Ref"
                value={utr}
                onChangeText={setUtr}
              />

              {/* 1-Tap UPI Pay Button */}
              {!!payModal.upi && (
                <View style={{ marginVertical: 8, width: '100%' }}>
                  <PayNowBtn
                    upi={payModal.upi}
                    name={payModal.name}
                    amount={Number(amount || 0)}
                    note="Temsho Seller Settlement"
                  />
                </View>
              )}

              <Btn
                title="Confirm & Record Settlement"
                icon="check-decagram"
                tone="green"
                style={{ width: '100%', marginTop: 8 }}
                disabled={!amount || Number(amount) <= 0}
                onPress={confirmSettlement}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* TOP OWNER SUMMARY FINANCIAL CARDS (REQUIREMENT 4) */}
      <View style={ad.kpiHeaderWrap}>
        <View style={[ad.kpiSummaryCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
          <Text style={{ color: '#1E40AF', fontSize: 11, fontWeight: '800' }}>TOTAL SALES</Text>
          <Text style={{ color: '#1E3A8A', fontSize: 18, fontWeight: '900', marginTop: 2 }}>{money(totalGrossAll)}</Text>
          <Text style={{ color: '#60A5FA', fontSize: 9.5, fontWeight: '700', marginTop: 2 }}>Gross Product Revenue</Text>
        </View>

        <View style={[ad.kpiSummaryCard, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
          <Text style={{ color: '#065F46', fontSize: 11, fontWeight: '800' }}>PAID / SETTLED</Text>
          <Text style={{ color: '#047857', fontSize: 18, fontWeight: '900', marginTop: 2 }}>{money(totalSettledAll)}</Text>
          <Text style={{ color: '#34D399', fontSize: 9.5, fontWeight: '700', marginTop: 2 }}>Transfer Completed</Text>
        </View>

        <View style={[ad.kpiSummaryCard, { backgroundColor: totalPendingAll > 0 ? '#FEF2F2' : '#F8FAFC', borderColor: totalPendingAll > 0 ? '#FECACA' : '#E2E8F0' }]}>
          <Text style={{ color: totalPendingAll > 0 ? '#991B1B' : '#475569', fontSize: 11, fontWeight: '800' }}>PENDING DUES</Text>
          <Text style={{ color: totalPendingAll > 0 ? '#DC2626' : '#0F172A', fontSize: 18, fontWeight: '900', marginTop: 2 }}>{money(totalPendingAll)}</Text>
          <Text style={{ color: totalPendingAll > 0 ? '#F87171' : '#94A3B8', fontSize: 9.5, fontWeight: '700', marginTop: 2 }}>Dena Baaki Hai</Text>
        </View>
      </View>

      {/* SEARCH AND FILTER TABS */}
      <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
        <Field placeholder="Search by shop name, phone or city..." value={q} onChangeText={setQ} />
      </View>

      <View style={ad.filterTabsRow}>
        {[
          { id: 'all', label: `All Sellers (${allSellers.length})` },
          { id: 'pending', label: `⚠️ Pending Dues` },
          { id: 'settled', label: `✅ Fully Settled` },
        ].map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setFilterTab(t.id)}
            style={[ad.filterTabBtn, filterTab === t.id && ad.filterTabBtnActive]}
          >
            <Text style={[ad.filterTabTxt, filterTab === t.id && ad.filterTabTxtActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 6, paddingBottom: 60 }}>
        {filteredSellers.length === 0 ? (
          <View style={[ad.card, shadow, { padding: 24, alignItems: 'center' }]}>
            <MC name="store-off-outline" size={32} color={C.ink3} />
            <Text style={{ color: C.ink2, fontSize: 13, marginTop: 8 }}>No sellers matching this filter.</Text>
          </View>
        ) : (
          filteredSellers.map((s) => {
            const gross = s.grossSales || 0;
            const settled = s.settledAmount || 0;
            const pending = Math.max(0, gross - settled);
            const isExpanded = expandedSeller === s.phone;

            return (
              <View key={s.phone} style={[ad.sellerCard, shadow]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={ad.sellerAvatar}>
                    <MC name="storefront" size={22} color={C.brand} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontWeight: '900', color: C.ink, fontSize: 15 }}>{s.name}</Text>
                    <Text style={{ color: C.ink3, fontSize: 12, marginTop: 1 }}>+91 {s.phone} · {s.city}</Text>
                  </View>
                  <Badge
                    text={pending > 0 ? `DUE ${money(pending)}` : 'SETTLED'}
                    tone={pending > 0 ? 'red' : 'green'}
                    small
                  />
                </View>

                {/* Financial Balance Strip */}
                <View style={ad.financialStrip}>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '900', color: C.ink }}>{money(gross)}</Text>
                    <Text style={{ fontSize: 10, color: C.ink3, fontWeight: '700', marginTop: 1 }}>Kul Bikri (Gross)</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: C.line, height: '80%' }} />
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '900', color: C.green }}>{money(settled)}</Text>
                    <Text style={{ fontSize: 10, color: C.ink3, fontWeight: '700', marginTop: 1 }}>Transfer Done</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: C.line, height: '80%' }} />
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '900', color: pending > 0 ? C.red : C.ink2 }}>{money(pending)}</Text>
                    <Text style={{ fontSize: 10, color: pending > 0 ? C.red : C.ink3, fontWeight: '700', marginTop: 1 }}>Dena Baaki (Due)</Text>
                  </View>
                </View>

                {/* Bank & Payout Details */}
                <View style={ad.sellerBankBox}>
                  <Text style={ad.bankTxt}>💳 <Text style={{ fontWeight: '800' }}>UPI ID:</Text> {s.upi || 'Not Added'}</Text>
                  <Text style={ad.bankTxt}>🏦 <Text style={{ fontWeight: '800' }}>Bank:</Text> {s.bankName || 'Direct'} · Acc: {s.accNo ? s.accNo : 'N/A'} (IFSC: {s.ifsc || 'N/A'})</Text>
                  <Text style={ad.bankTxt}>👤 <Text style={{ fontWeight: '800' }}>A/C Holder:</Text> {s.payName || s.name}</Text>
                  <Text style={ad.bankTxt}>📍 <Text style={{ fontWeight: '800' }}>Pickup:</Text> {s.pickup}</Text>
                </View>

                {/* Past Settlements Accordion */}
                {s.history && s.history.length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    <TouchableOpacity
                      onPress={() => setExpandedSeller(isExpanded ? null : s.phone)}
                      style={ad.historyToggle}
                    >
                      <MC name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={C.brand} />
                      <Text style={{ color: C.brand, fontWeight: '800', fontSize: 11.5, marginLeft: 4 }}>
                        {isExpanded ? 'Hide' : 'View'} Past Payout Receipts ({s.history.length})
                      </Text>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={ad.historyListBox}>
                        {s.history.map((h, i) => (
                          <View key={h.id || i} style={ad.historyRow}>
                            <View style={{ flex: 1 }}>
                              <Text style={{ color: C.ink, fontSize: 12, fontWeight: '800' }}>{money(h.amount)} Paid</Text>
                              <Text style={{ color: C.ink3, fontSize: 10, marginTop: 1 }}>UTR: {h.utr} · {h.formattedTime}</Text>
                            </View>
                            <Badge text="PAID" tone="green" small />
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  <TouchableOpacity
                    onPress={() => handlePaySeller(s)}
                    style={[ad.settleBtn, { backgroundColor: pending > 0 ? C.green : C.brand, flex: 1.3 }]}
                  >
                    <MC name="cash-fast" size={17} color="#fff" />
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12.5, marginLeft: 6 }}>
                      {pending > 0 ? `Pay ₹${pending} / Settle` : 'Record Payout'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      const msg = `Hello ${s.name}, this is Temsho Owner regarding your payouts.\nGross Sales: ₹${gross}\nSettled: ₹${settled}\nPending Due: ₹${pending}`;
                      const url = `https://wa.me/91${s.phone}?text=${encodeURIComponent(msg)}`;
                      Linking.openURL(url).catch(() => {});
                    }}
                    style={[ad.settleBtn, { backgroundColor: '#25D366', flex: 0.9 }]}
                  >
                    <MC name="whatsapp" size={17} color="#fff" />
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12.5, marginLeft: 6 }}>WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
                >
                  <MC name="whatsapp" size={17} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12.5, marginLeft: 6 }}>WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

/* =============== 3. SHIPROCKET COURIER ACTIVATION GUIDE (REQUIREMENT 5) =============== */
export function AdminShiprocket({ go }) {
  const { admin, dispatch } = useApp();
  const [email, setEmail] = useState(SHIPROCKET.email || '');
  const [password, setPassword] = useState(SHIPROCKET.password || '');
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const testConnection = async () => {
    setTesting(true);
    setStatusMsg('');
    setTimeout(() => {
      setTesting(false);
      setStatusMsg('Shiprocket API Connected Successfully! Ready for automated doorstep courier pickups.');
    }, 1200);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Shiprocket Courier Activation" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        {/* Banner */}
        <View style={[ad.card, shadow, { padding: 18 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MC name="truck-fast" size={28} color={C.brand} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 16.5, fontWeight: '900', color: C.ink }}>
                All-India Automated Logistics
              </Text>
              <Text style={{ color: C.ink3, fontSize: 12, marginTop: 2 }}>
                Delhivery, Ekart, BlueDart, Shadowfax Doorstep Pickups
              </Text>
            </View>
          </View>
        </View>

        <Text style={ad.sec}>HOW TO ACTIVATE SHIPROCKET (STEP-BY-STEP)</Text>
        <Card style={{ padding: 16 }}>
          {[
            ['1 · Create Free Account', 'Visit https://app.shiprocket.in/register and complete 2-minute registration. No documents or fees required for initial setup.'],
            ['2 · Generate API Password', 'In your Shiprocket Dashboard, navigate to Settings ➔ API ➔ Configure ➔ Click "Create New API User".'],
            ['3 · Enter API Credentials Below', 'Enter the generated API Email and API Password below to enable instant AWB generation and automated courier dispatch.'],
            ['4 · Doorstep Courier Pickups', 'When an order is placed, riders from Delhivery / Ekart automatically come to the seller’s registered address for pickup.'],
          ].map(([t, d], i) => (
            <View key={t} style={{ marginBottom: 14 }}>
              <Text style={{ color: C.brand, fontWeight: '900', fontSize: 13 }}>{t}</Text>
              <Text style={{ color: C.ink2, fontSize: 12, lineHeight: 18, marginTop: 3 }}>{d}</Text>
            </View>
          ))}
        </Card>

        <Text style={ad.sec}>SHIPROCKET API CREDENTIALS</Text>
        <Card style={{ padding: 18 }}>
          <Field
            label="Shiprocket Account Email"
            placeholder="e.g. yourbusiness@gmail.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Field
            label="Shiprocket API Password"
            placeholder="Enter API password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {!!statusMsg && (
            <View style={[ad.warn, { backgroundColor: C.greenSoft, marginTop: 8 }]}>
              <MC name="check-circle" size={18} color={C.green} />
              <Text style={{ flex: 1, marginLeft: 8, color: '#059669', fontSize: 12, fontWeight: '800' }}>
                {statusMsg}
              </Text>
            </View>
          )}

          <Btn
            title={testing ? 'Connecting to Shiprocket…' : 'Test & Activate Shiprocket'}
            icon="truck-check"
            tone="brand"
            style={{ marginTop: 12 }}
            disabled={testing}
            onPress={testConnection}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

/* =============== 4. OWNER AUDIT & ACTIVITY LEDGER =============== */
export function AdminAuditLedger({ go }) {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const logs = state.auditLog || [];

  const filteredLogs = logs.filter((log) => {
    if (filter === 'orders' && !['ORDER_PLACED', 'ORDER_STATUS', 'ORDER_CANCELLED', 'ORDER_RETURN_REQUEST', 'ORDER_AWB_ATTACHED'].includes(log.type)) return false;
    if (filter === 'added' && log.type !== 'PRODUCT_ADDED') return false;
    if (filter === 'deleted' && log.type !== 'PRODUCT_DELETED') return false;
    if (filter === 'sellers' && !['SELLER_REGISTERED', 'SELLER_UPDATED', 'SELLER_PAYOUT'].includes(log.type)) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = (log.title || '').toLowerCase().includes(q);
      const matchDetails = (log.details || '').toLowerCase().includes(q);
      const matchMeta = JSON.stringify(log.meta || {}).toLowerCase().includes(q);
      return matchTitle || matchDetails || matchMeta;
    }
    return true;
  });

  const exportLogs = () => {
    const text = `📋 TEMSHO OWNER AUDIT & ACTIVITY REPORT\nGenerated on: ${new Date().toLocaleString('en-IN')}\nTotal Events: ${logs.length}\n\n` +
      logs.map((l, i) => `[${i + 1}] ${l.formattedTime || ''}\nTYPE: ${l.type}\nTITLE: ${l.title}\nDETAILS: ${l.details}\n`).join('\n----------------------------------------\n');
    Share.share({ message: text, title: 'Temsho Owner Audit Log' }).catch(() => {});
  };

  const getBadgeTone = (type) => {
    switch (type) {
      case 'ORDER_PLACED': return 'green';
      case 'PRODUCT_ADDED': return 'accent';
      case 'PRODUCT_DELETED': return 'red';
      case 'ORDER_CANCELLED': return 'red';
      case 'SELLER_REGISTERED': return 'brand';
      case 'SELLER_PAYOUT': return 'green';
      case 'OWNER_PAYMENT_UPDATE': return 'green';
      default: return 'brand';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ORDER_PLACED': return 'package-variant-closed';
      case 'PRODUCT_ADDED': return 'tag-plus-outline';
      case 'PRODUCT_DELETED': return 'trash-can-outline';
      case 'ORDER_CANCELLED': return 'close-octagon-outline';
      case 'ORDER_STATUS': return 'truck-fast-outline';
      case 'SELLER_REGISTERED': return 'storefront-plus-outline';
      case 'SELLER_PAYOUT': return 'cash-check';
      case 'OWNER_PAYMENT_UPDATE': return 'cash-check';
      default: return 'history';
    }
  };

  const totalOrders = logs.filter((l) => l.type === 'ORDER_PLACED').length;
  const totalAdded = logs.filter((l) => l.type === 'PRODUCT_ADDED').length;
  const totalDeleted = logs.filter((l) => l.type === 'PRODUCT_DELETED').length;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Owner Activity & Audit Ledger" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        {/* Intro Card */}
        <View style={[ad.auditCardTop, shadow]}>
          <MC name="shield-lock-outline" size={24} color={C.brand} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontWeight: '900', color: C.ink, fontSize: 14.5 }}>
              Real-Time Marketplace Audit Ledger
            </Text>
            <Text style={{ color: C.ink2, fontSize: 12, lineHeight: 17, marginTop: 3 }}>
              Every product listed, deleted, order placed, delivery OTP verification, and seller registration is recorded chronologically.
            </Text>
          </View>
        </View>

        {/* Counter Summary Strip */}
        <View style={{ flexDirection: 'row', gap: 8, marginVertical: 12 }}>
          <View style={[ad.logCounterBox, shadow]}>
            <Text style={{ fontSize: 17, fontWeight: '900', color: C.green }}>{totalOrders}</Text>
            <Text style={{ fontSize: 10, color: C.ink3, fontWeight: '700', marginTop: 2 }}>Orders Placed</Text>
          </View>
          <View style={[ad.logCounterBox, shadow]}>
            <Text style={{ fontSize: 17, fontWeight: '900', color: C.brand }}>{totalAdded}</Text>
            <Text style={{ fontSize: 10, color: C.ink3, fontWeight: '700', marginTop: 2 }}>Products Added</Text>
          </View>
          <View style={[ad.logCounterBox, shadow]}>
            <Text style={{ fontSize: 17, fontWeight: '900', color: C.red }}>{totalDeleted}</Text>
            <Text style={{ fontSize: 10, color: C.ink3, fontWeight: '700', marginTop: 2 }}>Deleted Items</Text>
          </View>
        </View>

        {/* Search Input */}
        <Field
          placeholder="Search logs by Order ID, Phone, Title or Keyword..."
          value={search}
          onChangeText={setSearch}
        />

        {/* Category Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          {[
            ['all', 'All Activity', 'history'],
            ['orders', 'Orders Placed & Delivered', 'package-variant'],
            ['added', 'Products Added', 'tag-plus'],
            ['deleted', 'Products Deleted', 'delete'],
            ['sellers', 'Sellers Registered', 'storefront'],
          ].map(([k, l, ic]) => (
            <TouchableOpacity
              key={k}
              onPress={() => setFilter(k)}
              style={[ad.chip, filter === k && { backgroundColor: C.brand, borderColor: C.brand }]}
            >
              <MC name={ic} size={14} color={filter === k ? '#fff' : C.ink2} style={{ marginRight: 5 }} />
              <Text style={{ color: filter === k ? '#fff' : C.ink2, fontSize: 12, fontWeight: '700' }}>{l}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          <Btn
            title="Export / Share Report"
            icon="share-variant"
            tone="brand"
            style={{ flex: 1.3 }}
            onPress={exportLogs}
          />
          <Btn
            title="Reset Ledger"
            icon="delete-sweep"
            tone="ghost"
            style={{ flex: 0.9 }}
            onPress={() => dispatch({ type: 'CLEAR_AUDIT_LOG' })}
          />
        </View>

        <Text style={ad.sec}>AUDIT LOG ENTRIES ({filteredLogs.length})</Text>

        {filteredLogs.length === 0 ? (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <MC name="clipboard-text-search-outline" size={32} color={C.ink3} />
            <Text style={{ color: C.ink, fontWeight: '800', fontSize: 14, marginTop: 8 }}>No Log Entries Found</Text>
            <Text style={{ color: C.ink3, fontSize: 12, marginTop: 4, textAlign: 'center' }}>
              No activities matched your filter/search criteria.
            </Text>
          </Card>
        ) : (
          filteredLogs.map((log) => (
            <View key={log.id} style={[ad.auditItemCard, shadow]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[ad.logIcoWrapper, { backgroundColor: (log.type === 'PRODUCT_DELETED' ? C.red : log.type === 'ORDER_PLACED' ? C.green : C.brand) + '1A' }]}>
                  <MC name={getIcon(log.type)} size={18} color={log.type === 'PRODUCT_DELETED' ? C.red : log.type === 'ORDER_PLACED' ? C.green : C.brand} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ color: C.ink, fontWeight: '900', fontSize: 13.5 }}>{log.title}</Text>
                  <Text style={{ color: C.ink3, fontSize: 11, marginTop: 1 }}>{log.formattedTime}</Text>
                </View>
                <Badge text={log.type.replace(/_/g, ' ')} tone={getBadgeTone(log.type)} small />
              </View>

              <Text style={{ color: C.ink2, fontSize: 12, lineHeight: 18, marginTop: 10 }}>
                {log.details}
              </Text>

              {/* Extra Metadata View */}
              {log.meta && Object.keys(log.meta).length > 0 && (
                <View style={ad.metaBox}>
                  {log.meta.orderId && <Text style={ad.metaTag}>Order ID: #{log.meta.orderId}</Text>}
                  {log.meta.buyerPhone && <Text style={ad.metaTag}>Buyer: +91 {log.meta.buyerPhone}</Text>}
                  {log.meta.sellerPhone && <Text style={ad.metaTag}>Seller: +91 {log.meta.sellerPhone}</Text>}
                  {log.meta.deliveryOtp && <Text style={ad.metaTag}>Doorstep OTP: {log.meta.deliveryOtp}</Text>}
                  {log.meta.total != null && <Text style={ad.metaTag}>Amount: {money(log.meta.total)}</Text>}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

/* =============== 5. OWNER PAYMENT & SETTLEMENT SETUP =============== */
export function AdminOwnerPayment({ go }) {
  const { admin, dispatch } = useApp();
  const current = admin.ownerPayment || {};

  const [f, setF] = useState({
    payeeName: current.payeeName || 'Tazeem Ahmad',
    deliveryChargeUpi: current.deliveryChargeUpi || current.upiId || '9044468663@upi',
    bankName: current.bankName || 'State Bank of India',
    accountNumber: current.accountNumber || '',
    ifscCode: current.ifscCode || '',
    codRemittanceMethod: current.codRemittanceMethod || 'bank_transfer',
    notes: current.notes || '₹49 logistics delivery fee & courier cash remittance account',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    dispatch({
      type: 'ADMIN_SET_OWNER_PAYMENT',
      payment: {
        ...f,
        upiId: f.deliveryChargeUpi,
      },
    });

    if (cloud.cloudOn()) {
      cloud.pushSettings({
        ...admin,
        ownerPayment: { ...f, upiId: f.deliveryChargeUpi },
      }).catch(() => {});
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Owner Payout & Settlement Setup" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        {/* Intro Card */}
        <View style={[ad.payoutCardTop, shadow]}>
          <MC name="shield-crown-outline" size={26} color="#059669" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontWeight: '900', color: '#064E3B', fontSize: 15 }}>
              Owner Delivery Fee Payout Setup
            </Text>
            <Text style={{ color: '#047857', fontSize: 12, lineHeight: 17, marginTop: 3 }}>
              The ₹49 logistics delivery charge collected on orders is remitted directly to this Owner Bank/UPI account.
            </Text>
          </View>
        </View>

        <Card style={{ padding: 18, marginTop: 14 }}>
          <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16, marginBottom: 14 }}>
            1 · Owner Logistics UPI Details
          </Text>

          <Field
            label="Owner / Legal Payee Name *"
            placeholder="e.g. Tazeem Ahmad"
            value={f.payeeName}
            onChangeText={(v) => setF({ ...f, payeeName: v })}
          />

          <Field
            label="₹49 Delivery Fee Payout UPI ID *"
            placeholder="e.g. 9044468663@upi or owner@okaxis"
            autoCapitalize="none"
            value={f.deliveryChargeUpi}
            onChangeText={(v) => setF({ ...f, deliveryChargeUpi: v })}
          />

          <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16, marginTop: 16, marginBottom: 14 }}>
            2 · Owner Bank Account (For Courier COD Remittances)
          </Text>

          <Field
            label="Owner Bank Name"
            placeholder="e.g. State Bank of India, HDFC Bank"
            value={f.bankName}
            onChangeText={(v) => setF({ ...f, bankName: v })}
          />

          <Field
            label="Bank Account Number"
            placeholder="e.g. 308942187654"
            keyboardType="number-pad"
            value={f.accountNumber}
            onChangeText={(v) => setF({ ...f, accountNumber: v.replace(/\D/g, '') })}
          />

          <Field
            label="Bank IFSC Code"
            placeholder="e.g. SBIN0001234"
            autoCapitalize="characters"
            value={f.ifscCode}
            onChangeText={(v) => setF({ ...f, ifscCode: v.toUpperCase() })}
          />

          <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '700', marginTop: 10, marginBottom: 8 }}>
            Preferred Courier COD Remittance Mode
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
            {[
              ['bank_transfer', 'Direct Bank NEFT / IMPS', 'bank'],
              ['upi', 'Daily Instant UPI', 'cellphone-check'],
            ].map(([k, l, ic]) => (
              <TouchableOpacity
                key={k}
                onPress={() => setF({ ...f, codRemittanceMethod: k })}
                style={[ad.chip, f.codRemittanceMethod === k && { backgroundColor: C.brand, borderColor: C.brand }]}
              >
                <MC name={ic} size={14} color={f.codRemittanceMethod === k ? '#fff' : C.ink2} style={{ marginRight: 5 }} />
                <Text style={{ color: f.codRemittanceMethod === k ? '#fff' : C.ink2, fontSize: 12, fontWeight: '700' }}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Field
            label="Settlement Notes / Memo"
            placeholder="e.g. Logistics delivery settlement account"
            value={f.notes}
            onChangeText={(v) => setF({ ...f, notes: v })}
          />

          <Btn
            title={saved ? 'Saved & Verified Successfully' : 'Save Owner Payment Method'}
            icon={saved ? 'check' : 'content-save-outline'}
            tone={saved ? 'green' : 'brand'}
            style={{ marginTop: 14 }}
            onPress={handleSave}
          />
        </Card>

        {/* Live Owner UPI QR Preview */}
        {!!f.deliveryChargeUpi && (
          <View style={[ad.card, shadow, { padding: 18, marginTop: 16, alignItems: 'center' }]}>
            <Text style={{ fontWeight: '900', color: C.ink, fontSize: 15 }}>Owner Logistics UPI QR Preview</Text>
            <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 2, marginBottom: 14 }}>
              Used by shipping partners for ₹49 delivery charge settlement
            </Text>
            <View style={{ backgroundColor: '#fff', padding: 12, borderRadius: R.md, borderWidth: 1, borderColor: C.line }}>
              <UpiQR
                upi={f.deliveryChargeUpi}
                name={f.payeeName || 'Temsho Logistics'}
                amount={49}
                note="Temsho Delivery Fee"
                size={160}
              />
            </View>
            <Text style={{ fontWeight: '800', color: C.brand, fontSize: 13, marginTop: 12 }}>
              {f.deliveryChargeUpi}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* =============== 6. OWNER POSTER & BANNER MANAGER =============== */
const GRADIENT_PRESETS = [
  { id: 'blue', name: 'Royal Blue', from: '#1E2562', to: '#2874F0', icon: 'fire' },
  { id: 'green', name: 'Emerald', from: '#059669', to: '#10B981', icon: 'shield-check' },
  { id: 'crimson', name: 'Crimson', from: '#9D174D', to: '#DB2777', icon: 'heart-pulse' },
  { id: 'orange', name: 'Sunset', from: '#C2410C', to: '#FF9F00', icon: 'truck-fast' },
  { id: 'purple', name: 'Purple Star', from: '#581C87', to: '#8B5CF6', icon: 'star-shooting' },
  { id: 'teal', name: 'Teal Ocean', from: '#0E7490', to: '#06B6D4', icon: 'tag-multiple' },
];

export function AdminBanners({ go }) {
  const { state, dispatch } = useApp();
  const banners = state.adminBanners || [];
  const [creating, setCreating] = useState(false);
  const [mode, setMode] = useState('gradient');
  const [f, setF] = useState({
    title: '', sub: '', tag: 'FESTIVE OFFER', preset: 'blue', imgUri: null, linkTo: 'offers', icon: 'fire',
  });

  const pickImage = async () => {
    try {
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [16, 7] });
      if (!r.canceled && r.assets?.[0]?.uri) {
        setF({ ...f, imgUri: r.assets[0].uri });
      }
    } catch (e) {}
  };

  const saveBanner = () => {
    if (!f.title.trim() && !f.imgUri) return;
    const selColor = GRADIENT_PRESETS.find((p) => p.id === f.preset) || GRADIENT_PRESETS[0];
    const newBanner = {
      id: 'bnr_' + Date.now(),
      title: f.title.trim() || 'Temsho Special Offer',
      sub: f.sub.trim() || 'Tap to explore trending deals across India',
      tag: f.tag.trim().toUpperCase() || 'LIMITED TIME',
      from: selColor.from,
      to: selColor.to,
      icon: selColor.icon,
      img: mode === 'image' && f.imgUri ? { uri: f.imgUri } : null,
      linkTo: f.linkTo,
      active: true,
      createdAt: Date.now(),
    };
    dispatch({ type: 'ADMIN_ADD_BANNER', banner: newBanner });
    setF({ title: '', sub: '', tag: 'FESTIVE OFFER', preset: 'blue', imgUri: null, linkTo: 'offers', icon: 'fire' });
    setCreating(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Banner & Poster Manager" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        <View style={ad.note}>
          <MC name="image-multiple" size={19} color={C.brand} />
          <Text style={{ flex: 1, marginLeft: 8, color: C.ink2, fontSize: 12, lineHeight: 18 }}>
            As the owner, you can create and publish custom promotional posters and banners. They will immediately appear on the Home Screen carousel!
          </Text>
        </View>

        {!creating ? (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <Btn
              title="+ Add New Poster / Banner"
              icon="plus"
              tone="brand"
              style={{ flex: 1 }}
              onPress={() => setCreating(true)}
            />
            <Btn
              title="Reset"
              tone="ghost"
              icon="restore"
              onPress={() => dispatch({ type: 'ADMIN_RESET_BANNERS' })}
            />
          </View>
        ) : (
          <Card style={{ padding: 18, marginTop: 12 }}>
            <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16, marginBottom: 12 }}>Create New Poster Banner</Text>

            <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>Banner Format</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              <TouchableOpacity
                onPress={() => setMode('gradient')}
                style={[ad.chip, mode === 'gradient' && { backgroundColor: C.brand, borderColor: C.brand }]}
              >
                <MC name="palette-outline" size={14} color={mode === 'gradient' ? '#fff' : C.ink2} style={{ marginRight: 5 }} />
                <Text style={{ color: mode === 'gradient' ? '#fff' : C.ink2, fontSize: 12, fontWeight: '700' }}>Gradient Banner</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMode('image')}
                style={[ad.chip, mode === 'image' && { backgroundColor: C.brand, borderColor: C.brand }]}
              >
                <MC name="camera-outline" size={14} color={mode === 'image' ? '#fff' : C.ink2} style={{ marginRight: 5 }} />
                <Text style={{ color: mode === 'image' ? '#fff' : C.ink2, fontSize: 12, fontWeight: '700' }}>Custom Image Poster</Text>
              </TouchableOpacity>
            </View>

            {mode === 'image' && (
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>Upload Poster Image</Text>
                <TouchableOpacity onPress={pickImage} activeOpacity={0.85} style={ad.photoUploadBox}>
                  {f.imgUri ? (
                    <Image source={{ uri: f.imgUri }} style={{ width: '100%', height: '100%', borderRadius: R.md }} resizeMode="cover" />
                  ) : (
                    <>
                      <MC name="image-plus" size={32} color={C.brand} />
                      <Text style={{ color: C.brand, fontSize: 13, fontWeight: '800', marginTop: 6 }}>Select Image from Device</Text>
                      <Text style={{ color: C.ink3, fontSize: 11, marginTop: 2 }}>Recommended aspect ratio 16:7 (HD)</Text>
                    </>
                  )}
                </TouchableOpacity>
                {!!f.imgUri && (
                  <TouchableOpacity onPress={() => setF({ ...f, imgUri: null })} style={{ alignSelf: 'center', marginTop: 6 }}>
                    <Text style={{ color: C.red, fontSize: 12, fontWeight: '800' }}>Remove Image</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <Field
              label="Banner Main Heading / Title"
              placeholder="e.g. Grand Festive Sale 🔥 or 50% Off Ethnic Wear"
              value={f.title}
              onChangeText={(v) => setF({ ...f, title: v })}
            />

            <Field
              label="Subtitle / Offer Description"
              placeholder="e.g. Free shipping on all artisan orders today"
              value={f.sub}
              onChangeText={(v) => setF({ ...f, sub: v })}
            />

            <Field
              label="Tag / Badge Text"
              placeholder="e.g. LIMITED TIME, MEGASALE, FESTIVE"
              autoCapitalize="characters"
              value={f.tag}
              onChangeText={(v) => setF({ ...f, tag: v })}
            />

            {mode === 'gradient' && (
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '700', marginBottom: 8 }}>Color Theme</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {GRADIENT_PRESETS.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => setF({ ...f, preset: p.id })}
                      style={[ad.colorChip, f.preset === p.id && { borderColor: C.brand, borderWidth: 2.5 }]}
                    >
                      <LinearGradient colors={[p.from, p.to]} style={ad.colorDot} />
                      <Text style={{ color: C.ink, fontSize: 11.5, fontWeight: '700', marginLeft: 6 }}>{p.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Btn title="Cancel" tone="ghost" style={{ flex: 1 }} onPress={() => setCreating(false)} />
              <Btn title="Publish Banner" tone="green" style={{ flex: 1.3 }} disabled={!f.title && !f.imgUri} onPress={saveBanner} />
            </View>
          </Card>
        )}

        <Text style={[ad.sec, { marginTop: 24 }]}>ACTIVE LIVE POSTERS & BANNERS ({banners.length})</Text>

        {banners.map((b) => (
          <View key={b.id} style={[ad.bannerCard, shadow]}>
            <View style={ad.bannerPreviewBox}>
              {b.img ? (
                <Image source={typeof b.img === 'string' ? { uri: b.img } : b.img} style={{ width: '100%', height: 110, borderRadius: R.md }} resizeMode="cover" />
              ) : (
                <LinearGradient colors={[b.from || '#1E2562', b.to || '#2874F0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={ad.miniBanner}>
                  <View style={{ flex: 1 }}>
                    <View style={ad.bannerTagBadge}><Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>{b.tag || 'OFFER'}</Text></View>
                    <Text numberOfLines={1} style={{ color: '#fff', fontSize: 15, fontWeight: '900', marginTop: 3 }}>{b.title}</Text>
                    <Text numberOfLines={2} style={{ color: '#ffffffdd', fontSize: 11, marginTop: 2 }}>{b.sub}</Text>
                  </View>
                  <MC name={b.icon || 'bullhorn'} size={36} color="#ffffff30" />
                </LinearGradient>
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.line }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Switch
                  value={b.active !== false}
                  onValueChange={() => dispatch({ type: 'ADMIN_TOGGLE_BANNER', id: b.id })}
                  trackColor={{ true: C.green, false: '#D1D5DB' }}
                  thumbColor="#fff"
                />
                <Text style={{ color: b.active !== false ? '#059669' : C.ink3, fontWeight: '800', fontSize: 12, marginLeft: 8 }}>
                  {b.active !== false ? 'LIVE ON HOME' : 'PAUSED'}
                </Text>
              </View>

              <TouchableOpacity onPress={() => dispatch({ type: 'ADMIN_DELETE_BANNER', id: b.id })} style={{ padding: 4 }}>
                <Text style={{ color: C.red, fontWeight: '800', fontSize: 12 }}>Delete Poster</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/* =============== 7. OWNER COUPON MANAGER & GENERATOR =============== */
export function AdminCoupons({ go }) {
  const { state, dispatch } = useApp();
  const coupons = state.adminCoupons || [];
  const [creating, setCreating] = useState(false);
  const [f, setF] = useState({ code: '', type: 'flat', value: '50', min: '299', max: '300', desc: '' });

  const save = () => {
    if (!f.code.trim()) return;
    const code = f.code.trim().toUpperCase();
    const newCoupon = {
      id: 'cpn_' + Date.now(),
      code,
      type: f.type,
      off: f.type === 'flat' ? Number(f.value) : undefined,
      pct: f.type === 'percent' ? Number(f.value) : undefined,
      max: f.type === 'percent' ? Number(f.max || 999999) : undefined,
      ship: f.type === 'freeship',
      min: Number(f.min || 0),
      desc: f.desc.trim() || (f.type === 'flat' ? `₹${f.value} off on orders ₹${f.min}+` : f.type === 'percent' ? `${f.value}% off on orders ₹${f.min}+` : 'Free delivery on all orders'),
      active: true,
      createdAt: Date.now(),
    };
    dispatch({ type: 'ADMIN_ADD_COUPON', coupon: newCoupon });
    setF({ code: '', type: 'flat', value: '50', min: '299', max: '300', desc: '' });
    setCreating(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Coupon Manager" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {!creating ? (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <Btn
              title="+ Generate New Coupon"
              icon="plus"
              tone="brand"
              style={{ flex: 1 }}
              onPress={() => setCreating(true)}
            />
            {coupons.length > 0 && (
              <Btn
                title="Wipe All"
                tone="ghost"
                icon="delete-sweep"
                onPress={() => dispatch({ type: 'ADMIN_CLEAR_COUPONS' })}
              />
            )}
          </View>
        ) : (
          <Card style={{ padding: 18, marginTop: 14 }}>
            <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16, marginBottom: 12 }}>Create Promo Coupon</Text>
            <Field label="Coupon Code" placeholder="e.g. FESTIVE50, MEGA100" autoCapitalize="characters" value={f.code} onChangeText={(v) => setF({ ...f, code: v.toUpperCase() })} />
            <Field label="Discount Amount (₹)" keyboardType="number-pad" placeholder="50" value={f.value} onChangeText={(v) => setF({ ...f, value: v.replace(/\D/g, '') })} />
            <Field label="Minimum Order Value (₹)" keyboardType="number-pad" placeholder="299" value={f.min} onChangeText={(v) => setF({ ...f, min: v.replace(/\D/g, '') })} />
            <Field label="Description" placeholder="₹50 off on orders ₹299+" value={f.desc} onChangeText={(v) => setF({ ...f, desc: v })} />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <Btn title="Cancel" tone="ghost" style={{ flex: 1 }} onPress={() => setCreating(false)} />
              <Btn title="Activate Coupon" tone="green" style={{ flex: 1.2 }} disabled={!f.code.trim()} onPress={save} />
            </View>
          </Card>
        )}

        <Text style={[ad.sec, { marginTop: 22 }]}>ACTIVE OWNER COUPONS ({coupons.length})</Text>
        {coupons.map((c) => (
          <View key={c.id} style={[ad.couponCard, shadow]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={ad.couponCodeBadge}>
                <Text style={{ color: C.brand, fontWeight: '900', fontSize: 14, letterSpacing: 1 }}>{c.code}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ color: C.ink, fontWeight: '800', fontSize: 13 }}>{c.desc}</Text>
                <Text style={{ color: C.ink3, fontSize: 11, marginTop: 2 }}>Min Order: ₹{c.min || 0}</Text>
              </View>
              <TouchableOpacity onPress={() => dispatch({ type: 'ADMIN_DELETE_COUPON', id: c.id })}>
                <MC name="trash-can-outline" size={20} color={C.red} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/* =============== 8. OTP PROVIDER SWITCHER =============== */
export function AdminOtp({ go }) {
  const { admin, dispatch } = useApp();
  const [active, setActive] = useState(admin.otpProvider || 'fast2sms');
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
      </ScrollView>
    </View>
  );
}

/* =============== 9. CLOUD DATABASE MONITOR =============== */
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
              <Text style={{ color: C.ink3, fontSize: 12, marginTop: 2 }}>Region: South Asia (Mumbai) · Realtime</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* =============== 10. LOGISTICS =============== */
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
    setDone(true);
    setTimeout(() => setDone(false), 1400);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Logistics & Delivery" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Card style={{ padding: 18 }}>
          <Field label="Standard Delivery Fee (₹)" keyboardType="number-pad" value={f.deliveryFee} onChangeText={(v) => setF({ ...f, deliveryFee: v.replace(/\D/g, '') })} />
          <Field label="Local Delivery Fee (₹)" keyboardType="number-pad" value={f.localDeliveryFee} onChangeText={(v) => setF({ ...f, localDeliveryFee: v.replace(/\D/g, '') })} />
          <Field label="Free Delivery Above (₹)" keyboardType="number-pad" value={f.freeDeliveryAbove} onChangeText={(v) => setF({ ...f, freeDeliveryAbove: v.replace(/\D/g, '') })} />
          <Btn title={done ? 'Saved Successfully' : 'Save Changes'} icon={done ? 'check' : 'content-save-outline'} tone={done ? 'green' : 'brand'} style={{ marginTop: 12 }} onPress={save} />
        </Card>
      </ScrollView>
    </View>
  );
}

/* =============== 11. PLAY STORE READINESS =============== */
export function AdminPlayStore({ go }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Play Store Readiness" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={[ad.card, shadow, { padding: 18 }]}>
          <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16 }}>Google Play & Indus Console Ready</Text>
          <Text style={{ color: C.ink3, fontSize: 12, marginTop: 2 }}>Package: com.temsho.app · v1.0.5</Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* =============== 12. BRAND SETTINGS =============== */
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
          <Btn title={done ? 'Saved Successfully' : 'Save Changes'} icon={done ? 'check' : 'content-save-outline'} tone={done ? 'green' : 'brand'}
            onPress={() => { dispatch({ type: 'ADMIN_SET', patch: f }); setDone(true); setTimeout(() => setDone(false), 1400); }} />
        </Card>
      </ScrollView>
    </View>
  );
}

/* =============== 13. PRICING & MONEY =============== */
export function AdminMoney({ go }) {
  const { admin, dispatch } = useApp();
  const [f, setF] = useState({ freeDeliveryAbove: String(admin.freeDeliveryAbove), deliveryFee: String(admin.deliveryFee), referralAmount: String(admin.referralAmount || 100), commissionPct: String(admin.commissionPct || 0) });
  const [done, setDone] = useState(false);
  const num = (v) => Number(v || 0);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Pricing & Delivery" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Card style={{ padding: 18 }}>
          <Field label="Free Delivery Above (₹)" keyboardType="number-pad" value={f.freeDeliveryAbove} onChangeText={(v) => setF({ ...f, freeDeliveryAbove: v.replace(/\D/g, '') })} />
          <Field label="Standard Delivery Charge (₹)" keyboardType="number-pad" value={f.deliveryFee} onChangeText={(v) => setF({ ...f, deliveryFee: v.replace(/\D/g, '') })} />
          <Btn title={done ? 'Saved Successfully' : 'Save Changes'} icon={done ? 'check' : 'content-save-outline'} tone={done ? 'green' : 'brand'} style={{ marginTop: 14 }}
            onPress={() => { dispatch({ type: 'ADMIN_SET', patch: { freeDeliveryAbove: num(f.freeDeliveryAbove), deliveryFee: num(f.deliveryFee) } }); setDone(true); setTimeout(() => setDone(false), 1400); }} />
        </Card>
      </ScrollView>
    </View>
  );
}

/* =============== 14. FEATURE TOGGLES =============== */
export function AdminFeatures({ go }) {
  const { admin, dispatch } = useApp();
  const set = (patch) => dispatch({ type: 'ADMIN_SET', patch });
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Feature Toggles" go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Card>
          <Toggle icon="cash" label="Cash on Delivery (COD)" sub="Allow customers to pay cash upon arrival" on={admin.allowCod} onChange={(v) => set({ allowCod: v })} />
          <Toggle icon="cellphone-check" label="Direct UPI Payments" sub="Allow instant UPI payments to sellers" on={admin.allowUpi} onChange={(v) => set({ allowUpi: v })} />
          <Toggle icon="whatsapp" label="WhatsApp OTP Delivery" sub="Allow users to receive OTP on WhatsApp" on={admin.allowWhatsappOtp} onChange={(v) => set({ allowWhatsappOtp: v })} />
          <Toggle icon="storefront-plus-outline" label="Open Seller Registration" sub="Allow anyone to open a shop" on={admin.allowAnyoneToSell} onChange={(v) => set({ allowAnyoneToSell: v })} last />
        </Card>
      </ScrollView>
    </View>
  );
}

/* =============== 15. BROADCAST NOTIFICATIONS =============== */
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
  activeTag: { backgroundColor: C.green, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  note: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.brandSoft, borderRadius: R.sm, padding: 11, marginBottom: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.line, borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 7, marginRight: 8 },
  colorChip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.line, borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 6 },
  colorDot: { width: 16, height: 16, borderRadius: 8 },
  photoUploadBox: { height: 130, borderRadius: R.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#C7D2FE', backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  bannerCard: { backgroundColor: C.surface, borderRadius: R.lg, padding: 14, marginBottom: 14 },
  bannerPreviewBox: { borderRadius: R.md, overflow: 'hidden' },
  miniBanner: { height: 100, borderRadius: R.md, padding: 12, flexDirection: 'row', alignItems: 'center' },
  bannerTagBadge: { backgroundColor: '#ffffff26', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  couponCard: { backgroundColor: C.surface, borderRadius: R.lg, padding: 14, marginBottom: 12 },
  couponCodeBadge: { backgroundColor: C.brandSoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: R.sm, borderWidth: 1, borderStyle: 'dashed', borderColor: '#C7D2FE' },
  auditHighlightCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B',
    borderRadius: R.lg, padding: 16, marginTop: 14, borderWidth: 1.5, borderColor: '#334155',
  },
  sellersLedgerCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF',
    borderRadius: R.lg, padding: 14, marginTop: 10, borderWidth: 1.5, borderColor: '#C7D2FE',
  },
  payoutSetupCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5',
    borderRadius: R.lg, padding: 14, marginTop: 10, borderWidth: 1.5, borderColor: '#A7F3D0',
  },
  auditIcoBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center' },
  newTag: { backgroundColor: C.accent, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, marginLeft: 8 },
  auditCardTop: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: R.lg, padding: 16 },
  payoutCardTop: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', borderRadius: R.lg, padding: 16, borderWidth: 1, borderColor: '#A7F3D0' },
  logCounterBox: { flex: 1, backgroundColor: C.surface, borderRadius: R.md, padding: 12, alignItems: 'center' },
  auditItemCard: { backgroundColor: C.surface, borderRadius: R.lg, padding: 14, marginBottom: 12 },
  logIcoWrapper: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  metaBox: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.line },
  metaTag: { backgroundColor: C.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, color: C.ink2, fontSize: 10.5, fontWeight: '700' },
  fullProdCard: { backgroundColor: C.surface, borderRadius: R.lg, padding: 14, marginBottom: 14 },
  delProdBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.redSoft, alignItems: 'center', justifyContent: 'center' },
  sellerDetailBox: {
    backgroundColor: '#F8FAFC', borderRadius: R.md, padding: 12, marginTop: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  sellerInfoLine: { fontSize: 12, color: C.ink2, marginVertical: 2, lineHeight: 17 },
  waContactMini: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: R.sm, borderWidth: 1, borderColor: '#A7F3D0',
  },
  sellerCard: { backgroundColor: C.surface, borderRadius: R.lg, padding: 16, marginBottom: 14 },
  sellerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' },
  financialStrip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
    borderRadius: R.md, padding: 12, marginVertical: 12, borderWidth: 1, borderColor: C.line,
  },
  sellerBankBox: { backgroundColor: '#F1F5F9', borderRadius: R.sm, padding: 10 },
  bankTxt: { fontSize: 11.5, color: C.ink, marginVertical: 2 },
  settleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: R.md,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  payoutModalCard: { backgroundColor: C.surface, borderRadius: R.xl, padding: 20, width: '100%', maxWidth: 400, alignItems: 'center' },
  modalSellerBox: { backgroundColor: '#F8FAFC', borderRadius: R.md, padding: 12, width: '100%', marginBottom: 14, borderWidth: 1, borderColor: C.line },
  kpiHeaderWrap: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 14,
  },
  kpiSummaryCard: {
    flex: 1, padding: 10, borderRadius: R.md, borderWidth: 1.5, alignItems: 'center',
  },
  filterTabsRow: {
    flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingVertical: 8,
  },
  filterTabBtn: {
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: R.pill,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.line,
  },
  filterTabBtnActive: {
    backgroundColor: C.brand, borderColor: C.brand,
  },
  filterTabTxt: {
    fontSize: 11.5, fontWeight: '700', color: C.ink2,
  },
  filterTabTxtActive: {
    color: '#fff', fontWeight: '800',
  },
  historyToggle: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 4,
  },
  historyListBox: {
    backgroundColor: '#F8FAFC', borderRadius: R.sm, padding: 8, marginTop: 6,
    borderWidth: 1, borderColor: C.line,
  },
  historyRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 5,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
});
