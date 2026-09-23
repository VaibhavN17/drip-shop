import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { MessageSquare, Phone } from "lucide-react";

const steps = [
  { num: "01", label: "Tell Us Your Need",   desc: "Share your land area, crop type, and water source details." },
  { num: "02", label: "Choose Products",     desc: "We help you select the right drip components for your system." },
  { num: "03", label: "Get Your Estimate",   desc: "Receive a detailed, itemized quote with subsidy information." },
  { num: "04", label: "Install & Grow",      desc: "Set up your irrigation system and grow with confidence." },
];

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <section
      className="homepage-section"
      style={{ background: "var(--forest-50)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <span
            className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
            style={{ background: "var(--forest-100)", color: "var(--forest-700)" }}
          >
            Process
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-gray-900">
            How It <span className="gradient-text">Works</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="relative" ref={ref}>
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5" style={{ background: "linear-gradient(90deg, var(--forest-200), var(--forest-400), var(--forest-200))" }}>
            {/* Animated shimmer */}
            <div
              className="absolute inset-0 animate-shimmer"
              style={{ background: "linear-gradient(90deg, transparent, rgba(58,158,104,0.5), transparent)", backgroundSize: "200% 100%" }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="flex flex-col items-center text-center"
              >
                {/* Circle */}
                <div
                  className="w-24 h-24 rounded-full flex flex-col items-center justify-center mb-5 shadow-md relative z-10"
                  style={{ background: "white", border: "3px solid var(--forest-200)" }}
                >
                  <span className="text-xs font-bold tracking-widest" style={{ color: "var(--forest-500)" }}>{step.num}</span>
                  <div className="w-6 h-0.5 my-1 rounded-full" style={{ background: "var(--forest-300)" }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: "var(--forest-500)" }} />
                </div>

                <h3 className="font-display font-bold text-gray-900 text-base mb-2">{step.label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[180px]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }}
          className="text-center mt-14 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white shadow-md hover:scale-105 transition-transform"
            style={{ background: "#25d366" }}
          >
            <MessageSquare size={16} /> WhatsApp Us
          </a>
          <a
            href="tel:+919999999999"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border hover:bg-forest-50 transition-colors"
            style={{ borderColor: "var(--forest-200)", color: "var(--forest-700)" }}
          >
            <Phone size={16} /> Call Us
          </a>
        </motion.div>
      </div>
    </section>
  );
}
