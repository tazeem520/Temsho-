import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, Animated, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { C, R } from './src/theme';
import { AppProvider, useApp } from './src/store';
import Onboarding from './src/screens/Onboarding';
import { Home, Search, Category, Offers, SellerStorefront } from './src/screens/Shop';
import { Product, Cart } from './src/screens/Product';
import { Checkout, Success, Orders } from './src/screens/Checkout';
import { Account, Wishlist, BecomeSeller, Seller, Support, Policy, PrivacyPolicyScreen } from './src/screens/Account';
import { Notifications, Wallet, SellerOrders, Addresses } from './src/screens/Extras';
import { Settings, EditProfile, EditLocation, ChangePhone, Language, PaymentSettings, ShopSettings } from './src/screens/Settings';
import {
  Admin,
  AdminBrand,
  AdminMoney,
  AdminFeatures,
  AdminBroadcast,
  AdminProducts,
  AdminOtp,
  AdminDatabase,
  AdminLogistics,
  AdminPlayStore,
  AdminCoupons,
  AdminBanners,
  AdminAuditLedger,
  AdminOwnerPayment,
  AdminSellers,
  AdminShiprocket,
} from './src/screens/Admin';
import { DeliveryBoy } from './src/screens/DeliveryBoy';

const SCREENS = {
  home: Home, search: Search, category: Category, offers: Offers, product: Product, cart: Cart,
  checkout: Checkout, success: Success, orders: Orders, account: Account,
  wishlist: Wishlist, 'become-seller': BecomeSeller, seller: Seller,
  support: Support, policy: Policy, 'privacy-policy': PrivacyPolicyScreen,
  notifications: Notifications, wallet: Wallet,
  'seller-orders': SellerOrders, addresses: Addresses,
  settings: Settings, 'edit-profile': EditProfile, 'edit-location': EditLocation,
  'change-phone': ChangePhone, language: Language,
  'payment-settings': PaymentSettings, 'shop-settings': ShopSettings,
  'seller-storefront': SellerStorefront,
  admin: Admin, 'admin-brand': AdminBrand, 'admin-money': AdminMoney,
  'admin-features': AdminFeatures, 'admin-broadcast': AdminBroadcast, 'admin-products': AdminProducts,
  'admin-otp': AdminOtp, 'admin-database': AdminDatabase, 'admin-logistics': AdminLogistics, 'admin-playstore': AdminPlayStore,
  'admin-coupons': AdminCoupons, 'admin-banners': AdminBanners,
  'admin-audit': AdminAuditLedger, 'admin-owner-payment': AdminOwnerPayment,
  'admin-sellers': AdminSellers, 'admin-shiprocket': AdminShiprocket,
  'delivery-partner': DeliveryBoy, 'delivery-verify': DeliveryBoy,
};

const TABS = [
  { id: 'home', label: 'Home', on: 'home', off: 'home-outline' },
  { id: 'category', label: 'Categories', on: 'view-grid', off: 'view-grid-outline' },
  { id: 'offers', label: 'Deals', on: 'sale', off: 'sale-outline' },
  { id: 'account', label: 'Account', on: 'account', off: 'account-outline' },
  { id: 'cart', label: 'Cart', on: 'cart', off: 'cart-outline' },
];

/* ---------------- APP INTRO ANIMATION COMPONENT (REQUIREMENT 4) ---------------- */
function AppSplashIntro({ onFinish }) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const textFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Zoom and fade in logo
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Text fade-in after 400ms
    Animated.timing(textFade, {
      toValue: 1,
      duration: 800,
      delay: 400,
      useNativeDriver: true,
    }).start();

    // 3. Subtle pulsing
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    // 4. Finish intro after 1.8 seconds with fallback
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 1800);

    // Hard fallback after 2.2 seconds guaranteed
    const hardFallback = setTimeout(() => {
      onFinish();
    }, 2200);

    return () => {
      clearTimeout(timer);
      clearTimeout(hardFallback);
    };
  }, []);

  return (
    <TouchableOpacity activeOpacity={1} onPress={onFinish} style={{ flex: 1 }}>
      <Animated.View style={[s.splashRoot, { opacity }]}>
        <LinearGradient colors={['#0F172A', '#1E2562', '#2874F0']} style={StyleSheet.absoluteFillObject} />

        {/* Pulsing Animated Emblem */}
        <Animated.View style={{ transform: [{ scale: Animated.multiply(scale, pulse) }] }}>
          <View style={s.splashGlow}>
            <View style={s.splashLogoBox}>
              <MC name="storefront" size={56} color="#fff" />
            </View>
          </View>
        </Animated.View>

        {/* Brand & Tagline */}
        <Animated.View style={{ alignItems: 'center', opacity: textFade, marginTop: 24 }}>
          <Text style={s.splashBrandTitle}>Temsho</Text>
          <Text style={s.splashBrandSub}>POORE BHARAT KA APNA BAZAAR</Text>

          <View style={s.pledgeBadge}>
            <MC name="account-check" size={16} color="#4ADE80" />
            <Text style={s.pledgeText}>No Bots · 100% Real Humans</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
            <View style={s.miniPill}><Text style={s.miniPillText}>⚡ Instant WhatsApp OTP</Text></View>
            <View style={s.miniPill}><Text style={s.miniPillText}>🤝 Direct UPI Payouts</Text></View>
          </View>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

function Shell() {
  const { state, cartCount } = useApp();
  const [stack, setStack] = useState([{ name: 'home', params: {} }]);
  const [introDone, setIntroDone] = useState(false);
  const top = stack[stack.length - 1];

  const go = useCallback((name, params = {}) => {
    if (name === -1) return setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
    if (name === 'home') return setStack([{ name: 'home', params: {} }]);
    setStack((s) => [...s, { name, params }]);
  }, []);

  const goTab = (id) => {
    if (id === 'home') setStack([{ name: 'home', params: {} }]);
    else setStack([{ name: 'home', params: {} }, { name: id, params: id === 'category' ? { cat: null } : {} }]);
  };

  if (!state.ready)
    return (
      <View style={{ flex: 1, backgroundColor: C.brandNavy, alignItems: 'center', justifyContent: 'center' }}>
        <MC name="storefront" size={54} color="#fff" />
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 14, letterSpacing: -0.5 }}>Temsho</Text>
        <Text style={{ color: '#ffffffaa', fontSize: 13, fontWeight: '600', marginTop: 6 }}>No bots. Only humans.</Text>
        <ActivityIndicator color="#fff" style={{ marginTop: 26 }} />
      </View>
    );

  if (!introDone) {
    return <AppSplashIntro onFinish={() => setIntroDone(true)} />;
  }

  if (!state.user) return <Onboarding />;

  const Screen = SCREENS[top.name] || Home;
  const tabActive = TABS.find((t) => t.id === top.name)?.id;
  const showTabs = ['home', 'category', 'offers', 'cart', 'account'].includes(top.name);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flex: 1 }}>
        <Screen go={go} params={top.params} />
      </View>

      {/* 2. High-Contrast, Safe-Area Bottom Navigation Bar (No Overlapping Android OS Bar) */}
      {showTabs && (
        <View style={s.tabs}>
          {TABS.map((t) => {
            const on = tabActive === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => goTab(t.id)}
                style={s.tab}
                activeOpacity={0.7}
              >
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  {on && <View style={s.tabTopActivePill} />}
                  <View style={s.iconWrapper}>
                    <MC
                      name={on ? t.on : t.off}
                      size={24}
                      color={on ? C.brand : '#475569'}
                    />
                    {t.id === 'cart' && cartCount > 0 && (
                      <View style={s.badge}>
                        <Text style={{ color: '#fff', fontSize: 9.5, fontWeight: '900' }}>{cartCount}</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[
                      s.tabLabel,
                      on ? s.tabLabelActive : s.tabLabelInactive,
                    ]}
                  >
                    {t.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.log('App Error Caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <MC name="alert-circle-outline" size={56} color={C.brand} />
          <Text style={{ fontSize: 18, fontWeight: '900', color: C.ink, marginTop: 16, textAlign: 'center' }}>
            Something went wrong
          </Text>
          <Text style={{ color: C.ink2, fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 19 }}>
            Temsho recovered safely. Tap below to return to the home screen.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => this.setState({ hasError: false, error: null })}
            style={{ backgroundColor: C.brand, paddingHorizontal: 24, paddingVertical: 12, borderRadius: R.md, marginTop: 20 }}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <View style={s.root}>
          <View style={s.phone}>
            <StatusBar style="light" />
            <Shell />
          </View>
        </View>
      </AppProvider>
    </ErrorBoundary>
  );
}

const isWeb = Platform.OS === 'web';
const s = StyleSheet.create({
  root: isWeb
    ? { flex: 1, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' }
    : { flex: 1 },
  phone: isWeb
    ? {
        width: '100%', maxWidth: 430, height: '100%', maxHeight: 932,
        backgroundColor: C.bg, overflow: 'hidden', borderRadius: 28,
        shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 40, shadowOffset: { width: 0, height: 10 },
      }
    : { flex: 1, backgroundColor: C.bg },
  splashRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },
  splashGlow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogoBox: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: '#2874F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2874F0',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
  },
  splashBrandTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  splashBrandSub: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 6,
  },
  pledgeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  pledgeText: {
    color: '#86EFAC',
    fontSize: 12.5,
    fontWeight: '800',
    marginLeft: 6,
  },
  miniPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  miniPillText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1.5,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 22 : 18,
    minHeight: 68,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    elevation: 8,
  },
  tabTopActivePill: {
    position: 'absolute',
    top: -8,
    width: 28,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: C.brand,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    position: 'relative',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
  },
  tabLabelActive: {
    fontWeight: '900',
    color: C.brand,
  },
  tabLabelInactive: {
    fontWeight: '700',
    color: '#475569',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.red,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
});
