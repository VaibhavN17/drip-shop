import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Package, Calculator, FileDown, ArrowRight } from "lucide-react";

const flow = [
  { icon: Package,       step: "उत्पादने निवडा",  sub: "Select Products" },
  { icon: Calculator,    step: "प्रमाण टाका",      sub: "Enter Quantities" },
  { icon: ClipboardList, step: "अंदाज तयार करा",   sub: "Generate Estimate" },
  { icon: FileDown,      step: "PDF मिळवा",        sub: "Download PDF" },
];

export function EstimateCTASection() {
  const navigate = useNavigate();
  return (
    <section
      id="estimate"
      className="py-20"
      style={{ background: "#fffdf7" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl shadow-2xl"
          style={{ background: "linear-gradient(135deg, #1c0a0a 0%, #3b0d0d 60%, #7f1d1d 100%)" }}
        >
          {/* Decorative */}
          <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full opacity-10" style={{ background: "#fbbf24" }} />
          <div className="absolute -left-10 -bottom-10 w-64 h-64 rounded-full opacity-8" style={{ background: "#b91c1c" }} />

          <div className="relative z-10 p-10 lg:p-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5 tracking-widest uppercase"
                  style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.35)", color: "#fbbf24" }}
                >
                  📋 ऑनलाईन अंदाज सेवा
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                  className="font-black text-3xl sm:text-4xl text-white leading-tight mb-4"
                >
                  आता अंदाज मिळवा
                  <span className="block text-xl sm:text-2xl mt-1 font-semibold" style={{ color: "#fbbf24" }}>
                    Get Your Free Irrigation Estimate
                  </span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                  className="text-base leading-relaxed mb-8"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  आपल्या शेतीसाठी लागणाऱ्या ड्रिप साहित्याचा अंदाज ऑनलाईन तयार करा.
                  सरकारी दरात, PDF स्वरूपात — झटपट.
                </motion.p>

                <motion.button
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                  onClick={() => navigate("/admin/login")}
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold transition-all hover:scale-105 shadow-2xl"
                  style={{ background: "#fbbf24", color: "#1c0a0a" }}
                >
                  अंदाज तयार करा / Start Estimate
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>

              {/* Right — flow */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                {flow.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <motion.div
                      key={f.step}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.08 * i }}
                      className="flex items-center gap-4 rounded-2xl px-5 py-4"
                      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}>
                        <Icon size={18} style={{ color: "#fbbf24" }} />
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">{f.step}</div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{f.sub}</div>
                      </div>
                      {i < flow.length - 1 && (
                        <ArrowRight size={14} className="ml-auto hidden lg:block" style={{ color: "rgba(255,255,255,0.25)" }} />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
