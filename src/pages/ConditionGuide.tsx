import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { CONDITIONS, type ConditionRating } from "@/lib/conditions";
import { Shield, ArrowRight, CheckCircle2, TrendingUp, Eye } from "lucide-react";

const RATINGS: {
  rating: ConditionRating;
  extended: string;
  whatToExpect: string[];
  image: string;
}[] = [
  {
    rating: "A+",
    extended:
      "Virtually indistinguishable from new. All original components present and functioning perfectly. The highest standard in pre-owned horology.",
    whatToExpect: [
      "No scratches, marks, or signs of wear",
      "Crystal is flawless under magnification",
      "Bracelet shows zero stretch or desk marks",
      "Full set with box and papers preferred",
    ],
    image: "https://images.unsplash.com/photo-1622434641406-a158123450f9?w=600&q=80",
  },
  {
    rating: "A",
    extended:
      "Minimal signs of wear visible only under close inspection or a loupe. The watch presents beautifully on the wrist and has clearly been treasured by its previous owner.",
    whatToExpect: [
      "Hairline marks visible only under a loupe",
      "Crystal is clean and scratch-free",
      "Bracelet may show faint desk-diving marks",
      "Movement keeps excellent time",
    ],
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80",
  },
  {
    rating: "A-",
    extended:
      "Light surface marks visible to the naked eye on the case or bracelet. A well-cared-for watch that has been worn regularly and enjoyed as intended.",
    whatToExpect: [
      "Light surface marks visible to naked eye",
      "Crystal may have very minor blemishes",
      "Bracelet shows normal wear patterns",
      "All functions operate correctly",
    ],
    image: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&q=80",
  },
  {
    rating: "B+",
    extended:
      "Minor visible wear consistent with regular daily use. A great value proposition for collectors who prioritize wearing their watches rather than displaying them.",
    whatToExpect: [
      "Small scratches on case and bracelet",
      "Crystal may have light surface marks",
      "Clasp shows normal wear",
      "Excellent value for daily wear",
    ],
    image: "https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=600&q=80",
  },
  {
    rating: "B",
    extended:
      "Visible scratches on the case, bracelet, and possibly the crystal. The watch has seen significant wrist time and tells a story of genuine use.",
    whatToExpect: [
      "Visible scratches on case surfaces",
      "Bracelet shows significant wear",
      "Crystal may have visible marks",
      "Movement functions but may need service",
    ],
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80",
  },
  {
    rating: "B-",
    extended:
      "Noticeable damage including deeper scratches, dents, or discoloration. Honest pricing reflects the condition, making these pieces accessible to more collectors.",
    whatToExpect: [
      "Deeper scratches and possible dents",
      "Bracelet may show stretch or looseness",
      "Crystal may have visible scratches",
      "Professional servicing recommended",
    ],
    image: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=600&q=80",
  },
  {
    rating: "C",
    extended:
      "The watch requires professional repair or servicing. Sold with full transparency about all known issues. Perfect for collectors seeking restoration projects or movement donors.",
    whatToExpect: [
      "Significant cosmetic damage present",
      "May have non-functioning complications",
      "Movement may have timing issues",
      "Ideal for restoration enthusiasts",
    ],
    image: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600&q=80",
  },
];

const PILLARS = [
  {
    icon: TrendingUp,
    title: "Value Retention",
    description:
      "Accurate grading protects your investment. Higher-rated watches command stronger resale values and appreciate more reliably over time.",
  },
  {
    icon: CheckCircle2,
    title: "Buyer Confidence",
    description:
      "No surprises. Our detailed condition reports mean you know exactly what to expect before the watch reaches your wrist.",
  },
  {
    icon: Eye,
    title: "Full Transparency",
    description:
      "Every mark, scratch, and service history is disclosed upfront. We believe trust is built through radical honesty.",
  },
];

const ConditionGuide = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-luxury-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(40_40%_60%_/_0.06)_0%,_transparent_60%)]" />

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="h-px w-10 bg-gold/30" />
              <Shield className="w-4 h-4 text-gold/60" />
              <p className="font-sans text-[10px] font-medium tracking-[0.4em] uppercase text-gold/60">
                Expert Collaboration
              </p>
              <Shield className="w-4 h-4 text-gold/60" />
              <div className="h-px w-10 bg-gold/30" />
            </div>

            <h1 className="font-serif text-5xl md:text-6xl text-gold-gradient mb-6 leading-[1.1]">
              The GPW<br />Condition Scale
            </h1>

            <div className="h-px w-16 bg-gold/20 mx-auto mb-6" />

            <p className="font-sans text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Every watch in our collection is assessed by our team of master watchmakers
              and independent horological experts. Our 7-tier grading system ensures
              complete transparency — so you know exactly what you're getting.
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
      </section>

      {/* Ratings */}
      <section className="py-24">
        <div className="container max-w-5xl">
          <div className="space-y-0">
            {RATINGS.map(({ rating, extended, whatToExpect, image }, i) => {
              const cond = CONDITIONS[rating];
              const isEven = i % 2 === 0;

              return (
                <motion.div
                  key={rating}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="relative"
                >
                  {/* Connector line */}
                  {i < RATINGS.length - 1 && (
                    <div className="absolute left-1/2 -translate-x-px bottom-0 w-px h-12 bg-gradient-to-b from-gold/15 to-transparent hidden md:block" />
                  )}

                  <div className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} gap-8 md:gap-12 items-center py-12`}>
                    {/* Image side */}
                    <div className="w-full md:w-2/5 shrink-0">
                      <div className="relative group">
                        <div className="absolute -inset-3 bg-gradient-to-br from-gold/5 to-transparent rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative overflow-hidden rounded-sm border border-gold/10">
                          <img
                            src={image}
                            alt={`Condition ${rating} example`}
                            className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                          {/* Rating overlay */}
                          <div className="absolute top-4 left-4">
                            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-gold/15 rounded-sm px-3 py-1.5">
                              <span className={`font-serif text-lg font-semibold ${cond.color}`}>
                                {rating}
                              </span>
                              <span className="font-sans text-xs text-muted-foreground">
                                {cond.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content side */}
                    <div className="w-full md:w-3/5">
                      {/* Large rating */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full border border-gold/15 bg-surface-elevated">
                          <span className={`font-serif text-2xl font-semibold ${cond.color}`}>
                            {rating}
                          </span>
                        </div>
                        <div>
                          <h3 className={`font-serif text-2xl ${cond.color}`}>
                            {cond.label}
                          </h3>
                          <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-0.5">
                            Condition grade {rating}
                          </p>
                        </div>
                      </div>

                      <div className="h-px w-12 bg-gold/10 mb-5" />

                      <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-5">
                        {extended}
                      </p>

                      {/* What to expect checklist */}
                      <div className="space-y-2.5">
                        <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-gold/50 mb-3">
                          What to expect
                        </p>
                        {whatToExpect.map((item, j) => (
                          <motion.div
                            key={j}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.2 + j * 0.08 }}
                            className="flex items-start gap-2.5"
                          >
                            <div className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${cond.color.replace("text-", "bg-")}`} />
                            <span className="font-sans text-xs text-foreground/70">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  {i < RATINGS.length - 1 && (
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-surface/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(40_40%_60%_/_0.04)_0%,_transparent_60%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />

        <div className="container relative z-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 mb-5">
              <div className="h-px w-8 bg-gold/30" />
              <p className="font-sans text-[10px] font-medium tracking-[0.4em] uppercase text-gold/60">
                Our Promise
              </p>
              <div className="h-px w-8 bg-gold/30" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-gold-gradient">
              Why This Matters
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PILLARS.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-gold/15 bg-card mb-5 transition-all duration-500 group-hover:border-gold/30 group-hover:shadow-gold">
                  <pillar.icon className="w-5 h-5 text-gold/70" />
                </div>
                <h3 className="font-serif text-lg text-gold-light mb-3">
                  {pillar.title}
                </h3>
                <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="border border-gold/15 bg-card/50 backdrop-blur-sm p-12 md:p-16 text-center"
          >
            <p className="font-sans text-[10px] font-medium tracking-[0.4em] uppercase text-gold/60 mb-4">
              Ready to explore
            </p>
            <h2 className="font-serif text-3xl text-gold-gradient mb-4">
              Find Your Timepiece
            </h2>
            <p className="font-sans text-sm text-muted-foreground mb-8 max-w-md mx-auto">
              Every watch in our collection comes with a detailed condition report.
              Browse with confidence.
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 font-sans text-xs font-medium tracking-[0.3em] uppercase bg-gold text-primary-foreground px-10 py-4 transition-all duration-300 hover:bg-gold-light"
            >
              Browse Collection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ConditionGuide;
