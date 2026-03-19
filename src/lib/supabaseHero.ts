import { createServerSupabaseClient } from './supabase';

export interface HeroAsset {
    id: string;
    type: 'image' | 'video';
    src: string; // mapped from url
    orderIndex: number;
}

export async function getHeroAssets(): Promise<HeroAsset[]> {
    try {
        const supabase = createServerSupabaseClient();
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('hero_assets')
            .select('id, type, url, order_index')
            .eq('is_active', true)
            .order('order_index', { ascending: true });

        if (error) {
            console.error('[supabaseHero] getHeroAssets error:', error.message);
            return [];
        }

        return (data ?? []).map((row) => ({
            id: row.id,
            type: row.type as 'image' | 'video',
            src: row.url,
            orderIndex: row.order_index,
        }));
    } catch (e) {
        console.error('[supabaseHero] getHeroAssets unexpected:', e);
        return [];
    }
}
