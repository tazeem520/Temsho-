import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { C, R, shadow } from '../theme';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import { Btn, Field } from '../components/UI';
import { useApp } from '../store';
import { sendOtp, verifyOtp, otpInfo } from '../lib/otp';

/* Sirf 2 step: phone number -> OTP. Koi KYC / document / face check nahi. */
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
      user: { name: name.trim() || 'Dost', phone, humanVerified: true, isSeller: false },
    });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 22, paddingTop: 64, paddingBottom: 60 }}>
      <View style={st.logoRow}>
        <View style={st.logoMark}>
          <MC name="storefront" size={26} color={C.brand} />
        </View>
        <View style={{ marginLeft: 12 }}>
          <Text style={{ fontSize: 24, fontWeight: '900', color: C.brand, letterSpacing: -0.5 }}>Temsho</Text>
          <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '600' }}>Poore Bharat ka apna bazaar</Text>
        </View>
      </View>

      <View style={[st.pledge, shadow]}>
        <MC name="account-check-outline" size={26} color={C.green} />
        <Text style={{ color: C.ink, fontWeight: '900', fontSize: 15, marginTop: 8 }}>No Bots. Only Humans.</Text>
        <Text style={{ color: C.ink2, fontSize: 12.5, lineHeight: 19, marginTop: 6 }}>
          Sirf mobile number se login — OTP seedha aapke WhatsApp/SMS par. Na Aadhaar, na PAN, na document.
          Ek number = ek insaan. Support par bhi koi bot nahi, 100% asli log baat karte hain.
        </Text>
      </View>

      <View style={st.steps}>
        {['Number daalein', 'OTP verify'].map((s, i) => (
          <View key={s} style={{ flex: 1, alignItems: 'center' }}>
            <View style={[st.dot, i <= step && { backgroundColor: C.brand }]}>
              <Text style={{ color: i <= step ? '#fff' : C.ink3, fontWeight: '800', fontSize: 12 }}>{i + 1}</Text>
            </View>
            <Text style={{ fontSize: 10.5, color: i <= step ? C.brand : C.ink3, fontWeight: '700', marginTop: 5 }}>{s}</Text>
          </View>
        ))}
      </View>

      {step === 0 && (
        <View style={[st.card, shadow]}>
          <Text style={st.h}>Apna mobile number daaliye</Text>
          <Text style={st.p}>India ka koi bhi 10 digit number chalega. Bas OTP se login karein.</Text>

          <View style={st.activeEngineTag}>
            <MC name="shield-key-outline" size={13} color={C.brand} />
            <Text style={{ color: C.brand, fontSize: 11, fontWeight: '800', marginLeft: 5 }}>
              Active OTP Engine: {info.label}
            </Text>
          </View>

          <Field label="Aapka naam" placeholder="Jaise: Aman Verma" value={name} onChangeText={setName} />
          <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>Mobile number</Text>
          <View style={st.phoneRow}>
            <View style={st.cc}><Text style={{ fontWeight: '800', color: C.ink }}>+91</Text></View>
            <TextInput
              value={phone}
              onChangeText={(t) => { setPhone(t.replace(/\D/g, '').slice(0, 10)); setErr(''); }}
              keyboardType="number-pad"
              placeholder="10 digit number"
              placeholderTextColor={C.ink3}
              style={st.phoneInput}
            />
          </View>
          {!!err && <Text style={st.err}>{err}</Text>}

          <Text style={{ color: C.ink2, fontSize: 12, fontWeight: '700', marginTop: 6, marginBottom: 8 }}>
            OTP kahan bhejein?
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 4 }}>
            <TouchableOpacity onPress={() => setVia('whatsapp')} activeOpacity={0.85}
              style={[st.viaBox, via === 'whatsapp' && { borderColor: '#25D366', backgroundColor: '#E9F9EF' }]}>
              <MC name="whatsapp" size={24} color="#25D366" />
              <Text style={{ fontWeight: '800', color: C.ink, fontSize: 13, marginTop: 6 }}>WhatsApp</Text>
              <Text style={{ color: C.ink3, fontSize: 10, marginTop: 2 }}>Turant aata hai</Text>
              {via === 'whatsapp' && (
                <View style={st.recBadge}><Text style={{ color: '#fff', fontSize: 8.5, fontWeight: '900' }}>SUJHAV</Text></View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setVia('sms')} activeOpacity={0.85}
              style={[st.viaBox, via === 'sms' && { borderColor: C.brand, backgroundColor: C.brandSoft }]}>
              <MC name="message-text-outline" size={24} color={C.brand} />
              <Text style={{ fontWeight: '800', color: C.ink, fontSize: 13, marginTop: 6 }}>SMS</Text>
              <Text style={{ color: C.ink3, fontSize: 10, marginTop: 2 }}>Net na ho to</Text>
            </TouchableOpacity>
          </View>

          <Btn
            title={busy ? 'Bhej rahe hain…' : via === 'whatsapp' ? 'WhatsApp par OTP bhejein' : 'SMS par OTP bhejein'}
            icon={via === 'whatsapp' ? 'whatsapp' : 'message-text-outline'}
            tone={via === 'whatsapp' ? 'green' : 'brand'}
            style={{ marginTop: 14 }}
            disabled={busy}
            onPress={async () => {
              if (phone.length !== 10) return setErr('Sahi 10 digit number daaliye');
              setBusy(true); setErr('');
              const r = await sendOtp(phone, via, activeProvider);
              setBusy(false);
              if (r.ok) {
                if (r.demoCode) setHintCode(r.demoCode);
                setStep(1);
              } else {
                setErr(r.msg || 'OTP nahi bheja ja saka');
              }
            }}
          />
          <View style={st.noDoc}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <MC name="shield-check-outline" size={14} color="#0F7A4A" />
              <Text style={{ color: '#0F7A4A', fontSize: 11.5, fontWeight: '700', marginLeft: 6 }}>
                Koi Aadhaar nahi · Koi PAN nahi · Koi selfie nahi
              </Text>
            </View>
          </View>
          <Text style={st.tnc}>Aage badhne par aap Temsho ki Shartein aur Privacy Policy se sehmat hain.</Text>
        </View>
      )}

      {step === 1 && (
        <View style={[st.card, shadow]}>
          <Text style={st.h}>OTP daaliye</Text>
          <View style={[st.sentVia, via === 'whatsapp' && { backgroundColor: '#E9F9EF' }]}>
            <MC name={via === 'whatsapp' ? 'whatsapp' : 'message-text-outline'} size={17} color={via === 'whatsapp' ? '#25D366' : C.brand} />
            <Text style={{ flex: 1, marginLeft: 9, color: C.ink2, fontSize: 12, lineHeight: 17 }}>
              {via === 'whatsapp' ? 'WhatsApp' : 'SMS'} par <Text style={{ fontWeight: '800', color: C.ink }}>+91 {phone}</Text> ko 4 digit ka code bheja gaya hai.
            </Text>
          </View>

          {hintCode && (
            <View style={st.demoHint}>
              <MC name="lightbulb-on-outline" size={15} color="#9A6208" />
              <Text style={{ color: '#9A6208', fontSize: 11.5, fontWeight: '800', marginLeft: 6 }}>
                Test OTP: {hintCode}
              </Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
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
            title={busy ? 'Jaanch rahe hain…' : 'Verify karke andar jayein'}
            tone="green"
            style={{ marginTop: 20 }}
            disabled={otp.join('').length !== 4 || busy}
            onPress={async () => {
              setBusy(true); setErr('');
              const r = await verifyOtp(phone, otp.join(''), activeProvider);
              setBusy(false);
              if (r.ok) finish(); else setErr(r.msg || 'Galat OTP');
            }}
          />
          <TouchableOpacity
            onPress={() => {
              sendOtp(phone, via, activeProvider);
            }}
            style={{ marginTop: 14, alignItems: 'center' }}
          >
            <Text style={{ color: C.brand, fontWeight: '700', fontSize: 12.5 }}>OTP dobara bhejein</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setVia(via === 'whatsapp' ? 'sms' : 'whatsapp')} style={{ marginTop: 10, alignItems: 'center' }}>
            <Text style={{ color: C.ink2, fontWeight: '700', fontSize: 12.5 }}>
              {via === 'whatsapp' ? 'SMS par mangwayein' : 'WhatsApp par mangwayein'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep(0)} style={{ marginTop: 12, alignItems: 'center' }}>
            <Text style={{ color: C.ink3, fontWeight: '600', fontSize: 13 }}>Number badlein</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  logoMark: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: C.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  pledge: { backgroundColor: C.surface, borderRadius: R.lg, padding: 16, borderLeftWidth: 4, borderLeftColor: C.green },
  steps: { flexDirection: 'row', marginTop: 24, marginBottom: 16, paddingHorizontal: 40 },
  dot: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: '#E7E9F2',
    alignItems: 'center', justifyContent: 'center',
  },
  card: { backgroundColor: C.surface, borderRadius: R.xl, padding: 20 },
  h: { fontSize: 19, fontWeight: '900', color: C.ink },
  p: { fontSize: 13, color: C.ink2, lineHeight: 19, marginTop: 6, marginBottom: 16 },
  phoneRow: { flexDirection: 'row', alignItems: 'center' },
  cc: {
    paddingHorizontal: 12, paddingVertical: 13, backgroundColor: '#EFF1F6',
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
  activeEngineTag: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.brandSoft,
    borderRadius: R.sm, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 14, marginTop: -6,
  },
  demoHint: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF4E5',
    borderRadius: R.sm, paddingHorizontal: 10, paddingVertical: 8, marginTop: 10,
  },
  viaBox: {
    flex: 1, borderWidth: 1.8, borderColor: C.line, borderRadius: R.md,
    paddingVertical: 14, alignItems: 'center', backgroundColor: C.surface,
  },
  recBadge: {
    position: 'absolute', top: -8, right: 8, backgroundColor: '#25D366',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  sentVia: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.brandSoft, borderRadius: R.md, padding: 12, marginTop: 4 },
  noDoc: { backgroundColor: C.greenSoft, borderRadius: R.md, padding: 11, marginTop: 16 },
  err: { color: C.red, fontSize: 12, marginTop: 8, fontWeight: '600' },
  tnc: { color: C.ink3, fontSize: 11, textAlign: 'center', marginTop: 14, lineHeight: 16 },
});
