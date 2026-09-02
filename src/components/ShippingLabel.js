import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Platform, Linking, Share } from 'react-native';
import { C, R, shadow, money } from '../theme';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { Btn, Badge } from './UI';

export function ShippingLabelModal({ visible, onClose, order, sellerInfo }) {
  if (!order) return null;

  const awb = order.shipment?.awb || `DEL${(order.id || 'TM123456').replace(/\D/g, '')}88IN`;
  const courier = order.shipment?.courier || 'Delhivery Express / Shiprocket Network';
  const qrData = order.qrData || `TEMSHO://DELIVERY/${order.id}?otp=${order.deliveryOtp || '1234'}`;
  const isCod = order.pay === 'cod';
  const codAmount = isCod ? order.total : 0;
  const custName = order.address?.name || 'Customer';
  const custPhone = order.address?.phone || '9044468663';
  const custEmail = order.address?.email || `${custName.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
  const custAddress = order.address?.line || 'Delivery Address';
  const custCity = order.address?.city || 'Lucknow';
  const custState = order.address?.state || 'Uttar Pradesh';
  const custPin = order.address?.pin || '226010';
  const custLandmark = order.address?.landmark || 'Near Main Road';

  const sellerName = sellerInfo?.name || order.sellerName || 'Verified Indian Seller';
  const sellerPickup = sellerInfo?.pickup || sellerInfo?.city || 'Shop #12, Main Market';
  const sellerCity = sellerInfo?.city || 'Lucknow';
  const sellerState = sellerInfo?.state || 'Uttar Pradesh';
  const sellerPin = sellerInfo?.pin || '226010';
  const sellerPhone = sellerInfo?.contact || '9044468663';

  const handlePrint = () => {
    if (Platform.OS === 'web') {
      window.print();
    } else {
      const shareText = `📦 TEMSHO SHIPPING SLIP & PARCEL MANIFEST\n\nOrder ID: #${order.id}\nAWB No: ${awb}\nCourier: ${courier}\n\nDeliver To:\n${custName} (+91 ${custPhone})\nEmail: ${custEmail}\n${custAddress}, ${custCity}, ${custState} - ${custPin}\n\nCOD Collect: ${isCod ? '₹' + codAmount : 'PREPAID (₹0)'}\nDoorstep Delivery OTP: ${order.deliveryOtp || '1234'}\n\nDispatch Address:\n${sellerName} (+91 ${sellerPhone})\n${sellerPickup}, ${sellerCity} - ${sellerPin}`;
      Share.share({ message: shareText }).catch(() => {});
    }
  };

  const handleShareWhatsApp = () => {
    const text = `📦 *TEMSHO PARCEL SHIPPING SLIP*\n*Order ID:* #${order.id}\n*AWB:* ${awb}\n*Courier:* ${courier}\n\n*DELIVER TO:*\n👤 *Customer:* ${custName}\n📱 *Phone:* +91 ${custPhone}\n✉️ *Email:* ${custEmail}\n📍 *Address:* ${custAddress}, ${custCity}, ${custState} - ${custPin}\n\n💵 *Payment:* ${isCod ? 'CASH ON DELIVERY (Collect ₹' + codAmount + ')' : 'PREPAID (Direct Online UPI)'}\n🔑 *Doorstep OTP:* ${order.deliveryOtp || '1234'}\n\n*DISPATCH BY:*\n🏪 ${sellerName} - ${sellerCity} (${sellerPhone})`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={sl.overlay}>
        <View style={[sl.modalCard, shadow]}>
          {/* Header Action Bar */}
          <View style={sl.topBar}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <MC name="printer-pos" size={20} color={C.brand} />
              <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16, marginLeft: 8 }}>
                Parcel Shipping Label & Slip
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={sl.closeBtn}>
              <MC name="close" size={20} color={C.ink2} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 14 }}>
            {/* PHYSICAL PRINTABLE 4x6 PARCEL SLIP CONTAINER */}
            <View style={sl.sheet}>
              {/* Slip Header */}
              <View style={sl.slipHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={sl.brandTitle}>TEMSHO LOGISTICS</Text>
                  <Text style={sl.brandSub}>Doorstep Express Delivery · 100% Verified Humans</Text>
                </View>
                <View style={sl.badgeStandard}>
                  <Text style={sl.badgeStandardTxt}>STANDARD EXP</Text>
                </View>
              </View>

              {/* Origin / Dest Routing Strip */}
              <View style={sl.routingStrip}>
                <Text style={sl.routingTxt}>
                  ORIGIN: <Text style={{ fontWeight: '900', color: C.brand }}>{sellerPin}</Text> → DEST: <Text style={{ fontWeight: '900', color: C.brand }}>{custPin}</Text>
                </Text>
                <Text style={sl.surfaceTxt}>SURFACE / AIR</Text>
              </View>

              {/* QR & AWB Section */}
              <View style={sl.qrSection}>
                <View style={sl.qrWrapper}>
                  <QRCode value={qrData} size={110} color="#0F172A" backgroundColor="#ffffff" />
                </View>
                <View style={{ flex: 1, marginLeft: 12, justifyContent: 'center' }}>
                  <Text style={sl.secHeader}>PARCEL VERIFICATION QR</Text>
                  <Text style={sl.metaLine}>ORDER ID: <Text style={{ fontWeight: '900', color: C.ink }}>#{order.id}</Text></Text>
                  <Text style={sl.metaLine}>AWB NO: <Text style={{ fontWeight: '800', color: C.ink }}>{awb}</Text></Text>
                  <Text style={sl.metaLine}>DATE: {new Date(order.at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</Text>
                  <Text style={sl.metaLine}>ITEMS: {order.items?.length || 1} · WT: 0.45 KG</Text>
                </View>
              </View>

              {/* COD / Prepaid Highlight Box */}
              <View style={[sl.payBanner, isCod ? sl.payCod : sl.payPrepaid]}>
                <MC name={isCod ? 'cash-multiple' : 'check-decagram'} size={22} color={isCod ? '#B45309' : C.green} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[sl.payBannerTitle, isCod ? { color: '#78350F' } : { color: '#059669' }]}>
                    {isCod ? 'CASH ON DELIVERY (COD)' : 'PREPAID ORDER — COLLECT ₹0'}
                  </Text>
                  <Text style={[sl.payBannerSub, isCod ? { color: '#92400E' } : { color: '#047857' }]}>
                    {isCod ? `COLLECT FROM CUSTOMER: ${money(codAmount)}` : 'Payment confirmed direct to seller. No cash to collect.'}
                  </Text>
                </View>
              </View>

              {/* Deliver To Customer Box */}
              <View style={sl.addressBox}>
                <Text style={sl.boxTitle}>DELIVER TO (CUSTOMER ADDRESS):</Text>
                <View style={sl.fieldRow}>
                  <Text style={sl.fLabel}>CUSTOMER:</Text>
                  <Text style={sl.fValBold}>{custName}</Text>
                </View>
                <View style={sl.fieldRow}>
                  <Text style={sl.fLabel}>MOBILE:</Text>
                  <Text style={sl.fValBold}>+91 {custPhone}</Text>
                </View>
                <View style={sl.fieldRow}>
                  <Text style={sl.fLabel}>EMAIL:</Text>
                  <Text style={sl.fVal}>{custEmail}</Text>
                </View>
                <View style={sl.fieldRow}>
                  <Text style={sl.fLabel}>ADDRESS:</Text>
                  <Text style={[sl.fVal, { flex: 1, lineHeight: 17 }]}>{custAddress}</Text>
                </View>
                <View style={sl.fieldRow}>
                  <Text style={sl.fLabel}>CITY / STATE:</Text>
                  <Text style={sl.fVal}>{custCity}, {custState}</Text>
                </View>
                <View style={sl.fieldRow}>
                  <Text style={sl.fLabel}>PIN CODE:</Text>
                  <Text style={[sl.fValBold, { color: C.brand, fontSize: 13 }]}>{custPin}</Text>
                </View>
                <View style={sl.fieldRow}>
                  <Text style={sl.fLabel}>LANDMARK:</Text>
                  <Text style={sl.fVal}>{custLandmark}</Text>
                </View>
              </View>

              {/* Items Manifest */}
              <View style={sl.itemsBox}>
                <Text style={sl.boxTitle}>PACKAGE CONTENTS ({order.items?.length || 1} ITEMS):</Text>
                {order.items?.map((it, idx) => (
                  <View key={it.id || idx} style={sl.itemRow}>
                    <Text numberOfLines={1} style={{ flex: 1, fontSize: 11.5, color: C.ink, fontWeight: '700' }}>
                      {it.title}
                    </Text>
                    <Text style={{ fontSize: 11.5, color: C.ink2, marginHorizontal: 8 }}>x{it.qty}</Text>
                    <Text style={{ fontSize: 11.5, color: C.ink, fontWeight: '800' }}>{money((Number(it.price) || 0) * (Number(it.qty) || 1))}</Text>
                  </View>
                ))}
              </View>

              {/* Dispatch & Return Address */}
              <View style={sl.addressBox}>
                <Text style={sl.boxTitle}>RETURN & DISPATCH ADDRESS (VERIFIED SELLER):</Text>
                <View style={sl.fieldRow}>
                  <Text style={sl.fLabel}>SHOP NAME:</Text>
                  <Text style={sl.fValBold}>{sellerName}</Text>
                </View>
                <View style={sl.fieldRow}>
                  <Text style={sl.fLabel}>PICKUP ADDR:</Text>
                  <Text style={[sl.fVal, { flex: 1 }]}>{sellerPickup}</Text>
                </View>
                <View style={sl.fieldRow}>
                  <Text style={sl.fLabel}>LOCATION:</Text>
                  <Text style={sl.fVal}>{sellerCity}, {sellerState} – PIN {sellerPin}</Text>
                </View>
                <View style={sl.fieldRow}>
                  <Text style={sl.fLabel}>CONTACT:</Text>
                  <Text style={sl.fValBold}>+91 {sellerPhone}</Text>
                </View>
              </View>

              {/* Doorstep OTP Mandate Security Box */}
              <View style={sl.otpSecurityBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MC name="shield-lock-outline" size={16} color={C.green} />
                  <Text style={sl.otpSecTitle}>MANDATORY DOORSTEP OTP VERIFICATION</Text>
                </View>
                <Text style={sl.otpSecRule}>• Delivery Executive MUST scan this QR & enter customer's 4-digit Delivery OTP.</Text>
                <Text style={sl.otpSecRule}>• Do NOT hand over parcel without OTP confirmation.</Text>
                <View style={sl.otpDisplayStrip}>
                  <Text style={{ color: C.ink3, fontSize: 10.5, fontWeight: '800' }}>CUSTOMER DELIVERY OTP:</Text>
                  <Text style={{ color: C.brand, fontSize: 16, fontWeight: '900', letterSpacing: 2, marginLeft: 8 }}>
                    {order.deliveryOtp || '1234'}
                  </Text>
                </View>
              </View>

              {/* Slip Footer */}
              <View style={sl.slipFooter}>
                <Text style={sl.footerBrand}>TEMSHO INDIA · NO BOTS, ONLY HUMANS · DIRECT PAYMENTS</Text>
                <Text style={sl.footerNet}>{courier}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={sl.bottomBar}>
            <TouchableOpacity onPress={handlePrint} style={[sl.actionBtn, { backgroundColor: C.brand }]}>
              <MC name="printer" size={18} color="#fff" />
              <Text style={sl.actionBtnTxt}>Print / Download Label</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleShareWhatsApp} style={[sl.actionBtn, { backgroundColor: '#25D366', marginLeft: 8 }]}>
              <MC name="whatsapp" size={18} color="#fff" />
              <Text style={sl.actionBtnTxt}>Share Label</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const sl = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center', justifyContent: 'center', padding: 12,
  },
  modalCard: {
    backgroundColor: C.bg, borderRadius: R.xl,
    width: '100%', maxWidth: 440, maxHeight: '90%',
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  closeBtn: { padding: 6, borderRadius: R.pill, backgroundColor: C.bg },
  sheet: {
    backgroundColor: '#ffffff', borderRadius: 8, padding: 14,
    borderWidth: 2, borderColor: '#1E293B',
  },
  slipHeader: {
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: '#1E293B', paddingBottom: 8,
  },
  brandTitle: { fontSize: 16, fontWeight: '900', color: '#1E3A8A', letterSpacing: 0.5 },
  brandSub: { fontSize: 9.5, color: '#475569', fontWeight: '700', marginTop: 1 },
  badgeStandard: { backgroundColor: '#1E3A8A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeStandardTxt: { color: '#ffffff', fontSize: 9.5, fontWeight: '900', letterSpacing: 0.5 },
  routingStrip: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 6, borderBottomWidth: 1.5, borderBottomColor: '#1E293B',
  },
  routingTxt: { fontSize: 10.5, fontWeight: '700', color: '#334155' },
  surfaceTxt: { fontSize: 9.5, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 },
  qrSection: {
    flexDirection: 'row', paddingVertical: 10,
    borderBottomWidth: 1.5, borderBottomColor: '#1E293B', alignItems: 'center',
  },
  qrWrapper: { backgroundColor: '#fff', padding: 6, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 4 },
  secHeader: { fontSize: 11, fontWeight: '900', color: '#1E3A8A', marginBottom: 4 },
  metaLine: { fontSize: 10.5, color: '#475569', marginVertical: 1.5, fontWeight: '600' },
  payBanner: {
    flexDirection: 'row', alignItems: 'center', padding: 8,
    borderRadius: 4, marginVertical: 8, borderWidth: 1.5,
  },
  payCod: { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
  payPrepaid: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  payBannerTitle: { fontSize: 11.5, fontWeight: '900' },
  payBannerSub: { fontSize: 10, fontWeight: '700', marginTop: 1 },
  addressBox: {
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  boxTitle: { fontSize: 9.5, fontWeight: '900', color: '#64748B', letterSpacing: 0.4, marginBottom: 5 },
  fieldRow: { flexDirection: 'row', marginVertical: 2 },
  fLabel: { width: 85, fontSize: 10, fontWeight: '800', color: '#475569' },
  fVal: { fontSize: 10.5, color: '#1E293B' },
  fValBold: { fontSize: 10.5, fontWeight: '800', color: '#0F172A' },
  itemsBox: {
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  otpSecurityBox: {
    backgroundColor: '#F0FDF4', borderRadius: 4, padding: 8,
    borderWidth: 1.5, borderColor: '#22C55E', marginTop: 8,
  },
  otpSecTitle: { fontSize: 10.5, fontWeight: '900', color: '#15803D', marginLeft: 6 },
  otpSecRule: { fontSize: 9.5, color: '#166534', marginTop: 2, fontWeight: '600' },
  otpDisplayStrip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff',
    padding: 6, borderRadius: 4, borderWidth: 1, borderColor: '#86EFAC', marginTop: 6,
  },
  slipFooter: {
    backgroundColor: '#1E293B', padding: 8, borderRadius: 4,
    marginTop: 10, alignItems: 'center',
  },
  footerBrand: { color: '#ffffff', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  footerNet: { color: '#94A3B8', fontSize: 8.5, marginTop: 1 },
  bottomBar: {
    flexDirection: 'row', padding: 12, backgroundColor: C.surface,
    borderTopWidth: 1, borderTopColor: C.line,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: R.md,
  },
  actionBtnTxt: { color: '#ffffff', fontWeight: '800', fontSize: 13, marginLeft: 6 },
});
