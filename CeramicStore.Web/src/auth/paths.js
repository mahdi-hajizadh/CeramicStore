import { canOpenPanel, hasPermission } from "./permissions.js";

// صفحه اصلی هر نقش پس از ورود
export function homePathFor(user) {
  if (user.role === "Owner") return "/owner";

  if (user.role === "Admin") {
    if (hasPermission(user, "products")) return "/admin";
    if (canOpenPanel(user)) return "/owner";
    return "/";
  }

  return "/account";
}
