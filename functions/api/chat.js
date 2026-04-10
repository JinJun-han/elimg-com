/**
 * Cloudflare Pages Function — AI Chat Proxy (Groq)
 * URL: https://elimg.com/api/chat
 *
 * 설정: Cloudflare 대시보드 → Pages → elimg-com → Settings
 *       → Environment Variables → GROQ_API_KEY = gsk_...
 *
 * Groq 무료 키 발급: https://console.groq.com (구글 계정, 무료, 카드 불필요)
 * 무료 한도: 하루 14,400 요청, 분당 30 요청 — 교육용으로 충분
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
          '[진단] Pages Function 호출됨 ✅ — 그러나 GROQ_API_KEY 없음 ❌\n\n'
          + 'Cloudflare → Workers & Pages → elimg-com → Settings → Environment Variables\n'
          + 'GROQ_API_KEY = gsk_... 등록 필요'
        }}]
      }), { headers: cors });
    }

    // Groq API 호출 (llama-3.1-8b-instant — 초고속, 무료)
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
          '[진단] Pages Function 호출됨 ✅ — Groq 오류 ❌ ' + res.status + '\n' + err.substring(0, 200)
        }}]
      }), { headers: cors });
    }

    const data = await res.json();
    // 진단: Groq 성공 시 응답 앞에 마커 추가
    if (data.choices && data.choices[0] && data.choices[0].message) {
      data.choices[0].message.content = '[✅PF+Groq작동] ' + data.choices[0].message.content;
    }
    return new Response(JSON.stringify(data), { headers: cors });

  } catch (err) {
    return new Response(JSON.stringify({
      choices: [{ message: { content:
        '⚠️ 연결 오류: ' + (err.message || 'Unknown error') + '\n잠시 후 다시 시도해 주세요.'
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
