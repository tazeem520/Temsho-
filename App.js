import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import { C, R } from './src/theme';
import { AppProvider, useApp } from './src/store';
import Onboarding from './src/screens/Onboarding';
import { Home, Search, Category, Offers } from './src/screens/Shop';
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
  admin: Admin, 'admin-brand': AdminBrand, 'admin-money': AdminMoney,
  'admin-features': AdminFeatures, 'admin-broadcast': AdminBroadcast, 'admin-products': AdminProducts,
  'admin-otp': AdminOtp, 'admin-database': AdminDatabase, 'admin-logistics': AdminLogistics, 'admin-playstore': AdminPlayStore,
  'admin-coupons': AdminCoupons, 'admin-banners': AdminBanners,
  'admin-audit': AdminAuditLedger, 'admin-owner-payment': AdminOwnerPayment,
  'delivery-partner': DeliveryBoy, 'delivery-verify': DeliveryBoy,
};

const TABS = [
  { id: 'home', label: 'Home', on: 'home', off: 'home-outline' },
  { id: 'category', label: 'Categories', on: 'view-grid', off: 'view-grid-outline' },
  { id: 'offers', label: 'Deals', on: 'sale', off: 'sale-outline' },
  { id: 'account', label: 'Account', on: 'account', off: 'account-outline' },
  { id: 'cart', label: 'Cart', on: 'cart', off: 'cart-outline' },
];

function Shell() {
  const { state, cartCount } = useApp();
  const [stack, setStack] = useState([{ name: 'home', params: {} }]);
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

  if (!state.user) return <Onboarding />;

  const Screen = SCREENS[top.name] || Home;
  const tabActive = TABS.find((t) => t.id === top.name)?.id;
  const showTabs = ['home', 'category', 'offers', 'cart', 'account'].includes(top.name);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flex: 1 }}>
        <Screen go={go} params={top.params} />
      </View>
      {showTabs && (
        <View style={s.tabs}>
          {TABS.map((t) => {
            const on = tabActive === t.id;
            return (
              <TouchableOpacity key={t.id} onPress={() => goTab(t.id)} style={s.tab} activeOpacity={0.7}>
                <View style={{ alignItems: 'center' }}>
                  {on && <View style={s.tabTop} />}
                  <View>
                    <MC name={on ? t.on : t.off} size={23} color={on ? C.brand : '#9CA3AF'} />
                    {t.id === 'cart' && cartCount > 0 && (
                      <View style={s.badge}><Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>{cartCount}</Text></View>
                    )}
                  </View>
                  <Text numberOfLines={1} style={{ fontSize: 10.5, marginTop: 4, fontWeight: on ? '900' : '600', color: on ? C.brand : '#6B7280' }}>
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
  tabs: {
    flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.line,
    paddingTop: 6, paddingBottom: 14,
  },
  tabTop: { position: 'absolute', top: -6, width: 26, height: 3, borderRadius: 2, backgroundColor: C.brand },
  tab: { flex: 1, alignItems: 'center' },
  badge: {
    position: 'absolute', top: -5, right: -10, minWidth: 17, height: 17, borderRadius: 9,
    backgroundColor: C.red, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
    borderWidth: 1.5, borderColor: '#fff',
  },
});
