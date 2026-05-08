import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import PulseLogo from "./PulseLogo";
import { FEATURES } from "@/config/features";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Explore: [
      { label: "Live Events", href: "/events" },
      { label: "Local Stores", href: "/local-stores" },
      { label: "Boost Event", href: "/boost" },
      ...(FEATURES.ENABLE_BLOGS ? [{ label: "Blog", href: "/blog" }] : []),
      { label: "About", href: "/about" },
    ],
    Support: [
      { label: "Contact", href: "/contact" },
      { label: "Help Centre", href: "/help" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-background border-t border-border/20">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link to="/" onClick={scrollToTop} className="flex items-center gap-2.5 mb-5 group w-fit">
              <PulseLogo size={22} />
              <span className="font-display text-2xl font-black tracking-tighter uppercase">
                City <span className="opacity-40">Pulse</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm font-medium max-w-sm leading-relaxed mb-6">
              The future of live experiences. Discover events and local gems in your city.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="h-9 w-9 flex items-center justify-center rounded-xl bg-muted/50 border border-border/30 text-muted-foreground hover:text-foreground hover:border-border transition-all duration-200"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-5">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      onClick={scrollToTop}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
            © {currentYear} City Pulse
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" onClick={scrollToTop} className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/50 hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/terms" onClick={scrollToTop} className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/50 hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
