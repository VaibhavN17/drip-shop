import React from "react";
import { Link } from "react-router-dom";
import { Droplets, Phone, MessageSquare, MapPin, Instagram, Facebook } from "lucide-react";

const footerLinks = {
  Products: [
    { label: "Drip Pipes",        href: "#products" },
    { label: "Emitters",          href: "#products" },
    { label: "Filters",           href: "#products" },
    { label: "Valves",            href: "#products" },
    { label: "Fertilizer Equip.", href: "#products" },
    { label: "Accessories",       href: "#products" },
  ],
  Solutions: [
    { label: "Drip Irrigation",   href: "#solutions" },
    { label: "Sprinkler Systems", href: "#solutions" },
    { label: "Farm Irrigation",   href: "#solutions" },
    { label: "Fertigation",       href: "#solutions" },
  ],
  Support: [
    { label: "Get Estimate",      href: "/login" },
    { label: "Subsidy Guide",     href: "#subsidy" },
    { label: "FAQ",               href: "#faq" },
    { label: "Contact Us",        href: "#contact" },
  ],
  Company: [
    { label: "About",             href: "#about" },
    { label: "Admin Login",       href: "/login" },
  ],
};

function handleAnchor(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  if (href.startsWith("#")) {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  }
}

export function Footer() {
  return (
    <footer style={{ background: "var(--forest-900)", color: "rgba(255,255,255,0.7)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--forest-600)" }}>
                <Droplets size={20} className="text-white" />
              </div>
              <div className="leading-tight">
                <div className="font-display font-black text-white text-base">Shetkari Raja</div>
                <div className="text-xs" style={{ color: "var(--forest-300)" }}>Drip Irrigation Solutions</div>
              </div>
            </Link>

            <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
              Complete drip irrigation solutions for farmers in Maharashtra. Products, estimates, and subsidy guidance — all in one place.
            </p>

            {/* Contact info */}
            <div className="flex flex-col gap-3">
              <a
                href="tel:+919999999999"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
              >
                <Phone size={14} style={{ color: "var(--forest-400)" }} />
                +91 99999 99999
              </a>
              <a
                href="https://wa.me/919999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
              >
                <MessageSquare size={14} style={{ color: "#25d366" }} />
                WhatsApp Us
              </a>
              <div className="flex items-start gap-2 text-sm">
                <MapPin size={14} className="mt-0.5 flex-shrink-0" style={{ color: "var(--forest-400)" }} />
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Maharashtra, India</span>
              </div>
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display font-bold text-white text-sm mb-4 tracking-wide">{category}</h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={(e) => handleAnchor(e, link.href)}
                      className="text-sm hover:text-white transition-colors"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}
        >
          <span>© {new Date().getFullYear()} Shetkari Raja Drip Irrigation. Maharashtra, India.</span>
          <div className="flex items-center gap-4">
            <span>शेतकरी राजा ठिबक सिंचन</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
