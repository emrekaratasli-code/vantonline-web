import { createServerSupabaseClient } from './supabase';

export async function getActiveHeroVideoUrls(): Promise<string[]> {
    // Default fallback in case of errors, no rows, or no connection
    const fallbackUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_FALLBACK_URL || '/videos/hero.mp4';

    try {
        const supabase = createServerSupabaseClient();

        // If Supabase is not configured yet, just return fallback
        if (!supabase) {
            return [fallbackUrl];
        }

        const { data, error } = await supabase
            .from('hero_assets')
            .select('video_url')
            .eq('active', true)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching hero videos from Supabase:', error.message);
            return [fallbackUrl];
        }

        if (data && data.length > 0) {
            // Map the rows to an array of video_url strings
            return data.map(row => row.video_url).filter(Boolean);
        }

        return [fallbackUrl];
    } catch (e) {
        console.error('Unexpected error fetching hero videos:', e);
        return [fallbackUrl];
    }
}
