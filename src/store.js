import React, { createContext, useContext, useMemo, useReducer, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRODUCTS, BANNERS } from './data/catalog';
import { DEFAULT_ADMIN, isOwner } from './config';
import * as cloud from './lib/cloud';
import * as shiprocket from './lib/shiprocket';
import { requestNotificationPermission, showSystemNotification } from './lib/notifications';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);
const KEY = '@temsho/v4_dynamic_banners';

const refCode = (phone) => 'TEM' + (phone ? phone.slice(-4) : '2026') + 'X';

const LANGS = ['English', 'Hindi', 'Bengali', 'Marathi', 'Tamil', 'Telugu', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'];
export { LANGS };

const init = {
  ready: false,
  user: null,
  admin: { ...DEFAULT_ADMIN },
  adminCoupons: [], // Owner-generated dynamic coupons (initially empty)
  adminBanners: BANNERS, // Owner-generated dynamic banners/posters
  banned: [],
  settings: {
    lang: 'English',
    notifOrders: true,
    notifOffers: true,
    notifWhatsapp: true,
    defaultPay: 'cod',
    upiId: '',
    saveHistory: true,
  },
  shop: {
    name: '', tagline: '', city: '', state: '', pin: '',
    pickup: '', contact: '', hours: '10:00 AM – 8:00 PM',
    returnDays: '7', gst: '',
    payName: '', upi: '', bankName: '', accNo: '', ifsc: '',
    acceptUpi: true, acceptCod: true, acceptBank: false,
  },
  products: PRODUCTS,
  cart: [],
  wishlist: [],
  orders: [],
  coupon: null,
  addresses: [
    { id: 'a1', name: 'Home', line: '221, Gomti Nagar, Vibhuti Khand', city: 'Lucknow', state: 'Uttar Pradesh', pin: '226010', phone: '9044468663' },
  ],
  notifications: [
    { id: 'n1', icon: 'party-popper', title: 'Welcome to Temsho!', body: 'Shop directly from verified human sellers with 100% transparency.', at: Date.now() - 3600000, read: false },
    { id: 'n2', icon: 'shield-check-outline', title: '100% Human Marketplace', body: 'No bots or automated shops on Temsho. Every seller is a real verified human.', at: Date.now() - 86400000, read: false },
    { id: 'n3', icon: 'truck-fast-outline', title: 'Free Delivery Active', body: 'Enjoy free delivery across India on all orders above ₹499.', at: Date.now() - 172800000, read: false },
  ],
  supportChat: [
    { id: 'm0', who: 'agent', agent: 'Priya S.', text: 'Hello! I am Priya, your dedicated Temsho Support Executive. There are no bots here — I am a real human assistant. How may I help you today?', at: Date.now() },
  ],
  deliveryMode: 'standard', // 'standard' | 'local' | 'indiapost'
};

const notif = (s, icon, title, body, tone) => {
  showSystemNotification(title, body);
  return {
    ...s,
    notifications: [{ id: 'n' + Date.now() + Math.random().toString(36).slice(2, 6), icon, tone, title, body, at: Date.now(), read: false }, ...s.notifications],
  };
};

function reducer(s, a) {
  switch (a.type) {
    case 'HYDRATE': {
      const savedUser = a.data?.user;
      const savedShop = a.data?.shop;
      const isSeller = savedUser?.isSeller || (!!savedShop?.name && savedShop.name.trim().length > 0);
      const user = savedUser
        ? {
            ...savedUser,
            isSeller,
            shopName: savedUser.shopName || savedShop?.name || '',
            shopCity: savedUser.shopCity || savedShop?.city || '',
          }
        : null;
      return {
        ...s,
        ...a.data,
        user,
        shop: savedShop || s.shop,
        products: mergeProducts(a.data?.products),
        ready: true,
      };
    }
    case 'CLOUD_PRODUCTS':
      return { ...s, products: mergeCloudAndLocal(s.products, a.list), cloudOn: true };
    case 'CLOUD_SETTINGS':
      return { ...s, admin: { ...s.admin, ...a.data } };
    case 'READY':
      return { ...s, ready: true };
    case 'ADMIN_SET':
      return { ...s, admin: { ...s.admin, ...a.patch } };
    case 'ADMIN_RESET':
      return { ...s, admin: { ...DEFAULT_ADMIN } };
    case 'ADMIN_ADD_COUPON':
      return notif(
        { ...s, adminCoupons: [a.coupon, ...(s.adminCoupons || [])] },
        'ticket-percent', 'Coupon Created', `Coupon "${a.coupon.code}" is now live across the app.`
      );
    case 'ADMIN_DELETE_COUPON':
      return { ...s, adminCoupons: (s.adminCoupons || []).filter((c) => c.id !== a.id) };
    case 'ADMIN_CLEAR_COUPONS':
      return { ...s, adminCoupons: [], coupon: null };
    case 'ADMIN_TOGGLE_COUPON':
      return {
        ...s,
        adminCoupons: (s.adminCoupons || []).map((c) => (c.id === a.id ? { ...c, active: !c.active } : c)),
      };
    case 'ADMIN_ADD_BANNER':
      return notif(
        { ...s, adminBanners: [a.banner, ...(s.adminBanners || [])] },
        'image-multiple-outline', 'Poster / Banner Published', `Banner "${a.banner.title}" is now live on the app home screen.`
      );
    case 'ADMIN_DELETE_BANNER':
      return { ...s, adminBanners: (s.adminBanners || []).filter((b) => b.id !== a.id) };
    case 'ADMIN_TOGGLE_BANNER':
      return {
        ...s,
        adminBanners: (s.adminBanners || []).map((b) => (b.id === a.id ? { ...b, active: !b.active } : b)),
      };
    case 'ADMIN_RESET_BANNERS':
      return { ...s, adminBanners: [...BANNERS] };
    case 'ADMIN_REMOVE_PRODUCT':
      return { ...s, products: s.products.filter((p) => p.id !== a.id) };
    case 'ADMIN_BAN':
      return { ...s, banned: s.banned.includes(a.id) ? s.banned.filter((x) => x !== a.id) : [...s.banned, a.id] };
    case 'ADMIN_BROADCAST':
      return notif(s, 'bullhorn-outline', a.title, a.body, '#FF9F00');
    case 'LOGIN': {
      const isSeller = a.user.isSeller ?? s.user?.isSeller ?? (!!s.shop?.name && s.shop.name.trim().length > 0);
      const shopName = a.user.shopName ?? s.user?.shopName ?? s.shop?.name ?? '';
      const shopCity = a.user.shopCity ?? s.user?.shopCity ?? s.shop?.city ?? '';
      return notif(
        {
          ...s,
          user: {
            ...a.user,
            referral: refCode(a.user.phone),
            isOwner: isOwner(a.user.phone),
            isSeller,
            shopName,
            shopCity,
          },
        },
        'hand-wave-outline', 'Login Successful', `Welcome ${a.user.name}! Your Temsho account is ready.`
      );
    }
    case 'LOGOUT':
      return { ...init, ready: true, products: [] };
    case 'UPDATE_USER':
      return { ...s, user: { ...s.user, ...a.patch } };
    case 'UPDATE_SETTINGS':
      return { ...s, settings: { ...s.settings, ...a.patch } };
    case 'UPDATE_SHOP':
      return {
        ...s,
        shop: { ...s.shop, ...a.patch },
        user: { ...s.user, shopName: a.patch.name ?? s.user?.shopName, shopCity: a.patch.city ?? s.user?.shopCity },
      };
    case 'DELETE_ACCOUNT':
      return { ...init, ready: true, products: [] };
    case 'BECOME_SELLER':
      return notif(
        { ...s, shop: { ...s.shop, ...a.shop, name: a.shopName, city: a.shopCity }, user: { ...s.user, isSeller: true, shopName: a.shopName, shopCity: a.shopCity } },
        'storefront-outline', 'Shop Created Successfully', `${a.shopName} is now live on Temsho. You can list your first product.`
      );
    case 'ADD_CART': {
      const ex = s.cart.find((c) => c.id === a.id);
      return ex
        ? { ...s, cart: s.cart.map((c) => (c.id === a.id ? { ...c, qty: c.qty + 1 } : c)) }
        : { ...s, cart: [...s.cart, { id: a.id, qty: 1 }] };
    }
    case 'QTY':
      return a.qty <= 0
        ? { ...s, cart: s.cart.filter((c) => c.id !== a.id) }
        : { ...s, cart: s.cart.map((c) => (c.id === a.id ? { ...c, qty: a.qty } : c)) };
    case 'RM_CART':
      return { ...s, cart: s.cart.filter((c) => c.id !== a.id) };
    case 'WISH':
      return {
        ...s,
        wishlist: s.wishlist.includes(a.id) ? s.wishlist.filter((x) => x !== a.id) : [...s.wishlist, a.id],
      };
    case 'COUPON':
      return { ...s, coupon: a.code };
    case 'SET_DELIVERY_MODE':
      return { ...s, deliveryMode: a.mode };
    case 'PLACE_ORDER': {
      const deliveryOtp = a.order.deliveryOtp || String(Math.floor(1000 + Math.random() * 9000));
      const orderWithOtp = { ...a.order, deliveryOtp, qrData: `TEMSHO://DELIVERY/${a.order.id}?otp=${deliveryOtp}` };
      
      // Dual Notification: 1. Customer Confirmation, 2. Seller New Order Alert
      const custMsg = `Order #${a.order.id} is confirmed. Estimated delivery by ${a.order.eta}. Doorstep OTP: ${deliveryOtp}.`;
      const sellerMsg = `📦 New Sale Alert! You received order #${a.order.id} for ₹${a.order.total}. Tap to print shipping label & pack parcel.`;
      
      showSystemNotification('📦 New Order Received!', sellerMsg);
      
      const newNotifs = [
        { id: 'n' + Date.now() + 'c', icon: 'check-circle-outline', tone: '#059669', title: 'Order Confirmed', body: custMsg, at: Date.now(), read: false },
        { id: 'n' + Date.now() + 's', icon: 'package-variant', tone: '#2B2D6E', title: 'New Sale Alert (Seller)', body: sellerMsg, at: Date.now() + 1, read: false },
      ];

      return {
        ...s,
        cart: [],
        coupon: null,
        orders: [orderWithOtp, ...s.orders],
        notifications: [...newNotifs, ...s.notifications],
      };
    }
    case 'VERIFY_DELIVERY_OTP': {
      const orders = s.orders.map((o) => {
        if (o.id !== a.id) return o;
        return {
          ...o,
          status: 'Delivered',
          deliveredAt: Date.now(),
          deliveredBy: a.agentName || 'Delivery Partner (Verified QR + OTP)',
          deliveryOtpVerified: true,
          cashCollected: o.pay === 'cod' ? o.total : 0,
        };
      });
      return notif(
        { ...s, orders },
        'truck-check',
        'Order Delivered Successfully',
        `Order #${a.id} has been securely delivered at doorstep via OTP verification.`,
        '#059669'
      );
    }
    case 'ADVANCE_ORDER': {
      const steps = ['Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
      let msg = null;
      const orders = s.orders.map((o) => {
        if (o.id !== a.id || o.status === 'Cancelled' || o.status === 'Delivered') return o;
        const nx = steps[Math.min(steps.indexOf(o.status) + 1, steps.length - 1)];
        msg = nx;
        return { ...o, status: nx, deliveredAt: nx === 'Delivered' ? Date.now() : o.deliveredAt };
      });
      const ns = { ...s, orders };
      return msg ? notif(ns, 'truck-fast-outline', 'Order Status Update', `Order #${a.id} is now ${msg}.`) : ns;
    }
    case 'ATTACH_AWB': {
      return {
        ...s,
        orders: s.orders.map((o) => (o.id === a.id ? { ...o, shipment: a.shipment, status: 'Shipped' } : o)),
      };
    }
    case 'CANCEL_ORDER':
      return notif({ ...s, orders: s.orders.map((o) => (o.id === a.id ? { ...o, status: 'Cancelled' } : o)) },
        'close-circle-outline', 'Order Cancelled', `Order #${a.id} has been cancelled.`, '#EF4444');
    case 'RETURN_ORDER':
      return notif(
        { ...s, orders: s.orders.map((o) => (o.id === a.id ? { ...o, status: 'Return Requested', returnReason: a.reason } : o)) },
        'backup-restore', 'Return Requested', `Pickup for Order #${a.id} will be scheduled within 2 business days.`
      );
    case 'ADD_PRODUCT':
      return notif({ ...s, products: [a.product, ...s.products] },
        'tag-outline', 'Product Listed', `"${a.product.title}" is now active in the marketplace.`);
    case 'RM_PRODUCT':
      return { ...s, products: s.products.filter((p) => p.id !== a.id) };
    case 'ADDRESS':
      return { ...s, addresses: [a.address, ...s.addresses] };
    case 'RM_ADDRESS':
      return { ...s, addresses: s.addresses.filter((x) => x.id !== a.id) };
    case 'READ_NOTIFS':
      return { ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) };
    case 'CHAT':
      return { ...s, supportChat: [...s.supportChat, a.msg] };
    default:
      return s;
  }
}

function mergeProducts(saved) {
  if (!saved || !Array.isArray(saved)) return [];
  return saved;
}

function mergeCloudAndLocal(localProds = [], cloudProds = []) {
  const map = new Map();
  // Cloud products take precedence and are canonical
  (cloudProds || []).forEach((p) => {
    if (p && p.id) map.set(p.id, p);
  });
  // Also keep any local-only draft products that haven't synced yet
  (localProds || []).forEach((p) => {
    if (p && p.id && !map.has(p.id)) {
      map.set(p.id, p);
    }
  });
  return Array.from(map.values());
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, init);
  const first = useRef(true);

  // Initial load from local storage
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) dispatch({ type: 'HYDRATE', data: JSON.parse(raw) });
        else dispatch({ type: 'READY' });
        requestNotificationPermission().catch(() => {});
      } catch {
        dispatch({ type: 'READY' });
      }
    })();
  }, []);

  // Load cloud products & settings + setup realtime listeners + periodic refresh
  useEffect(() => {
    if (!state.ready || !cloud.cloudOn()) return;

    const refresh = async () => {
      try {
        const [list, settings] = await Promise.all([cloud.pullProducts(), cloud.pullSettings()]);
        if (list && list.length > 0) dispatch({ type: 'CLOUD_PRODUCTS', list });
        if (settings) dispatch({ type: 'CLOUD_SETTINGS', data: settings });
      } catch (e) {}
    };

    refresh();
    const interval = setInterval(refresh, 8000); // Poll cloud every 8 seconds for real-time all-India updates

    // Realtime subscription for live products
    const unsubProducts = cloud.subscribeToProducts((payload) => {
      refresh();
    });

    return () => {
      clearInterval(interval);
      if (typeof unsubProducts === 'function') unsubProducts();
    };
  }, [state.ready]);

  // Sync state to local AsyncStorage
  useEffect(() => {
    if (!state.ready) return;
    if (first.current) { first.current = false; }
    const { ready, ...rest } = state;
    AsyncStorage.setItem(KEY, JSON.stringify(rest)).catch(() => {});
  }, [state]);

  const value = useMemo(() => {
    const byId = (id) => (state.products || []).find((p) => p && p.id === id);
    const cartLines = (state.cart || []).map((c) => ({ ...c, product: byId(c.id) })).filter((l) => l.product);
    const subtotal = cartLines.reduce((t, l) => t + (Number(l.product?.price) || 0) * (Number(l.qty) || 1), 0);
    const saved = cartLines.reduce((t, l) => t + ((Number(l.product?.mrp) || Number(l.product?.price) || 0) - (Number(l.product?.price) || 0)) * (Number(l.qty) || 1), 0);

    const activeCoupons = (state.adminCoupons || []).filter((c) => c && c.active !== false);
    const cp = activeCoupons.find(
      (c) => String(c?.code || '').toUpperCase() === String(state.coupon || '').toUpperCase() && subtotal >= (c?.min || 0)
    );

    let couponOff = 0;
    if (cp?.off) couponOff = Number(cp.off) || 0;
    if (cp?.pct) couponOff = Math.min(Math.round((subtotal * (Number(cp.pct) || 0)) / 100), Number(cp.max || 999999));

    const activeBanners = (state.adminBanners || BANNERS).filter((b) => b && b.active !== false);

    const A = state.admin || DEFAULT_ADMIN;

    // Delivery fee calculation based on selected delivery mode
    let baseDelivery = Number(A.deliveryFee) || 49;
    if (state.deliveryMode === 'local') baseDelivery = Number(A.localDeliveryFee) || 29;
    else if (state.deliveryMode === 'indiapost') baseDelivery = 39;

    let delivery = subtotal === 0 || subtotal >= (Number(A.freeDeliveryAbove) || 499) ? 0 : baseDelivery;
    if (cp?.type === 'freeship' || cp?.ship) delivery = 0;

    const total = Math.max(0, subtotal - couponOff + delivery);

    return {
      state, dispatch, byId, cartLines,
      cartCount: (state.cart || []).reduce((t, c) => t + (Number(c.qty) || 1), 0),
      subtotal, saved, delivery, total,
      coupon: cp || null, couponOff,
      activeCoupons,
      activeBanners,
      admin: A,
      isOwner: !!state.user?.isOwner,
      cloudOn: cloud.cloudOn(),
      cloud,
      shiprocket,
      unread: (state.notifications || []).filter((n) => !n.read).length,
    };
  }, [state]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
