import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Share, Linking, Image } from 'react-native';
import { C, R, shadow, money } from '../theme';
import { MaterialCommunityIcons as MC } from '@expo/vector-icons';
import { Btn, Badge, TemshoAssuredBadge, HumanTag, Stars, Thumb, Empty, ProductCard, Avatar, RatingsBreakdown, BankOffers, SpecTable } from '../components/UI';
import { SELLERS } from '../data/catalog';
import { useApp } from '../store';
import { checkPincodeServiceability } from '../lib/shiprocket';
import * as cloud from '../lib/cloud';

export function Product({ go, params }) {
  const { byId, dispatch, state, cartCount } = useApp();
  const p = byId(params.id);

  if (!p) return <Empty icon="package-variant-closed-remove" title="Product Not Found" sub="This listing may have been removed or updated." />;

  const rawImages = (p.images && p.images.length > 0) ? p.images : (p.img ? [p.img] : []);
  const allImages = rawImages.map((im) => (typeof im === 'object' && im !== null && im.uri ? im.uri : im)).filter(Boolean);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const currentImg = allImages[activeImgIdx] || p.img;

  const isAgeBased = p.variantType === 'age' ||
    (p.sizes && p.sizes.some((s) => typeof s === 'string' && (s.includes('Y') || s.includes('M') || s.includes('Year') || s.includes('Month')))) ||
    (p.cat === 'kids' && p.variantType !== 'size');

  const isSizeBased = p.variantType === 'size' ||
    (p.sizes && p.sizes.length > 0 && !isAgeBased) ||
    (p.cat === 'fashion' && p.variantType !== 'none') ||
    (p.cat === 'footwear' && p.variantType !== 'none');

  const defaultVariants = isAgeBased
    ? ['0-6 Months', '6-12 Months', '1-2 Years', '2-3 Years', '3-4 Years', '4-5 Years', '5-6 Years']
    : (p.cat === 'footwear' ? ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'] : ['S', 'M', 'L', 'XL', 'XXL']);

  const availableVariants = (p.sizes && p.sizes.length > 0) ? p.sizes : defaultVariants;
  const showVariants = (p.variantType && p.variantType !== 'none') || isAgeBased || isSizeBased;

  const [selectedVariant, setSelectedVariant] = useState(availableVariants[0] || (isAgeBased ? '1-2 Years' : 'M'));
  const [pinInput, setPinInput] = useState(state.addresses[0]?.pin || '');
  const [pinChecked, setPinChecked] = useState(!!state.addresses[0]?.pin);
  const [reviews, setReviews] = useState([]);
  const [writingReview, setWritingReview] = useState(false);
  const [myRating, setMyRating] = useState(5);
  const [myReviewText, setMyReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Dispatch VIEW_PRODUCT for Recently Viewed tracking
  useEffect(() => {
    if (p?.id) {
      dispatch({ type: 'VIEW_PRODUCT', id: p.id });
    }
  }, [p?.id]);

  // Load real reviews from Supabase
  useEffect(() => {
    if (p?.id && cloud.cloudOn()) {
      cloud.pullReviews(p.id).then((cloudRevs) => {
        if (cloudRevs && cloudRevs.length > 0) {
          setReviews(cloudRevs.map((r) => ({
            n: r.users?.name || 'Verified Customer',
            c: r.users?.city || 'India',
            r: Number(r.rating) || 5,
            t: r.text,
            v: true,
            date: 'Verified Purchase',
          })));
        }
      }).catch(() => {});
    }
  }, [p?.id]);

  const s = SELLERS[p.seller] || {
    name: p.sellerName || 'Verified Independent Seller',
    city: p.sellerCity || 'India',
    rating: 0,
    hue: C.brand,
    orders: 0,
    since: 2026,
    phone: p.sellerPhone || '9044468663',
  };

  const mrp = Number(p.mrp) || Number(p.price) || 0;
  const off = mrp > p.price ? Math.round(((mrp - p.price) / mrp) * 100) : 0;
  const wished = state.wishlist.includes(p.id);
  const related = (state.products || []).filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 6);
  const pinResult = checkPincodeServiceability(pinInput);

  const handleShareProduct = () => {
    const shareText = `🛍️ *${p.title}* on Temsho!\n💰 Price: ₹${p.price} (MRP: ₹${mrp} - ${off}% OFF)\n📦 Direct from Verified Seller: ${s.name}\n\nBuy directly: https://temsho.in/product/${p.id}`;
    Share.share({ message: shareText }).catch(() => {});
  };

  const submitReview = () => {
    if (!myReviewText.trim()) return;
    const newRev = {
      n: state.user?.name || 'Verified Customer',
      c: state.user?.city || 'India',
      r: myRating,
      t: myReviewText.trim(),
      v: true,
      date: 'Just now',
    };
    setReviews([newRev, ...reviews]);
    if (cloud.cloudOn()) {
      cloud.pushReview(p.id, state.user?.cloudId || null, myRating, myReviewText.trim()).catch(() => {});
    }
    setMyReviewText('');
    setWritingReview(false);
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 2500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Floating Top Nav */}
      <View style={sx.topBar}>
        <TouchableOpacity onPress={() => go(-1)} style={sx.round}><MC name="chevron-left" size={24} color={C.ink} /></TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={handleShareProduct} style={sx.round}>
          <MC name="share-variant-outline" size={19} color={C.ink} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => dispatch({ type: 'WISH', id: p.id })} style={[sx.round, { marginLeft: 8 }]}>
          <MC name={wished ? 'heart' : 'heart-outline'} size={19} color={wished ? C.red : C.ink} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => go('cart')} style={[sx.round, { marginLeft: 8 }]}>
          <MC name="cart-outline" size={19} color={C.ink} />
          {cartCount > 0 && <View style={sx.cnt}><Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>{cartCount}</Text></View>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {/* Main Product Image Hero with Gallery Count */}
        <View style={{ height: 340, backgroundColor: '#F3F4F6', position: 'relative' }}>
          <Thumb img={currentImg} title={p.title} tint={p.tint} size={340} radius={0} />
          {allImages.length > 1 && (
            <View style={sx.imgCountBadge}>
              <MC name="image-multiple" size={12} color="#fff" style={{ marginRight: 4 }} />
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>
                {activeImgIdx + 1} / {allImages.length}
              </Text>
            </View>
          )}
          {p.video && (
            <View style={sx.videoBadge}>
              <MC name="video" size={13} color="#fff" style={{ marginRight: 4 }} />
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>Video Included</Text>
            </View>
          )}
        </View>

        {/* Thumbnail Gallery Strip for Viewing All Uploaded Photos */}
        {allImages.length > 1 && (
          <View style={sx.thumbStrip}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
              {allImages.map((im, idx) => {
                const on = activeImgIdx === idx;
                return (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.85}
                    onPress={() => setActiveImgIdx(idx)}
                    style={[sx.thumbStripItem, on && sx.thumbStripItemActive]}
                  >
                    <Image source={typeof im === 'string' ? { uri: im } : im} style={{ width: '100%', height: '100%', borderRadius: 6 }} resizeMode="cover" />
                    {idx === 0 && (
                      <View style={sx.mainCoverPill}>
                        <Text style={{ color: '#fff', fontSize: 7.5, fontWeight: '900' }}>MAIN</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={sx.sheet}>
          {/* Tags & Assured Badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {p.tags?.map((t) => <Badge key={t} text={t} tone="accent" small />)}
            </View>
            <TemshoAssuredBadge />
          </View>

          {/* Title */}
          <Text style={{ fontSize: 18, fontWeight: '800', color: C.ink, lineHeight: 25 }}>{p.title}</Text>

          {/* Ratings Summary */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Stars value={p.rating || 4.8} count={(p.ratingCount || 1) + ' ratings'} size={11} />
            <Text style={{ color: C.ink3, fontSize: 11, marginLeft: 8 }}>· {reviews.length} Customer Reviews</Text>
          </View>

          {/* Pricing & Discount */}
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 12 }}>
            <Text style={{ fontSize: 28, fontWeight: '900', color: C.ink }}>{money(p.price)}</Text>
            {mrp > p.price && (
              <Text style={{ color: C.ink3, fontSize: 14, textDecorationLine: 'line-through', marginLeft: 10 }}>{money(mrp)}</Text>
            )}
            {off > 0 && (
              <View style={{ marginLeft: 10 }}><Badge text={`${off}% OFF`} tone="green" /></View>
            )}
          </View>
          {mrp > p.price && (
            <Text style={{ color: C.green, fontSize: 13, fontWeight: '800', marginTop: 3 }}>
              You save {money(mrp - p.price)} on this item!
            </Text>
          )}

          {/* Bank & Promotional Offers */}
          <BankOffers />

          {/* Size / Age (Years / Months) Selector */}
          {showVariants && availableVariants.length > 0 && (
            <View style={{ marginTop: 18 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={sx.h2}>
                  {isAgeBased ? 'Select Age (Years / Months)' : 'Select Size'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MC name={isAgeBased ? 'baby-face-outline' : 'ruler'} size={14} color={C.brand} />
                  <Text style={{ color: C.brand, fontSize: 12, fontWeight: '700', marginLeft: 4 }}>
                    {isAgeBased ? 'Age Guide' : 'Size Guide'}
                  </Text>
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {availableVariants.map((z) => {
                    const on = selectedVariant === z;
                    return (
                      <TouchableOpacity
                        key={z}
                        onPress={() => setSelectedVariant(z)}
                        style={[
                          sx.size,
                          on && sx.sizeOn,
                          (isAgeBased || z.length > 3) && { minWidth: 70, paddingHorizontal: 12 },
                        ]}
                      >
                        <Text style={{ color: on ? C.brand : C.ink, fontWeight: '800', fontSize: (isAgeBased || z.length > 3) ? 12 : 13 }}>
                          {z}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
              <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 6 }}>
                Selected: <Text style={{ color: C.brand, fontWeight: '800' }}>{selectedVariant}</Text>
              </Text>
            </View>
          )}

          {/* Pincode & Delivery Checker */}
          <View style={sx.pinBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={sx.h2}>Delivery Options</Text>
              <MC name="truck-fast-outline" size={18} color={C.brand} />
            </View>
            <View style={sx.pinRow}>
              <TextInput
                value={pinInput}
                onChangeText={setPinInput}
                placeholder="6-digit PIN code"
                keyboardType="number-pad"
                maxLength={6}
                style={sx.pinInput}
              />
              <TouchableOpacity onPress={() => setPinChecked(true)} style={sx.pinBtn}>
                <Text style={{ color: C.brand, fontWeight: '800', fontSize: 12.5 }}>Check</Text>
              </TouchableOpacity>
            </View>

            {pinChecked && pinResult.serviceable && (
              <View style={{ marginTop: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MC name="check-circle" size={15} color={C.green} />
                  <Text style={{ color: C.ink, fontSize: 12.5, fontWeight: '800', marginLeft: 6 }}>
                    Delivery {pinResult.etaText} ({pinResult.city}, {pinResult.state})
                  </Text>
                </View>
                <Text style={{ color: C.green, fontSize: 11.5, fontWeight: '700', marginTop: 3, marginLeft: 21 }}>
                  FREE Delivery on orders above ₹499 · Cash on Delivery available
                </Text>
              </View>
            )}
          </View>

          {/* Highlights */}
          <Text style={[sx.h2, { marginTop: 22 }]}>Product Highlights</Text>
          <View style={{ marginTop: 8 }}>
            {(p.highlights || [
              '100% Genuine & Quality Checked',
              '7 Days Replacement / Return Policy',
              'Cash on Delivery Available',
              'Direct from Verified Indian Producer',
            ]).map((h, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <View style={sx.bullet} />
                <Text style={{ color: C.ink2, fontSize: 12.5, marginLeft: 8 }}>{h}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          {!!p.desc && (
            <>
              <Text style={[sx.h2, { marginTop: 18 }]}>Product Description</Text>
              <Text style={{ color: C.ink2, fontSize: 13, lineHeight: 20, marginTop: 6 }}>{p.desc}</Text>
            </>
          )}

          {/* Specifications Table */}
          {p.specs && Object.keys(p.specs).length > 0 && (
            <>
              <Text style={[sx.h2, { marginTop: 20 }]}>Specifications</Text>
              <SpecTable specs={p.specs} />
            </>
          )}

          {/* Seller Profile Card with Direct Storefront Link */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => go('seller-storefront', { sellerKey: p.seller, phone: s.phone, name: s.name, city: s.city })}
            style={[sx.sellerBox, shadow]}
          >
            <Avatar name={s.name} hue={s.hue || C.brand} size={48} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: '900', color: C.ink, fontSize: 14.5 }}>{s.name}</Text>
              <Text style={{ color: C.ink3, fontSize: 11.5, marginTop: 1 }}>{s.city} · Verified Seller · Tap to visit shop</Text>
              <View style={{ marginTop: 6, flexDirection: 'row', gap: 6 }}>
                <HumanTag small />
                <Badge text="VISIT SHOP →" tone="brand" small />
              </View>
            </View>
            <MC name="chevron-right" size={22} color={C.ink3} />
          </TouchableOpacity>

          {/* Ratings & Customer Reviews Breakdown */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
            <Text style={sx.h2}>Ratings & Reviews</Text>
            <TouchableOpacity onPress={() => setWritingReview(!writingReview)} style={sx.writeRevBtn}>
              <MC name="pencil-outline" size={14} color={C.brand} />
              <Text style={{ color: C.brand, fontWeight: '800', fontSize: 12, marginLeft: 4 }}>Write a Review</Text>
            </TouchableOpacity>
          </View>

          {reviewSubmitted && (
            <View style={sx.revThanks}>
              <MC name="check-circle" size={16} color={C.green} />
              <Text style={{ color: '#059669', fontWeight: '800', fontSize: 12, marginLeft: 6 }}>
                Thank you! Your verified review has been published.
              </Text>
            </View>
          )}

          {writingReview && (
            <View style={[sx.writeCard, shadow]}>
              <Text style={{ fontWeight: '800', color: C.ink, fontSize: 13.5, marginBottom: 8 }}>Your Rating</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setMyRating(star)}>
                    <MC name="star" size={26} color={star <= myRating ? C.accent : C.line} />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                placeholder="Share your genuine experience with this product..."
                placeholderTextColor={C.ink3}
                multiline
                value={myReviewText}
                onChangeText={setMyReviewText}
                style={sx.revInput}
              />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                <Btn title="Cancel" tone="ghost" style={{ flex: 1 }} onPress={() => setWritingReview(false)} />
                <Btn title="Submit Review" tone="green" style={{ flex: 1 }} disabled={!myReviewText.trim()} onPress={submitReview} />
              </View>
            </View>
          )}

          {reviews.length > 0 ? (
            <>
              <RatingsBreakdown rating={p.rating || (reviews.reduce((acc, r) => acc + (r.r || 5), 0) / reviews.length)} totalCount={reviews.length} />
              {reviews.map((r, i) => (
                <View key={i} style={sx.review}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar name={r.n} hue={C.brand} size={28} />
                    <View style={{ marginLeft: 8 }}>
                      <Text style={{ fontWeight: '800', color: C.ink, fontSize: 13 }}>{r.n}</Text>
                      <Text style={{ color: C.ink3, fontSize: 10.5 }}>{r.c} · {r.date}</Text>
                    </View>
                    <View style={{ flex: 1 }} />
                    <View style={{ flexDirection: 'row' }}>
                      {[...Array(5)].map((_, k) => (
                        <MC key={k} name="star" size={12} color={k < r.r ? C.accent : C.line} />
                      ))}
                    </View>
                  </View>
                  <Text style={{ color: C.ink2, fontSize: 12.5, lineHeight: 18, marginTop: 6 }}>{r.t}</Text>
                  {r.v && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                      <MC name="check-decagram" size={13} color={C.green} />
                      <Text style={{ color: C.green, fontSize: 11, fontWeight: '800', marginLeft: 4 }}>Verified Buyer</Text>
                    </View>
                  )}
                </View>
              ))}
            </>
          ) : (
            <View style={{ backgroundColor: C.bg, borderRadius: R.md, padding: 16, marginTop: 12, alignItems: 'center' }}>
              <MC name="star-outline" size={24} color={C.ink3} />
              <Text style={{ fontWeight: '700', color: C.ink, fontSize: 13, marginTop: 6 }}>No Reviews Yet</Text>
              <Text style={{ color: C.ink3, fontSize: 11.5, textAlign: 'center', marginTop: 2 }}>
                Be the first verified customer to share a rating and review for this product!
              </Text>
            </View>
          )}

          {/* Similar Products */}
          {related.length > 0 && (
            <>
              <Text style={[sx.h2, { marginTop: 22, marginBottom: 10 }]}>Similar Products</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {related.map((x) => (
                  <View key={x.id} style={{ marginRight: 12 }}>
                    <ProductCard p={x} width={150} onPress={() => go('product', { id: x.id })} />
                  </View>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={sx.bottomBar}>
        <Btn
          title="Add to Cart"
          icon="cart-plus"
          tone="ghost"
          style={{ flex: 1, marginRight: 10 }}
          onPress={() => {
            dispatch({ type: 'ADD_CART', id: p.id, size: showVariants ? selectedVariant : null });
            go('cart');
          }}
        />
        <Btn
          title="Buy Now"
          icon="lightning-bolt"
          tone="accent"
          style={{ flex: 1.1 }}
          onPress={() => {
            dispatch({ type: 'ADD_CART', id: p.id, size: showVariants ? selectedVariant : null });
            go('checkout');
          }}
        />
      </View>
    </View>
  );
}

export function Cart({ go }) {
  const { cartLines, dispatch, subtotal, saved, delivery, total, couponOff, coupon } = useApp();
  if (cartLines.length === 0)
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <Header title="My Cart" go={go} />
        <Empty icon="cart-outline" title="Your cart is currently empty" sub="Explore genuine items and add them to your cart to begin shopping.">
          <Btn title="Start Shopping" onPress={() => go('home')} />
        </Empty>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title={`My Cart (${cartLines.length} items)`} go={go} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 130 }}>
        {/* Safe & Secure banner */}
        <View style={sx.safeBanner}>
          <MC name="shield-check" size={17} color={C.green} />
          <Text style={{ flex: 1, marginLeft: 8, color: '#059669', fontSize: 11.5, fontWeight: '700' }}>
            100% Safe & Secure Payments · Direct to Verified Seller
          </Text>
        </View>

        {cartLines.map((l, idx) => (
          <View key={l.key || (l.id + '-' + idx)} style={[sx.cartRow, shadow]}>
            <View style={{ width: 80 }}>
              <Thumb img={l.product.img} title={l.product.title} tint={l.product.tint} size={80} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text numberOfLines={2} style={{ color: C.ink, fontWeight: '700', fontSize: 13 }}>{l.product.title}</Text>
              
              {/* Selected Size / Age Badge */}
              {!!l.size && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Badge
                    text={l.size.includes('Year') || l.size.includes('Month') || l.size.includes('Y') ? `Age: ${l.size}` : `Size: ${l.size}`}
                    tone="brand"
                    small
                  />
                </View>
              )}

              <Text style={{ color: C.ink3, fontSize: 11, marginTop: 2 }}>{SELLERS[l.product.seller]?.name || 'Verified Seller'}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                <Text style={{ fontWeight: '900', color: C.ink, fontSize: 15.5 }}>{money(l.product.price)}</Text>
                {l.product.mrp > l.product.price && (
                  <Text style={{ color: C.ink3, fontSize: 11, textDecorationLine: 'line-through', marginLeft: 6 }}>{money(l.product.mrp)}</Text>
                )}
                {l.product.mrp > l.product.price && (
                  <Text style={{ color: C.green, fontSize: 11, fontWeight: '800', marginLeft: 6 }}>
                    {Math.round(((l.product.mrp - l.product.price) / l.product.mrp) * 100)}% off
                  </Text>
                )}
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <View style={sx.stepper}>
                  <TouchableOpacity onPress={() => dispatch({ type: 'QTY', id: l.id, key: l.key, size: l.size, qty: l.qty - 1 })} style={sx.step}><MC name="minus" size={15} color={C.brand} /></TouchableOpacity>
                  <Text style={{ width: 30, textAlign: 'center', fontWeight: '800', color: C.ink }}>{l.qty}</Text>
                  <TouchableOpacity onPress={() => dispatch({ type: 'QTY', id: l.id, key: l.key, size: l.size, qty: l.qty + 1 })} style={sx.step}><MC name="plus" size={15} color={C.brand} /></TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => dispatch({ type: 'RM_CART', id: l.id, key: l.key, size: l.size })} style={{ marginLeft: 16 }}>
                  <Text style={{ color: C.red, fontWeight: '800', fontSize: 12.5 }}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        <Bill subtotal={subtotal} saved={saved} delivery={delivery} total={total} couponOff={couponOff} couponCode={coupon?.code} />
      </ScrollView>

      {/* Checkout Bottom Bar */}
      <View style={sx.bottomBar}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.ink3, fontSize: 11, fontWeight: '600' }}>Total Amount</Text>
          <Text style={{ color: C.ink, fontWeight: '900', fontSize: 20 }}>{money(total)}</Text>
        </View>
        <Btn title="Proceed to Checkout" icon="arrow-right-bold" tone="accent" style={{ flex: 1.3 }} onPress={() => go('checkout')} />
      </View>
    </View>
  );
}

export function Bill({ subtotal, saved, delivery, total, couponOff = 0, couponCode }) {
  const Row = ({ l, v, c, b }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 9 }}>
      <Text style={{ color: b ? C.ink : C.ink2, fontSize: 13, fontWeight: b ? '800' : '500' }}>{l}</Text>
      <Text style={{ color: c || (b ? C.ink : C.ink), fontSize: 13, fontWeight: b ? '900' : '700' }}>{v}</Text>
    </View>
  );
  return (
    <View style={[sx.bill, shadow]}>
      <Text style={{ fontWeight: '900', color: C.ink, fontSize: 14.5, borderBottomWidth: 1, borderBottomColor: C.line, paddingBottom: 8 }}>Price Breakdown</Text>
      <Row l="Items Total" v={money(subtotal)} />
      {saved > 0 && <Row l="Discount" v={'− ' + money(saved)} c={C.green} />}
      {couponOff > 0 && <Row l={`Coupon Discount (${couponCode})`} v={'− ' + money(couponOff)} c={C.green} />}
      <Row l="Delivery Charges" v={delivery === 0 ? 'FREE Delivery' : money(delivery)} c={delivery === 0 ? C.green : C.ink} />
      <View style={{ height: 1, backgroundColor: C.line, marginTop: 10 }} />
      <Row l="Total Payable" v={money(total)} b />
      {saved + couponOff > 0 && (
        <View style={{ backgroundColor: C.greenSoft, borderRadius: R.sm, padding: 10, marginTop: 12 }}>
          <Text style={{ color: '#059669', fontSize: 12, fontWeight: '800' }}>
            🎉 You will save {money(saved + couponOff)} on this order!
          </Text>
        </View>
      )}
    </View>
  );
}

export function Header({ title, go, right }) {
  return (
    <View style={sx.header}>
      <TouchableOpacity onPress={() => go(-1)} style={{ paddingRight: 12 }}>
        <MC name="chevron-left" size={26} color="#fff" />
      </TouchableOpacity>
      <Text style={{ color: '#fff', fontSize: 16.5, fontWeight: '800' }}>{title}</Text>
      <View style={{ flex: 1 }} />
      {right}
    </View>
  );
}

export const sx = StyleSheet.create({
  topBar: {
    position: 'absolute', top: 44, left: 16, right: 16, zIndex: 5,
    flexDirection: 'row', alignItems: 'center',
  },
  round: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#ffffffee',
    alignItems: 'center', justifyContent: 'center',
  },
  cnt: {
    position: 'absolute', top: -2, right: -2, minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: C.red, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  sheet: {
    backgroundColor: C.surface, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl,
    marginTop: -22, padding: 18,
  },
  h2: { fontSize: 14.5, fontWeight: '900', color: C.ink },
  size: {
    width: 48, height: 42, borderRadius: R.sm, borderWidth: 1.5, borderColor: C.line,
    alignItems: 'center', justifyContent: 'center',
  },
  sizeOn: { borderColor: C.brand, backgroundColor: C.brandSoft },
  pinBox: { backgroundColor: C.bg, borderRadius: R.md, padding: 14, marginTop: 16 },
  pinRow: { flexDirection: 'row', marginTop: 8, gap: 8 },
  pinInput: {
    flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: R.sm,
    paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: C.ink, outlineStyle: 'none',
  },
  pinBtn: { backgroundColor: C.brandSoft, paddingHorizontal: 14, justifyContent: 'center', borderRadius: R.sm },
  bullet: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.brand },
  sellerBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg,
    borderRadius: R.lg, padding: 14, marginTop: 18,
  },
  writeRevBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.brandSoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: R.sm },
  revThanks: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.greenSoft, borderRadius: R.sm, padding: 10, marginTop: 10 },
  writeCard: { backgroundColor: C.surface, borderRadius: R.md, padding: 14, marginTop: 10, borderWidth: 1, borderColor: C.line },
  revInput: { backgroundColor: C.bg, borderRadius: R.sm, padding: 10, fontSize: 13, color: C.ink, height: 75, textAlignVertical: 'top' },
  review: { borderTopWidth: 1, borderTopColor: C.line, paddingVertical: 12 },
  qaBox: { backgroundColor: C.bg, borderRadius: R.sm, padding: 10, marginTop: 8 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, padding: 12, paddingBottom: 20, borderTopWidth: 1, borderTopColor: C.line,
  },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.brand, paddingTop: 46, paddingHorizontal: 16, paddingBottom: 16 },
  cartRow: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: R.lg, padding: 12, marginBottom: 12 },
  safeBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.greenSoft, borderRadius: R.sm, padding: 10, marginBottom: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.line, borderRadius: R.sm },
  step: { width: 30, height: 28, alignItems: 'center', justifyContent: 'center' },
  bill: { backgroundColor: C.surface, borderRadius: R.lg, padding: 16, marginTop: 4 },
  imgCountBadge: {
    position: 'absolute', bottom: 32, right: 16, backgroundColor: 'rgba(15,23,42,0.85)',
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14,
  },
  videoBadge: {
    position: 'absolute', top: 90, left: 16, backgroundColor: 'rgba(15,23,42,0.85)',
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14,
  },
  thumbStrip: {
    backgroundColor: '#fff', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.line,
  },
  thumbStripItem: {
    width: 62, height: 62, borderRadius: 8, borderWidth: 1.5, borderColor: C.line,
    overflow: 'hidden', position: 'relative',
  },
  thumbStripItemActive: {
    borderColor: C.brand, borderWidth: 2.5,
  },
  mainCoverPill: {
    position: 'absolute', bottom: 2, left: 2, backgroundColor: C.brand,
    paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2,
  },
});
