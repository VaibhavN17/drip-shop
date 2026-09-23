import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function FarmerVisualSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Subtle parallax: image moves at 60% speed of scroll
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{ height: "70vh", minHeight: 420 }}
    >
      {/* Parallax Image */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 scale-125"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/images/farmer_parallax.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </motion.div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-lg"
          >
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white leading-tight mb-5">
              Built Around
              <br />
              <span style={{ color: "#7dd99a" }}>Real Farming Needs.</span>
            </h2>
            <p className="text-base leading-relaxed mb-7" style={{ color: "rgba(255,255,255,0.78)" }}>
              From choosing the right irrigation products to preparing estimates, we help make the process simpler — for small farms, large orchards, and everything in between.
            </p>
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Marathi & Hindi Support
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Maharashtra Based
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> End-to-End Support
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
