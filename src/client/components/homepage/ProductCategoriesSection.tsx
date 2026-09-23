import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const categories = [
  { icon: "💧", name: "Drip Pipes",       desc: "HDPE & LDPE lateral pipes for precise water delivery",       href: "#" },
  { icon: "🔵", name: "Emitters",         desc: "Inline and on-line drippers for uniform distribution",        href: "#" },
  { icon: "🔘", name: "Filters",          desc: "Sand, disc, and screen filters to protect your system",       href: "#" },
  { icon: "🔧", name: "Valves",           desc: "Ball valves, butterfly valves, and flush valves",             href: "#" },
  { icon: "🌿", name: "Fertigation",      desc: "Venturi injectors and fertilizer tanks",                       href: "#" },
  { icon: "🔩", name: "Connectors",       desc: "Fittings, couplers, grommet takeoffs, and end-caps",         href: "#" },
  { icon: "💦", name: "Sprinklers",       desc: "Impact, popup, and micro-sprinklers for all crops",           href: "#" },
  { icon: "🧰", name: "Accessories",      desc: "Pressure gauges, timers, mulch film & more",                  href: "#" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export function ProductCategoriesSection() {
  return (
    <section
      id="products"
      className="homepage-section"
      style={{ background: "var(--warm-white)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <span
            className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
            style={{ background: "var(--forest-100)", color: "var(--forest-700)" }}
          >
            Our Products
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-4">
            Everything You Need
            <br />
            <span className="gradient-text">for Better Irrigation</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            From drip pipes and fittings to complete irrigation solutions — find the products and support you need to build an efficient irrigation system.
          </p>
        </div>

        {/* Cards Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {categories.map((cat) => (
            <motion.a
              key={cat.name}
              href={cat.href}
              variants={cardVariants}
              className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 hover:border-forest-200 transition-all duration-300 cursor-pointer overflow-hidden"
              whileHover={{ y: -6 }}
            >
              {/* Background blob on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(135deg, var(--forest-50) 0%, white 100%)" }}
              />

              <div className="relative z-10">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm transition-transform duration-300 group-hover:scale-110"
                  style={{ background: "var(--forest-50)", border: "1px solid var(--forest-100)" }}
                >
                  {cat.icon}
                </div>

                <h3 className="font-display font-bold text-lg text-gray-900 mb-2">
                  {cat.name}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  {cat.desc}
                </p>

                <div
                  className="inline-flex items-center gap-1 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                  style={{ color: "var(--forest-600)" }}
                >
                  Explore <ArrowRight size={14} />
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
