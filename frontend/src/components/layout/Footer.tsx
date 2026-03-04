import { Link } from "react-router-dom";
import { Calendar, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Explore: [
      { label: "Browse Events", href: "/events" },
      { label: "Categories", href: "/categories" },
      { label: "Create Events", href: "/events/create" },
    ],
    Company: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Help Center", href: "/help" },
    ],
    Legal: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-foreground text-background">
      <div className="container py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-hero">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-extrabold uppercase tracking-wider text-background">
                City Pulse
              </span>
            </Link>
            <p className="text-background/50 text-sm max-w-xs mb-8 leading-relaxed">
              Discover and book the best events in your city. Concerts,
              workshops, and unforgettable experiences.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10 hover:bg-background/20 text-background/70 hover:text-background transition-all duration-300"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-background/40 mb-5">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-background/60 hover:text-background transition-colors"
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
        <div className="mt-16 pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-background/40">
            © {currentYear} City Pulse. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-background/40">
            <Link
              to="/privacy"
              className="hover:text-background/70 transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="hover:text-background/70 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
