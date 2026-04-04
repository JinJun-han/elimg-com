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
    const apiKey = env.GROQ_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({
        choices: [{ message: { content:
          '⚠️ AI 설정 중입니다.\n\nCloudflare 대시보드에서 GROQ_API_KEY를 등록해 주세요.\n\n'
          + '📌 설정 방법:\n1. dash.cloudflare.com → Workers & Pages → elimg-com\n'
          + '2. Settings → Environment Variables\n'
          + '3. GROQ_API_KEY = gsk_... (groq.com에서 무료 발급)\n\n'
          + '설정 후 즉시 AI 사용 가능합니다!',
        }}],
      }), { headers: cors });
    }

    // Pollinations.ai API 호출 v2 (무료, 인증 불필요)
    const res = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai',
        messages,
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error('Groq error: ' + res.status + ' ' + err);
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), { headers: cors });

  } catch (err) {
    return new Response(JSON.stringify({
      choices: [{ message: { content:
        '⚠️ 연결 오류: ' + (err.message || 'Unknown error') + '\n잠시 후 다시 시도해 주세요.',
      }}],
    }), { status: 200, headers: cors });
  }
}
