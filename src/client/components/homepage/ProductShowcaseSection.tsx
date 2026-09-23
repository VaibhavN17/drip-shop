import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const products = [
  { name: "Drip Lateral Pipe",    sub: "12mm / 16mm LDPE",         emoji: "🌀", tag: "Bestseller" },
  { name: "Inline Drip Emitter",  sub: "2 LPH / 4 LPH",           emoji: "💧", tag: "Popular" },
  { name: "Disc Filter",          sub: "120 Mesh, 2\"",            emoji: "⚙️", tag: "" },
  { name: "Ball Valve",           sub: "1\" / 2\" / 3\"",          emoji: "🔧", tag: "" },
  { name: "Venturi Injector",     sub: "Fertigation System",       emoji: "🌿", tag: "" },
  { name: "Grommet Takeoff",      sub: "12mm / 16mm",              emoji: "🔩", tag: "" },
  { name: "Micro Sprinkler",      sub: "90L/hr Fan Jet",           emoji: "💦", tag: "New" },
  { name: "Pressure Gauge",       sub: "0-10 bar, 1/4\"",          emoji: "🔭", tag: "" },
  { name: "End Cap Plug",         sub: "12mm / 16mm LDPE",         emoji: "🔴", tag: "" },
  { name: "Mulch Film",           sub: "25 micron Black/Silver",   emoji: "🎞️", tag: "" },
];

export function ProductShowcaseSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 300 : -300, behavior: "smooth" });
  }

  // Mouse wheel horizontal scroll
  function handleWheel(e: React.WheelEvent) {
    if (!scrollRef.current) return;
    e.preventDefault();
    scrollRef.current.scrollBy({ left: e.deltaY, behavior: "smooth" });
  }

  return (
    <section
      className="homepage-section overflow-hidden"
      style={{ background: "white" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <span
              className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
              style={{ background: "var(--forest-100)", color: "var(--forest-700)" }}
            >
              Catalogue
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-gray-900">
              Popular <span className="gradient-text">Products</span>
            </h2>
          </div>

          {/* Arrow buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:bg-forest-50 hover:border-forest-300"
              style={{ borderColor: "#e5e7eb" }}
            >
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:bg-forest-50 hover:border-forest-300"
              style={{ borderColor: "#e5e7eb" }}
            >
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Horizontal scroll container */}
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          className="flex gap-5 overflow-x-auto no-scrollbar pb-4"
        >
          {products.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex-shrink-0 group w-52 bg-white rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-forest-200"
              style={{ borderColor: "#e5e7eb" }}
              whileHover={{ y: -6 }}
            >
              {/* Product image area */}
              <div
                className="w-full h-40 flex items-center justify-center text-5xl transition-transform duration-300 group-hover:scale-110"
                style={{ background: "linear-gradient(135deg, var(--forest-50), var(--warm-white))" }}
              >
                {p.emoji}
              </div>

              {/* Info */}
              <div className="p-4">
                {p.tag && (
                  <span
                    className="inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-2"
                    style={{ background: p.tag === "New" ? "#fef3c7" : "var(--forest-100)", color: p.tag === "New" ? "#b45309" : "var(--forest-700)" }}
                  >
                    {p.tag}
                  </span>
                )}
                <div className="font-display font-bold text-gray-900 text-sm leading-tight">{p.name}</div>
                <div className="text-xs text-gray-400 mt-1">{p.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
