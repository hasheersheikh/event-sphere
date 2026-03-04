import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  UserMinus,
  Search,
  MoreHorizontal,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const UsersManagement = () => {
  const users = [
    {
      id: 1,
      name: "Alexander Pierce",
      email: "alex@example.com",
      role: "Event Manager",
      status: "Active",
      joined: "2024-01-15",
    },
    {
      id: 2,
      name: "Sarah Connor",
      email: "sarah@resistance.io",
      role: "Customer",
      status: "Active",
      joined: "2024-02-10",
    },
    {
      id: 3,
      name: "Rick Sanchez",
      email: "rick@multiverse.org",
      role: "Event Manager",
      status: "Pending",
      joined: "2024-03-01",
    },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4 text-[var(--mnkhan-orange)] uppercase tracking-[0.3em] font-black text-[10px]">
            <Users className="h-4 w-4" />
            Directory Access
          </div>
          <h1 className="text-4xl font-black brand-font tracking-tighter uppercase leading-none">
            Account Control
          </h1>
          <p className="text-muted-foreground font-medium mt-3">
            Monitor and manage all platform participants.
          </p>
        </div>
        <div className="flex gap-4">
          <Button className="bg-[var(--mnkhan-charcoal)] hover:bg-black text-white text-[10px] font-black uppercase tracking-widest px-8 py-6 rounded-none shadow-xl">
            Export Data
          </Button>
        </div>
      </header>

      <section className="bg-white border-2 border-black overflow-hidden relative">
        <div className="p-6 border-b-2 border-black bg-[var(--mnkhan-gray-bg)] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-none"
            >
              All Members
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-[10px] font-black uppercase tracking-widest rounded-none border-2"
            >
              Pending
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-[10px] font-black uppercase tracking-widest rounded-none border-2"
            >
              Suspended
            </Button>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="FILTER BY IDENTITY..."
              className="w-full bg-white border-2 border-black py-2 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest placeholder:opacity-30 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--mnkhan-charcoal)] text-white text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Member Identity</th>
                <th className="px-8 py-6">Operational Role</th>
                <th className="px-8 py-6">Current Status</th>
                <th className="px-8 py-6">Registration</th>
                <th className="px-8 py-6 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black">
              {users.map((u, index) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-[var(--mnkhan-gray-bg)] transition-colors group"
                >
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-black text-white flex items-center justify-center font-black text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight group-hover:text-[var(--mnkhan-orange)] transition-colors">
                          {u.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-bold">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <Badge className="bg-[var(--mnkhan-gray-bg)] text-black border-2 border-black rounded-none text-[9px] font-black uppercase tracking-widest px-3 py-1">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 ${u.status === "Active" ? "bg-emerald-500" : "bg-orange-500"}`}
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {u.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-7 text-[10px] font-black text-muted-foreground tabular-nums">
                    {u.joined}
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
                        className="h-9 w-9 rounded-none border-2 border-black hover:bg-orange-500 hover:text-white"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
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
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <div className="bg-orange-500 p-8 border-2 border-black flex items-center gap-6">
          <div className="h-16 w-16 bg-black text-white flex items-center justify-center">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-black brand-font uppercase tracking-tight">
              Access Escalation
            </h3>
            <p className="text-black/70 text-xs font-bold uppercase tracking-wider mt-1">
              Review 4 pending manager overrides
            </p>
          </div>
        </div>
        <div className="bg-black p-8 border-2 border-black flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white brand-font uppercase tracking-tight">
              System Logs
            </h3>
            <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mt-1 italic">
              Last sync: 2 minutes ago
            </p>
          </div>
          <Button className="bg-[var(--mnkhan-orange)] hover:bg-[var(--mnkhan-orange-hover)] text-white text-[10px] font-black uppercase tracking-widest px-6 rounded-none">
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;
