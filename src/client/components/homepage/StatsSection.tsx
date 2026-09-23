import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const stats = [
  { value: 500,  suffix: "+", label: "Farmers Served",     icon: "👨‍🌾" },
  { value: 1000, suffix: "+", label: "Estimates Created",  icon: "📋" },
  { value: 50,   suffix: "+", label: "Products Available", icon: "📦" },
  { value: 10,   suffix: "+", label: "Irrigation Solutions",icon: "💧" },
];

function useCountUp(target: number, duration = 1800, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [active, target, duration]);
  return count;
}

function StatCard({ stat, active }: { stat: typeof stats[0]; active: boolean }) {
  const count = useCountUp(stat.value, 1600, active);
  return (
    <div className="flex flex-col items-center text-center p-6">
      <div className="text-4xl mb-3">{stat.icon}</div>
      <div className="font-display font-black text-4xl sm:text-5xl mb-2" style={{ color: "var(--forest-600)" }}>
        {count.toLocaleString("en-IN")}{stat.suffix}
      </div>
      <div className="text-sm font-medium text-gray-500">{stat.label}</div>
    </div>
  );
}

export function StatsSection() {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect(); } },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="homepage-section"
      style={{ background: "var(--forest-50)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display font-black text-3xl sm:text-4xl text-gray-900">
            Trusted by Farmers
            <span className="gradient-text"> Across Maharashtra</span>
          </h2>
        </div>

        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl shadow-sm border"
              style={{ borderColor: "var(--forest-100)" }}
            >
              <StatCard stat={stat} active={active} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
