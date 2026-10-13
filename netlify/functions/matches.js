const LIVE = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE"];
exports.handler = async () => {
  const key = (process.env.API_FOOTBALL_KEY || "").trim();
  const day = new Date().toISOString().slice(0, 10);
  const head = { "Content-Type": "application/json", "Netlify-CDN-Cache-Control": "no-store" };
  try {
    const r = await fetch("https://v3.football.api-sports.io/fixtures?date=" + day, {
      headers: { "x-apisports-key": key },
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
    const debug = { hasKey: key.length > 0, keyLength: key.length, httpStatus: r.status, results: j.results, errors: j.errors, date: day };
    if (matches.length) head["Netlify-CDN-Cache-Control"] = "public, s-maxage=120";
    return { statusCode: 200, headers: head, body: JSON.stringify({ matches, debug }) };
  } catch (e) {
    return { statusCode: 200, headers: head, body: JSON.stringify({ matches: [], debug: { hasKey: key.length > 0, keyLength: key.length, error: String(e) } }) };
  }
};
