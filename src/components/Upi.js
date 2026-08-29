import React from 'react';
import { View, Text, TouchableOpacity, Linking, Platform, StyleSheet } from 'react-native';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { C, R, money } from '../theme';

// upi://pay?pa=<upi>&pn=<naam>&am=<paisa>&cu=INR&tn=<note>
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
        <QRCode value={value} size={size} color="#141726" backgroundColor="#fff" />
      </View>
      <Text style={{ color: C.ink2, fontSize: 11.5, marginTop: 10, textAlign: 'center', lineHeight: 17 }}>
        Apne GPay / PhonePe / Paytm se{'\n'}ye QR scan kijiye
      </Text>
      <Text style={{ color: C.ink, fontWeight: '900', fontSize: 15, marginTop: 6 }}>{money(amount)}</Text>
    </View>
  );
}

export function PayNowBtn({ upi, name, amount, note }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => openUpi({ upi, name, amount, note })} style={q.btn}>
      <MC name="cellphone-check" size={18} color="#fff" />
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13.5, marginLeft: 8 }}>
        GPay / PhonePe kholein — {money(amount)}
      </Text>
    </TouchableOpacity>
  );
}

const q = StyleSheet.create({
  box: { backgroundColor: '#fff', padding: 12, borderRadius: R.md, borderWidth: 1, borderColor: C.line },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0F7A4A', borderRadius: R.md, paddingVertical: 13, marginTop: 12,
  },
});
