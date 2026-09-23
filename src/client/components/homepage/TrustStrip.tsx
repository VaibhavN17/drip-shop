import React from "react";

const items = [
  "🌱 Quality Products",
  "💧 Irrigation Solutions",
  "📋 Estimate Support",
  "🚜 Farmer First",
  "🏛️ Subsidy Guidance",
  "⚙️ Expert Installation",
  "🌱 Quality Products",
  "💧 Irrigation Solutions",
  "📋 Estimate Support",
  "🚜 Farmer First",
  "🏛️ Subsidy Guidance",
  "⚙️ Expert Installation",
];

export function TrustStrip() {
  return (
    <div
      id="trust-strip"
      className="overflow-hidden py-4 border-y"
      style={{ background: "var(--forest-800)", borderColor: "var(--forest-700)" }}
    >
      <div className="flex animate-marquee whitespace-nowrap gap-0">
        {items.map((item, i) => (
          <React.Fragment key={i}>
            <span
              className="text-sm font-semibold tracking-wide px-6 shrink-0"
              style={{ color: "#b8edca" }}
            >
              {item}
            </span>
            <span className="text-forest-500 shrink-0 self-center" style={{ color: "#52c27d" }}>
              •
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
