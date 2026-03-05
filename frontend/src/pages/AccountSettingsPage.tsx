import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
  Mail,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Camera,
  Settings2,
  Bell,
  Fingerprint,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

const AccountSettingsPage = () => {
  const { user, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
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

  const tabs = [
    { id: "profile", label: "Identity", icon: User },
    { id: "security", label: "Security", icon: ShieldCheck },
    { id: "notifications", label: "Frequency", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12 lg:p-20 overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 mb-4 animate-pulse">
              <Settings2 className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                System Configuration
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
              Account <span className="text-emerald-400">Settings.</span>
            </h1>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-loose">
              Presence: <span className="text-white">{user?.role}</span>
              <br />
              Node: <span className="text-white">Active</span>
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex lg:flex-col p-2 bg-white/5 border border-white/10 rounded-2xl overflow-x-auto lg:overflow-visible">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                      : "hover:bg-white/5 text-white/40"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="hidden lg:block p-6 bg-blue-500/5 border border-blue-500/20 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-blue-400">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Security Advisory
                </span>
              </div>
              <p className="text-[10px] font-medium leading-relaxed italic text-white/60">
                Rotate your access keywords periodically to maintain maximum
                node integrity within the collective.
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="p-8 md:p-12 bg-white/5 border border-white/10 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <User className="h-40 w-40" />
                    </div>

                    <div className="relative z-10 space-y-10">
                      <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                        <div className="relative group">
                          <div className="h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 p-1">
                            <div className="h-full w-full rounded-full bg-zinc-950 flex items-center justify-center text-4xl font-black italic">
                              {user?.name?.charAt(0)}
                            </div>
                          </div>
                          <button className="absolute bottom-1 right-1 p-2 bg-emerald-500 text-black rounded-full shadow-lg group-hover:scale-110 transition-transform">
                            <Camera className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-center md:text-left">
                          <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-1">
                            {user?.name}
                          </h3>
                          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
                            Individual Identity Node
                          </p>
                        </div>
                      </div>

                      <form
                        onSubmit={handleUpdateProfile}
                        className="grid md:grid-cols-2 gap-8"
                      >
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                            Display Username
                          </label>
                          <div className="relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                            <Input
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                              className="h-14 pl-14 bg-white/5 border-white/10 focus:border-emerald-500 rounded-2xl font-bold transition-all"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2 opacity-50 cursor-not-allowed">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                            Primary Endpoint (Email)
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                            <Input
                              value={user?.email}
                              disabled
                              className="h-14 pl-14 bg-white/5 border-white/10 rounded-2xl font-bold cursor-not-allowed"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-2 pt-4">
                          <Button
                            disabled={isLoading}
                            className="h-14 px-10 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-black uppercase tracking-widest group"
                          >
                            Update Identity
                            <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="p-8 md:p-12 bg-white/5 border border-white/10 rounded-[2.5rem]">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
                        <Fingerprint className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter">
                          Access Keyword Rotation
                        </h3>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
                          Update your security identifiers
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handlePasswordReset} className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                          Current Keyword
                        </label>
                        <Input
                          type="password"
                          value={formData.currentPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              currentPassword: e.target.value,
                            })
                          }
                          className="h-14 bg-white/5 border-white/10 focus:border-emerald-500 rounded-2xl font-bold transition-all"
                          required
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
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
                            className="h-14 bg-white/5 border-white/10 focus:border-emerald-500 rounded-2xl font-bold transition-all"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
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
                            className="h-14 bg-white/5 border-white/10 focus:border-emerald-500 rounded-2xl font-bold transition-all"
                            required
                          />
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button
                          disabled={isLoading}
                          className="h-14 px-10 bg-white text-black hover:bg-white/90 rounded-2xl font-black uppercase tracking-widest"
                        >
                          Modify Protocols
                        </Button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {activeTab === "notifications" && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="p-8 md:p-12 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-12">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                        <Bell className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter">
                          Event Frequency
                        </h3>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
                          Adjust system signal alerts
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {[
                        {
                          label: "Direct Signal Emails",
                          desc: "Receive immediate updates on ticket acquisitions and security alerts.",
                        },
                        {
                          label: "Frequency Broadcasts",
                          desc: "Weekly newsletter digest of upcoming pulse-rated events.",
                        },
                        {
                          label: "Identity Verifications",
                          desc: "Alerts when your node is accessed from new geolocations.",
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.07] transition-all cursor-pointer"
                        >
                          <div>
                            <p className="font-black uppercase tracking-widest text-xs mb-1">
                              {item.label}
                            </p>
                            <p className="text-[10px] text-white/40 italic">
                              {item.desc}
                            </p>
                          </div>
                          <div className="h-6 w-12 bg-emerald-500 rounded-full relative p-1 transition-all">
                            <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
