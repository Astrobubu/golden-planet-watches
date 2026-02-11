import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LiveClock } from "./LiveClock";
import { ChevronDown } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-luxury-gradient">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(40_40%_60%_/_0.04)_0%,_transparent_70%)]" />

      <div className="container relative z-10 flex flex-col items-center gap-12 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center"
        >
          <p className="font-sans text-[10px] md:text-xs font-medium tracking-[0.4em] uppercase text-gold/70 mb-4">
            Curated Pre-Owned Timepieces
          </p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-gold-gradient leading-[1.1]">
            Maison du Temps
          </h1>
          <p className="font-sans text-sm md:text-base text-muted-foreground mt-4 max-w-md mx-auto leading-relaxed">
            Where every second counts. Authenticated luxury watches, each one telling a story of craftsmanship.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.8 }}
        >
          <LiveClock />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="flex flex-col items-center gap-6"
        >
          <Link
            to="/catalog"
            className="font-sans text-xs font-medium tracking-[0.3em] uppercase text-gold border border-gold/30 px-8 py-3 transition-all duration-300 hover:bg-gold/10 hover:border-gold/50"
          >
            View Collection
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1, delay: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-8"
        >
          <ChevronDown className="w-5 h-5 text-gold/40" />
        </motion.div>
      </div>
    </section>
  );
}
