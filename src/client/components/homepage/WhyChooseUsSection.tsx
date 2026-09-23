import React from "react";
import { motion } from "framer-motion";
import { Package, FileText, BadgePercent, Star, Users, Wrench } from "lucide-react";

const benefits = [
  { icon: Package,      title: "Wide Range of Products",        desc: "Drip pipes, emitters, filters, valves, sprinklers and more from trusted brands." },
  { icon: FileText,     title: "Transparent Estimates",         desc: "Itemized quotations with per-unit pricing. No hidden charges. Clear and honest." },
  { icon: BadgePercent, title: "Subsidy Guidance",              desc: "We help you understand government schemes and prepare the right documentation." },
  { icon: Star,         title: "Product Recommendations",       desc: "Based on your crop, soil, and land area — we suggest the right system for you." },
  { icon: Users,        title: "Farmer-Focused Support",        desc: "Marathi and Hindi support. We understand local farming needs and challenges." },
  { icon: Wrench,       title: "Complete Irrigation Solutions", desc: "From planning to product supply — we support you through the entire process." },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export function WhyChooseUsSection() {
  return (
    <section
      id="about"
      className="homepage-section"
      style={{ background: "white" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <span
            className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
            style={{ background: "var(--forest-100)", color: "var(--forest-700)" }}
          >
            Why Us
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-4">
            Why Farmers
            <span className="gradient-text"> Choose Us</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Service-oriented. Farmer-first. We're not just a shop — we're your irrigation partner.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                variants={cardVariants}
                className="group relative p-7 rounded-2xl border transition-all duration-300 hover:shadow-lg cursor-default"
                style={{ borderColor: "#e5e7eb", background: "white" }}
                whileHover={{ borderColor: "var(--forest-300)", y: -4 }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300 group-hover:bg-forest-100"
                  style={{ background: "var(--forest-50)" }}
                >
                  <Icon size={22} style={{ color: "var(--forest-600)" }} />
                </div>
                <h3 className="font-display font-bold text-gray-900 text-lg mb-2">{b.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>

                {/* Accent bottom border */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(90deg, var(--forest-400), var(--forest-600))" }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
