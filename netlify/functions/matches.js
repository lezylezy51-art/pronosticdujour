const LIVE = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE"];
exports.handler = async () => {
  try {
    const day = new Date().toISOString().slice(0, 10);
    const r = await fetch("https://v3.football.api-sports.io/fixtures?date=" + day, {
      headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
    });
    const j = await r.json();
    const fx = (j.response || []).sort((a, b) => a.fixture.timestamp - b.fixture.timestamp);
    const matches = fx.map((f) => ({
      id: f.fixture.id,
      h: new Date(f.fixture.date).toLocaleTimeString("fr-FR", { timeZone: "Africa/Bamako", hour: "2-digit", minute: "2-digit" }),
      c: f.league.name, s: "Football", a: f.teams.home.name, b: f.teams.away.name,
      p: "Analyse en cours", o: "", l: LIVE.includes(f.fixture.status.short),
      sc: (f.goals.home ?? 0) + " - " + (f.goals.away ?? 0),
    }));
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Netlify-CDN-Cache-Control": "public, s-maxage=120" },
      body: JSON.stringify({ matches }),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ matches: [] }) };
  }
};
