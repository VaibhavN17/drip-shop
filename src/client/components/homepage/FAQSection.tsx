import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "Do you provide irrigation estimates?",
    a: "Yes. We prepare detailed, itemized estimates for drip irrigation systems including products, quantities, and pricing. You can request an estimate online or visit our shop.",
  },
  {
    q: "Can you help with government subsidy schemes?",
    a: "We provide assistance with understanding applicable Maharashtra government irrigation schemes and help you prepare the documentation and quotations needed for subsidy applications. Eligibility is subject to current government rules.",
  },
  {
    q: "What products do you sell?",
    a: "We stock drip pipes, inline and on-line emitters, disc and screen filters, ball valves, venturi injectors, fertilizer tanks, grommet takeoffs, sprinklers, pressure gauges, mulch film, and a full range of fittings and accessories.",
  },
  {
    q: "Can I request an estimate online?",
    a: "Yes. You can use our online estimate builder to select products, enter quantities, and get a structured estimate. Login to get started.",
  },
  {
    q: "Do you provide support in Marathi?",
    a: "हो. आमच्या दुकानात मराठीत मदत उपलब्ध आहे. आम्ही शेतकऱ्यांना त्यांच्या भाषेत सेवा देतो.",
  },
  {
    q: "What is drip irrigation and is it suitable for my crop?",
    a: "Drip irrigation delivers water directly to the root zone of plants through a network of pipes and emitters. It is suitable for most crops including fruits, vegetables, sugarcane, cotton, and floriculture. Contact us to discuss your specific situation.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="homepage-section"
      style={{ background: "var(--warm-white)" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <span
            className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
            style={{ background: "var(--forest-100)", color: "var(--forest-700)" }}
          >
            FAQ
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-gray-900">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="rounded-2xl overflow-hidden border transition-all duration-200"
                style={{
                  borderColor: isOpen ? "var(--forest-200)" : "#e5e7eb",
                  background: isOpen ? "white" : "white",
                  boxShadow: isOpen ? "0 4px 16px rgba(45,122,79,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                {/* Question */}
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-gray-900 text-sm leading-snug">{faq.q}</span>
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: isOpen ? "var(--forest-600)" : "var(--forest-50)" }}
                  >
                    {isOpen
                      ? <Minus size={14} className="text-white" />
                      : <Plus size={14} style={{ color: "var(--forest-600)" }} />
                    }
                  </span>
                </button>

                {/* Answer */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t" style={{ borderColor: "var(--forest-100)" }}>
                        <div className="pt-4">{faq.a}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
