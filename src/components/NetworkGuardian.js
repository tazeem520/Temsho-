import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Network from 'expo-network';
import { C, R, shadow } from '../theme';

/**
 * Checks if the device has actual internet reachability by pinging fast 204/ping endpoints
 */
async function checkRealInternet() {
  // 1. Check native network state via expo-network
  try {
    const netState = await Network.getNetworkStateAsync();
    if (netState && (netState.isConnected === false || netState.isInternetReachable === false)) {
      return false;
    }
  } catch (e) {
    // expo-network might not be supported on all web browsers; proceed to fetch ping
  }

  // 2. Web browser navigator.onLine check
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.onLine === false) {
    return false;
  }

  // 3. Real HTTP reachability ping with strict timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    // Try pinging Google 204 or Cloudflare or Supabase
    const res = await fetch('https://clients3.google.com/generate_204', {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return true;
  } catch (err) {
    // Fallback ping to secondary endpoint
    try {
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 3000);
      await fetch('https://zyyxpkyqagewsjfwlktd.supabase.co', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller2.signal,
      });
      clearTimeout(timeoutId2);
      return true;
    } catch (e2) {
      return false;
    }
  }
}

export function NetworkGuardian({ children }) {
  const [isOnline, setIsOnline] = useState(true);
  const [checking, setChecking] = useState(false);
  const [showRestoredToast, setShowRestoredToast] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for offline icon
  useEffect(() => {
    if (!isOnline) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isOnline]);

  const verifyConnection = useCallback(async (manual = false) => {
    if (manual) setChecking(true);
    const reachable = await checkRealInternet();
    
    setIsOnline((prev) => {
      if (!prev && reachable) {
        // Connection just restored! Show quick toast
        setShowRestoredToast(true);
        setTimeout(() => setShowRestoredToast(false), 2500);
      }
      return reachable;
    });

    if (manual) {
      setTimeout(() => setChecking(false), 400);
    }
  }, []);

  // Initial check and periodic background heartbeat
  useEffect(() => {
    verifyConnection();

    // Listen to web online/offline events if running on Web
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleOnline = () => verifyConnection();
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      const interval = setInterval(() => {
        verifyConnection();
      }, 5000);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        clearInterval(interval);
      };
    } else {
      // Native periodic check
      const interval = setInterval(() => {
        verifyConnection();
      }, 4500);

      return () => clearInterval(interval);
    }
  }, [verifyConnection]);

  // If OFFLINE: Render full-screen blocking screen (app bina net ke nahi chalega)
  if (!isOnline) {
    return (
      <View style={s.offlineRoot}>
        <LinearGradient colors={['#0F172A', '#1E2562', '#111827']} style={StyleSheet.absoluteFillObject} />

        <View style={s.offlineContent}>
          {/* Animated Offline Icon */}
          <Animated.View style={[s.iconBox, { transform: [{ scale: pulseAnim }] }]}>
            <View style={s.iconGlow}>
              <MC name="wifi-off" size={46} color="#EF4444" />
            </View>
          </Animated.View>

          {/* Status Badge */}
          <View style={s.badge}>
            <View style={s.dotRed} />
            <Text style={s.badgeTxt}>OFFLINE · NO INTERNET DETECTED</Text>
          </View>

          {/* Title & Subtitle */}
          <Text style={s.title}>Internet Connection Required</Text>
          <Text style={s.sub}>
            Temsho requires an active internet connection to browse genuine products, verify sellers, connect with human support, and process live orders.
          </Text>

          {/* Checklist Card */}
          <View style={s.checkCard}>
            <View style={s.checkRow}>
              <MC name="checkbox-marked-circle" size={18} color="#60A5FA" />
              <Text style={s.checkTxt}>Turn ON Wi-Fi or Mobile Data</Text>
            </View>
            <View style={s.checkRow}>
              <MC name="airplane-off" size={18} color="#60A5FA" />
              <Text style={s.checkTxt}>Turn OFF Airplane Mode</Text>
            </View>
            <View style={s.checkRow}>
              <MC name="refresh" size={18} color="#60A5FA" />
              <Text style={s.checkTxt}>Tap Retry once reconnected</Text>
            </View>
          </View>

          {/* Retry Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => verifyConnection(true)}
            disabled={checking}
            style={[s.retryBtn, checking && { opacity: 0.7 }]}
          >
            {checking ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={s.retryTxt}>Checking Connection...</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MC name="reload" size={20} color="#fff" />
                <Text style={s.retryTxt}>Check Connection & Retry</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={s.footerNote}>
            🔒 Temsho strictly protects your transactions with live end-to-end sync.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {children}

      {/* Online Restored Toast */}
      {showRestoredToast && (
        <View style={s.toastBox}>
          <MC name="wifi-check" size={18} color="#fff" />
          <Text style={s.toastTxt}>Back Online · Connected to Temsho</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  offlineRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    padding: 24,
  },
  offlineContent: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  iconBox: {
    marginBottom: 20,
  },
  iconGlow: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EF4444',
    marginBottom: 14,
  },
  dotRed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 7,
  },
  badgeTxt: {
    color: '#FCA5A5',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  sub: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  checkCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 22,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4.5,
  },
  checkTxt: {
    color: '#E2E8F0',
    fontSize: 12.5,
    fontWeight: '700',
    marginLeft: 10,
  },
  retryBtn: {
    width: '100%',
    backgroundColor: '#2874F0',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2874F0',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  retryTxt: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '900',
    marginLeft: 8,
  },
  footerNote: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 16,
  },
  toastBox: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 9999,
  },
  toastTxt: {
    color: '#fff',
    fontSize: 12.5,
    fontWeight: '800',
    marginLeft: 8,
  },
});
