import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const stats = [
  { value: 500,  suffix: "+", label: "शेतकरी ग्राहक",   labelEn: "Farmer Customers" },
  { value: 1000, suffix: "+", label: "यशस्वी प्रकल्प",   labelEn: "Successful Projects" },
  { value: 50,   suffix: "+", label: "उत्पादन प्रकार",   labelEn: "Product Types" },
  { value: 10,   suffix: "+", label: "वर्षांचा अनुभव",   labelEn: "Years Experience" },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = Math.ceil(target / 40);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(start);
        }, 30);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return <div ref={ref} className="text-4xl sm:text-5xl font-black">{count}{suffix}</div>;
}

export function StatsSection() {
  return (
    <section style={{ background: "#1c0a0a" }} className="py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div style={{ color: "#fbbf24" }}>
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <div className="text-white font-semibold mt-1 text-sm">{s.label}</div>
              <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{s.labelEn}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
