import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const flowStages = [
  { id: "source",   label: "Water Source",    icon: "🌊", desc: "Pump / Well / Canal",       color: "#3b82f6" },
  { id: "filter",   label: "Filter Unit",      icon: "⚙️", desc: "Removes debris & particles", color: "var(--forest-600)" },
  { id: "valve",    label: "Control Valve",    icon: "🔧", desc: "Pressure regulation",        color: "var(--earth-500)" },
  { id: "main",     label: "Main Pipeline",    icon: "⬛", desc: "HDPE submain distribution",  color: "#6b7280" },
  { id: "lateral",  label: "Lateral Pipes",    icon: "〰️", desc: "Drip laterals across rows",  color: "var(--forest-500)" },
  { id: "plant",    label: "Plants",           icon: "🌱", desc: "Precise root-zone watering", color: "var(--forest-400)" },
];

export function IrrigationFlowSection() {
  const [activeStage, setActiveStage] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Animate stages one by one
          flowStages.forEach((_, i) => {
            timerRef.current = setTimeout(() => setActiveStage(i), i * 500);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => { observer.disconnect(); clearTimeout(timerRef.current); };
  }, []);

  return (
    <section
      id="solutions"
      className="homepage-section"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, var(--forest-50) 100%)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <span
            className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
            style={{ background: "var(--forest-100)", color: "var(--forest-700)" }}
          >
            How It Works
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-gray-900 mb-4">
            Complete Irrigation
            <br />
            <span className="gradient-text">System Explained</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            From water source to plant root — understand how a drip irrigation system works and what components you need.
          </p>
        </div>

        {/* Flow Diagram */}
        <div ref={ref} className="flex flex-col items-center gap-0">
          {flowStages.map((stage, i) => (
            <React.Fragment key={stage.id}>
              {/* Stage card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={activeStage >= i ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex items-center gap-5 w-full max-w-sm"
              >
                {/* Left timeline line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md transition-all duration-500"
                    style={{
                      background: activeStage >= i ? `${stage.color}18` : "#f3f4f6",
                      border: `2px solid ${activeStage >= i ? stage.color : "#e5e7eb"}`,
                      transform: activeStage >= i ? "scale(1.08)" : "scale(1)",
                    }}
                  >
                    {stage.icon}
                  </div>
                </div>

                {/* Card text */}
                <div
                  className="flex-1 rounded-2xl p-4 transition-all duration-500 shadow-sm"
                  style={{
                    background: activeStage >= i ? "white" : "#f9fafb",
                    border: `1px solid ${activeStage >= i ? stage.color + "30" : "#e5e7eb"}`,
                  }}
                >
                  <div className="font-display font-bold text-gray-900 text-sm">{stage.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{stage.desc}</div>
                </div>
              </motion.div>

              {/* Connector line */}
              {i < flowStages.length - 1 && (
                <motion.div
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={activeStage >= i ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
                  transition={{ duration: 0.35, delay: 0.2 }}
                  className="w-0.5 h-10 origin-top"
                  style={{ background: `linear-gradient(to bottom, ${stage.color}, ${flowStages[i + 1].color})` }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-14"
        >
          <p className="text-gray-500 mb-4 text-sm">
            Need help planning your irrigation system?
          </p>
          <a
            href="#subsidy"
            onClick={(e) => { e.preventDefault(); document.querySelector("#subsidy")?.scrollIntoView({ behavior: "smooth" }); }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:scale-105 shadow-md"
            style={{ background: "var(--forest-600)" }}
          >
            We'll help you plan it →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
