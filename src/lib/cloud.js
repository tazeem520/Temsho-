// ============================================================
//  TEMSHO — Supabase Cloud Sync & Realtime Engine
//  Syncs Products, Shops, Orders, Settings, Reviews across all users
// ============================================================

import { supabase, isConfigured } from './supabase';

export const cloudOn = () => isConfigured;

const mapProduct = (r) => ({
  id: r.id,
  title: r.title,
  desc: r.description || '',
  cat: r.category || 'general',
  price: Number(r.price) || 0,
  mrp: Number(r.mrp || r.price) || 0,
  img: r.image_url ? { uri: r.image_url } : null,
  rating: Number(r.rating) || 4.5,
  ratingCount: 0,
  seller: r.seller_id || 'seller',
  sellerName: r.shops?.name || 'Temsho Verified Seller',
  sellerCity: r.shops?.city || 'India',
  sellerUpi: r.shops?.upi || '',
  sellerContact: r.shops?.contact || '',
  tint: '#EFF1F6',
  tags: ['Verified Seller', 'No Bot Guarantee'],
  cloud: true,
  createdAt: r.created_at,
});

/* -------- 🛍️ PRODUCTS -------- */
export async function pullProducts() {
  if (!isConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, shops(name, city, upi, contact, pay_name)')
      .eq('is_live', true)
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) {
      console.log('pullProducts:', error.message);
      return null;
    }
    return (data || []).map(mapProduct);
  } catch (e) {
    console.log('pullProducts err:', e.message);
    return null;
  }
}

export async function pushProduct(p, userId, shopId) {
  if (!isConfigured) return null;
  try {
    let imageUrl = null;
    if (p.img?.uri) imageUrl = await uploadPhoto(p.img.uri);

    const { data, error } = await supabase
      .from('products')
      .insert({
        shop_id: shopId || null,
        seller_id: userId || null,
        title: p.title,
        description: p.desc || '',
        category: p.cat || 'fashion',
        price: Number(p.price) || 0,
        mrp: Number(p.mrp || p.price) || 0,
        image_url: imageUrl,
        is_live: true,
      })
      .select('*, shops(name, city, upi, contact)')
      .single();

    if (error) {
      console.log('pushProduct:', error.message);
      return null;
    }
    return mapProduct(data);
  } catch (e) {
    console.log('pushProduct err:', e.message);
    return null;
  }
}

export async function removeProduct(id) {
  if (!isConfigured) return false;
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    return !error;
  } catch (e) {
    return false;
  }
}

/* -------- 📸 PHOTO UPLOAD -------- */
export async function uploadPhoto(uri) {
  if (!isConfigured || !uri) return null;
  if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;

  try {
    const res = await fetch(uri);
    const blob = await res.blob();
    const fileName = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;

    const { error } = await supabase.storage
      .from('product-photos')
      .upload(fileName, blob, {
        contentType: blob.type || 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.log('uploadPhoto error:', error.message);
      return null;
    }

    const { data } = supabase.storage.from('product-photos').getPublicUrl(fileName);
    return data?.publicUrl || null;
  } catch (e) {
    console.log('uploadPhoto exception:', e.message);
    return null;
  }
}

/* -------- 👤 USERS & SHOPS -------- */
export async function upsertUser(u) {
  if (!isConfigured || !u?.phone) return null;
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          phone: u.phone,
          name: u.name,
          email: u.email || null,
          city: u.city || null,
          state: u.state || u.st || null,
          pin: u.pin || null,
          is_seller: !!u.isSeller,
          is_owner: !!u.isOwner,
        },
        { onConflict: 'phone' }
      )
      .select()
      .single();

    if (error) {
      console.log('upsertUser:', error.message);
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
}

export async function upsertShop(shop, userId) {
  if (!isConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('shops')
      .upsert(
        {
          owner_id: userId || null,
          name: shop.name || 'Temsho Shop',
          tagline: shop.tagline || '',
          city: shop.city || '',
          state: shop.state || '',
          pin: shop.pin || '',
          pickup: shop.pickup || '',
          contact: shop.contact || '',
          hours: shop.hours || '10:00 AM – 8:00 PM',
          return_days: Number(shop.returnDays) || 7,
          gst: shop.gst || '',
          pay_name: shop.payName || '',
          upi: shop.upi || '',
          bank_name: shop.bankName || '',
          acc_no: shop.accNo || '',
          ifsc: shop.ifsc || '',
          accept_upi: shop.acceptUpi ?? true,
          accept_cod: shop.acceptCod ?? true,
        },
        { onConflict: 'owner_id' }
      )
      .select()
      .single();

    if (error) {
      console.log('upsertShop:', error.message);
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
}

/* -------- 📦 ORDERS -------- */
export async function pushOrder(o, buyerId, sellerId) {
  if (!isConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        code: o.id,
        buyer_id: buyerId || null,
        seller_id: sellerId || null,
        items: o.items,
        total: o.total,
        pay_method: o.pay,
        coupon: o.coupon,
        wallet_used: o.walletUsed || 0,
        address: o.address,
        status: o.status || 'Confirmed',
        eta: o.eta,
      })
      .select()
      .single();

    if (error) {
      console.log('pushOrder:', error.message);
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
}

export async function updateOrderStatus(code, status, note = null) {
  if (!isConfigured) return false;
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('code', code);
    return !error;
  } catch (e) {
    return false;
  }
}

export async function pullOrders(phone) {
  if (!isConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) return null;
    return data;
  } catch (e) {
    return null;
  }
}

/* -------- ⭐ REVIEWS -------- */
export async function pushReview(productId, userId, rating, text) {
  if (!isConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: userId || null,
        rating,
        text,
      })
      .select()
      .single();
    return error ? null : data;
  } catch (e) {
    return null;
  }
}

export async function pullReviews(productId) {
  if (!isConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, users(name, city)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    return error ? [] : data || [];
  } catch (e) {
    return [];
  }
}

/* -------- ⚙️ ADMIN SETTINGS -------- */
export async function pullSettings() {
  if (!isConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('data')
      .eq('id', 1)
      .single();
    if (error) return null;
    return data?.data || null;
  } catch (e) {
    return null;
  }
}

export async function pushSettings(obj) {
  if (!isConfigured) return;
  try {
    await supabase.from('app_settings').update({ data: obj }).eq('id', 1);
  } catch (e) {
    console.log('pushSettings err:', e.message);
  }
}

/* -------- 🔴 REALTIME SUBSCRIPTIONS -------- */
export function subscribeToProducts(onUpdate) {
  if (!isConfigured) return () => {};
  try {
    const channel = supabase
      .channel('public:products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (onUpdate) onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (e) {
    return () => {};
  }
}

export function subscribeToOrders(onUpdate) {
  if (!isConfigured) return () => {};
  try {
    const channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (onUpdate) onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (e) {
    return () => {};
  }
}
