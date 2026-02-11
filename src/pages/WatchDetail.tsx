import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { ConditionBadge } from "@/components/ConditionBadge";
import { CONDITIONS, type ConditionRating } from "@/lib/conditions";
import { MOCK_WATCHES, getDisplayPrice, formatPrice } from "@/lib/mock-watches";
import { ArrowLeft, MessageCircle } from "lucide-react";

const WatchDetail = () => {
  const { id } = useParams();
  const watch = MOCK_WATCHES.find((w) => w.id === id);

  if (!watch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <h1 className="font-serif text-3xl text-foreground">Watch not found</h1>
          <Link to="/catalog" className="text-gold mt-4 inline-block font-sans text-sm">← Back to collection</Link>
        </div>
      </div>
    );
  }

  const price = getDisplayPrice(watch);
  const condition = CONDITIONS[watch.condition_rating as ConditionRating];

  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in the ${watch.brand} ${watch.model} (Ref: ${watch.reference_number}) listed at ${formatPrice(price)}.`
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/catalog" className="inline-flex items-center gap-2 font-sans text-xs tracking-wider uppercase text-muted-foreground hover:text-gold transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              Back to Collection
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <div className="aspect-square rounded-sm border border-border bg-surface-elevated flex items-center justify-center">
                <div className="text-center">
                  <div className="font-serif text-4xl text-gold/30">{watch.brand}</div>
                  <div className="font-sans text-sm tracking-[0.3em] text-muted-foreground/50 mt-2">{watch.model}</div>
                  <p className="font-sans text-[10px] text-muted-foreground/30 mt-6">AI-generated gallery coming soon</p>
                </div>
              </div>

              {/* Thumbnail placeholders */}
              <div className="grid grid-cols-4 gap-3">
                {["Front", "Table", "Wrist", "Detail"].map((label) => (
                  <div key={label} className="aspect-square rounded-sm border border-border bg-surface-elevated flex items-center justify-center">
                    <span className="font-sans text-[9px] text-muted-foreground/40 tracking-wider uppercase">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <p className="font-sans text-[10px] font-medium tracking-[0.35em] uppercase text-gold mb-1">
                  {watch.brand}
                </p>
                <h1 className="font-serif text-3xl md:text-4xl text-foreground">
                  {watch.model}
                </h1>
                <p className="font-sans text-sm text-muted-foreground mt-1">
                  Ref. {watch.reference_number}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <ConditionBadge rating={watch.condition_rating} showLabel size="md" />
                {condition && (
                  <span className="font-sans text-xs text-muted-foreground">{condition.description}</span>
                )}
              </div>

              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                {watch.description}
              </p>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-4 border-t border-b border-border py-6">
                {[
                  ["Year", watch.year],
                  ["Case Size", `${watch.case_size_mm}mm`],
                  ["Case Material", watch.case_material],
                  ["Dial", watch.dial_color],
                  ["Movement", watch.movement_type],
                  ["Condition", watch.condition_rating],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-0.5">{label}</p>
                    <p className="font-sans text-sm text-foreground">{value}</p>
                  </div>
                ))}
              </div>

              {/* Price & CTA */}
              <div className="space-y-4">
                <div>
                  <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Price</p>
                  <p className="font-serif text-3xl text-gold-light">{formatPrice(price)}</p>
                </div>

                <a
                  href={`https://wa.me/?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-gold text-primary-foreground font-sans text-xs font-semibold tracking-[0.25em] uppercase transition-all duration-300 hover:bg-gold-light"
                >
                  <MessageCircle className="w-4 h-4" />
                  Inquire Now
                </a>

                <p className="font-sans text-[10px] text-muted-foreground text-center">
                  All inquiries answered within 24 hours
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchDetail;
