import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, MessageSquare, Clock, ExternalLink } from "lucide-react";

const PHONE = "9545467291";

export function FarmerVisualSection() {
  return (
    <section
      id="shop"
      className="py-20"
      style={{ background: "#fffdf7" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — Shop photo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="relative"
          >
            <div
              className="overflow-hidden shadow-2xl"
              style={{ borderRadius: "1.5rem 3rem 1.5rem 3rem", border: "3px solid #fde68a" }}
            >
              <img
                src="/images/shop_front.jpg"
                alt="शेतकरी राजा मोरे हार्डवेअर दुकान"
                className="w-full h-[380px] lg:h-[460px] object-cover"
                style={{ objectPosition: "center top" }}
              />
              {/* Overlay */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(28,10,10,0.45) 0%, transparent 60%)" }} />
              <div className="absolute bottom-5 left-5 right-5">
                <div className="text-white font-bold text-xl" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
                  शेतकरी राजा मोरे हार्डवेअर
                </div>
                <div className="text-white/70 text-sm mt-0.5">लाख खंडाळा, महाराष्ट्र</div>
              </div>
            </div>
            {/* Glow */}
            <div className="absolute -inset-3 -z-10 rounded-[2rem] opacity-20"
              style={{ background: "radial-gradient(ellipse, #fbbf24, transparent 70%)" }} />
          </motion.div>

          {/* Right — Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
              style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}
            >
              🏪 आमचे दुकान / Our Shop
            </div>

            <h2 className="font-black text-3xl sm:text-4xl text-stone-900 leading-tight mb-2">
              शेतकरी राजा
              <span className="block" style={{ color: "#b91c1c" }}>मोरे हार्डवेअर</span>
            </h2>
            <p className="text-stone-500 mb-6">Shetkari Raja More Hardware</p>

            {/* Info cards */}
            <div className="flex flex-col gap-3 mb-7">
              <div className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <MapPin size={20} style={{ color: "#166534" }} />
                <div>
                  <div className="font-semibold text-stone-800">लाख खंडाळा, महाराष्ट्र</div>
                  <div className="text-sm text-stone-500">Lakh Khandala, Maharashtra, India</div>
                </div>
              </div>

              <a href={`tel:${PHONE}`}
                className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.01]"
                style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                <Phone size={20} style={{ color: "#b91c1c" }} />
                <div>
                  <div className="font-semibold text-stone-800">{PHONE}</div>
                  <div className="text-sm text-stone-500">कॉल करा / Call Us</div>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: "#fefce8", border: "1px solid #fde68a" }}>
                <Clock size={20} style={{ color: "#b45309" }} />
                <div>
                  <div className="font-semibold text-stone-800">सोमवार – शनिवार: सकाळी ७ – सायंकाळी ७</div>
                  <div className="text-sm text-stone-500">Monday – Saturday: 7AM – 7PM</div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`tel:${PHONE}`}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-105 shadow-lg"
                style={{ background: "#b91c1c", color: "#fff" }}
              >
                <Phone size={15} /> {PHONE}
              </a>
              <a
                href={`https://wa.me/91${PHONE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-105 shadow-lg"
                style={{ background: "#25d366", color: "#fff" }}
              >
                <MessageSquare size={15} /> WhatsApp
              </a>
              <a
                href={`https://maps.google.com/?q=Lakh+Khandala+Maharashtra`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-105 shadow-lg"
                style={{ background: "#166534", color: "#fff" }}
              >
                <MapPin size={15} /> मार्ग
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
