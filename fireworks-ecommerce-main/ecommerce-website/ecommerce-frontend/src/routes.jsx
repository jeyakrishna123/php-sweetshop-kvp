import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import MyOrder from "./pages/MyOrder";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import AdminOrders from "./pages/AdminOrders";
import AdminProducts from "./pages/AdminProducts";
import AdminUsers from "./pages/AdminUsers";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import AdminInventory from "./pages/AdminInventory";
import AdminCustomers from "./pages/AdminCustomers";
import AdminReports from "./pages/AdminReports";
import AdminMarketing from "./pages/AdminMarketing";
import AdminCategories from "./pages/AdminCategories";
import AdminBanners from "./pages/AdminBanners";
import AdminTeam from "./pages/AdminTeam";
import AdminContacts from "./pages/AdminContacts";
import AdminOfferPopups from "./pages/AdminOfferPopups";
import AdminMenu from "./pages/AdminMenu";
import AdminMenuDropdown from "./pages/AdminMenuDropdown";
import AdminHideSections from "./pages/AdminHideSections";
import AdminSettings from "./pages/AdminSettings";
import OrderDetails from './pages/OrderDetails';
import OrderDetailsPublic from './pages/OrderDetailsPublic';
import ProductDetails from './pages/ProductDetails';
import ProductListing from './pages/ProductListing';
import UserProfile from './pages/UserProfile';
import Wishlist from './pages/Wishlist';
import AdminLayout from "./pages/AdminLayout";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import OrderTracking from './components/OrderTracking';
import Tracking from './pages/Tracking';
import ProfessionalProducts from './pages/ProfessionalProducts';
import RedesignedProducts from './pages/RedesignedProducts';

// Route Components
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./middleware/AdminRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Admin Routes - Completely separate layout */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route index element={<AdminPanel />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="advanced-analytics" element={<AdvancedAnalytics />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="marketing" element={<AdminMarketing />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="team" element={<AdminTeam />} />
        <Route path="contacts" element={<AdminContacts />} />
        <Route path="offer-popups" element={<AdminOfferPopups />} />
        <Route path="menu" element={<AdminMenu />} />
        <Route path="menu-dropdown" element={<AdminMenuDropdown />} />
        <Route path="hide-sections" element={<AdminHideSections />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      
      {/* Admin Login - No layout wrapper */}
      <Route path="/admin/login" element={<AdminLogin />} />
      
      {/* Public Order Details - No layout wrapper (for QR code access) */}
      <Route path="/order-details/:orderId" element={<OrderDetailsPublic />} />
      
      {/* Main Site Routes - With Navbar and Footer */}
      <Route path="/*" element={
        <div className="flex flex-col min-h-screen w-full">
          <Navbar />
          <main className="flex-1 w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
              <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
              <Route path="/success" element={<Success />} />
              <Route path="/myorder" element={<PrivateRoute><MyOrder /></PrivateRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
              <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/tracking" element={<Tracking />} />
              <Route path="/tracking/:trackingNumber" element={<Tracking />} />
              <Route path="/products" element={<ProductListing />} />
              <Route path="/professional-products" element={<ProfessionalProducts />} />
              <Route path="/redesigned-products" element={<RedesignedProducts />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/order/:id" element={<OrderDetails />} />
            </Routes>
          </main>
          <Footer />
        </div>
      } />
    </Routes>
  );
};

export default AppRoutes; 