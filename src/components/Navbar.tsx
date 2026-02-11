import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        isHome ? "bg-transparent" : "bg-background/80 backdrop-blur-md border-b border-border"
      }`}
    >
      <nav className="container flex items-center justify-between h-20">
        <Link to="/" className="group">
          <span className="font-serif text-xl tracking-wide text-gold-light transition-colors group-hover:text-gold">
            Maison du Temps
          </span>
        </Link>

        <div className="flex items-center gap-8">
          <Link
            to="/catalog"
            className="font-sans text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground transition-colors hover:text-gold"
          >
            Collection
          </Link>
          <Link
            to="/catalog"
            className="font-sans text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground transition-colors hover:text-gold"
          >
            About
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
