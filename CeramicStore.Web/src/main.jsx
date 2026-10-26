import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "@fontsource-variable/vazirmatn";
import "./index.css";
import Admin from "./Admin.jsx";
import App from "./App.jsx";
import AccountPage from "./AccountPage.jsx";
import CartPage from "./CartPage.jsx";
import CheckoutPage from "./CheckoutPage.jsx";
import LoginPage from "./LoginPage.jsx";
import Owner from "./Owner.jsx";
import ProductPage from "./ProductPage.jsx";
import RegisterPage from "./RegisterPage.jsx";
import { AuthProvider } from "./auth/AuthProvider.jsx";
import { CartProvider } from "./cart/CartProvider.jsx";
import RequireRole from "./components/RequireRole.jsx";
import StoreLayout from "./components/StoreLayout.jsx";
import { SettingsProvider } from "./settings/SettingsProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <CartProvider>
            <Routes>
              <Route element={<StoreLayout />}>
                <Route path="/" element={<App />} />
                <Route path="/products/:id" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/checkout"
                  element={
                    <RequireRole>
                      <CheckoutPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="/account"
                  element={
                    <RequireRole roles={["Customer"]}>
                      <AccountPage />
                    </RequireRole>
                  }
                />
              </Route>

              <Route
                path="/admin"
                element={
                  <RequireRole roles={["Admin", "Owner"]} permission="products">
                    <Admin />
                  </RequireRole>
                }
              />
              <Route
                path="/owner"
                element={
                  <RequireRole
                    roles={["Admin", "Owner"]}
                    anyPermission={["orders", "customers", "reports", "gallery", "settings"]}
                  >
                    <Owner />
                  </RequireRole>
                }
              />
            </Routes>
          </CartProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
