/**
 * Cloudflare Pages Function — AI Chat Proxy (Groq)
 * URL: https://elimg.com/kiip/ai
 *
 * /api/chat 경로는 기존 Worker Route가 가로채므로 /kiip/ai 사용
 */

export async function onRequestPost(context) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { messages } = await context.request.json();
    const apiKey = context.env.GROQ_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({
        choices: [{ message: { content:
          '[/kiip/ai 호출됨] GROQ_API_KEY 없음 — Cloudflare Pages 환경변수 설정 필요'
        }}]
      }), { headers: cors });
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: messages,
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({
        choices: [{ message: { content:
          '[/kiip/ai] Groq 오류 ' + res.status + ': ' + err.substring(0, 200)
        }}]
      }), { headers: cors });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), { headers: cors });

  } catch (err) {
    return new Response(JSON.stringify({
      choices: [{ message: { content:
        '⚠️ 연결 오류: ' + (err.message || 'Unknown error')
      }}]
    }), { status: 200, headers: cors });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
