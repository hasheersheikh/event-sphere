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
    <div className="space-y-10 min-h-screen bg-background p-6 md:p-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10">
        <div>
          <div className="flex items-center gap-3 mb-4 text-primary uppercase tracking-[0.3em] font-black text-[10px]">
            <Users className="h-4 w-4" />
            Platform Directory
          </div>
          <h1 className="text-5xl font-black brand-font tracking-tighter uppercase leading-none text-foreground">
            Attendee <span className="text-primary">Registry.</span>
          </h1>
          <p className="text-muted-foreground font-medium mt-4 max-w-xl">
            Real-time monitoring and management of verified platform
            participants.
          </p>
        </div>
      </header>

      <section className="bg-card border border-border overflow-hidden backdrop-blur-xl shadow-sm rounded-[var(--radius)]">
        <div className="p-6 border-b border-border bg-muted/30 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-primary text-primary-foreground rounded-full">
            {filteredAttendees.length} Verified Identities
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="SEARCH IDENTITY..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest placeholder:opacity-40 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Identity</th>
                <th className="px-8 py-6">Role</th>
                <th className="px-8 py-6">Sync Date</th>
                <th className="px-8 py-6 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-20 text-center font-black uppercase text-[10px] tracking-widest animate-pulse text-muted-foreground"
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
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center font-black text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase tracking-tight group-hover:text-primary transition-colors text-foreground">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-bold">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <Badge className="bg-background text-foreground border border-border rounded-lg text-[9px] font-black uppercase tracking-widest px-3 py-1">
                        Attendee
                      </Badge>
                    </td>
                    <td className="px-8 py-7 text-[10px] font-black text-muted-foreground tabular-nums">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-7 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-9 w-9 rounded-lg border-border hover:bg-background hover:text-primary transition-colors"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-9 w-9 rounded-lg border-border hover:bg-destructive hover:text-destructive-foreground transition-colors"
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
