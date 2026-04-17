import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE = "https://www.thesportsdb.com/api/v1/json/123";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const events: any[] = [];
    const seen = new Set<string>();
    const now = Date.now();

    // 1) Get all boxing leagues
    const leaguesRes = await fetch(`${BASE}/search_all_leagues.php?s=Boxing`);
    const leaguesJson = await leaguesRes.json();
    const leagues = (leaguesJson.countries || leaguesJson.leagues || []).slice(0, 6);

    // 2) For each league, fetch next 15 events
    for (const league of leagues) {
      const lid = league.idLeague;
      if (!lid) continue;
      try {
        const r = await fetch(`${BASE}/eventsnextleague.php?id=${lid}`);
        const j = await r.json();
        for (const e of j.events || []) {
          if (seen.has(e.idEvent)) continue;
          seen.add(e.idEvent);
          // Filter: must be in future (not yet played)
          const ts = e.strTimestamp ? new Date(e.strTimestamp).getTime() : 0;
          if (ts && ts < now - 3 * 60 * 60 * 1000) continue; // allow 3h grace for "live"
          events.push({
            id: e.idEvent,
            title: e.strEvent,
            league: e.strLeague,
            homeTeam: e.strHomeTeam,
            awayTeam: e.strAwayTeam,
            date: e.dateEvent,
            time: e.strTime,
            timestamp: e.strTimestamp,
            thumb: e.strThumb,
            poster: e.strPoster,
            venue: e.strVenue,
            country: e.strCountry,
            isLive: ts > 0 && ts <= now && now - ts < 3 * 60 * 60 * 1000,
          });
        }
      } catch (e) {
        console.error('league fetch error', lid, e);
      }
    }

    // Sort by timestamp ascending
    events.sort((a, b) => {
      const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return ta - tb;
    });

    return new Response(JSON.stringify({ events: events.slice(0, 40) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message, events: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
