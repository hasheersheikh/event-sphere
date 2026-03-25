import { useState } from "react";
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
  Camera,
  Settings2,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

const AccountSettingsPage = () => {
  const { user, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.patch("/auth/profile", {
        name: formData.name,
      });
      // Update local storage/context with new user data
      const token = localStorage.getItem("token");
      if (token) {
        login(token, data.user);
      }
      toast.success("Identity synced successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Keywords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success("Security protocols updated");
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Protocol update failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-8 lg:p-12 overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
          <div>
            <div className="flex items-center gap-2 text-primary mb-4 animate-pulse">
              <Settings2 className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                System Configuration
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                Account <span className="text-primary">Settings.</span>
              </h1>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest leading-loose">
              Presence: <span className="text-foreground">{user?.role}</span>
              <br />
              Node: <span className="text-foreground">Active</span>
            </p>
          </div>
        </div>

        <div className="space-y-12">
          {/* Identity Section */}
          <section className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <User className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter">
                Identity <span className="text-primary">Node.</span>
              </h2>
            </div>

            <div className="p-8 md:p-12 bg-card border border-border rounded-[2.5rem] relative overflow-hidden group shadow-sm">
              <div className="relative z-10 space-y-10">
                <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                  <div className="relative group">
                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 p-1 shadow-lg">
                      <div className="h-full w-full rounded-full bg-background flex items-center justify-center text-4xl font-black italic">
                        {user?.name?.charAt(0)}
                      </div>
                    </div>
                    <button className="absolute bottom-1 right-1 p-2 bg-primary text-primary-foreground rounded-full shadow-lg group-hover:scale-110 transition-transform">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter mb-1 text-foreground">
                      {user?.name}
                    </h3>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                      Primary Biological Identifier
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleUpdateProfile}
                  className="grid md:grid-cols-2 gap-8"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Display Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            name: e.target.value,
                          })
                        }
                        className="h-14 pl-14 bg-muted/30 border-border focus:border-primary rounded-2xl font-bold transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2 opacity-50 cursor-not-allowed">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Primary Endpoint (Email)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                      <Input
                        value={user?.email}
                        disabled
                        className="h-14 pl-14 bg-muted border-border rounded-2xl font-bold cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 pt-4">
                    <Button
                      disabled={isLoading}
                      className="h-14 px-10 bg-primary hover:bg-primary/90 text-black rounded-2xl font-black uppercase tracking-widest group shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    >
                      Update Identity
                      <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter">
                Security <span className="text-orange-500">Protocols.</span>
              </h2>
            </div>

            <div className="p-8 md:p-12 bg-card border border-border rounded-[2.5rem] shadow-sm">
              <form onSubmit={handlePasswordReset} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Current Keyword
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500/50" />
                    <Input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currentPassword: e.target.value,
                        })
                      }
                      className="h-14 pl-14 bg-muted/30 border-border focus:border-orange-500 rounded-2xl font-bold transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      New Keyword
                    </label>
                    <Input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newPassword: e.target.value,
                        })
                      }
                      className="h-14 bg-muted/30 border-border focus:border-orange-500 rounded-2xl font-bold transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Confirm Protocol
                    </label>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="h-14 bg-muted/30 border-border focus:border-orange-500 rounded-2xl font-bold transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <Button
                    disabled={isLoading}
                    className="h-14 px-10 bg-foreground text-background hover:bg-foreground/90 rounded-2xl font-black uppercase tracking-widest"
                  >
                    Rotate Security Keys
                  </Button>
                </div>
              </form>
            </div>
          </section>

          {/* Warning Section */}
          <div className="p-8 bg-orange-500/5 border border-orange-500/10 rounded-[2rem] flex flex-col md:flex-row items-center gap-6">
            <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1">
                Security Advisory
              </p>
              <p className="text-xs font-medium italic text-muted-foreground">
                Updating your identity or protocols may require re-authentication. 
                Ensure all session data is cached before proceeding with heavy configuration changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
