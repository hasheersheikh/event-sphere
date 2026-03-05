import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Send } from "lucide-react";
import PulseLogo from "./PulseLogo";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Experience: [
      { label: "Live Events", href: "/events" },
      { label: "The Lineup", href: "/categories" },
      { label: "Create Hub", href: "/events/create" },
    ],
    Network: [
      { label: "Our Story", href: "/about" },
      { label: "Connect", href: "/contact" },
      { label: "Support", href: "/help" },
    ],
    Legal: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-black border-t border-white/5 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container pt-32 pb-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-16 md:gap-24 mb-32">
          {/* Brand & Newsletter */}
          <div className="col-span-1 md:col-span-3">
            <Link
              to="/"
              onClick={scrollToTop}
              className="flex items-center gap-4 mb-8 group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                <PulseLogo size={28} />
              </div>
              <span className="text-3xl font-black italic tracking-tighter uppercase text-white">
                City <span className="text-emerald-400">Pulse</span>
              </span>
            </Link>
            <p className="text-white/40 text-lg font-light max-w-sm mb-12 leading-relaxed italic">
              Step into the fluid world of human connection. The future of live
              experiences is here.
            </p>

            <div className="max-w-md">
              <div className="relative group">
                <input
                  type="email"
                  placeholder="SYNC YOUR EMAIL..."
                  className="w-full h-20 bg-white/5 border-2 border-transparent focus:border-emerald-500/30 rounded-3xl px-8 font-black text-xs uppercase tracking-widest transition-all outline-none"
                />
                <Button className="absolute right-3 top-1/2 -translate-y-1/2 h-14 w-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black p-0 transition-all">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="col-span-1">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-8">
                {title}
              </h4>
              <ul className="space-y-6">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      onClick={scrollToTop}
                      className="text-sm font-light text-white/40 hover:text-white transition-colors duration-300 italic"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-6">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 text-white/40 hover:text-emerald-400 transition-all duration-500"
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-12">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
              © {currentYear} City Pulse Collective
            </p>
            <div className="flex gap-8">
              <Link
                to="/privacy"
                onClick={scrollToTop}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                onClick={scrollToTop}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-white transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
