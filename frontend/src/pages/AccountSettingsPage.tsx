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
    <div className="min-h-screen bg-background text-foreground p-6 md:p-8 lg:p-12 overflow-hidden relative">
      {/* Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
          <div>
            <div className="flex items-center gap-2 text-primary mb-4">
              <Settings className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Account</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
              Settings<span className="text-primary">.</span>
            </h1>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest leading-loose">
              Role: <span className="text-foreground">{user?.role?.replace("_", " ")}</span>
              <br />
              Status: <span className="text-emerald-500">Active</span>
            </p>
          </div>
        </div>

        <div className="space-y-12">
          {/* Profile Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <User className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter">
                Profile<span className="text-primary">.</span>
              </h2>
            </div>

            <div className="p-8 md:p-12 bg-card border border-border rounded-[2.5rem] shadow-sm">
              {/* Avatar */}
              <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 border border-primary/20 flex items-center justify-center text-4xl font-black">
                  {user?.name?.charAt(0)}
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter mb-1 text-foreground">
                    {user?.name}
                  </h3>
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                    {user?.email}
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-14 pl-14 bg-muted/30 border-border focus:border-primary rounded-2xl font-bold transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2 opacity-50 cursor-not-allowed">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Email Address
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
                    className="h-14 px-10 bg-primary hover:bg-primary/90 text-black rounded-2xl font-black uppercase tracking-widest group shadow-lg"
                  >
                    Save Changes
                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </form>
            </div>
          </section>

          {/* Password Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center text-foreground">
                <Shield className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter">
                Change Password<span className="text-primary">.</span>
              </h2>
            </div>

            <div className="p-8 md:p-12 bg-card border border-border rounded-[2.5rem] shadow-sm">
              <form onSubmit={handlePasswordReset} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="h-14 pl-14 bg-muted/30 border-border focus:border-primary rounded-2xl font-bold transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="h-14 bg-muted/30 border-border focus:border-primary rounded-2xl font-bold transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="h-14 bg-muted/30 border-border focus:border-primary rounded-2xl font-bold transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <Button
                    disabled={isLoading}
                    className="h-14 px-10 bg-foreground text-background hover:bg-foreground/90 rounded-2xl font-black uppercase tracking-widest"
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </div>
          </section>

          {/* Note */}
          <div className="p-6 bg-muted/30 border border-border rounded-[1.5rem] flex items-start gap-4">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-muted-foreground leading-relaxed">
              Changing your password will require you to log in again on all other devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
