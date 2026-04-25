import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Index from "./pages/Index";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import CreateEventPage from "./pages/CreateEventPage";
import EventPendingPage from "./pages/EventPendingPage";
import MyTickets from "./pages/MyTickets";
import ScannerPage from "./pages/ScannerPage";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AboutPage from "./pages/AboutPage";
import HelpCenter from "./pages/HelpCenter";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import ManagerLoginPage from "./pages/ManagerLoginPage";
import StaffLoginPage from "./pages/StaffLoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AttendeesPage from "./pages/admin/AttendeesPage";
import ManagersPage from "./pages/admin/ManagersPage";
import ManagerDetailPage from "./pages/admin/ManagerDetailPage";
import EventModerationPage from "./pages/admin/EventModerationPage";
import EventInsightsPage from "./pages/admin/EventInsightsPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import MyEventsPage from "./pages/manager/MyEventsPage";
import EditEventPage from "./pages/manager/EditEventPage";
import ManageEventPage from "./pages/manager/ManageEventPage";
import ManagerEventAnalyticsPage from "./pages/manager/ManagerEventAnalyticsPage";
import ManageVolunteersPage from "./pages/manager/ManageVolunteersPage";
import PayoutsPage from "./pages/manager/PayoutsPage";
import ManagerSalesAnalyticsPage from "./pages/manager/ManagerSalesAnalyticsPage";
import VolunteerLoginPage from "./pages/VolunteerLoginPage";
import ScannerDashboardPage from "./pages/ScannerDashboardPage";
import PortalLayout from "./components/layout/PortalLayout";
import Navbar from "./components/layout/Navbar";
import ScrollToTop from "./components/layout/ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LocalStoresPage from "./pages/LocalStoresPage";
import AdminLocalStoresPage from "./pages/admin/LocalStoresPage";
import CreateStorePage from "./pages/admin/CreateStorePage";
import AdminStoreDetailPage from "./pages/admin/AdminStoreDetailPage";
import StoreDetailPage from "./pages/StoreDetailPage";
import StoreOwnerLoginPage from "./pages/StoreOwnerLoginPage";
import StoreOwnerPortal from "./pages/StoreOwnerPortal";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import BlogManagementPage from "./pages/admin/BlogManagementPage";
import CreateBlogPostPage from "./pages/admin/CreateBlogPostPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import StoreOrdersPage from "./pages/admin/StoreOrdersPage";
import PaymentCallbackPage from "./pages/PaymentCallbackPage";
import { LocalStoreCartProvider } from "./contexts/LocalStoreCartContext";
import LocalStoreCartDrawer from "./components/home/LocalStoreCartDrawer";
import { CityProvider } from "./contexts/CityContext";
import CitySelectModal from "./components/layout/CitySelectModal";
import MaintenancePage from "./pages/MaintenancePage";
import { useMaintenanceMode } from "./hooks/useMaintenanceMode";


const queryClient = new QueryClient();

const AppContent = () => {
  const { data: isMaintenance } = useMaintenanceMode();

  if (isMaintenance) {
    return <MaintenancePage />;
  }

  return (
    <AuthProvider>
      <CityProvider>
        <LocalStoreCartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <CitySelectModal />
            <LocalStoreCartDrawer />
            <Router>
              <ScrollToTop />
              <Routes>
                {/* [Existing Routes...] */}
                <Route
                  element={
                    <>
                      <Navbar />
                      <Outlet />
                    </>
                  }
                >
                  <Route
                    path="/"
                    element={
                      <main className="main-content min-h-screen">
                        <Index />
                      </main>
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <main className="main-content pt-16 md:pt-20 min-h-screen">
                        <Routes>
                          <Route path="events" element={<EventsPage />} />
                          <Route
                            path="local-stores"
                            element={<LocalStoresPage />}
                          />
                          <Route
                            path="local-stores/:id"
                            element={<StoreDetailPage />}
                          />
                          <Route
                            path="events/create"
                            element={
                              <ProtectedRoute
                                allowedRoles={["event_manager", "admin"]}
                              >
                                <CreateEventPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="events/:id" element={<EventDetailPage />} />
                          <Route
                            path="events/:id/success"
                            element={<EventPendingPage />}
                          />
                          <Route
                            path="reset-password"
                            element={<ResetPasswordPage />}
                          />
                          <Route
                            path="dashboard"
                            element={
                              <ProtectedRoute>
                                <Dashboard />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="settings"
                            element={
                              <ProtectedRoute>
                                <AccountSettingsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="my-tickets"
                            element={
                              <ProtectedRoute>
                                <MyTickets />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="my-orders"
                            element={
                              <ProtectedRoute>
                                <MyOrdersPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="scanner"
                            element={
                              <ProtectedRoute
                                allowedRoles={[
                                  "event_manager",
                                  "admin",
                                  "volunteer",
                                ]}
                              >
                                <ScannerPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="scanner/dashboard"
                            element={
                              <ProtectedRoute
                                allowedRoles={[
                                  "event_manager",
                                  "admin",
                                  "volunteer",
                                ]}
                              >
                                <ScannerDashboardPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="blog" element={<BlogPage />} />
                          <Route path="blog/:slug" element={<BlogPostPage />} />
                          <Route path="about" element={<AboutPage />} />
                          <Route path="terms" element={<TermsOfService />} />
                          <Route path="privacy" element={<PrivacyPolicy />} />
                          <Route path="help" element={<HelpCenter />} />
                          <Route path="contact" element={<ContactPage />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                    }
                  />
                </Route>

                <Route path="/payment/callback" element={<PaymentCallbackPage />} />
                <Route path="/store-owner/login" element={<StoreOwnerLoginPage />} />
                <Route path="/store-owner/portal" element={<StoreOwnerPortal />} />

                <Route
                  path="/portal/admin/blog/new"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <CreateBlogPostPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portal/admin/blog/:id/edit"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <CreateBlogPostPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="/auth" element={<AuthPage />} />
                <Route path="/admin-auth" element={<AdminLoginPage />} />
                <Route path="/manager/login" element={<ManagerLoginPage />} />
                <Route path="/staff/login" element={<StaffLoginPage />} />
                <Route path="/volunteer-login" element={<VolunteerLoginPage />} />

                <Route
                  path="/portal"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "event_manager"]}>
                      <PortalLayout>
                        <Outlet />
                      </PortalLayout>
                    </ProtectedRoute>
                  }
                >
                  <Route path="admin" element={<AdminDashboard />} />
                  <Route path="admin/attendees" element={<AttendeesPage />} />
                  <Route path="admin/managers" element={<ManagersPage />} />
                  <Route
                    path="admin/managers/:id"
                    element={<ManagerDetailPage />}
                  />
                  <Route path="admin/events" element={<EventModerationPage />} />
                  <Route path="admin/events/:id" element={<EventInsightsPage />} />
                  <Route path="admin/blog" element={<BlogManagementPage />} />
                  <Route path="admin/local-stores" element={<AdminLocalStoresPage />} />
                  <Route path="admin/local-stores/new" element={<CreateStorePage />} />
                  <Route path="admin/local-stores/:id" element={<AdminStoreDetailPage />} />
                  <Route path="admin/local-stores/:id/edit" element={<CreateStorePage />} />
                  <Route path="admin/store-orders" element={<StoreOrdersPage />} />
                  <Route path="manager" element={<ManagerDashboard />} />
                  <Route path="manager/payouts" element={<PayoutsPage />} />
                  <Route path="manager/analytics" element={<ManagerSalesAnalyticsPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="events" element={<MyEventsPage />} />
                  <Route
                    path="manager/events/:id/details"
                    element={<ManageEventPage />}
                  />
                  <Route
                    path="manager/events/:id/edit"
                    element={<EditEventPage />}
                  />
                  <Route
                    path="manager/events/:id/analytics"
                    element={<ManagerEventAnalyticsPage />}
                  />
                  <Route
                    path="manager/events/:eventId/volunteers"
                    element={<ManageVolunteersPage />}
                  />
                  <Route path="settings" element={<AccountSettingsPage />} />
                </Route>

                <Route
                  path="/admin/dashboard"
                  element={<Navigate to="/portal/admin" replace />}
                />
                <Route
                  path="/manager/dashboard"
                  element={<Navigate to="/portal/manager" replace />}
                />
              </Routes>
            </Router>
          </TooltipProvider>
        </LocalStoreCartProvider>
      </CityProvider>
    </AuthProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppContent />
  </QueryClientProvider>
);


export default App;
