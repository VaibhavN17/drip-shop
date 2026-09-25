import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, PhoneCall, Droplets, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PHONE = "9545467291";
const WHATSAPP = `https://wa.me/91${PHONE}`;

const navLinks = [
  { label: "उत्पादने",    labelEn: "Products",  href: "#products" },
  { label: "ड्रिप सिंचन", labelEn: "Drip",      href: "#solutions" },
  { label: "अनुदान",      labelEn: "Subsidy",   href: "#subsidy" },
  { label: "आमच्याबद्दल", labelEn: "About",     href: "#about" },
  { label: "संपर्क",      labelEn: "Contact",   href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleAnchor(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (href.startsWith("#")) {
      e.preventDefault();
      setMenuOpen(false);
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  }

  const textColor = scrolled ? "#1c1917" : "#fff";
  const mutedColor = scrolled ? "#57534e" : "rgba(255,255,255,0.8)";

  return (
    <>
      <motion.nav
        initial={false}
        animate={scrolled ? "scrolled" : "top"}
        variants={{
          top:     { backgroundColor: "rgba(0,0,0,0)",    backdropFilter: "blur(0px)" },
          scrolled:{ backgroundColor: "rgba(255,253,247,0.96)", backdropFilter: "blur(20px)" },
        }}
        transition={{ duration: 0.35 }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{ boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.1)" : "none" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105"
                style={{ background: "linear-gradient(135deg, #b91c1c, #991b1b)" }}
              >
                <Droplets size={19} className="text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-base tracking-tight" style={{ color: scrolled ? "#b91c1c" : "#fff", fontFamily: "'Outfit', sans-serif" }}>
                  शेतकरी राजा
                </span>
                <span className="text-[10px] font-medium tracking-wide" style={{ color: mutedColor }}>
                  मोरे हार्डवेअर · Lakh Khandala
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleAnchor(e, link.href)}
                  className="px-3.5 py-2 rounded-lg text-sm font-medium transition-all hover:bg-black/6"
                  style={{ color: textColor }}
                >
                  {link.label}
                  <span className="ml-1 text-[10px] opacity-60">/ {link.labelEn}</span>
                </a>
              ))}
            </div>

            {/* Right CTAs */}
            <div className="flex items-center gap-2">
              <a
                href={`tel:${PHONE}`}
                className="hidden md:flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: scrolled ? "#166534" : "rgba(255,255,255,0.9)" }}
              >
                <PhoneCall size={14} />
                {PHONE}
              </a>
              <button
                onClick={() => navigate("/admin/login")}
                className="hidden md:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 shadow-lg"
                style={{ background: "#b91c1c", color: "#fff" }}
              >
                अंदाज मिळवा
                <ChevronRight size={14} />
              </button>

              {/* Mobile toggle */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg"
                style={{ color: textColor }}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-16 z-40 bg-white shadow-2xl border-b border-stone-100 md:hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleAnchor(e, link.href)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-stone-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <span>{link.label}</span>
                  <span className="ml-2 text-xs text-stone-400">/ {link.labelEn}</span>
                </motion.a>
              ))}
              <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-2 gap-2">
                <a
                  href={`tel:${PHONE}`}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-green-200 text-green-700 font-medium text-sm"
                >
                  <PhoneCall size={15} /> Call
                </a>
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm"
                  style={{ background: "#25d366" }}
                >
                  WhatsApp
                </a>
              </div>
              <button
                onClick={() => { setMenuOpen(false); navigate("/admin/login"); }}
                className="mt-1 py-3 rounded-xl text-white font-bold text-sm"
                style={{ background: "#b91c1c" }}
              >
                📋 अंदाज मिळवा / Get Estimate
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp + Call (mobile bottom) */}
      <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center gap-3 md:hidden px-4">
        <a
          href={`tel:${PHONE}`}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-sm shadow-2xl"
          style={{ background: "#166534" }}
        >
          <PhoneCall size={16} /> {PHONE}
        </a>
        <a
          href={WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-sm shadow-2xl"
          style={{ background: "#25d366" }}
        >
          💬 WhatsApp
        </a>
      </div>
    </>
  );
}
