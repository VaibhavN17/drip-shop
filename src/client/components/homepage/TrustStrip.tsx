import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Truck, Award, Users, Droplets, HeartHandshake } from "lucide-react";

const items = [
  { icon: Droplets,      label: "ड्रिप सिंचन",       sub: "Drip Irrigation" },
  { icon: ShieldCheck,   label: "विश्वासार्ह साहित्य", sub: "Quality Products" },
  { icon: Award,         label: "सरकारी अनुदान",      sub: "Subsidy Guidance" },
  { icon: HeartHandshake,label: "ग्राहक मार्गदर्शन",  sub: "Customer Support" },
  { icon: Truck,         label: "होम डिलिव्हरी",       sub: "Home Delivery" },
  { icon: Users,         label: "शेतकऱ्यांसाठी",      sub: "For Farmers" },
];

export function TrustStrip() {
  return (
    <section
      id="trust-strip"
      style={{ background: "#fffdf7", borderBottom: "1px solid #e7e5e4" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="flex flex-col items-center gap-2 text-center group cursor-default"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                  style={{ background: "linear-gradient(135deg, #fef9ec, #fef3c7)", border: "1px solid #fde68a" }}
                >
                  <Icon size={20} style={{ color: "#b45309" }} />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-800">{item.label}</div>
                  <div className="text-[10px] text-stone-400">{item.sub}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
