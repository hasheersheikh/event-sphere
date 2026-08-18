import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import ImageCropDialog from "@/components/upload/ImageCropDialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import PortalLayout from "./components/layout/PortalLayout";
import Navbar from "./components/layout/Navbar";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { LocalStoreCartProvider } from "./contexts/LocalStoreCartContext";
import LocalStoreCartDrawer from "./components/home/LocalStoreCartDrawer";
import { CityProvider } from "./contexts/CityContext";
import CitySelectModal from "./components/layout/CitySelectModal";
import { useMaintenanceMode } from "./hooks/useMaintenanceMode";
import ScrollToTop from "./components/layout/ScrollToTop";
import { FEATURES } from "./config/features";

// Lazy load all page components - reduces initial bundle by ~60-70%
const Index = lazy(() => import("./pages/Index").then(m => ({ default: m.default })));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const VenuesPage = lazy(() => import("./pages/VenuesPage"));
const EventDetailPage = lazy(() => import("./pages/EventDetailPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CreateEventPage = lazy(() => import("./pages/CreateEventPage"));
const EventPendingPage = lazy(() => import("./pages/EventPendingPage"));
const MyTickets = lazy(() => import("./pages/MyTickets"));
const ScannerPage = lazy(() => import("./pages/ScannerPage"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AccountSettingsPage = lazy(() => import("./pages/AccountSettingsPage"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const ManagerLoginPage = lazy(() => import("./pages/ManagerLoginPage"));
const StaffLoginPage = lazy(() => import("./pages/StaffLoginPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AttendeesPage = lazy(() => import("./pages/admin/AttendeesPage"));
const ManagersPage = lazy(() => import("./pages/admin/ManagersPage"));
const ManagerDetailPage = lazy(() => import("./pages/admin/ManagerDetailPage"));
const EventModerationPage = lazy(() => import("./pages/admin/EventModerationPage"));
const EventInsightsPage = lazy(() => import("./pages/admin/EventInsightsPage"));
const AnalyticsPage = lazy(() => import("./pages/admin/AnalyticsPage"));
const ManagerDashboard = lazy(() => import("./pages/manager/ManagerDashboard"));
const MyEventsPage = lazy(() => import("./pages/manager/MyEventsPage"));
const EditEventPage = lazy(() => import("./pages/manager/EditEventPage"));
const ManageEventPage = lazy(() => import("./pages/manager/ManageEventPage"));
const ManagerEventAnalyticsPage = lazy(() => import("./pages/manager/ManagerEventAnalyticsPage"));
const ManageVolunteersPage = lazy(() => import("./pages/manager/ManageVolunteersPage"));
const PayoutsPage = lazy(() => import("./pages/manager/PayoutsPage"));
const ManagerSalesAnalyticsPage = lazy(() => import("./pages/manager/ManagerSalesAnalyticsPage"));
const VolunteerLoginPage = lazy(() => import("./pages/VolunteerLoginPage"));
const ScannerDashboardPage = lazy(() => import("./pages/ScannerDashboardPage"));
const LocalStoresPage = lazy(() => import("./pages/LocalStoresPage"));
const AdminLocalStoresPage = lazy(() => import("./pages/admin/LocalStoresPage"));
const CreateStorePage = lazy(() => import("./pages/admin/CreateStorePage"));
const AdminStoreDetailPage = lazy(() => import("./pages/admin/AdminStoreDetailPage"));
const StoreDetailPage = lazy(() => import("./pages/StoreDetailPage"));
const StoreOwnerLoginPage = lazy(() => import("./pages/StoreOwnerLoginPage"));
const StoreOwnerPortal = lazy(() => import("./pages/StoreOwnerPortal"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const BlogManagementPage = lazy(() => import("./pages/admin/BlogManagementPage"));
const CreateBlogPostPage = lazy(() => import("./pages/admin/CreateBlogPostPage"));
const MyOrdersPage = lazy(() => import("./pages/MyOrdersPage"));
const StoreOrdersPage = lazy(() => import("./pages/admin/StoreOrdersPage"));
const PaymentCallbackPage = lazy(() => import("./pages/PaymentCallbackPage"));
const MaintenancePage = lazy(() => import("./pages/MaintenancePage"));
const HeroManagementPage = lazy(() => import("./pages/admin/HeroManagementPage"));
const RefundManagementPage = lazy(() => import("./pages/admin/RefundManagementPage"));
const InfluencerManagementPage = lazy(() => import("./pages/admin/InfluencerManagementPage"));
const TrendingVenueManagementPage = lazy(() => import("./pages/admin/TrendingVenueManagementPage"));
const ShowcaseManagementPage = lazy(() => import("./pages/admin/ShowcaseManagementPage"));
const BoostMarketingPage = lazy(() => import("./pages/BoostMarketingPage"));
const BoostRequestPage = lazy(() => import("./pages/BoostRequestPage"));
const ListYourEventPage = lazy(() => import("./pages/ListYourEventPage"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-zinc-100"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - reduces redundant API calls
      gcTime: 10 * 60 * 1000,   // 10 minutes - cache cleanup
      retry: 1,
    },
  },
});

const AppContent = () => {
  const { data: isMaintenance } = useMaintenanceMode();

  if (isMaintenance) {
    return (
      <Suspense fallback={<PageLoader />}>
        <MaintenancePage />
      </Suspense>
    );
  }

  return (
    <AuthProvider>
      <CityProvider>
        <LocalStoreCartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <ImageCropDialog />
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
                        <Suspense fallback={<PageLoader />}>
                          <Index />
                        </Suspense>
                      </main>
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <main className="main-content pt-16 md:pt-20 min-h-screen">
                        <Suspense fallback={<PageLoader />}>
                          <Routes>
                            <Route path="events" element={<EventsPage />} />
                            <Route path="venues" element={<VenuesPage />} />
                            <Route path="local-stores" element={<LocalStoresPage />} />
                            <Route path="local-stores/:id" element={<StoreDetailPage />} />
                            <Route
                              path="events/create"
                              element={
                                <ProtectedRoute allowedRoles={["event_manager", "admin"]}>
                                  <CreateEventPage />
                                </ProtectedRoute>
                              }
                            />
                            <Route path="events/:id" element={<EventDetailPage />} />
                            <Route path="boost" element={<BoostMarketingPage />} />
                            <Route path="boost/request" element={<BoostRequestPage />} />
                            <Route path="list-your-event" element={<ListYourEventPage />} />
                            <Route path="events/:id/success" element={<EventPendingPage />} />
                            <Route path="reset-password" element={<ResetPasswordPage />} />
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
                                <ProtectedRoute allowedRoles={["event_manager", "admin", "volunteer"]}>
                                  <ScannerPage />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="scanner/dashboard"
                              element={
                                <ProtectedRoute allowedRoles={["event_manager", "admin", "volunteer"]}>
                                  <ScannerDashboardPage />
                                </ProtectedRoute>
                              }
                            />
                            {FEATURES.ENABLE_BLOGS && (
                              <>
                                <Route path="blog" element={<BlogPage />} />
                                <Route path="blog/:slug" element={<BlogPostPage />} />
                              </>
                            )}
                            <Route path="about" element={<AboutPage />} />
                            <Route path="terms" element={<TermsOfService />} />
                            <Route path="privacy" element={<PrivacyPolicy />} />
                            <Route path="help" element={<HelpCenter />} />
                            <Route path="contact" element={<ContactPage />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Suspense>
                      </main>
                    }
                  />
                </Route>

                <Route path="/payment/callback" element={<Suspense fallback={<PageLoader />}><PaymentCallbackPage /></Suspense>} />
                <Route path="/store-owner/login" element={<Suspense fallback={<PageLoader />}><StoreOwnerLoginPage /></Suspense>} />
                <Route path="/store-owner/portal" element={<Suspense fallback={<PageLoader />}><StoreOwnerPortal /></Suspense>} />

                {FEATURES.ENABLE_BLOGS && (
                  <>
                    <Route
                      path="/portal/admin/blog/new"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <Suspense fallback={<PageLoader />}><CreateBlogPostPage /></Suspense>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/portal/admin/blog/:id/edit"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <Suspense fallback={<PageLoader />}><CreateBlogPostPage /></Suspense>
                        </ProtectedRoute>
                      }
                    />
                  </>
                )}

                <Route path="/auth" element={<Suspense fallback={<PageLoader />}><AuthPage /></Suspense>} />
                <Route path="/admin-auth" element={<Suspense fallback={<PageLoader />}><AdminLoginPage /></Suspense>} />
                <Route path="/manager/login" element={<Suspense fallback={<PageLoader />}><ManagerLoginPage /></Suspense>} />
                <Route path="/staff/login" element={<Suspense fallback={<PageLoader />}><StaffLoginPage /></Suspense>} />
                <Route path="/volunteer-login" element={<Suspense fallback={<PageLoader />}><VolunteerLoginPage /></Suspense>} />

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
                  <Route path="admin" element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
                  <Route path="admin/attendees" element={<Suspense fallback={<PageLoader />}><AttendeesPage /></Suspense>} />
                  <Route path="admin/managers" element={<Suspense fallback={<PageLoader />}><ManagersPage /></Suspense>} />
                  <Route path="admin/managers/:id" element={<Suspense fallback={<PageLoader />}><ManagerDetailPage /></Suspense>} />
                  <Route path="admin/events" element={<Suspense fallback={<PageLoader />}><EventModerationPage /></Suspense>} />
                  <Route path="admin/events/:id" element={<Suspense fallback={<PageLoader />}><EventInsightsPage /></Suspense>} />
                  <Route path="admin/events/:id/edit" element={<Suspense fallback={<PageLoader />}><EditEventPage /></Suspense>} />
                  {FEATURES.ENABLE_BLOGS && (
                    <Route path="admin/blog" element={<Suspense fallback={<PageLoader />}><BlogManagementPage /></Suspense>} />
                  )}
                  <Route path="admin/local-stores" element={<Suspense fallback={<PageLoader />}><AdminLocalStoresPage /></Suspense>} />
                  <Route path="admin/local-stores/new" element={<Suspense fallback={<PageLoader />}><CreateStorePage /></Suspense>} />
                  <Route path="admin/local-stores/:id" element={<Suspense fallback={<PageLoader />}><AdminStoreDetailPage /></Suspense>} />
                  <Route path="admin/local-stores/:id/edit" element={<Suspense fallback={<PageLoader />}><CreateStorePage /></Suspense>} />
                  <Route path="admin/store-orders" element={<Suspense fallback={<PageLoader />}><StoreOrdersPage /></Suspense>} />
                  <Route path="admin/hero" element={<Suspense fallback={<PageLoader />}><HeroManagementPage /></Suspense>} />
                  <Route path="admin/trending-venues" element={<Suspense fallback={<PageLoader />}><TrendingVenueManagementPage /></Suspense>} />
                  <Route path="admin/refunds" element={<Suspense fallback={<PageLoader />}><RefundManagementPage /></Suspense>} />
                  <Route path="admin/influencers" element={<Suspense fallback={<PageLoader />}><InfluencerManagementPage /></Suspense>} />
                  <Route path="admin/showcase" element={<Suspense fallback={<PageLoader />}><ShowcaseManagementPage /></Suspense>} />
                  <Route path="manager" element={<Suspense fallback={<PageLoader />}><ManagerDashboard /></Suspense>} />
                  <Route path="manager/payouts" element={<Suspense fallback={<PageLoader />}><PayoutsPage /></Suspense>} />
                  <Route path="manager/analytics" element={<Suspense fallback={<PageLoader />}><ManagerSalesAnalyticsPage /></Suspense>} />
                  <Route path="analytics" element={<Suspense fallback={<PageLoader />}><AnalyticsPage /></Suspense>} />
                  <Route path="events" element={<Suspense fallback={<PageLoader />}><MyEventsPage /></Suspense>} />
                  <Route
                    path="manager/events/:id/details"
                    element={<Suspense fallback={<PageLoader />}><ManageEventPage /></Suspense>}
                  />
                  <Route
                    path="manager/events/:id/edit"
                    element={<Suspense fallback={<PageLoader />}><EditEventPage /></Suspense>}
                  />
                  <Route
                    path="manager/events/:id/analytics"
                    element={<Suspense fallback={<PageLoader />}><ManagerEventAnalyticsPage /></Suspense>}
                  />
                  <Route
                    path="manager/events/:eventId/volunteers"
                    element={<Suspense fallback={<PageLoader />}><ManageVolunteersPage /></Suspense>}
                  />
                  <Route path="settings" element={<Suspense fallback={<PageLoader />}><AccountSettingsPage /></Suspense>} />
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
