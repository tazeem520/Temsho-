import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';

export default function DroneLoginIntro({ children }) {
  const swayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [swayAnim]);

  const translateY = swayAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-3, 3],
  });

  return (
    <View style={st.container}>
      {/* Top Animated Delivery Drone Accent */}
      <Animated.View style={[st.droneWrap, { transform: [{ translateY }] }]}>
        <View style={st.droneBody}>
          <MC name="quadcopter" size={26} color="#2563EB" />
          <View style={st.ledBlink} />
        </View>
        <View style={st.cableRow}>
          <View style={st.cableLine} />
          <View style={st.cableLine} />
        </View>
      </Animated.View>

      {/* Main Content */}
      <View style={st.contentWrap}>
        {children}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  droneWrap: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    pointerEvents: 'none',
  },
  droneBody: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#93C5FD',
    shadowColor: '#2563EB',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  ledBlink: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginLeft: 6,
  },
  cableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 36,
    height: 12,
  },
  cableLine: {
    width: 1.5,
    height: 12,
    backgroundColor: '#93C5FD',
  },
  contentWrap: {
    flex: 1,
  },
});
