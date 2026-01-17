import { Link } from "react-router-dom";
import { Calendar, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    "Use EventHub": [
      { label: "Create Events", href: "/create-event" },
      { label: "Browse Events", href: "/events" },
      { label: "Pricing", href: "/pricing" },
    ],
    "Plan Events": [
      { label: "Event Planning", href: "/planning" },
      { label: "Sell Tickets", href: "/sell-tickets" },
      { label: "Promote Events", href: "/promote" },
    ],
    "Connect": [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Help Center", href: "/help" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-hero">
                <Calendar className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                Event<span className="gradient-text">Hub</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs mb-6">
              Discover amazing events, connect with your community, and create unforgettable experiences.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
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
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} EventHub. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
