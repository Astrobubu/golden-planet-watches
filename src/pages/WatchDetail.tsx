import { useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { ConditionBadge } from "@/components/ConditionBadge";
import { WatchCard } from "@/components/WatchCard";
import { LiveWatchToggle } from "@/components/LiveWatchToggle";
import { CONDITIONS, type ConditionRating } from "@/lib/conditions";
import { getDisplayPrice, formatPrice } from "@/lib/mock-watches";
import { DirhamSign } from "@/components/DirhamSign";
import { useAllWatches } from "@/hooks/use-watches";
import { WHATSAPP_NUMBER } from "@/lib/config";
import { MessageCircle, Pencil } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const WatchDetail = () => {
  const { id } = useParams();
  const { watches } = useAllWatches();
  const watch = watches.find((w) => w.id === id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLive, setShowLive] = useState(!!watch?.live_face_data);
  const [zoomed, setZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x, y });
  }, []);

  // Gallery images = only AI-generated shots (NOT the source upload)
  const galleryImages = useMemo(() => {
    if (!watch) return [];
    const imgs: string[] = [];
    if (watch.original_image_url) imgs.push(watch.original_image_url);
    if (watch.ai_generated_images?.length) imgs.push(...watch.ai_generated_images);
    return imgs;
  }, [watch]);

  const relatedWatches = useMemo(() => {
    if (!watch) return [];
    const currentPrice = getDisplayPrice(watch);
    return watches.filter((w) => {
      if (w.id === watch.id) return false;
      const sameBrand = w.brand === watch.brand;
      const priceInRange = Math.abs(getDisplayPrice(w) - currentPrice) <= 20000;
      return sameBrand || priceInRange;
    }).slice(0, 3);
  }, [watch, watches]);

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
  const hasLive = !!watch.live_face_data;

  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in the ${watch.brand} ${watch.model} (Ref: ${watch.reference_number}) listed at AED ${formatPrice(price)}.`
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container">
          {/* Breadcrumbs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Breadcrumb>
              <BreadcrumbList className="font-sans text-xs tracking-wider">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="text-muted-foreground hover:text-gold transition-colors">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/catalog" className="text-muted-foreground hover:text-gold transition-colors">Collection</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="truncate max-w-[200px] text-gold/80">
                    {watch.brand} {watch.model}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
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
              <div
                className={`aspect-square rounded-sm border border-border overflow-hidden flex items-center justify-center cursor-crosshair ${showLive && hasLive ? "bg-white" : "bg-surface-elevated"}`}
                onMouseEnter={() => setZoomed(true)}
                onMouseLeave={() => setZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                {showLive && hasLive ? (
                  <LiveWatchToggle
                    staticSrc={galleryImages[0] || ""}
                    liveFaceData={watch.live_face_data}
                    initialLive={true}
                    className="w-full h-full"
                  />
                ) : galleryImages.length > 0 ? (
                  <img
                    src={galleryImages[selectedImageIndex]}
                    alt={`${watch.brand} ${watch.model}`}
                    className="w-full h-full object-contain transition-transform duration-300 ease-out"
                    style={{
                      transform: zoomed ? "scale(2)" : "scale(1)",
                      transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                    }}
                  />
                ) : (
                  <div className="text-center">
                    <div className="font-serif text-4xl text-gold/30">{watch.brand}</div>
                    <div className="font-sans text-sm tracking-[0.3em] text-muted-foreground/50 mt-2">{watch.model}</div>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {(galleryImages.length > 1 || hasLive) && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {/* Live thumbnail */}
                  {hasLive && (
                    <button
                      onClick={() => { setShowLive(true); }}
                      className={`flex-shrink-0 w-20 h-20 rounded-sm border overflow-hidden transition-all duration-300 relative ${
                        showLive
                          ? "border-gold/50 ring-1 ring-gold/30"
                          : "border-border hover:border-gold/20"
                      }`}
                    >
                      <img
                        src={galleryImages[0] || ""}
                        alt="Live view"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="flex items-center gap-1 text-[9px] font-medium tracking-wider uppercase text-white bg-gold/80 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          Live
                        </span>
                      </div>
                    </button>
                  )}
                  {/* Static thumbnails */}
                  {galleryImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => { setShowLive(false); setSelectedImageIndex(i); }}
                      className={`flex-shrink-0 w-20 h-20 rounded-sm border overflow-hidden transition-all duration-300 ${
                        !showLive && selectedImageIndex === i
                          ? "border-gold/50 ring-1 ring-gold/30"
                          : "border-border hover:border-gold/20"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${watch.brand} ${watch.model} view ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
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
              <div>
                <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-gold/60 mb-4">
                  Specifications
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-border pt-4">
                  {[
                    ["Reference", watch.reference_number],
                    ["Year", watch.year],
                    ["Case Size", `${watch.case_size_mm}mm`],
                    ["Case Material", watch.case_material],
                    ["Dial", watch.dial_color],
                    ["Movement", watch.movement_type],
                    ["Condition", watch.condition_rating],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="border-b border-border/50 pb-3">
                      <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-0.5">{label}</p>
                      <p className="font-sans text-sm text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & CTA */}
              <div className="space-y-4">
                <div>
                  <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Price</p>
                  <p className="font-serif text-3xl text-gold-light flex items-center gap-2">
                    <DirhamSign className="w-6 h-6" />
                    {formatPrice(price)}
                  </p>
                </div>

                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-gold text-primary-foreground font-sans text-xs font-semibold tracking-[0.25em] uppercase transition-all duration-300 hover:bg-gold-light"
                >
                  <MessageCircle className="w-4 h-4" />
                  Inquire Now
                </a>

                {watch.id.startsWith("custom-") && (
                  <Link
                    to={`/studio?edit=${watch.id}`}
                    className="flex items-center justify-center gap-2 w-full py-3 border border-gold/30 text-gold font-sans text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300 hover:bg-gold/10"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Listing
                  </Link>
                )}

                <p className="font-sans text-[10px] text-muted-foreground text-center">
                  All inquiries answered within 24 hours
                </p>
              </div>
            </motion.div>
          </div>

          {/* Related Watches */}
          {relatedWatches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8 }}
              className="mt-24"
            >
              <Separator className="mb-12" />
              <h2 className="font-serif text-2xl md:text-3xl text-gold-gradient text-center mb-10">
                You May Also Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedWatches.map((w, i) => (
                  <WatchCard key={w.id} watch={w} index={i} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WatchDetail;
