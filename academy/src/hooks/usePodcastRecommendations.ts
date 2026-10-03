import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RecommendationItem } from "@/data/recommendations";

interface SpotifyEpisode {
  id: string;
  title: string;
  description: string;
  image: string;
  spotifyUrl: string;
  embedUrl: string;
  releaseDate?: string;
}

export function usePodcastRecommendations(limit = 8) {
  const [items, setItems] = useState<RecommendationItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchEpisodes = async () => {
      const { data, error } = await supabase.functions.invoke("spotify-podcast-episodes", {
        body: { limit },
      });

      if (cancelled || error || !Array.isArray(data?.episodes)) return;

      const nextItems = (data.episodes as SpotifyEpisode[]).map((episode) => ({
        id: `spotify-episode-${episode.id}`,
        kind: "podcast" as const,
        title: episode.title,
        subtitle: episode.description || "Nieuwe podcastaflevering van Morgen Academy.",
        image: episode.image,
        href: episode.spotifyUrl,
        embedUrl: episode.embedUrl,
        cta: "Luister",
        relatedCourseIds: [],
      }));

      setItems(nextItems);
    };

    fetchEpisodes();

    return () => {
      cancelled = true;
    };
  }, [limit]);

  return items;
}
