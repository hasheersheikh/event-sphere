import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  User,
  Lock,
  Mail,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

const AccountSettingsPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success("Password updated successfully");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--mnkhan-gray-bg)]">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="container max-w-5xl">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[var(--mnkhan-gray-border)] text-[9px] font-black uppercase tracking-[0.3em] text-[var(--mnkhan-text-muted)] mb-4">
              <ShieldCheck className="h-3 w-3 text-[var(--mnkhan-orange)]" />
              Security Hub
            </div>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none mb-2">
              Account{" "}
              <span className="text-[var(--mnkhan-orange)]">Settings.</span>
            </h1>
            <p className="text-[var(--mnkhan-text-muted)] font-bold italic">
              Manage your credentials and security preferences.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Sidebar Info */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white p-8 border-2 border-[var(--mnkhan-charcoal)]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 bg-[var(--mnkhan-charcoal)] text-white flex items-center justify-center font-black text-xl italic">
                    {user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black uppercase tracking-tighter">
                      {user?.name}
                    </p>
                    <p className="text-[10px] font-bold text-[var(--mnkhan-text-muted)] uppercase tracking-widest">
                      {user?.role}
                    </p>
                  </div>
                </div>
                <div className="space-y-4 pt-6 border-t border-[var(--mnkhan-gray-border)]">
                  <div className="flex items-center gap-3 text-[var(--mnkhan-text-muted)] italic text-sm">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-orange-500/5 border-l-4 border-[var(--mnkhan-orange)]">
                <p className="text-xs font-bold text-[var(--mnkhan-charcoal)] leading-relaxed italic">
                  "Security is our cornerstone. We recommend updating your
                  access keyword every 90 days to maintain maximum protection."
                </p>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Password Reset Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-[var(--mnkhan-charcoal)] p-10"
              >
                <div className="flex items-center gap-3 mb-10">
                  <div className="h-10 w-10 flex items-center justify-center bg-[var(--mnkhan-gray-bg)]">
                    <Lock className="h-5 w-5 text-[var(--mnkhan-charcoal)]" />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-widest italic">
                    Rotate Access Keyword
                  </h2>
                </div>

                <form onSubmit={handlePasswordReset} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--mnkhan-text-muted)] ml-1">
                      Current Keyword
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mnkhan-text-muted)]" />
                      <Input
                        type="password"
                        placeholder="EXISTING PASSWORD..."
                        value={formData.currentPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            currentPassword: e.target.value,
                          })
                        }
                        className="h-16 pl-14 bg-[var(--mnkhan-gray-bg)] border-2 border-transparent focus:border-[var(--mnkhan-charcoal)] rounded-none font-black text-xs uppercase tracking-widest transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--mnkhan-text-muted)] ml-1">
                        New Keyword
                      </label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mnkhan-text-muted)]" />
                        <Input
                          type="password"
                          placeholder="NEM PASSWORD..."
                          value={formData.newPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              newPassword: e.target.value,
                            })
                          }
                          className="h-16 pl-14 bg-[var(--mnkhan-gray-bg)] border-2 border-transparent focus:border-[var(--mnkhan-charcoal)] rounded-none font-black text-xs uppercase tracking-widest transition-all"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--mnkhan-text-muted)] ml-1">
                        Confirm New Keyword
                      </label>
                      <div className="relative">
                        <CheckCircle2 className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mnkhan-text-muted)]" />
                        <Input
                          type="password"
                          placeholder="CONFIRM..."
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="h-16 pl-14 bg-[var(--mnkhan-gray-bg)] border-2 border-transparent focus:border-[var(--mnkhan-charcoal)] rounded-none font-black text-xs uppercase tracking-widest transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="h-16 px-12 bg-[var(--mnkhan-charcoal)] hover:bg-black text-white rounded-none font-black uppercase tracking-[0.3em] text-[11px] group transition-all"
                    >
                      {isLoading ? "UPDATING..." : "UPDATE ACCESS KEYWORD"}
                      <ChevronRight className="h-4 w-4 ml-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </form>
              </motion.div>

              {/* Identity Info */}
              <div className="bg-white border-2 border-dashed border-[var(--mnkhan-gray-border)] p-10">
                <div className="flex items-center gap-3 mb-6">
                  <AlertCircle className="h-5 w-5 text-orange-400" />
                  <h3 className="text-sm font-black uppercase tracking-widest italic text-[var(--mnkhan-text-muted)]">
                    Verified Identity
                  </h3>
                </div>
                <p className="text-xs font-bold text-[var(--mnkhan-text-muted)] italic">
                  Your identity is verified via the City Pulse network. To
                  change your display name or primary email, please contact
                  support with valid documentation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AccountSettingsPage;
