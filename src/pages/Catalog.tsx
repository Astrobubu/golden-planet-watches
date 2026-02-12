import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { WatchCard } from "@/components/WatchCard";
import { getDisplayPrice, formatPrice } from "@/lib/mock-watches";
import { DirhamSign } from "@/components/DirhamSign";
import { useAllWatches } from "@/hooks/use-watches";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const RATINGS = ["All", "A+", "A", "A-", "B+", "B", "B-", "C"];

const Catalog = () => {
  const { watches: allWatches } = useAllWatches();
  const BRANDS = useMemo(() => ["All", ...Array.from(new Set(allWatches.map((w) => w.brand)))], [allWatches]);
  const { MIN_PRICE, MAX_PRICE } = useMemo(() => {
    const prices = allWatches.map((w) => getDisplayPrice(w));
    return {
      MIN_PRICE: Math.floor(Math.min(...prices) / 1000) * 1000,
      MAX_PRICE: Math.ceil(Math.max(...prices) / 1000) * 1000,
    };
  }, [allWatches]);

  const [brand, setBrand] = useState("All");
  const [rating, setRating] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, Infinity]);

  // Initialize price range on first render
  const effectiveRange: [number, number] = [
    priceRange[0] === 0 ? MIN_PRICE : priceRange[0],
    priceRange[1] === Infinity ? MAX_PRICE : priceRange[1],
  ];

  const hasActiveFilters =
    brand !== "All" ||
    rating !== "All" ||
    searchQuery !== "" ||
    effectiveRange[0] !== MIN_PRICE ||
    effectiveRange[1] !== MAX_PRICE;

  const clearAll = () => {
    setBrand("All");
    setRating("All");
    setSearchQuery("");
    setPriceRange([0, Infinity]);
    setSortBy("featured");
  };

  const filtered = useMemo(() => {
    const results = allWatches.filter((w) => {
      if (brand !== "All" && w.brand !== brand) return false;
      if (rating !== "All" && w.condition_rating !== rating) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const haystack = `${w.brand} ${w.model} ${w.reference_number}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      const displayPrice = getDisplayPrice(w);
      if (displayPrice < effectiveRange[0] || displayPrice > effectiveRange[1]) return false;

      return true;
    });

    switch (sortBy) {
      case "price-asc":
        results.sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b));
        break;
      case "price-desc":
        results.sort((a, b) => getDisplayPrice(b) - getDisplayPrice(a));
        break;
      case "newest":
        results.sort((a, b) => b.year - a.year);
        break;
      case "brand-az":
        results.sort((a, b) => a.brand.localeCompare(b.brand));
        break;
      case "featured":
      default:
        results.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    return results;
  }, [brand, rating, searchQuery, sortBy, effectiveRange, allWatches]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="font-serif text-4xl md:text-5xl text-gold-gradient">
              The Collection
            </h1>
            <p className="font-sans text-sm text-muted-foreground mt-3">
              Curated & Authenticated
            </p>
          </motion.div>

          {/* Search & Sort */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search brand, model, or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-surface-elevated border-border font-sans text-sm"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[200px] bg-surface-elevated border-border font-sans text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low → High</SelectItem>
                <SelectItem value="price-desc">Price: High → Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="brand-az">Brand A–Z</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Brand & Condition Filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-6"
          >
            {BRANDS.map((b) => (
              <button
                key={b}
                onClick={() => setBrand(b)}
                className={`font-sans text-[10px] tracking-[0.2em] uppercase px-4 py-2 border transition-all duration-300 ${
                  brand === b
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-border text-muted-foreground hover:border-gold/30 hover:text-gold/80"
                }`}
              >
                {b}
              </button>
            ))}
            <div className="w-px h-6 bg-border mx-2" />
            {RATINGS.slice(0, 5).map((r) => (
              <button
                key={r}
                onClick={() => setRating(r)}
                className={`font-sans text-[10px] tracking-[0.2em] uppercase px-3 py-2 border transition-all duration-300 ${
                  rating === r
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-border text-muted-foreground hover:border-gold/30 hover:text-gold/80"
                }`}
              >
                {r}
              </button>
            ))}
          </motion.div>

          {/* Price Range Slider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="max-w-lg mx-auto mb-8 px-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                Price Range
              </span>
              <span className="font-sans text-xs text-gold/80 flex items-center gap-1">
                <DirhamSign className="w-3 h-3" />
                {formatPrice(effectiveRange[0])} — <DirhamSign className="w-3 h-3" />{formatPrice(effectiveRange[1])}
              </span>
            </div>
            <Slider
              value={effectiveRange}
              onValueChange={(val) => setPriceRange(val as [number, number])}
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={1000}
              className="w-full"
            />
          </motion.div>

          {/* Active Filters Bar */}
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex flex-wrap items-center gap-2 mb-6 justify-center"
            >
              {searchQuery && (
                <span className="inline-flex items-center gap-1 font-sans text-[10px] tracking-wider uppercase bg-gold/10 border border-gold/20 text-gold px-3 py-1.5">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery("")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {brand !== "All" && (
                <span className="inline-flex items-center gap-1 font-sans text-[10px] tracking-wider uppercase bg-gold/10 border border-gold/20 text-gold px-3 py-1.5">
                  {brand}
                  <button onClick={() => setBrand("All")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {rating !== "All" && (
                <span className="inline-flex items-center gap-1 font-sans text-[10px] tracking-wider uppercase bg-gold/10 border border-gold/20 text-gold px-3 py-1.5">
                  Condition: {rating}
                  <button onClick={() => setRating("All")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {(effectiveRange[0] !== MIN_PRICE || effectiveRange[1] !== MAX_PRICE) && (
                <span className="inline-flex items-center gap-1 font-sans text-[10px] tracking-wider uppercase bg-gold/10 border border-gold/20 text-gold px-3 py-1.5">
                  AED {formatPrice(effectiveRange[0])}–{formatPrice(effectiveRange[1])}
                  <button onClick={() => setPriceRange([0, Infinity])}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={clearAll}
                className="font-sans text-[10px] tracking-wider uppercase text-muted-foreground hover:text-gold transition-colors px-2 py-1.5"
              >
                Clear All
              </button>
            </motion.div>
          )}

          {/* Result Count */}
          <p className="font-sans text-xs text-muted-foreground text-center mb-8">
            Showing {filtered.length} of {allWatches.length} timepieces
          </p>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((watch, i) => (
              <WatchCard key={watch.id} watch={watch} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="font-serif text-xl text-muted-foreground">No pieces match your criteria</p>
              <button
                onClick={clearAll}
                className="mt-4 font-sans text-xs tracking-wider uppercase text-gold hover:text-gold-light transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalog;
