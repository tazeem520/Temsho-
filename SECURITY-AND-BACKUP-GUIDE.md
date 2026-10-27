# 🛡️ TEMSHO — Security & Backup Master Guide

## 1. App Security Architecture (App Hack-Proof Kaise Hai?)

### A. Reverse Engineering Protection (Hermes Bytecode Engine)
- App ka pura code plain text JavaScript mein nahi rehta, balki compiled **Hermes Binary Bytecode** me convert hota hai.
- Isse koi bhi APK ko unzip karke aapka source code aasani se nahi padh sakta ya modify nahi kar sakta.

### B. Owner Admin Panel Phone Gate
- Owner Admin Panel sirf aur sirf **9044468663** aur **9044461613** number par OTP verify hone par hi unlock hota hai.
- Kisi aur number se login karne par Owner Panel app me dikhega hi nahi.

### C. Financial & Bank Privacy
- Sellers ke Bank Account aur IFSC details kisi buyer ya public screen par nahi dikhte.
- Buyers ko checkout par sirf Owner ka secure UPI / QR code dikhta hai.
- Buyer ke bank MPIN ya debit card passwords app me kabhi nahi mange jaate (Direct UPI deep-link securely NPCI / BHIM app me chalti hai).

### D. Secure Cloud & Data Isolation
- Har phone number ka data uske private storage index me isolated rehta hai.
- Database communication HTTPS/TLS 256-bit encrypted protocol par hoti hai.

---

## 2. ⚠️ Top 7 Confidential Secrets (Jo Kisi Ko Kabhi Mat Batayein!)

| # | Secret Item | Kyun Secret Hai? |
|---|---|---|
| 1 | **Owner Phone OTP** | 9044468663 / 9044461613 par aane wala OTP kisi ko na de, isse Admin panel khulta hai. |
| 2 | **EAS Token & Expo Login** | Isse app ka build server control hota hai. |
| 3 | **Keystore File (`temsho-release-key.keystore`) & Passwords** | Iske bina Play Store par app update nahi ho sakta. Agar koi chura le to nakli update daal sakta hai. |
| 4 | **Supabase Service Role Key** | Isse direct database control hota hai (App me sirf public anon key use karein). |
| 5 | **Twilio / Fast2SMS API Key** | Agar koi chura le to aapke SMS credits khatam kar sakta hai. |
| 6 | **Shiprocket Password & Token** | Courier balance aur automated pickups protect rakhne ke liye. |
| 7 | **Apna Bank MPIN / Netbanking Password** | Ye app me kahin save nahi hota aur na kisi ko batana hai. |

---

## 3. 📱 Agar Phone Kho Jaye to Chat & Project Kaise Recover Karein?

### A. Arena.ai Chat Wapas Pane Ka Tarika:
1. Naye phone ya computer me browser kholein aur `Arena.ai` par jayein.
2. Usi **Gmail / Google Account** se Login karein jisse aap abhi Arena par chat kar rahe hain.
3. Login hote hi aapki saari purani chats, history aur files aapke samne wapas aa jayengi.

### B. Safe Backup Strategy (Aaj Hi Karein):
1. **Google Drive Backup**: `Temsho-App-Full-Project.zip` aur `Temsho.apk` ko apne personal Google Drive par upload karke rakh lein.
2. **Email Self-Backup**: Ye zip file apne hi email ID par email (Drafts ya Inbox) me bhej kar rakh lein.
3. **Keystore Backup**: `temsho-release-key.keystore` aur `credentials.json` ko Google Drive ke secure folder me save rakhein.
