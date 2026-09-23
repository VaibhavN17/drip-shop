import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Phone } from "lucide-react";

export function FinalCTASection() {
  const navigate = useNavigate();

  return (
    <section
      id="contact"
      className="relative overflow-hidden"
      style={{ minHeight: 480 }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/images/hero_farm_bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
        }}
      />
      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, rgba(13,40,24,0.92) 0%, rgba(26,71,49,0.82) 100%)" }}
      />

      <div className="relative z-10 flex items-center justify-center min-h-[480px] py-20 px-4">
        <div className="text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
              style={{ background: "rgba(125,217,154,0.15)", border: "1px solid rgba(125,217,154,0.3)", color: "#7dd99a" }}
            >
              Get Started Today
            </span>

            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white mb-5 leading-tight">
              Ready to Plan Your
              <br />
              <span style={{ color: "#7dd99a" }}>Irrigation System?</span>
            </h2>

            <p className="text-base leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.72)" }}>
              Get a customized estimate for your farm. Our team will help you choose the right products, understand applicable subsidies, and prepare your complete irrigation plan.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-9 py-4 rounded-full text-base font-bold transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
                style={{ background: "var(--sun-500)", color: "#1a1a1a" }}
              >
                Get Estimate
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="tel:+919999999999"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-9 py-4 rounded-full text-base font-semibold transition-all duration-200 hover:bg-white/15"
                style={{ border: "2px solid rgba(255,255,255,0.35)", color: "white" }}
              >
                <Phone size={16} /> Contact Us
              </a>
            </div>

            <p className="mt-8 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              Visit our shop · Maharashtra, India
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
