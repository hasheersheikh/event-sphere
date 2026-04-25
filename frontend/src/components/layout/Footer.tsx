import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, HelpCircle } from "lucide-react";
import PulseLogo from "./PulseLogo";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Explore: [
      { label: "Events", href: "/events" },
      { label: "Blog", href: "/blog" },
      { label: "About", href: "/about" },
    ],
    Community: [
      { label: "Become a Manager", href: "/auth" },
      { label: "Stores", href: "/local-stores" },
    ],
    Support: [
      { label: "Help Center", href: "/help" },
      { label: "Contact", href: "/contact" },
      { label: "Terms", href: "/terms" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", color: "hover:text-blue-500" },
    { icon: Twitter, href: "#", color: "hover:text-sky-400" },
    { icon: Instagram, href: "#", color: "hover:text-pink-500" },
    { icon: Linkedin, href: "#", color: "hover:text-blue-600" },
  ];

  return (
    <footer className="relative bg-background pt-16 pb-8 border-t border-border overflow-hidden">
      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand & Mission */}
          <div className="lg:col-span-3 space-y-6">
            <Link to="/" className="inline-flex items-center gap-3 group/logo">
              <div className="h-10 w-10 rounded-xl bg-muted/50 border border-border flex items-center justify-center group-hover/logo:border-primary/50 transition-all backdrop-blur-md">
                <PulseLogo size={20} />
              </div>
              <span className="text-xl font-black italic tracking-tighter uppercase">
                City <span className="text-primary">Pulse</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm font-medium italic leading-relaxed max-w-sm">
              Forging the future of human connection through extraordinary live experiences.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className={cn("text-muted-foreground transition-colors", social.color)}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors italic"
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
        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
            © {currentYear} City Pulse. All moments reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-primary transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


