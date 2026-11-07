// ============================================================
//  TEMSHO — India's Trusted Online Marketplace
//  Direct Merchant Settlements · Verified Community
//  👑 OWNER PRIVACY GUARANTEE:
//  Owner credentials are strictly stored in config for admin authentication.
//  Owner's personal contact details are never exposed in buyer/seller UI.
// ============================================================

/* ---------- 👑 OWNER CREDENTIALS ---------- */
export const OWNER_PHONES = ['9044468663', '9044461613'];
export const OWNER_EMAILS = ['tazeemahmadsbn12@gmail.com', 'tazeemahmadsbn12@gmail.co'];

export const isOwner = (phone) =>
  OWNER_PHONES.includes(String(phone || '').replace(/\D/g, '').slice(-10));

export const isOwnerEmail = (email) =>
  OWNER_EMAILS.includes(String(email || '').trim().toLowerCase());

/* ---------- 📲 OTP PROVIDERS ---------- */
// 'demo' | 'supabase' | 'twilio_whatsapp' | 'twilio_sms' | 'aisensy' | 'msg91' | 'fast2sms'
export const OTP_PROVIDER = 'fast2sms';

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
  apiKey: 'TDvi8k4IKxQXsB9tfLhJ5rPu3mpFRgqHOaNwMV7lezncdU60SjR0pXSljMOQDWAgGNK4FqzoBLIZ56kU',
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
  tagline: "India's Trusted Online Marketplace",
  supportName: 'Priya S.',
  supportHours: '24x7',
  supportPhone: '9044461613',
  supportEmail: 'support@temsho.in',
  freeDeliveryAbove: 0, // 100% Free Delivery for all buyers (Meesho Strategy)
  deliveryFee: 0,
  localDeliveryFee: 0,
  expressDeliveryFee: 0,
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
  ownerPayment: {
    payeeName: '',
    deliveryChargeUpi: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    codRemittanceMethod: 'bank_transfer',
    notes: 'Temsho Official Marketplace Payout & Shiprocket COD remittance account',
  },
};
