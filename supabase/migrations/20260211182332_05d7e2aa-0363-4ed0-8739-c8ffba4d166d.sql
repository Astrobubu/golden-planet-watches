
-- Create watches table
CREATE TABLE public.watches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  reference_number TEXT,
  description TEXT,
  base_price NUMERIC NOT NULL,
  margin_percent NUMERIC NOT NULL DEFAULT 10,
  condition_rating TEXT NOT NULL DEFAULT 'A',
  year INTEGER,
  dial_color TEXT,
  case_material TEXT,
  case_size_mm NUMERIC,
  movement_type TEXT,
  original_image_url TEXT,
  ai_generated_images JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  is_hero BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.watches ENABLE ROW LEVEL SECURITY;

-- Public read access (this is a public showcase site)
CREATE POLICY "Watches are viewable by everyone"
ON public.watches
FOR SELECT
USING (true);

-- Create storage bucket for watch images
INSERT INTO storage.buckets (id, name, public) VALUES ('watch-images', 'watch-images', true);

-- Public read access for watch images
CREATE POLICY "Watch images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'watch-images');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_watches_updated_at
BEFORE UPDATE ON public.watches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
