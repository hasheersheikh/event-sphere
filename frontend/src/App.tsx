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
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersManagement from "./pages/admin/UsersManagement";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import MyProductions from "./pages/manager/MyProductions";
import PortalLayout from "./components/layout/PortalLayout";
import Navbar from "./components/layout/Navbar";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PwaInstallPrompt from "./components/layout/PwaInstallPrompt";

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
                        path="categories"
                        element={
                          <div className="container py-20 text-center font-black text-4xl uppercase brand-font">
                            Coming Soon
                          </div>
                        }
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
                      <Route path="auth" element={<AuthPage />} />
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
                      <Route path="admin-auth" element={<AdminLoginPage />} />
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
                            allowedRoles={["event_manager", "admin"]}
                          >
                            <ScannerPage />
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
              <Route path="manager" element={<ManagerDashboard />} />
              {/* Add more management pages here */}
              <Route
                path="users"
                element={<div className="p-8">Users Management Content</div>}
              />
              <Route
                path="settings"
                element={<div className="p-8">Settings Content</div>}
              />
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
