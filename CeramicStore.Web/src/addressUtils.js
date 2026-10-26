import { normalizeDigits } from "./utils.js";

export const emptyAddress = {
  recipientName: "",
  phone: "",
  province: "مازندران",
  city: "آمل",
  addressLine: "",
  postalCode: "",
};

// خطای اعتبارسنجی فرم آدرس (یا رشته خالی اگر معتبر است)
export function validateAddress(address) {
  if (address.recipientName.trim().length < 2) return "نام گیرنده را وارد کن.";
  if (!/^\+?\d{7,15}$/.test(normalizeDigits(address.phone))) {
    return "شماره تماس گیرنده معتبر نیست.";
  }
  if (!address.province.trim()) return "استان را وارد کن.";
  if (!address.city.trim()) return "شهر را وارد کن.";
  if (address.addressLine.trim().length < 8) return "نشانی کامل را (حداقل ۸ کاراکتر) وارد کن.";
  if (!/^\d{10}$/.test(normalizeDigits(address.postalCode))) {
    return "کد پستی باید ۱۰ رقم باشد.";
  }
  return "";
}

// آدرس را برای ارسال به API آماده می‌کند (ارقام فارسی → انگلیسی).
export function toAddressPayload(address) {
  return {
    recipientName: address.recipientName.trim(),
    phone: normalizeDigits(address.phone),
    province: address.province.trim(),
    city: address.city.trim(),
    addressLine: address.addressLine.trim(),
    postalCode: normalizeDigits(address.postalCode),
  };
}
