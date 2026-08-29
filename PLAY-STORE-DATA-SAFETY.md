# 📱 Temsho — Google Play Console Data Safety & Launch Guide

इस गाइड में Google Play Console पर **Data Safety** फ़ॉर्म भरने के exact जवाब और App Publish करने का तरीक़ा दिया गया है।

---

## 1️⃣ Google Play Console — Data Safety Form के सटीक जवाब

Google Play Console में **Policy → Data Safety** में ये विकल्प चुनिए:

### A. Data Collection and Security
1. **Does your app collect or share any of the required user data types?**
   - ✅ **Yes**
2. **Is all of the user data collected by your app encrypted in transit?**
   - ✅ **Yes** (Supabase HTTPS / SSL encryption)
3. **Do you provide a way for users to request that their data be deleted?**
   - ✅ **Yes** (In-app Account Deletion button in Settings + email `support@temsho.in`)

---

### B. Data Types & Purposes

#### 1. Location (Approximate Location)
- **Collected?** Yes
- **Shared?** No
- **Ephemeral?** No
- **Required or Optional?** Optional (Buyer delivery address & city)
- **Purpose:** App functionality, Order Delivery

#### 2. Personal Info
- **Name:** Collected for App functionality (Account name)
- **Phone Number:** Collected for App functionality, Account management, Fraud prevention (OTP Login)
- **Email (Optional):** Collected for Account management

#### 3. Financial Info
- **Payment Info / UPI ID (Sellers only):** Collected for Payouts directly to seller (Temsho never stores card details/bank passwords).

#### 4. Photos and Videos
- **Photos:** Collected only when Seller uploads real product photo or dispatch receipt (Camera/Gallery permission).

---

## 2️⃣ Play Store Listing Checklist

| Item | Requirements | Status in Temsho |
|---|---|---|
| **App Name** | `Temsho: Poore Bharat Ka Bazaar` | ✅ Configured |
| **Short Description** | `No bot, only humans. Direct seller to buyer marketplace.` | ✅ Ready |
| **App Icon** | 512 × 512 PNG, 32-bit color | ✅ `assets/icon.png` |
| **Feature Graphic** | 1024 × 500 JPG/PNG | ✅ `assets/play-feature-graphic.png` |
| **Privacy Policy URL** | Hosted URL (e.g. Netlify URL/privacy) | ✅ In-App + `PRIVACY-POLICY.md` |
| **Category** | Shopping | ✅ Ready |
| **Target Audience** | 18+ (General Shopping) | ✅ Ready |

---

## 3️⃣ APK Build & Distribution (1-Click Command)

### A. Free Android APK (WhatsApp / Direct Share के लिए):
```bash
npx eas build -p android --profile preview
```
*Build 10–15 मिनट में पूरा होगा और आपको डायरेक्ट `.apk` डाउनलोड लिंक मिलेगा।*

### B. Production Play Store AAB (Google Play पर डालने के लिए):
```bash
npx eas build -p android --profile production
```
*इससे `.aab` फ़ाइल बनेगी जो Google Play Console में अपलोड होगी।*

---

## 4️⃣ Google 14-Day 12-Tester Requirement (2024–2026 Rule)

Google Play Console के नए नियम के अनुसार:
1. Closed Testing Track में 12 दोस्तों/रिश्तेदारों की Gmail IDs जोड़िए।
2. उन्हें APK/Opt-in link भेजिए और 14 दिन तक app को फ़ोन में रखने बोलिए।
3. 14 दिन पूरे होते ही **"Apply for Production"** बटन दबा दीजिए।
4. Google 3–5 दिन में App Live कर देगा! ✅
