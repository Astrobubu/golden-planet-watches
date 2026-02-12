import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-screen items-center justify-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center px-4"
        >
          <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold/60 mb-4">
            Lost in Time
          </p>
          <h1 className="font-serif text-7xl md:text-9xl text-gold-gradient mb-6">
            404
          </h1>
          <p className="font-sans text-sm text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
            This timepiece could not be found. It may have been claimed by another collector,
            or perhaps it exists in a different era entirely.
          </p>
          <Link
            to="/"
            className="inline-block font-sans text-xs font-medium tracking-[0.25em] uppercase text-gold border border-gold/30 px-8 py-3 transition-all duration-300 hover:bg-gold/10"
          >
            Return Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
