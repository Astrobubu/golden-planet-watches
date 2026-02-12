import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp, Award, MapPin } from "lucide-react";

const STATS = [
  { value: "100%", label: "Authenticated", icon: ShieldCheck },
  { value: "500+", label: "Pieces Sold", icon: TrendingUp },
  { value: "A+ Rated", label: "Condition Graded", icon: Award },
  { value: "Dubai, UAE", label: "Based", icon: MapPin },
];

export function TrustBar() {
  return (
    <section className="border-y border-border/50 bg-surface/30">
      <div className="container py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="flex flex-col items-center text-center gap-2"
            >
              <stat.icon className="w-5 h-5 text-gold/70" />
              <p className="font-serif text-xl md:text-2xl text-gold-light">{stat.value}</p>
              <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
