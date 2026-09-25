import React from "react";
import { motion } from "framer-motion";
import { Droplets, ShieldCheck, FileText, HeartHandshake, Truck, Award } from "lucide-react";

const reasons = [
  {
    icon: Droplets,
    title: "ड्रिप सिंचन तज्ञ",
    titleEn: "Drip Irrigation Experts",
    desc: "ड्रिप, स्प्रिंकलर आणि संबंधित सर्व साहित्य उपलब्ध. सरकारी योजनेसाठी अनुभव.",
    color: "#075985",
    bg: "#f0f9ff",
    border: "#bae6fd",
  },
  {
    icon: ShieldCheck,
    title: "विश्वासार्ह ब्रँड",
    titleEn: "Trusted Quality",
    desc: "Finolex, Jain, Netafim आणि इतर विश्वासार्ह ब्रँडचे साहित्य.",
    color: "#166534",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
  {
    icon: FileText,
    title: "अंदाज सेवा",
    titleEn: "Estimate Service",
    desc: "शेतीचा आकार आणि पिकाच्या गरजेनुसार अचूक अंदाज PDF स्वरूपात.",
    color: "#b91c1c",
    bg: "#fef2f2",
    border: "#fecaca",
  },
  {
    icon: HeartHandshake,
    title: "ग्राहक मार्गदर्शन",
    titleEn: "Customer Guidance",
    desc: "उत्पादन निवड, स्थापना सल्ला आणि अनुदान कागदपत्रांसाठी मदत.",
    color: "#92400e",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  {
    icon: Truck,
    title: "डिलिव्हरी सेवा",
    titleEn: "Delivery Available",
    desc: "लाख खंडाळा परिसरात होम डिलिव्हरी उपलब्ध. संपर्क करा.",
    color: "#4d7c0f",
    bg: "#f7fee7",
    border: "#d9f99d",
  },
  {
    icon: Award,
    title: "सरकारी दर",
    titleEn: "Government Rates",
    desc: "अनुदान योजनेसाठी मान्यताप्राप्त सरकारी दरात साहित्य उपलब्ध.",
    color: "#7c3aed",
    bg: "#faf5ff",
    border: "#e9d5ff",
  },
];

export function WhyChooseUsSection() {
  return (
    <section
      id="about"
      className="py-20"
      style={{ background: "#fffdf7" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
            style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}
          >
            🌟 का निवडावे आम्हाला? / Why Choose Us?
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="font-black text-3xl sm:text-4xl text-stone-900 leading-tight"
          >
            शेतकऱ्यांचे विश्वसनीय दुकान
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="text-stone-500 mt-2"
          >
            The trusted hardware store for Maharashtra farmers
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reasons.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                whileHover={{ y: -5, boxShadow: "0 16px 40px rgba(0,0,0,0.1)" }}
                className="rounded-2xl p-6 transition-all duration-200"
                style={{ background: r.bg, border: `1.5px solid ${r.border}` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "white", boxShadow: `0 4px 12px ${r.border}` }}
                >
                  <Icon size={22} style={{ color: r.color }} />
                </div>
                <h3 className="font-bold text-lg mb-0.5" style={{ color: r.color }}>{r.title}</h3>
                <p className="text-xs font-medium text-stone-400 mb-2">{r.titleEn}</p>
                <p className="text-sm text-stone-600 leading-relaxed">{r.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
