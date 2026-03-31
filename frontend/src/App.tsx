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
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PwaInstallPrompt from "./components/layout/PwaInstallPrompt";
import LocalStoresPage from "./pages/LocalStoresPage";
import AdminLocalStoresPage from "./pages/admin/LocalStoresPage";
import StoreDetailPage from "./pages/StoreDetailPage";
import PaymentCallbackPage from "./pages/PaymentCallbackPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            {/* Pages with Navbar */}
            <Route
              element={
                <>
                  <Navbar />
                  <Outlet />
                  <PwaInstallPrompt />
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

            {/* Payment Callback (No Site Navbar) */}
            <Route path="/payment/callback" element={<PaymentCallbackPage />} />

            {/* Auth Routes (No Site Navbar) */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/admin-auth" element={<AdminLoginPage />} />
            <Route path="/manager/login" element={<ManagerLoginPage />} />
            <Route path="/staff/login" element={<StaffLoginPage />} />
            <Route path="/volunteer-login" element={<VolunteerLoginPage />} />

            {/* Portal Routes (No Global Navbar) */}
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
              <Route path="admin/local-stores" element={<AdminLocalStoresPage />} />
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
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
