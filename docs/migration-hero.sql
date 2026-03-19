/* 
    Migration: add_hero_assets
    Description: Adds a new table to manage hero section media (videos/images) dynamically.
*/

-- Create the hero_assets table
CREATE TABLE IF NOT EXISTS public.hero_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('image', 'video')),
    url TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.hero_assets ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to hero_assets"
    ON public.hero_assets
    FOR SELECT
    USING (is_active = true);

-- Enable tracking of updated_at
CREATE TRIGGER handle_updated_at_hero_assets
    BEFORE UPDATE ON public.hero_assets
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Insert initial placeholder data (matching the current hardcoded ones)
INSERT INTO public.hero_assets (type, url, order_index, is_active)
VALUES 
    ('video', '/videos/hero.mp4', 0, true),
    ('image', '/videos/Hero1.jpg', 1, true);
