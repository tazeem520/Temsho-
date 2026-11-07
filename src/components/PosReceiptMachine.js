import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, Share, Platform, Linking } from 'react-native';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { C, R, shadow, money } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * PosReceiptMachine — Interactive Thermal POS Billing Machine & Receipt Cutter
 * Plays a realistic bill printing, dispensing and paper-cutting animation upon order payment confirmation.
 */
export function PosReceiptMachine({ order, onTrackOrders, onContinueShopping }) {
  const paperHeight = useRef(new Animated.Value(0)).current;
  const paperOpacity = useRef(new Animated.Value(0)).current;
  const cutFlash = useRef(new Animated.Value(0)).current;
  const stampScale = useRef(new Animated.Value(0)).current;
  const stampRotate = useRef(new Animated.Value(0)).current;
  const [printStage, setPrintStage] = useState('printing'); // 'printing' | 'cutting' | 'completed'

  const orderId = order?.id || 'TM' + Math.floor(100000 + Math.random() * 900000);
  const totalAmount = order?.total || 1499;
  const payMethod = order?.pay === 'cod' ? 'Cash on Delivery (COD)' : order?.pay === 'card' ? 'Card / Net Banking' : 'Direct Online UPI / Paid';
  const deliveryOtp = order?.deliveryOtp || order?.otp || '5921';
  const eta = order?.eta || '3-4 Business Days';
  const items = order?.items || [{ title: 'Temsho Verified Order Items', qty: 1, price: totalAmount }];
  const customerName = order?.address?.name || order?.customerName || 'Valued Customer';
  const city = order?.address?.city || 'Lucknow';
  const pincode = order?.address?.pin || '226010';

  useEffect(() => {
    // 1. Machine Feeds Paper Out of Slot (Dispense Animation)
    Animated.parallel([
      Animated.timing(paperHeight, {
        toValue: 1,
        duration: 1600,
        useNativeDriver: false,
      }),
      Animated.timing(paperOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start(() => {
      // 2. Paper Cutting Blade Action
      setPrintStage('cutting');
      Animated.sequence([
        Animated.timing(cutFlash, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(cutFlash, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => {
        setPrintStage('completed');
        // 3. Stamp "PAID / CONFIRMED" slams onto receipt
        Animated.parallel([
          Animated.spring(stampScale, {
            toValue: 1,
            friction: 4,
            tension: 50,
            useNativeDriver: true,
          }),
          Animated.timing(stampRotate, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
        ]).start();
      });
    });
  }, []);

  const spin = stampRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-25deg', '-12deg'],
  });

  const formattedDate = new Date(order?.at || Date.now()).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const handleShareReceipt = () => {
    const text = `🧾 *TEMSHO OFFICIAL ORDER RECEIPT*\nOrder ID: #${orderId}\nAmount Paid: ${money(totalAmount)}\nPayment Mode: ${payMethod}\nDoorstep Delivery OTP: ${deliveryOtp}\nEstimated Delivery: ${eta}\n\nTrack order live at: https://tazeem520.github.io/Temsho-/`;
    if (Platform.OS === 'web') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      Share.share({ message: text }).catch(() => {});
    }
  };

  return (
    <View style={st.container}>
      {/* POS TERMINAL PRINTER HOUSING */}
      <View style={st.machine}>
        <LinearGradient
          colors={['#1E293B', '#0F172A', '#020617']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={st.machineBody}
        >
          {/* Top Machine Bevel & LED Bar */}
          <View style={st.machineHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={[st.statusLed, printStage === 'completed' ? st.ledGreen : st.ledAmber]} />
              <Text style={st.machineBrand}>TEMSHO POS-X1 THERMAL PRINTER</Text>
            </View>
            <View style={st.lcdScreen}>
              <Text style={st.lcdText}>
                {printStage === 'printing' ? 'PRINTING BILL...' : printStage === 'cutting' ? 'CUTTING PAPER ✂' : 'PAYMENT SUCCESS ✓'}
              </Text>
            </View>
          </View>

          {/* Dispenser Mouth / Cutting Ejection Slot */}
          <View style={st.dispenserSlot}>
            <View style={st.slotInnerShadow} />
            <View style={st.feedRoller} />
          </View>
        </LinearGradient>

        {/* Paper Cutter Blade Flash Line */}
        <Animated.View style={[st.bladeCutLine, { opacity: cutFlash }]}>
          <View style={st.laserBeam} />
          <Text style={st.cutScissorText}>✂ - - - - - - - - - - - - - - - - - - - - - - - - ✂</Text>
        </Animated.View>
      </View>

      {/* DISPENSED THERMAL RECEIPT BILL */}
      <Animated.View
        style={[
          st.receiptWrap,
          {
            maxHeight: paperHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1000],
            }),
            opacity: paperOpacity,
          },
        ]}
      >
        <View style={st.receipt}>
          {/* Top Perforated Zig-Zag Edge */}
          <View style={st.zigZagTopRow}>
            {Array.from({ length: 24 }).map((_, i) => (
              <View key={i} style={st.zigZagTooth} />
            ))}
          </View>

          {/* Receipt Header */}
          <View style={st.receiptHeader}>
            <View style={st.receiptLogoBox}>
              <MC name="storefront" size={20} color="#1E2562" />
            </View>
            <Text style={st.receiptStoreTitle}>TEMSHO MARKETPLACE</Text>
            <Text style={st.receiptSub}>Direct Producer Settlement & Delivery</Text>
            <Text style={st.taxInvoicePill}>OFFICIAL TAX INVOICE & CASH MEMO</Text>
          </View>

          <View style={st.dividerDashed} />

          {/* Order Metadata */}
          <View style={st.metaGrid}>
            <View style={st.metaRow}>
              <Text style={st.metaLabel}>Order No:</Text>
              <Text style={st.metaValBold}>#{orderId}</Text>
            </View>
            <View style={st.metaRow}>
              <Text style={st.metaLabel}>Date & Time:</Text>
              <Text style={st.metaVal}>{formattedDate}</Text>
            </View>
            <View style={st.metaRow}>
              <Text style={st.metaLabel}>Payment Mode:</Text>
              <Text style={[st.metaValBold, { color: '#059669' }]}>{payMethod}</Text>
            </View>
            <View style={st.metaRow}>
              <Text style={st.metaLabel}>Customer:</Text>
              <Text style={st.metaVal}>{customerName} ({city} - {pincode})</Text>
            </View>
          </View>

          <View style={st.dividerDashed} />

          {/* Items Table Header */}
          <View style={st.tableHead}>
            <Text style={[st.colItem, st.thText]}>ITEM DESCRIPTION</Text>
            <Text style={[st.colQty, st.thText]}>QTY</Text>
            <Text style={[st.colPrice, st.thText]}>AMOUNT</Text>
          </View>

          {/* Items List */}
          {items.map((it, idx) => (
            <View key={it.id || idx} style={st.tableRow}>
              <Text numberOfLines={2} style={st.colItemText}>
                {it.title || it.name || 'Marketplace Item'}
              </Text>
              <Text style={st.colQtyText}>x{it.qty || 1}</Text>
              <Text style={st.colPriceText}>{money((it.price || totalAmount) * (it.qty || 1))}</Text>
            </View>
          ))}

          <View style={st.dividerDashed} />

          {/* Totals Summary */}
          <View style={st.totalSection}>
            <View style={st.calcRow}>
              <Text style={st.calcLabel}>Items Subtotal:</Text>
              <Text style={st.calcVal}>{money(totalAmount)}</Text>
            </View>
            <View style={st.calcRow}>
              <Text style={st.calcLabel}>Doorstep Delivery:</Text>
              <Text style={[st.calcVal, { color: '#059669', fontWeight: '900' }]}>₹0.00 (FREE)</Text>
            </View>
            <View style={st.calcRow}>
              <Text style={st.calcLabel}>Taxes & GST (Included):</Text>
              <Text style={st.calcVal}>₹0.00</Text>
            </View>

            <View style={st.grandTotalRow}>
              <Text style={st.grandTotalLabel}>TOTAL PAID AMOUNT</Text>
              <Text style={st.grandTotalVal}>{money(totalAmount)}</Text>
            </View>
          </View>

          {/* Doorstep Delivery OTP Box */}
          <View style={st.otpCard}>
            <MC name="shield-key" size={24} color="#1E40AF" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={st.otpTitle}>DOORSTEP DELIVERY OTP</Text>
              <Text style={st.otpCode}>{deliveryOtp}</Text>
              <Text style={st.otpSub}>Share with courier partner upon doorstep arrival</Text>
            </View>
          </View>

          {/* Scannable Barcode & QR Stamp */}
          <View style={st.barcodeSection}>
            {/* Visual Barcode Graphic */}
            <View style={st.barcodeGraphic}>
              {Array.from({ length: 38 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    st.barcodeBar,
                    {
                      width: i % 3 === 0 ? 3 : i % 2 === 0 ? 1.5 : 2,
                      backgroundColor: i % 5 === 0 ? '#475569' : '#0F172A',
                      marginHorizontal: 1,
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={st.barcodeNum}>* {orderId} * 9044468663 *</Text>
            <Text style={st.thankYouText}>Thank you for supporting verified Indian sellers!</Text>
          </View>

          {/* SLAMMED GREEN RUBBER STAMP */}
          <Animated.View
            style={[
              st.rubberStamp,
              {
                transform: [{ scale: stampScale }, { rotate: spin }],
              },
            ]}
          >
            <View style={st.stampInner}>
              <MC name="check-decagram" size={20} color="#059669" />
              <Text style={st.stampText}>PAYMENT CONFIRMED</Text>
              <Text style={st.stampSub}>TEMSHO ASSURED</Text>
            </View>
          </Animated.View>

          {/* Bottom Serrated Edge */}
          <View style={st.zigZagBottomRow}>
            {Array.from({ length: 24 }).map((_, i) => (
              <View key={i} style={st.zigZagToothBottom} />
            ))}
          </View>
        </View>
      </Animated.View>

      {/* QUICK RECEIPT ACTION BUTTONS */}
      {printStage === 'completed' && (
        <View style={st.actionsRow}>
          <TouchableOpacity onPress={handleShareReceipt} style={st.shareBtn} activeOpacity={0.8}>
            <MC name="whatsapp" size={18} color="#fff" />
            <Text style={st.shareBtnText}>Share Bill on WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onTrackOrders} style={st.trackBtn} activeOpacity={0.8}>
            <MC name="truck-fast" size={18} color="#fff" />
            <Text style={st.trackBtnText}>Track Order Delivery</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onContinueShopping} style={st.shopMoreBtn} activeOpacity={0.8}>
            <Text style={st.shopMoreText}>Explore More Rails ➔</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    paddingVertical: 12,
  },
  /* Machine Styling */
  machine: {
    width: '100%',
    maxWidth: 400,
    position: 'relative',
    zIndex: 10,
  },
  machineBody: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  machineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusLed: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ledGreen: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  ledAmber: {
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  machineBrand: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  lcdScreen: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#059669',
  },
  lcdText: {
    color: '#6EE7B7',
    fontSize: 9.5,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
  },
  dispenserSlot: {
    height: 10,
    backgroundColor: '#020617',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#475569',
    position: 'relative',
    overflow: 'hidden',
  },
  slotInnerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#000',
  },
  feedRoller: {
    position: 'absolute',
    bottom: 1,
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#334155',
  },
  bladeCutLine: {
    position: 'absolute',
    bottom: -10,
    left: 10,
    right: 10,
    alignItems: 'center',
    zIndex: 15,
  },
  laserBeam: {
    width: '100%',
    height: 2,
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  cutScissorText: {
    color: '#DC2626',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 2,
  },
  /* Receipt Wrapping & Paper Body */
  receiptWrap: {
    width: '100%',
    maxWidth: 380,
    overflow: 'hidden',
    marginTop: -4,
    zIndex: 5,
  },
  receipt: {
    backgroundColor: '#FAFBFB',
    borderRadius: 0,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    padding: 22,
    paddingTop: 16,
    shadowColor: 'rgba(50, 50, 120, 0.4)',
    shadowOffset: { width: 0, height: 26 },
    shadowOpacity: 0.35,
    shadowRadius: 40,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  /* Perforated Zig Zag Teeth */
  zigZagTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  zigZagTooth: {
    width: 10,
    height: 6,
    backgroundColor: '#1E293B',
    transform: [{ rotate: '45deg' }],
    marginTop: -8,
  },
  zigZagBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: -16,
  },
  zigZagToothBottom: {
    width: 10,
    height: 6,
    backgroundColor: '#FAFBFB',
    transform: [{ rotate: '45deg' }],
  },
  /* Receipt Header */
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  receiptLogoBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  receiptStoreTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  receiptSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  taxInvoicePill: {
    fontSize: 9,
    fontWeight: '900',
    color: '#1E40AF',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  dividerDashed: {
    height: 1,
    borderWidth: 0.8,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  /* Meta Grid */
  metaGrid: {
    gap: 3,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  metaVal: {
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  metaValBold: {
    fontSize: 11.5,
    color: '#0F172A',
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  /* Table Rows */
  tableHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  thText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#475569',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  colItem: { flex: 2 },
  colQty: { flex: 0.6, textAlign: 'center' },
  colPrice: { flex: 1, textAlign: 'right' },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  colItemText: {
    flex: 2,
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  colQtyText: {
    flex: 0.6,
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  colPriceText: {
    flex: 1,
    fontSize: 11.5,
    color: '#0F172A',
    fontWeight: '800',
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  /* Total Summary */
  totalSection: {
    gap: 3,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calcLabel: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  calcVal: {
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  grandTotalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#059669',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  /* OTP Card */
  otpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  otpTitle: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#1E40AF',
    letterSpacing: 0.5,
  },
  otpCode: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E3A8A',
    letterSpacing: 4,
    marginTop: 1,
  },
  otpSub: {
    fontSize: 9.5,
    color: '#3B82F6',
    marginTop: 1,
  },
  /* Barcode Section */
  barcodeSection: {
    alignItems: 'center',
    marginTop: 12,
  },
  barcodeGraphic: {
    flexDirection: 'row',
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeBar: {
    height: '100%',
  },
  barcodeNum: {
    fontSize: 10,
    color: '#475569',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 2,
    marginTop: 2,
  },
  thankYouText: {
    fontSize: 10.5,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 4,
  },
  /* Rubber Stamp Effect */
  rubberStamp: {
    position: 'absolute',
    top: '38%',
    right: 20,
    zIndex: 20,
  },
  stampInner: {
    borderWidth: 2.5,
    borderColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: 'rgba(236, 253, 245, 0.92)',
  },
  stampText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: 1,
    marginTop: 2,
  },
  stampSub: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
  },
  /* Action Buttons */
  actionsRow: {
    width: '100%',
    maxWidth: 380,
    marginTop: 16,
    gap: 8,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 12,
    borderRadius: R.md,
    gap: 8,
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 13.5,
    fontWeight: '800',
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.brand,
    paddingVertical: 12,
    borderRadius: R.md,
    gap: 8,
  },
  trackBtnText: {
    color: '#fff',
    fontSize: 13.5,
    fontWeight: '800',
  },
  shopMoreBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  shopMoreText: {
    color: C.brand,
    fontSize: 13,
    fontWeight: '800',
  },
});
