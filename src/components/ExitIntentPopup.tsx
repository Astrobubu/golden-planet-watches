import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const TIERS = [
  {
    visit: 1,
    heading: "Join Our Private Circle",
    message: "Gain early access to rare and newly authenticated timepieces before they reach the public collection.",
    cta: "Request Access",
  },
  {
    visit: 2,
    heading: "Welcome Back, Collector",
    message: "Let one of our specialists curate a personal selection based on your taste and collection goals.",
    cta: "Speak with a Specialist",
  },
  {
    visit: 3,
    heading: "An Exclusive Preview Awaits",
    message: "As a returning visitor, you have priority access to our latest acquisitions — pieces not yet listed in the collection.",
    cta: "View Preview",
  },
];

export function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [tier, setTier] = useState(TIERS[0]);

  useEffect(() => {
    const visits = parseInt(localStorage.getItem("gpw_visits") || "0", 10) + 1;
    localStorage.setItem("gpw_visits", String(visits));

    const tierIndex = Math.min(visits - 1, TIERS.length - 1);
    setTier(TIERS[tierIndex]);

    const dismissed = sessionStorage.getItem("gpw_exit_dismissed");
    if (dismissed) return;

    const handler = (e: MouseEvent) => {
      if (e.clientY <= 5) {
        setShow(true);
      }
    };

    document.addEventListener("mouseleave", handler);
    return () => document.removeEventListener("mouseleave", handler);
  }, []);

  const dismiss = useCallback(() => {
    setShow(false);
    sessionStorage.setItem("gpw_exit_dismissed", "true");
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={dismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-md w-full mx-4 border border-gold/30 bg-card p-10 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={dismiss} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>

            <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold/60 mb-3">
              Private Invitation
            </p>
            <h3 className="font-serif text-2xl text-gold-gradient mb-4">
              {tier.heading}
            </h3>
            <p className="font-sans text-sm text-muted-foreground mb-6">
              {tier.message}
            </p>
            <button
              onClick={dismiss}
              className="font-sans text-xs font-medium tracking-[0.25em] uppercase text-gold border border-gold/30 px-8 py-3 transition-all duration-300 hover:bg-gold/10"
            >
              {tier.cta}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
