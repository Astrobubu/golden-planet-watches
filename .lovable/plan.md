
# Luxury Pre-Owned Watch Showcase

## Concept
A dark, luxurious website for premium second-hand watches (Rolex, AP, Patek, etc.) that uses AI image generation to create stunning multi-angle photos from a single upload, and features a live ticking clock overlay on the hero watch — making the site feel alive and unlike anything else in the market.

---

## Pages & Core Experience

### 1. Homepage — The "Living Watch" Hero
- Full-screen dark background with a featured watch front and center
- **AI-powered live clock**: The watch hands are extracted from the hero image using AI (Nano Banana), then overlaid as animated elements that tick in real time — the watch on screen is actually telling the correct time
- Smooth scroll down reveals the curated collection
- Subtle gold accent typography, minimal text, maximum visual impact
- Featured watches carousel with condition badges (A+, A, B, etc.)

### 2. Watch Catalog
- Grid of watches with dark card design, gold accents
- Each card shows: brand, model, price (with your margin built in), condition rating badge
- Filter by brand, price range, and condition rating
- Hover effects that feel premium (subtle zoom, shadow shifts)

### 3. Individual Watch Page — AI-Generated Gallery
- **Hero image**: The original uploaded photo
- **AI-generated angles** (created via Nano Banana from the single source image):
  - Watch flat on a dark luxury surface/table
  - Front-facing studio shot
  - On a wrist wearing a kandora (traditional Gulf attire)
  - On a wrist with different skin tones (2-3 variations) to help buyers visualize
- Each AI image generated on-demand or pre-generated when the watch is added
- Condition rating prominently displayed with clear explanation
- Price display with inquiry button
- "Inquire Now" button → sends inquiry via WhatsApp or email with watch details pre-filled

### 4. Condition Rating System
- **A+** — Pristine, like new, no marks
- **A** — Excellent, minimal signs of wear
- **A-** — Very good, light surface marks
- **B+** — Good, minor visible wear
- **B** — Fair, visible scratches
- **B-** — Below average, noticeable damage (e.g. small crack)
- **C** — Needs repair/service
- Each rating shown as a styled badge with a short explanation

---

## AI Image Generation (Lovable AI + Nano Banana)

- When a watch is added to the database with a single photo, an edge function calls the Nano Banana model to generate 4-5 styled angles
- Generated images are stored and served as the watch's gallery
- The live clock feature uses AI to isolate the watch hands from the hero image, which are then overlaid as CSS/JS-animated elements synced to real time

---

## Exit-Intent & Sales Hooks

- **Tiered urgency system**: Tracks user visits via localStorage
  - 1st exit attempt: "Before you go — enjoy 3% off this piece" (popup with the watch they viewed most)
  - 2nd visit: "Welcome back — here's 5% off, just for you"
  - 3rd visit: "Final offer — 8% off, don't miss it"
- Discount is applied by reducing your margin, not the base price
- Each offer has a visual countdown or expiry to create urgency

---

## Backend (Lovable Cloud)

- **Database**: Watches table (brand, model, base price, margin %, condition rating, original image URL, AI-generated image URLs)
- **Edge Functions**:
  - AI image generation (calls Nano Banana to create angles from uploaded photo)
  - Watch hand extraction for the live clock feature
  - Inquiry handler (sends notification to you via WhatsApp/email)
- **Storage**: Watch images (originals + AI-generated)

---

## Design Direction

- **Dark backgrounds** (near-black) with warm gold (#C9A96E-style) accents
- Large, cinematic watch photography as the focal point
- Minimal UI chrome — let the watches speak
- Elegant serif or thin sans-serif typography
- Smooth animations: fade-ins, parallax scrolling, subtle hover states
- Mobile-responsive with the same premium feel
