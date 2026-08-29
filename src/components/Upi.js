import React from 'react';
import { View, Text, TouchableOpacity, Linking, Platform, StyleSheet } from 'react-native';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { C, R, money } from '../theme';

export const upiLink = ({ upi, name, amount, note }) =>
  `upi://pay?pa=${encodeURIComponent(upi || '')}&pn=${encodeURIComponent(name || 'Seller')}` +
  `&am=${Number(amount || 0).toFixed(2)}&cu=INR&tn=${encodeURIComponent(note || 'Temsho order')}`;

export const openUpi = async (args) => {
  const url = upiLink(args);
  try {
    if (Platform.OS === 'web') { window.location.href = url; return true; }
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
};

export function UpiQR({ upi, name, amount, note, size = 150 }) {
  const value = upiLink({ upi, name, amount, note });
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={q.box}>
        <QRCode value={value} size={size} color="#0F172A" backgroundColor="#fff" />
      </View>
      <Text style={{ color: C.ink2, fontSize: 11.5, marginTop: 10, textAlign: 'center', lineHeight: 17 }}>
        Scan this QR code using any UPI App{'\n'}(Google Pay, PhonePe, Paytm, BHIM)
      </Text>
      <Text style={{ color: C.ink, fontWeight: '900', fontSize: 16, marginTop: 6 }}>{money(amount)}</Text>
    </View>
  );
}

export function PayNowBtn({ upi, name, amount, note }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => openUpi({ upi, name, amount, note })} style={q.btn}>
      <MC name="cellphone-check" size={18} color="#fff" />
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13.5, marginLeft: 8 }}>
        Pay via UPI App — {money(amount)}
      </Text>
    </TouchableOpacity>
  );
}

const q = StyleSheet.create({
  box: { backgroundColor: '#fff', padding: 12, borderRadius: R.md, borderWidth: 1, borderColor: C.line },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.green, borderRadius: R.md, paddingVertical: 13, marginTop: 12,
  },
});
