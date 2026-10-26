// بخش‌های قابل‌واگذاری پنل مدیریت (باید با AdminPermissions در بک‌اند یکی باشد).
export const PERMISSIONS = [
  { key: "products", label: "مدیریت محصولات" },
  { key: "orders", label: "مدیریت سفارش‌ها" },
  { key: "customers", label: "مشاهده مشتریان" },
  { key: "reports", label: "گزارش فروش" },
  { key: "gallery", label: "تصاویر فروشگاه" },
  { key: "settings", label: "تنظیمات فروشگاه" },
];

export function hasPermission(user, permission) {
  if (!user) return false;
  if (user.role === "Owner") return true;
  return user.role === "Admin" && (user.permissions ?? []).includes(permission);
}

// بخش‌هایی که در صفحه /owner (پنل مدیریت) نمایش داده می‌شوند؛ محصولات صفحه جدا دارد (/admin).
export const PANEL_PERMISSIONS = ["orders", "customers", "reports", "gallery", "settings"];

export function canOpenPanel(user) {
  return PANEL_PERMISSIONS.some((permission) => hasPermission(user, permission));
}
