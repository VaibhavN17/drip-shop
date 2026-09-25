import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    emoji: "🖤",
    name: "ड्रिप पाईप",
    nameEn: "Drip Pipe",
    desc: "Inline / Online drip laterals – 16mm, 12mm",
    color: "#1c1917",
    bg: "#f5f5f4",
    border: "#d6d3d1",
  },
  {
    emoji: "🔵",
    name: "पीव्हीसी पाईप",
    nameEn: "PVC Pipe",
    desc: "मेन लाईन, सब-मेन – विविध साईझ",
    color: "#1e3a8a",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  {
    emoji: "🔩",
    name: "फिटिंग्ज",
    nameEn: "Fittings",
    desc: "T, Elbow, Socket, Coupler, End Cap",
    color: "#713f12",
    bg: "#fefce8",
    border: "#fde68a",
  },
  {
    emoji: "🚰",
    name: "व्हाल्व्ह & फिल्टर",
    nameEn: "Valves & Filters",
    desc: "Ball Valve, Disc Filter, Screen Filter",
    color: "#166534",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
  {
    emoji: "💦",
    name: "स्प्रिंकलर",
    nameEn: "Sprinkler",
    desc: "Micro, Fogger, Sprinkler – सर्व प्रकार",
    color: "#075985",
    bg: "#f0f9ff",
    border: "#bae6fd",
  },
  {
    emoji: "🌱",
    name: "इतर साहित्य",
    nameEn: "Other Supplies",
    desc: "खते, बियाणे, अवजारे व इतर शेती साहित्य",
    color: "#4d7c0f",
    bg: "#f7fee7",
    border: "#d9f99d",
  },
];

export function ProductCategoriesSection() {
  return (
    <section
      id="products"
      className="py-20"
      style={{ background: "#fffdf7" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
            style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}
          >
            🛒 आमची उत्पादने / Our Products
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="font-black text-3xl sm:text-4xl text-stone-900 leading-tight"
          >
            शेतीसाठी लागणारे सर्व साहित्य
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="text-stone-500 mt-2 text-base"
          >
            Everything a farmer needs — in one place.
          </motion.p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              whileHover={{ y: -5, boxShadow: "0 12px 30px rgba(0,0,0,0.1)" }}
              className="group relative rounded-2xl p-5 cursor-pointer transition-all duration-200"
              style={{ background: cat.bg, border: `1.5px solid ${cat.border}` }}
            >
              <div className="text-3xl mb-3">{cat.emoji}</div>
              <h3 className="font-bold text-base mb-0.5" style={{ color: cat.color }}>
                {cat.name}
              </h3>
              <p className="text-xs text-stone-500 mb-0.5">{cat.nameEn}</p>
              <p className="text-sm text-stone-600 leading-snug">{cat.desc}</p>
              <div className="mt-3 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: cat.color }}>
                पहा <ArrowRight size={12} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Products Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-12 overflow-hidden rounded-3xl shadow-xl relative"
          style={{ height: 280 }}
        >
          <img
            src="/images/drip_products.jpg"
            alt="Drip irrigation products at Shetkari Raja More Hardware"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(28,9,9,0.65) 0%, transparent 55%)" }} />
          <div className="absolute inset-0 flex items-center px-10">
            <div>
              <div className="text-white font-black text-2xl sm:text-3xl mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                शेतीसाठी सर्वोत्तम साहित्य
              </div>
              <div className="text-white/75 text-sm mb-5">Best quality drip irrigation products at competitive prices</div>
              <a
                href="#contact"
                onClick={(e) => { e.preventDefault(); document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" }); }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105"
                style={{ background: "#fbbf24", color: "#1c0a0a" }}
              >
                किंमत विचारा / Ask Price <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
