# 🚚 Temsho — Delivery & Logistics Guide (Shiprocket, Local, India Post)

Temsho में 3 तरीक़ों से सामान पहुँचाया जा सकता है:

---

## 1️⃣ तरीक़ा 1: Dukaan Se Local Delivery (सबसे सस्ता, सबसे तेज़) ⭐

- **किसके लिए:** अपने शहर / आस-पास के 15-20 km के अंदर के ऑर्डर।
- **खर्च:** ₹0 (अगर सेलर ख़ुद पहुँचाए) या ₹29-50 (Porter/Dunzo/Local rider).
- **फ़ायदा:** उसी दिन या 24 घंटे में सामान ग्राहक के हाथ में।
- **कैसे काम करता है:**
  1. ग्राहक Checkout में **"Dukaan Se Seedha (Local)"** चुनता है।
  2. सेलर को ऑर्डर दिखते ही वह पैक करके ग्राहक को फ़ोन या WhatsApp करता है।
  3. सामान देकर कैश या UPI पर पेमेंट ले लेता है।

---

## 2️⃣ तरीक़ा 2: Shiprocket Express (Delhivery / BlueDart / DTDC / Ekart)

- **किसके लिए:** दूसरे शहर या पूरे भारत के राज्यों में डिलीवरी।
- **खर्च:** ~₹35 से ₹60 प्रति पार्सल (वज़न के हिसाब से)।
- **कैसे जोड़ें:**
  1. https://shiprocket.in पर Sign Up करें (मुफ़्त अकाउंट)।
  2. **Settings → API** में जाकर API User (Email + Password) बनाएं।
  3. `src/config.js` में ईमेल और पासवर्ड डाल दीजिए:
     ```javascript
     export const SHIPROCKET = {
       email: 'aapka_email@shiprocket.com',
       password: 'aapka_password',
       pickupPincode: '226010',
     };
     ```
  4. Seller Dashboard में **"Shiprocket Dispatch"** बटन दबाते ही ऑटोमैटिक AWB नंबर और कूरियर पिकअप बुक हो जाएगा!

---

## 3️⃣ तरीक़ा 3: India Post / Speed Post (हर गाँव, हर पिनकोड)

- **किसके लिए:** दूर-दराज़ गाँव, पहाड़ी इलाक़े जहाँ प्राइवेट कूरियर नहीं पहुँचते।
- **खर्च:** ₹40 से शुरू (Speed Post / Parcel).
- **कैसे काम करता है:**
  1. पार्सल पैक करके पास वाले डाकघर (Post Office) में जमा करें।
  2. मिलने वाली पर्ची से **Tracking Number** (जैसे `EU123456789IN`) ऐप में डाल दें।
  3. ग्राहक सीधे India Post वेबसाइट पर ट्रैक कर सकता है।
