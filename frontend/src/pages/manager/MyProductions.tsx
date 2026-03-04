import { motion } from "framer-motion";
import {
  Calendar,
  ExternalLink,
  Plus,
  Trash2,
  Filter,
  Layers,
  BarChart3,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MyProductions = () => {
  const productions = [
    {
      id: 1,
      title: "Neon Nights 2024",
      status: "Live",
      ticketsSold: 450,
      capacity: 500,
      date: "Apr 20, 2024",
      image:
        "https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=800&q=80",
    },
    {
      id: 2,
      title: "Underground Bass",
      status: "Sales Ending",
      ticketsSold: 120,
      capacity: 150,
      date: "May 05, 2024",
      image:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
    },
    {
      id: 3,
      title: "Skyline Festival",
      status: "Draft",
      ticketsSold: 0,
      capacity: 5000,
      date: "Aug 12, 2024",
      image:
        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
    },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4 text-[var(--mnkhan-orange)] uppercase tracking-[0.3em] font-black text-[10px]">
            <Layers className="h-4 w-4" />
            Lineup Overview
          </div>
          <h1 className="text-4xl font-black brand-font tracking-tighter uppercase leading-none">
            Your Productions
          </h1>
          <p className="text-muted-foreground font-medium mt-3">
            Manage your stage schedules and ticketing performance.
          </p>
        </div>
        <div className="flex gap-4">
          <Link to="/events/create">
            <Button className="bg-[var(--mnkhan-orange)] hover:bg-[var(--mnkhan-orange-hover)] text-white text-[10px] font-black uppercase tracking-[0.2em] px-10 py-7 rounded-none shadow-button gap-3">
              <Plus className="h-4 w-4" />
              New Production
            </Button>
          </Link>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid md:grid-cols-3 gap-0 border-2 border-black bg-white">
        <div className="p-8 border-r-2 border-black group hover:bg-[var(--mnkhan-gray-bg)] transition-colors">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Total Revenue
          </p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black leading-none uppercase">
              ₹1,24,500
            </span>
            <span className="text-[10px] font-black text-emerald-500 italic">
              +12% vs last mo
            </span>
          </div>
        </div>
        <div className="p-8 border-r-2 border-black group hover:bg-[var(--mnkhan-gray-bg)] transition-colors">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Active Tickets
          </p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black leading-none uppercase">
              572
            </span>
            <span className="text-[10px] font-black text-muted-foreground italic">
              of 6,500 available
            </span>
          </div>
        </div>
        <div className="p-8 group hover:bg-black hover:text-white transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground group-hover:text-white/40">
              Market Heat
            </p>
            <BarChart3 className="h-4 w-4 text-[var(--mnkhan-orange)]" />
          </div>
          <div className="h-2 w-full bg-muted/20 mt-2">
            <div className="h-full bg-[var(--mnkhan-orange)] w-[70%]" />
          </div>
        </div>
      </div>

      <div className="pt-8 border-t-2 border-black mt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black brand-font uppercase tracking-tight">
            Production Roster
          </h2>
          <Button
            variant="outline"
            className="rounded-none border-2 border-black font-black text-[10px] uppercase tracking-widest gap-2"
          >
            <Filter className="h-3 w-3" />
            Filter Lineup
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productions.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border-2 border-black overflow-hidden group hover:-translate-y-2 transition-transform duration-500"
            >
              <div className="aspect-[4/3] relative overflow-hidden border-b-2 border-black">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                />
                <div className="absolute top-0 right-0 p-4">
                  <Badge className="bg-black text-white rounded-none border-none text-[8px] font-black uppercase tracking-widest px-3 py-1.5 backdrop-blur-md bg-black/80">
                    {p.status}
                  </Badge>
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-4 text-[9px] font-black uppercase tracking-widest text-[var(--mnkhan-orange)]">
                  <Clock className="h-3 w-3" />
                  {p.date}
                </div>
                <h3 className="text-xl font-black brand-font uppercase tracking-tighter mb-8 leading-tight group-hover:text-[var(--mnkhan-orange)] transition-colors">
                  {p.title}
                </h3>

                <div className="space-y-4 mb-10">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                    <span className="text-muted-foreground">
                      Sales Progress
                    </span>
                    <span>
                      {Math.round((p.ticketsSold / p.capacity) * 100)}%
                    </span>
                  </div>
                  <div className="h-1 w-full bg-muted/30">
                    <div
                      className="h-full bg-black transition-all duration-1000 group-hover:bg-[var(--mnkhan-orange)]"
                      style={{
                        width: `${(p.ticketsSold / p.capacity) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-px border-t-2 border-black pt-6">
                  <Link
                    to={`/portal/analytics`}
                    className="border-r-2 border-black pr-4"
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-0 h-auto text-[9px] font-black uppercase tracking-widest gap-2 hover:bg-transparent hover:text-[var(--mnkhan-orange)] group-hover:translate-x-1 transition-transform"
                    >
                      Analytics <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                  <div className="pl-4 flex justify-end">
                    <button className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyProductions;
