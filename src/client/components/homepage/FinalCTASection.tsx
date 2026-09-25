import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Phone, MessageSquare, ArrowRight } from "lucide-react";

const PHONE = "9545467291";

export function FinalCTASection() {
  const navigate = useNavigate();
  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #991b1b 100%)" }}
    >
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 12px)",
        }}
      />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full opacity-10" style={{ background: "#fbbf24" }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6 tracking-widest uppercase"
          style={{ background: "rgba(251,191,36,0.18)", border: "1px solid rgba(251,191,36,0.35)", color: "#fbbf24" }}
        >
          📞 आत्ता संपर्क करा
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="font-black text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-4"
        >
          शेतीसाठी साहित्य हवे आहे?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
          className="text-lg mb-3" style={{ color: "rgba(255,255,255,0.8)" }}
        >
          Need irrigation equipment for your farm?
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.25 }}
          className="text-base mb-10" style={{ color: "rgba(255,255,255,0.6)" }}
        >
          आत्ता संपर्क करा, ऑनलाईन अंदाज मिळवा, किंवा सरळ आमच्या दुकानात या.
          <br />
          Call now, get an online estimate, or visit us at Lakh Khandala, Maharashtra.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href={`tel:${PHONE}`}
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-base font-bold transition-all hover:scale-105 shadow-2xl"
            style={{ background: "#fff", color: "#b91c1c" }}
          >
            <Phone size={18} /> {PHONE}
          </a>
          <a
            href={`https://wa.me/91${PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-base font-bold transition-all hover:scale-105 shadow-2xl"
            style={{ background: "#25d366", color: "#fff" }}
          >
            <MessageSquare size={18} /> WhatsApp वर संपर्क
          </a>
          <button
            onClick={() => navigate("/admin/login")}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold transition-all hover:scale-105 shadow-2xl"
            style={{ background: "#fbbf24", color: "#1c0a0a" }}
          >
            📋 ऑनलाईन अंदाज
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
