// ============================================================
//  TEMSHO — Poore Bharat Ka Apna Bazaar
//  No Bot, Only Humans.
//  👑 OWNER PRIVACY GUARANTEE:
//  Owner ki personal details (Phone/Email) sirf yahan config me hain
//  aur Admin authentication ke liye use hoti hain.
//  App ke UI me buyer/seller ko kahin bhi owner ki personal details nahi dikhti.
// ============================================================

/* ---------- 👑 OWNER CREDENTIALS ---------- */
export const OWNER_PHONES = ['9044468663'];
export const OWNER_EMAILS = ['tazeemahmadsbn12@gmail.com', 'tazeemahmadsbn12@gmail.co'];

export const isOwner = (phone) =>
  OWNER_PHONES.includes(String(phone || '').replace(/\D/g, '').slice(-10));

export const isOwnerEmail = (email) =>
  OWNER_EMAILS.includes(String(email || '').trim().toLowerCase());

/* ---------- 📲 OTP PROVIDERS ---------- */
// 'demo' | 'supabase' | 'twilio_whatsapp' | 'twilio_sms' | 'aisensy' | 'msg91' | 'fast2sms'
export const OTP_PROVIDER = 'supabase';

export const TWILIO = {
  sid: 'YAHAN_TWILIO_SID',
  token: 'YAHAN_TWILIO_TOKEN',
  fromNumber: '+14155238886', // Twilio WhatsApp sandbox number
  messagingServiceSid: '',
};

export const AISENSY = {
  apiKey: 'YAHAN_AISENSY_API_KEY',
  campaign: 'temsho_otp',
};

export const MSG91 = {
  authKey: 'YAHAN_MSG91_AUTHKEY',
  templateId: 'temsho_otp_template',
};

export const FAST2SMS = {
  apiKey: 'YAHAN_FAST2SMS_API_KEY',
};

/* ---------- 🚚 SHIPROCKET & LOGISTICS ---------- */
export const SHIPROCKET = {
  email: 'YAHAN_SHIPROCKET_EMAIL',
  password: 'YAHAN_SHIPROCKET_PASSWORD',
  pickupPincode: '226010',
  autoDispatch: false,
};

/* ---------- ⚙️ DEFAULT SETTINGS (Admin Panel se badalte hain) ---------- */
export const DEFAULT_ADMIN = {
  appName: 'Temsho',
  tagline: 'Poore Bharat ka apna bazaar',
  supportName: 'Priya S.',
  supportHours: '24x7',
  supportPhone: '9044468663',
  supportEmail: 'support@temsho.in',
  freeDeliveryAbove: 499,
  deliveryFee: 49,
  localDeliveryFee: 29,
  expressDeliveryFee: 69,
  cashbackPct: 1,
  referralAmount: 100,
  commissionPct: 0,
  allowCod: true,
  allowUpi: true,
  allowWhatsappOtp: true,
  allowAnyoneToSell: true,
  requirePhotoToList: true,
  maintenance: false,
  announcement: '',
  otpProvider: 'supabase',
  deliveryMode: 'all',
};
