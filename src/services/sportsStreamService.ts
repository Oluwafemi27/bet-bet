/**
 * Sports Stream Service
 * Integrates with sportsrc.org API to fetch live sports matches with embed URLs
 */

export interface StreamSource {
  source?: string;
  name?: string;
  url?: string;
  embed?: string;
  language?: string;
  quality?: string;
}

export interface StreamMatch {
  id: string;
  title: string;
  category: string;
  date: number;
  popular?: boolean;
  poster?: string;
  teams?: {
    home?: { name: string; badge?: string };
    away?: { name: string; badge?: string };
  };
  sources?: StreamSource[];
}

const API_BASE = "https://api.sportsrc.org";

/**
 * Fetch sports categories from the API
 */
export async function fetchSportCategories(): Promise<Array<{ id: string; name: string }>> {
  try {
    const response = await fetch(`${API_BASE}/sports`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data.sports) ? data.sports : [];
  } catch (error) {
    console.error("Failed to fetch sport categories:", error);
    return [];
  }
}

/**
 * Fetch matches for a given category/sport
 */
export async function fetchMatches(category: string): Promise<StreamMatch[]> {
  try {
    const response = await fetch(`${API_BASE}/matches?category=${encodeURIComponent(category)}`);
    if (!response.ok) return [];

    const data = await response.json();
    const matches = Array.isArray(data.matches) ? data.matches : [];

    return matches.map((m: any) => ({
      id: m.id || m.matchId || String(Math.random()),
      title: m.title || `${m.homeTeam || "Home"} vs ${m.awayTeam || "Away"}`,
      category: m.category || category,
      date: m.date ? new Date(m.date).getTime() : Date.now(),
      poster: m.poster || m.thumbnail,
      popular: m.popular || false,
      teams: {
        home: {
          name: m.homeTeam || m.teams?.home?.name,
          badge: m.homeTeamBadge || m.teams?.home?.badge,
        },
        away: {
          name: m.awayTeam || m.teams?.away?.name,
          badge: m.awayTeamBadge || m.teams?.away?.badge,
        },
      },
      sources: m.sources || [],
    }));
  } catch (error) {
    console.error(`Failed to fetch matches for category ${category}:`, error);
    return [];
  }
}

/**
 * Fetch detailed match info with embed URLs and available streams
 */
export async function fetchMatchDetail(
  category: string,
  matchId: string
): Promise<StreamMatch | null> {
  try {
    const response = await fetch(
      `${API_BASE}/matches/${encodeURIComponent(matchId)}?category=${encodeURIComponent(category)}`
    );
    if (!response.ok) return null;

    const data = await response.json();
    const m = data.match || data;

    return {
      id: m.id || m.matchId || matchId,
      title: m.title || `${m.homeTeam || "Home"} vs ${m.awayTeam || "Away"}`,
      category: m.category || category,
      date: m.date ? new Date(m.date).getTime() : Date.now(),
      poster: m.poster || m.thumbnail,
      popular: m.popular || false,
      teams: {
        home: {
          name: m.homeTeam || m.teams?.home?.name,
          badge: m.homeTeamBadge || m.teams?.home?.badge,
        },
        away: {
          name: m.awayTeam || m.teams?.away?.name,
          badge: m.awayTeamBadge || m.teams?.away?.badge,
        },
      },
      sources: Array.isArray(m.sources) ? m.sources : (m.streamUrl || m.embed ? [{
        url: m.streamUrl || m.embed,
        embed: m.streamUrl || m.embed,
        name: "Stream",
      }] : []),
    };
  } catch (error) {
    console.error(`Failed to fetch match detail for ${matchId}:`, error);
    return null;
  }
}

/**
 * Search matches across all categories
 */
export async function searchMatches(query: string): Promise<StreamMatch[]> {
  try {
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) return [];

    const data = await response.json();
    const matches = Array.isArray(data.matches) ? data.matches : [];

    return matches.map((m: any) => ({
      id: m.id || m.matchId || String(Math.random()),
      title: m.title || `${m.homeTeam || "Home"} vs ${m.awayTeam || "Away"}`,
      category: m.category || "mixed",
      date: m.date ? new Date(m.date).getTime() : Date.now(),
      poster: m.poster || m.thumbnail,
      teams: {
        home: {
          name: m.homeTeam || m.teams?.home?.name,
          badge: m.homeTeamBadge || m.teams?.home?.badge,
        },
        away: {
          name: m.awayTeam || m.teams?.away?.name,
          badge: m.awayTeamBadge || m.teams?.away?.badge,
        },
      },
      sources: m.sources || [],
    }));
  } catch (error) {
    console.error("Failed to search matches:", error);
    return [];
  }
}
