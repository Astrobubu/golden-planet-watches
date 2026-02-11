import { motion } from "framer-motion";
import { WatchCard } from "./WatchCard";
import { MOCK_WATCHES } from "@/lib/mock-watches";
import { Link } from "react-router-dom";

export function FeaturedSection() {
  const featured = MOCK_WATCHES.filter((w) => w.is_featured);

  return (
    <section className="py-24 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="font-sans text-[10px] font-medium tracking-[0.4em] uppercase text-gold/60 mb-3">
            Hand-Selected
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-gold-gradient">
            Featured Pieces
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((watch, i) => (
            <WatchCard key={watch.id} watch={watch} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            to="/catalog"
            className="font-sans text-xs font-medium tracking-[0.3em] uppercase text-gold/70 transition-colors hover:text-gold"
          >
            View Entire Collection →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
