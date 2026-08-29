-- ============================================================
--  TEMSHO — Supabase Database Setup
--  इस्तेमाल: Supabase → SQL Editor → New query → ये पूरा पेस्ट → RUN
--  एक बार चलाना है। 30 सेकंड लगेंगे।
-- ============================================================

-- 1) USERS -----------------------------------------------------
create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  phone       text unique not null,
  name        text,
  email       text,
  gender      text,
  dob         text,
  city        text,
  state       text,
  pin         text,
  wallet      integer default 0,
  referral    text,
  is_seller   boolean default false,
  is_owner    boolean default false,
  created_at  timestamptz default now()
);

-- 2) SHOPS (हर seller की दुकान) --------------------------------
create table if not exists shops (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references users(id) on delete cascade,
  name        text not null,
  tagline     text,
  city        text,
  state       text,
  pin         text,
  pickup      text,
  contact     text,
  hours       text default '10:00 AM - 8:00 PM',
  return_days integer default 7,
  gst         text,
  pay_name    text,
  upi         text,
  bank_name   text,
  acc_no      text,
  ifsc        text,
  accept_upi  boolean default true,
  accept_cod  boolean default true,
  rating      numeric default 0,
  created_at  timestamptz default now()
);

-- 3) PRODUCTS --------------------------------------------------
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  shop_id     uuid references shops(id) on delete cascade,
  seller_id   uuid references users(id) on delete cascade,
  title       text not null,
  description text,
  category    text,
  price       integer not null,
  mrp         integer,
  image_url   text,
  stock       integer default 10,
  is_live     boolean default true,
  rating      numeric default 0,
  created_at  timestamptz default now()
);
create index if not exists products_cat_idx on products(category);
create index if not exists products_live_idx on products(is_live);

-- 4) ADDRESSES -------------------------------------------------
create table if not exists addresses (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid references users(id) on delete cascade,
  label    text,
  line     text,
  city     text,
  state    text,
  pin      text,
  phone    text
);

-- 5) ORDERS ----------------------------------------------------
create table if not exists orders (
  id           uuid primary key default gen_random_uuid(),
  code         text unique,
  buyer_id     uuid references users(id) on delete set null,
  seller_id    uuid references users(id) on delete set null,
  items        jsonb not null,
  total        integer not null,
  pay_method   text,
  coupon       text,
  wallet_used  integer default 0,
  address      jsonb,
  status       text default 'Confirmed',
  eta          text,
  created_at   timestamptz default now()
);
create index if not exists orders_buyer_idx on orders(buyer_id);
create index if not exists orders_seller_idx on orders(seller_id);

-- 6) REVIEWS ---------------------------------------------------
create table if not exists reviews (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  user_id    uuid references users(id) on delete cascade,
  rating     integer check (rating between 1 and 5),
  text       text,
  created_at timestamptz default now()
);

-- 7) NOTIFICATIONS ---------------------------------------------
create table if not exists notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id) on delete cascade,
  icon       text,
  title      text,
  body       text,
  is_read    boolean default false,
  created_at timestamptz default now()
);

-- 8) APP SETTINGS (Admin Panel इसी को बदलता है) ----------------
create table if not exists app_settings (
  id    integer primary key default 1,
  data  jsonb not null
);
insert into app_settings (id, data) values (1, '{
  "appName":"Temsho","tagline":"Poore Bharat ka apna bazaar",
  "freeDeliveryAbove":499,"deliveryFee":49,"cashbackPct":1,
  "referralAmount":100,"commissionPct":0,
  "allowCod":true,"allowUpi":true,"allowWhatsappOtp":true,
  "allowAnyoneToSell":true,"requirePhotoToList":true,"maintenance":false
}'::jsonb) on conflict (id) do nothing;

-- ============================================================
--  SECURITY (RLS) — कौन क्या देख/बदल सकता है
-- ============================================================
alter table users         enable row level security;
alter table shops         enable row level security;
alter table products      enable row level security;
alter table addresses     enable row level security;
alter table orders        enable row level security;
alter table reviews       enable row level security;
alter table notifications enable row level security;
alter table app_settings  enable row level security;

-- सब लोग products/shops/reviews देख सकते हैं
create policy "products public read"  on products      for select using (true);
create policy "shops public read"     on shops         for select using (true);
create policy "reviews public read"   on reviews       for select using (true);
create policy "settings public read"  on app_settings  for select using (true);

-- सिर्फ़ अपना डेटा बदल सकते हैं
create policy "own user"      on users         for all using (auth.uid() = id);
create policy "own shop"      on shops         for all using (auth.uid() = owner_id);
create policy "own products"  on products      for all using (auth.uid() = seller_id);
create policy "own address"   on addresses     for all using (auth.uid() = user_id);
create policy "own notifs"    on notifications for all using (auth.uid() = user_id);
create policy "own reviews"   on reviews       for all using (auth.uid() = user_id);
create policy "my orders"     on orders        for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "create order"  on orders        for insert with check (auth.uid() = buyer_id);
create policy "seller update" on orders        for update using (auth.uid() = seller_id or auth.uid() = buyer_id);

-- ============================================================
--  STORAGE — seller की अपलोड की हुई फ़ोटो यहाँ जाएंगी
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-photos', 'product-photos', true)
on conflict (id) do nothing;

create policy "photo public read" on storage.objects
  for select using (bucket_id = 'product-photos');
create policy "photo upload" on storage.objects
  for insert with check (bucket_id = 'product-photos' and auth.role() = 'authenticated');

-- ✅ हो गया!
