/**
 * HanwhaOcean 40개 파일 AI 탭 → 에이전틱 G스택 버전으로 전면 교체
 * Gemini + Claude + 발음 코치(RECORDER) + Agent Harness 구조
 */
const fs = require('fs');
const path = require('path');
const dir = __dirname;

// ─── 교체할 구 버전 renderAI() 시작 마커 ─────────────────────────────
const OLD_RENDER_START = `function renderAI() {
  return \`
  <h2>🤖 AI 한국어 도우미</h2>`;

// 구 버전 renderAI() 끝 마커
const OLD_RENDER_END = `🤖 Powered by Pollinations AI · 무료 · Free forever</p>
  \`;
}`;

// ─── 새 RECORDER + startSTT + renderAI() 전체 ────────────────────────
const NEW_AI_CODE = `// ===== RECORDER (발음 코치 — 브라우저 내장 API) =====
var RECORDER = {
  recorders: {}, chunks: {}, audioURLs: {}, isRecording: {},

  async start(idx, targetText, recBtn) {
    var resultEl = document.getElementById('stt-result-' + idx);
    var playBtn  = document.getElementById('play-btn-' + idx);
    var scoreEl  = document.getElementById('score-bar-' + idx);
    if (this.isRecording[idx]) { this.stop(idx, recBtn); return; }
    var stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({audio: true});
    } catch(e) {
      var msg = '';
      var n = e.name || '';
      if (n === 'NotAllowedError' || n === 'PermissionDeniedError')
        msg = '❌ <strong>마이크 차단됨</strong> — 주소창 🔒 → 마이크 → <strong>허용</strong> 후 F5<br><span style="color:#555">Microphone blocked — click 🔒 → Microphone → Allow → F5</span>';
      else if (n === 'NotFoundError')
        msg = '❌ 마이크를 찾을 수 없어요 — Microphone not found';
      else if (location.protocol === 'file:')
        msg = '❌ 보안 오류 — <a href="https://elimg.com" target="_blank" style="color:#1d4ed8">elimg.com</a>에서 열어주세요 (HTTPS 필요)';
      else
        msg = '❌ 오류: ' + e.name + ' — Chrome/Edge에서 다시 시도하세요';
      if (resultEl) resultEl.innerHTML = '<span style="color:#ef4444;font-size:11px;line-height:1.7">' + msg + '</span>';
      return;
    }
    this.chunks[idx] = [];
    var mr = new MediaRecorder(stream);
    this.recorders[idx] = mr;
    var self = this;
    mr.ondataavailable = function(e) { if (e.data.size > 0) self.chunks[idx].push(e.data); };
    mr.onstop = function() {
      if (self.audioURLs[idx]) URL.revokeObjectURL(self.audioURLs[idx]);
      var blob = new Blob(self.chunks[idx], {type:'audio/webm'});
      self.audioURLs[idx] = URL.createObjectURL(blob);
      if (playBtn) {
        playBtn.disabled = false; playBtn.style.opacity = '1';
        playBtn.onclick = function() { new Audio(self.audioURLs[idx]).play(); };
      }
    };
    mr.start();
    this.isRecording[idx] = true;
    recBtn.textContent = '⏹ 중지'; recBtn.style.background = '#ef4444';
    if (resultEl) resultEl.innerHTML = '<span style="color:#ef4444;font-weight:700">● 녹음 중... / Recording...</span>';
    if (scoreEl) scoreEl.style.width = '0%';

    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      var rec = new SR(); rec.lang = 'ko-KR'; rec.continuous = false; rec.interimResults = false;
      rec.onresult = function(e) {
        var said = e.results[0][0].transcript.replace(/[\\s,.?!]/g,'');
        var target = targetText.replace(/[\\s,.?!]/g,'');
        var conf = e.results[0][0].confidence;
        var match = 0;
        for (var i = 0; i < Math.min(said.length, target.length); i++) { if (said[i] === target[i]) match++; }
        var pct = target.length > 0 ? Math.round(match / target.length * 100) : 0;
        var final = Math.round(pct * 0.7 + Math.round((conf||0.5)*100) * 0.3);
        var color = final >= 80 ? '#22c55e' : final >= 50 ? '#f59e0b' : '#ef4444';
        var msg = final >= 80 ? '✅ 완벽해요! Great!' : final >= 50 ? '🔄 조금 더 연습! Keep going!' : '❌ 다시 시도! Try again!';
        if (resultEl) resultEl.innerHTML = '<span style="color:' + color + ';font-weight:800">' + msg + '</span><br><span style="font-size:10px;color:#555">인식 / Heard: "' + e.results[0][0].transcript + '"</span>';
        if (scoreEl) { scoreEl.style.width = final + '%'; scoreEl.style.background = color; }
      };
      rec.onerror = function() {};
      rec.start();
    }
  },

  stop(idx, recBtn) {
    if (this.recorders[idx] && this.recorders[idx].state !== 'inactive') this.recorders[idx].stop();
    this.isRecording[idx] = false;
    recBtn.textContent = '🎤 다시 녹음'; recBtn.style.background = '#059669';
  },

  async autoDetect() {
    var stateEl = document.getElementById('mic-perm-state');
    var blockedEl = document.getElementById('mic-blocked-guide');
    var allowBtn = document.getElementById('mic-allow-btn');
    if (!stateEl) return;
    if (navigator.permissions) {
      try {
        var result = await navigator.permissions.query({name:'microphone'});
        if (result.state === 'granted') {
          stateEl.innerHTML = '<div style="background:#dcfce7;border-radius:8px;padding:8px;text-align:center;font-size:12px;color:#166534;font-weight:700">✅ 마이크 허용됨 — 바로 녹음하세요! / Microphone allowed!</div>';
          if (allowBtn) { allowBtn.style.background='#166534'; allowBtn.textContent='✅ 허용됨 — 녹음 시작 / Start Recording'; }
          if (blockedEl) blockedEl.style.display = 'none';
        } else if (result.state === 'denied') {
          stateEl.innerHTML = '<div style="background:#fee2e2;border-radius:8px;padding:8px;text-align:center;font-size:12px;color:#991b1b;font-weight:700">🚫 마이크 차단됨 / Blocked — 아래 버튼 클릭</div>';
          if (blockedEl) blockedEl.style.display = 'block';
        } else {
          stateEl.innerHTML = '<div style="background:#fef9c3;border-radius:8px;padding:8px;text-align:center;font-size:12px;color:#92400e">❓ 아래 버튼을 눌러 마이크를 허용하세요</div>';
        }
        result.onchange = function() { RECORDER.autoDetect(); };
      } catch(e) {
        stateEl.innerHTML = '<div style="font-size:11px;color:#888">아래 버튼으로 마이크를 허용하세요</div>';
      }
    }
  },

  async checkPermission(btn) {
    var statusEl = document.getElementById('mic-status');
    var box = document.getElementById('mic-check-box');
    var blockedEl = document.getElementById('mic-blocked-guide');
    var stateEl = document.getElementById('mic-perm-state');
    btn.textContent = '⏳ 확인 중...'; btn.disabled = true;
    if (location.protocol === 'file:') {
      if (statusEl) statusEl.innerHTML = '<span style="color:#ef4444">❌ file:// 불가 → <a href="https://elimg.com" target="_blank" style="color:#1d4ed8;font-weight:700">elimg.com에서 열기</a></span>';
      btn.textContent = '🎙️ 마이크 허용하기'; btn.disabled = false; return;
    }
    try {
      var stream = await navigator.mediaDevices.getUserMedia({audio:true});
      stream.getTracks().forEach(function(t){t.stop();});
      if (stateEl) stateEl.innerHTML = '<div style="background:#dcfce7;border-radius:8px;padding:8px;text-align:center;font-size:12px;color:#166534;font-weight:700">✅ 마이크 허용됨! 아래에서 녹음하세요!</div>';
      if (statusEl) statusEl.innerHTML = '<span style="color:#059669;font-weight:700">✅ 허용됨! / Allowed!</span>';
      if (box) { box.style.background='#dcfce7'; box.style.borderColor='#86efac'; }
      if (blockedEl) blockedEl.style.display = 'none';
      btn.textContent = '✅ 허용됨 — 녹음 시작 / Start Recording'; btn.style.background='#166534'; btn.disabled=false;
    } catch(e) {
      btn.disabled = false;
      if (e.name==='NotAllowedError'||e.name==='PermissionDeniedError') {
        if (blockedEl) blockedEl.style.display='block';
        if (stateEl) stateEl.innerHTML='<div style="background:#fee2e2;border-radius:8px;padding:8px;text-align:center;font-size:12px;color:#991b1b;font-weight:700">🚫 차단됨 — 아래 순서대로 해결 후 다시 클릭</div>';
        btn.textContent='🔄 허용 완료 후 다시 클릭'; btn.style.background='#ef4444';
      } else {
        if (statusEl) statusEl.innerHTML='<span style="color:#ef4444">오류 (' + e.name + ') — Chrome/Edge로 시도</span>';
        btn.textContent='🔄 다시 시도'; btn.style.background='#92400e';
      }
    }
  }
};

function startSTT(idx, targetText, recBtn) { RECORDER.start(idx, targetText, recBtn); }

// ===== AI 에이전틱 G스택 렌더 =====
function renderAI() {
  setTimeout(function(){ RECORDER.autoDetect(); }, 100);
  return \`
  <h2>🤖 AI 실습</h2>
  <p class="sub">글로컬 아카데미 × 에이전틱 G스택</p>

  <!-- 헤더 배너 -->
  <div style="background:linear-gradient(135deg,#1E3A5F,#2E75B6);color:#fff;border-radius:12px;padding:16px;margin-bottom:12px">
    <div style="font-size:11px;opacity:0.7;margin-bottom:4px">GLOCAL ACADEMY · AI-POWERED · 글로컬아카데미</div>
    <div style="font-size:15px;font-weight:800;margin-bottom:6px">에이전틱 G스택 조선소 한국어 실습</div>
    <div style="font-size:11px;opacity:0.85;line-height:1.7">Google Gemini · Claude AI · Agent Harness 연계<br>
    <span style="color:#93c5fd">🔵 Shipyard Korean Learning × AI Agents</span></div>
  </div>

  <!-- 앱 내 AI 채팅 -->
  <div class="card" style="margin-bottom:10px;border:2px solid #2E75B6">
    <div class="section-label" style="background:#1E3A5F">⚡ 앱 내 AI 채팅 · 로그인 불필요</div>
    <div style="font-size:12px;color:#555;margin:6px 0 10px;line-height:1.6">
      계정 없이 바로 AI에게 질문하세요<br>
      <span style="font-size:11px;color:#2E75B6">Ask AI directly — no login needed</span>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
      \${AI_QUICK_BTNS.map(function(b,i){return \`
        <button onclick="AICHAT.quickSend(\${i})"
          style="background:#f0f7ff;border:1px solid #2E75B6;color:#1E3A5F;border-radius:20px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">
          \${b.emoji} \${b.label}
        </button>\`;}).join('')}
    </div>
    <div class="ai-msgbox" style="background:#fff;border-radius:12px;border:1px solid #e8edf2;min-height:120px;max-height:300px;overflow-y:auto;padding:12px;margin-bottom:10px;display:flex;flex-direction:column;gap:8px">
      \${AICHAT.msgs.length === 0
        ? \`<div style="text-align:center;color:#aaa;padding:24px 16px;font-size:12px">
            💡 버튼을 누르거나 아래에 입력하세요<br>
            <span style="font-size:11px">Tap a button above or type below</span>
          </div>\`
        : AICHAT.msgs.map(function(m){ return \`
          <div style="align-self:\${m.role==='user'?'flex-end':'flex-start'};max-width:90%">
            <div style="background:\${m.role==='user'?'#2E75B6':'#f0f7ff'};color:\${m.role==='user'?'#fff':'#1E3A5F'};border-radius:\${m.role==='user'?'14px 14px 4px 14px':'14px 14px 14px 4px'};padding:10px 13px;font-size:13px;line-height:1.65;white-space:pre-wrap;word-break:break-word">\${m.text}</div>
            <div style="font-size:10px;color:#aaa;margin-top:3px;text-align:\${m.role==='user'?'right':'left'}">\${m.time}</div>
          </div>\`;}).join('')}
      \${AICHAT.loading ? \`<div style="align-self:flex-start;background:#f0f7ff;border-radius:14px 14px 14px 4px;padding:10px 14px;font-size:13px;color:#2E75B6">⏳ AI가 답하는 중... / Generating...</div>\` : ''}
    </div>
    <div style="display:flex;gap:8px">
      <input id="ai-input" type="text" placeholder="조선소 한국어 질문 / Ask about shipyard Korean..."
        style="flex:1;padding:12px 14px;border:2px solid #e5e7eb;border-radius:10px;font-size:14px;font-family:inherit;outline:none"
        onfocus="this.style.borderColor='#2E75B6'" onblur="this.style.borderColor='#e5e7eb'"
        onkeydown="if(event.key==='Enter'){AICHAT.input=this.value;AICHAT.send();}">
      <button onclick="AICHAT.input=document.getElementById('ai-input').value;AICHAT.send()"
        style="background:#2E75B6;color:#fff;border-radius:10px;padding:0 18px;font-size:20px;min-width:52px;font-family:inherit;cursor:pointer;border:none">➤</button>
    </div>
    <div style="font-size:10px;color:#aaa;margin-top:6px;text-align:center">Enter로 전송 · 🆓 완전 무료</div>
  </div>

  <!-- 외부 AI 가이드 -->
  <div class="card" style="margin-bottom:10px">
    <div class="section-label">🌐 외부 AI 서비스 · External AI</div>
    <div style="font-size:11px;color:#888;margin:6px 0 8px">더 강력한 AI로 깊이 있게 학습하세요</div>

    <details style="margin-bottom:8px">
      <summary style="background:linear-gradient(135deg,#1d4ed8,#2563eb);color:#fff;padding:10px 14px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;list-style:none">
        🔵 Gemini AI — Google 계정 로그인 / Free with Google account
      </summary>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:0 0 8px 8px;padding:12px;font-size:12px;line-height:1.9;color:#1a202c">
        <strong style="color:#1d4ed8">① 접속:</strong> gemini.google.com<br>
        <strong style="color:#1d4ed8">② 조선소 롤플레이 연습:</strong>
        <div style="background:#fff;border-radius:6px;padding:8px;margin:4px 0;border-left:3px solid #2563eb">
          <div style="font-weight:700;color:#1d4ed8;margin-bottom:3px">💬 프롬프트 복사해서 붙여넣기</div>
          <span style="font-family:monospace;background:#dbeafe;padding:4px 8px;border-radius:4px;display:block;margin:4px 0;font-size:11px;line-height:1.6">"저는 한화오션 조선소 외국인 근로자예요. 이번 과에서 배운 표현으로 상사와 대화하는 롤플레이를 도와주세요. 영어로도 설명해 주세요."</span>
          Copy &amp; paste to Gemini for shipyard roleplay practice
        </div>
        <div style="background:#fff;border-radius:6px;padding:8px;margin:4px 0;border-left:3px solid #2563eb">
          <div style="font-weight:700;color:#1d4ed8;margin-bottom:3px">📸 현장 사진 질문 (Gemini 특화)</div>
          조선소 안전 표지판 사진 → 업로드 → "이게 무슨 뜻이에요?"<br>
          <span style="color:#555">Photo of Korean safety signs → Upload → Ask what it means</span>
        </div>
        <a href="https://gemini.google.com" target="_blank" style="display:block;background:#1d4ed8;color:#fff;text-align:center;padding:8px;border-radius:8px;font-weight:700;margin-top:8px;font-size:13px">🔵 Gemini 열기 / Open Gemini →</a>
      </div>
    </details>

    <details>
      <summary style="background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;padding:10px 14px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;list-style:none">
        🟣 Claude AI — 이메일 가입 · Free with email
      </summary>
      <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:0 0 8px 8px;padding:12px;font-size:12px;line-height:1.9;color:#1a202c">
        <strong style="color:#7c3aed">① 접속:</strong> claude.ai (이메일로 무료 가입)<br>
        <strong style="color:#7c3aed">② 내 한국어 첨삭:</strong>
        <div style="background:#fff;border-radius:6px;padding:8px;margin:4px 0;border-left:3px solid #7c3aed">
          <div style="font-weight:700;color:#7c3aed;margin-bottom:3px">✏️ 문장 고치기 (Claude 특화)</div>
          <span style="font-family:monospace;background:#ede9fe;padding:4px 8px;border-radius:4px;display:block;margin:4px 0;font-size:11px;line-height:1.6">"저는 조선소 외국인 근로자입니다. 제 한국어 문장을 고쳐주세요: [내 문장]. 영어로 설명해 주세요."</span>
          Copy your sentence → paste to Claude → get corrections in English
        </div>
        <a href="https://claude.ai" target="_blank" style="display:block;background:#7c3aed;color:#fff;text-align:center;padding:8px;border-radius:8px;font-weight:700;margin-top:8px;font-size:13px">🟣 Claude 열기 / Open Claude →</a>
      </div>
    </details>
  </div>

  <!-- 발음 코치 -->
  <div class="card" style="background:#f0fdf4;border:1px solid #86efac;margin-bottom:10px">
    <div class="section-label" style="background:#059669">🎤 발음 코치 · Pronunciation Coach</div>
    <div style="font-size:12px;color:#555;margin:6px 0;line-height:1.6">
      원어민 듣기 → 내가 녹음 → 정확도 비교<br>
      <span style="font-size:11px;color:#059669">Listen → Record → Compare accuracy</span>
    </div>
    <div style="background:#dcfce7;border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:11px;color:#166534">
      🆓 브라우저 내장 API · 완전 무료 · Chrome/Edge 권장
    </div>

    <div id="mic-check-box" style="background:#fef9c3;border:2px solid #fbbf24;border-radius:10px;padding:12px;margin-bottom:10px">
      <div id="mic-perm-state" style="margin-bottom:8px"></div>
      <div id="mic-blocked-guide" style="display:none;background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:10px;margin-bottom:8px;font-size:12px;line-height:1.9;color:#1a202c">
        🚫 <strong>마이크 차단됨 해결 / Microphone Blocked:</strong><br>
        PC Chrome/Edge: 주소창 🔒 → 마이크 → <strong>허용</strong> → F5 새로고침<br>
        Android: ⋮ → 사이트 설정 → 마이크 → 허용<br>
        <span style="color:#555">PC: Click 🔒 in address bar → Microphone → Allow → press F5</span>
      </div>
      <button id="mic-allow-btn" onclick="RECORDER.checkPermission(this)"
        style="width:100%;background:#059669;color:#fff;border-radius:8px;padding:10px;font-size:13px;font-weight:700">
        🎙️ 마이크 허용하기 / Allow Microphone
      </button>
      <div id="mic-status" style="font-size:11px;margin-top:6px;text-align:center;min-height:14px"></div>
    </div>

    \${[
      {sent:'안전모를 착용하세요.', eng:'Please wear your safety helmet.'},
      {sent:'작업 지시서를 확인하세요.', eng:'Please check the work order.'},
      {sent:'도움이 필요합니다.', eng:'I need help.'},
      {sent:'작업이 완료되었습니다.', eng:'The work is complete.'},
      {sent:'위험합니다. 조심하세요!', eng:'It is dangerous. Please be careful!'},
    ].map(function(item,i){ return \`
      <div style="background:#fff;border-radius:10px;padding:12px;margin-bottom:8px;border:1px solid #86efac">
        <div style="font-size:13px;font-weight:700;color:#14532d;margin-bottom:2px">\${item.sent}</div>
        <div style="font-size:10px;color:#059669;margin-bottom:8px">🇬🇧 \${item.eng}</div>
        <div style="background:#bbf7d0;border-radius:6px;height:6px;margin-bottom:8px;overflow:hidden">
          <div id="score-bar-\${i}" style="height:100%;width:0%;background:#22c55e;transition:width 0.5s;border-radius:6px"></div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button onclick="var b=this;TTS.speak('\${item.sent.replace(/'/g,"\\\\'")}');b.textContent='🔊 재생 중...';setTimeout(function(){b.textContent='🔊 원어민'},2000)"
            style="background:#f59e0b;color:#fff;border-radius:16px;padding:5px 12px;font-size:11px;font-weight:700">🔊 원어민</button>
          <button id="rec-btn-\${i}" onclick="startSTT(\${i},'\${item.sent.replace(/'/g,"\\\\'")}',this)"
            style="background:#059669;color:#fff;border-radius:16px;padding:5px 12px;font-size:11px;font-weight:700">🎤 녹음</button>
          <button id="play-btn-\${i}" disabled
            style="background:#1d4ed8;color:#fff;border-radius:16px;padding:5px 12px;font-size:11px;font-weight:700;opacity:0.4">▶ 내 발음</button>
        </div>
        <div id="stt-result-\${i}" style="font-size:11px;margin-top:6px;min-height:14px"></div>
      </div>
    \`; }).join('')}

    <div style="background:#f0fdf4;border-radius:8px;padding:10px;font-size:11px;color:#166534;line-height:1.8;margin-top:4px">
      <strong>📖 사용법 / How to use:</strong><br>
      1️⃣ <strong>🔊 원어민</strong> — 원어민 발음 먼저 들으세요 / Listen to native speaker<br>
      2️⃣ <strong>🎤 녹음</strong> — 따라 말하고 다시 누르면 중지 / Speak then tap again to stop<br>
      3️⃣ <strong>▶ 내 발음</strong> — 내 발음 들어보기 / Listen to yourself<br>
      4️⃣ 점수: 🟢 80%+ 🟡 50~79% 🔴 50% 미만
    </div>
  </div>

  <!-- G스택 학습법 -->
  <div class="card" style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #86efac">
    <div class="section-label" style="background:#059669">🌐 글로컬 G스택 학습법 · 4-Step AI Method</div>
    <div style="font-size:12px;color:#166534;margin:8px 0;line-height:1.9">
      <strong>글로컬 아카데미 AI 에이전트 기반 4단계:</strong><br>
      <span style="color:#555">① 어휘/표현 → 앱 내 AI 또는 Gemini 질문</span><br>
      <span style="color:#555">② 대화 → Gemini 롤플레이 실습</span><br>
      <span style="color:#555">③ 발음 → 위 발음 코치에서 녹음 비교</span><br>
      <span style="color:#555">④ 첨삭 → Claude AI에 내 문장 보내기</span><br>
      <br>
      <span style="color:#2E75B6;font-size:11px"><strong>🇬🇧 Glocal Academy 4-Step AI Method:</strong><br>
      ① Vocab/Expressions → Ask in-app AI or Gemini<br>
      ② Conversation → Gemini roleplay practice<br>
      ③ Pronunciation → Record &amp; compare above<br>
      ④ Correction → Send your text to Claude AI</span>
    </div>
  </div>
  \`;
}`;

// ─── 파일 처리 ────────────────────────────────────────────────────────
const files = fs.readdirSync(dir).filter(f => f.match(/^HanwhaOcean.*Level[12]_Lesson\d+\.html$/));
console.log(`\nHanwhaOcean Lesson 파일: ${files.length}개\n`);

let updated = 0, skipped = 0, errors = 0;

for (const fname of files.sort()) {
  const fpath = path.join(dir, fname);
  try {
    let content = fs.readFileSync(fpath, 'utf8');

    // 이미 RECORDER가 있으면 RECORDER 추가 생략 여부 판단
    const hasRecorder = content.includes('var RECORDER') || content.includes('const RECORDER');
    const hasOldRenderAI = content.includes(OLD_RENDER_START) && content.includes(OLD_RENDER_END);

    if (!hasOldRenderAI) {
      console.log(`  [SKIP] ${fname} — 패턴 없음`);
      skipped++;
      continue;
    }

    // 구 버전 renderAI() 전체를 찾아서 교체
    const startIdx = content.indexOf(OLD_RENDER_START);
    const endIdx = content.indexOf(OLD_RENDER_END);
    if (startIdx === -1 || endIdx === -1) {
      console.log(`  [WARN] ${fname} — 마커 위치 찾기 실패`);
      skipped++;
      continue;
    }
    const after = content.slice(endIdx + OLD_RENDER_END.length);
    let newContent;

    if (hasRecorder) {
      // RECORDER 이미 있으면 renderAI()만 교체
      newContent = content.slice(0, startIdx) + NEW_AI_CODE + after;
    } else {
      newContent = content.slice(0, startIdx) + NEW_AI_CODE + after;
    }

    if (newContent === content) {
      console.log(`  [SKIP] ${fname} — 변경 없음`);
      skipped++; continue;
    }

    fs.writeFileSync(fpath, newContent, 'utf8');
    console.log(`  [OK]   ${fname}`);
    updated++;
  } catch(e) {
    console.log(`  [ERR]  ${fname}: ${e.message}`);
    errors++;
  }
}

console.log(`\n✅ 완료: 업데이트 ${updated}개 | 스킵 ${skipped}개 | 오류 ${errors}개`);
