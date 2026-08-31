-- ============================================================
-- 🚀 TEMSHO — Supabase Cloud Sync & Realtime Fix
-- Copy & Run in Supabase SQL Editor: https://supabase.com/dashboard/project/zyyxpkyqagewsjfwlktd/sql
-- ============================================================

-- 1. Enable public read/write access to all marketplace tables
ALTER TABLE IF EXISTS products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS shops DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS app_settings DISABLE ROW LEVEL SECURITY;

-- 2. Ensure Storage Bucket for Product Photos is created and public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-photos', 'product-photos', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Storage bucket access policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-photos');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-photos');
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-photos');
