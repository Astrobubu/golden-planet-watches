import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ConditionBadge } from "./ConditionBadge";
import { type Watch, getDisplayPrice, formatPrice } from "@/lib/mock-watches";

interface WatchCardProps {
  watch: Watch;
  index?: number;
}

export function WatchCard({ watch, index = 0 }: WatchCardProps) {
  const price = getDisplayPrice(watch);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Link to={`/watch/${watch.id}`} className="group block">
        <div className="relative overflow-hidden rounded-sm border border-border bg-card transition-all duration-500 hover:border-gold/30 hover:shadow-gold">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-surface-elevated">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="font-serif text-2xl text-gold/40">{watch.brand}</div>
                <div className="font-sans text-xs tracking-[0.3em] text-muted-foreground mt-1">{watch.model}</div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </div>

          {/* Info */}
          <div className="p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-sans text-[10px] font-medium tracking-[0.25em] uppercase text-gold">
                  {watch.brand}
                </p>
                <h3 className="font-serif text-lg text-foreground mt-0.5">
                  {watch.model}
                </h3>
              </div>
              <ConditionBadge rating={watch.condition_rating} />
            </div>
            <div className="flex items-end justify-between pt-1">
              <p className="font-sans text-sm text-muted-foreground">
                {watch.year} · {watch.case_size_mm}mm
              </p>
              <p className="font-serif text-lg text-gold-light">
                {formatPrice(price)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
