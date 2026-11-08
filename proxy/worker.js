// Cloudflare Worker: liten proxy så att Hallskärmen kan hämta flygdata från webbläsaren.
// Flygnätverken (adsb.lol m.fl.) skickar inga CORS-huvuden, så Safari stoppar direkta anrop.
// Workern hämtar åt sidan och lägger till CORS. Bara de adresser som står nedan tillåts.
//
// Användning: https://<din-worker>.workers.dev/?url=<urlkodad adress>

const TILLATNA = ['api.adsb.lol', 'opendata.adsb.fi', 'api.airplanes.live', 'api.adsbdb.com'];
const CACHE_SEKUNDER = 5;

export default {
  async fetch(request) {
    const cors = {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      'access-control-max-age': '86400'
    };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'GET') return new Response('Bara GET', { status: 405, headers: cors });

    const mal = new URL(request.url).searchParams.get('url');
    let url;
    try { url = new URL(mal); } catch (e) { return new Response('Ange ?url=', { status: 400, headers: cors }); }
    if (url.protocol !== 'https:' || !TILLATNA.includes(url.hostname)) {
      return new Response('Adressen är inte tillåten', { status: 403, headers: cors });
    }

    const svar = await fetch(url.toString(), {
      headers: { 'user-agent': 'Hallskarm (github.com/DennisHoglund/hallskarm)', accept: 'application/json' },
      cf: { cacheTtl: CACHE_SEKUNDER, cacheEverything: true }
    });
    const huvuden = new Headers(cors);
    huvuden.set('content-type', svar.headers.get('content-type') || 'application/json');
    huvuden.set('cache-control', 'max-age=' + CACHE_SEKUNDER);
    return new Response(svar.body, { status: svar.status, headers: huvuden });
  }
};
