/**
 * Cloudflare Worker entry point for elimg-com
 * - Routes /api/chat to Groq AI proxy
 * - All other requests served from static assets
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle AI chat API route
    if (url.pathname === '/api/chat') {
      return handleChat(request, env);
    }

    // All other requests → static assets
    return env.ASSETS.fetch(request);
  },
};

async function handleChat(request, env) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  try {
    const { messages } = await request.json();

    // Cloudflare Workers AI 호출 (무료, IP 제한 없음)
    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages,
      max_tokens: 600,
    });

    const data = {
      choices: [{ message: { content: response.response } }]
    };
    return new Response(JSON.stringify(data), { headers: cors });

  } catch (err) {
    return new Response(JSON.stringify({
      choices: [{ message: { content:
        '⚠️ 연결 오류: ' + (err.message || 'Unknown error') + '\n잠시 후 다시 시도해 주세요.',
      }}],
    }), { status: 200, headers: cors });
  }
}
