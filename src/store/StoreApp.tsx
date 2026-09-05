import { Navigate, Route, Routes } from 'react-router-dom';
import { StoreLayout } from './StoreComponents';
import { StoreProvider } from './StoreContext';
import {
  AccountPage,
  AddressesPage,
  CartPage,
  CatalogPage,
  CategoryPage,
  CheckoutPage,
  NotificationsPage,
  OrderDetailPage,
  OrderSuccessPage,
  OrdersPage,
  PaymentMethodsPage,
  ProductDetailPage,
  SearchResultsPage,
  StoreHomePage,
  StoreSettingsPage,
  WishlistPage,
} from './StorePages';
import '../styles/store-commerce.css';

export function StoreApp() {
  return <StoreProvider><StoreLayout><Routes>
    <Route index element={<StoreHomePage />} />
    <Route path="shop" element={<CatalogPage />} />
    <Route path="categories" element={<CatalogPage categoriesOnly />} />
    <Route path="category/:slug" element={<CategoryPage />} />
    <Route path="product/:slug" element={<ProductDetailPage />} />
    <Route path="search" element={<SearchResultsPage />} />
    <Route path="cart" element={<CartPage />} />
    <Route path="checkout" element={<CheckoutPage />} />
    <Route path="order-success" element={<OrderSuccessPage />} />
    <Route path="wishlist" element={<WishlistPage />} />
    <Route path="account" element={<AccountPage />} />
    <Route path="profile" element={<Navigate to="/store/account" replace />} />
    <Route path="orders" element={<OrdersPage />} />
    <Route path="order/:id" element={<OrderDetailPage />} />
    <Route path="addresses" element={<AddressesPage />} />
    <Route path="payment-methods" element={<PaymentMethodsPage />} />
    <Route path="notifications" element={<NotificationsPage />} />
    <Route path="settings" element={<StoreSettingsPage />} />
    <Route path="*" element={<Navigate to="/store" replace />} />
  </Routes></StoreLayout></StoreProvider>;
}
