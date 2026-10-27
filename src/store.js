import React, { createContext, useContext, useMemo, useReducer, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRODUCTS, BANNERS } from './data/catalog';
import { DEFAULT_ADMIN, isOwner } from './config';
import * as cloud from './lib/cloud';
import * as shiprocket from './lib/shiprocket';
import { requestNotificationPermission, showSystemNotification } from './lib/notifications';

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
];
export const normalizeLangCode = (l) => 'en';
export const t = (key) => {
  const map = { home: 'Home', categories: 'Categories', trending_now: 'Deals', account: 'Account', cart: 'Cart' };
  return map[key] || (key ? String(key).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '');
};

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const KEY_SESSION = '@temsho/v4_dynamic_banners';
const KEY_ALL_PRODUCTS = '@temsho/all_products_catalog';
const KEY_AUDIT_LOG = '@temsho/owner_audit_log';
const KEY_ADMIN_SETTINGS = '@temsho/admin_settings';
const KEY_SETTLEMENTS = '@temsho/seller_settlements_v1';
const KEY_DELETED_PRODUCT_IDS = '@temsho/deleted_product_ids_v1';
const USER_KEY_PREFIX = '@temsho/account_';

const refCode = (phone) => 'TEM' + (phone ? String(phone).slice(-4) : '2026') + 'X';
const cleanPhone = (p) => String(p || '').replace(/\D/g, '').slice(-10);

const LANGS = [
  'English',
  'Hindi (हिन्दी)',
  'Hinglish',
  'Bengali (বাংলা)',
  'Marathi (मराठी)',
  'Tamil (தமிழ்)',
  'Telugu (తెలుగు)',
  'Gujarati (ગુજરાતી)',
  'Kannada (ಕನ್ನಡ)',
  'Punjabi (ਪੰਜਾਬੀ)',
  'Malayalam (മലയാളം)',
  'Odia (ଓଡ଼ିଆ)',
];
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
  deletedProductIds: [], // Permanently deleted product IDs
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
    { id: 'n1', icon: 'party-popper', title: 'Welcome to Temsho!', body: 'Shop directly from verified Indian sellers with 100% transparency.', at: Date.now() - 3600000, read: false },
    { id: 'n2', icon: 'shield-check-outline', title: 'Verified Seller Community', body: 'Shop directly from trusted, verified Indian sellers on Temsho.', at: Date.now() - 86400000, read: false },
    { id: 'n3', icon: 'truck-fast-outline', title: 'Free Delivery Active', body: 'Enjoy free delivery across India on all orders above ₹499.', at: Date.now() - 172800000, read: false },
  ],
  supportChat: [
    { id: 'm0', who: 'agent', agent: 'Priya S.', text: 'Hello! I am Priya, your dedicated Temsho Support Executive. How may I help you today?', at: Date.now() },
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
      const { userAccount, cloudData, allProducts, auditLog, adminSettings } = a;
      const phone = cleanPhone(userAccount?.user?.phone || cloudData?.user?.phone || a.phone || '');
      const owner = isOwner(phone);

      // 1. Restore Shop (Cloud shop takes highest priority, then local userAccount, then empty)
      const cloudShop = cloudData?.shop || cloudData?.shopRow;
      const rawShop = cloudShop ? {
        name: cloudShop.name || '',
        tagline: cloudShop.tagline || '',
        city: cloudShop.city || '',
        state: cloudShop.state || '',
        pin: cloudShop.pin || '',
        pickup: cloudShop.pickup || '',
        contact: phone,
        hours: cloudShop.hours || '10:00 AM – 8:00 PM',
        returnDays: String(cloudShop.returnDays || cloudShop.return_days || '7'),
        gst: cloudShop.gst || '',
        payName: cloudShop.payName || cloudShop.pay_name || '',
        upi: cloudShop.upi || '',
        bankName: cloudShop.bankName || cloudShop.bank_name || '',
        accNo: cloudShop.accNo || cloudShop.acc_no || '',
        ifsc: cloudShop.ifsc || '',
        acceptUpi: cloudShop.acceptUpi ?? cloudShop.accept_upi ?? true,
        acceptCod: cloudShop.acceptCod ?? cloudShop.accept_cod ?? true,
        acceptBank: true,
      } : (userAccount?.shop || {
        name: userAccount?.user?.shopName || '',
        tagline: '', city: userAccount?.user?.shopCity || '', state: '', pin: '',
        pickup: '', contact: phone, hours: '10:00 AM – 8:00 PM',
        returnDays: '7', gst: '',
        payName: userAccount?.user?.name || '', upi: '', bankName: '', accNo: '', ifsc: '',
        acceptUpi: true, acceptCod: true, acceptBank: true,
      });

      const hasShop = (!!rawShop?.name && rawShop.name.trim().length > 0) || (!!userAccount?.user?.shopName && userAccount.user.shopName.trim().length > 0);
      const cloudUser = cloudData?.user || cloudData?.userRow;
      const isSeller = Boolean(cloudUser?.is_seller || cloudUser?.isSeller || cloudShop?.name || userAccount?.user?.isSeller || hasShop);

      // 2. Restore User Profile
      const user = {
        phone,
        name: cloudUser?.name || userAccount?.user?.name || a.name || 'Valued User',
        email: cloudUser?.email || userAccount?.user?.email || null,
        city: cloudUser?.city || userAccount?.user?.city || rawShop.city || '',
        state: cloudUser?.state || userAccount?.user?.state || rawShop.state || '',
        pin: cloudUser?.pin || userAccount?.user?.pin || rawShop.pin || '',
        isSeller,
        shopName: rawShop.name,
        shopCity: rawShop.city,
        isOwner: owner,
        referral: userAccount?.user?.referral || refCode(phone),
        cloudId: cloudUser?.id || userAccount?.user?.cloudId || null,
      };

      // 3. Restore Orders (Merge cloud orders and local orders, deduplicate by code/id)
      const cloudOrders = (cloudData?.userOrders || []).map((o) => ({
        id: o.code || o.id,
        items: o.items || [],
        total: Number(o.total) || 0,
        pay: o.pay_method || 'cod',
        address: o.address || {},
        status: o.status || 'Confirmed',
        eta: o.eta || '3-5 Days',
        createdAt: o.created_at,
      }));

      const orderMap = new Map();
      (userAccount?.orders || []).forEach((o) => { if (o && o.id) orderMap.set(o.id, o); });
      cloudOrders.forEach((o) => { if (o && o.id) orderMap.set(o.id, { ...(orderMap.get(o.id) || {}), ...o }); });
      const orders = Array.from(orderMap.values());

      // 4. Restore Products
      const cloudProds = cloudData?.sellerProducts || [];
      const myProdsMap = new Map();
      (userAccount?.myProducts || []).forEach((p) => { if (p && p.id) myProdsMap.set(p.id, p); });
      cloudProds.forEach((p) => { if (p && p.id) myProdsMap.set(p.id, p); });
      (allProducts || []).forEach((p) => {
        if (p && (p.sellerPhone === phone || p.seller === 'me')) myProdsMap.set(p.id, p);
      });
      const deletedSet = new Set(a.deletedProductIds || s.deletedProductIds || []);
      const myProducts = Array.from(myProdsMap.values()).filter((p) => !deletedSet.has(p.id));

      const cart = userAccount?.cart || [];
      const wishlist = userAccount?.wishlist || [];
      const addresses = userAccount?.addresses || (cloudUser?.city ? [{ id: 'a1', name: user.name, phone, line: rawShop.pickup || 'Address Line', city: cloudUser.city, pin: cloudUser.pin || '226010', state: cloudUser.state || 'Uttar Pradesh', active: true }] : []);
      const notifications = userAccount?.notifications || s.notifications;
      const supportChat = userAccount?.supportChat || s.supportChat;
      const settings = userAccount?.settings || s.settings;

      const mergedProds = mergeCloudAndLocal(allProducts || s.products, myProducts, a.deletedProductIds || s.deletedProductIds);

      return notif(
        {
          ...s,
          ready: true,
          user,
          shop: rawShop,
          myProducts,
          products: mergedProds,
          deletedProductIds: a.deletedProductIds || s.deletedProductIds || [],
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
        `Logged in as +91 ${phone}. All past orders, seller shop details, and listings have been restored from cloud.`
      );
    }

    case 'CLOUD_PRODUCTS': {
      const deletedSet = new Set(s.deletedProductIds || []);
      const map = new Map();
      (a.list || []).forEach((p) => {
        if (p && p.id && !deletedSet.has(p.id)) map.set(p.id, p);
      });
      (s.products || []).forEach((p) => {
        if (p && p.id && !deletedSet.has(p.id) && !map.has(p.id)) {
          map.set(p.id, p);
        }
      });
      const merged = Array.from(map.values());
      return {
        ...s,
        products: merged,
        myProducts: (s.myProducts || []).filter((p) => p && p.id && !deletedSet.has(p.id)),
        cloudOn: true,
      };
    }

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

    case 'RESET_SELLER_PAYOUT': {
      const { sellerPhone, shopName } = a;
      const audit = createAuditEntry(
        'SELLER_PAYOUT_RESET',
        `Payout Status Reset to Pending: ${shopName || sellerPhone}`,
        `Owner reopened seller settlement for +91 ${sellerPhone}. Amount moved back to Pending.`,
        { sellerPhone, shopName }
      );
      const curSettlements = { ...(s.sellerSettlements || {}) };
      delete curSettlements[sellerPhone];
      return notif(
        {
          ...s,
          sellerSettlements: curSettlements,
          auditLog: [audit, ...s.auditLog],
        },
        'refresh',
        'Payout Status Reset',
        `Payout for ${shopName || sellerPhone} moved back to Pending.`,
        '#2563EB'
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
      const newDeleted = Array.from(new Set([...(s.deletedProductIds || []), a.id]));
      return {
        ...s,
        products: s.products.filter((p) => p.id !== a.id),
        myProducts: (s.myProducts || []).filter((p) => p.id !== a.id),
        cart: (s.cart || []).filter((c) => c.id !== a.id),
        wishlist: (s.wishlist || []).filter((id) => id !== a.id),
        recentlyViewed: (s.recentlyViewed || []).filter((id) => id !== a.id),
        deletedProductIds: newDeleted,
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
      const phone = s.user?.phone ? cleanPhone(s.user.phone) : null;
      if (phone) {
        AsyncStorage.removeItem(USER_KEY_PREFIX + phone).catch(() => {});
      }
      AsyncStorage.removeItem(KEY_SESSION).catch(() => {});
      if (cloud.cloudOn() && phone) {
        cloud.deleteUserAccount(phone, s.user?.cloudId, s.shop?.cloudId).catch(() => {});
      }
      const audit = createAuditEntry('ACCOUNT_DELETED', `Account Deleted: +91 ${phone}`, 'User permanently wiped their account and listings.', { phone });
      const remainingProducts = s.products.filter((p) => p.sellerPhone !== phone && p.seller !== 'me');
      AsyncStorage.setItem(KEY_ALL_PRODUCTS, JSON.stringify(remainingProducts)).catch(() => {});
      return {
        ...init,
        ready: true,
        admin: s.admin,
        adminCoupons: s.adminCoupons,
        adminBanners: s.adminBanners,
        auditLog: [audit, ...s.auditLog],
        products: remainingProducts,
      };
    }

    case 'DELETE_SELLER': {
      const phone = cleanPhone(a.phone);
      if (phone) {
        AsyncStorage.removeItem(USER_KEY_PREFIX + phone).catch(() => {});
        if (cloud.cloudOn()) {
          cloud.deleteUserAccount(phone).catch(() => {});
        }
      }
      const newSettlements = { ...(s.sellerSettlements || {}) };
      delete newSettlements[phone];
      AsyncStorage.setItem(KEY_SETTLEMENTS, JSON.stringify(newSettlements)).catch(() => {});

      const remainingProducts = (s.products || []).filter((p) => cleanPhone(p.sellerPhone || '') !== phone);
      AsyncStorage.setItem(KEY_ALL_PRODUCTS, JSON.stringify(remainingProducts)).catch(() => {});

      const audit = createAuditEntry(
        'SELLER_ACCOUNT_DELETED',
        `Seller Deleted by Owner: +91 ${phone}`,
        `Seller account +91 ${phone} and all their listings were permanently removed by Owner.`,
        { phone }
      );

      return notif(
        {
          ...s,
          products: remainingProducts,
          sellerSettlements: newSettlements,
          auditLog: [audit, ...s.auditLog],
          user: (cleanPhone(s.user?.phone || '') === phone) ? { ...s.user, isSeller: false, shopName: null, shopCity: null } : s.user,
          shop: (cleanPhone(s.user?.phone || '') === phone) ? null : s.shop,
        },
        'delete-outline',
        'Seller Account Deleted',
        `Seller +91 ${phone} and their listings have been permanently deleted.`
      );
    }

    case 'BECOME_SELLER': {
      const phone = cleanPhone(s.user?.phone || a.shop?.contact || '');
      const shopObj = { ...s.shop, ...a.shop, name: a.shopName, city: a.shopCity, contact: phone };
      const updatedUser = { ...s.user, isSeller: true, shopName: a.shopName, shopCity: a.shopCity };

      // Push to Supabase Cloud immediately so it is permanently saved forever
      if (cloud.cloudOn()) {
        cloud.upsertUser(updatedUser).catch(() => {});
        cloud.upsertShop(shopObj, s.user?.cloudId, phone).catch(() => {});
      }

      // Save to local phone bundle
      if (phone) {
        const userKey = USER_KEY_PREFIX + phone;
        AsyncStorage.setItem(userKey, JSON.stringify({
          user: updatedUser,
          shop: shopObj,
          myProducts: s.myProducts || [],
          orders: s.orders || [],
          cart: s.cart || [],
          wishlist: s.wishlist || [],
          addresses: s.addresses || [],
          notifications: s.notifications || [],
          settings: s.settings || {},
          savedAt: Date.now(),
        })).catch(() => {});
      }

      const audit = createAuditEntry(
        'SELLER_REGISTERED',
        `New Seller Registered: ${a.shopName}`,
        `Seller Phone: +91 ${phone} · City: ${a.shopCity} · Payout UPI: ${a.shop?.upi} · Bank: ${a.shop?.bankName || 'Direct UPI'} (Acc: ${a.shop?.accNo ? '***' + a.shop.accNo.slice(-4) : 'N/A'}, IFSC: ${a.shop?.ifsc || 'N/A'})`,
        { shop: a.shop, shopName: a.shopName, shopCity: a.shopCity, sellerPhone: phone }
      );
      return notif(
        {
          ...s,
          shop: shopObj,
          user: updatedUser,
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

    case 'RETURN_ORDER':
    case 'REQUEST_RETURN': {
      const reverseOtp = String(Math.floor(1000 + Math.random() * 9000));
      const returnDetails = {
        reason: a.reason || 'General Return',
        action: a.returnAction || 'refund', // 'refund' | 'exchange'
        exchangeSize: a.exchangeSize || null,
        refundUpi: a.refundUpi || a.upi || null,
        notes: a.notes || '',
        photo: a.photo || null,
        requestedAt: Date.now(),
        reverseOtp,
        refundStatus: 'Pending',
      };

      const audit = createAuditEntry(
        'ORDER_RETURN_REQUEST',
        `Return/Exchange Requested: #${a.id} (${returnDetails.action.toUpperCase()})`,
        `Customer requested ${returnDetails.action}. Reason: ${returnDetails.reason} · Refund UPI: ${returnDetails.refundUpi || 'Original Mode'} · Reverse OTP: ${reverseOtp}`,
        { orderId: a.id, ...returnDetails }
      );

      return notif(
        {
          ...s,
          orders: s.orders.map((o) =>
            o.id === a.id
              ? {
                  ...o,
                  status: 'Return Requested',
                  returnReason: a.reason,
                  returnDetails,
                  reverseOtp,
                }
              : o
          ),
          auditLog: [audit, ...s.auditLog],
        },
        'backup-restore',
        'Return Request Submitted',
        `Your ${returnDetails.action === 'exchange' ? 'exchange' : 'return'} for Order #${a.id} is confirmed. Reverse courier pickup OTP: ${reverseOtp}.`
      );
    }

    case 'COMPLETE_REFUND': {
      const targetOrder = s.orders.find((o) => o.id === a.id);
      const audit = createAuditEntry(
        'REFUND_PROCESSED',
        `Refund Processed: #${a.id} (₹${a.amount || targetOrder?.total || 0})`,
        `Refund transferred to ${a.refundUpi || 'Customer UPI'}. UTR/Ref: ${a.utr || 'DIRECT_UPI'}`,
        { orderId: a.id, amount: a.amount, utr: a.utr, upi: a.refundUpi }
      );

      return notif(
        {
          ...s,
          orders: s.orders.map((o) =>
            o.id === a.id
              ? {
                  ...o,
                  status: 'Refund Completed',
                  refundAmount: a.amount || o.total,
                  refundUtr: a.utr,
                  refundedAt: Date.now(),
                  returnDetails: {
                    ...(o.returnDetails || {}),
                    refundStatus: 'Completed',
                    refundUtr: a.utr,
                  },
                }
              : o
          ),
          auditLog: [audit, ...s.auditLog],
        },
        'cash-check',
        'Refund Completed',
        `Refund of ₹${a.amount || targetOrder?.total || 0} for Order #${a.id} has been transferred to your UPI account.`
      );
    }

    case 'RAISE_SPF_CLAIM': {
      const claim = {
        id: 'SPF_' + Date.now(),
        orderId: a.orderId,
        sellerPhone: a.sellerPhone || s.user?.phone,
        reason: a.reason,
        amount: Number(a.amount) || 0,
        photo: a.photo || null,
        status: 'Approved & Protected',
        createdAt: Date.now(),
      };

      const audit = createAuditEntry(
        'SPF_CLAIM_FILED',
        `Seller Protection Fund (SPF) Claim: #${a.orderId} (₹${claim.amount})`,
        `Seller filed protection claim. Reason: ${claim.reason} · 100% Loss Protection active.`,
        claim
      );

      return notif(
        {
          ...s,
          spfClaims: [claim, ...(s.spfClaims || [])],
          orders: s.orders.map((o) => (o.id === a.orderId ? { ...o, spfClaim: claim } : o)),
          auditLog: [audit, ...s.auditLog],
        },
        'shield-check',
        'SPF Claim Protected',
        `Seller Protection Fund claim for Order #${a.orderId} has been registered with 100% loss coverage.`
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

    case 'EDIT_PRODUCT': {
      const p = a.product;
      const audit = createAuditEntry(
        'PRODUCT_UPDATED',
        `Product Updated: ${p.title} (₹${p.price})`,
        `Seller: ${p.sellerName || s.shop.name || 'Verified Seller'} (+91 ${p.sellerPhone || s.user?.phone}) · Price: ₹${p.price} · Stock: ${p.stock}`,
        { product: p, sellerPhone: p.sellerPhone || s.user?.phone }
      );
      return notif(
        {
          ...s,
          products: s.products.map((item) => (item.id === p.id ? { ...item, ...p } : item)),
          myProducts: (s.myProducts || []).map((item) => (item.id === p.id ? { ...item, ...p } : item)),
          auditLog: [audit, ...s.auditLog],
        },
        'square-edit-outline',
        'Product Updated',
        `"${p.title}" details have been updated successfully.`
      );
    }

    case 'TOGGLE_PRODUCT_STATUS': {
      return {
        ...s,
        products: s.products.map((p) => (p.id === a.id ? { ...p, status: p.status === 'paused' ? 'active' : 'paused' } : p)),
        myProducts: (s.myProducts || []).map((p) => (p.id === a.id ? { ...p, status: p.status === 'paused' ? 'active' : 'paused' } : p)),
      };
    }

    case 'UPDATE_PRODUCT_STOCK': {
      const newStock = Math.max(0, Number(a.stock) || 0);
      return {
        ...s,
        products: s.products.map((p) => (p.id === a.id ? { ...p, stock: newStock } : p)),
        myProducts: (s.myProducts || []).map((p) => (p.id === a.id ? { ...p, stock: newStock } : p)),
      };
    }

    case 'UPDATE_PRODUCT_PRICE': {
      return {
        ...s,
        products: s.products.map((p) =>
          p.id === a.id ? { ...p, price: Number(a.price) || p.price, mrp: Number(a.mrp) || p.mrp || p.price } : p
        ),
        myProducts: (s.myProducts || []).map((p) =>
          p.id === a.id ? { ...p, price: Number(a.price) || p.price, mrp: Number(a.mrp) || p.mrp || p.price } : p
        ),
      };
    }

    case 'RM_PRODUCT': {
      const prod = s.products.find((p) => p.id === a.id);
      const audit = createAuditEntry(
        'PRODUCT_DELETED',
        `Product Deleted: ${prod?.title || a.id}`,
        `Deleted by Seller (+91 ${s.user?.phone}) · Price: ₹${prod?.price || 0} · Category: ${prod?.cat}`,
        { productId: a.id, title: prod?.title, sellerPhone: s.user?.phone }
      );
      const newDeleted = Array.from(new Set([...(s.deletedProductIds || []), a.id]));
      return {
        ...s,
        products: s.products.filter((p) => p.id !== a.id),
        myProducts: (s.myProducts || []).filter((p) => p.id !== a.id),
        cart: (s.cart || []).filter((c) => c.id !== a.id),
        wishlist: (s.wishlist || []).filter((id) => id !== a.id),
        recentlyViewed: (s.recentlyViewed || []).filter((id) => id !== a.id),
        deletedProductIds: newDeleted,
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

function mergeCloudAndLocal(localProds = [], cloudProds = [], deletedIds = []) {
  const map = new Map();
  const deletedSet = new Set(deletedIds || []);

  // 1. Base verified marketplace catalog
  (PRODUCTS || []).forEach((p) => {
    if (p && p.id && !deletedSet.has(p.id)) map.set(p.id, p);
  });

  // 2. Local products
  (localProds || []).forEach((p) => {
    if (p && p.id && !deletedSet.has(p.id)) map.set(p.id, p);
  });

  // 3. Cloud products take precedence and are canonical
  (cloudProds || []).forEach((p) => {
    if (p && p.id && !deletedSet.has(p.id)) map.set(p.id, p);
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
        const [rawSession, rawProducts, rawAudit, rawAdmin, rawSettlements, rawDeleted] = await Promise.all([
          AsyncStorage.getItem(KEY_SESSION),
          AsyncStorage.getItem(KEY_ALL_PRODUCTS),
          AsyncStorage.getItem(KEY_AUDIT_LOG),
          AsyncStorage.getItem(KEY_ADMIN_SETTINGS),
          AsyncStorage.getItem(KEY_SETTLEMENTS),
          AsyncStorage.getItem(KEY_DELETED_PRODUCT_IDS),
        ]);

        let sessionData = rawSession ? JSON.parse(rawSession) : null;
        let allProds = rawProducts ? JSON.parse(rawProducts) : [];
        let auditList = rawAudit ? JSON.parse(rawAudit) : [];
        let adminPatch = rawAdmin ? JSON.parse(rawAdmin) : null;
        let settlementsData = rawSettlements ? JSON.parse(rawSettlements) : {};
        let deletedIds = rawDeleted ? JSON.parse(rawDeleted) : [];

        if (sessionData && sessionData.user?.phone) {
          const userPhone = cleanPhone(sessionData.user.phone);
          const userKey = USER_KEY_PREFIX + userPhone;
          const [rawUserAcc, cloudData] = await Promise.all([
            AsyncStorage.getItem(userKey),
            cloud.cloudPullUserFullProfile(userPhone),
          ]);
          const userAcc = rawUserAcc ? JSON.parse(rawUserAcc) : sessionData;

          dispatch({
            type: 'RESTORE_USER_ACCOUNT',
            phone: userPhone,
            userAccount: userAcc,
            cloudData,
            allProducts: allProds,
            auditLog: auditList,
            adminSettings: adminPatch,
            sellerSettlements: settlementsData,
            deletedProductIds: deletedIds,
          });
        } else if (sessionData) {
          dispatch({
            type: 'HYDRATE',
            data: {
              ...sessionData,
              products: mergeCloudAndLocal(allProds, sessionData.products, deletedIds),
              auditLog: auditList.length > 0 ? auditList : sessionData.auditLog,
              admin: adminPatch ? { ...DEFAULT_ADMIN, ...adminPatch } : sessionData.admin,
              sellerSettlements: settlementsData || {},
              deletedProductIds: deletedIds || [],
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

    // 2. Save Global Catalog of Products (Always save, even if empty array)
    AsyncStorage.setItem(KEY_ALL_PRODUCTS, JSON.stringify(state.products || [])).catch(() => {});

    // 2b. Save Deleted Product IDs
    if (state.deletedProductIds && state.deletedProductIds.length > 0) {
      AsyncStorage.setItem(KEY_DELETED_PRODUCT_IDS, JSON.stringify(state.deletedProductIds)).catch(() => {});
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
    const interval = setInterval(refresh, 5000); // Poll cloud every 5 seconds for instant real-time all-India sync

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

    // 100% Free Delivery for Buyers across all orders (Meesho Strategy: ₹0 Delivery Charge Always)
    const delivery = 0;
    const total = Math.max(0, subtotal - couponOff);

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
      t: (key) => t(key, state.settings?.lang || 'en'),
      lang: state.settings?.lang || 'en',
      unread: (state.notifications || []).filter((n) => !n.read).length,
    };
  }, [state]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
