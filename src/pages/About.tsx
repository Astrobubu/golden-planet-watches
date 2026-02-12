import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Gem, Wrench } from "lucide-react";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Authentication",
    description:
      "Every timepiece undergoes a rigorous multi-point verification process. We examine movement serial numbers, case engravings, dial markers, and provenance documentation to guarantee authenticity.",
  },
  {
    icon: Gem,
    title: "Curation",
    description:
      "We don't simply buy and sell watches — we select them. Each piece in our collection is hand-picked for its condition, rarity, and enduring value, ensuring only the finest enter our vault.",
  },
  {
    icon: Wrench,
    title: "Craftsmanship",
    description:
      "Before a watch reaches you, our master watchmakers service, calibrate, and restore it to meet the highest horological standards. We honor the craft behind every movement.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="container max-w-4xl">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold/60 mb-4">
              Our Story
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-gold-gradient mb-6">
              Golden Planet Watches
            </h1>
            <p className="font-sans text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Founded on a passion for horology and an unwavering commitment to authenticity,
              Golden Planet Watches is a private destination for collectors seeking pre-owned luxury
              timepieces of exceptional quality. We believe every watch tells a story — and we
              ensure that story is genuine.
            </p>
          </motion.div>

          <Separator className="mb-16" />

          {/* Three Pillars */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="font-serif text-2xl md:text-3xl text-gold-gradient text-center mb-12">
              Our Pillars
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {pillars.map((pillar, i) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center">
                      <pillar.icon className="w-5 h-5 text-gold" />
                    </div>
                  </div>
                  <h3 className="font-serif text-lg text-foreground mb-3">
                    {pillar.title}
                  </h3>
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <Separator className="mb-16" />

          {/* Brand Promise */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold/60 mb-4">
              Our Promise
            </p>
            <h2 className="font-serif text-2xl md:text-3xl text-gold-gradient mb-6">
              Time, Perfected
            </h2>
            <p className="font-sans text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              When you acquire a timepiece from Golden Planet Watches, you receive more than a watch —
              you receive our guarantee of authenticity, our dedication to quality, and our
              lifelong commitment to your satisfaction as a collector.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
