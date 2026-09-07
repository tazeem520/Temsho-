import React, { createContext, useContext, useMemo, useReducer, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRODUCTS, BANNERS } from './data/catalog';
import { DEFAULT_ADMIN, isOwner } from './config';
import * as cloud from './lib/cloud';
import * as shiprocket from './lib/shiprocket';
import { requestNotificationPermission, showSystemNotification } from './lib/notifications';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const KEY_SESSION = '@temsho/v4_dynamic_banners';
const KEY_ALL_PRODUCTS = '@temsho/all_products_catalog';
const KEY_AUDIT_LOG = '@temsho/owner_audit_log';
const KEY_ADMIN_SETTINGS = '@temsho/admin_settings';
const KEY_SETTLEMENTS = '@temsho/seller_settlements_v1';
const USER_KEY_PREFIX = '@temsho/account_';

const refCode = (phone) => 'TEM' + (phone ? String(phone).slice(-4) : '2026') + 'X';
const cleanPhone = (p) => String(p || '').replace(/\D/g, '').slice(-10);

const LANGS = ['English', 'Hindi', 'Bengali', 'Marathi', 'Tamil', 'Telugu', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'];
export { LANGS };

const formatLogTime = (ts = Date.now()) => {
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const createAuditEntry = (type, title, details, meta = {}) => ({
  id: 'aud_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
  type, // 'ORDER_PLACED' | 'ORDER_STATUS' | 'ORDER_CANCELLED' | 'PRODUCT_ADDED' | 'PRODUCT_DELETED' | 'SELLER_REGISTERED' | 'OWNER_PAYMENT_UPDATE' | 'COUPON_ACTION'
  title,
  details,
  meta,
  timestamp: Date.now(),
  formattedTime: formatLogTime(Date.now()),
});

const init = {
  ready: false,
  user: null,
  admin: { ...DEFAULT_ADMIN },
  adminCoupons: [], // Owner-generated dynamic coupons
  adminBanners: BANNERS, // Owner-generated dynamic banners/posters
  sellerSettlements: {}, // Owner payouts ledger { [sellerPhone]: { settledTotal: number, history: [] } }
  recentlyViewed: [], // Product IDs browsed by customer
  banned: [],
  auditLog: [
    createAuditEntry(
      'SYSTEM',
      'Temsho Ledger Initialized',
      'Audit ledger active — tracking all product additions, deletions, orders, and seller registrations.',
      { system: 'Temsho Core v1.0.8' }
    ),
  ],
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
    acceptUpi: true, acceptCod: true, acceptBank: true,
  },
  products: PRODUCTS,
  myProducts: [], // Products created by this seller
  cart: [],
  wishlist: [],
  orders: [],
  coupon: null,
  addresses: [],
  notifications: [
    { id: 'n1', icon: 'party-popper', title: 'Welcome to Temsho!', body: 'Shop directly from verified human sellers with 100% transparency.', at: Date.now() - 3600000, read: false },
    { id: 'n2', icon: 'shield-check-outline', title: '100% Human Marketplace', body: 'No bots or automated shops on Temsho. Every seller is a real verified human.', at: Date.now() - 86400000, read: false },
    { id: 'n3', icon: 'truck-fast-outline', title: 'Free Delivery Active', body: 'Enjoy free delivery across India on all orders above ₹499.', at: Date.now() - 172800000, read: false },
  ],
  supportChat: [
    { id: 'm0', who: 'agent', agent: 'Priya S.', text: 'Hello! I am Priya, your dedicated Temsho Support Executive. There are no bots here — I am a real human assistant. How may I help you today?', at: Date.now() },
  ],
  deliveryMode: 'standard',
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
        auditLog: a.data?.auditLog && a.data.auditLog.length > 0 ? a.data.auditLog : s.auditLog,
        ready: true,
      };
    }

    case 'RESTORE_USER_ACCOUNT': {
      const { userAccount, allProducts, auditLog, adminSettings } = a;
      const phone = userAccount?.user?.phone || a.phone;
      const owner = isOwner(phone);

      const user = userAccount?.user
        ? {
            ...userAccount.user,
            phone,
            isOwner: owner,
            referral: userAccount.user.referral || refCode(phone),
          }
        : {
            phone,
            name: a.name || 'Valued User',
            humanVerified: true,
            isOwner: owner,
            isSeller: false,
            referral: refCode(phone),
          };

      const shop = userAccount?.shop || {
        name: '', tagline: '', city: '', state: '', pin: '',
        pickup: '', contact: phone, hours: '10:00 AM – 8:00 PM',
        returnDays: '7', gst: '',
        payName: user.name || '', upi: '', bankName: '', accNo: '', ifsc: '',
        acceptUpi: true, acceptCod: true, acceptBank: true,
      };

      const myProducts = userAccount?.myProducts || (allProducts || []).filter((p) => p && (p.sellerPhone === phone || p.seller === 'me'));
      const orders = userAccount?.orders || [];
      const cart = userAccount?.cart || [];
      const wishlist = userAccount?.wishlist || [];
      const addresses = userAccount?.addresses || [];
      const notifications = userAccount?.notifications || s.notifications;
      const supportChat = userAccount?.supportChat || s.supportChat;
      const settings = userAccount?.settings || s.settings;

      const mergedProds = mergeCloudAndLocal(allProducts || s.products, myProducts);

      return notif(
        {
          ...s,
          ready: true,
          user,
          shop,
          myProducts,
          products: mergedProds,
          orders,
          cart,
          wishlist,
          addresses,
          notifications,
          supportChat,
          settings,
          admin: adminSettings ? { ...s.admin, ...adminSettings } : s.admin,
          auditLog: auditLog && auditLog.length > 0 ? auditLog : s.auditLog,
        },
        'hand-wave-outline',
        'Welcome Back!',
        `Logged in as +91 ${phone}. All your orders, shop data, and listings have been restored.`
      );
    }

    case 'CLOUD_PRODUCTS':
      return { ...s, products: mergeCloudAndLocal(s.products, a.list), cloudOn: true };

    case 'CLOUD_SETTINGS':
      return { ...s, admin: { ...s.admin, ...a.data } };

    case 'READY':
      return { ...s, ready: true };

    case 'ADMIN_SET': {
      const audit = createAuditEntry('SETTINGS_UPDATE', 'Owner Settings Updated', 'System settings modified by owner.', a.patch);
      return { ...s, admin: { ...s.admin, ...a.patch }, auditLog: [audit, ...s.auditLog] };
    }

    case 'ADMIN_SET_OWNER_PAYMENT': {
      const audit = createAuditEntry(
        'OWNER_PAYMENT_UPDATE',
        'Owner Payment & Settlement Updated',
        `Owner Payout UPI: ${a.payment?.deliveryChargeUpi || a.payment?.upiId} · Bank: ${a.payment?.bankName} · Acc: ${a.payment?.accountNumber}`,
        a.payment
      );
      return notif(
        {
          ...s,
          admin: {
            ...s.admin,
            ownerPayment: { ...s.admin?.ownerPayment, ...a.payment },
          },
          auditLog: [audit, ...s.auditLog],
        },
        'cash-check',
        'Owner Payment Setup Saved',
        'Delivery fee logistics & COD remittance account updated successfully.',
        '#059669'
      );
    }

    case 'ADMIN_RESET':
      return { ...s, admin: { ...DEFAULT_ADMIN } };

    case 'ADMIN_ADD_COUPON': {
      const audit = createAuditEntry('COUPON_CREATED', `Coupon "${a.coupon.code}" Created`, a.coupon.desc, a.coupon);
      return notif(
        { ...s, adminCoupons: [a.coupon, ...(s.adminCoupons || [])], auditLog: [audit, ...s.auditLog] },
        'ticket-percent', 'Coupon Created', `Coupon "${a.coupon.code}" is now live across the app.`
      );
    }

    case 'ADMIN_DELETE_COUPON': {
      const audit = createAuditEntry('COUPON_DELETED', `Coupon Deleted`, `Coupon ID ${a.id} removed from marketplace.`);
      return { ...s, adminCoupons: (s.adminCoupons || []).filter((c) => c.id !== a.id), auditLog: [audit, ...s.auditLog] };
    }

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

    case 'SETTLE_SELLER_PAYOUT': {
      const { sellerPhone, amount, utr, shopName, note } = a;
      const cur = s.sellerSettlements?.[sellerPhone] || { settledTotal: 0, history: [] };
      const newSettledTotal = (Number(cur.settledTotal) || 0) + Number(amount);
      const entry = {
        id: 'stl_' + Date.now(),
        amount: Number(amount),
        utr: utr || 'UPI_REF_' + Date.now(),
        timestamp: Date.now(),
        formattedTime: formatLogTime(Date.now()),
        shopName: shopName || 'Seller',
        sellerPhone,
        note: note || 'Direct Settlement by Owner',
      };
      const audit = createAuditEntry(
        'SELLER_PAYOUT',
        `Payout Settled: ₹${amount} to ${shopName || sellerPhone}`,
        `Amount ₹${amount} paid to +91 ${sellerPhone}. UTR/Ref: ${entry.utr}. Total settled to date: ₹${newSettledTotal}`,
        { sellerPhone, amount, utr: entry.utr, newSettledTotal }
      );
      return notif(
        {
          ...s,
          sellerSettlements: {
            ...s.sellerSettlements,
            [sellerPhone]: {
              settledTotal: newSettledTotal,
              history: [entry, ...(cur.history || [])],
            },
          },
          auditLog: [audit, ...s.auditLog],
        },
        'cash-check',
        'Payout Settled',
        `₹${amount} settled for ${shopName || sellerPhone}.`,
        '#059669'
      );
    }

    case 'ADMIN_REMOVE_PRODUCT': {
      const prod = s.products.find((p) => p.id === a.id);
      const audit = createAuditEntry(
        'PRODUCT_DELETED',
        `Product Deleted: ${prod?.title || a.id}`,
        `Deleted by Owner Admin · Price: ₹${prod?.price || 0} · Seller: ${prod?.sellerName || 'Verified Seller'}`,
        { productId: a.id, title: prod?.title, price: prod?.price, seller: prod?.sellerName, deletedBy: 'Owner' }
      );
      return {
        ...s,
        products: s.products.filter((p) => p.id !== a.id),
        myProducts: (s.myProducts || []).filter((p) => p.id !== a.id),
        auditLog: [audit, ...s.auditLog],
      };
    }

    case 'ADMIN_BAN':
      return { ...s, banned: s.banned.includes(a.id) ? s.banned.filter((x) => x !== a.id) : [...s.banned, a.id] };

    case 'ADMIN_BROADCAST':
      return notif(s, 'bullhorn-outline', a.title, a.body, '#FF9F00');

    case 'LOGIN': {
      const phone = cleanPhone(a.user?.phone);
      const isSeller = a.user.isSeller ?? s.user?.isSeller ?? (!!s.shop?.name && s.shop.name.trim().length > 0);
      const shopName = a.user.shopName ?? s.user?.shopName ?? s.shop?.name ?? '';
      const shopCity = a.user.shopCity ?? s.user?.shopCity ?? s.shop?.city ?? '';
      return notif(
        {
          ...s,
          user: {
            ...a.user,
            phone,
            referral: refCode(phone),
            isOwner: isOwner(phone),
            isSeller,
            shopName,
            shopCity,
          },
        },
        'hand-wave-outline', 'Login Successful', `Welcome ${a.user.name}! Your Temsho account is ready.`
      );
    }

    case 'LOGOUT':
      return {
        ...init,
        ready: true,
        admin: s.admin,
        adminCoupons: s.adminCoupons,
        adminBanners: s.adminBanners,
        auditLog: s.auditLog,
        products: s.products,
      };

    case 'UPDATE_USER':
      return { ...s, user: { ...s.user, ...a.patch } };

    case 'UPDATE_SETTINGS':
      return { ...s, settings: { ...s.settings, ...a.patch } };

    case 'UPDATE_SHOP': {
      const audit = createAuditEntry(
        'SELLER_UPDATED',
        `Shop Updated: ${a.patch.name || s.shop.name}`,
        `Seller: +91 ${s.user?.phone} · UPI: ${a.patch.upi || s.shop.upi} · Bank: ${a.patch.bankName || s.shop.bankName}`,
        { shop: a.patch, sellerPhone: s.user?.phone }
      );
      return {
        ...s,
        shop: { ...s.shop, ...a.patch },
        user: { ...s.user, shopName: a.patch.name ?? s.user?.shopName, shopCity: a.patch.city ?? s.user?.shopCity },
        auditLog: [audit, ...s.auditLog],
      };
    }

    case 'DELETE_ACCOUNT': {
      const audit = createAuditEntry('ACCOUNT_DELETED', `Account Deleted: +91 ${s.user?.phone}`, 'User permanently wiped their account.', { phone: s.user?.phone });
      return {
        ...init,
        ready: true,
        admin: s.admin,
        adminCoupons: s.adminCoupons,
        adminBanners: s.adminBanners,
        auditLog: [audit, ...s.auditLog],
        products: s.products.filter((p) => p.sellerPhone !== s.user?.phone),
      };
    }

    case 'BECOME_SELLER': {
      const audit = createAuditEntry(
        'SELLER_REGISTERED',
        `New Seller Registered: ${a.shopName}`,
        `Seller Phone: +91 ${s.user?.phone} · City: ${a.shopCity} · Payout UPI: ${a.shop?.upi} · Bank: ${a.shop?.bankName || 'Direct UPI'} (Acc: ${a.shop?.accNo ? '***' + a.shop.accNo.slice(-4) : 'N/A'}, IFSC: ${a.shop?.ifsc || 'N/A'})`,
        { shop: a.shop, shopName: a.shopName, shopCity: a.shopCity, sellerPhone: s.user?.phone }
      );
      return notif(
        {
          ...s,
          shop: { ...s.shop, ...a.shop, name: a.shopName, city: a.shopCity, contact: s.user?.phone || a.shop?.contact },
          user: { ...s.user, isSeller: true, shopName: a.shopName, shopCity: a.shopCity },
          auditLog: [audit, ...s.auditLog],
        },
        'storefront-outline',
        'Shop Created Successfully',
        `${a.shopName} is now live on Temsho. You can list your first product.`
      );
    }

    case 'ADD_CART': {
      const lineKey = a.id + (a.size ? `::${a.size}` : '');
      const ex = s.cart.find((c) => (c.key || (c.id + (c.size ? `::${c.size}` : ''))) === lineKey);
      return ex
        ? {
            ...s,
            cart: s.cart.map((c) =>
              (c.key || (c.id + (c.size ? `::${c.size}` : ''))) === lineKey
                ? { ...c, qty: c.qty + (a.qty || 1) }
                : c
            ),
          }
        : {
            ...s,
            cart: [...s.cart, { id: a.id, key: lineKey, qty: a.qty || 1, size: a.size || null }],
          };
    }

    case 'QTY': {
      const match = (c) => (a.key ? c.key === a.key : (c.id === a.id && (!a.size || c.size === a.size)));
      return a.qty <= 0
        ? { ...s, cart: s.cart.filter((c) => !match(c)) }
        : { ...s, cart: s.cart.map((c) => (match(c) ? { ...c, qty: a.qty } : c)) };
    }

    case 'RM_CART': {
      const match = (c) => (a.key ? c.key === a.key : (c.id === a.id && (!a.size || c.size === a.size)));
      return { ...s, cart: s.cart.filter((c) => !match(c)) };
    }

    case 'WISH':
      return {
        ...s,
        wishlist: s.wishlist.includes(a.id) ? s.wishlist.filter((x) => x !== a.id) : [...s.wishlist, a.id],
      };

    case 'VIEW_PRODUCT': {
      const filtered = (s.recentlyViewed || []).filter((id) => id !== a.id);
      return { ...s, recentlyViewed: [a.id, ...filtered].slice(0, 10) };
    }

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

      // Owner Audit Ledger Logging
      const itemsSummary = (a.order.items || []).map((it) => `${it.title} (x${it.qty}) - ₹${(Number(it.price) || 0) * (Number(it.qty) || 1)}`).join(', ');
      const audit = createAuditEntry(
        'ORDER_PLACED',
        `Order Placed: #${a.order.id} (₹${a.order.total})`,
        `Buyer: ${a.order.customerName || 'Customer'} (+91 ${a.order.customerPhone}) · Pay: ${a.order.pay?.toUpperCase()} · Items: ${itemsSummary} · Deliver to: ${a.order.address?.city || 'India'} (${a.order.address?.pin || '226010'}) · Doorstep OTP: ${deliveryOtp}`,
        {
          orderId: a.order.id,
          total: a.order.total,
          pay: a.order.pay,
          buyerPhone: a.order.customerPhone,
          buyerName: a.order.customerName,
          items: a.order.items,
          address: a.order.address,
          deliveryOtp,
        }
      );

      return {
        ...s,
        cart: [],
        coupon: null,
        orders: [orderWithOtp, ...s.orders],
        notifications: [...newNotifs, ...s.notifications],
        auditLog: [audit, ...s.auditLog],
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

      const targetOrder = s.orders.find((o) => o.id === a.id);
      const audit = createAuditEntry(
        'ORDER_STATUS',
        `Order Delivered: #${a.id}`,
        `Securely delivered at doorstep via OTP verification. Verified by: ${a.agentName || 'Delivery Partner'}. Cash Collected: ₹${targetOrder?.pay === 'cod' ? targetOrder.total : 0}`,
        { orderId: a.id, newStatus: 'Delivered', agent: a.agentName, verified: true }
      );

      return notif(
        { ...s, orders, auditLog: [audit, ...s.auditLog] },
        'truck-check',
        'Order Delivered Successfully',
        `Order #${a.id} has been securely delivered at doorstep via OTP verification.`,
        '#059669'
      );
    }

    case 'ADVANCE_ORDER': {
      const steps = ['Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
      let msg = null;
      let targetOrder = null;
      const orders = s.orders.map((o) => {
        if (o.id !== a.id || o.status === 'Cancelled' || o.status === 'Delivered') return o;
        const nx = steps[Math.min(steps.indexOf(o.status) + 1, steps.length - 1)];
        msg = nx;
        targetOrder = { ...o, status: nx, deliveredAt: nx === 'Delivered' ? Date.now() : o.deliveredAt };
        return targetOrder;
      });

      const audit = msg
        ? createAuditEntry(
            'ORDER_STATUS',
            `Order #${a.id} Advanced to ${msg}`,
            `Status updated to "${msg}" for customer ${targetOrder?.customerName || ''} (+91 ${targetOrder?.customerPhone || ''}).`,
            { orderId: a.id, status: msg }
          )
        : null;

      const ns = { ...s, orders, auditLog: audit ? [audit, ...s.auditLog] : s.auditLog };
      return msg ? notif(ns, 'truck-fast-outline', 'Order Status Update', `Order #${a.id} is now ${msg}.`) : ns;
    }

    case 'ATTACH_AWB': {
      const audit = createAuditEntry(
        'ORDER_AWB_ATTACHED',
        `Shipment AWB Generated: #${a.id}`,
        `Courier: ${a.shipment?.courier} · AWB: ${a.shipment?.awb} · Pickup: ${a.shipment?.pickupScheduled}`,
        { orderId: a.id, shipment: a.shipment }
      );
      return {
        ...s,
        orders: s.orders.map((o) => (o.id === a.id ? { ...o, shipment: a.shipment, status: 'Shipped' } : o)),
        auditLog: [audit, ...s.auditLog],
      };
    }

    case 'CANCEL_ORDER': {
      const targetOrder = s.orders.find((o) => o.id === a.id);
      const audit = createAuditEntry(
        'ORDER_CANCELLED',
        `Order Cancelled: #${a.id}`,
        `Order for ₹${targetOrder?.total || 0} cancelled by user/seller.`,
        { orderId: a.id, total: targetOrder?.total }
      );
      return notif(
        { ...s, orders: s.orders.map((o) => (o.id === a.id ? { ...o, status: 'Cancelled' } : o)), auditLog: [audit, ...s.auditLog] },
        'close-circle-outline',
        'Order Cancelled',
        `Order #${a.id} has been cancelled.`,
        '#EF4444'
      );
    }

    case 'RETURN_ORDER': {
      const audit = createAuditEntry(
        'ORDER_RETURN_REQUEST',
        `Return Requested: #${a.id}`,
        `Customer requested return. Reason: ${a.reason}`,
        { orderId: a.id, reason: a.reason }
      );
      return notif(
        {
          ...s,
          orders: s.orders.map((o) => (o.id === a.id ? { ...o, status: 'Return Requested', returnReason: a.reason } : o)),
          auditLog: [audit, ...s.auditLog],
        },
        'backup-restore',
        'Return Requested',
        `Pickup for Order #${a.id} will be scheduled within 2 business days.`
      );
    }

    case 'ADD_PRODUCT': {
      const p = a.product;
      const audit = createAuditEntry(
        'PRODUCT_ADDED',
        `Product Listed: ${p.title} (₹${p.price})`,
        `Seller: ${p.sellerName || s.shop.name || 'Verified Seller'} (+91 ${p.sellerPhone || s.user?.phone}) · MRP: ₹${p.mrp || p.price} · Category: ${p.cat} · Photos: ${p.images?.length || 1} · Video: ${p.video ? 'Yes' : 'No'}`,
        { product: p, sellerPhone: p.sellerPhone || s.user?.phone }
      );
      return notif(
        {
          ...s,
          products: [p, ...s.products],
          myProducts: [p, ...(s.myProducts || [])],
          auditLog: [audit, ...s.auditLog],
        },
        'tag-outline',
        'Product Listed',
        `"${p.title}" is now active in the marketplace.`
      );
    }

    case 'RM_PRODUCT': {
      const prod = s.products.find((p) => p.id === a.id);
      const audit = createAuditEntry(
        'PRODUCT_DELETED',
        `Product Deleted: ${prod?.title || a.id}`,
        `Deleted by Seller (+91 ${s.user?.phone}) · Price: ₹${prod?.price || 0} · Category: ${prod?.cat}`,
        { productId: a.id, title: prod?.title, sellerPhone: s.user?.phone }
      );
      return {
        ...s,
        products: s.products.filter((p) => p.id !== a.id),
        myProducts: (s.myProducts || []).filter((p) => p.id !== a.id),
        auditLog: [audit, ...s.auditLog],
      };
    }

    case 'ADDRESS':
      return { ...s, addresses: [a.address, ...s.addresses] };

    case 'RM_ADDRESS':
      return { ...s, addresses: s.addresses.filter((x) => x.id !== a.id) };

    case 'READ_NOTIFS':
      return { ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) };

    case 'CHAT':
      return { ...s, supportChat: [...s.supportChat, a.msg] };

    case 'CLEAR_AUDIT_LOG': {
      const freshAudit = [
        createAuditEntry('SYSTEM', 'Ledger Reset', 'Audit ledger reset by owner on ' + formatLogTime(Date.now())),
      ];
      return { ...s, auditLog: freshAudit };
    }

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
  // Also keep any local-only products
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
        const [rawSession, rawProducts, rawAudit, rawAdmin, rawSettlements] = await Promise.all([
          AsyncStorage.getItem(KEY_SESSION),
          AsyncStorage.getItem(KEY_ALL_PRODUCTS),
          AsyncStorage.getItem(KEY_AUDIT_LOG),
          AsyncStorage.getItem(KEY_ADMIN_SETTINGS),
          AsyncStorage.getItem(KEY_SETTLEMENTS),
        ]);

        let sessionData = rawSession ? JSON.parse(rawSession) : null;
        let allProds = rawProducts ? JSON.parse(rawProducts) : [];
        let auditList = rawAudit ? JSON.parse(rawAudit) : [];
        let adminPatch = rawAdmin ? JSON.parse(rawAdmin) : null;
        let settlementsData = rawSettlements ? JSON.parse(rawSettlements) : {};

        if (sessionData && sessionData.user?.phone) {
          const userKey = USER_KEY_PREFIX + cleanPhone(sessionData.user.phone);
          const rawUserAcc = await AsyncStorage.getItem(userKey);
          const userAcc = rawUserAcc ? JSON.parse(rawUserAcc) : sessionData;

          dispatch({
            type: 'RESTORE_USER_ACCOUNT',
            phone: cleanPhone(sessionData.user.phone),
            userAccount: userAcc,
            allProducts: allProds,
            auditLog: auditList,
            adminSettings: adminPatch,
            sellerSettlements: settlementsData,
          });
        } else if (sessionData) {
          dispatch({
            type: 'HYDRATE',
            data: {
              ...sessionData,
              products: mergeCloudAndLocal(allProds, sessionData.products),
              auditLog: auditList.length > 0 ? auditList : sessionData.auditLog,
              admin: adminPatch ? { ...DEFAULT_ADMIN, ...adminPatch } : sessionData.admin,
              sellerSettlements: settlementsData || {},
            },
          });
        } else {
          dispatch({ type: 'READY' });
        }

        requestNotificationPermission().catch(() => {});
      } catch (err) {
        console.log('Error hydrating state:', err);
        dispatch({ type: 'READY' });
      }
    })();
  }, []);

  // Multi-account Phone-Indexed Persistence: When user logs in or state changes
  useEffect(() => {
    if (!state.ready) return;
    if (first.current) { first.current = false; }

    const phone = state.user?.phone ? cleanPhone(state.user.phone) : null;

    // 1. Save Session State
    const { ready, ...rest } = state;
    AsyncStorage.setItem(KEY_SESSION, JSON.stringify(rest)).catch(() => {});

    // 2. Save Global Catalog of Products
    if (state.products && state.products.length > 0) {
      AsyncStorage.setItem(KEY_ALL_PRODUCTS, JSON.stringify(state.products)).catch(() => {});
    }

    // 3. Save Owner Audit Log
    if (state.auditLog && state.auditLog.length > 0) {
      AsyncStorage.setItem(KEY_AUDIT_LOG, JSON.stringify(state.auditLog.slice(0, 500))).catch(() => {});
    }

    // 4. Save Admin Settings & Owner Payment Setup
    if (state.admin) {
      AsyncStorage.setItem(KEY_ADMIN_SETTINGS, JSON.stringify(state.admin)).catch(() => {});
    }

    // 4b. Save Seller Settlements
    if (state.sellerSettlements) {
      AsyncStorage.setItem(KEY_SETTLEMENTS, JSON.stringify(state.sellerSettlements)).catch(() => {});
    }

    // 5. Save Phone-Indexed User Account
    if (phone) {
      const userKey = USER_KEY_PREFIX + phone;
      const userAccountBundle = {
        user: state.user,
        shop: state.shop,
        myProducts: state.myProducts || state.products.filter((p) => p.sellerPhone === phone || p.seller === 'me'),
        orders: state.orders,
        cart: state.cart,
        wishlist: state.wishlist,
        addresses: state.addresses,
        notifications: state.notifications,
        supportChat: state.supportChat,
        settings: state.settings,
        savedAt: Date.now(),
      };
      AsyncStorage.setItem(userKey, JSON.stringify(userAccountBundle)).catch(() => {});
    }
  }, [state]);

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
