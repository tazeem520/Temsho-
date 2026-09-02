import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Image, TextInput, Share } from 'react-native';
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
import { UpiQR } from '../components/Upi';

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

        {/* OWNER PAYMENT & SETTLEMENT SETUP CTA */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => go('admin-owner-payment')} style={[ad.payoutSetupCard, shadow]}>
          <View style={[ad.auditIcoBox, { backgroundColor: '#059669' }]}>
            <MC name="bank-transfer" size={24} color="#fff" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#064E3B', fontWeight: '900', fontSize: 14.5 }}>Owner Payout & Settlement Details</Text>
            </View>
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
                ? 'All buyers, sellers, orders and listings are synchronized in real-time.'
                : 'Supabase database credentials are offline.'}
            </Text>
          </View>
        </View>

        <Text style={ad.sec}>👑 OWNER CORE AUDIT & FINANCIAL TOOLS</Text>
        <Card>
          <Link icon="history" label="1 · Activity & Audit Ledger (History Logs)" sub="Who ordered what, when added, when deleted" to="admin-audit" badge={`${totalLogs}`} />
          <Link icon="bank-outline" label="2 · Owner Payment & Delivery Settlements" sub="₹49 delivery logistics UPI & Bank account" to="admin-owner-payment" />
          <Link icon="cellphone-key" label="3 · OTP Authentication Engine" sub={`Current: ${admin.otpProvider || 'Fast2SMS / Standard'}`} to="admin-otp" />
          <Link icon="truck-delivery-outline" label="4 · Logistics & Delivery Rates" sub="Delivery fees, Free delivery threshold" to="admin-logistics" last />
        </Card>

        <Text style={ad.sec}>PROMOTIONS & MEDIA (OWNER DYNAMIC TOOLS)</Text>
        <Card>
          <Link icon="image-multiple-outline" label="Posters & Banners Manager" sub={`${totalBanners} promotional banners live`} to="admin-banners" />
          <Link icon="ticket-percent-outline" label="Coupon Generator & Manager" sub={`${totalCoupons} active custom coupons`} to="admin-coupons" last />
        </Card>

        <Text style={ad.sec}>GENERAL APP SETTINGS</Text>
        <Card>
          <Link icon="rename-box" label="App Name & Branding" sub={admin.appName} to="admin-brand" />
          <Link icon="cash-sync" label="Pricing, Delivery & Commissions" sub={`Free delivery above ${money(admin.freeDeliveryAbove)}`} to="admin-money" />
          <Link icon="toggle-switch-outline" label="Feature Toggles" sub="COD, UPI, WhatsApp OTP, Seller onboarding" to="admin-features" />
          <Link icon="google-play" label="Play Store & Legal Readiness" sub="Privacy Policy, Data Safety, Assets" to="admin-playstore" last />
        </Card>

        <Text style={ad.sec}>COMMUNICATIONS & LISTINGS</Text>
        <Card>
          <Link icon="bullhorn-outline" label="Broadcast Push Notifications" sub="Send messages to all app users" to="admin-broadcast" />
          <Link icon="format-list-bulleted" label="Manage Marketplace Listings" sub="Review, search or delete products" to="admin-products" last />
        </Card>
      </ScrollView>
    </View>
  );
}

/* =============== OWNER AUDIT & ACTIVITY LEDGER (REQUIREMENT 4) =============== */
export function AdminAuditLedger({ go }) {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const logs = state.auditLog || [];

  const filteredLogs = logs.filter((log) => {
    // Type filter
    if (filter === 'orders' && !['ORDER_PLACED', 'ORDER_STATUS', 'ORDER_CANCELLED', 'ORDER_RETURN_REQUEST', 'ORDER_AWB_ATTACHED'].includes(log.type)) return false;
    if (filter === 'added' && log.type !== 'PRODUCT_ADDED') return false;
    if (filter === 'deleted' && log.type !== 'PRODUCT_DELETED') return false;
    if (filter === 'sellers' && !['SELLER_REGISTERED', 'SELLER_UPDATED'].includes(log.type)) return false;

    // Search query filter
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

/* =============== OWNER PAYMENT & SETTLEMENT SETUP (REQUIREMENT 5) =============== */
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

/* =============== OWNER POSTER & BANNER MANAGER =============== */
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
  const [mode, setMode] = useState('gradient'); // 'gradient' | 'image'
  const [f, setF] = useState({
    title: '',
    sub: '',
    tag: 'FESTIVE OFFER',
    preset: 'blue',
    imgUri: null,
    linkTo: 'offers',
    icon: 'fire',
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

            {/* Poster Format Toggle */}
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

            {/* Target Screen */}
            <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>Where should it open?</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {[
                ['offers', 'Deals Screen', 'sale'],
                ['category', 'Categories', 'view-grid'],
                ['become-seller', 'Seller Hub', 'storefront'],
              ].map(([t, l, ic]) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setF({ ...f, linkTo: t })}
                  style={[ad.chip, f.linkTo === t && { backgroundColor: C.brand, borderColor: C.brand }]}
                >
                  <MC name={ic} size={14} color={f.linkTo === t ? '#fff' : C.ink2} style={{ marginRight: 4 }} />
                  <Text style={{ color: f.linkTo === t ? '#fff' : C.ink2, fontSize: 12, fontWeight: '700' }}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Btn title="Cancel" tone="ghost" style={{ flex: 1 }} onPress={() => setCreating(false)} />
              <Btn title="Publish Banner" tone="green" style={{ flex: 1.3 }} disabled={!f.title && !f.imgUri} onPress={saveBanner} />
            </View>
          </Card>
        )}

        <Text style={[ad.sec, { marginTop: 24 }]}>ACTIVE LIVE POSTERS & BANNERS ({banners.length})</Text>

        {banners.map((b) => (
          <View key={b.id} style={[ad.bannerCard, shadow]}>
            {/* Visual Mini Banner Preview */}
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

            {/* Controls */}
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

/* =============== OWNER COUPON MANAGER & GENERATOR =============== */
export function AdminCoupons({ go }) {
  const { state, dispatch } = useApp();
  const coupons = state.adminCoupons || [];
  const [creating, setCreating] = useState(false);
  const [f, setF] = useState({
    code: '',
    type: 'flat', // 'flat' | 'percent' | 'freeship'
    value: '50',
    min: '299',
    max: '300',
    desc: '',
  });

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
        <View style={ad.note}>
          <MC name="ticket-percent" size={19} color={C.brand} />
          <Text style={{ flex: 1, marginLeft: 8, color: C.ink2, fontSize: 12, lineHeight: 18 }}>
            As the owner, you can generate custom discount codes anytime. Customers can enter these codes at checkout to receive instant discounts.
          </Text>
        </View>

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
            
            <Field
              label="Coupon Code (Letters/Numbers)"
              placeholder="e.g. FESTIVE50, MEGA100, WELCOME"
              autoCapitalize="characters"
              value={f.code}
              onChangeText={(v) => setF({ ...f, code: v.toUpperCase() })}
            />

            <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>Discount Type</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              {[
                ['flat', 'Flat ₹ Off', 'cash'],
                ['percent', '% Percent Off', 'percent'],
                ['freeship', 'Free Shipping', 'truck-fast'],
              ].map(([t, l, ic]) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setF({ ...f, type: t })}
                  style={[ad.chip, f.type === t && { backgroundColor: C.brand, borderColor: C.brand }]}
                >
                  <MC name={ic} size={14} color={f.type === t ? '#fff' : C.ink2} style={{ marginRight: 4 }} />
                  <Text style={{ color: f.type === t ? '#fff' : C.ink2, fontSize: 12, fontWeight: '700' }}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {f.type !== 'freeship' && (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Field
                    label={f.type === 'flat' ? 'Discount Amount (₹)' : 'Discount Rate (%)'}
                    keyboardType="number-pad"
                    placeholder="100"
                    value={f.value}
                    onChangeText={(v) => setF({ ...f, value: v.replace(/\D/g, '') })}
                  />
                </View>
                {f.type === 'percent' && (
                  <View style={{ flex: 1 }}>
                    <Field
                      label="Max Discount Cap (₹)"
                      keyboardType="number-pad"
                      placeholder="400"
                      value={f.max}
                      onChangeText={(v) => setF({ ...f, max: v.replace(/\D/g, '') })}
                    />
                  </View>
                )}
              </View>
            )}

            <Field
              label="Minimum Order Value (₹)"
              keyboardType="number-pad"
              placeholder="499"
              value={f.min}
              onChangeText={(v) => setF({ ...f, min: v.replace(/\D/g, '') })}
            />

            <Field
              label="Description (Optional)"
              placeholder="e.g. ₹100 discount on cart value ₹799+"
              value={f.desc}
              onChangeText={(v) => setF({ ...f, desc: v })}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <Btn title="Cancel" tone="ghost" style={{ flex: 1 }} onPress={() => setCreating(false)} />
              <Btn title="Activate Coupon" tone="green" style={{ flex: 1.2 }} disabled={!f.code.trim()} onPress={save} />
            </View>
          </Card>
        )}

        <Text style={[ad.sec, { marginTop: 22 }]}>ACTIVE OWNER COUPONS ({coupons.length})</Text>
        {coupons.length === 0 ? (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <MC name="ticket-percent-outline" size={32} color={C.ink3} />
            <Text style={{ color: C.ink, fontWeight: '800', fontSize: 14, marginTop: 8 }}>No Active Coupons</Text>
            <Text style={{ color: C.ink3, fontSize: 12, marginTop: 4, textAlign: 'center' }}>
              All old coupons have been cleared. Tap "+ Generate New Coupon" to create one.
            </Text>
          </Card>
        ) : (
          coupons.map((c) => (
            <View key={c.id} style={[ad.couponCard, shadow]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={ad.couponCodeBadge}>
                  <Text style={{ color: C.brand, fontWeight: '900', fontSize: 14, letterSpacing: 1 }}>{c.code}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ color: C.ink, fontWeight: '800', fontSize: 13 }}>
                    {c.type === 'freeship' ? 'Free Delivery' : c.off ? `₹${c.off} FLAT OFF` : `${c.pct}% OFF`}
                  </Text>
                  <Text style={{ color: C.ink3, fontSize: 11, marginTop: 2 }}>Min Order: ₹{c.min || 0}</Text>
                </View>
                <Switch
                  value={c.active !== false}
                  onValueChange={() => dispatch({ type: 'ADMIN_TOGGLE_COUPON', id: c.id })}
                  trackColor={{ true: C.green, false: '#D1D5DB' }}
                  thumbColor="#fff"
                />
              </View>

              <Text style={{ color: C.ink2, fontSize: 12, marginTop: 8 }}>{c.desc}</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.line }}>
                <Badge text={c.active !== false ? 'LIVE & WORKING' : 'PAUSED'} tone={c.active !== false ? 'green' : 'grey'} small />
                <TouchableOpacity onPress={() => dispatch({ type: 'ADMIN_DELETE_COUPON', id: c.id })}>
                  <Text style={{ color: C.red, fontWeight: '800', fontSize: 12 }}>Delete Coupon</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

/* =============== 1. OTP PROVIDER SWITCHER =============== */
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
              <Text style={{ color: C.ink3, fontSize: 12, marginTop: 2 }}>Region: South Asia (Mumbai) · Realtime</Text>
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
            <Text style={{ flex: 1, color: C.ink, fontWeight: '700' }}>Audit Ledger Events</Text>
            <Badge text={`${(state.auditLog || []).length} logged`} tone="brand" />
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
          {['Delhivery Express (Surface & Air)', 'BlueDart Express', 'DTDC Courier', 'Ekart Logistics', 'India Post / Speed Post', 'Seller Doorstep Self-Pickup'].map((c, i, arr) => (
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
              <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16 }}>Google Play & Indus Console Ready</Text>
              <Text style={{ color: C.ink3, fontSize: 12, marginTop: 2 }}>Package: com.temsho.app · v1.0.5</Text>
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
  const list = state.products.filter((p) => (p.title || '').toLowerCase().includes(q.toLowerCase()));
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
                {money(p.price)} · {p.sellerName || SELLERS[p.seller]?.name || state.shop.name || 'Verified Seller'}
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
});
