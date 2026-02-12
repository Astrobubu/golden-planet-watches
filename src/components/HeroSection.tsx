import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { getDisplayPrice, formatPrice } from "@/lib/mock-watches";
import { useAllWatches } from "@/hooks/use-watches";
import { DirhamSign } from "./DirhamSign";

const SWIPE_THRESHOLD = 50;

export function HeroSection() {
  const { watches } = useAllWatches();
  const heroWatches = watches.filter((w) => w.is_hero);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const len = heroWatches.length;

  const go = useCallback((dir: 1 | -1) => {
    setDirection(dir);
    setCurrent((prev) => (prev + dir + len) % len);
  }, [len]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => go(1), 6000);
  }, [go]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) {
      go(1);
    } else if (info.offset.x > SWIPE_THRESHOLD) {
      go(-1);
    }
    resetTimer();
  }, [go, resetTimer]);

  // Clamp index if watches changed
  const safeIndex = heroWatches.length > 0 ? current % heroWatches.length : 0;

  if (heroWatches.length === 0) return null;

  const watch = heroWatches[safeIndex];
  const price = getDisplayPrice(watch);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-luxury-gradient">
      {/* Blurred background image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${safeIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={watch.original_image_url}
            alt=""
            className="w-full h-full object-cover blur-3xl scale-110"
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(40_40%_60%_/_0.04)_0%,_transparent_70%)]" />

      <div className="container relative z-10 pt-24 pb-16">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={safeIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -80 }}
            transition={{ duration: 0.5 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={handleDragEnd}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[70vh] cursor-grab active:cursor-grabbing"
            style={{ touchAction: "pan-y" }}
          >
            {/* Watch image */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="relative flex items-center justify-center order-1 lg:order-1"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(40_40%_60%_/_0.08)_0%,_transparent_60%)]" />
              <img
                src={watch.original_image_url}
                alt={`${watch.brand} ${watch.model}`}
                className="relative w-full max-w-md lg:max-w-lg aspect-square object-cover rounded-sm"
              />
            </motion.div>

            {/* Watch info */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col gap-6 order-2 lg:order-2"
            >
              <div>
                <p className="font-sans text-[10px] md:text-xs font-medium tracking-[0.4em] uppercase text-gold/70 mb-3">
                  {watch.brand}
                </p>
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-gold-gradient leading-[1.1]">
                  {watch.model}
                </h1>
              </div>

              <p className="font-sans text-sm md:text-base text-muted-foreground max-w-md leading-relaxed">
                {watch.description}
              </p>

              <p className="font-serif text-2xl md:text-3xl text-gold-light flex items-center gap-2">
                <DirhamSign className="w-6 h-6" />
                {formatPrice(price)}
              </p>

              <Link
                to={`/watch/${watch.id}`}
                className="self-start font-sans text-xs font-medium tracking-[0.3em] uppercase text-gold border border-gold/30 px-8 py-3 transition-all duration-300 hover:bg-gold/10 hover:border-gold/50"
              >
                View Details
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation dots */}
        <div className="flex items-center justify-center gap-3 mt-8">
          {heroWatches.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > safeIndex ? 1 : -1); setCurrent(i); resetTimer(); }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === safeIndex
                  ? "bg-gold w-6"
                  : "bg-gold/30 hover:bg-gold/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Scroll-down chevron */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1, delay: 2, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="w-5 h-5 text-gold/40" />
      </motion.div>
    </section>
  );
}
