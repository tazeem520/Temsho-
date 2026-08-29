# 👑 Temsho — Owner Handbook & Master Guide (मालिक की संपूर्ण डायरी)

यह फ़ाइल **Temsho Marketplace के मालिक (Owner Phone: `9044468663`)** के लिए तैयार की गई है। इसमें ऐप की हर ज़रूरी चाबी, क्रेडेंशियल्स, फाइल्स और APK बनाने की पूरी जानकारी है।

---

## 📋 1. आपकी मुख्य जानकारी (Protected Owner Details)

| चीज़ | विवरण | स्थिति |
|---|---|---|
| **App का नाम** | **Temsho** (*पूरे भारत का अपना बाज़ार*) | ✅ Active |
| **Owner Phone** | **`9044468663`** | 🔒 Config Protected (UI में कभी नहीं दिखता) |
| **Owner Email** | **`tazeemahmadsbn12@gmail.com`** | 🔒 Config Protected |
| **Owner Admin Access** | फ़ोन नंबर `9044468663` से लॉगिन करते ही **Admin Panel (Crown 👑)** | ✅ Live |
| **Support Desk (Public)** | "Priya S." (`support@temsho.in`) | 🛡️ Customers को सिर्फ़ यह दिखता है |

---

## 📱 2. Android APK बनाने का 3 मिनट का तरीक़ा

Expo की क्लाउड सेवा से मुफ़्त में Android `.apk` फ़ाइल बनती है:

### स्टेप 1: मुफ़्त Expo अकाउंट बनाएं
- **https://expo.dev/signup** पर जाइए और अपने Google/Email से 1 मिनट में फ़्री अकाउंट बना लीजिए।

### स्टेप 2: टर्मिनल में लॉगिन करें
```bash
cd /home/user/apna-bazaar
npx eas login
```
*(अपना Expo का ईमेल और पासवर्ड डाल दीजिए)*

### स्टेप 3: APK Build शुरू करें (1 कमांड)
```bash
npx eas build -p android --profile preview
```

> ⏱️ **10 से 15 मिनट** में Expo क्लाउड आपके ऐप की `.apk` फ़ाइल बनाकर आपको एक **डाउनलोड लिंक (Download URL)** दे देगा।  
> उस लिंक से APK डाउनलोड करके आप सीधे अपने फ़ोन में इंस्टॉल कर सकते हैं और WhatsApp पर दोस्तों को भेज सकते हैं! ✅

---

## 🗄️ 3. डेटाबेस (Supabase) की डिटेल्स

| चीज़ | विवरण |
|---|---|
| **प्रोजेक्ट का नाम** | `Temsho` |
| **Supabase URL** | `https://zyyxpkyqagewsjfwlktd.supabase.co` |
| **डेटाबेस रीजन** | South Asia (Mumbai) — सबसे तेज़ |
| **कस्टमर टेबल्स** | `users`, `shops`, `products`, `orders`, `addresses`, `reviews`, `notifications`, `app_settings` |
| **फ़ोटो स्टोरेज बकेट** | `product-photos` (Public Active) |
| **डेटाबेस सेटअप फ़ाइल** | `supabase-setup.sql` |

---

## 🚚 4. कूरियर और डिलीवरी (Shiprocket Setup)

| डिलीवरी का तरीक़ा | कैसे होगा | खर्च |
|---|---|---|
| **1. लोकल डिलीवरी (Dukaan Se)** | सेलर खुद या Dunzo/Porter से 24 घंटे में भेजेगा | ₹0 – ₹29 |
| **2. Shiprocket Express** | Delhivery / BlueDart का राइडर दुकान से पार्सल उठाएगा | ~₹35 – ₹55 |
| **3. India Post / Speed Post** | डाकघर से पूरे भारत के हर गाँव और पिनकोड तक | ₹40 से |

- **Shiprocket चालू करने के लिए:**
  1. https://shiprocket.in पर Sign Up करें (मुफ़्त)।
  2. `Settings → API` से API यूजर बनाकर `src/config.js` में ईमेल/पासवर्ड डाल दें।
  3. विस्तृत गाइड: **`SHIPROCKET-SETUP.md`**

---

## 📲 5. OTP सिस्टम (7 प्रोवाइडर्स सपोर्ट)

App में 7 OTP प्रोवाइडर जुड़े हैं जिन्हें आप **Admin Panel → "1 · OTP System"** से 1-टैप में बदल सकते हैं:
1. **Demo Mode (₹0):** तुरंत टेस्ट के लिए (कोई भी 4 अंक जैसे `1234`)
2. **Supabase SMS (₹0):** 50 SMS/महीना मुफ़्त
3. **Twilio WhatsApp Sandbox (₹0):** मुफ़्त WhatsApp टेस्टिंग
4. **Twilio SMS:** US नंबर से SMS
5. **MSG91 India:** ₹0.15/SMS (भारत का सबसे सस्ता)
6. **Fast2SMS:** क्विक SMS डिलीवरी
7. **AiSensy:** Meta Verified WhatsApp API

---

## 📁 6. आपके प्रोजेक्ट की सभी ज़रूरी फ़ाइलें

| फ़ाइल का नाम | क्या है इसमें? |
|---|---|
| **`OWNER-HANDBOOK.md`** | यह मास्टर गाइड (पूरी जानकारी) |
| **`PLAY-STORE-DATA-SAFETY.md`** | Google Play Console के सवालों के सटीक जवाब |
| **`PRIVACY-POLICY.md`** | DPDP Act 2023 के अनुसार प्राइवेसी पॉलिसी |
| **`SHIPROCKET-SETUP.md`** | कूरियर और लॉजिस्टिक्स सेटअप गाइड |
| **`supabase-setup.sql`** | पूरे डेटाबेस की SQL फ़ाइल |
| **`web-build/`** | वेबसाइट का प्रोडक्शन रेडी फ़ोल्डर (Netlify पर ड्रैग-ड्रॉप के लिए) |
| **`assets/icon.png`** | 512×512 HD App Icon |
| **`assets/play-feature-graphic.png`** | 1024×500 Google Play Feature Graphic |
| **`assets/splash-icon.png`** | स्प्लैश स्क्रीन आइकॉन |
| **`eas.json`** | Android APK और Play Store AAB बिल्ड कॉन्फ़िगरेशन |
| **`app.json`** | Package Name `com.temsho.app` और ऐप सेटिंग्स |

---

## 🎯 7. Play Store पर पब्लिश करने के 5 क़दम

1. **Google Play Console ($25 एक बार):** https://play.google.com/console पर डेवलपर अकाउंट खोलें।
2. **App Details:**
   - App Name: `Temsho: Poore Bharat Ka Bazaar`
   - Short Description: `No bot, only humans. Direct seller to buyer marketplace.`
   - Icon: `assets/icon.png`
   - Feature Graphic: `assets/play-feature-graphic.png`
3. **Data Safety Form:** `PLAY-STORE-DATA-SAFETY.md` में लिखे जवाब कॉपी-पेस्ट करें।
4. **Production Build (.aab फ़ाइल):**
   ```bash
   npx eas build -p android --profile production
   ```
5. **14-Day 12-Tester Test:** 12 दोस्तों को Closed Testing लिंक भेजें, 14 दिन बाद ऐप लाइव हो जाएगा! ✅
