import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showBg = !isHome || scrolled;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out border-b"
      style={{
        backgroundColor: showBg ? "hsl(220 20% 4% / 0.8)" : "transparent",
        backdropFilter: showBg ? "blur(12px)" : "blur(0px)",
        WebkitBackdropFilter: showBg ? "blur(12px)" : "blur(0px)",
        borderColor: showBg ? "hsl(220 15% 15%)" : "transparent",
      }}
    >
      <nav className="container flex items-center justify-between h-20">
        <Link to="/" className="group">
          <span className="font-serif text-xl tracking-wide text-gold-light transition-colors group-hover:text-gold">
            Golden Planet Watches
          </span>
        </Link>

        <div className="flex items-center gap-4 md:gap-8">
          <Link
            to="/catalog"
            className="font-sans text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground transition-colors hover:text-gold"
          >
            Collection
          </Link>
          <Link
            to="/about"
            className="font-sans text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground transition-colors hover:text-gold"
          >
            About
          </Link>
          <Link
            to="/studio"
            className="font-sans text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground transition-colors hover:text-gold"
          >
            Studio
          </Link>
          <Link
            to="/manage"
            className="font-sans text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground transition-colors hover:text-gold"
          >
            Manage
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
