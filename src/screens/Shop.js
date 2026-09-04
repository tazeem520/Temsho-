import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, FlatList, Dimensions, Image } from 'react-native';
import { C, R, shadow, money } from '../theme';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ProductCard, Section, Badge, TemshoAssuredBadge, HumanTag, Empty, Btn, Avatar, Thumb, CountdownTimer } from '../components/UI';
import { CATEGORIES, SELLERS } from '../data/catalog';
import { useApp } from '../store';

const W = Dimensions.get('window').width;
const SCREEN_W = Math.min(W, 430);
const CARD_W = (Math.min(W, 520) - 16 * 2 - 12) / 2;

export function Home({ go }) {
  const { state, unread, cartCount, activeBanners } = useApp();
  const [bi, setBi] = useState(0);
  const [budgetTab, setBudgetTab] = useState(499);
  const u = state.user;
  const addr = state.addresses[0];

  const deals = state.products.filter((p) => {
    const mrp = p.mrp || p.price;
    return mrp > p.price && (mrp - p.price) / mrp >= 0.20;
  }).slice(0, 8);

  const budgetProducts = state.products.filter((p) => p.price <= budgetTab).slice(0, 6);
  const trending = state.products.slice(0, 10);
  const forYou = [...state.products].reverse().slice(0, 8);

  // 2 rows Flipkart-style category circle grid
  const gridCats = [
    { id: null, name: 'Deals', icon: 'sale', tint: '#FFFBEB', fg: '#D97706', to: 'offers' },
    ...CATEGORIES,
    { id: 'sell', name: 'Sell', icon: 'storefront-plus-outline', tint: '#EFF6FF', fg: '#2563EB', to: 'become-seller' },
  ];
  const col = [];
  for (let i = 0; i < gridCats.length; i += 2) col.push(gridCats.slice(i, i + 2));

  const bannerList = activeBanners && activeBanners.length > 0 ? activeBanners : [];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Brand Header with Rich Blue Gradient */}
      <LinearGradient colors={['#1E2562', '#2874F0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.headWrap}>
        {/* Brand Bar */}
        <View style={st.brandBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={st.logoBox}>
              <MC name="storefront" size={20} color="#fff" />
            </View>
            <View style={{ marginLeft: 8 }}>
              <Text style={st.brandTitle}>Temsho</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={st.explorePlus}>Explore</Text>
                <Text style={st.plusTag}> Plus ⭐</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions (Wishlist & Notifications) */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity onPress={() => go('wishlist')} style={st.headIcoBtn}>
              <MC name="heart-outline" size={20} color="#fff" />
              {state.wishlist.length > 0 && <View style={st.dotSm} />}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => go('notifications')} style={st.headIcoBtn}>
              <MC name="bell-outline" size={20} color="#fff" />
              {unread > 0 && <View style={st.dotSm} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Delivery Bar */}
        <TouchableOpacity onPress={() => go('addresses')} style={st.deliverBar}>
          <MC name="map-marker-radius" size={16} color="#FDE047" />
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800', marginLeft: 6 }}>
            Deliver to {u?.name || 'Customer'} – {addr?.pin || '226010'}
          </Text>
          <Text numberOfLines={1} style={{ color: '#ffffffcc', fontSize: 11.5, marginLeft: 6, flex: 1 }}>
            {addr?.city || 'Lucknow'}
          </Text>
          <MC name="chevron-down" size={16} color="#fff" />
        </TouchableOpacity>

        {/* Search Bar */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => go('search')} style={st.search}>
          <MC name="magnify" size={20} color={C.ink3} />
          <Text style={{ color: C.ink3, marginLeft: 10, fontSize: 13.5, flex: 1 }}>
            Search products, categories or sellers...
          </Text>
          <MC name="microphone-outline" size={19} color={C.brand} style={{ marginHorizontal: 6 }} />
          <MC name="camera-outline" size={19} color={C.brand} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        {/* 2-Row Category Circles */}
        <View style={{ backgroundColor: C.surface, paddingVertical: 12 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
            {col.map((pair, i) => (
              <View key={i} style={{ marginRight: 4 }}>
                {pair.map((c) => (
                  <TouchableOpacity
                    key={c.name}
                    style={st.gcat}
                    onPress={() => (c.to ? go(c.to, c.to === 'category' ? { cat: c.id } : {}) : go('category', { cat: c.id }))}
                  >
                    <View style={[st.gcatIcon, { backgroundColor: c.tint }]}>
                      <MC name={c.icon} size={25} color={c.fg} />
                    </View>
                    <Text numberOfLines={1} style={st.gcatName}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Auto Carousel Banners (Owner Dynamic Banners) */}
        {bannerList.length > 0 && (
          <View style={{ backgroundColor: C.surface, marginTop: 8, paddingVertical: 10 }}>
            <ScrollView
              horizontal pagingEnabled showsHorizontalScrollIndicator={false}
              onScroll={(e) => setBi(Math.round(e.nativeEvent.contentOffset.x / (e.nativeEvent.layoutMeasurement.width || 1)))}
              scrollEventThrottle={16}
            >
              {bannerList.map((b) => (
                <View key={b.id} style={{ width: SCREEN_W, paddingHorizontal: 12 }}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      if (b.linkTo) go(b.linkTo);
                      else if (b.toScreen) go(b.toScreen);
                      else go('offers');
                    }}
                  >
                    {b.img ? (
                      <View style={[st.banner, { padding: 0, overflow: 'hidden' }]}>
                        <Image source={typeof b.img === 'string' ? { uri: b.img } : b.img} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      </View>
                    ) : (
                      <LinearGradient colors={[b.from || '#1E2562', b.to || '#2874F0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.banner}>
                        <View style={{ flex: 1 }}>
                          <View style={st.bannerTag}><Text style={{ color: '#fff', fontSize: 9.5, fontWeight: '900' }}>{b.tag || 'FEATURED'}</Text></View>
                          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 4 }}>{b.title}</Text>
                          <Text style={{ color: '#ffffffdd', fontSize: 12, marginTop: 4, lineHeight: 17 }}>{b.sub}</Text>
                        </View>
                        <MC name={b.icon || 'bullhorn'} size={48} color="#ffffff30" />
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
              {bannerList.map((b, i) => (
                <View key={b.id} style={[st.pageDot, i === bi && { width: 18, backgroundColor: C.brand }]} />
              ))}
            </View>
          </View>
        )}

        {/* Trust Badges Bar */}
        <View style={st.trustStrip}>
          {[['account-check-outline', '100% Humans', 'Zero Bots'],
            ['backup-restore', '7 Days Return', 'Free Doorstep Pickup'],
            ['cash-check', 'Cash on Delivery', 'Pay at Doorstep'],
            ['truck-fast-outline', 'Free Shipping', 'On Orders ₹499+']].map(([ic, t, s]) => (
            <View key={t} style={{ alignItems: 'center', flex: 1 }}>
              <MC name={ic} size={20} color={C.brand} />
              <Text style={{ fontSize: 11, color: C.ink, fontWeight: '800', marginTop: 3 }}>{t}</Text>
              <Text style={{ fontSize: 9.5, color: C.ink3, marginTop: 1 }}>{s}</Text>
            </View>
          ))}
        </View>

        {/* Deals of the Day (when products exist) */}
        {deals.length > 0 && (
          <View style={[st.dealsSection, shadow]}>
            <View style={st.dealsHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MC name="flash" size={22} color={C.redDark} />
                <Text style={{ color: C.ink, fontSize: 17, fontWeight: '900', marginLeft: 4 }}>Flash Deals</Text>
              </View>
              <CountdownTimer hours={3} minutes={42} seconds={15} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 4 }}>
              {deals.map((p) => (
                <View key={p.id} style={{ marginRight: 12 }}>
                  <ProductCard p={p} width={154} onPress={() => go('product', { id: p.id })} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Budget Store (Under ₹199, ₹499, ₹999) */}
        {state.products.length > 0 && (
          <View style={[st.budgetSection, shadow]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View>
                <Text style={{ fontSize: 16.5, fontWeight: '900', color: C.ink }}>Budget Store</Text>
                <Text style={{ fontSize: 11.5, color: C.ink3, marginTop: 1 }}>Best quality items at affordable prices</Text>
              </View>
            </View>

            {/* Budget Filter Tabs */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              {[199, 499, 999, 1499].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  onPress={() => setBudgetTab(amt)}
                  style={[st.budgetChip, budgetTab === amt && st.budgetChipOn]}
                >
                  <Text style={[st.budgetChipText, budgetTab === amt && { color: '#fff', fontWeight: '900' }]}>
                    Under ₹{amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {budgetProducts.map((p) => (
                <View key={p.id} style={{ marginRight: 12 }}>
                  <ProductCard p={p} width={148} onPress={() => go('product', { id: p.id })} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Main Product Grid / Marketplace Feed */}
        {trending.length > 0 ? (
          <Section title="Trending Products" subtitle="Top trending items from verified Indian sellers" action="View All" onAction={() => go('category', { cat: null })}>
            <View style={st.grid}>
              {trending.map((p) => (
                <ProductCard key={p.id} p={p} width={CARD_W} sellerName={SELLERS[p.seller]?.name} onPress={() => go('product', { id: p.id })} />
              ))}
            </View>
          </Section>
        ) : (
          <View style={[st.emptySection, shadow]}>
            <MC name="storefront-outline" size={48} color={C.brand} />
            <Text style={{ fontSize: 18, fontWeight: '900', color: C.ink, marginTop: 12 }}>Welcome to Temsho</Text>
            <Text style={{ color: C.ink2, fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 19, paddingHorizontal: 20 }}>
              No bot-generated products here. Start selling your own real products with real photos, or explore categories!
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' }}>
              <Btn title="List a Product" icon="plus" tone="brand" style={{ flex: 1 }} onPress={() => go('become-seller')} />
              <Btn title="Browse Categories" icon="view-grid" tone="outline" style={{ flex: 1 }} onPress={() => go('category', { cat: null })} />
            </View>
          </View>
        )}

        {/* 24x7 Real Human Support Banner */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => go('support')} style={[st.supportCta, shadow]}>
          <View style={st.ctaIcon}><MC name="headset" size={22} color={C.brand} /></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: C.ink, fontWeight: '900', fontSize: 14.5 }}>Need assistance? Talk to a Real Human</Text>
            <Text style={{ color: C.ink2, fontSize: 12, marginTop: 3 }}>24x7 Dedicated Executive · No AI Chatbots</Text>
          </View>
          <MC name="chevron-right" size={22} color={C.brand} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* ---------------- OFFERS & COUPONS ---------------- */
export function Offers({ go }) {
  const { state, dispatch, activeCoupons } = useApp();
  const byOff = [...state.products].sort((a, b) => {
    const mrpA = a.mrp || a.price;
    const mrpB = b.mrp || b.price;
    return (mrpB - b.price) / mrpB - (mrpA - a.price) / mrpA;
  });
  const top = byOff.slice(0, 6);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <LinearGradient colors={['#D97706', '#FF9F00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: 46, paddingHorizontal: 16, paddingBottom: 18 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>Deals & Discount Coupons 🔥</Text>
        <Text style={{ color: '#ffffffdd', fontSize: 12.5, marginTop: 4 }}>Save more on every order with active promo codes</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={st.oTitle}>Available Coupons</Text>
        {activeCoupons && activeCoupons.length > 0 ? (
          activeCoupons.map((c) => (
            <View key={c.id || c.code} style={[st.coupon, shadow]}>
              <View style={st.couponLeft}>
                <MC name="ticket-percent-outline" size={24} color={C.brand} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontWeight: '900', color: C.ink, fontSize: 15, letterSpacing: 1 }}>{c.code}</Text>
                <Text style={{ color: C.ink2, fontSize: 12, marginTop: 3, lineHeight: 17 }}>{c.desc}</Text>
              </View>
              <TouchableOpacity onPress={() => { dispatch({ type: 'COUPON', code: c.code }); go('cart'); }} style={st.applyBtn}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12.5 }}>APPLY</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={{ backgroundColor: C.surface, borderRadius: R.md, padding: 16, alignItems: 'center', marginBottom: 16 }}>
            <MC name="tag-outline" size={32} color={C.ink3} />
            <Text style={{ fontSize: 13.5, fontWeight: '700', color: C.ink, marginTop: 8 }}>No Public Coupons Available</Text>
            <Text style={{ fontSize: 12, color: C.ink3, textAlign: 'center', marginTop: 4 }}>
              Special promo codes issued by the store owner can be directly entered at checkout!
            </Text>
          </View>
        )}

        {top.length > 0 && (
          <>
            <Text style={[st.oTitle, { marginTop: 24 }]}>Top Discounted Products</Text>
            <View style={st.grid2}>
              {top.map((p) => (
                <ProductCard key={p.id} p={p} width={CARD_W} onPress={() => go('product', { id: p.id })} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

/* ---------------- SEARCH SCREEN ---------------- */
export function Search({ go, params }) {
  const { state } = useApp();
  const [q, setQ] = useState(params?.q || '');
  const recents = ['Cotton Kurta', 'Wireless Audio', 'Handicrafts', 'Kitchenware', 'Organic Spices', 'Footwear'];
  const res = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return state.products.filter(
      (p) => (p.title || '').toLowerCase().includes(t) || (p.cat || '').includes(t) || (p.desc && p.desc.toLowerCase().includes(t))
    );
  }, [q, state.products]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[st.header, { paddingBottom: 14 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => go(-1)} style={{ paddingRight: 10 }}>
            <MC name="chevron-left" size={26} color="#fff" />
          </TouchableOpacity>
          <View style={[st.search, { flex: 1, marginTop: 0 }]}>
            <MC name="magnify" size={18} color={C.ink3} />
            <TextInput
              autoFocus
              value={q}
              onChangeText={setQ}
              placeholder="Search products, brands and more..."
              placeholderTextColor={C.ink3}
              style={{ flex: 1, marginLeft: 10, fontSize: 14, color: C.ink, outlineStyle: 'none' }}
            />
            {!!q && (
              <TouchableOpacity onPress={() => setQ('')} style={{ padding: 4 }}>
                <MC name="close-circle" size={18} color={C.ink3} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {!q.trim() ? (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={{ fontWeight: '900', color: C.ink, marginBottom: 12, fontSize: 14 }}>Trending Searches</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {recents.map((r) => (
              <TouchableOpacity key={r} onPress={() => setQ(r)} style={st.chip}>
                <MC name="trending-up" size={14} color={C.brand} style={{ marginRight: 6 }} />
                <Text style={{ color: C.ink2, fontSize: 13, fontWeight: '600' }}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : res.length === 0 ? (
        <Empty icon="magnify-close" title="No matching items found" sub={`We could not find any products matching "${q}". Try a different keyword.`} />
      ) : (
        <FlatList
          data={res}
          keyExtractor={(i) => i.id}
          numColumns={2}
          columnWrapperStyle={{ paddingHorizontal: 16, justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingVertical: 12, gap: 12 }}
          ListHeaderComponent={
            <Text style={{ paddingHorizontal: 16, color: C.ink2, fontSize: 12.5, marginBottom: 8, fontWeight: '700' }}>
              Showing {res.length} results for "{q}"
            </Text>
          }
          renderItem={({ item }) => (
            <ProductCard p={item} width={CARD_W} sellerName={SELLERS[item.seller]?.name} onPress={() => go('product', { id: item.id })} />
          )}
        />
      )}
    </View>
  );
}

/* ---------------- CATEGORIES SCREEN (FIXED CLEAN SPACIOUS LAYOUT) ---------------- */
export function Category({ go, params }) {
  const { state } = useApp();
  const [cat, setCat] = useState(params?.cat || null);
  const [sort, setSort] = useState('pop');
  const [showF, setShowF] = useState(false);
  const [price, setPrice] = useState(null);
  const [minRate, setMinRate] = useState(0);
  const cats = [{ id: null, name: 'All Items', icon: 'view-grid-outline' }, ...CATEGORIES];

  const PRICES = [[0, 499], [500, 999], [1000, 1999], [2000, 999999]];
  const priceLabel = (r) => (r[1] > 99999 ? '₹2,000+' : `₹${r[0]} – ₹${r[1]}`);
  const activeF = (price ? 1 : 0) + (minRate ? 1 : 0);

  const list = useMemo(() => {
    let l = cat ? state.products.filter((p) => p.cat === cat) : [...state.products];
    if (price) l = l.filter((p) => p.price >= price[0] && p.price <= price[1]);
    if (minRate) l = l.filter((p) => (p.rating || 4.5) >= minRate);
    if (sort === 'low') l.sort((a, b) => a.price - b.price);
    if (sort === 'high') l.sort((a, b) => b.price - a.price);
    if (sort === 'rate') l.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return l;
  }, [cat, sort, price, minRate, state.products]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header Bar */}
      <View style={[st.header, { paddingBottom: 14 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => go(-1)} style={{ paddingRight: 10 }}>
            <MC name="chevron-left" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900' }}>
            {cat ? CATEGORIES.find((c) => c.id === cat)?.name || 'Category' : 'All Categories'}
          </Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => go('search')} style={st.iconBtn}>
            <MC name="magnify" size={19} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 1. HORIZONTAL CATEGORIES BAR (CLEAN UNCLIPPED PILLS) */}
      <View style={st.categoryScrollContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={st.catScrollContent}
        >
          {cats.map((c) => {
            const isSel = cat === c.id;
            return (
              <TouchableOpacity
                key={String(c.id)}
                onPress={() => setCat(c.id)}
                activeOpacity={0.8}
                style={[st.cleanCatChip, isSel && st.cleanCatChipActive]}
              >
                <MC name={c.icon} size={16} color={isSel ? '#fff' : C.brand} style={{ marginRight: 6 }} />
                <Text style={[st.cleanCatText, isSel && st.cleanCatTextActive]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 2. SORTING PILLS BAR */}
      <View style={st.sortScrollContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={st.sortScrollContent}
        >
          {[
            ['pop', 'Popularity', 'fire'],
            ['low', 'Price: Low to High', 'sort-ascending'],
            ['high', 'Price: High to Low', 'sort-descending'],
            ['rate', 'Top Rated', 'star-outline'],
          ].map(([k, l, ic]) => {
            const isSel = sort === k;
            return (
              <TouchableOpacity
                key={k}
                onPress={() => setSort(k)}
                style={[st.cleanSortPill, isSel && st.cleanSortPillActive]}
              >
                <MC name={ic} size={14} color={isSel ? C.brand : C.ink3} style={{ marginRight: 5 }} />
                <Text style={[st.cleanSortText, isSel && st.cleanSortTextActive]}>
                  {l}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. FILTER TOGGLE BAR */}
      <View style={st.filterBarRow}>
        <TouchableOpacity
          onPress={() => setShowF(!showF)}
          style={[st.filterBtn, activeF > 0 && { borderColor: C.brand, backgroundColor: C.brandSoft }]}
        >
          <MC name="tune-variant" size={15} color={activeF > 0 ? C.brand : C.ink} style={{ marginRight: 6 }} />
          <Text style={{ color: activeF > 0 ? C.brand : C.ink, fontWeight: '800', fontSize: 13 }}>
            Filters{activeF > 0 ? ` (${activeF})` : ''}
          </Text>
        </TouchableOpacity>
        <Text style={{ color: C.ink3, fontSize: 12.5, marginLeft: 12, fontWeight: '600' }}>
          {list.length} products
        </Text>
        {activeF > 0 && (
          <>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={() => { setPrice(null); setMinRate(0); }} style={{ padding: 4 }}>
              <Text style={{ color: C.red, fontSize: 12, fontWeight: '800' }}>Clear Filters</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Filter Dropdown Panel */}
      {showF && (
        <View style={[st.filterPanel, shadow]}>
          <Text style={st.fLabel}>PRICE RANGE</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {PRICES.map((r) => {
              const on = price && price[0] === r[0];
              return (
                <TouchableOpacity key={r[0]} onPress={() => setPrice(on ? null : r)} style={[st.fChip, on && { backgroundColor: C.brand, borderColor: C.brand }]}>
                  <Text style={{ color: on ? '#fff' : C.ink2, fontSize: 12, fontWeight: '700' }}>{priceLabel(r)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={st.fLabel}>MINIMUM RATING</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[4.5, 4.0, 3.5].map((r) => (
              <TouchableOpacity key={r} onPress={() => setMinRate(minRate === r ? 0 : r)} style={[st.fChip, minRate === r && { backgroundColor: C.brand, borderColor: C.brand }]}>
                <Text style={{ color: minRate === r ? '#fff' : C.ink2, fontSize: 12, fontWeight: '700' }}>{r}★ & above</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Products Grid */}
      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 16, justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingVertical: 12, gap: 12, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <ProductCard p={item} width={CARD_W} sellerName={SELLERS[item.seller]?.name} onPress={() => go('product', { id: item.id })} />
        )}
        ListEmptyComponent={
          <Empty
            icon="package-variant"
            title="No listings in this category yet"
            sub="Sellers are currently adding genuine items. Tap below to list the first product!"
          >
            <Btn title="List a Product" icon="plus" tone="brand" onPress={() => go('become-seller')} />
          </Empty>
        }
      />
    </View>
  );
}

export const st = StyleSheet.create({
  header: { backgroundColor: C.brand, paddingTop: 46, paddingHorizontal: 16, paddingBottom: 16 },
  headWrap: { paddingTop: 46, paddingBottom: 14 },
  brandBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8 },
  logoBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#ffffff26', alignItems: 'center', justifyContent: 'center' },
  brandTitle: { color: '#fff', fontSize: 19, fontWeight: '900', letterSpacing: -0.5 },
  explorePlus: { color: '#ffffffcc', fontSize: 10.5, fontWeight: '700' },
  plusTag: { color: '#FDE047', fontSize: 10.5, fontWeight: '900' },
  headIcoBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#ffffff26', alignItems: 'center', justifyContent: 'center' },
  deliverBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  dotSm: { position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: 4, backgroundColor: C.red },
  pageDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E5E7EB', marginHorizontal: 3 },
  gcat: { width: 76, alignItems: 'center', marginBottom: 12, paddingHorizontal: 2 },
  gcatIcon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  gcatName: { fontSize: 10.5, color: C.ink, fontWeight: '700', marginTop: 5, textAlign: 'center' },
  oTitle: { fontSize: 16, fontWeight: '900', color: C.ink, marginBottom: 12 },
  coupon: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: R.md, padding: 12, marginBottom: 10 },
  couponLeft: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' },
  applyBtn: { backgroundColor: C.brand, paddingHorizontal: 14, paddingVertical: 8, borderRadius: R.sm },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  ctaIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ffffff22', alignItems: 'center', justifyContent: 'center' },
  search: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: R.md, paddingHorizontal: 14, paddingVertical: 12, marginHorizontal: 16,
  },
  trustStrip: {
    flexDirection: 'row', backgroundColor: C.surface, marginHorizontal: 16, marginTop: 12,
    borderRadius: R.lg, paddingVertical: 12, paddingHorizontal: 8,
  },
  dealsSection: { backgroundColor: C.surface, marginHorizontal: 16, marginTop: 14, borderRadius: R.lg, paddingVertical: 12 },
  dealsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, marginBottom: 12 },
  budgetSection: { backgroundColor: C.surface, marginHorizontal: 16, marginTop: 14, borderRadius: R.lg, padding: 14 },
  budgetChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: R.pill, borderWidth: 1, borderColor: C.line, backgroundColor: C.bg },
  budgetChipOn: { backgroundColor: C.brand, borderColor: C.brand },
  budgetChipText: { color: C.ink2, fontSize: 12, fontWeight: '700' },
  banner: { height: 136, borderRadius: R.lg, padding: 16, flexDirection: 'row', alignItems: 'center' },
  bannerTag: { backgroundColor: '#ffffff26', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4, alignSelf: 'flex-start' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, gap: 12 },
  supportCta: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface,
    margin: 16, marginTop: 24, padding: 16, borderRadius: R.lg,
  },
  chip: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.line,
    backgroundColor: C.surface, borderRadius: R.pill, paddingHorizontal: 14, paddingVertical: 8,
    marginRight: 8, marginBottom: 8,
  },
  categoryScrollContainer: {
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 10,
  },
  catScrollContent: {
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  cleanCatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: R.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  cleanCatChipActive: {
    backgroundColor: C.brand,
    borderColor: C.brand,
  },
  cleanCatText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  cleanCatTextActive: {
    color: '#ffffff',
  },
  sortScrollContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  sortScrollContent: {
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  cleanSortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: R.md,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
  },
  cleanSortPillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: C.brand,
  },
  cleanSortText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  cleanSortTextActive: {
    color: C.brand,
    fontWeight: '900',
  },
  filterBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: C.bg,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#fff',
    borderRadius: R.sm,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  filterPanel: { backgroundColor: C.surface, marginHorizontal: 16, marginTop: 4, marginBottom: 8, borderRadius: R.md, padding: 14 },
  fLabel: { color: C.ink2, fontSize: 11.5, fontWeight: '900', marginBottom: 8, letterSpacing: 0.4 },
  fChip: { borderWidth: 1, borderColor: C.line, borderRadius: R.pill, paddingHorizontal: 13, paddingVertical: 7 },
  emptySection: {
    backgroundColor: C.surface, margin: 16, marginTop: 20, borderRadius: R.xl,
    padding: 24, alignItems: 'center',
  },
});
