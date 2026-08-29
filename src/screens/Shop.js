import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, FlatList, Dimensions } from 'react-native';
import { C, R, shadow, money } from '../theme';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ProductCard, Section, Badge, TemshoAssuredBadge, HumanTag, Empty, Btn, Avatar, Thumb, CountdownTimer } from '../components/UI';
import { CATEGORIES, BANNERS, SELLERS } from '../data/catalog';
import { useApp, COUPONS } from '../store';

const W = Dimensions.get('window').width;
const SCREEN_W = Math.min(W, 430);
const CARD_W = (Math.min(W, 520) - 16 * 2 - 12) / 2;

export function Home({ go }) {
  const { state, unread } = useApp();
  const [bi, setBi] = useState(0);
  const [budgetTab, setBudgetTab] = useState(499);
  const u = state.user;
  const addr = state.addresses[0];

  const deals = state.products.filter((p) => (p.mrp - p.price) / p.mrp >= 0.50).slice(0, 8);
  const budgetProducts = state.products.filter((p) => p.price <= budgetTab).slice(0, 6);
  const trending = state.products.slice(0, 10);
  const forYou = [...state.products].reverse().slice(0, 8);

  // 2 rows wali Flipkart style category circle grid
  const gridCats = [
    { id: null, name: 'ऑफर', icon: 'sale', tint: '#FFF3DF', fg: '#B8541F', to: 'offers' },
    ...CATEGORIES,
    { id: 'sell', name: 'बेचो', icon: 'storefront-plus-outline', tint: '#E3ECFF', fg: '#2247A8', to: 'become-seller' },
  ];
  const col = [];
  for (let i = 0; i < gridCats.length; i += 2) col.push(gridCats.slice(i, i + 2));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Flipkart Brand Header with Gradient */}
      <LinearGradient colors={['#1E224F', '#2B2D6E', '#3D418A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.headWrap}>
        {/* Brand Bar */}
        <View style={st.brandBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={st.logoBox}>
              <MC name="storefront" size={20} color={C.brand} />
            </View>
            <View style={{ marginLeft: 8 }}>
              <Text style={st.brandTitle}>Temsho</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={st.explorePlus}>Explore</Text>
                <Text style={st.plusTag}> Gold ⭐</Text>
              </View>
            </View>
          </View>

          {/* SuperCoins & Notification */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity onPress={() => go('wallet')} style={st.superCoinBtn}>
              <MC name="circle-multiple" size={15} color={C.accent} />
              <Text style={st.superCoinTxt}>{state.wallet || 0} Coins</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => go('notifications')} style={st.headIcoBtn}>
              <MC name="bell-outline" size={20} color="#fff" />
              {unread > 0 && <View style={st.dotSm} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Location / Deliver to Bar */}
        <TouchableOpacity onPress={() => go('addresses')} style={st.deliverBar}>
          <MC name="map-marker-radius" size={16} color="#FFD54F" />
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800', marginLeft: 6 }}>
            Deliver to {u?.name || 'Customer'} – {addr?.pin || '226010'}
          </Text>
          <Text numberOfLines={1} style={{ color: '#ffffffbb', fontSize: 11.5, marginLeft: 6, flex: 1 }}>
            {addr?.city || 'Lucknow'}
          </Text>
          <MC name="chevron-down" size={16} color="#fff" />
        </TouchableOpacity>

        {/* Flipkart Search Bar */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => go('search')} style={st.search}>
          <MC name="magnify" size={20} color={C.ink3} />
          <Text style={{ color: C.ink3, marginLeft: 10, fontSize: 13.5, flex: 1 }}>
            Search for Saree, Earbuds, Kadhai, Ghee...
          </Text>
          <MC name="microphone-outline" size={19} color={C.brand} style={{ marginHorizontal: 6 }} />
          <MC name="camera-outline" size={19} color={C.brand} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        {/* 2-Row Category Circles (Flipkart Style) */}
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

        {/* Auto Carousel Banners */}
        <View style={{ backgroundColor: C.surface, marginTop: 8, paddingVertical: 10 }}>
          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onScroll={(e) => setBi(Math.round(e.nativeEvent.contentOffset.x / (e.nativeEvent.layoutMeasurement.width || 1)))}
            scrollEventThrottle={16}
          >
            {BANNERS.map((b) => (
              <View key={b.id} style={{ width: SCREEN_W, paddingHorizontal: 12 }}>
                <LinearGradient colors={[b.from, b.to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.banner}>
                  <View style={{ flex: 1 }}>
                    <View style={st.bannerTag}><Text style={{ color: '#fff', fontSize: 9.5, fontWeight: '900' }}>{b.tag}</Text></View>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 4 }}>{b.title}</Text>
                    <Text style={{ color: '#ffffffdd', fontSize: 12, marginTop: 4, lineHeight: 17 }}>{b.sub}</Text>
                  </View>
                  <MC name={b.icon} size={48} color="#ffffff30" />
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
            {BANNERS.map((b, i) => (
              <View key={b.id} style={[st.pageDot, i === bi && { width: 18, backgroundColor: C.brand }]} />
            ))}
          </View>
        </View>

        {/* Trust Badges Bar */}
        <View style={st.trustStrip}>
          {[['account-check-outline', '100% Insaan', 'Zero Bots'],
            ['backup-restore', '7 Din Return', 'Free Pickup'],
            ['cash-check', 'Cash on Delivery', 'Direct Seller'],
            ['truck-fast-outline', 'Free Shipping', 'Across India']].map(([ic, t, s]) => (
            <View key={t} style={{ alignItems: 'center', flex: 1 }}>
              <MC name={ic} size={20} color={C.brand} />
              <Text style={{ fontSize: 11, color: C.ink, fontWeight: '800', marginTop: 3 }}>{t}</Text>
              <Text style={{ fontSize: 9.5, color: C.ink3, marginTop: 1 }}>{s}</Text>
            </View>
          ))}
        </View>

        {/* Flipkart "Deal of the Day" / Crazy Deals */}
        <View style={[st.dealsSection, shadow]}>
          <View style={st.dealsHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MC name="flash" size={22} color="#C0392B" />
              <Text style={{ color: C.ink, fontSize: 17, fontWeight: '900', marginLeft: 4 }}>Dhamaka Deals</Text>
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

        {/* Budget Store (Under ₹199, ₹499, ₹999) */}
        <View style={[st.budgetSection, shadow]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View>
              <Text style={{ fontSize: 16.5, fontWeight: '900', color: C.ink }}>Pocket-Friendly Bazaar 🪙</Text>
              <Text style={{ fontSize: 11.5, color: C.ink3, marginTop: 1 }}>Best quality items at lowest prices</Text>
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

        {/* Personalized "Pick up where you left" */}
        <View style={{ backgroundColor: '#EDEEFA', marginTop: 12, paddingVertical: 16 }}>
          <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
            <Text style={{ fontSize: 17, fontWeight: '900', color: C.ink }}>
              {u?.name || 'Aapke'} Liye Chuna Hua ✨
            </Text>
            <Text style={{ fontSize: 11.5, color: C.ink3, marginTop: 2 }}>Based on your interests</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {forYou.map((p) => (
              <TouchableOpacity key={p.id} onPress={() => go('product', { id: p.id })} style={st.miniCard}>
                <Thumb img={p.img} title={p.title} tint={p.tint} size={106} radius={R.sm} />
                <Text numberOfLines={2} style={{ fontSize: 11.5, color: C.ink, marginTop: 7, lineHeight: 15, fontWeight: '600' }}>
                  {p.title}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 3 }}>
                  <Text style={{ fontSize: 13.5, color: C.ink, fontWeight: '900' }}>{money(p.price)}</Text>
                  <Text style={{ fontSize: 10.5, color: C.green, fontWeight: '800', marginLeft: 4 }}>
                    {Math.round(((p.mrp - p.price) / p.mrp) * 100)}% off
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Top Verified Sellers / Kaarigars */}
        <Section title="Top Verified Kaarigar & Sellers" subtitle="Seedha factory aur bunkar se" action="Sabhi Dukanein" onAction={() => go('category', { cat: null })}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {Object.values(SELLERS).map((s) => (
              <View key={s.id} style={[st.sellerCard, shadow]}>
                <Avatar name={s.name} hue={s.hue} size={46} />
                <Text numberOfLines={1} style={{ fontWeight: '900', color: C.ink, fontSize: 13.5, marginTop: 8 }}>{s.name}</Text>
                <Text style={{ color: C.ink3, fontSize: 11, marginTop: 2 }}>{s.city}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                  <MC name="star" size={12} color={C.accent} />
                  <Text style={{ color: C.ink, fontWeight: '800', fontSize: 11.5, marginLeft: 3 }}>{s.rating}</Text>
                  <Text style={{ color: C.ink3, fontSize: 11, marginLeft: 4 }}>({(s.orders / 1000).toFixed(1)}k orders)</Text>
                </View>
                <View style={{ marginTop: 8 }}><HumanTag small /></View>
              </View>
            ))}
          </ScrollView>
        </Section>

        {/* 2-Column Main Product Grid */}
        <Section title="Trending Products" subtitle="Poore Bharat me sabse zyada bikne wale" action="Aur Dekhein" onAction={() => go('category', { cat: null })}>
          <View style={st.grid}>
            {trending.map((p) => (
              <ProductCard key={p.id} p={p} width={CARD_W} sellerName={SELLERS[p.seller]?.name} onPress={() => go('product', { id: p.id })} />
            ))}
          </View>
        </Section>

        {/* 24x7 Human Support CTA */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => go('support')} style={[st.supportCta, shadow]}>
          <View style={st.ctaIcon}><MC name="headset" size={22} color={C.brand} /></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: C.ink, fontWeight: '900', fontSize: 14.5 }}>Kuch poochhna hai? Insaan se baat karein</Text>
            <Text style={{ color: C.ink2, fontSize: 12, marginTop: 3 }}>24x7 Real Human Support · Koi Chatbot Nahi</Text>
          </View>
          <MC name="chevron-right" size={22} color={C.brand} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* ---------------- बेहतरीन ऑफर ---------------- */
export function Offers({ go }) {
  const { state, dispatch } = useApp();
  const byOff = [...state.products].sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp);
  const top = byOff.slice(0, 6);
  const under499 = state.products.filter((p) => p.price <= 499);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <LinearGradient colors={['#B8541F', '#F5A623']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: 46, paddingHorizontal: 16, paddingBottom: 18 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>बेहतरीन ऑफर & Coupons 🔥</Text>
        <Text style={{ color: '#ffffffdd', fontSize: 12.5, marginTop: 4 }}>कूपन, डील और सबसे बड़ी छूट — एक जगह</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={st.oTitle}>Aapke Coupons</Text>
        {COUPONS.map((c) => (
          <View key={c.code} style={[st.coupon, shadow]}>
            <View style={st.couponLeft}>
              <MC name="ticket-percent-outline" size={24} color={C.brand} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: '900', color: C.ink, fontSize: 15, letterSpacing: 1 }}>{c.code}</Text>
              <Text style={{ color: C.ink2, fontSize: 12, marginTop: 3, lineHeight: 17 }}>{c.desc}</Text>
            </View>
            <TouchableOpacity onPress={() => { dispatch({ type: 'COUPON', code: c.code }); go('cart'); }} style={st.applyBtn}>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12.5 }}>LAGAYEIN</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={[st.oTitle, { marginTop: 24 }]}>Sabse Badi Chhoot (Up to 70% Off)</Text>
        <View style={st.grid2}>
          {top.map((p) => (
            <ProductCard key={p.id} p={p} width={CARD_W} onPress={() => go('product', { id: p.id })} />
          ))}
        </View>

        <Text style={[st.oTitle, { marginTop: 24 }]}>₹499 Se Kam Me</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {under499.map((p) => (
            <View key={p.id} style={{ marginRight: 12 }}>
              <ProductCard p={p} width={150} onPress={() => go('product', { id: p.id })} />
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity onPress={() => go('wallet')} style={[st.refer, shadow]}>
          <MC name="gift-outline" size={24} color={C.brand} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: C.ink, fontWeight: '900', fontSize: 14 }}>Dost ko bulayein, ₹100 payein</Text>
            <Text style={{ color: C.ink2, fontSize: 12, marginTop: 2 }}>Aapka referral code share karein</Text>
          </View>
          <MC name="chevron-right" size={20} color={C.ink3} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export function Search({ go, params }) {
  const { state } = useApp();
  const [q, setQ] = useState(params?.q || '');
  const recents = ['Banarasi Silk Saree', 'Wireless Earbuds', 'Tri-Ply Kadhai', 'Kashmiri Kesar', 'Ghani Coconut Oil', 'Blue Pottery Vase'];
  const res = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return state.products.filter(
      (p) => p.title.toLowerCase().includes(t) || p.cat.includes(t) || (p.desc && p.desc.toLowerCase().includes(t))
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
              placeholder="Kya dhoondh rahe hain?"
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
        <Empty icon="magnify-close" title="Kuch nahi mila" sub={`"${q}" ke liye koi product nahi hai. Doosre shabd try karein.`} />
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

export function Category({ go, params }) {
  const { state } = useApp();
  const [cat, setCat] = useState(params?.cat || null);
  const [sort, setSort] = useState('pop');
  const [showF, setShowF] = useState(false);
  const [price, setPrice] = useState(null);
  const [minRate, setMinRate] = useState(0);
  const cats = [{ id: null, name: 'Sabhi', icon: 'view-grid-outline' }, ...CATEGORIES];

  const PRICES = [[0, 499], [500, 999], [1000, 1999], [2000, 999999]];
  const priceLabel = (r) => (r[1] > 99999 ? '₹2000+' : `₹${r[0]}–${r[1]}`);
  const activeF = (price ? 1 : 0) + (minRate ? 1 : 0);

  const list = useMemo(() => {
    let l = cat ? state.products.filter((p) => p.cat === cat) : [...state.products];
    if (price) l = l.filter((p) => p.price >= price[0] && p.price <= price[1]);
    if (minRate) l = l.filter((p) => p.rating >= minRate);
    if (sort === 'low') l.sort((a, b) => a.price - b.price);
    if (sort === 'high') l.sort((a, b) => b.price - a.price);
    if (sort === 'rate') l.sort((a, b) => b.rating - a.rating);
    if (sort === 'disc') l.sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp);
    return l;
  }, [cat, sort, price, minRate, state.products]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[st.header, { paddingBottom: 12 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => go(-1)} style={{ paddingRight: 10 }}>
            <MC name="chevron-left" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 16.5, fontWeight: '900' }}>
            {cat ? CATEGORIES.find((c) => c.id === cat)?.name : 'All Categories'}
          </Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => go('search')} style={st.iconBtn}><MC name="magnify" size={18} color="#fff" /></TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 46, flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' }}>
        {cats.map((c) => (
          <TouchableOpacity
            key={String(c.id)}
            onPress={() => setCat(c.id)}
            style={[st.chip, { flexDirection: 'row', alignItems: 'center' }, cat === c.id && { backgroundColor: C.brand, borderColor: C.brand }]}
          >
            <MC name={c.icon} size={14} color={cat === c.id ? '#fff' : C.ink2} style={{ marginRight: 5 }} />
            <Text style={{ color: cat === c.id ? '#fff' : C.ink2, fontSize: 12.5, fontWeight: '700' }}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 42, flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 12, alignItems: 'center' }}>
        {[['pop', 'Popularity'], ['low', 'Price: Low to High'], ['high', 'Price: High to Low'], ['rate', 'Top Rated'], ['disc', 'Discount']].map(([k, l]) => (
          <TouchableOpacity key={k} onPress={() => setSort(k)} style={[st.sortChip, sort === k && { backgroundColor: C.brandSoft, borderColor: C.brand }]}>
            <Text style={{ color: sort === k ? C.brand : C.ink2, fontSize: 12, fontWeight: '800' }}>{l}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10 }}>
        <TouchableOpacity onPress={() => setShowF(!showF)} style={[st.filterBtn, { flexDirection: 'row', alignItems: 'center' }, activeF > 0 && { borderColor: C.brand, backgroundColor: C.brandSoft }]}>
          <MC name="tune-variant" size={14} color={activeF > 0 ? C.brand : C.ink2} style={{ marginRight: 5 }} />
          <Text style={{ color: activeF > 0 ? C.brand : C.ink2, fontWeight: '800', fontSize: 12.5 }}>
            Filters{activeF > 0 ? ` (${activeF})` : ''}
          </Text>
        </TouchableOpacity>
        <Text style={{ color: C.ink3, fontSize: 12, marginLeft: 12 }}>{list.length} products</Text>
        {activeF > 0 && (
          <>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={() => { setPrice(null); setMinRate(0); }}>
              <Text style={{ color: C.red, fontSize: 12, fontWeight: '800' }}>Clear Filters</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {showF && (
        <View style={st.filterPanel}>
          <Text style={st.fLabel}>Price Range</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {PRICES.map((r) => {
              const on = price && price[0] === r[0];
              return (
                <TouchableOpacity key={r[0]} onPress={() => setPrice(on ? null : r)} style={[st.fChip, on && { backgroundColor: C.brand, borderColor: C.brand }]}>
                  <Text style={{ color: on ? '#fff' : C.ink2, fontSize: 12, fontWeight: '600' }}>{priceLabel(r)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={st.fLabel}>Customer Rating</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[4.5, 4.0, 3.5].map((r) => (
              <TouchableOpacity key={r} onPress={() => setMinRate(minRate === r ? 0 : r)} style={[st.fChip, minRate === r && { backgroundColor: C.brand, borderColor: C.brand }]}>
                <Text style={{ color: minRate === r ? '#fff' : C.ink2, fontSize: 12, fontWeight: '600' }}>{r}★ & above</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 16, justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingVertical: 12, gap: 12, paddingBottom: 30 }}
        renderItem={({ item }) => (
          <ProductCard p={item} width={CARD_W} sellerName={SELLERS[item.seller]?.name} onPress={() => go('product', { id: item.id })} />
        )}
        ListEmptyComponent={<Empty icon="package-variant" title="Is category me abhi kuch nahi" sub="Jaldi hi naye products aa rahe hain." />}
      />
    </View>
  );
}

export const st = StyleSheet.create({
  header: { backgroundColor: C.brand, paddingTop: 44, paddingHorizontal: 16, paddingBottom: 16 },
  headWrap: { paddingTop: 44, paddingBottom: 14 },
  brandBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8 },
  logoBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  brandTitle: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  explorePlus: { color: '#ffffffaa', fontSize: 10.5, fontWeight: '700' },
  plusTag: { color: '#FFD54F', fontSize: 10.5, fontWeight: '900' },
  superCoinBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff1f', paddingHorizontal: 9, paddingVertical: 5, borderRadius: R.pill },
  superCoinTxt: { color: '#fff', fontSize: 11.5, fontWeight: '800', marginLeft: 4 },
  headIcoBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#ffffff1f', alignItems: 'center', justifyContent: 'center' },
  deliverBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  dotSm: { position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: 4, backgroundColor: C.red },
  pageDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D6D9E4', marginHorizontal: 3 },
  gcat: { width: 76, alignItems: 'center', marginBottom: 12, paddingHorizontal: 2 },
  gcatIcon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  gcatName: { fontSize: 10.5, color: C.ink, fontWeight: '700', marginTop: 5, textAlign: 'center' },
  miniCard: { width: 120, backgroundColor: C.surface, borderRadius: R.md, padding: 8, marginRight: 10 },
  oTitle: { fontSize: 16, fontWeight: '900', color: C.ink, marginBottom: 12 },
  coupon: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: R.md, padding: 12, marginBottom: 10 },
  couponLeft: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' },
  applyBtn: { backgroundColor: C.brand, paddingHorizontal: 14, paddingVertical: 8, borderRadius: R.sm },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  refer: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: R.lg, padding: 16, marginTop: 24 },
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
  sellerCard: { width: 154, backgroundColor: C.surface, borderRadius: R.lg, padding: 14, marginRight: 12 },
  supportCta: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface,
    margin: 16, marginTop: 24, padding: 16, borderRadius: R.lg,
  },
  chip: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.line,
    backgroundColor: C.surface, borderRadius: R.pill, paddingHorizontal: 14, paddingVertical: 8,
    marginRight: 8, marginBottom: 8,
  },
  filterBtn: { borderWidth: 1.5, borderColor: C.line, backgroundColor: C.surface, borderRadius: R.sm, paddingHorizontal: 12, paddingVertical: 7 },
  filterPanel: { backgroundColor: C.surface, marginHorizontal: 16, marginTop: 10, borderRadius: R.md, padding: 14 },
  fLabel: { color: C.ink2, fontSize: 11.5, fontWeight: '900', marginBottom: 8, letterSpacing: 0.4 },
  fChip: { borderWidth: 1, borderColor: C.line, borderRadius: R.pill, paddingHorizontal: 13, paddingVertical: 7 },
  sortChip: {
    borderWidth: 1, borderColor: C.line, backgroundColor: C.surface, borderRadius: R.sm,
    paddingHorizontal: 12, paddingVertical: 6, marginRight: 8,
  },
});
