import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Linking, Modal } from 'react-native';
import { C, R, shadow, money } from '../theme';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import { Btn, Badge, Field, Thumb, Empty } from '../components/UI';
import { Header } from './Product';
import { useApp } from '../store';
import { UpiQR } from '../components/Upi';

export function DeliveryBoy({ go, params }) {
  const { state, dispatch } = useApp();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [inputCode, setInputCode] = useState('');
  const [agentName, setAgentName] = useState('Ramesh K. (Delhivery)');
  const [scanning, setScanning] = useState(false);
  const [err, setErr] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [searchId, setSearchId] = useState(params?.orderId || '');
  const [flash, setFlash] = useState(false);

  const pendingOrders = state.orders.filter((o) => o.status !== 'Cancelled' && o.status !== 'Delivered');

  useEffect(() => {
    if (params?.orderId) {
      const found = state.orders.find((o) => o.id === params.orderId);
      if (found) setSelectedOrder(found);
    }
  }, [params?.orderId, state.orders]);

  const selectOrder = (order) => {
    setSelectedOrder(order);
    setInputCode('');
    setErr('');
    setSuccessData(null);
  };

  const handleManualSearch = () => {
    const q = searchId.trim().toUpperCase().replace('#', '');
    if (!q) return;
    const found = state.orders.find(
      (o) => o.id.toUpperCase() === q || (o.shipment?.awb && o.shipment.awb.toUpperCase() === q)
    );
    if (found) {
      selectOrder(found);
    } else {
      setErr(`No active shipment found matching "${searchId}". Please check Order ID or AWB.`);
    }
  };

  const verifyAndDeliver = () => {
    if (!selectedOrder) return;
    const correctOtp = selectedOrder.deliveryOtp || '1234';
    const entered = inputCode.trim();

    if (entered.length !== 4) {
      setErr('Please enter the 4-digit customer delivery OTP.');
      return;
    }

    // Verify OTP against order deliveryOtp or master override 1234/0000
    if (entered === correctOtp || entered === '1234' || entered === '0000') {
      dispatch({
        type: 'VERIFY_DELIVERY_OTP',
        id: selectedOrder.id,
        agentName: agentName.trim() || 'Delhivery Express Agent',
        otp: entered,
      });

      setSuccessData({
        orderId: selectedOrder.id,
        deliveredAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        recipient: selectedOrder.address?.name || 'Customer',
        address: `${selectedOrder.address?.line || ''}, ${selectedOrder.address?.city || ''}`,
        amountCollected: selectedOrder.pay === 'cod' ? selectedOrder.total : 0,
        payMode: selectedOrder.pay === 'cod' ? 'Cash on Delivery' : 'Prepaid (Direct UPI)',
      });

      setSelectedOrder(null);
      setInputCode('');
      setErr('');
    } else {
      setErr(`Incorrect OTP! Customer's valid OTP is ${correctOtp}. Please ask the customer to check their Temsho app.`);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Delivery Partner Hub" go={go} />

      {/* Success Modal */}
      {successData && (
        <Modal animationType="slide" transparent visible={!!successData}>
          <View style={db.modalOverlay}>
            <View style={[db.successCard, shadow]}>
              <View style={db.successIco}>
                <MC name="check-decagram" size={54} color={C.green} />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '900', color: C.ink, marginTop: 12 }}>
                Delivery Verified & Confirmed!
              </Text>
              <Text style={{ color: C.ink3, fontSize: 12, marginTop: 4 }}>
                Doorstep OTP Authentication Complete
              </Text>

              <View style={db.receiptBox}>
                <View style={db.recRow}>
                  <Text style={db.recLabel}>Order ID:</Text>
                  <Text style={db.recVal}>#{successData.orderId}</Text>
                </View>
                <View style={db.recRow}>
                  <Text style={db.recLabel}>Delivered To:</Text>
                  <Text style={db.recVal}>{successData.recipient}</Text>
                </View>
                <View style={db.recRow}>
                  <Text style={db.recLabel}>Address:</Text>
                  <Text numberOfLines={1} style={[db.recVal, { flex: 1, textAlign: 'right' }]}>{successData.address}</Text>
                </View>
                <View style={db.recRow}>
                  <Text style={db.recLabel}>Time & Date:</Text>
                  <Text style={db.recVal}>{successData.deliveredAt}, {successData.date}</Text>
                </View>
                <View style={[db.recRow, { borderTopWidth: 1, borderTopColor: C.line, paddingTop: 8, marginTop: 4 }]}>
                  <Text style={[db.recLabel, { fontWeight: '900', color: C.ink }]}>Cash Collected:</Text>
                  <Text style={{ fontWeight: '900', color: successData.amountCollected > 0 ? C.green : C.ink, fontSize: 15 }}>
                    {money(successData.amountCollected)}
                  </Text>
                </View>
              </View>

              <Btn
                title="Deliver Next Parcel"
                icon="qrcode-scan"
                tone="brand"
                style={{ alignSelf: 'stretch', marginTop: 18 }}
                onPress={() => setSuccessData(null)}
              />
              <Btn
                title="View All Orders"
                tone="ghost"
                style={{ alignSelf: 'stretch', marginTop: 8 }}
                onPress={() => { setSuccessData(null); go('orders'); }}
              />
            </View>
          </View>
        </Modal>
      )}

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        {/* Agent Info Strip */}
        <View style={[db.agentStrip, shadow]}>
          <View style={db.agentIco}><MC name="truck-delivery" size={24} color={C.brand} /></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontWeight: '900', color: C.ink, fontSize: 14 }}>{agentName}</Text>
            <Text style={{ color: C.green, fontSize: 11.5, fontWeight: '700', marginTop: 1 }}>
              Active Delivery Executive · Shiprocket / Delhivery Network
            </Text>
          </View>
          <Badge text={`${pendingOrders.length} Pending`} tone={pendingOrders.length > 0 ? 'accent' : 'green'} />
        </View>

        {/* Scan / Search Section */}
        <Text style={db.secTitle}>1 · SCAN PARCEL QR CODE OR ENTER ORDER ID</Text>
        
        <View style={[db.scannerBox, shadow]}>
          {/* Simulated Live Viewfinder */}
          <View style={[db.viewfinder, flash && { backgroundColor: '#ffffff15' }]}>
            <View style={db.cornerTL} />
            <View style={db.cornerTR} />
            <View style={db.cornerBL} />
            <View style={db.cornerBR} />
            <View style={db.laser} />
            <MC name="qrcode-scan" size={60} color="#ffffff60" />
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700', marginTop: 12 }}>
              Point Camera at Parcel Shipping Label QR
            </Text>
            
            <TouchableOpacity onPress={() => setFlash(!flash)} style={db.flashBtn}>
              <MC name={flash ? 'flashlight' : 'flashlight-off'} size={18} color={flash ? '#FDE047' : '#fff'} />
            </TouchableOpacity>
          </View>

          {/* Quick Action Buttons for scanner */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <Btn
              title="Simulate Instant QR Scan"
              icon="camera-iris"
              tone="brand"
              style={{ flex: 1 }}
              onPress={() => {
                if (pendingOrders.length > 0) {
                  selectOrder(pendingOrders[0]);
                } else if (state.orders.length > 0) {
                  selectOrder(state.orders[0]);
                } else {
                  setErr('No parcels available in order database.');
                }
              }}
            />
          </View>

          {/* Manual ID Input */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <TextInput
                placeholder="Enter Order ID (e.g. TM123456) or AWB"
                value={searchId}
                onChangeText={(t) => { setSearchId(t); setErr(''); }}
                autoCapitalize="characters"
                placeholderTextColor={C.ink3}
                style={db.searchInput}
              />
            </View>
            <Btn title="Search" tone="outline" style={{ height: 46 }} onPress={handleManualSearch} />
          </View>
          {!!err && <Text style={db.errText}>{err}</Text>}
        </View>

        {/* Selected Parcel Verification Box */}
        {selectedOrder ? (
          <View style={{ marginTop: 20 }}>
            <Text style={db.secTitle}>2 · PARCEL VERIFICATION & OTP SUBMISSION</Text>
            
            <View style={[db.orderCard, shadow]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: '900', color: C.ink }}>Order #{selectedOrder.id}</Text>
                <View style={{ flex: 1 }} />
                <Badge text={selectedOrder.status} tone={selectedOrder.status === 'Delivered' ? 'green' : 'brand'} />
              </View>

              {/* Recipient Details */}
              <View style={db.infoRow}>
                <MC name="account-outline" size={16} color={C.brand} />
                <Text style={{ fontWeight: '800', color: C.ink, fontSize: 13, marginLeft: 8 }}>
                  {selectedOrder.address?.name || 'Customer'}
                </Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                  onPress={() => {
                    const phone = selectedOrder.address?.phone || '9044468663';
                    Linking.openURL(`tel:${phone}`).catch(() => {});
                  }}
                  style={db.callChip}
                >
                  <MC name="phone" size={13} color={C.green} />
                  <Text style={{ color: C.green, fontSize: 11.5, fontWeight: '800', marginLeft: 4 }}>Call Customer</Text>
                </TouchableOpacity>
              </View>

              <View style={[db.infoRow, { alignItems: 'flex-start', marginTop: 6 }]}>
                <MC name="map-marker-outline" size={16} color={C.ink3} style={{ marginTop: 2 }} />
                <Text style={{ color: C.ink2, fontSize: 12.5, marginLeft: 8, flex: 1, lineHeight: 18 }}>
                  {selectedOrder.address?.line}, {selectedOrder.address?.city}, {selectedOrder.address?.state} – {selectedOrder.address?.pin}
                </Text>
              </View>

              {/* Items Summary */}
              <View style={db.itemsBox}>
                <Text style={{ color: C.ink3, fontSize: 11, fontWeight: '800', marginBottom: 6 }}>PARCEL CONTENTS ({selectedOrder.items?.length || 1} ITEMS)</Text>
                {selectedOrder.items?.map((it) => (
                  <View key={it.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <View style={{ width: 34 }}><Thumb img={it.img} title={it.title} tint={it.tint} size={34} radius={6} /></View>
                    <Text numberOfLines={1} style={{ color: C.ink, fontSize: 12.5, flex: 1, marginLeft: 8 }}>{it.title}</Text>
                    <Text style={{ color: C.ink2, fontSize: 12 }}>x{it.qty}</Text>
                  </View>
                ))}
              </View>

              {/* Payment Alert Banner */}
              {selectedOrder.pay === 'cod' ? (
                <View style={db.codBanner}>
                  <MC name="cash-multiple" size={24} color="#B45309" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ color: '#78350F', fontWeight: '900', fontSize: 14 }}>
                      CASH ON DELIVERY — Collect {money(selectedOrder.total)}
                    </Text>
                    <Text style={{ color: '#92400E', fontSize: 11.5, marginTop: 2 }}>
                      Do NOT deliver parcel before collecting cash from recipient.
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={db.prepaidBanner}>
                  <MC name="check-circle-outline" size={22} color={C.green} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ color: '#059669', fontWeight: '900', fontSize: 13.5 }}>
                      PREPAID ORDER — Collect ₹0
                    </Text>
                    <Text style={{ color: '#047857', fontSize: 11.5, marginTop: 1 }}>
                      Payment was paid online directly to seller. Hand over parcel upon OTP verification.
                    </Text>
                  </View>
                </View>
              )}

              {/* OTP Input Form */}
              <View style={db.otpForm}>
                <Text style={{ fontWeight: '900', color: C.ink, fontSize: 14 }}>
                  Enter Customer's 4-Digit Delivery OTP:
                </Text>
                <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 2 }}>
                  Ask recipient for the OTP displayed on their Temsho app or SMS.
                </Text>

                {/* Customer OTP hint chip for testing / convenience */}
                {selectedOrder.deliveryOtp && (
                  <TouchableOpacity
                    onPress={() => setInputCode(selectedOrder.deliveryOtp)}
                    style={db.hintChip}
                  >
                    <MC name="key-outline" size={14} color={C.brand} />
                    <Text style={{ color: C.brand, fontWeight: '800', fontSize: 12, marginLeft: 6 }}>
                      Customer OTP: {selectedOrder.deliveryOtp} (Tap to Auto-Fill)
                    </Text>
                  </TouchableOpacity>
                )}

                <TextInput
                  placeholder="Enter 4-digit OTP"
                  value={inputCode}
                  onChangeText={(t) => { setInputCode(t.replace(/\D/g, '').slice(0, 4)); setErr(''); }}
                  keyboardType="number-pad"
                  maxLength={4}
                  style={db.otpInputField}
                />

                <Btn
                  title="Verify OTP & Mark Delivered"
                  icon="check-bold"
                  tone="green"
                  style={{ marginTop: 14, paddingVertical: 13 }}
                  disabled={inputCode.length !== 4}
                  onPress={verifyAndDeliver}
                />
              </View>
            </View>
          </View>
        ) : null}

        {/* Pending Deliveries List */}
        <Text style={[db.secTitle, { marginTop: 22 }]}>
          PENDING PARCELS ({pendingOrders.length})
        </Text>

        {pendingOrders.length === 0 ? (
          <View style={[db.card, shadow, { padding: 24, alignItems: 'center' }]}>
            <MC name="package-variant-closed-check" size={36} color={C.green} />
            <Text style={{ color: C.ink, fontWeight: '900', fontSize: 15, marginTop: 10 }}>All Parcels Delivered!</Text>
            <Text style={{ color: C.ink3, fontSize: 12, textAlign: 'center', marginTop: 4 }}>
              No pending deliveries at this moment. New customer orders will appear here automatically.
            </Text>
          </View>
        ) : (
          pendingOrders.map((o) => (
            <TouchableOpacity
              key={o.id}
              activeOpacity={0.85}
              onPress={() => selectOrder(o)}
              style={[db.pendingCard, shadow, selectedOrder?.id === o.id && { borderColor: C.brand, borderWidth: 2 }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={db.boxIco}><MC name="package-variant" size={20} color={C.brand} /></View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ fontWeight: '900', color: C.ink, fontSize: 13.5 }}>#{o.id}</Text>
                  <Text style={{ color: C.ink2, fontSize: 12, marginTop: 2 }}>
                    {o.address?.name || 'Customer'} · PIN {o.address?.pin || '226010'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontWeight: '900', color: C.ink, fontSize: 14 }}>{money(o.total)}</Text>
                  <Text style={{ color: o.pay === 'cod' ? '#D97706' : C.green, fontSize: 10.5, fontWeight: '800' }}>
                    {o.pay === 'cod' ? 'COD' : 'PREPAID'}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.line }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MC name="lock-outline" size={13} color={C.ink3} />
                  <Text style={{ color: C.ink3, fontSize: 11, marginLeft: 4 }}>
                    Delivery OTP: <Text style={{ fontWeight: '800', color: C.ink }}>{o.deliveryOtp || 'Set'}</Text>
                  </Text>
                </View>
                <Text style={{ color: C.brand, fontWeight: '800', fontSize: 12 }}>Scan & Deliver →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const db = StyleSheet.create({
  secTitle: { fontSize: 12, fontWeight: '900', color: C.ink3, letterSpacing: 0.6, marginBottom: 10, textTransform: 'uppercase' },
  agentStrip: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: R.lg, padding: 14, marginBottom: 16 },
  agentIco: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' },
  scannerBox: { backgroundColor: C.surface, borderRadius: R.xl, padding: 16 },
  viewfinder: {
    height: 180, borderRadius: R.lg, backgroundColor: '#0F172A',
    alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
  },
  laser: {
    position: 'absolute', top: '50%', left: 20, right: 20, height: 2,
    backgroundColor: '#EF4444', shadowColor: '#EF4444', shadowOpacity: 0.9, shadowRadius: 8,
  },
  cornerTL: { position: 'absolute', top: 16, left: 16, width: 20, height: 20, borderTopWidth: 3, borderLeftWidth: 3, borderColor: C.brand },
  cornerTR: { position: 'absolute', top: 16, right: 16, width: 20, height: 20, borderTopWidth: 3, borderRightWidth: 3, borderColor: C.brand },
  cornerBL: { position: 'absolute', bottom: 16, left: 16, width: 20, height: 20, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: C.brand },
  cornerBR: { position: 'absolute', bottom: 16, right: 16, width: 20, height: 20, borderBottomWidth: 3, borderRightWidth: 3, borderColor: C.brand },
  flashBtn: { position: 'absolute', top: 12, right: 12, width: 34, height: 34, borderRadius: 17, backgroundColor: '#ffffff25', alignItems: 'center', justifyContent: 'center' },
  searchInput: {
    backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.line, borderRadius: R.sm,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 13.5, color: C.ink, fontWeight: '700',
  },
  errText: { color: C.red, fontSize: 12, fontWeight: '700', marginTop: 8 },
  orderCard: { backgroundColor: C.surface, borderRadius: R.xl, padding: 16, borderWidth: 1.5, borderColor: '#C7D2FE' },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  callChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 9, paddingVertical: 5, borderRadius: R.pill, borderWidth: 1, borderColor: '#A7F3D0' },
  itemsBox: { backgroundColor: C.bg, borderRadius: R.md, padding: 10, marginVertical: 12 },
  codBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', borderRadius: R.md, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#FDE68A' },
  prepaidBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', borderRadius: R.md, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#A7F3D0' },
  otpForm: { backgroundColor: C.bg, borderRadius: R.lg, padding: 14 },
  hintChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.brandSoft, borderRadius: R.sm, padding: 8, marginTop: 8, marginBottom: 10, alignSelf: 'flex-start' },
  otpInputField: {
    backgroundColor: C.surface, borderWidth: 2, borderColor: C.brand, borderRadius: R.md,
    paddingVertical: 12, textAlign: 'center', fontSize: 24, fontWeight: '900', letterSpacing: 8, color: C.ink,
  },
  card: { backgroundColor: C.surface, borderRadius: R.lg },
  pendingCard: { backgroundColor: C.surface, borderRadius: R.lg, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.line },
  boxIco: { width: 38, height: 38, borderRadius: 10, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  successCard: { backgroundColor: C.surface, borderRadius: R.xl, padding: 24, alignItems: 'center', width: '100%', maxWidth: 380 },
  successIco: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center' },
  receiptBox: { backgroundColor: C.bg, borderRadius: R.md, padding: 14, width: '100%', marginTop: 16 },
  recRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  recLabel: { color: C.ink3, fontSize: 12 },
  recVal: { color: C.ink, fontSize: 12.5, fontWeight: '800' },
});
