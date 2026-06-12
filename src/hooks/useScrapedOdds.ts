import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ScrapedMatch {
  id: string;
  home_team: string;
  away_team: string;
  league: string | null;
  sport: string;
  start_time: string;
  status: string;
  home_odds: number | null;
  draw_odds: number | null;
  away_odds: number | null;
}

export const SCRAPED_SPORTS = [
  { key: "soccer", title: "Football" },
  { key: "basketball", title: "Basketball" },
  { key: "tennis", title: "Tennis" },
  { key: "ice_hockey", title: "Ice Hockey" },
];

export function useScrapedOdds(sport: string) {
  return useQuery({
    queryKey: ["scraped-odds", sport],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("id, home_team, away_team, league, sport, start_time, status, home_odds, draw_odds, away_odds")
        .eq("sport", sport)
        .like("external_id", "1win_%")
        .order("start_time", { ascending: true })
        .limit(50);

      if (error) {
        console.error("Error fetching scraped odds:", error);
        return [];
      }

      return (data || []) as ScrapedMatch[];
    },
    enabled: !!sport,
    refetchInterval: 60 * 1000,
    retry: 2,
  });
}
