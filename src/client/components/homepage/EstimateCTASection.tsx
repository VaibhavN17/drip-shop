import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Package, Hash, FileText, BadgePercent, IndianRupee } from "lucide-react";

const pipeline = [
  { icon: Package,       label: "Products",     color: "var(--forest-600)" },
  { icon: Hash,          label: "Quantity",     color: "var(--forest-500)" },
  { icon: FileText,      label: "Estimate",     color: "#3b82f6" },
  { icon: BadgePercent,  label: "Subsidy",      color: "var(--earth-500)" },
  { icon: IndianRupee,   label: "Final Amount", color: "var(--forest-700)" },
];

export function EstimateCTASection() {
  const navigate = useNavigate();

  return (
    <section className="homepage-section" style={{ background: "var(--warm-white)" }}>
      <div className="max-w-5xl mx-auto">
        <div
          className="rounded-3xl p-8 md:p-14 text-center shadow-xl overflow-hidden relative"
          style={{ background: "white", border: "1px solid var(--forest-100)" }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, var(--forest-400), transparent)" }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, var(--sun-400), transparent)" }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative z-10"
          >
            <span
              className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
              style={{ background: "var(--forest-100)", color: "var(--forest-700)" }}
            >
              💧 Estimate Builder
            </span>

            <h2 className="font-display font-black text-3xl sm:text-4xl text-gray-900 mb-4">
              Need an Irrigation Estimate?
            </h2>
            <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
              Tell us what you need. We'll help you build a detailed estimate with products, quantities, and applicable subsidy — in minutes.
            </p>

            {/* Pipeline steps */}
            <div className="flex items-center justify-center gap-0 mb-10 flex-wrap">
              {pipeline.map((step, i) => {
                const Icon = step.icon;
                return (
                  <React.Fragment key={step.label}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
                        style={{ background: `${step.color}12`, border: `2px solid ${step.color}25` }}
                      >
                        <Icon size={20} style={{ color: step.color }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">{step.label}</span>
                    </motion.div>
                    {i < pipeline.length - 1 && (
                      <ChevronRight size={16} className="text-gray-300 mx-1 mb-5 shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* CTA */}
            <button
              onClick={() => navigate("/login")}
              className="group inline-flex items-center gap-3 px-10 py-4 rounded-full text-base font-bold text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
              style={{ background: "linear-gradient(135deg, var(--forest-700), var(--forest-500))" }}
            >
              Create Estimate
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="mt-4 text-xs text-gray-400">Takes only a few minutes • No registration needed to explore</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
