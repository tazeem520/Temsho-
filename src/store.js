import React, { createContext, useContext, useMemo, useReducer, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRODUCTS } from './data/catalog';
import { DEFAULT_ADMIN, isOwner } from './config';
import * as cloud from './lib/cloud';
import * as shiprocket from './lib/shiprocket';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);
const KEY = '@temsho/v2_clean';

export const COUPONS = [
  { code: 'TEM100', off: 100, min: 799, desc: '₹100 discount on orders above ₹799' },
  { code: 'NAYA50', off: 50, min: 299, desc: 'Flat ₹50 discount for new customers' },
  { code: 'BIG15', pct: 15, max: 400, min: 1499, desc: '15% discount (up to ₹400) on orders ₹1499+' },
  { code: 'FREESHIP', ship: true, min: 0, desc: '100% Free Delivery on this order' },
];

const refCode = (phone) => 'TEM' + (phone ? phone.slice(-4) : '2026') + 'X';

const LANGS = ['English', 'Hindi', 'Bengali', 'Marathi', 'Tamil', 'Telugu', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'];
export { LANGS };

const init = {
  ready: false,
  user: null,
  admin: { ...DEFAULT_ADMIN },
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
    { id: 'n1', icon: 'party-popper', title: 'Welcome to Temsho!', body: 'Use coupon NAYA50 at checkout to save ₹50 on your first purchase.', at: Date.now() - 3600000, read: false },
    { id: 'n2', icon: 'shield-check-outline', title: '100% Human Marketplace', body: 'No bots or automated shops on Temsho. Every seller is a real verified human.', at: Date.now() - 86400000, read: false },
    { id: 'n3', icon: 'truck-fast-outline', title: 'Free Delivery Active', body: 'Enjoy free delivery across India on all orders above ₹499.', at: Date.now() - 172800000, read: false },
  ],
  supportChat: [
    { id: 'm0', who: 'agent', agent: 'Priya S.', text: 'Hello! I am Priya, your dedicated Temsho Support Executive. There are no bots here — I am a real human assistant. How may I help you today?', at: Date.now() },
  ],
  deliveryMode: 'standard', // 'standard' | 'local' | 'indiapost'
};

const notif = (s, icon, title, body, tone) => ({
  ...s,
  notifications: [{ id: 'n' + Date.now() + Math.random().toString(36).slice(2, 6), icon, tone, title, body, at: Date.now(), read: false }, ...s.notifications],
});

function reducer(s, a) {
  switch (a.type) {
    case 'HYDRATE':
      return { ...s, ...a.data, products: mergeProducts(a.data.products), ready: true };
    case 'CLOUD_PRODUCTS':
      return { ...s, products: [...a.list], cloudOn: true };
    case 'CLOUD_SETTINGS':
      return { ...s, admin: { ...s.admin, ...a.data } };
    case 'READY':
      return { ...s, ready: true };
    case 'ADMIN_SET':
      return { ...s, admin: { ...s.admin, ...a.patch } };
    case 'ADMIN_RESET':
      return { ...s, admin: { ...DEFAULT_ADMIN } };
    case 'ADMIN_REMOVE_PRODUCT':
      return { ...s, products: s.products.filter((p) => p.id !== a.id) };
    case 'ADMIN_BAN':
      return { ...s, banned: s.banned.includes(a.id) ? s.banned.filter((x) => x !== a.id) : [...s.banned, a.id] };
    case 'ADMIN_BROADCAST':
      return notif(s, 'bullhorn-outline', a.title, a.body, '#FF9F00');
    case 'LOGIN':
      return notif(
        { ...s, user: { ...a.user, referral: refCode(a.user.phone), isOwner: isOwner(a.user.phone) } },
        'hand-wave-outline', 'Login Successful', `Welcome ${a.user.name}! Your Temsho account is ready.`
      );
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
    case 'PLACE_ORDER':
      return notif(
        { ...s, cart: [], coupon: null, orders: [a.order, ...s.orders] },
        'check-circle-outline', 'Order Placed Successfully', `Order #${a.order.id} is confirmed. Estimated delivery by ${a.order.eta}.`
      );
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
      } catch {
        dispatch({ type: 'READY' });
      }
    })();
  }, []);

  // Load cloud products & settings + setup realtime listeners
  useEffect(() => {
    if (!state.ready || !cloud.cloudOn()) return;

    (async () => {
      const [list, settings] = await Promise.all([cloud.pullProducts(), cloud.pullSettings()]);
      if (list && list.length > 0) dispatch({ type: 'CLOUD_PRODUCTS', list });
      if (settings) dispatch({ type: 'CLOUD_SETTINGS', data: settings });
    })();

    // Realtime subscription for live products
    const unsubProducts = cloud.subscribeToProducts((payload) => {
      if (payload.eventType === 'INSERT') {
        cloud.pullProducts().then((list) => {
          if (list) dispatch({ type: 'CLOUD_PRODUCTS', list });
        });
      }
    });

    return () => {
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
    const byId = (id) => state.products.find((p) => p.id === id);
    const cartLines = state.cart.map((c) => ({ ...c, product: byId(c.id) })).filter((l) => l.product);
    const subtotal = cartLines.reduce((t, l) => t + l.product.price * l.qty, 0);
    const saved = cartLines.reduce((t, l) => t + (l.product.mrp - l.product.price) * l.qty, 0);

    const cp = COUPONS.find((c) => c.code === state.coupon && subtotal >= c.min);
    let couponOff = 0;
    if (cp?.off) couponOff = cp.off;
    if (cp?.pct) couponOff = Math.min(Math.round((subtotal * cp.pct) / 100), cp.max);

    const A = state.admin || DEFAULT_ADMIN;

    // Delivery fee calculation based on selected delivery mode
    let baseDelivery = A.deliveryFee;
    if (state.deliveryMode === 'local') baseDelivery = A.localDeliveryFee || 29;
    else if (state.deliveryMode === 'indiapost') baseDelivery = 39;

    let delivery = subtotal === 0 || subtotal >= A.freeDeliveryAbove ? 0 : baseDelivery;
    if (cp?.ship) delivery = 0;

    const total = Math.max(0, subtotal - couponOff + delivery);

    return {
      state, dispatch, byId, cartLines,
      cartCount: state.cart.reduce((t, c) => t + c.qty, 0),
      subtotal, saved, delivery, total,
      coupon: cp || null, couponOff,
      admin: A,
      isOwner: !!state.user?.isOwner,
      cloudOn: cloud.cloudOn(),
      cloud,
      shiprocket,
      unread: state.notifications.filter((n) => !n.read).length,
    };
  }, [state]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
