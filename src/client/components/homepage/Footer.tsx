import React from "react";
import { Link } from "react-router-dom";
import { Phone, MessageSquare, MapPin, Droplets, Instagram, Facebook } from "lucide-react";

const PHONE = "9545467291";

const footerLinks = {
  "उत्पादने / Products": [
    { label: "ड्रिप पाईप / Drip Pipe",      href: "#products" },
    { label: "पीव्हीसी पाईप / PVC Pipe",    href: "#products" },
    { label: "फिटिंग्ज / Fittings",          href: "#products" },
    { label: "व्हाल्व्ह / Valves",           href: "#products" },
    { label: "स्प्रिंकलर / Sprinkler",       href: "#products" },
    { label: "इतर साहित्य / Other",          href: "#products" },
  ],
  "सेवा / Services": [
    { label: "ऑनलाईन अंदाज / Estimate",     href: "/admin/login" },
    { label: "अनुदान मार्गदर्शन / Subsidy", href: "#subsidy" },
    { label: "ड्रिप सिंचन / Drip",          href: "#solutions" },
    { label: "संपर्क / Contact",             href: "#contact" },
  ],
  "माहिती / Info": [
    { label: "आमच्याबद्दल / About",          href: "#about" },
    { label: "FAQ",                            href: "#faq" },
    { label: "Admin Login",                   href: "/admin/login" },
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
    <footer id="contact" style={{ background: "#1c0a0a", color: "rgba(255,255,255,0.65)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main content */}
        <div className="py-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, #b91c1c, #991b1b)" }}>
                <Droplets size={20} className="text-white" />
              </div>
              <div className="leading-tight">
                <div className="font-black text-white text-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>शेतकरी राजा</div>
                <div className="text-xs" style={{ color: "#ef4444" }}>मोरे हार्डवेअर</div>
              </div>
            </Link>

            <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              लाख खंडाळा, महाराष्ट्र येथील शेती साहित्य दुकान.
              ड्रिप, पाईप, फिटिंग्ज आणि सरकारी अनुदान मार्गदर्शन.
            </p>

            <div className="flex flex-col gap-3">
              <a href={`tel:${PHONE}`}
                className="flex items-center gap-2.5 text-sm hover:text-white transition-colors">
                <Phone size={15} style={{ color: "#4ade80" }} />
                {PHONE}
              </a>
              <a href={`https://wa.me/91${PHONE}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm hover:text-white transition-colors">
                <MessageSquare size={15} style={{ color: "#25d366" }} />
                WhatsApp वर संपर्क करा
              </a>
              <div className="flex items-start gap-2.5 text-sm">
                <MapPin size={15} className="mt-0.5 flex-shrink-0" style={{ color: "#f87171" }} />
                <span>लाख खंडाळा, महाराष्ट्र, India</span>
              </div>
            </div>

            {/* Map link */}
            <a
              href={`https://maps.google.com/?q=Lakh+Khandala+Maharashtra`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90"
              style={{ background: "rgba(185,28,28,0.25)", color: "#fca5a5", border: "1px solid rgba(185,28,28,0.35)" }}
            >
              <MapPin size={13} /> मार्ग शोधा / Get Directions
            </a>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([cat, links]) => (
            <div key={cat}>
              <h4 className="font-bold text-white text-sm mb-4 tracking-wide">{cat}</h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={(e) => handleAnchor(e, link.href)}
                      className="text-sm hover:text-white transition-colors"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div
          className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}
        >
          <span>© {new Date().getFullYear()} शेतकरी राजा मोरे हार्डवेअर — लाख खंडाळा, महाराष्ट्र</span>
          <div className="flex items-center gap-4">
            <span>Shetkari Raja More Hardware</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
