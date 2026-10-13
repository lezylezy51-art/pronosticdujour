exports.handler = async (event) => {
  const id = parseInt(event.queryStringParameters && event.queryStringParameters.id);
  if (!id) return { statusCode: 400, body: "{}" };
  try {
    const r = await fetch("https://v3.football.api-sports.io/predictions?fixture=" + id, {
      headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
    });
    const j = await r.json();
    const x = j.response && j.response[0] && j.response[0].predictions;
    const out = x
      ? { p: x.advice || "Analyse bientôt disponible", o: Math.max(...["home", "draw", "away"].map((k) => parseInt(x.percent[k]) || 0)) + "%" }
      : { p: "Analyse bientôt disponible", o: "" };
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Netlify-CDN-Cache-Control": "public, s-maxage=21600" },
      body: JSON.stringify(out),
    };
  } catch (e) {
    return { statusCode: 500, body: "{}" };
  }
};
