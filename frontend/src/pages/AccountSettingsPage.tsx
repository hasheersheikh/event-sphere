import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Lock,
  Mail,
  Shield,
  ChevronRight,
  Info,
  Settings,
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
      const token = localStorage.getItem("token");
      if (token) login(token, data.user);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success("Password updated successfully");
      setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 opacity-60" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10 opacity-60" />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Compact Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Settings className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Terminal Configuration</span>
            </div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none brand-font">
              Settings<span className="text-primary">.</span>
            </h1>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-[9px] font-black uppercase tracking-widest leading-loose bg-muted/20 px-3 py-1.5 rounded-lg border border-border/40 inline-block">
              Clearance: <span className="text-foreground">{user?.role?.replace("_", " ")}</span>
              <span className="mx-2 opacity-20">|</span>
              Status: <span className="text-emerald-500">Encrypted</span>
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Profile Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary border border-primary/20">
                <User className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-black italic uppercase tracking-tight brand-font">
                Identity <span className="text-primary">Protocol.</span>
              </h2>
            </div>

            <div className="p-4 md:p-6 bg-card border border-border/60 rounded-2xl shadow-xl backdrop-blur-sm">
              {/* Avatar */}
              <div className="flex items-center gap-6 mb-8">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/20 flex items-center justify-center text-2xl font-black italic shadow-lg shadow-primary/5">
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black italic uppercase tracking-tight brand-font text-foreground">
                    {user?.name}
                  </h3>
                  <p className="text-muted-foreground text-[9px] font-black uppercase tracking-widest opacity-60">
                    {user?.email}
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    System Designation
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary opacity-60" />
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-10 pl-11 bg-muted/20 border-border/60 focus:border-primary rounded-xl font-bold transition-all text-xs uppercase"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5 opacity-60 cursor-not-allowed">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Verified Endpoint (Immutable)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/30" />
                    <Input
                      value={user?.email}
                      disabled
                      className="h-10 pl-11 bg-muted/40 border-border/60 rounded-xl font-bold cursor-not-allowed text-xs"
                    />
                  </div>
                </div>
                <div className="md:col-span-2 pt-2">
                  <Button
                    disabled={isLoading}
                    className="h-10 px-8 bg-primary hover:bg-primary/90 text-black rounded-xl font-black uppercase tracking-widest text-[10px] italic group shadow-lg shadow-primary/10 transition-all hover:scale-105"
                  >
                    Authorize Update
                    <ChevronRight className="h-3.5 w-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </form>
            </div>
          </section>

          {/* Password Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-muted border border-border/40 rounded-lg flex items-center justify-center text-foreground">
                <Shield className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-black italic uppercase tracking-tight brand-font">
                Security <span className="text-primary">Override.</span>
              </h2>
            </div>

            <div className="p-4 md:p-6 bg-card border border-border/60 rounded-2xl shadow-xl backdrop-blur-sm">
              <form onSubmit={handlePasswordReset} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Current Authentication Token
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground opacity-60" />
                    <Input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="h-10 pl-11 bg-muted/20 border-border/60 focus:border-primary rounded-xl font-bold transition-all text-xs"
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      New Security Key
                    </label>
                    <Input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="h-10 bg-muted/20 border-border/60 focus:border-primary rounded-xl font-bold transition-all text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Confirm Transmission
                    </label>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="h-10 bg-muted/20 border-border/60 focus:border-primary rounded-xl font-bold transition-all text-xs"
                      required
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    disabled={isLoading}
                    className="h-10 px-8 bg-foreground text-background hover:bg-foreground/90 rounded-xl font-black uppercase tracking-widest text-[10px] italic transition-all hover:scale-105"
                  >
                    Update Protocol
                  </Button>
                </div>
              </form>
            </div>
          </section>

          {/* Logic/Safety Note */}
          <div className="p-4 bg-muted/20 border border-dashed border-border/60 rounded-xl flex items-start gap-3">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[9px] font-bold text-muted-foreground leading-relaxed uppercase tracking-wide">
              Initiating a password rotation will terminate all active session tokens. You will be required to re-authenticate on all synchronized hardware terminals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
