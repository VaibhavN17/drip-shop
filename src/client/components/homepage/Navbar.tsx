import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Droplets, PhoneCall } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home",     href: "/" },
  { label: "Products", href: "#products" },
  { label: "Solutions",href: "#solutions" },
  { label: "Subsidy",  href: "#subsidy" },
  { label: "About",    href: "#about" },
  { label: "Contact",  href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleAnchor(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (href.startsWith("#")) {
      e.preventDefault();
      setMenuOpen(false);
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <>
      <motion.nav
        initial={false}
        animate={scrolled ? "scrolled" : "top"}
        variants={{
          top:     { backgroundColor: "rgba(0,0,0,0)",    backdropFilter: "blur(0px)" },
          scrolled:{ backgroundColor: "rgba(255,255,255,0.92)", backdropFilter: "blur(18px)" },
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50 transition-shadow"
        style={{ boxShadow: scrolled ? "0 1px 24px rgba(0,0,0,0.08)" : "none" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-forest-600 flex items-center justify-center shadow-md group-hover:bg-forest-700 transition-colors">
                <Droplets size={18} className="text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span
                  className="font-display font-800 text-base tracking-tight transition-colors"
                  style={{ color: scrolled ? "var(--forest-800)" : "white", fontWeight: 800 }}
                >
                  Shetkari Raja
                </span>
                <span
                  className="text-[10px] font-medium tracking-wide opacity-80 transition-colors"
                  style={{ color: scrolled ? "var(--forest-600)" : "rgba(255,255,255,0.8)" }}
                >
                  Drip Irrigation
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleAnchor(e, link.href)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10"
                  style={{ color: scrolled ? "#374151" : "rgba(255,255,255,0.9)" }}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* CTA + Mobile toggle */}
            <div className="flex items-center gap-3">
              <a
                href="tel:+919999999999"
                className="hidden md:flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{ color: scrolled ? "var(--forest-700)" : "rgba(255,255,255,0.85)" }}
              >
                <PhoneCall size={14} />
                <span>Call Us</span>
              </a>
              <button
                onClick={() => navigate("/login")}
                className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                style={{ background: "var(--forest-600)", color: "white" }}
              >
                Get Estimate
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: scrolled ? "var(--forest-800)" : "white" }}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-x-0 top-16 z-40 bg-white shadow-2xl border-b border-gray-100 md:hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleAnchor(e, link.href)}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-forest-50 hover:text-forest-700 transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
                <a
                  href="tel:+919999999999"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-forest-200 text-forest-700 font-medium text-sm"
                >
                  <PhoneCall size={16} /> Call Us
                </a>
                <button
                  onClick={() => { setMenuOpen(false); navigate("/login"); }}
                  className="py-3 rounded-xl text-white font-semibold text-sm"
                  style={{ background: "var(--forest-600)" }}
                >
                  Get Free Estimate
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
