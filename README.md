# 🛍️ Temsho — "No Bots. Only Humans."

Poore Bharat ka shopping app — React Native (Expo) me bana hua. Buyer + Seller dono side.
Design bilkul original hai (Flipkart/Meesho ka clone nahi), lekin Indian shopper ke liye familiar.

## Human-Only kya hai?

**Login sirf mobile number + OTP se.** Koi Aadhaar, PAN, GST, document ya selfie nahi.

| Layer | Kya hota hai |
|---|---|
| **Signup** | Naam + 10-digit number → OTP **WhatsApp par** (ya SMS). Bas. |
| **Ek number = ek insaan** | Har number par ek hi account — duplicate/bulk sign-up block |
| **Seller** | **Koi bhi bech sakta hai** — dukaan ho ya na ho, zero documents, zero approval |
| **Paisa** | **Seedha seller ke UPI par** — Temsho beech me paisa nahi rakhta |
| **Support** | Koi AI chatbot nahi — hamesha asli employee, 11 bhashaon me |
| **Reviews** | Sirf verified khareedar hi likh sakta hai, order ke baad |
| **No dark patterns** | Nakli timer, nakli "5 log dekh rahe hain" — kuch nahi |

Har product card / seller card par 🤝 **HUMAN VERIFIED** tag dikhta hai.

## Photos: sirf seller upload karta hai

- **Koi AI-generated product photo nahi.** Saari AI images hata di gayi hain.
- Har listing ki photo **seller khud** apne camera/gallery se daalta hai (`expo-image-picker`)
- **Photo ke bina listing live nahi hogi** — "Live karein" button tab tak disabled
- Jis sample listing par photo nahi hai wahan saaf "SELLER KI PHOTO BAAKI" placeholder dikhta hai
- Emoji/cartoon icons pura hata diye — ab `@expo/vector-icons` ke professional line icons
- Avatars initials-based (RH, MH…), cartoon chehre nahi

## Settings — sab kuch user khud bharta hai (KYC ke bina)

Flipkart/Meesho jaisa full settings panel — Account tab ke gear icon se.

**Buyer settings**
- Profile: poora naam, email, gender, janam tarikh, doosra number
- Location: sheher, rajya, PIN + delivery addresses
- Mobile number badlein (sirf OTP se)
- App ki bhasha — 11 Indian bhashayein
- Notifications: order updates / offers / WhatsApp toggles
- Payment: default method + saved UPI ID
- Privacy: search history toggle, policy, human support
- Log out aur account delete (confirmation ke saath)

**Seller settings** (`Dukaan settings`)
- Dukaan ka naam, tagline, contact number, khulne ka samay
- Pickup ka poora pata, sheher, rajya, PIN
- Payout UPI ID, return kitne din ka
- GSTIN — **bilkul optional**, khali chhod sakte hain

> Kahin bhi Aadhaar, PAN, selfie ya shop licence nahi maanga jaata. Sirf mobile OTP.

## Naya kya add hua

- 💾 **Data save rehta hai** (AsyncStorage) — app band karke kholein, cart/orders/login sab wapas
- 🎟️ **Coupons** — TEM100, NAYA50, BIG15, FREESHIP (checkout par tap karke lagayein)
- 🪙 **Temsho Wallet** — har order par 1% cashback, checkout par use karein
- 🤝 **Referral** — apna code share karein, dono ko ₹100
- 🔔 **Notifications** — order update, offers (unread badge home par)
- 🚚 **Live order tracking** — Confirmed → Packed → Shipped → Out for Delivery → Delivered ("Track karein" tap karein)
- ↩️ **Return / Refund** — delivered order par wajah chunkar request
- 🔁 **Dobara khareedein** — purana order ek tap me cart me
- ⚙️ **Filters** — daam range + rating (4.5★/4★/3.5★)
- 📥 **Seller ke incoming orders** — packed mark karein, buyer ko call
- 🗑️ **Listing hatana** aur 📍 **Address manager** (add/delete)
- 🎬 **Splash screen** load hote waqt

## Screens (25)

**Buyer:** Onboarding (2-step: number → OTP) → Home → Categories → Search → Product Detail →
Cart → Checkout (address + COD/UPI/Card/NetBanking) → Order Success → Orders (live tracking) →
Wishlist → Account

**Seller:** Become Seller (naam + sheher, bas) → Seller Dashboard → Add Product (live listing)

**Trust:** Human Support chat · Human-Only Policy page

**Extras:** Notifications · Wallet & Referral · Addresses · Seller Orders

## Chalane ka tarika

```bash
cd temsho
npm install

npm run web        # browser me (abhi ye chal raha hai, port 8081)
npm run android    # Android device/emulator
npm run ios        # iPhone (Mac chahiye)
```

Phone par test karne ke liye: Play Store se **Expo Go** install karein, `npx expo start` chalayein aur QR scan karein.

## APK banane ke liye

```bash
npm i -g eas-cli
eas login
eas build -p android --profile preview   # .apk milega
```

## Code structure

```
App.js                    # navigation stack + bottom tabs + phone frame (web)
src/theme.js              # colors: indigo #2B2D6E + marigold #F5A623
src/store.js              # global state (cart, orders, auth, seller, chat)
src/data/catalog.js       # 20 demo products, 5 verified sellers, 8 categories
src/components/UI.js      # Btn, Field, ProductCard, HumanTag, Badge, Stars…
src/screens/
  Onboarding.js           # phone → OTP (koi KYC nahi)
  Shop.js                 # Home, Search, Category
  Product.js              # Product detail, Cart, Bill, Header
  Checkout.js             # Checkout, Success, Orders
  Account.js              # Account, Wishlist, BecomeSeller, Seller, Support, Policy
  Extras.js               # Notifications, Wallet, SellerOrders, Addresses
  Settings.js             # Settings, EditProfile, EditLocation, ChangePhone,
                          # Language, PaymentSettings, ShopSettings
```

## Aage kya karna hai (production ke liye)

1. **Backend** — Node/Express + PostgreSQL ya Firebase/Supabase
2. **Real OTP** — MSG91 / Twilio / Firebase Phone Auth (India ke liye MSG91 sasta hai)
3. **Anti-bot (bina KYC)** — device fingerprint + rate limit + SIM-binding, taaki ek number = ek insaan bana rahe
4. **Payments** — Razorpay / PhonePe PG (UPI + COD)
5. **Images** — Cloudinary / S3 (abhi demo me emoji tiles hain, zero network dependency)
6. **Delivery** — Delhivery / Shiprocket API
7. **Compliance** — GST invoicing, DPDP Act 2023, Legal Metrology labels

> Note: data ab device par AsyncStorage me save hota hai (restart par bhi rehta hai).
> Sab kuch device-local hai — asli backend abhi nahi juda.
> Data reset karne ke liye: Account → Log out.
