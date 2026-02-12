import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { WatchCard } from "./WatchCard";
import { useAllWatches } from "@/hooks/use-watches";

export function NewlyAddedSection() {
  const { watches } = useAllWatches();
  const newest = [...watches]
    .sort((a, b) => b.year - a.year || b.id.localeCompare(a.id))
    .slice(0, 3);

  if (newest.length === 0) return null;

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
            Fresh Arrivals
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-gold-gradient">
            Newly Added
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {newest.map((watch, i) => (
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
            See All →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
