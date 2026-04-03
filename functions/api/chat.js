/**
 * Cloudflare Pages Function — AI Chat Proxy
 * URL: https://elimg.com/api/chat
 *
 * Cloudflare 대시보드 설정 필요:
 *   Pages → elimg-com → Settings → Functions → AI Bindings
 *   Variable name: AI (자동으로 Cloudflare Workers AI에 연결됨)
 */

export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { messages } = await context.request.json();

    // Cloudflare Workers AI 호출 (무료 티어: 10,000 뉴런/일)
    const ai = context.env.AI;
    if (!ai) {
      return new Response(JSON.stringify({
        error: 'AI binding not configured. Please set up AI binding in Cloudflare dashboard.'
      }), { status: 500, headers: corsHeaders });
    }

    const result = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages,
      max_tokens: 600,
    });

    return new Response(JSON.stringify({
      choices: [{ message: { content: result.response } }]
    }), { headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message || 'Unknown error'
    }), { status: 500, headers: corsHeaders });
  }
}

// CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
