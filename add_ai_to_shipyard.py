"""
조선소 초급 과정 1·2 (한화오션 Level1+Level2) 전 파일에
AI 에이전트 섹션을 일괄 삽입하는 스크립트
"""
import os, glob, re

# ── AI 에이전트 삽입 코드 ──────────────────────────────────────────
AI_CODE = r"""
// ===== AI 에이전트 (조선소 특화) =====
var AI_QUICK_BTNS = [
  { emoji:'📖', label:'이 단어 설명해줘',
    q:'한화오션 조선소 외국인 근로자 초급 한국어 학습자입니다. 이번 과에서 배운 단어를 쉽게 설명해주세요. 예를 들어 "알겠습니다", "수고하세요", "안전 제일" 같은 표현의 뜻과 언제 쓰는지 영어로도 알려주세요.' },
  { emoji:'🔧', label:'조선소 표현 알려줘',
    q:'조선소에서 매일 쓰는 한국어 표현 5가지를 알려주세요. 발음, 영어 뜻, 언제 쓰는지 함께 알려주세요. 초급 수준으로 쉽게 설명해주세요.' },
  { emoji:'👋', label:'자기소개 연습',
    q:'저는 조선소에서 일하는 외국인 근로자입니다. 한국어로 자기소개 연습을 도와주세요. 이름, 나라, 직업을 소개하는 짧은 문장을 만들어주세요. 영어 해석도 함께 넣어주세요.' },
  { emoji:'🛡️', label:'안전 한국어 알려줘',
    q:'조선소 안전 관련 한국어 표현을 알려주세요. "위험해요", "조심하세요", "도와주세요", "비상구" 등 긴급할 때 꼭 필요한 말을 영어와 함께 5가지 알려주세요.' },
  { emoji:'✏️', label:'내 문장 고쳐줘',
    q:'한국어 초급 조선소 학습자입니다. 제 한국어 문장을 고쳐주세요: "저는 베트남 사람 이에요. 직업은 용접공." 어떻게 더 자연스럽게 말할 수 있는지 알려주세요.' },
  { emoji:'🎯', label:'퀴즈 문제 틀렸어요',
    q:'한국어 초급 퀴즈에서 틀렸습니다. "이름이 뭐예요?"에 대한 답을 어떻게 해야 하는지, 이/가, 은/는, 이에요/예요 차이를 쉽게 설명해주세요. 영어로도 설명해주세요.' },
];

var AICHAT = {
  msgs: [],
  loading: false,
  input: '',
  addMsg: function(role, text) {
    this.msgs.push({ role, text, time: new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}) });
    render();
  },
  quickSend: function(idx) {
    var b = AI_QUICK_BTNS[idx];
    if (!b || this.loading) return;
    this.send(b.q, b.label);
  },
  send: async function(text, label) {
    if (this.loading) return;
    text = text || this.input.trim();
    if (!text) return;
    this.input = '';
    this.loading = true;
    var displayText = label || text;
    this.addMsg('user', displayText);
    var sys = encodeURIComponent('You are a Korean language tutor for foreign workers at Hanwha Ocean shipyard in Geoje, Korea. Students are beginner level (KIIP Level 1-2). Always: 1) Keep answers SHORT and CLEAR 2) Include English translations 3) Focus on practical shipyard expressions 4) Use simple grammar explanations. Reply in Korean with English translation.');
    try {
      var url = 'https://text.pollinations.ai/' + encodeURIComponent(text) + '?model=openai&system=' + sys;
      var res = await fetch(url);
      var reply = await res.text();
      this.loading = false;
      this.addMsg('assistant', reply);
    } catch(e) {
      this.loading = false;
      this.addMsg('assistant', '⚠️ 연결 오류 / Connection error. Please try again.\n다시 시도해주세요.');
    }
  },
  sendInput: function() {
    var inp = document.getElementById('ai-input');
    if (inp) this.input = inp.value;
    this.send();
  }
};

function renderAI() {
  return `
  <h2>🤖 AI 한국어 도우미</h2>
  <p class="sub">AI Korean Tutor · 로그인 없이 무료 · 24시간</p>

  <div class="card" style="background:linear-gradient(135deg,#1E3A5F,#2E75B6);color:#fff;border:none;margin-bottom:14px">
    <div style="font-size:13px;opacity:.9;margin-bottom:10px">💡 빠른 질문 / Quick Questions</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      ${AI_QUICK_BTNS.map((b,i)=>`
        <button onclick="AICHAT.quickSend(${i})" style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:10px;color:#fff;padding:10px 8px;font-size:12px;font-weight:600;text-align:left;line-height:1.4;font-family:inherit">
          ${b.emoji} ${b.label}
        </button>`).join('')}
    </div>
  </div>

  <div style="background:#fff;border-radius:12px;border:1px solid #e8edf2;min-height:200px;max-height:380px;overflow-y:auto;padding:12px;margin-bottom:10px;display:flex;flex-direction:column;gap:8px">
    ${AICHAT.msgs.length === 0
      ? `<div style="text-align:center;color:#aaa;padding:40px 16px;font-size:13px">
          🤖 위 버튼을 누르거나 아래에 직접 입력하세요<br>
          <span style="font-size:11px">Tap a button above or type your question below</span>
        </div>`
      : AICHAT.msgs.map(m => `
        <div style="align-self:${m.role==='user'?'flex-end':'flex-start'};max-width:88%">
          <div style="background:${m.role==='user'?'#2E75B6':'#f0f7ff'};color:${m.role==='user'?'#fff':'#1E3A5F'};border-radius:${m.role==='user'?'14px 14px 4px 14px':'14px 14px 14px 4px'};padding:10px 13px;font-size:13px;line-height:1.65;white-space:pre-wrap;word-break:break-word">${m.text}</div>
          <div style="font-size:10px;color:#aaa;margin-top:3px;text-align:${m.role==='user'?'right':'left'}">${m.time}</div>
        </div>`).join('')
    }
    ${AICHAT.loading ? `<div style="align-self:flex-start;background:#f0f7ff;border-radius:14px 14px 14px 4px;padding:10px 14px;font-size:13px;color:#2E75B6">⏳ 답변 생성 중... / Generating answer...</div>` : ''}
  </div>

  <div style="display:flex;gap:8px">
    <input id="ai-input" type="text" placeholder="한국어로 질문하세요 / Ask in any language..." value="${AICHAT.input}"
      style="flex:1;padding:12px 14px;border:2px solid #e5e7eb;border-radius:10px;font-size:14px;font-family:inherit;outline:none"
      onfocus="this.style.borderColor='#2E75B6'" onblur="this.style.borderColor='#e5e7eb'"
      onkeydown="if(event.key==='Enter'){AICHAT.input=this.value;AICHAT.send();}">
    <button onclick="AICHAT.input=document.getElementById('ai-input').value;AICHAT.send()"
      style="background:#2E75B6;color:#fff;border-radius:10px;padding:0 18px;font-size:20px;font-weight:700;min-width:52px;font-family:inherit">
      ➤
    </button>
  </div>
  <p style="font-size:11px;color:#aaa;text-align:center;margin-top:8px">🤖 Powered by Pollinations AI · 무료 · Free forever</p>`;
}
"""

# ── 삽입할 위치 패턴 ──────────────────────────────────────────────
MARKER = '// ===== INIT ====='

# nav items에 ai 추가
NAV_PATTERN = r"(\{id:'geoje'[^}]*\})"
NAV_REPLACE_L1 = r"\1,{id:'ai',l:'AI실습',i:'🤖'}"

# bottom nav에 ai 추가
BOTTOMNAV_PATTERN = r"(\{id:'quiz',i:'🎯',l:'퀴즈'\})"
BOTTOMNAV_REPLACE = r"{id:'ai',i:'🤖',l:'AI'},\1"

# pages object에 ai: renderAI 추가
PAGES_PATTERN = r"(geoje:\s*renderGeoje)"
PAGES_REPLACE = r"\1, ai: renderAI"

# ── 대상 파일 목록 ──────────────────────────────────────────────
target_dir = os.path.dirname(os.path.abspath(__file__))
files = sorted(glob.glob(os.path.join(target_dir, 'HanwhaOcean_Level*_Lesson*.html')))

print(f"대상 파일 수: {len(files)}")

success = 0
skipped = 0
errors = []

for fpath in files:
    fname = os.path.basename(fpath)
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 이미 AI 섹션이 있으면 건너뜀
        if 'renderAI' in content:
            print(f"  [SKIP] {fname} — 이미 AI 섹션 있음")
            skipped += 1
            continue

        original = content

        # 1. AI 코드 삽입 (INIT 직전)
        if MARKER not in content:
            print(f"  [WARN] {fname} — MARKER 없음, 건너뜀")
            skipped += 1
            continue
        content = content.replace(MARKER, AI_CODE + '\n' + MARKER)

        # 2. nav items에 AI 추가
        content = re.sub(NAV_PATTERN, NAV_REPLACE_L1, content, count=1)

        # 3. bottom nav에 AI 추가
        content = re.sub(BOTTOMNAV_PATTERN, BOTTOMNAV_REPLACE, content, count=1)

        # 4. pages object에 ai: renderAI 추가
        content = re.sub(PAGES_PATTERN, PAGES_REPLACE, content, count=1)

        if content == original:
            print(f"  [WARN] {fname} — 변경 없음 (패턴 불일치)")
            skipped += 1
            continue

        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"  [OK]   {fname}")
        success += 1

    except Exception as e:
        errors.append(f"{fname}: {e}")
        print(f"  [ERR]  {fname}: {e}")

print(f"\n완료: {success}개 수정 / {skipped}개 건너뜀 / {len(errors)}개 오류")
if errors:
    for e in errors:
        print(f"  오류: {e}")
