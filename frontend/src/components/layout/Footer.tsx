import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Send } from "lucide-react";
import PulseLogo from "./PulseLogo";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Explore: [
      { label: "Live Events", href: "/events" },
      { label: "Blog", href: "/blog" },
      { label: "Our Story", href: "/about" },
    ],
    Support: [
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
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
    <footer className="bg-background border-t border-border relative overflow-hidden transition-colors duration-500">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary/10 blur-[150px] pointer-events-none opacity-50" />

      <div className="container pt-12 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8 md:gap-12 mb-12">
          {/* Brand & Newsletter */}
          <div className="col-span-1 md:col-span-4">
            <Link
              to="/"
              onClick={scrollToTop}
              className="flex items-center gap-3 mb-8 group"
            >
              <div className="flex h-12 w-12 items-center justify-center bg-muted border border-border group-hover:border-primary/50 transition-all duration-500 rounded-xl backdrop-blur-sm">
                <PulseLogo size={28} />
              </div>
              <span className="text-3xl font-black italic tracking-tighter uppercase text-foreground">
                City <span className="text-primary glow-text">Pulse</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-lg font-light max-w-md mb-8 leading-relaxed italic opacity-80">
              Stepping into the fluid world of human connection. The future of live
              experiences is here.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="col-span-1">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-pulse-emerald mb-8">
                {title}
              </h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      onClick={scrollToTop}
                      className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors duration-300 italic"
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
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex h-12 w-12 items-center justify-center bg-muted border border-border hover:border-primary/30 text-muted-foreground hover:text-primary transition-all duration-300 rounded-xl"
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-12">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
              © {currentYear} City Pulse Collective
            </p>
            <div className="flex gap-8">
              <Link
                to="/privacy"
                onClick={scrollToTop}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                onClick={scrollToTop}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 hover:text-foreground transition-colors"
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
