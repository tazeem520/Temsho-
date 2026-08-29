import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { C, R, shadow } from '../theme';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import { Btn, Field } from '../components/UI';
import { useApp } from '../store';
import { sendOtp, verifyOtp, otpInfo } from '../lib/otp';

export default function Onboarding() {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [err, setErr] = useState('');
  const [via, setVia] = useState('whatsapp'); // whatsapp | sms
  const [busy, setBusy] = useState(false);
  const [hintCode, setHintCode] = useState(null);

  const activeProvider = state.admin?.otpProvider || 'supabase';
  const info = otpInfo(activeProvider);
  const refs = [useRef(), useRef(), useRef(), useRef()];

  const setOtpAt = (i, v) => {
    const d = v.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    if (d && i < 3) refs[i + 1].current?.focus();
  };

  const finish = () =>
    dispatch({
      type: 'LOGIN',
      user: { name: name.trim() || 'Valued User', phone, humanVerified: true, isSeller: false },
    });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 22, paddingTop: 64, paddingBottom: 60 }}>
      {/* Brand Header */}
      <View style={st.logoRow}>
        <View style={st.logoMark}>
          <MC name="storefront" size={28} color="#fff" />
        </View>
        <View style={{ marginLeft: 14 }}>
          <Text style={{ fontSize: 26, fontWeight: '900', color: C.brandNavy, letterSpacing: -0.5 }}>Temsho</Text>
          <Text style={{ color: C.ink2, fontSize: 13, fontWeight: '600' }}>India's Verified Human Marketplace</Text>
        </View>
      </View>

      {/* Human-Only Pledge Banner */}
      <View style={[st.pledge, shadow]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MC name="account-check" size={24} color={C.green} />
          <Text style={{ color: C.ink, fontWeight: '900', fontSize: 16, marginLeft: 8 }}>No Bots. Only Humans.</Text>
        </View>
        <Text style={{ color: C.ink2, fontSize: 13, lineHeight: 19, marginTop: 8 }}>
          Instant, secure login with your mobile number. OTP is delivered directly to your WhatsApp or SMS.
          No paperwork, no Aadhaar or PAN required. Every seller and support agent is a real, verified human.
        </Text>
      </View>

      {/* Step Indicators */}
      <View style={st.steps}>
        {['Enter Mobile', 'Verify OTP'].map((s, i) => (
          <View key={s} style={{ flex: 1, alignItems: 'center' }}>
            <View style={[st.dot, i <= step && { backgroundColor: C.brand }]}>
              <Text style={{ color: i <= step ? '#fff' : C.ink3, fontWeight: '800', fontSize: 12 }}>{i + 1}</Text>
            </View>
            <Text style={{ fontSize: 11, color: i <= step ? C.brand : C.ink3, fontWeight: '700', marginTop: 5 }}>{s}</Text>
          </View>
        ))}
      </View>

      {/* STEP 0: PHONE INPUT */}
      {step === 0 && (
        <View style={[st.card, shadow]}>
          <Text style={st.h}>Enter your mobile number</Text>
          <Text style={st.p}>We will send a 4-digit verification code to verify your human identity.</Text>

          <Field label="Your Full Name" placeholder="e.g. Rahul Sharma" value={name} onChangeText={setName} />
          
          <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>Mobile Number</Text>
          <View style={st.phoneRow}>
            <View style={st.cc}><Text style={{ fontWeight: '800', color: C.ink }}>+91</Text></View>
            <TextInput
              value={phone}
              onChangeText={(t) => { setPhone(t.replace(/\D/g, '').slice(0, 10)); setErr(''); }}
              keyboardType="number-pad"
              placeholder="10-digit number"
              placeholderTextColor={C.ink3}
              style={st.phoneInput}
            />
          </View>
          {!!err && <Text style={st.err}>{err}</Text>}

          <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '700', marginTop: 14, marginBottom: 8 }}>
            Where should we send your OTP?
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 4 }}>
            <TouchableOpacity
              onPress={() => setVia('whatsapp')}
              activeOpacity={0.85}
              style={[st.viaBox, via === 'whatsapp' && { borderColor: '#25D366', backgroundColor: '#ECFDF5' }]}
            >
              <MC name="whatsapp" size={24} color="#25D366" />
              <Text style={{ fontWeight: '800', color: C.ink, fontSize: 13, marginTop: 6 }}>WhatsApp</Text>
              <Text style={{ color: C.ink3, fontSize: 10.5, marginTop: 2 }}>Instant Delivery</Text>
              {via === 'whatsapp' && (
                <View style={st.recBadge}><Text style={{ color: '#fff', fontSize: 8.5, fontWeight: '900' }}>FAST</Text></View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setVia('sms')}
              activeOpacity={0.85}
              style={[st.viaBox, via === 'sms' && { borderColor: C.brand, backgroundColor: C.brandSoft }]}
            >
              <MC name="message-text-outline" size={24} color={C.brand} />
              <Text style={{ fontWeight: '800', color: C.ink, fontSize: 13, marginTop: 6 }}>SMS</Text>
              <Text style={{ color: C.ink3, fontSize: 10.5, marginTop: 2 }}>Cellular Network</Text>
            </TouchableOpacity>
          </View>

          <Btn
            title={busy ? 'Sending OTP…' : via === 'whatsapp' ? 'Send OTP via WhatsApp' : 'Send OTP via SMS'}
            icon={via === 'whatsapp' ? 'whatsapp' : 'message-text-outline'}
            tone={via === 'whatsapp' ? 'green' : 'brand'}
            style={{ marginTop: 16 }}
            disabled={busy}
            onPress={async () => {
              if (phone.length !== 10) return setErr('Please enter a valid 10-digit mobile number');
              setBusy(true); setErr('');
              const r = await sendOtp(phone, via, activeProvider);
              setBusy(false);
              if (r.ok) {
                if (r.demoCode) setHintCode(r.demoCode);
                setStep(1);
              } else {
                setErr(r.msg || 'Unable to send OTP. Please try again.');
              }
            }}
          />

          <View style={st.noDoc}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <MC name="shield-check" size={15} color="#059669" />
              <Text style={{ color: '#059669', fontSize: 11.5, fontWeight: '700', marginLeft: 6 }}>
                Zero Paperwork · No Aadhaar / PAN required · 100% Secure
              </Text>
            </View>
          </View>

          <Text style={st.tnc}>By continuing, you agree to Temsho's Terms of Service and Privacy Policy.</Text>
        </View>
      )}

      {/* STEP 1: OTP VERIFICATION */}
      {step === 1 && (
        <View style={[st.card, shadow]}>
          <Text style={st.h}>Enter Verification Code</Text>
          <View style={[st.sentVia, via === 'whatsapp' && { backgroundColor: '#ECFDF5' }]}>
            <MC name={via === 'whatsapp' ? 'whatsapp' : 'message-text-outline'} size={18} color={via === 'whatsapp' ? '#25D366' : C.brand} />
            <Text style={{ flex: 1, marginLeft: 9, color: C.ink2, fontSize: 12.5, lineHeight: 18 }}>
              A 4-digit verification code was sent to <Text style={{ fontWeight: '800', color: C.ink }}>+91 {phone}</Text> via {via === 'whatsapp' ? 'WhatsApp' : 'SMS'}.
            </Text>
          </View>

          {hintCode && (
            <View style={st.demoHint}>
              <MC name="key-variant" size={16} color="#D97706" />
              <Text style={{ color: '#92400E', fontSize: 12, fontWeight: '800', marginLeft: 6 }}>
                Verification Code: {hintCode}
              </Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
            {otp.map((v, i) => (
              <TextInput
                key={i}
                ref={refs[i]}
                value={v}
                onChangeText={(t) => setOtpAt(i, t)}
                keyboardType="number-pad"
                maxLength={1}
                style={[st.otpBox, v && { borderColor: C.brand, backgroundColor: C.brandSoft }]}
              />
            ))}
          </View>
          {!!err && <Text style={st.err}>{err}</Text>}

          <Btn
            title={busy ? 'Verifying…' : 'Verify & Continue'}
            tone="brand"
            style={{ marginTop: 20 }}
            disabled={otp.join('').length !== 4 || busy}
            onPress={async () => {
              setBusy(true); setErr('');
              const r = await verifyOtp(phone, otp.join(''), activeProvider);
              setBusy(false);
              if (r.ok) {
                finish();
              } else {
                setErr(r.msg || 'Invalid OTP code. Please enter the correct code.');
              }
            }}
          />

          <TouchableOpacity
            onPress={async () => {
              setBusy(true);
              const r = await sendOtp(phone, via, activeProvider);
              setBusy(false);
              if (r.demoCode) setHintCode(r.demoCode);
            }}
            style={{ marginTop: 14, alignItems: 'center' }}
          >
            <Text style={{ color: C.brand, fontWeight: '700', fontSize: 13 }}>Resend Verification Code</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setVia(via === 'whatsapp' ? 'sms' : 'whatsapp')} style={{ marginTop: 10, alignItems: 'center' }}>
            <Text style={{ color: C.ink2, fontWeight: '600', fontSize: 12.5 }}>
              {via === 'whatsapp' ? 'Switch to SMS OTP' : 'Switch to WhatsApp OTP'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setStep(0)} style={{ marginTop: 12, alignItems: 'center' }}>
            <Text style={{ color: C.ink3, fontWeight: '600', fontSize: 13 }}>Change Mobile Number</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  logoMark: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: C.brand,
    alignItems: 'center', justifyContent: 'center',
  },
  pledge: { backgroundColor: C.surface, borderRadius: R.lg, padding: 16, borderLeftWidth: 4, borderLeftColor: C.green },
  steps: { flexDirection: 'row', marginTop: 24, marginBottom: 16, paddingHorizontal: 40 },
  dot: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  card: { backgroundColor: C.surface, borderRadius: R.xl, padding: 20 },
  h: { fontSize: 20, fontWeight: '900', color: C.ink },
  p: { fontSize: 13, color: C.ink2, lineHeight: 19, marginTop: 6, marginBottom: 16 },
  phoneRow: { flexDirection: 'row', alignItems: 'center' },
  cc: {
    paddingHorizontal: 12, paddingVertical: 13, backgroundColor: '#F3F4F6',
    borderRadius: R.md, marginRight: 8,
  },
  phoneInput: {
    flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line,
    borderRadius: R.md, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: C.ink,
  },
  otpBox: {
    width: 58, height: 62, borderRadius: R.md, borderWidth: 1.5, borderColor: C.line,
    backgroundColor: C.surface, textAlign: 'center', fontSize: 24, fontWeight: '800', color: C.ink,
  },
  demoHint: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB',
    borderRadius: R.sm, paddingHorizontal: 12, paddingVertical: 8, marginTop: 12,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  viaBox: {
    flex: 1, borderWidth: 1.8, borderColor: C.line, borderRadius: R.md,
    paddingVertical: 14, alignItems: 'center', backgroundColor: C.surface,
  },
  recBadge: {
    position: 'absolute', top: -8, right: 8, backgroundColor: '#25D366',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  sentVia: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.brandSoft, borderRadius: R.md, padding: 12, marginTop: 6 },
  noDoc: { backgroundColor: C.greenSoft, borderRadius: R.md, padding: 11, marginTop: 16 },
  err: { color: C.red, fontSize: 12, marginTop: 8, fontWeight: '600' },
  tnc: { color: C.ink3, fontSize: 11, textAlign: 'center', marginTop: 14, lineHeight: 16 },
});
