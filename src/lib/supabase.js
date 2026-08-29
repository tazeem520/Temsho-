// ============================================================
//  TEMSHO — Supabase connection
//  यहाँ सिर्फ़ 2 चीज़ें पेस्ट करनी हैं (नीचे देखिए)।
//  पहले चलाएँ:  npm install @supabase/supabase-js
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// 👇👇 अपनी 2 चीज़ें यहाँ पेस्ट कीजिए 👇👇
// Supabase → Settings → API → वहाँ दोनों मिलेंगी
const SUPABASE_URL = 'https://zyyxpkyqagewsjfwlktd.supabase.co';       // जैसे: https://abcdxyz.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5eXhwa3lxYWdld3NqZndsa3RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MDE2ODEsImV4cCI6MjEwMzQ3NzY4MX0.VpqQXDLT7Q0oJCC8Iha_l8PU3vVylZtq4TN38AinyzQ';
// 👆👆 बस इतना ही 👆👆

export const isConfigured =
  !SUPABASE_URL.startsWith('YAHAN') && !SUPABASE_ANON_KEY.startsWith('YAHAN');

export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
    })
  : null;

/* ---------------- छोटे-छोटे helper (तैयार हैं) ---------------- */

// सारे live products लाओ
export async function fetchProducts() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*, shops(name, city, upi, pay_name)')
    .eq('is_live', true)
    .order('created_at', { ascending: false });
  if (error) { console.log('fetchProducts', error.message); return []; }
  return data || [];
}

// seller अपना product डाले
export async function addProduct(p) {
  if (!supabase) return null;
  const { data, error } = await supabase.from('products').insert(p).select().single();
  if (error) { console.log('addProduct', error.message); return null; }
  return data;
}

// seller की फ़ोटो upload — URL वापस मिलेगा
export async function uploadPhoto(uri, fileName) {
  if (!supabase) return null;
  const res = await fetch(uri);
  const blob = await res.blob();
  const path = `${Date.now()}-${fileName || 'photo.jpg'}`;
  const { error } = await supabase.storage.from('product-photos').upload(path, blob, {
    contentType: blob.type || 'image/jpeg',
  });
  if (error) { console.log('uploadPhoto', error.message); return null; }
  const { data } = supabase.storage.from('product-photos').getPublicUrl(path);
  return data.publicUrl;
}

// order बनाओ
export async function createOrder(o) {
  if (!supabase) return null;
  const { data, error } = await supabase.from('orders').insert(o).select().single();
  if (error) { console.log('createOrder', error.message); return null; }
  return data;
}

// मेरे orders
export async function fetchMyOrders(userId) {
  if (!supabase) return [];
  const { data } = await supabase
    .from('orders').select('*').eq('buyer_id', userId).order('created_at', { ascending: false });
  return data || [];
}

// seller के पास आए orders
export async function fetchSellerOrders(userId) {
  if (!supabase) return [];
  const { data } = await supabase
    .from('orders').select('*').eq('seller_id', userId).order('created_at', { ascending: false });
  return data || [];
}

// Admin Panel की settings save/load
export async function loadAppSettings() {
  if (!supabase) return null;
  const { data } = await supabase.from('app_settings').select('data').eq('id', 1).single();
  return data?.data || null;
}
export async function saveAppSettings(obj) {
  if (!supabase) return;
  await supabase.from('app_settings').update({ data: obj }).eq('id', 1);
}

/* ---------------- OTP (Supabase का अपना, मुफ़्त) ---------------- */
// चाहें तो WhatsApp की जगह ये भी चला सकते हैं
export async function sendOtp(phone) {
  if (!supabase) return { ok: false, msg: 'Supabase set nahi hai' };
  const { error } = await supabase.auth.signInWithOtp({ phone: '+91' + phone });
  return { ok: !error, msg: error?.message };
}
export async function verifyOtp(phone, token) {
  if (!supabase) return { ok: false };
  const { data, error } = await supabase.auth.verifyOtp({ phone: '+91' + phone, token, type: 'sms' });
  return { ok: !error, user: data?.user, msg: error?.message };
}
