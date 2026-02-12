import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ConditionBadge } from "./ConditionBadge";
import { LiveWatchToggle } from "./LiveWatchToggle";
import { DirhamSign } from "./DirhamSign";
import { type Watch, getDisplayPrice, formatPrice } from "@/lib/mock-watches";

interface WatchCardProps {
  watch: Watch;
  index?: number;
}

export function WatchCard({ watch, index = 0 }: WatchCardProps) {
  const price = getDisplayPrice(watch);
  const [hovered, setHovered] = useState(false);
  const hoverImage = watch.ai_generated_images?.[2] ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Link
        to={`/watch/${watch.id}`}
        className="group block"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative overflow-hidden rounded-sm border border-border bg-card transition-all duration-500 hover:border-gold/30 hover:shadow-gold">
          {/* Image */}
          <div className={`relative aspect-square overflow-hidden ${watch.live_face_data ? "bg-white" : "bg-surface-elevated"}`}>
            {watch.original_image_url ? (
              watch.live_face_data ? (
                <LiveWatchToggle
                  staticSrc={watch.original_image_url}
                  liveFaceData={watch.live_face_data}
                  initialLive={true}
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <>
                  <img
                    src={watch.original_image_url}
                    alt={`${watch.brand} ${watch.model}`}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                    style={{ opacity: hovered && hoverImage ? 0 : 1 }}
                    loading="lazy"
                  />
                  {hoverImage && (
                    <img
                      src={hoverImage}
                      alt={`${watch.brand} ${watch.model} alternate`}
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-700 scale-105"
                      style={{ opacity: hovered ? 1 : 0 }}
                      loading="lazy"
                    />
                  )}
                </>
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-serif text-2xl text-gold/40">{watch.brand}</div>
                  <div className="font-sans text-xs tracking-[0.3em] text-muted-foreground mt-1">{watch.model}</div>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
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
              <p className="font-serif text-lg text-gold-light flex items-center gap-1">
                <DirhamSign className="w-4 h-4" />
                {formatPrice(price)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
