import { Navigate, useLocation } from "react-router-dom";
import { hasPermission } from "../auth/permissions.js";
import { useAuth } from "../auth/useAuth.js";

// فقط کاربران واردشده (و در صورت تعیین roles، فقط نقش‌های مجاز) اجازه ورود دارند.
function RequireRole({ roles, permission, anyPermission, children }) {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <p className="message" role="status">
        در حال بررسی ورود...
      </p>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <p className="message error" role="alert">
        به این بخش دسترسی نداری.
      </p>
    );
  }

  const allowed = permission
    ? hasPermission(user, permission)
    : anyPermission
      ? anyPermission.some((item) => hasPermission(user, item))
      : true;

  if (!allowed) {
    return (
      <p className="message error" role="alert">
        صاحب فروشگاه دسترسی شما به این بخش را فعال نکرده است.
      </p>
    );
  }

  return children;
}

export default RequireRole;
