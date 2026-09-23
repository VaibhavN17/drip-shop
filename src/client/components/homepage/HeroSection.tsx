import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, Droplets, Leaf } from "lucide-react";

const floatCard1 = {
  initial: { opacity: 0, y: 30, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { delay: 1.2, duration: 0.6 } },
};
const floatCard2 = {
  initial: { opacity: 0, y: 30, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { delay: 1.5, duration: 0.6 } },
};

// Tiny water-drop particles
function WaterParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {[
        { left: "15%", top: "30%", delay: "0s", size: 6 },
        { left: "25%", top: "60%", delay: "0.8s", size: 5 },
        { left: "70%", top: "25%", delay: "0.3s", size: 7 },
        { left: "80%", top: "55%", delay: "1.2s", size: 5 },
        { left: "45%", top: "75%", delay: "0.6s", size: 4 },
        { left: "60%", top: "40%", delay: "1.5s", size: 6 },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-blue-300/30"
          style={{
            left: p.left, top: p.top,
            width: p.size, height: p.size,
            animation: `dropFall 2.5s ease-in infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0d2818 0%, #1a4731 45%, #2d7a4f 100%)" }}
    >
      {/* Background Farm Image */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: "url(/images/hero_farm_bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-forest-900/90 via-forest-800/70 to-transparent" />

      <WaterParticles />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── LEFT: Content ── */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 tracking-wider uppercase"
              style={{ background: "rgba(90,200,120,0.15)", border: "1px solid rgba(90,200,120,0.3)", color: "#7dd99a" }}
            >
              <Leaf size={12} /> Smart Irrigation Solutions
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.7, ease: "easeOut" }}
              className="font-display font-black text-4xl sm:text-5xl xl:text-6xl leading-tight text-white mb-5"
            >
              Grow Better.{" "}
              <span className="block" style={{ color: "#7dd99a" }}>
                Use Water Smarter.
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
              className="text-lg leading-relaxed mb-8 max-w-lg"
              style={{ color: "rgba(255,255,255,0.78)" }}
            >
              Complete drip irrigation solutions for farms, agriculture businesses, and modern farming in Maharashtra.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <button
                onClick={() => navigate("/login")}
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
                style={{ background: "var(--sun-500)", color: "#1a1a1a" }}
              >
                Get a Free Estimate
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-200 hover:bg-white/15"
                style={{ border: "2px solid rgba(255,255,255,0.35)", color: "white" }}
              >
                Explore Products
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              {["Quality Products", "Subsidy Assistance", "Professional Guidance"].map((label) => (
                <div key={label} className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
                  <CheckCircle2 size={14} style={{ color: "#52c27d" }} />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT: Image with floating cards ── */}
          <div className="relative hidden lg:flex items-center justify-center">
            {/* Floating card 1 — top right */}
            <motion.div
              variants={floatCard1} initial="initial" animate="animate"
              className="absolute -top-6 right-0 z-20 glass rounded-2xl px-4 py-3 shadow-xl animate-float-down"
              style={{ minWidth: 160 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(45,122,79,0.12)" }}>
                  <Droplets size={16} style={{ color: "var(--forest-600)" }} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Water Saving</div>
                  <div className="text-base font-black" style={{ color: "var(--forest-700)" }}>Up to 60%</div>
                </div>
              </div>
            </motion.div>

            {/* Main image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              className="relative w-full max-w-md"
            >
              <div
                className="overflow-hidden shadow-2xl"
                style={{
                  borderRadius: "2rem 4rem 2rem 4rem",
                  border: "3px solid rgba(125,217,154,0.25)",
                }}
              >
                <img
                  src="/images/hero_farmer_drip.jpg"
                  alt="Farmer inspecting drip irrigation"
                  className="w-full h-[480px] object-cover transition-transform duration-700 hover:scale-105"
                />
                {/* Bottom gradient */}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,40,24,0.4) 0%, transparent 50%)" }} />
              </div>

              {/* Glow ring */}
              <div
                className="absolute -inset-1 -z-10 rounded-[2.5rem] opacity-40"
                style={{ background: "radial-gradient(ellipse, rgba(58,158,104,0.5), transparent 70%)" }}
              />
            </motion.div>

            {/* Floating card 2 — bottom left */}
            <motion.div
              variants={floatCard2} initial="initial" animate="animate"
              className="absolute -bottom-4 -left-4 z-20 glass rounded-2xl px-4 py-3 shadow-xl animate-float-up"
              style={{ minWidth: 170 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(245,158,11,0.12)" }}>
                  <Leaf size={16} style={{ color: "#b45309" }} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Smart Farming</div>
                  <div className="text-sm font-bold text-gray-700">Maharashtra Trusted</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer"
          onClick={() => document.querySelector("#trust-strip")?.scrollIntoView({ behavior: "smooth" })}
        >
          <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>Scroll to explore</span>
          <div className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5" style={{ border: "2px solid rgba(255,255,255,0.25)" }}>
            <div className="w-1 h-2 rounded-full bg-white/60 animate-bounce" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
