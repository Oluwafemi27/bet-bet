import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('BALLDONTLIE_API_KEY');
    const games: any[] = [];

    // 1. balldontlie - upcoming/live NBA games
    if (apiKey) {
      try {
        const today = new Date();
        const start = today.toISOString().split('T')[0];
        const end = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const url = `https://api.balldontlie.io/v1/games?start_date=${start}&end_date=${end}&per_page=50`;
        const res = await fetch(url, { headers: { Authorization: apiKey } });
        if (res.ok) {
          const data = await res.json();
          for (const g of data.data || []) {
            // Only upcoming or live (not Final)
            const status = (g.status || '').toLowerCase();
            const isFinal = status.includes('final');
            if (isFinal) continue;
            const isLive = !status.includes('et') && !status.includes('pm') && !status.includes('am') && status !== '' && !status.includes('scheduled');
            games.push({
              id: `nba-${g.id}`,
              homeTeam: g.home_team.full_name,
              awayTeam: g.visitor_team.full_name,
              homeAbbr: g.home_team.abbreviation,
              awayAbbr: g.visitor_team.abbreviation,
              league: 'NBA',
              commence_time: g.date || g.status,
              status: g.status,
              isLive,
            });
          }
        }
      } catch (e) {
        console.error('balldontlie error', e);
      }
    }

    // 2. ESPN NBA scoreboard (no key) - live scores fallback / enrichment
    try {
      const espnRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
      if (espnRes.ok) {
        const espn = await espnRes.json();
        for (const ev of espn.events || []) {
          const state = ev.status?.type?.state; // "pre", "in", "post"
          if (state === 'post') continue;
          const comp = ev.competitions?.[0];
          const home = comp?.competitors?.find((c: any) => c.homeAway === 'home');
          const away = comp?.competitors?.find((c: any) => c.homeAway === 'away');
          if (!home || !away) continue;
          const id = `espn-${ev.id}`;
          if (games.some((x) => x.homeTeam === home.team.displayName && x.awayTeam === away.team.displayName)) continue;
          games.push({
            id,
            homeTeam: home.team.displayName,
            awayTeam: away.team.displayName,
            homeLogo: home.team.logo,
            awayLogo: away.team.logo,
            league: 'NBA',
            commence_time: ev.date,
            status: ev.status?.type?.shortDetail,
            isLive: state === 'in',
          });
        }
      }
    } catch (e) {
      console.error('espn error', e);
    }

    return new Response(JSON.stringify({ games }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message, games: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
