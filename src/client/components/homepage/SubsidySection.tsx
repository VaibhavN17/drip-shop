import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, Calculator, FileText, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    title: "पात्रता तपासा",
    titleEn: "Check Eligibility",
    desc: "आपल्या जमिनीच्या प्रकारानुसार आणि शेतकरी श्रेणीनुसार कोणती योजना लागू होते ते पाहा.",
  },
  {
    icon: Calculator,
    title: "अनुदान मोजा",
    titleEn: "Calculate Subsidy",
    desc: "क्षेत्रफळ आणि सरकारी दरानुसार अनुदानाची रक्कम मोजा. शेतकरी भरणा किती ते जाणून घ्या.",
  },
  {
    icon: FileText,
    title: "अंदाज तयार करा",
    titleEn: "Get Quotation",
    desc: "ड्रिप सिंचन साहित्याचा संपूर्ण अंदाज PDF स्वरूपात मिळवा — सरकारी दरात.",
  },
];

export function SubsidySection() {
  const navigate = useNavigate();

  return (
    <section
      id="subsidy"
      className="relative overflow-hidden py-20"
      style={{ background: "linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)" }}
    >
      {/* Top wave */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden" style={{ transform: "rotate(180deg)" }}>
        <svg viewBox="0 0 1440 55" className="w-full" preserveAspectRatio="none">
          <path d="M0,0 C360,55 1080,55 1440,0 L1440,0 L0,0 Z" fill="#fffdf7" />
        </svg>
      </div>

      {/* Decorative circles */}
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-10" style={{ background: "#fbbf24" }} />
      <div className="absolute -left-10 bottom-10 w-40 h-40 rounded-full opacity-8" style={{ background: "#fbbf24" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
              style={{ background: "rgba(251,191,36,0.18)", border: "1px solid rgba(251,191,36,0.4)", color: "#fbbf24" }}
            >
              🏛️ सरकारी अनुदान / Government Subsidy
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="font-black text-3xl sm:text-4xl text-white leading-tight mb-5"
            >
              ड्रिप सिंचन अनुदान
              <span className="block" style={{ color: "#fbbf24" }}>मिळवण्यास मदत</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="text-base leading-relaxed mb-8"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              महाराष्ट्र शासनाच्या ड्रिप सिंचन योजनेंतर्गत अनुदान मिळवा.
              आम्ही अंदाज, कागदपत्रे आणि मार्गदर्शनात मदत करतो.
              <br /><br />
              <span className="text-white/60 text-sm">
                We help you understand applicable irrigation schemes and prepare the right quotation for subsidy application.
              </span>
            </motion.p>

            {/* Subsidy highlight box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.25 }}
              className="rounded-2xl p-5 mb-7"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { pct: "55%", label: "SC/ST शेतकरी" },
                  { pct: "45%", label: "सामान्य शेतकरी" },
                  { pct: "65%", label: "महिला शेतकरी" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-black text-white">{s.pct}</div>
                    <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-3 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                * Approximate. Subject to current Maharashtra government norms.
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.35 }}
              onClick={() => navigate("/admin/login")}
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold transition-all hover:scale-105 shadow-xl"
              style={{ background: "#fbbf24", color: "#1c0a0a" }}
            >
              अनुदान अंदाज मिळवा / Get Subsidy Estimate
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>

          {/* Right — Steps */}
          <div className="flex flex-col gap-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: 28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.12 * i, duration: 0.5 }}
                  className="flex items-start gap-4 rounded-2xl p-5"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  <div className="flex-shrink-0">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}
                    >
                      <Icon size={20} style={{ color: "#fbbf24" }} />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-white text-base">{step.title}</div>
                    <div className="text-xs font-medium mb-1" style={{ color: "#fbbf24" }}>{step.titleEn}</div>
                    <div className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>{step.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <svg viewBox="0 0 1440 55" className="w-full" preserveAspectRatio="none">
          <path d="M0,55 C360,0 1080,0 1440,55 L1440,55 L0,55 Z" fill="#fffdf7" />
        </svg>
      </div>
    </section>
  );
}
