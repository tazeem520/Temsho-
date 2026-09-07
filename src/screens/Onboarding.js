import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, R, shadow } from '../theme';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import { Btn, Field } from '../components/UI';
import { useApp } from '../store';
import { sendOtp, verifyOtp } from '../lib/otp';

export default function Onboarding() {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [singleOtp, setSingleOtp] = useState('');
  const [err, setErr] = useState('');
  const [via, setVia] = useState('whatsapp'); // whatsapp | sms
  const [busy, setBusy] = useState(false);

  const activeProvider = state.admin?.otpProvider || 'supabase';
  const refs = [useRef(), useRef(), useRef(), useRef()];

  const applyCode = (raw) => {
    const cleaned = String(raw || '').replace(/\D/g, '').slice(0, 4);
    setSingleOtp(cleaned);
    const arr = ['', '', '', ''];
    for (let i = 0; i < cleaned.length; i++) {
      arr[i] = cleaned[i];
    }
    setOtp(arr);
    if (cleaned.length === 4) {
      setErr('');
    }
  };

  const setOtpAt = (i, v) => {
    const d = v.replace(/\D/g, '');
    if (d.length > 1) {
      applyCode(d);
      return;
    }
    const next = [...otp];
    next[i] = d.slice(-1);
    setOtp(next);
    setSingleOtp(next.join(''));
    if (d && i < 3) refs[i + 1].current?.focus();
  };

  const finish = async () => {
    const cleanPh = String(phone).replace(/\D/g, '').slice(-10);
    const userKey = '@temsho/account_' + cleanPh;
    try {
      const [rawUser, rawAllProducts, rawAudit, rawAdmin] = await Promise.all([
        AsyncStorage.getItem(userKey),
        AsyncStorage.getItem('@temsho/all_products_catalog'),
        AsyncStorage.getItem('@temsho/owner_audit_log'),
        AsyncStorage.getItem('@temsho/admin_settings'),
      ]);

      if (rawUser) {
        const userAccount = JSON.parse(rawUser);
        const allProds = rawAllProducts ? JSON.parse(rawAllProducts) : [];
        const auditLog = rawAudit ? JSON.parse(rawAudit) : [];
        const adminSettings = rawAdmin ? JSON.parse(rawAdmin) : null;

        dispatch({
          type: 'RESTORE_USER_ACCOUNT',
          phone: cleanPh,
          name: name.trim() || userAccount.user?.name || 'Valued User',
          userAccount,
          allProducts: allProds,
          auditLog,
          adminSettings,
        });
        return;
      }
    } catch (e) {}

    // First time login
    dispatch({
      type: 'LOGIN',
      user: { name: name.trim() || 'Valued User', phone: cleanPh, humanVerified: true, isSeller: false },
    });
  };

  const doVerify = async () => {
    const code = singleOtp || otp.join('');
    if (code.length !== 4) return setErr('Please enter the 4-digit verification code');
    setBusy(true);
    setErr('');
    const r = await verifyOtp(phone, code, activeProvider);
    setBusy(false);
    if (r.ok) {
      finish();
    } else {
      setErr(r.msg || 'Invalid verification code. Please check your SMS/WhatsApp and try again.');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, paddingTop: 32, paddingBottom: 36 }}>
      {/* Brand Header */}
      <View style={st.logoRow}>
        <View style={st.logoMark}>
          <MC name="storefront" size={24} color="#fff" />
        </View>
        <View style={{ marginLeft: 10 }}>
          <Text style={{ fontSize: 22, fontWeight: '900', color: C.brandNavy, letterSpacing: -0.5 }}>Temsho</Text>
          <Text style={{ color: C.ink2, fontSize: 11.5, fontWeight: '600' }}>India's Trusted Marketplace</Text>
        </View>
      </View>

      {/* Trust Banner */}
      <View style={[st.pledge, shadow]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MC name="shield-check" size={19} color={C.green} />
          <Text style={{ color: C.ink, fontWeight: '900', fontSize: 14, marginLeft: 6 }}>Fast & Secure Login</Text>
        </View>
        <Text style={{ color: C.ink2, fontSize: 11.5, lineHeight: 16, marginTop: 4 }}>
          Instant mobile OTP login. Direct seller payments and dedicated customer support.
        </Text>
      </View>

      {/* Step Indicators */}
      <View style={st.steps}>
        {['Mobile Number', 'Verify OTP'].map((s, i) => (
          <View key={s} style={{ flex: 1, alignItems: 'center' }}>
            <View style={[st.dot, i <= step && { backgroundColor: C.brand }]}>
              <Text style={{ color: i <= step ? '#fff' : C.ink3, fontWeight: '800', fontSize: 11 }}>{i + 1}</Text>
            </View>
            <Text style={{ fontSize: 10.5, color: i <= step ? C.brand : C.ink3, fontWeight: '700', marginTop: 3 }}>{s}</Text>
          </View>
        ))}
      </View>

      {/* STEP 0: PHONE INPUT */}
      {step === 0 && (
        <View style={[st.card, shadow]}>
          <Text style={st.h}>Login to Temsho</Text>
          <Text style={st.p}>Enter your 10-digit mobile number to receive an OTP verification code on your phone.</Text>

          <Field label="Your Name (Optional)" placeholder="e.g. Rahul Sharma" value={name} onChangeText={setName} />
          
          <Text style={{ color: C.ink2, fontSize: 11.5, fontWeight: '700', marginBottom: 5 }}>Mobile Number</Text>
          <View style={st.phoneRow}>
            <View style={st.cc}><Text style={{ fontWeight: '800', color: C.ink, fontSize: 13.5 }}>+91</Text></View>
            <TextInput
              value={phone}
              onChangeText={(t) => { setPhone(t.replace(/\D/g, '').slice(0, 10)); setErr(''); }}
              keyboardType="number-pad"
              placeholder="10-digit mobile number"
              placeholderTextColor={C.ink3}
              style={st.phoneInput}
            />
          </View>
          {!!err && <Text style={st.err}>{err}</Text>}

          <Text style={{ color: C.ink2, fontSize: 11.5, fontWeight: '700', marginTop: 10, marginBottom: 6 }}>
            Send Verification Code via:
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 2 }}>
            <TouchableOpacity
              onPress={() => setVia('whatsapp')}
              activeOpacity={0.85}
              style={[st.viaBox, via === 'whatsapp' && { borderColor: '#25D366', backgroundColor: '#ECFDF5' }]}
            >
              <MC name="whatsapp" size={20} color="#25D366" />
              <Text style={{ fontWeight: '800', color: C.ink, fontSize: 12, marginTop: 4 }}>WhatsApp</Text>
              {via === 'whatsapp' && (
                <View style={st.recBadge}><Text style={{ color: '#fff', fontSize: 8, fontWeight: '900' }}>FAST</Text></View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setVia('sms')}
              activeOpacity={0.85}
              style={[st.viaBox, via === 'sms' && { borderColor: C.brand, backgroundColor: C.brandSoft }]}
            >
              <MC name="message-text-outline" size={20} color={C.brand} />
              <Text style={{ fontWeight: '800', color: C.ink, fontSize: 12, marginTop: 4 }}>SMS</Text>
            </TouchableOpacity>
          </View>

          <Btn
            title={busy ? 'Sending OTP to phone…' : via === 'whatsapp' ? 'Send OTP via WhatsApp' : 'Send OTP via SMS'}
            icon={via === 'whatsapp' ? 'whatsapp' : 'message-text-outline'}
            tone={via === 'whatsapp' ? 'green' : 'brand'}
            style={{ marginTop: 14, paddingVertical: 11 }}
            disabled={busy}
            onPress={async () => {
              if (phone.length !== 10) return setErr('Please enter a valid 10-digit mobile number');
              setBusy(true); setErr('');
              const r = await sendOtp(phone, via, activeProvider);
              setBusy(false);
              if (r.ok) {
                setStep(1);
              } else {
                setErr(r.msg || 'Unable to send OTP. Please try again.');
              }
            }}
          />

          <View style={st.noDoc}>
            <MC name="shield-check" size={14} color="#059669" />
            <Text style={{ color: '#059669', fontSize: 11, fontWeight: '700', marginLeft: 6 }}>
              No Aadhaar · No PAN · 100% Secure
            </Text>
          </View>
        </View>
      )}

      {/* STEP 1: OTP VERIFICATION */}
      {step === 1 && (
        <View style={[st.card, shadow]}>
          <Text style={st.h}>Enter Verification Code</Text>
          <View style={[st.sentVia, via === 'whatsapp' && { backgroundColor: '#ECFDF5' }]}>
            <MC name={via === 'whatsapp' ? 'whatsapp' : 'message-text-outline'} size={18} color={via === 'whatsapp' ? '#25D366' : C.brand} />
            <Text style={{ flex: 1, marginLeft: 8, color: C.ink2, fontSize: 12, lineHeight: 17 }}>
              A 4-digit code has been sent to <Text style={{ fontWeight: '800', color: C.ink }}>+91 {phone}</Text> via {via === 'whatsapp' ? 'WhatsApp' : 'SMS'}. Please check your phone messages.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
            {otp.map((v, i) => (
              <TextInput
                key={i}
                ref={refs[i]}
                value={v}
                onChangeText={(t) => setOtpAt(i, t)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace' && !otp[i] && i > 0) {
                    refs[i - 1].current?.focus();
                  }
                }}
                keyboardType="number-pad"
                maxLength={4}
                style={[st.otpBox, v && { borderColor: C.brand, backgroundColor: C.brandSoft }]}
              />
            ))}
          </View>
          {!!err && <Text style={st.err}>{err}</Text>}

          <Btn
            title={busy ? 'Verifying…' : 'Verify & Enter'}
            tone="brand"
            style={{ marginTop: 18, paddingVertical: 11 }}
            disabled={(singleOtp.length !== 4 && otp.join('').length !== 4) || busy}
            onPress={doVerify}
          />

          <TouchableOpacity
            onPress={async () => {
              setBusy(true);
              setErr('');
              const r = await sendOtp(phone, via, activeProvider);
              setBusy(false);
              if (r.ok) {
                setErr('New verification code sent to your phone.');
              }
            }}
            style={{ marginTop: 14, alignItems: 'center' }}
          >
            <Text style={{ color: C.brand, fontWeight: '700', fontSize: 12.5 }}>Resend Code to Phone</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setStep(0); setErr(''); }} style={{ marginTop: 12, alignItems: 'center' }}>
            <Text style={{ color: C.ink3, fontWeight: '600', fontSize: 12 }}>Change Mobile Number</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  logoMark: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: C.brand,
    alignItems: 'center', justifyContent: 'center',
  },
  pledge: { backgroundColor: C.surface, borderRadius: R.md, padding: 12, borderLeftWidth: 3.5, borderLeftColor: C.green },
  steps: { flexDirection: 'row', marginTop: 14, marginBottom: 12, paddingHorizontal: 20 },
  dot: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  card: { backgroundColor: C.surface, borderRadius: R.lg, padding: 16 },
  h: { fontSize: 17, fontWeight: '900', color: C.ink },
  p: { fontSize: 12, color: C.ink2, lineHeight: 17, marginTop: 4, marginBottom: 12 },
  phoneRow: { flexDirection: 'row', alignItems: 'center' },
  cc: {
    paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#F3F4F6',
    borderRadius: R.sm, marginRight: 6,
  },
  phoneInput: {
    flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line,
    borderRadius: R.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.ink,
  },
  otpBox: {
    width: 52, height: 52, borderRadius: R.sm, borderWidth: 1.5, borderColor: C.line,
    backgroundColor: C.surface, textAlign: 'center', fontSize: 20, fontWeight: '800', color: C.ink,
  },
  viaBox: {
    flex: 1, borderWidth: 1.5, borderColor: C.line, borderRadius: R.sm,
    paddingVertical: 10, alignItems: 'center', backgroundColor: C.surface,
  },
  recBadge: {
    position: 'absolute', top: -6, right: 6, backgroundColor: '#25D366',
    paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4,
  },
  sentVia: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.brandSoft, borderRadius: R.sm, padding: 10, marginTop: 4 },
  noDoc: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.greenSoft, borderRadius: R.sm, padding: 8, marginTop: 12 },
  err: { color: C.red, fontSize: 11.5, marginTop: 6, fontWeight: '600' },
});
