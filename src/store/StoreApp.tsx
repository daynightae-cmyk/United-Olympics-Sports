import { Navigate, Route, Routes } from 'react-router-dom';
import { StoreLayout } from './StoreComponents';
import { StoreProvider } from './StoreContext';
import { StoreDataProvider } from './data/StoreDataProvider';
import type { StoreDataGateway } from './data/StoreDataGateway';
import {
  CartPage,
  CatalogPage,
  CategoryPage,
  CheckoutPage,
  OrderSuccessPage,
  ProductDetailPage,
  SearchResultsPage,
  StoreHomePage,
} from './StorePages';
import {
  ConnectedAccountPage,
  ConnectedAddressesPage,
  ConnectedNotificationsPage,
  ConnectedOrderDetailPage,
  ConnectedOrdersPage,
  ConnectedPaymentMethodsPage,
  ConnectedSettingsPage,
  ConnectedWishlistPage,
  StoreAccountBoundary,
} from './account/StoreAccountRuntime';
import '../styles/store-commerce.css';
import '../styles/store-factory6-enhancements.css';

export function StoreApp({ dataGateway }: { dataGateway?: StoreDataGateway }) {
  return <StoreDataProvider gateway={dataGateway}><StoreProvider><StoreLayout><Routes>
    <Route index element={<StoreHomePage />} />
    <Route path="shop" element={<CatalogPage />} />
    <Route path="categories" element={<CatalogPage categoriesOnly />} />
    <Route path="category/:slug" element={<CategoryPage />} />
    <Route path="product" element={<ProductDetailPage />} />
    <Route path="product/:slug" element={<ProductDetailPage />} />
    <Route path="search" element={<SearchResultsPage />} />
    <Route path="cart" element={<CartPage />} />
    <Route path="checkout" element={<CheckoutPage />} />
    <Route path="order-success" element={<OrderSuccessPage />} />

    <Route element={<StoreAccountBoundary />}>
      <Route path="account" element={<ConnectedAccountPage />} />
      <Route path="profile" element={<Navigate to="/store/account" replace />} />
      <Route path="orders" element={<ConnectedOrdersPage />} />
      <Route path="order/:id" element={<ConnectedOrderDetailPage />} />
      <Route path="wishlist" element={<ConnectedWishlistPage />} />
      <Route path="addresses" element={<ConnectedAddressesPage />} />
      <Route path="payment-methods" element={<ConnectedPaymentMethodsPage />} />
      <Route path="notifications" element={<ConnectedNotificationsPage />} />
      <Route path="settings" element={<ConnectedSettingsPage />} />
    </Route>

    <Route path="*" element={<Navigate to="/store" replace />} />
  </Routes></StoreLayout></StoreProvider></StoreDataProvider>;
}
