/**
 * Cloudflare Worker — Landing Page API (Multi-Server)
 *
 * Endpoint: GET /api/get-status?monitor=MONITOR_ID
 *
 * Environment Variables (set di wrangler.jsonc atau Cloudflare Dashboard):
 *   - HT_API_SERVER  : Base URL HetrixTools API (variable)
 *   - HT_API_KEY     : API Key HetrixTools (secret, set via `npx wrangler secret put HT_API_KEY`)
 */

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    const url = new URL(request.url);

    // Routing — hanya handle /api/get-status
    if (url.pathname === '/api/get-status') {
      return handleGetStatus(url, env);
    }

    return jsonResponse({ message: 'Not Found' }, 404);
  },
};

/**
 * Handler utama: ambil data monitor dari HetrixTools API
 */
async function handleGetStatus(url, env) {
  // Ambil monitor ID dari query parameter
  const monitorId = url.searchParams.get('monitor');

  if (!monitorId) {
    return jsonResponse(
      { message: 'Parameter "monitor" wajib diisi. Contoh: /api/get-status?monitor=MONITOR_ID' },
      400,
    );
  }

  try {
    const apiServer = env.HT_API_SERVER;
    const apiKey = env.HT_API_KEY;

    if (!apiKey) {
      return jsonResponse(
        { message: 'HT_API_KEY belum dikonfigurasi. Jalankan: npx wrangler secret put HT_API_KEY' },
        500,
      );
    }

    // Request ke HetrixTools API
    const apiUrl = `${apiServer}/uptime-monitors?id=${encodeURIComponent(monitorId)}`;

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return jsonResponse(
        { message: `HetrixTools API error: ${response.status}` },
        response.status >= 500 ? 502 : response.status,
      );
    }

    const data = await response.json();

    // Filter dan proses data (sama seperti backend lama)
    const monitor = data.monitors?.[0];

    if (monitor && monitor.locations) {
      // 1. Ambil uptime dan lokasi server
      const uptime = monitor.uptime;
      const city = monitor.resolve_address_info?.City;
      const country = monitor.resolve_address_info?.Country;
      const serverLocation = city && country ? `${city}, ${country}` : 'Lokasi tidak diketahui';

      // 2. Kalkulasi rata-rata response time
      const locations = Object.values(monitor.locations);
      const totalResponseTime = locations.reduce((sum, loc) => sum + loc.response_time, 0);
      const averageResponseTime = locations.length > 0 ? totalResponseTime / locations.length : 0;

      // 3. Kirim data yang sudah difilter
      const filteredData = {
        uptime: uptime,
        average_response_time: averageResponseTime,
        location: serverLocation,
      };

      return jsonResponse(filteredData, 200);
    } else {
      return jsonResponse({ message: 'Data monitor atau lokasi tidak ditemukan.' }, 404);
    }
  } catch (error) {
    return jsonResponse({ message: 'Gagal mengambil data dari HetrixTools API' }, 500);
  }
}

/**
 * Helper: buat JSON response dengan CORS headers
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * Helper: handle CORS preflight request
 */
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
