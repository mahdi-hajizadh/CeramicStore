import { useState } from "react";
import { Link } from "react-router-dom";
import "./Admin.css";
import { hasPermission } from "./auth/permissions.js";
import { useAuth } from "./auth/useAuth.js";
import CustomersTab from "./owner/CustomersTab.jsx";
import GalleryTab from "./owner/GalleryTab.jsx";
import OrdersTab from "./owner/OrdersTab.jsx";
import ReportsTab from "./owner/ReportsTab.jsx";
import SettingsTab from "./owner/SettingsTab.jsx";
import StaffTab from "./owner/StaffTab.jsx";

// permission: مجوز لازم برای ادمین‌ها؛ ownerOnly: فقط صاحب فروشگاه
const TABS = [
  { id: "orders", label: "سفارش‌ها", permission: "orders", Component: OrdersTab },
  { id: "customers", label: "مشتریان", permission: "customers", Component: CustomersTab },
  { id: "reports", label: "گزارش فروش", permission: "reports", Component: ReportsTab },
  { id: "settings", label: "ویرایش سایت", permission: "settings", Component: SettingsTab },
  { id: "gallery", label: "تصاویر فروشگاه", permission: "gallery", Component: GalleryTab },
  { id: "staff", label: "ادمین‌ها", ownerOnly: true, Component: StaffTab },
];

function Owner() {
  const { user, logout } = useAuth();

  const isOwner = user.role === "Owner";

  const visibleTabs = TABS.filter((item) =>
    item.ownerOnly ? isOwner : hasPermission(user, item.permission)
  );

  const [selected, setSelected] = useState(visibleTabs[0]?.id);
  const active = visibleTabs.find((item) => item.id === selected) ?? visibleTabs[0];

  return (
    <main className="admin-page" dir="rtl">
      <header className="admin-header">
        <div className="admin-brand">
          <div className="admin-brand-icon">CS</div>

          <div>
            <h1>CeramicStore</h1>
            <p>
              {isOwner ? "پنل صاحب فروشگاه" : "پنل مدیریت"} · {user.username}
            </p>
          </div>
        </div>

        <div className="admin-header-actions">
          {hasPermission(user, "products") && (
            <Link className="admin-back-link" to="/admin">
              مدیریت محصولات
            </Link>
          )}

          <Link className="admin-back-link" to="/">
            مشاهده فروشگاه ↗
          </Link>

          <button type="button" className="admin-secondary-button" onClick={logout}>
            خروج
          </button>
        </div>
      </header>

      <nav className="admin-tabs" aria-label="بخش‌های پنل">
        {visibleTabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={active?.id === item.id ? "is-active" : ""}
            onClick={() => setSelected(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {active && <active.Component />}
    </main>
  );
}

export default Owner;
