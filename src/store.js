import React, { createContext, useContext, useMemo, useReducer, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRODUCTS } from './data/catalog';
import { DEFAULT_ADMIN, isOwner, OTP_PROVIDER } from './config';
import * as cloud from './lib/cloud';
import * as shiprocket from './lib/shiprocket';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);
const KEY = '@temsho/v1';

export const COUPONS = [
  { code: 'TEM100', off: 100, min: 799, desc: '₹100 off ₹799 se upar ke order par' },
  { code: 'NAYA50', off: 50, min: 299, desc: 'Naye grahak ke liye ₹50 off' },
  { code: 'BIG15', pct: 15, max: 400, min: 1499, desc: '15% off (max ₹400) ₹1499+ par' },
  { code: 'FREESHIP', ship: true, min: 0, desc: 'Delivery bilkul free' },
];

const refCode = (phone) => 'TEM' + (phone ? phone.slice(-4) : '2026') + 'X';

const LANGS = ['Hindi', 'English', 'Bhojpuri', 'Marathi', 'Bangla', 'Tamil', 'Telugu', 'Kannada', 'Gujarati', 'Punjabi', 'Odia'];
export { LANGS };

const init = {
  ready: false,
  user: null,
  admin: { ...DEFAULT_ADMIN },
  banned: [],
  settings: {
    lang: 'Hindi',
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
  wallet: 0,
  addresses: [
    { id: 'a1', name: 'Ghar', line: '221, Gomti Nagar, Vibhuti Khand', city: 'Lucknow', state: 'Uttar Pradesh', pin: '226010', phone: '98XXXXXX21' },
  ],
  notifications: [
    { id: 'n1', icon: 'party-popper', title: 'Swagat hai Temsho me!', body: 'Pehle order par NAYA50 lagayein aur ₹50 bachayein.', at: Date.now() - 3600000, read: false },
    { id: 'n2', icon: 'hand-heart-outline', title: 'Artisan Bazaar live hai', body: 'Handmade saman seedha kaarigar se — 40% tak kam daam.', at: Date.now() - 86400000, read: false },
    { id: 'n3', icon: 'shield-check-outline', title: '100% Insaani Guarantee', body: 'Temsho par koi bot nahi hai — har seller aur support real human hai.', at: Date.now() - 172800000, read: false },
  ],
  supportChat: [
    { id: 'm0', who: 'agent', agent: 'Priya S.', text: 'Namaste! Main Priya hoon, Temsho ki support executive. Yahan koi bot nahi hai — main khud aapse baat kar rahi hoon. Kaise madad karun?', at: Date.now() },
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
      return { ...s, products: [...a.list, ...PRODUCTS], cloudOn: true };
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
      return notif(s, 'bullhorn-outline', a.title, a.body, '#F5A623');
    case 'LOGIN':
      return notif(
        { ...s, user: { ...a.user, referral: refCode(a.user.phone), isOwner: isOwner(a.user.phone) }, wallet: s.wallet || 0 },
        'hand-wave-outline', 'Login safal', `Namaste ${a.user.name}! Aapka Temsho khaata taiyar hai.`
      );
    case 'LOGOUT':
      return { ...init, ready: true, products: PRODUCTS };
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
      return { ...init, ready: true, products: PRODUCTS.filter((p) => p.seller !== 'me') };
    case 'BECOME_SELLER':
      return notif(
        { ...s, shop: { ...s.shop, ...a.shop, name: a.shopName, city: a.shopCity }, user: { ...s.user, isSeller: true, shopName: a.shopName, shopCity: a.shopCity } },
        'storefront-outline', 'Dukaan live ho gayi', `${a.shopName} ab Temsho par hai. Pehla product list karein.`
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
        { ...s, cart: [], coupon: null, orders: [a.order, ...s.orders], wallet: s.wallet + Math.round((a.order.total * (s.admin?.cashbackPct ?? 1)) / 100) },
        'check-circle-outline', 'Order confirm', `#${a.order.id} confirm ho gaya. Delivery ${a.order.eta} tak.`
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
      return msg ? notif(ns, 'truck-fast-outline', 'Order update', `#${a.id} ab "${msg}" hai.`) : ns;
    }
    case 'ATTACH_AWB': {
      return {
        ...s,
        orders: s.orders.map((o) => (o.id === a.id ? { ...o, shipment: a.shipment, status: 'Shipped' } : o)),
      };
    }
    case 'CANCEL_ORDER':
      return notif({ ...s, orders: s.orders.map((o) => (o.id === a.id ? { ...o, status: 'Cancelled' } : o)) },
        'close-circle-outline', 'Order cancel', `#${a.id} cancel ho gaya. Refund 3-5 din me.`, '#E5484D');
    case 'RETURN_ORDER':
      return notif(
        { ...s, orders: s.orders.map((o) => (o.id === a.id ? { ...o, status: 'Return Requested', returnReason: a.reason } : o)) },
        'backup-restore', 'Return request mili', `#${a.id} ke liye pickup 2 din me. Refund wallet ya bank me.`
      );
    case 'ADD_PRODUCT':
      return notif({ ...s, products: [a.product, ...s.products] },
        'tag-outline', 'Product live', `"${a.product.title}" ab bazaar me dikh raha hai.`);
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
  if (!saved) return PRODUCTS;
  const mine = saved.filter((p) => p.seller === 'me');
  return [...mine, ...PRODUCTS];
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, init);
  const first = useRef(true);

  // initial load from local storage
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

  // load cloud products & settings + setup realtime listeners
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

  // sync state to local AsyncStorage
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
