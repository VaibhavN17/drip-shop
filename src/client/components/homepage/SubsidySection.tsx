import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ClipboardCheck, Calculator, FileText } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: ClipboardCheck,
    title: "Check Eligibility",
    desc: "Understand which government irrigation schemes apply to your land, crop, and farmer category.",
  },
  {
    num: "02",
    icon: Calculator,
    title: "Calculate Subsidy",
    desc: "Estimate the subsidy amount based on your system area and applicable government rates.",
  },
  {
    num: "03",
    icon: FileText,
    title: "Prepare Your Quotation",
    desc: "We prepare a complete irrigation estimate with itemized products for submission.",
  },
];

export function SubsidySection() {
  const navigate = useNavigate();

  return (
    <section
      id="subsidy"
      className="homepage-section relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, var(--forest-900) 0%, var(--forest-800) 60%, #1f5c3e 100%)" }}
    >
      {/* Background image overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "url(/images/subsidy_bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Top curve */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none" style={{ transform: "rotate(180deg)" }}>
        <svg viewBox="0 0 1440 60" className="w-full" preserveAspectRatio="none">
          <path d="M0,0 C360,60 1080,60 1440,0 L1440,0 L0,0 Z" fill="white" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
              style={{ background: "rgba(125,217,154,0.15)", border: "1px solid rgba(125,217,154,0.3)", color: "#7dd99a" }}
            >
              🏛️ Government Subsidy
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="font-display font-black text-3xl sm:text-4xl text-white mb-5 leading-tight"
            >
              Subsidy Assistance
              <span className="block" style={{ color: "#7dd99a" }}>for Farmers</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="text-base leading-relaxed mb-8"
              style={{ color: "rgba(255,255,255,0.72)" }}
            >
              Understand available irrigation schemes and check your eligibility for government subsidies. We help you prepare the right documentation and estimates for a smooth application.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            >
              <button
                onClick={() => navigate("/login")}
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold transition-all duration-200 hover:scale-105 shadow-xl"
                style={{ background: "var(--sun-500)", color: "#1a1a1a" }}
              >
                Check Applicable Schemes
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            <p className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              * Subject to current Maharashtra government rules and eligibility criteria.
            </p>
          </div>

          {/* Right — 3 steps */}
          <div className="flex flex-col gap-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 * i, duration: 0.5 }}
                  className="flex items-start gap-4 rounded-2xl p-5"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {/* Step number */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(125,217,154,0.12)", border: "1px solid rgba(125,217,154,0.25)" }}
                    >
                      <Icon size={18} style={{ color: "#7dd99a" }} />
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-0.5 h-6 mt-2" style={{ background: "rgba(125,217,154,0.2)" }} />
                    )}
                  </div>
                  <div className="pt-1">
                    <div className="text-xs font-bold tracking-widest mb-1" style={{ color: "rgba(125,217,154,0.7)" }}>
                      STEP {step.num}
                    </div>
                    <div className="font-display font-bold text-white text-base mb-1">{step.title}</div>
                    <div className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{step.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom curve */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
        <svg viewBox="0 0 1440 60" className="w-full" preserveAspectRatio="none">
          <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" fill="#fafaf7" />
        </svg>
      </div>
    </section>
  );
}
