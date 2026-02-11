import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { WatchCard } from "@/components/WatchCard";
import { MOCK_WATCHES } from "@/lib/mock-watches";

const BRANDS = ["All", ...Array.from(new Set(MOCK_WATCHES.map((w) => w.brand)))];
const RATINGS = ["All", "A+", "A", "A-", "B+", "B", "B-", "C"];

const Catalog = () => {
  const [brand, setBrand] = useState("All");
  const [rating, setRating] = useState("All");

  const filtered = useMemo(() => {
    return MOCK_WATCHES.filter((w) => {
      if (brand !== "All" && w.brand !== brand) return false;
      if (rating !== "All" && w.condition_rating !== rating) return false;
      return true;
    });
  }, [brand, rating]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="font-serif text-4xl md:text-5xl text-gold-gradient">
              The Collection
            </h1>
            <p className="font-sans text-sm text-muted-foreground mt-3">
              {MOCK_WATCHES.length} authenticated timepieces
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-12"
          >
            {BRANDS.map((b) => (
              <button
                key={b}
                onClick={() => setBrand(b)}
                className={`font-sans text-[10px] tracking-[0.2em] uppercase px-4 py-2 border transition-all duration-300 ${
                  brand === b
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-border text-muted-foreground hover:border-gold/30 hover:text-gold/80"
                }`}
              >
                {b}
              </button>
            ))}
            <div className="w-px h-6 bg-border mx-2" />
            {RATINGS.slice(0, 5).map((r) => (
              <button
                key={r}
                onClick={() => setRating(r)}
                className={`font-sans text-[10px] tracking-[0.2em] uppercase px-3 py-2 border transition-all duration-300 ${
                  rating === r
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-border text-muted-foreground hover:border-gold/30 hover:text-gold/80"
                }`}
              >
                {r}
              </button>
            ))}
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((watch, i) => (
              <WatchCard key={watch.id} watch={watch} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="font-serif text-xl text-muted-foreground">No pieces match your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalog;
