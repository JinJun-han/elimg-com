/**
 * Cloudflare Worker — elimg-com
 * - /api/chat        → Workers AI (llama-3.1-8b-instruct)
 * - /api/feedback    → KV 피드백 저장
 * - /api/feedback/list → 피드백 조회 (관리자)
 * - HanwhaOcean_Level*_Lesson* → 진도 자동 주입
 * - 기타 → static assets
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/chat') return handleChat(request, env);
    if (url.pathname === '/api/feedback') return handleFeedback(request, env);
    if (url.pathname === '/api/feedback/list') return handleFeedbackList(request, env);

    // 레슨 페이지 → 진도 주입
    const lessonMatch = url.pathname.match(/HanwhaOcean_Level(\d)_Lesson(\d+)/i);
    if (lessonMatch) {
      const response = await env.ASSETS.fetch(request);
      if (response.ok && response.headers.get('content-type')?.includes('html')) {
        return injectProgress(response, parseInt(lessonMatch[1]), parseInt(lessonMatch[2]));
      }
      return response;
    }

    return env.ASSETS.fetch(request);
  },
};

/* ── KIIP 단계 정보 ──────────────────────────────────── */
const KIIP_STAGES = {
  0: {label:'KIIP 0단계 · 기초', bg:'#15803d', indexUrl:'/HanwhaOcean_Level0_Index.html'},
  1: {label:'KIIP 1단계 · 초급1', bg:'#1d4ed8', indexUrl:'/HanwhaOcean_Level1_Index.html'},
  2: {label:'KIIP 2단계 · 초급2', bg:'#1d4ed8', indexUrl:'/HanwhaOcean_Level2_Index.html'},
  3: {label:'KIIP 3단계 · 중급1', bg:'#7c3aed', indexUrl:'/HanwhaOcean_Level3_Index.html'},
  4: {label:'KIIP 4단계 · 중급2', bg:'#7c3aed', indexUrl:'/HanwhaOcean_Level4_Index.html'},
  5: {label:'KIIP 5단계 · 고급', bg:'#b45309', indexUrl:'/HanwhaOcean_Level5_Index.html'},
};

/* ── 진도 저장 + KIIP 배지 + 피드백 버튼 주입 ──────── */
async function injectProgress(response, level, lesson) {
  const html = await response.text();
  const ki = KIIP_STAGES[level] || {label:`KIIP ${level}단계`, bg:'#003366', indexUrl:'/'};
  const script = `
<script>
(function(){
  try {
    var key = 'hw_l${level}_progress';
    var p = JSON.parse(localStorage.getItem(key)||'{}');
    p['${lesson}'] = Date.now();
    localStorage.setItem(key, JSON.stringify(p));
    localStorage.setItem('hw_l${level}_last', '${lesson}');
  } catch(e) {}
})();
</script>
<div id="kiip-badge" style="position:fixed;top:0;right:0;z-index:9998;background:${ki.bg};color:#fff;font-size:10px;font-weight:800;padding:5px 12px 5px 10px;border-radius:0 0 0 12px;letter-spacing:.2px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.2);" onclick="location.href='${ki.indexUrl}'">${ki.label} ↗</div>
<style>
#hw-feedback-btn{position:fixed;bottom:80px;right:16px;z-index:9999;background:#E8C05A;color:#003366;border:none;border-radius:50px;padding:10px 16px;font-size:13px;font-weight:800;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.25);display:flex;align-items:center;gap:6px;transition:transform .15s;}
#hw-feedback-btn:hover{transform:scale(1.05);}
#hw-feedback-modal{display:none;position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.55);align-items:center;justify-content:center;}
#hw-feedback-modal.open{display:flex;}
#hw-feedback-box{background:#fff;border-radius:18px;padding:24px;width:min(360px,92vw);box-shadow:0 8px 32px rgba(0,0,0,.2);}
#hw-feedback-box h3{margin:0 0 14px;font-size:17px;color:#003366;}
.hw-stars{display:flex;gap:6px;margin-bottom:14px;}
.hw-star{font-size:28px;cursor:pointer;opacity:.35;transition:opacity .1s;}
.hw-star.on{opacity:1;}
#hw-fb-comment{width:100%;box-sizing:border-box;border:1.5px solid #ddd;border-radius:10px;padding:10px;font-size:14px;resize:vertical;min-height:70px;font-family:inherit;}
#hw-fb-name{width:100%;box-sizing:border-box;border:1.5px solid #ddd;border-radius:10px;padding:8px 10px;font-size:14px;margin-bottom:12px;font-family:inherit;}
.hw-fb-btns{display:flex;gap:8px;justify-content:flex-end;margin-top:12px;}
.hw-fb-btns button{border:none;border-radius:10px;padding:10px 18px;font-size:14px;font-weight:700;cursor:pointer;}
#hw-fb-cancel{background:#f1f5f9;color:#555;}
#hw-fb-submit{background:#003366;color:#fff;}
#hw-fb-thanks{display:none;text-align:center;padding:16px 0;}
</style>
<button id="hw-feedback-btn" onclick="document.getElementById('hw-feedback-modal').classList.add('open')">💬 의견 남기기</button>
<div id="hw-feedback-modal">
  <div id="hw-feedback-box">
    <h3>📝 이 레슨 어떠셨나요?</h3>
    <div class="hw-stars" id="hw-stars">
      <span class="hw-star" data-v="1">⭐</span>
      <span class="hw-star" data-v="2">⭐</span>
      <span class="hw-star" data-v="3">⭐</span>
      <span class="hw-star" data-v="4">⭐</span>
      <span class="hw-star" data-v="5">⭐</span>
    </div>
    <input id="hw-fb-name" type="text" placeholder="이름 (선택)" />
    <textarea id="hw-fb-comment" placeholder="자유롭게 의견을 남겨주세요 (선택)"></textarea>
    <div class="hw-fb-btns">
      <button id="hw-fb-cancel" onclick="document.getElementById('hw-feedback-modal').classList.remove('open')">취소</button>
      <button id="hw-fb-submit">보내기 ✉️</button>
    </div>
    <div id="hw-fb-thanks">🙏 감사합니다! 소중한 의견을 받았습니다.</div>
  </div>
</div>
<script>
(function(){
  var rating = 0;
  document.querySelectorAll('.hw-star').forEach(function(s){
    s.addEventListener('click', function(){
      rating = parseInt(s.getAttribute('data-v'));
      document.querySelectorAll('.hw-star').forEach(function(x,i){ x.classList.toggle('on', i < rating); });
    });
  });
  document.getElementById('hw-fb-submit').addEventListener('click', function(){
    var comment = document.getElementById('hw-fb-comment').value;
    var name = document.getElementById('hw-fb-name').value;
    fetch('/api/feedback', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({level:${level}, lesson:${lesson}, rating:rating, comment:comment, name:name})
    }).catch(function(){});
    document.querySelector('.hw-feedback-box > *:not(#hw-fb-thanks)');
    document.getElementById('hw-feedback-box').querySelectorAll('h3,.hw-stars,#hw-fb-name,#hw-fb-comment,.hw-fb-btns').forEach(function(el){el.style.display='none';});
    document.getElementById('hw-fb-thanks').style.display='block';
    setTimeout(function(){ document.getElementById('hw-feedback-modal').classList.remove('open'); }, 2000);
  });
})();
</script>`;
  const modified = html.replace('</body>', script + '\n</body>');
  return new Response(modified, {
    status: response.status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

/* ── AI 채팅 ─────────────────────────────────────────── */
async function handleChat(request, env) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

  try {
    const { messages } = await request.json();
    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages,
      max_tokens: 600,
    });
    return new Response(JSON.stringify({
      choices: [{ message: { content: response.response } }]
    }), { headers: cors });
  } catch (err) {
    return new Response(JSON.stringify({
      choices: [{ message: { content:
        '⚠️ 연결 오류: ' + (err.message || 'Unknown error') + '\n잠시 후 다시 시도해 주세요.',
      }}],
    }), { status: 200, headers: cors });
  }
}

/* ── 피드백 저장 ─────────────────────────────────────── */
async function handleFeedback(request, env) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const body = await request.json();
    const key = 'fb_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const data = {
      ts: new Date().toISOString(),
      level: body.level || '',
      lesson: body.lesson || '',
      rating: body.rating || 0,
      comment: (body.comment || '').slice(0, 500),
      name: (body.name || '').slice(0, 50),
    };
    await env.FEEDBACK.put(key, JSON.stringify(data), { expirationTtl: 60 * 60 * 24 * 180 }); // 180일
    return new Response(JSON.stringify({ ok: true, key }), { headers: cors });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers: cors });
  }
}

/* ── 피드백 조회 (관리자) ────────────────────────────── */
async function handleFeedbackList(request, env) {
  const url = new URL(request.url);
  const adminKey = url.searchParams.get('key');
  if (adminKey !== 'glocal2024admin') {
    return new Response('Unauthorized', { status: 401 });
  }
  const list = await env.FEEDBACK.list();
  const items = await Promise.all(
    list.keys.map(async k => {
      const val = await env.FEEDBACK.get(k.name);
      return { key: k.name, ...JSON.parse(val || '{}') };
    })
  );
  items.sort((a, b) => b.ts > a.ts ? 1 : -1);
  return new Response(JSON.stringify(items, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}
