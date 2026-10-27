# 📲 Indus Appstore पर Temsho App का New APK Update & Aadhaar Verification Guide (Step-by-Step)

## 📦 Current Latest Build Details
- **App Name**: Temsho
- **Package Name / Application ID**: `com.temsho.app`
- **App Version**: `1.0.8`
- **Version Code**: `9`
- **Direct APK Download Link**: [https://expo.dev/artifacts/eas/fY30uJoA3dns8p2K3x1p5Dl4a3FC1L9ANkd90RS6wg0.apk](https://expo.dev/artifacts/eas/fY30uJoA3dns8p2K3x1p5Dl4a3FC1L9ANkd90RS6wg0.apk)

---

## 🆔 1. Indus Developer Account: Aadhaar / KYC Verification (Step-by-Step)

PhonePe Indus Appstore पर ऐप्स पब्लिश और लाइव करने के लिए इंडिविजुअल डेवलपर अकाउंट पर सरकार द्वारा मान्यता प्राप्त आधार / डिजी लॉकर (DigiLocker) वेरिफिकेशन जरूरी होता है। इसे पूरा करने का सीधा तरीका:

### 📍 Step 1: Indus Developer Profile में जाएं
1. ब्राउज़र में **https://developer.indusappstore.com** खोलें और अपने रजिस्टर्ड नंबर (`9044468663`) से लॉगिन करें।
2. ऊपर दाएँ कोने में प्रोफाइल आइकन पर क्लिक करें और **"Account Settings"** या **"Developer Profile" / "KYC Verification"** सेक्शन में जाएं।

### 📍 Step 2: "Identity Verification (Aadhaar / DigiLocker)" चुनें
1. Developer Type में **"Individual Developer"** कन्फर्म करें।
2. **"Verify Identity with Aadhaar"** या **"Proceed to DigiLocker"** बटन पर क्लिक करें।

### 📍 Step 3: 12-अंकों का आधार नंबर दर्ज करें
1. अपना 12 डिजिट का **Aadhaar Number** दर्ज करें और Captcha भरें।
2. **"Generate OTP" / "Next"** पर क्लिक करें।

### 📍 Step 4: Aadhaar OTP दर्ज करें
1. आपके आधार से लिंक मोबाइल नंबर पर UIDAI की तरफ से 6 अंकों का OTP आएगा।
2. OTP दर्ज करें और 6-digit DigiLocker Security PIN डालकर कन्फर्म करें।
3. **"Allow / Consent"** पर क्लिक करें ताकि Indus Appstore को आपका नाम व पता वेरीफाई करने की अनुमति मिले।

### 📍 Step 5: Verification Confirmed!
- वेरिफिकेशन तुरंत (1-2 मिनट में) **"Verified Developer"** ग्रीन टिक में बदल जाएगा।
- इसके बाद आप कोई भी नया APK बिना किसी रुकावट के पब्लिश व रोलआउट कर सकते हैं।

---

## 🚀 2. Indus Appstore पर Temsho App का New APK Update कैसे करें

जब भी नया APK रिलीज करना हो:

### 📍 Step 1: "My Apps" में Temsho ऐप खोलें
1. Indus Developer Console Dashboard पर जाएं।
2. **"My Apps"** में **`Temsho`** ऐप पर क्लिक करें।

### 📍 Step 2: "App Releases" में New Release बनाएं
1. Left Sidebar मेनू में **"App Releases"** या **"Release Management"** पर क्लिक करें।
2. ऊपर दाईं तरफ **"+ Create New Release"** बटन दबाएं।
3. **Track:** "Production" चुनें।

### 📍 Step 3: New APK फ़ाइल Upload करें
1. **"Upload APK"** बटन पर क्लिक करें और अपने फोन/लैपटॉप से डाउनलोड किया हुआ `Temsho-v1.0.8.apk` सेलेक्ट करें।
   *(आप डायरेक्ट लिंक से भी डाउनलोड कर सकते हैं: `https://expo.dev/artifacts/eas/fY30uJoA3dns8p2K3x1p5Dl4a3FC1L9ANkd90RS6wg0.apk`)*
2. Indus Console अपने आप Package Name (`com.temsho.app`) और Version Code (`9`, v1.0.8) डिटेक्ट कर लेगा।

### 📍 Step 4: "What's New in this Version" (Release Notes) भरें
नीचे दिए गए टेक्स्ट को कॉपी करके **Release Notes** बॉक्स में पेस्ट करें:

```text
What's New in Version 1.0.8:
• Smooth product and item management with instant delete functionality across seller listings and cart
• Seamless permanent data persistence tied directly to mobile number
• Real human verified seller ecosystem and direct marketplace payments
• Enhanced high-speed offline protection and full connectivity check
• 24x7 Customer Support directly available via WhatsApp and Phone
```

### 📍 Step 5: "Save & Submit for Review" पर क्लिक करें
1. नीचे **"Save Draft"** और फिर **"Submit for Review" / "Rollout to Production"** पर क्लिक करें।
2. Indus Appstore टीम द्वारा रिव्यू होते ही 12-24 घंटे के अंदर नया वर्जन लाइव हो जाएगा और सभी यूज़र्स को **"Update"** का बटन दिखेगा। 🇮🇳🚀
