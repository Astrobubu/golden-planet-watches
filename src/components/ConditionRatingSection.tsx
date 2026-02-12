import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CONDITIONS } from "@/lib/conditions";
import { Shield, ChevronRight } from "lucide-react";

const HIGHLIGHTS = [
  { rating: "A+" as const, glow: "from-emerald-500/20 via-emerald-400/5 to-transparent" },
  { rating: "A" as const, glow: "from-emerald-400/15 via-emerald-300/5 to-transparent" },
  { rating: "A-" as const, glow: "from-green-400/15 via-green-300/5 to-transparent" },
  { rating: "B+" as const, glow: "from-yellow-400/15 via-yellow-300/5 to-transparent" },
];

export function ConditionRatingSection() {
  return (
    <section className="relative py-28 overflow-hidden">
      {/* Luxury background */}
      <div className="absolute inset-0 bg-luxury-gradient" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(40_40%_60%_/_0.06)_0%,_transparent_60%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 mb-5">
            <div className="h-px w-8 bg-gold/30" />
            <Shield className="w-4 h-4 text-gold/60" />
            <p className="font-sans text-[10px] font-medium tracking-[0.4em] uppercase text-gold/60">
              Expert Collaboration
            </p>
            <Shield className="w-4 h-4 text-gold/60" />
            <div className="h-px w-8 bg-gold/30" />
          </div>

          <h2 className="font-serif text-4xl md:text-5xl text-gold-gradient mb-5">
            The GPW Condition Scale
          </h2>

          <p className="font-sans text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Developed in collaboration with master watchmakers and independent experts,
            our 7-tier grading system sets a new standard for pre-owned watch transparency.
          </p>
        </motion.div>

        {/* Rating cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {HIGHLIGHTS.map(({ rating, glow }, i) => {
            const cond = CONDITIONS[rating];
            return (
              <motion.div
                key={rating}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="group relative"
              >
                {/* Card */}
                <div className="relative border border-gold/10 bg-card/80 backdrop-blur-sm rounded-sm p-7 text-center transition-all duration-500 hover:border-gold/25 hover:shadow-gold overflow-hidden h-full">
                  {/* Top glow */}
                  <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${glow} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Rating badge */}
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-gold/20 bg-surface-elevated mb-5">
                      <span className={`font-serif text-xl font-semibold ${cond.color}`}>
                        {rating}
                      </span>
                    </div>

                    <h3 className={`font-serif text-lg mb-2 ${cond.color}`}>
                      {cond.label}
                    </h3>

                    <div className="h-px w-8 bg-gold/15 mx-auto mb-3" />

                    <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                      {cond.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="font-sans text-xs text-muted-foreground mb-5">
            3 more tiers for complete transparency
          </p>
          <Link
            to="/conditions"
            className="inline-flex items-center gap-2 font-sans text-xs font-medium tracking-[0.3em] uppercase text-gold border border-gold/20 px-8 py-3 transition-all duration-300 hover:bg-gold/10 hover:border-gold/40"
          >
            View Full Scale
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
