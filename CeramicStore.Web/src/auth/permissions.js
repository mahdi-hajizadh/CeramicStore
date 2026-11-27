// Delegable management areas must match AdminPermissions in the backend.
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

// The owner dashboard displays these areas. Products have a separate page at /admin.
export const PANEL_PERMISSIONS = ["orders", "customers", "reports", "gallery", "settings"];

export function canOpenPanel(user) {
  return PANEL_PERMISSIONS.some((permission) => hasPermission(user, permission));
}
