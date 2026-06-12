import Layout from "@/components/layout/Layout";
import MatchCard from "@/components/MatchCard";
import MatchSkeleton from "@/components/MatchSkeleton";
import { useOdds, useSports } from "@/hooks/useOddsApi";
import { useScrapedOdds, SCRAPED_SPORTS } from "@/hooks/useScrapedOdds";
import { formatGameDay } from "@/utils/formatGameDay";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Sports = () => {
  const [source, setSource] = useState<"odds-api" | "live-feed">("live-feed");

  const { data: sports } = useSports();
  const [activeSport, setActiveSport] = useState("soccer_epl");
  const [activeScrapedSport, setActiveScrapedSport] = useState("soccer");
  const [search, setSearch] = useState("");

  const { data: odds, isLoading: oddsApiLoading } = useOdds(activeSport);
  const { data: scrapedMatches, isLoading: scrapedLoading } = useScrapedOdds(activeScrapedSport);

  const isLoading = source === "odds-api" ? oddsApiLoading : scrapedLoading;

  const now = Date.now();

  const oddsApiMatches = (odds || [])
    .filter((event: any) => new Date(event.commence_time).getTime() > now - 3 * 60 * 60 * 1000)
    .map((event: any) => ({
      id: event.id,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      homeOdds: event.bookmakers?.[0]?.markets?.[0]?.outcomes?.find((o: any) => o.name === event.home_team)?.price || 1.5,
      drawOdds: event.bookmakers?.[0]?.markets?.[0]?.outcomes?.find((o: any) => o.name === "Draw")?.price || 3.5,
      awayOdds: event.bookmakers?.[0]?.markets?.[0]?.outcomes?.find((o: any) => o.name === event.away_team)?.price || 2.5,
      league: event.sport_title,
      time: new Date(event.commence_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      dayLabel: formatGameDay(event.commence_time),
    }));

  const scrapedMatchesMapped = (scrapedMatches || []).map((m) => ({
    id: m.id,
    homeTeam: m.home_team,
    awayTeam: m.away_team,
    homeOdds: m.home_odds || 1.5,
    drawOdds: m.draw_odds || undefined,
    awayOdds: m.away_odds || 2.5,
    league: m.league || "",
    time: new Date(m.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    dayLabel: formatGameDay(m.start_time),
  }));

  const matches = (source === "odds-api" ? oddsApiMatches : scrapedMatchesMapped).filter((m: any) =>
    search ? m.homeTeam.toLowerCase().includes(search.toLowerCase()) || m.awayTeam.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <Layout>
      <div className="container space-y-4 py-4">
        <h1 className="font-display text-2xl font-bold">Sports</h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-secondary pl-9"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSource("live-feed")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              source === "live-feed" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            )}
          >
            Live Feed
          </button>
          <button
            onClick={() => setSource("odds-api")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              source === "odds-api" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            )}
          >
            Odds API
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {source === "odds-api"
            ? (sports || []).slice(0, 10).map((s: any) => (
                <button
                  key={s.key}
                  onClick={() => setActiveSport(s.key)}
                  className={cn(
                    "whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                    activeSport === s.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  )}
                >
                  {s.title}
                </button>
              ))
            : SCRAPED_SPORTS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setActiveScrapedSport(s.key)}
                  className={cn(
                    "whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                    activeScrapedSport === s.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  )}
                >
                  {s.title}
                </button>
              ))}
        </div>

        <div className="space-y-3">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <MatchSkeleton key={i} />)
            : matches.map((m: any) => <MatchCard key={m.id} {...m} />)}
        </div>
      </div>
    </Layout>
  );
};

export default Sports;
