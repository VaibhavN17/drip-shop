import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronRight, MapPin, Phone, Droplets } from "lucide-react";

const PHONE = "9545467291";

const checks = [
  "होलसेल व रिटेल",
  "सरकारी अनुदान मार्गदर्शन",
  "ड्रिप साहित्य",
];

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1c0a0a 0%, #3b0d0d 40%, #166534 100%)" }}
    >
      {/* Subtle diagonal texture overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 10px)",
        }}
      />

      {/* Warm glow behind text */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(185,28,28,0.22) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── LEFT: Content ── */}
          <div>
            {/* Location badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5 tracking-wide"
              style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.35)", color: "#fbbf24" }}
            >
              <MapPin size={12} /> लाख खंडाळा, महाराष्ट्र
            </motion.div>

            {/* Main heading — Marathi primary */}
            <motion.h1
              initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.7, ease: "easeOut" }}
              className="font-black leading-tight text-white mb-3"
              style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontFamily: "'Outfit', 'Noto Sans Devanagari', sans-serif" }}
            >
              शेतकरी राजा
              <span className="block" style={{ color: "#fbbf24" }}>
                मोरे हार्डवेअर
              </span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.6 }}
              className="text-lg mb-2 font-medium"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              पाईप • ड्रिप • शेती साहित्य
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55, duration: 0.6 }}
              className="text-base mb-8 leading-relaxed max-w-lg"
              style={{ color: "rgba(255,255,255,0.62)" }}
            >
              शेतीसाठी लागणारे विश्वासार्ह साहित्य एका ठिकाणी.
              Trusted agricultural supplies for farmers in Maharashtra.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 mb-8"
            >
              <button
                onClick={() => navigate("/admin/login")}
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
                style={{ background: "#b91c1c", color: "#fff" }}
              >
                📋 अंदाज मिळवा / Get Estimate
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-200 hover:bg-white/12"
                style={{ border: "2px solid rgba(255,255,255,0.3)", color: "white" }}
              >
                उत्पादने पहा
              </button>
            </motion.div>

            {/* Trust checks */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              {checks.map((c) => (
                <div key={c} className="flex items-center gap-1.5 text-sm" style={{ color: "rgba(255,255,255,0.72)" }}>
                  <CheckCircle2 size={14} style={{ color: "#4ade80" }} />
                  {c}
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT: Real Shop Photo with floating cards ── */}
          <div className="relative hidden lg:block">

            {/* Location card — top */}
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.6 }}
              className="absolute -top-4 right-4 z-20 rounded-2xl px-4 py-3 shadow-2xl"
              style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", minWidth: 180 }}
            >
              <div className="flex items-center gap-2">
                <MapPin size={16} style={{ color: "#b91c1c" }} />
                <div>
                  <div className="text-xs text-stone-500 font-medium">आमचे दुकान</div>
                  <div className="text-sm font-bold text-stone-800">लाख खंडाळा, महाराष्ट्र</div>
                </div>
              </div>
            </motion.div>

            {/* Main image — real shop photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.9, ease: "easeOut" }}
              className="relative overflow-hidden shadow-2xl"
              style={{ borderRadius: "1.5rem 3rem 1.5rem 3rem", border: "3px solid rgba(251,191,36,0.3)" }}
            >
              <img
                src="/images/shop_front.jpg"
                alt="शेतकरी राजा मोरे हार्डवेअर - Lakh Khandala"
                className="w-full h-[460px] object-cover"
                style={{ transition: "transform 8s ease", objectPosition: "center top" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(28,10,10,0.5) 0%, transparent 55%)" }} />
              {/* Badge on image */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-white font-bold text-xl" style={{ fontFamily: "'Outfit', sans-serif", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                  शेतकरी राजा मोरे हार्डवेअर
                </div>
                <div className="text-white/70 text-sm">लाख खंडाळा, महाराष्ट्र</div>
              </div>
            </motion.div>

            {/* Phone card — bottom left */}
            <motion.a
              href={`tel:${PHONE}`}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.6 }}
              className="absolute -bottom-4 -left-4 z-20 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl hover:scale-105 transition-transform"
              style={{ background: "#166534", minWidth: 190 }}
            >
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Phone size={16} className="text-white" />
              </div>
              <div>
                <div className="text-white/70 text-xs">📞 Call Us Now</div>
                <div className="text-white font-bold text-base">{PHONE}</div>
              </div>
            </motion.a>

            {/* Glow */}
            <div className="absolute -inset-2 -z-10 rounded-[2.5rem] opacity-30"
              style={{ background: "radial-gradient(ellipse, rgba(251,191,36,0.4), transparent 70%)" }}
            />
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer"
          onClick={() => document.querySelector("#trust-strip")?.scrollIntoView({ behavior: "smooth" })}
        >
          <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>खाली स्क्रोल करा</span>
          <div className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5" style={{ border: "2px solid rgba(255,255,255,0.2)" }}>
            <div className="w-1 h-2 rounded-full bg-white/50 animate-bounce" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
