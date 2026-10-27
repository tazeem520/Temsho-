import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform, ScrollView } from 'react-native';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import { C, R, shadow } from '../theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function DroneLoginIntro({ children }) {
  const droneY = useRef(new Animated.Value(-240)).current;
  const droneTilt = useRef(new Animated.Value(0)).current;
  const rotorSpin = useRef(new Animated.Value(0)).current;
  const ledBlink = useRef(new Animated.Value(0)).current;
  const hoverY = useRef(new Animated.Value(0)).current;

  const cardSway = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.92)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  const [droneArrived, setDroneArrived] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotorSpin, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ledBlink, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(ledBlink, { toValue: 0, duration: 400, useNativeDriver: true }),
      ])
    ).start();

    Animated.parallel([
      Animated.spring(droneY, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 5,
        tension: 45,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(droneTilt, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(droneTilt, { toValue: -1, duration: 300, useNativeDriver: true }),
        Animated.timing(droneTilt, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(cardSway, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(cardSway, { toValue: -1, duration: 350, useNativeDriver: true }),
        Animated.timing(cardSway, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ]).start(() => {
      setDroneArrived(true);

      Animated.loop(
        Animated.sequence([
          Animated.timing(hoverY, { toValue: -5, duration: 1200, useNativeDriver: true }),
          Animated.timing(hoverY, { toValue: 4, duration: 1200, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  const spinLeft = rotorSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const spinRight = rotorSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const tilt = droneTilt.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-5deg', '0deg', '5deg'],
  });

  const sway = cardSway.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-3.5deg', '0deg', '3.5deg'],
  });

  return (
    <View style={st.container}>
      <Animated.View
        style={[
          st.droneCarrier,
          {
            transform: [
              { translateY: droneY },
              { translateY: hoverY },
              { rotate: tilt },
            ],
          },
        ]}
      >
        <View style={st.droneBody}>
          <View style={st.armLeft}>
            <Animated.View style={[st.propeller, { transform: [{ rotate: spinLeft }] }]}>
              <View style={st.blade} />
              <View style={[st.blade, { transform: [{ rotate: '90deg' }] }]} />
            </Animated.View>
            <View style={st.motorCap} />
            <Animated.View style={[st.ledLight, { backgroundColor: '#10B981', opacity: ledBlink }]} />
          </View>

          <View style={[st.fuselage, shadow]}>
            <View style={st.cameraDome}>
              <MC name="video" size={14} color="#38BDF8" />
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={st.droneCode}>TEMSHO · AIR 01</Text>
              <View style={st.onlineBadge}>
                <View style={st.liveDot} />
                <Text style={st.liveText}>GPS LOCKED</Text>
              </View>
            </View>
          </View>

          <View style={st.armRight}>
            <Animated.View style={[st.propeller, { transform: [{ rotate: spinRight }] }]}>
              <View style={st.blade} />
              <View style={[st.blade, { transform: [{ rotate: '90deg' }] }]} />
            </Animated.View>
            <View style={st.motorCap} />
            <Animated.View style={[st.ledLight, { backgroundColor: '#EF4444', opacity: ledBlink }]} />
          </View>
        </View>

        <View style={st.cablesRow}>
          <View style={st.cableLine} />
          <View style={st.cargoHook}>
            <MC name="link-variant" size={15} color="#1A56DB" />
          </View>
          <View style={st.cableLine} />
        </View>

        <View style={st.deliveryParchmentTag}>
          <MC name="airplane-takeoff" size={13} color="#1A56DB" />
          <Text style={st.deliveryParchmentTagTxt}>
            ⚡ EXPRESS DOORSTEP LOGIN DELIVERY
          </Text>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          st.parchmentWrap,
          {
            opacity: cardOpacity,
            transform: [
              { scale: cardScale },
              { rotate: sway },
            ],
          },
        ]}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  droneCarrier: {
    paddingTop: Platform.OS === 'ios' ? 44 : 16,
    paddingHorizontal: 20, alignItems: 'center', zIndex: 100,
  },
  droneBody: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  armLeft: { alignItems: 'center', marginRight: -10 },
  armRight: { alignItems: 'center', marginLeft: -10 },
  propeller: { width: 64, height: 12, alignItems: 'center', justifyContent: 'center', marginBottom: -4 },
  blade: { position: 'absolute', width: 58, height: 3.5, borderRadius: 2, backgroundColor: '#1E293B' },
  motorCap: { width: 18, height: 14, borderRadius: 7, backgroundColor: '#334155', borderWidth: 1.5, borderColor: '#64748B' },
  ledLight: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
  fuselage: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 24, borderWidth: 2, borderColor: '#475569', zIndex: 10,
  },
  cameraDome: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#0F172A',
    alignItems: 'center', justifyContent: 'center', marginRight: 8, borderWidth: 1, borderColor: '#38BDF8',
  },
  droneCode: { color: '#F8FAFC', fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#10B981', marginRight: 4 },
  liveText: { color: '#94A3B8', fontSize: 8.5, fontWeight: '800' },
  cablesRow: { width: '65%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 18 },
  cableLine: { flex: 1, height: 1.5, backgroundColor: '#64748B' },
  cargoHook: { marginHorizontal: 8, backgroundColor: '#EFF6FF', padding: 2, borderRadius: 4, borderWidth: 1, borderColor: '#BFDBFE' },
  deliveryParchmentTag: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#DBEAFE',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: R.pill, borderWidth: 1, borderColor: '#93C5FD', marginTop: -2, marginBottom: 4,
  },
  deliveryParchmentTagTxt: { color: '#1E40AF', fontSize: 9.5, fontWeight: '900', marginLeft: 5, letterSpacing: 0.3 },
  parchmentWrap: {
    flex: 1, marginHorizontal: 12, marginBottom: 10, backgroundColor: C.bg, borderRadius: R.xl,
    overflow: 'hidden', borderWidth: 2, borderColor: '#CBD5E1', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 8,
  },
});
