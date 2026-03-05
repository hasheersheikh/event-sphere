import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, Mail, UserMinus, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { toast } from "sonner";

const AttendeesPage = () => {
  const [attendees, setAttendees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAttendees();
  }, []);

  const fetchAttendees = async () => {
    try {
      const response = await api.get("/admin/attendees");
      setAttendees(response.data);
    } catch (error) {
      toast.error("Failed to load attendees directory.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAttendees = attendees.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-10 min-h-screen bg-zinc-950 p-6 md:p-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-4 text-emerald-400 uppercase tracking-[0.3em] font-black text-[10px]">
            <Users className="h-4 w-4" />
            Platform Directory
          </div>
          <h1 className="text-5xl font-black brand-font tracking-tighter uppercase leading-none text-white">
            Attendee <span className="text-emerald-500">Registry.</span>
          </h1>
          <p className="text-zinc-400 font-medium mt-4 max-w-xl">
            Real-time monitoring and management of verified platform
            participants.
          </p>
        </div>
      </header>

      <section className="bg-zinc-900/50 border border-white/5 overflow-hidden backdrop-blur-xl">
        <div className="p-6 border-b border-white/5 bg-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-emerald-500 text-black">
            {filteredAttendees.length} Verified Identities
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="SEARCH IDENTITY..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-black py-3 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest placeholder:opacity-30 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--mnkhan-charcoal)] text-white text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Identity</th>
                <th className="px-8 py-6">Role</th>
                <th className="px-8 py-6">Sync Date</th>
                <th className="px-8 py-6 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-20 text-center font-black uppercase text-[10px] tracking-widest animate-pulse"
                  >
                    Scanning Directory...
                  </td>
                </tr>
              ) : filteredAttendees.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-20 text-center font-black uppercase text-[10px] tracking-widest text-muted-foreground"
                  >
                    No matching identities found.
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((u, index) => (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-[var(--mnkhan-gray-bg)] transition-colors group"
                  >
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-black text-white flex items-center justify-center font-black text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase tracking-tight group-hover:text-emerald-500 transition-colors">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-bold">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <Badge className="bg-white text-black border-2 border-black rounded-none text-[9px] font-black uppercase tracking-widest px-3 py-1">
                        Attendee
                      </Badge>
                    </td>
                    <td className="px-8 py-7 text-[10px] font-black text-muted-foreground tabular-nums">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-7 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-9 w-9 rounded-none border-2 border-black hover:bg-black hover:text-white"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-9 w-9 rounded-none border-2 border-black hover:bg-destructive hover:text-white"
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AttendeesPage;
