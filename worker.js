/**
 * Cloudflare Worker — elimg-com
 * - /api/chat        → FAQ 봇 (토큰 없음 · 완전 무료)
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

    // .html 확장자 → 확장자 없는 URL 리다이렉트 (307)
    if (url.pathname.endsWith('.html') && !url.pathname.startsWith('/api/')) {
      const newUrl = new URL(request.url);
      newUrl.pathname = url.pathname.slice(0, -5);
      return Response.redirect(newUrl.toString(), 307);
    }

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

/* ── 레슨별 FAQ (토큰 없음 · 완전 무료) ────────────────────── */
const LESSON_FAQ = {
 'L0L1':[
  {k:['기본모음','모음표','6개','basic vowel','vowel table'],r:'기본 모음 6개:\nㅏ(아/ah) 입 크게\nㅓ(어/uh) 반쯤\nㅗ(오/oh) 동그랗게\nㅜ(우/oo) 앞으로\nㅡ(으/eu) 옆으로\nㅣ(이/ee) 웃는 모양\nBasic vowels: ㅏ ㅓ ㅗ ㅜ ㅡ ㅣ'},
  {k:['ㅏ발음','ㅓ발음','아발음','어발음','ah uh','ㅏ어떻게','ㅓ어떻게'],r:'ㅏ = "아" (ah) — 입 크게. Like "father"\nㅓ = "어" (uh) — 반쯤. Like "fun"\n연습: 아버지(아=father) 어머니(어=mother)'},
  {k:['ㅗ발음','ㅜ발음','ㅡ발음','ㅣ발음','oh oo eu ee','오우으이'],r:'ㅗ="오"(oh) 동그랗게. Like "go"\nㅜ="우"(oo) 앞으로. Like "food"\nㅡ="으"(eu) 옆으로. No English match!\nㅣ="이"(ee) 웃는 모양. Like "see"'},
  {k:['복합모음','이중모음','diphthong','ㅐ','ㅔ','ㅑ','ㅕ','ㅛ','ㅠ','compound vowel'],r:'복합 모음 6개:\nㅐ(애/eh) ㅔ(에/eh) ← 비슷!\nㅑ(야/ya) ㅕ(여/yuh)\nㅛ(요/yo) ㅠ(유/yu)\n공식: ㅑ=ㅣ+ㅏ, ㅛ=ㅣ+ㅗ, ㅠ=ㅣ+ㅜ'},
  {k:['발음팁','모음팁','연습법','쓰는순서','practice tip','writing order'],r:'모음 학습 팁:\n1. 거울 보며 입 모양 확인\n2. ㅏ→ㅓ→ㅗ→ㅜ→ㅡ→ㅣ 순서 연습\n3. 매일 5번씩 소리내어 읽기\n4. 한국어 안전 표지판에서 모음 찾기\nPractice daily for 5 mins!'},
 ],
 'L0L2':[
  {k:['ㄱ발음','ㄴ발음','ㄷ발음','g n d 발음','ㄱㄴㄷ'],r:'ㄱ=g/k 기역. 목 뒤. "기사, 고기"\nㄴ=n 니은. 혀끝 윗니. "나무, 눈"\nㄷ=d/t 디귿. 혀끝. "다리, 도구"\n연습: 가나다!'},
  {k:['ㄹ발음','ㅁ발음','ㅂ발음','r m b 발음','ㄹㅁㅂ'],r:'ㄹ=r/l 리을. 혀 굴리기. "라디오"\nㅁ=m 미음. 입술 붙이기. "마음"\nㅂ=b/p 비읍. 입술 터뜨리기. "바나나"\n연습: 라마바!'},
  {k:['격음','ㅋ','ㅌ','ㅍ','aspirated','기식음','강한소리'],r:'격음 (숨이 강하게 나와요):\nㅋ=kh "카메라, 코"\nㅌ=th "타다, 토끼"\nㅍ=ph "파, 포크"\nTip: 손을 입 앞에 대보세요 — feel the air!'},
  {k:['경음','ㄲ','ㄸ','ㅃ','tense','된소리','쌍기역'],r:'경음 (긴장된 소리):\nㄲ=kk "까다, 꽃"\nㄸ=tt "따다, 뚜껑"\nㅃ=pp "빠르다"\nTip: 목에 긴장을 주며 발음해요\nTense consonants!'},
  {k:['자음표','자음총정리','14개','자음목록','all consonant','consonant list'],r:'자음 14개:\nㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅅ ㅇ ㅈ ㅊ ㅋ ㅌ ㅍ ㅎ\ng n d r m b s - j ch k t p h\n격음:ㅋㅌㅍㅊ / 경음:ㄲㄸㅃㅆㅉ'},
 ],
 'L0L3':[
  {k:['ㅅ발음','ㅈ발음','s j 발음','ㅅㅈ'],r:'ㅅ=s 시옷. 이빨 사이. "사람, 수박"\nㅈ=j 지읒. "저, 조선소"\n주의: ㅅ+ㅣ→"시" (shi 발음)!\n예: 식당=sikdang (시당처럼)'},
  {k:['ㅊ발음','ㅋ발음','ㅌ발음','ch k t','ㅊㅋㅌ'],r:'ㅊ=ch 치읓. "차, 청소"\nㅋ=k 키읔. "카드, 코"\nㅌ=t 티읕. "타, 테이블"\n모두 격음! 숨이 나와요.'},
  {k:['ㅍ발음','ㅎ발음','p h 발음','ㅍㅎ'],r:'ㅍ=p/ph 피읖. "파, 피자"\nㅎ=h 히읗. "하나, 학교"\nㅎ는 무성음 — 모음 앞에서 강하게, 자음 뒤에서 약해요.'},
  {k:['ㅇ받침','ㅇ초성','silent ng','이응','ㅇ역할'],r:'ㅇ의 두 가지 역할:\n1. 초성: 묵음 (아=a, 이=i)\n2. 받침: ng 소리 (강=kang, 영=young)\n안녕(annyeong) — 끝의 ㅇ은 ng!'},
  {k:['자음2총정리','ㅅ~ㅎ','ㅅ부터ㅎ까지','second consonant','자음복습'],r:'자음2 ㅅ~ㅎ 정리:\nㅅ(s) ㅈ(j) ㅊ(ch) ㅋ(k) ㅌ(t) ㅍ(p) ㅎ(h)\n+경음: ㅆ(ss) ㅉ(jj)\n예: 수업(수업)→su-eop, 학교→hak-gyo'},
 ],
 'L0L4':[
  {k:['음절구조','syllable structure','음절이란','한국어음절'],r:'한국어 음절 구조:\n[초성]+[중성]+[종성(받침)]\n예: 밥 = ㅂ(초성)+ㅏ(중성)+ㅂ(종성)\n사 = ㅅ+ㅏ (받침 없음)\nEvery syllable has: initial+vowel(+final)'},
  {k:['초성중성','초성+중성','cv syllable','자음+모음'],r:'받침 없는 음절 (CV):\nㄱ+ㅏ=가, ㄴ+ㅏ=나, ㄷ+ㅏ=다\nㅅ+ㅣ=시, ㅈ+ㅗ=조, ㅎ+ㅜ=후\n조선소 = 조+선+소 (3음절)'},
  {k:['받침포함','cvc syllable','초성중성종성','자음+모음+자음'],r:'받침 있는 음절 (CVC):\n밥=ㅂ+ㅏ+ㅂ, 국=ㄱ+ㅜ+ㄱ\n한=ㅎ+ㅏ+ㄴ, 국=ㄱ+ㅜ+ㄱ\n한국 = 한+국 (2음절)'},
  {k:['음절읽기','읽기연습','syllable reading','읽는법'],r:'음절 읽기 연습:\n안 → ㅏ+ㄴ = "안"\n녕 → ㄴ+ㅕ+ㅇ = "녕"\n안녕하세요 = 안+녕+하+세+요\n천천히 음절씩 읽어보세요!'},
  {k:['쌍자음음절','겹모음음절','complex syllable','어려운음절'],r:'어려운 음절 팁:\n쌍자음: 까=ㄲ+ㅏ, 또=ㄸ+ㅗ\n겹받침: 닭=ㄷ+ㅏ+ㄺ (읽을 때 하나만)\n연습: 학교, 식당, 작업장'},
 ],
 'L0L5':[
  {k:['받침이란','batchim','받침뭐','종성이란','final consonant'],r:'받침 = 음절 맨 아래 자음\n예: 밥(bap) — 아래 ㅂ이 받침\n학(hak) — 아래 ㄱ이 받침\nBatchim = final consonant at bottom of syllable'},
  {k:['대표받침','7대표','7받침','representative batchim','받침소리'],r:'대표 받침소리 7개:\nㄱ(k) ㄴ(n) ㄷ(t) ㄹ(l) ㅁ(m) ㅂ(p) ㅇ(ng)\n예: 각 끝 맏 말 감 답 강\nAll other batchim reduce to one of these 7!'},
  {k:['연음','연음규칙','liaison','받침+모음','받침연음'],r:'연음 규칙: 받침+모음 → 연결!\n밥+이=바비 (bab+i=babi)\n학교+에=하꾜에 (hak+gyo+e)\n없어요=업써요\nBatchim slides to next vowel!'},
  {k:['겹받침','double batchim','이중받침','ㄳ','ㄵ','ㄺ'],r:'겹받침 — 두 자음이 받침:\n닭=ㄱ만 발음 (닥)\n삶=ㅁ만 발음 (삼)\n읽다=ㄱ만 발음 (익다)\n보통 왼쪽 또는 오른쪽 하나만!'},
  {k:['받침예시','batchim example','받침단어','받침연습'],r:'받침 단어 연습:\nㄱ받침: 학교, 국, 직업\nㄴ받침: 안전, 한국, 인사\nㄹ받침: 발음, 일, 철\nㅂ받침: 밥, 입, 집\n현장 단어로 연습해요!'},
 ],
 'L0L6':[
  {k:['한자어숫자','일이삼','sino korean','1234 한국어','숫자1~10'],r:'한자어 숫자 (전화/날짜/금액):\n일(1) 이(2) 삼(3) 사(4) 오(5)\n육(6) 칠(7) 팔(8) 구(9) 십(10)\nSino-Korean: il i sam sa o yuk chil pal gu sip'},
  {k:['고유어숫자','하나둘셋','native korean','하나부터열','물건세기'],r:'고유어 숫자 (사람/물건 셀 때):\n하나(1) 둘(2) 셋(3) 넷(4) 다섯(5)\n여섯(6) 일곱(7) 여덟(8) 아홉(9) 열(10)\nNative Korean: hana dul set net dasut...'},
  {k:['숫자언제','어떤숫자','when to use','숫자구분'],r:'언제 어떤 숫자?\n한자어: 전화번호, 날짜, 금액, 층수\n   → 010-1234 / 3월 5일 / 5만원\n고유어: 사람수, 물건수, 나이(비공식)\n   → 사람 셋 / 사과 하나'},
  {k:['큰숫자','백천만','hundred thousand','100 1000 10000'],r:'큰 숫자:\n백(100) 천(1,000) 만(10,000)\n십만(100,000) 백만(1,000,000)\n예: 3,500,000원 = 삼백오십만원\n월급 표현할 때 유용해요!'},
  {k:['전화번호','번호읽기','phone number','핸드폰번호'],r:'전화번호 읽기:\n010-1234-5678\n= 공일공-일이삼사-오육칠팔\n0=공(gong) / 회사번호도 같은 방식\n저의 번호는 ___예요. — My number is ___.'},
 ],
 'L0L7':[
  {k:['만날때인사','만날때','greeting hello','만날때표현'],r:'만날 때 인사:\n안녕하세요 — Hello (항상 OK)\n안녕하십니까 — 매우 공식적\n어서오세요 — Welcome!\n좋은 아침이에요 — Good morning\nHello anytime: 안녕하세요!'},
  {k:['헤어질때','goodbye','인사나눌때','작별인사'],r:'헤어질 때:\n안녕히 계세요 — Goodbye (상대방이 남을 때)\n안녕히 가세요 — Goodbye (상대방이 갈 때)\n수고하세요 — Good work/Take care\n내일 봐요 — See you tomorrow'},
  {k:['감사표현','사과표현','thank sorry','감사합니다','죄송합니다'],r:'감사: 감사합니다 / 고맙습니다\n→ 천만에요 (You\'re welcome)\n사과: 죄송합니다 (공식) / 미안해요\n→ 괜찮아요 (It\'s okay)\n실례합니다 — Excuse me'},
  {k:['처음만날때','first meeting','처음뵙겠습니다','자기소개인사'],r:'처음 만날 때:\n처음 뵙겠습니다 — Nice to meet you\n잘 부탁드립니다 — I look forward to working with you\n저는 [이름]입니다 — I am [name]\n→ 고개 숙여 인사해요 (bow)'},
  {k:['직장인사','work greeting','출근','퇴근','수고'],r:'직장 인사:\n출근: 안녕하세요! / 좋은 아침이에요!\n점심: 맛있게 드세요!\n퇴근: 수고하셨습니다! / 먼저 가겠습니다!\n조선소에서 매일 쓰는 표현이에요.'},
 ],
 'L0L8':[
  {k:['나라이름','나라목록','country name','베트남필리핀'],r:'나라 이름:\n베트남 Vietnam / 필리핀 Philippines\n인도네시아 Indonesia / 미얀마 Myanmar\n캄보디아 Cambodia / 태국 Thailand\n스리랑카 Sri Lanka / 네팔 Nepal'},
  {k:['~사람이에요','국적표현','i am from','출신','nationality'],r:'국적 말하기:\n저는 베트남 사람이에요. — I\'m Vietnamese.\n저는 필리핀 출신이에요. — I\'m from Philippines.\n어느 나라에서 왔어요? — Where are you from?\n저는 ___에서 왔어요. — I\'m from ___.'},
  {k:['언어이름','language','한국어영어베트남어','말할줄아는'],r:'언어 이름:\n한국어 Korean / 영어 English\n베트남어 Vietnamese / 타갈로그어 Tagalog\n인도네시아어 Indonesian / 버마어 Burmese\n저는 베트남어를 해요. — I speak Vietnamese.'},
  {k:['국적묻기','어디서왔어요','where are you from','나라묻기'],r:'국적 묻고 답하기:\n어느 나라 사람이에요? — What country are you from?\n어디에서 왔어요? — Where did you come from?\n저는 [나라] 사람이에요.\n한국에 온 지 얼마나 됐어요? — How long in Korea?'},
  {k:['내나라소개','나라소개','introducing country','고향'],r:'내 나라 소개 패턴:\n저는 [나라] [도시] 출신이에요.\n저의 나라는 [특징]이에요.\n예: 저는 베트남 하노이 출신이에요.\n한화오션에 [나라]사람이 많아요!'},
 ],
 'L0L9':[
  {k:['여기거기저기','here there','장소지시어','여기거기'],r:'장소 지시어:\n여기 — Here (말하는 사람 근처)\n거기 — There (듣는 사람 근처)\n저기 — Over there (둘 다 멀리)\n저기 화장실이에요. — The restroom is over there.'},
  {k:['이것그것저것','this that','물건지시어','이거그거저거'],r:'물건 지시어:\n이것/이거 — This (가까이)\n그것/그거 — That (듣는 사람 쪽)\n저것/저거 — That over there (멀리)\n이거 얼마예요? — How much is this?'},
  {k:['이그저+명사','demonstrative noun','이분그분','이책그책'],r:'이/그/저 + 명사:\n이 사람 — this person\n그 공구 — that tool\n저 건물 — that building (far)\n이 헬멧 쓰세요. — Please wear this helmet.'},
  {k:['어디예요','where is','위치묻기','어딨어요'],r:'위치 묻기:\n화장실이 어디예요? — Where is the restroom?\n식당이 어디에 있어요? — Where is the cafeteria?\n저기에 있어요. — It\'s over there.\n오른쪽/왼쪽/직진 — right/left/straight'},
  {k:['지시어연습','지시어대화','demonstrative practice','지시어예문'],r:'지시어 대화 연습:\nA: 이게 뭐예요? (What is this?)\nB: 그건 용접기예요. (That\'s a welder.)\nA: 저기가 어디예요?\nB: 저기가 안전실이에요.\n현장에서 연습해보세요!'},
 ],
 'L0L10':[
  {k:['안전표현','safety expression','안전용어','위험조심'],r:'안전 기본 표현:\n위험 Danger / 조심하세요 Be careful\n안전모 Hard hat / 안전화 Safety shoes\n소화기 Fire extinguisher\n비상구 Emergency exit / 금지 Prohibited\n착용 Wear/Put on'},
  {k:['비상상황','emergency','대피','화재fire','119'],r:'비상 상황:\n화재 Fire → 119 신고하세요\n대피하세요 Evacuate!\n도와주세요 Help me!\n빨리 Hurry!\n비상구로 나가세요 — Use the emergency exit\n침착하게 대피하세요!'},
  {k:['kiip프로그램','사회통합프로그램','kiip이란','what is kiip'],r:'KIIP = 사회통합프로그램\n외국인을 위한 한국어+사회 교육\n무료로 수강 가능!\n이수하면 귀화/영주권 신청 시 가산점\nKIIP = Korean Immigration & Integration Program'},
  {k:['kiip단계','kiip level','0단계1단계','kiip과정'],r:'KIIP 단계:\n0단계 기초 (15H) → 지금 여기!\n1단계 초급1 (100H)\n2단계 초급2 (100H)\n3단계 중급1 (100H)\n4단계 중급2 (100H)\n5단계 고급 (82H)\n사전평가로 단계 결정'},
  {k:['귀화','영주권','naturalization','permanent residence','비자','visa'],r:'귀화/영주권과 KIIP:\nKIIP 이수 → 귀화 필기시험 면제\n영주권 신청 시 가산점\n귀화 신청 전 5단계 완료 권장\n더 자세한 정보: 출입국외국인청\nImmigration office for details!'},
 ],
 'L1L1':[
  {k:['자기소개만들기','self intro','저는~입니다','introduce yourself','소개패턴'],r:'자기소개 패턴:\n저는 [이름]이에요/입니다.\n저는 [나라] 사람이에요.\n직업은 [직업]이에요.\n예: 저는 민입니다. 베트남 사람이에요. 직업은 용접공이에요.\nHello! I am [name] from [country].'},
  {k:['이에요예요차이','이에요vs예요','이에요 예요','is am are'],r:'이에요 vs 예요:\n자음으로 끝나면: 학생이에요\n모음으로 끝나면: 의사예요\n용접공이에요 (ㅇ받침→이에요)\n도장공이에요 / 배관공이에요\nConsonant→이에요, Vowel→예요'},
  {k:['은는사용법','topic marker','은는조사','은 는 차이'],r:'은/는 = 주제 표시 (Topic marker):\n자음 뒤: 학생은, 밥은\n모음 뒤: 저는, 의사는\n저는 한화오션에서 일해요.\n직업은 용접공이에요.\nUse 은 after consonant, 는 after vowel'},
  {k:['나라직업어휘','나라이름직업','country job vocabulary','직업단어'],r:'나라+직업 어휘:\n나라: 베트남 필리핀 인도네시아 미얀마 캄보디아\n직업: 용접공(welder) 배관공(pipe fitter)\n도장공(painter) 전기공(electrician)\n기계공(mechanic) 크레인기사(crane operator)'},
  {k:['인사연습','greeting practice','출근인사','안녕연습'],r:'인사 표현 연습:\n출근: 안녕하세요! 좋은 아침이에요!\n식사: 맛있게 드세요!\n감사: 감사합니다!\n퇴근: 수고하셨습니다!\n조선소에서 매일 이 표현을 써보세요!'},
 ],
 'L1L2':[
  {k:['이것그것저것','this that those','이거뭐예요','물건가리키기'],r:'이것(이거) — This (가까이)\n그것(그거) — That (상대방 쪽)\n저것(저거) — That over there\n이게 뭐예요? What is this?\n그게 얼마예요? How much is that?'},
  {k:['도구이름','공구이름','tool name','조선소도구'],r:'조선소 도구 이름:\n용접기 welder / 그라인더 grinder\n드릴 drill / 스패너 spanner\n안전모 helmet / 장갑 gloves\n보호경 goggles / 로프 rope\n이 도구 이름이 뭐예요?'},
  {k:['~이뭐예요','뭐예요','what is this','이름묻기'],r:'"~이/가 뭐예요?" — What is this/that?\n이게 뭐예요? — What is this?\n저게 한국어로 뭐예요? — What\'s that in Korean?\n그거 어디 있어요? — Where is that?\n모르면 물어보세요!'},
  {k:['의문문만들기','question form','한국어질문','어떻게질문'],r:'의문문 패턴:\n뭐예요? What is it?\n어디예요? Where is it?\n얼마예요? How much?\n언제예요? When is it?\n누구예요? Who is it?\n이게 뭐예요? 저기가 어디예요?'},
  {k:['조선소어휘','shipyard vocabulary','현장단어','작업장용어'],r:'조선소 기본 어휘:\n작업장 workplace / 현장 work site\n안전 safety / 장비 equipment\n선박 ship / 도크 dock\n감독관 supervisor / 팀장 team leader\n교대 shift / 야간작업 night shift'},
 ],
 'L1L3':[
  {k:['에있어요없어요','location is','~에있어요','어디에있어요'],r:'"에 있어요/없어요" — Location!\n화장실이 2층에 있어요. (Restroom is on 2F)\n감독관이 사무실에 없어요. (Supervisor not in office)\n어디에 있어요? — Where is it?\n있어요=is there / 없어요=is not there'},
  {k:['위치표현','위아래앞뒤','position words','위치단어'],r:'위치 표현:\n위 above / 아래 below / 앞 front / 뒤 back\n오른쪽 right / 왼쪽 left / 옆 beside\n안 inside / 밖 outside / 사이 between\n공구가 박스 안에 있어요. — Tools are inside the box.'},
  {k:['어디에있어요','where is','위치묻기','찾기'],r:'위치 묻고 답하기:\nA: 식당이 어디에 있어요?\nB: 식당이 3층에 있어요.\nA: 화장실이 어디예요?\nB: 저쪽으로 직진하세요.\n직진 straight / 오른쪽 right / 왼쪽 left'},
  {k:['방향말하기','direction','길안내','어떻게가요'],r:'방향 표현:\n직진하세요 Go straight\n오른쪽으로 가세요 Turn right\n왼쪽으로 가세요 Turn left\n저기에 있어요 It\'s over there\n계단 stairs / 엘리베이터 elevator'},
  {k:['장소표현','직장장소','workplace location','어디서일해'],r:'직장 장소 표현:\n저는 3도크에서 일해요. — I work in Dock 3.\n사무실이 본관 2층에 있어요.\n저는 용접 구역에 있어요.\n휴게실이 어디예요? — Where is the break room?'},
 ],
 'L1L4':[
  {k:['몇시예요','what time','시간묻기','지금몇시'],r:'시간 묻기:\n지금 몇 시예요? — What time is it now?\n[숫자] 시 [숫자] 분이에요.\n1시=한 시 / 2시=두 시 (고유어!)\n분(min): 일 이 삼... (한자어)\n지금 두 시 삼십 분이에요. (2:30)'},
  {k:['오전오후밤','am pm night','아침점심저녁','시간대'],r:'시간대 표현:\n오전 AM / 오후 PM\n아침 morning (6~10시)\n점심 noon (11~14시)\n저녁 evening (17~21시)\n밤 night\n오전 8시에 출근해요. I start at 8am.'},
  {k:['요일표현','days of week','월화수목금','무슨요일'],r:'요일:\n월(Mon) 화(Tue) 수(Wed) 목(Thu)\n금(Fri) 토(Sat) 일(Sun)\n오늘 무슨 요일이에요? — What day is today?\n이번 주 금요일에 = this Friday'},
  {k:['~에시간','time particle','시간에','언제에'],r:'시간 표현 "에":\n8시에 출근해요. — Start at 8.\n월요일에 회의가 있어요. — Meeting on Monday.\n언제 = When?\n몇 시에 = At what time?\n점심에 뭐 먹어요? — What for lunch?'},
  {k:['근무시간','work schedule','교대시간','몇시출근'],r:'근무 시간 표현:\n저는 아침 8시에 출근해요.\n저는 오후 5시에 퇴근해요.\n교대 근무 shift work: 주간/야간\n점심 시간은 12시부터 1시까지예요.\n휴게 시간 break time'},
 ],
 'L1L5':[
  {k:['얼마예요','how much','가격묻기','얼마','price'],r:'가격 묻기:\n얼마예요? — How much is it?\n이게 얼마예요? — How much is this?\n총 얼마예요? — What\'s the total?\n너무 비싸요 — Too expensive\n조금 싸게 해주세요 — A little cheaper please'},
  {k:['원읽기','won amount','만원천원','금액읽기'],r:'원(₩) 금액 읽기:\n1,000원 = 천 원\n10,000원 = 만 원\n50,000원 = 오만 원\n월급 표현: 이백오십만 원 = 2,500,000원\n거스름돈 = change'},
  {k:['주세요사용법','please give','주세요','~주세요'],r:'"주세요" — Please give me:\n물 주세요. Water please.\n영수증 주세요. Receipt please.\n이거 주세요. This one please.\n[물건] 하나 주세요. One [item] please.\n안전모 주세요 — Safety helmet please'},
  {k:['거스름돈','change money','잔돈','영수증'],r:'돈 거래 표현:\n거스름돈 — Change\n영수증 주세요. — Receipt please.\n카드 돼요? — Card OK?\n현금 cash / 카드 card\n잔돈이 없어요. — No change available.'},
  {k:['쇼핑기본','shopping basic','마트에서','편의점에서'],r:'기본 쇼핑 대화:\nA: 이거 얼마예요?\nB: 오천 원이에요.\nA: 이거 주세요.\nB: 감사합니다!\n편의점, 마트, 구내 매점에서 연습해보세요!'},
 ],
 'L1L6':[
  {k:['메뉴주문','ordering food','음식주문','주문하기'],r:'음식 주문:\n[메뉴] 주세요. — Please give me [menu].\n[메뉴] 하나 주세요. — One [menu] please.\n이거 뭐예요? — What is this?\n추천해 주세요. — Please recommend.\n영어 메뉴 있어요? — English menu?'},
  {k:['맛표현','taste expression','맛있어요','맵다달다'],r:'맛 표현:\n맛있어요 Delicious / 맛없어요 Not tasty\n매워요 Spicy / 달아요 Sweet\n짜요 Salty / 싱거워요 Bland\n시어요 Sour / 써요 Bitter\n너무 매워요. — Too spicy!'},
  {k:['음식이름','korean food','한국음식','식당메뉴'],r:'한국 음식 이름:\n밥 rice / 국 soup / 찌개 stew\n김치 kimchi / 된장찌개 soybean stew\n비빔밥 bibimbap / 불고기 bulgogi\n삼겹살 pork belly / 라면 ramen\n식당에서 읽어보세요!'},
  {k:['알레르기','allergy','못먹어요','먹을수없어요'],r:'알레르기/음식 제한:\n저는 [음식]을 못 먹어요. — I can\'t eat [food].\n[음식] 알레르기 있어요. — I have [food] allergy.\n돼지고기 못 먹어요 — Can\'t eat pork\n채식주의자예요 — I\'m vegetarian'},
  {k:['식당예절','restaurant manner','식사예절','밥먹을때'],r:'한국 식당 예절:\n어른에게 먼저 드세요. — Elders eat first.\n잘 먹겠습니다 — Before eating\n잘 먹었습니다 — After eating\n음식을 남기지 마세요. — Don\'t waste food.\n공기밥 더 주세요 — More rice please'},
 ],
 'L1L7':[
  {k:['뭐해요','주말활동','what do you do','weekend activity'],r:'주말 활동 묻기:\n주말에 뭐 해요? — What do you do on weekends?\n보통 뭐 해요? — What do you usually do?\n취미가 뭐예요? — What is your hobby?\n저는 주말에 [활동]해요.'},
  {k:['활동동사','activity verb','운동하다','등산하다'],r:'활동 동사:\n운동하다 exercise / 등산하다 hike\n영화보다 watch movie / 요리하다 cook\n쇼핑하다 shop / 청소하다 clean\n쉬다 rest / 친구만나다 meet friends\n저는 주말에 운동해요.'},
  {k:['같이하자','let us','같이~해요','함께'],r:'"같이 ~해요?" — Shall we do together?\n같이 밥 먹어요. — Let\'s eat together.\n같이 운동할까요? — Shall we exercise?\n같이 가요! — Let\'s go together!\n동료와 같이 해보세요!'},
  {k:['좋아해요싫어해요','like dislike','좋아해','싫어해'],r:'좋아하다 / 싫어하다:\n저는 [활동]을 좋아해요. — I like [activity].\n저는 [활동]을 싫어해요. — I dislike [activity].\n저는 운동을 좋아해요.\n한국 음식을 좋아해요? — Do you like Korean food?'},
  {k:['주말계획','weekend plan','이번주말','다음주말'],r:'주말 계획 말하기:\n이번 주말에 뭐 해요? — Plans this weekend?\n저는 [장소]에 가요. — I\'m going to [place].\n저는 쉬어요. — I\'m resting.\n가족에게 전화해요. — I call my family.'},
 ],
 'L1L8':[
  {k:['날씨표현','weather expression','날씨어때요','오늘날씨'],r:'날씨 표현:\n맑아요 Sunny / 흐려요 Cloudy\n비 와요 Raining / 눈 와요 Snowing\n바람 불어요 Windy / 안개 끼어요 Foggy\n더워요 Hot / 추워요 Cold / 시원해요 Cool'},
  {k:['계절이름','seasons','봄여름가을겨울','한국계절'],r:'한국 계절:\n봄 Spring (3~5월) — 따뜻해요\n여름 Summer (6~8월) — 더워요, 비 많아요\n가을 Autumn (9~11월) — 시원해요\n겨울 Winter (12~2월) — 추워요\n한국 여름은 습해요 — humid!'},
  {k:['날씨어때요','how is weather','날씨묻기','오늘어때'],r:'날씨 묻고 답하기:\nA: 오늘 날씨 어때요?\nB: 오늘 맑고 따뜻해요.\nA: 내일 비 와요?\nB: 네, 비 온대요.\n날씨 앱: 오늘 최고 ___도예요.'},
  {k:['날씨옷입기','weather clothing','옷입어요','무슨옷'],r:'날씨+옷 입기:\n더울 때: 반팔, 반바지\n추울 때: 패딩, 장갑, 목도리\n비 올 때: 우산, 우비\n작업장: 안전복 항상 착용!\n현장은 날씨 관계없이 안전복 필수'},
  {k:['날씨대화','weather conversation','날씨연습','날씨이야기'],r:'날씨 대화 연습:\nA: 오늘 많이 덥네요!\nB: 맞아요. 물 많이 드세요.\nA: 내일은 어때요?\nB: 태풍이 온대요. 조심하세요!\n태풍 typhoon / 폭염 heat wave'},
 ],
 'L1L9':[
  {k:['신체부위','body part','어디아파요','몸부위'],r:'신체 부위:\n머리 head / 눈 eye / 귀 ear\n코 nose / 입 mouth / 목 neck\n어깨 shoulder / 팔 arm / 손 hand\n등 back / 배 stomach / 다리 leg\n발 foot / 손가락 finger'},
  {k:['아파요표현','expressing pain','어디아파요','다쳤어요'],r:'아픔 표현:\n아파요. — It hurts.\n[부위]가 아파요. — My [body part] hurts.\n다쳤어요. — I\'m injured.\n머리가 아파요 headache\n배가 아파요 stomachache\n어디가 아파요? — Where does it hurt?'},
  {k:['병원가야해','need hospital','응급','구급차'],r:'병원 표현:\n병원에 가야 해요. — I need to go to the hospital.\n구급차 불러주세요. — Call an ambulance.\n119 = 응급전화 Emergency\n산재 병원 = 산업재해 병원\n다쳤으면 즉시 신고하세요!'},
  {k:['약먹어요','taking medicine','약국','처방전'],r:'약 표현:\n약을 먹어요. — Take medicine.\n약국 pharmacy\n처방전 prescription\n소화제 digestive medicine\n두통약 headache medicine\n약 하루에 몇 번 먹어요? — How many times a day?'},
  {k:['작업장건강','workplace health','안전건강','산재'],r:'작업장 건강 안전:\n작업 전 몸 상태 확인하세요\n수분 충분히 섭취하세요\n무거운 물건은 팀으로 들어요\n안전장비 항상 착용!\n이상 증상 → 즉시 팀장에게 보고\nReport any injury immediately!'},
 ],
 'L1L10':[
  {k:['전화받기','answering phone','여보세요','전화수신'],r:'전화 받기:\n여보세요? — Hello? (전화)\n네, [이름]입니다. — Yes, this is [name].\n잠깐만요. — Just a moment.\n다시 말씀해 주세요. — Please say again.\n잘 안 들려요. — I can\'t hear well.'},
  {k:['전화걸기','making call','전화하기','연락하기'],r:'전화 걸기:\n[이름]씨 있어요? — Is [name] there?\n저는 [이름]인데요. — This is [name].\n메시지 남겨도 될까요? — Can I leave a message?\n나중에 다시 전화할게요. — I\'ll call back later.'},
  {k:['카카오톡','kakaotalk','카톡','메신저'],r:'카카오톡(카톡) 표현:\n카톡 보냈어요. — I sent a KakaoTalk message.\n사진 보내줘요. — Send me a photo.\n카톡으로 연락해요. — Contact via KakaoTalk.\n카톡 아이디 알려주세요. — Tell me your KakaoTalk ID.\n읽었어요 — Read it'},
  {k:['문자표현','text message','문자보내기','sms'],r:'문자/메시지 표현:\n문자 보낼게요. — I\'ll send a text.\n확인했어요. — Confirmed/Checked.\n알겠어요. — Got it / Understood.\n내일 봐요 — See you tomorrow\n늦을 것 같아요 — I might be late'},
  {k:['전화어려울때','phone difficult','한국어전화','전화팁'],r:'전화가 어려울 때:\n천천히 말씀해 주세요. — Please speak slowly.\n다시 말씀해 주세요. — Please repeat.\n잘 모르겠어요. — I\'m not sure.\n문자로 보내주세요. — Please send a text.\n동료에게 도움을 요청하세요!'},
 ],
 'L1L11':[
  {k:['가족이름','family name','가족호칭','부모형제'],r:'가족 이름:\n아버지/아빠 father / 어머니/엄마 mother\n형 older brother(남→남) / 누나 older sis(남→여)\n오빠 older bro(여→남) / 언니 older sis(여→여)\n남동생 younger bro / 여동생 younger sis\n아들 son / 딸 daughter'},
  {k:['가족소개','introducing family','가족있어요','몇명'],r:'가족 소개:\n저는 가족이 몇 명 있어요? — How many family members?\n저는 4인 가족이에요. — Family of 4.\n부모님이 베트남에 계세요. — Parents are in Vietnam.\n가족이 그리워요. — I miss my family.'},
  {k:['친척호칭','relative','삼촌이모고모','친척이름'],r:'친척 호칭:\n할아버지 grandfather / 할머니 grandmother\n삼촌 uncle (부계) / 이모 aunt (모계)\n고모 aunt (부계) / 외삼촌 uncle (모계)\n사촌 cousin\n한국 호칭은 복잡해요 — Korean terms are complex!'},
  {k:['가족수','family size','형제자매','몇남몇녀'],r:'가족 수 표현:\n저는 외동이에요. — I\'m an only child.\n형제가 둘이에요. — 2 brothers/siblings.\n1남 1녀예요. — 1 son, 1 daughter.\n대가족이에요. — Big family.\n가족이 어디에 있어요?'},
  {k:['가족대화','family conversation','가족전화','가족연락'],r:'가족 대화 표현:\n부모님께 자주 전화해요. — Call parents often.\n고향이 그리워요. — I miss home.\n가족이 건강해요. — Family is healthy.\n돈을 고향에 보내요. — Send money home.\n카카오톡으로 영상통화해요!'},
 ],
 'L1L12':[
  {k:['았었어요만들기','past tense','과거형','~았어요~었어요'],r:'과거형 만들기 (~았/었어요):\n아/오 모음 → 았어요: 먹다→먹었어요 (X) 가다→갔어요\n그 외 → 었어요: 먹다→먹었어요 마시다→마셨어요\n하다 → 했어요\n예: 어제 일했어요. — I worked yesterday.'},
  {k:['불규칙동사','irregular verb','ㄷ불규칙','르불규칙'],r:'불규칙 동사 (과거):\nㄷ불규칙: 듣다→들었어요\nㄹ불규칙: 알다→알았어요\n르불규칙: 모르다→몰랐어요\n하다: 했어요\n오다→왔어요 / 보다→봤어요'},
  {k:['어제지난주','yesterday last week','과거시간','전에'],r:'과거 시간 표현:\n어제 yesterday / 그저께 day before\n지난주 last week / 지난달 last month\n작년 last year / 예전에 before\n아까 a while ago / ~전에 [time] ago\n어제 무엇을 했어요?'},
  {k:['과거경험','past experience','해봤어요','~본적있어요'],r:'과거 경험 표현:\n~해봤어요 — I\'ve tried/done [activity]\n한국 음식 먹어봤어요? — Tried Korean food?\n서울에 가봤어요. — I\'ve been to Seoul.\n이 일을 3년 했어요. — Worked 3 years.'},
  {k:['과거연습','past practice','어제뭐했어요','과거이야기'],r:'과거 시제 대화:\nA: 어제 뭐 했어요?\nB: 친구랑 밥 먹었어요.\nA: 주말에 어디 갔어요?\nB: 부산에 여행 갔어요.\n동료와 과거 이야기를 해보세요!'},
 ],
 'L1L13':[
  {k:['버스타기','taking bus','버스어떻게','버스번호'],r:'버스 이용:\n몇 번 버스 타요? — Which bus number?\n이 버스 [장소] 가요? — Does this go to [place]?\n여기서 내려주세요. — Stop here please.\n버스 카드 교통카드 T-money\n버스 요금 bus fare'},
  {k:['지하철이용','subway','지하철역','전철'],r:'지하철 이용:\n[역] 역까지 얼마예요? — How much to [station]?\n몇 호선이에요? — Which line?\n환승하세요. — Transfer here.\n교통카드 tap / 개찰구 gate\n지하철 앱 사용하세요 — Use subway app!'},
  {k:['어떻게가요','how to get there','교통방법','가는방법'],r:'교통 묻기:\n[장소]에 어떻게 가요? — How do I get to [place]?\n버스 타세요. Take a bus.\n지하철 타세요. Take the subway.\n걸어가요. Walk.\n택시 타세요. Take a taxi.\n네이버맵/카카오맵 사용하세요!'},
  {k:['요금내기','paying fare','교통비','카드현금'],r:'교통 요금:\n교통카드 충전: 편의점에서 가능\n버스: 약 1,300원\n지하철: 1,400원~거리 추가\n버스→지하철 환승 할인!\n교통카드 없으면 현금도 OK'},
  {k:['교통표현','transportation expression','정류장','노선'],r:'교통 표현:\n정류장 bus stop / 역 station\n노선 route / 환승 transfer\n종점 last stop / 막차 last train/bus\n차 막혀요 Traffic jam\n택시 앱: 카카오택시 / T맵 택시'},
 ],
 'L1L14':[
  {k:['옷쇼핑','clothes shopping','옷가게','의류'],r:'옷 쇼핑:\n이거 입어봐도 돼요? — Can I try this on?\n탈의실 어디예요? — Where is the fitting room?\n이 색깔 다른 거 있어요? — Other colors?\n더 큰/작은 거 있어요? — Bigger/smaller?'},
  {k:['사이즈색깔','size color','치수색상','색이름'],r:'사이즈:\nS(스몰) M(미디엄) L(라지) XL(엑스라지)\n치수: 90 95 100 105\n색깔: 빨간색 파란색 검은색 흰색\n노란색 초록색 회색 갈색\n이 색 좋아요!'},
  {k:['교환환불','exchange refund','반품','영수증교환'],r:'교환/환불:\n교환하고 싶어요. — I want to exchange.\n환불해 주세요. — Refund please.\n영수증 있어요? — Do you have receipt?\n불량품이에요. — It\'s defective.\n7일 이내 교환 가능 — 7 days exchange'},
  {k:['온라인쇼핑','online shopping','쿠팡','배달'],r:'온라인 쇼핑:\n쿠팡, 11번가, G마켓 — popular shopping apps\n배달 delivery / 택배 parcel\n언제 도착해요? — When does it arrive?\n반품 신청 — Apply for return\n리뷰 남기기 — Leave a review'},
  {k:['쇼핑대화','shopping dialogue','가게에서','마트에서'],r:'쇼핑 대화:\nA: 이거 얼마예요?\nB: 3만 원이에요.\nA: 조금 싸게 해주세요.\nB: 2만 8천 원 드릴게요.\nA: 이거 주세요!\n흥정하기 = bargaining!'},
 ],
 'L1L15':[
  {k:['약속잡기','making appointment','언제만나요','약속정하기'],r:'약속 잡기:\n언제 시간 있어요? — When are you free?\n[요일/시간]에 어때요? — How about [day/time]?\n좋아요! 그때 봐요! — Great! See you then!\n어디서 만나요? — Where shall we meet?\n약속 잡았어요 — Made an appointment'},
  {k:['으ㄹ게요','으ㄹ게요문법','ㄹ게요','promise form'],r:'"(으)ㄹ게요" — 약속/의지 표현:\n내일 갈게요. — I\'ll go tomorrow.\n제가 할게요. — I\'ll do it.\n늦지 않을게요. — I won\'t be late.\n연락할게요. — I\'ll contact you.\n모음→ㄹ게요 / 자음→을게요'},
  {k:['시간장소정하기','setting time place','몇시에','어디서'],r:'시간/장소 정하기:\n오후 2시에 만나요. — Meet at 2pm.\n[장소]에서 만나요. — Meet at [place].\n회사 정문에서 만나요. — At the main gate.\n카카오톡으로 알려줄게요. — I\'ll let you know via KakaoTalk.'},
  {k:['약속확인','confirm appointment','약속확인하기','맞죠'],r:'약속 확인:\n내일 약속 맞죠? — Tomorrow\'s appointment is right?\n몇 시였죠? — What time was it?\n잊지 마세요! — Don\'t forget!\n미리 알려줘요. — Let me know in advance.\n캘린더에 저장해요.'},
  {k:['약속변경취소','change cancel appointment','못가요','일정변경'],r:'약속 변경/취소:\n약속을 변경해도 될까요? — Can I reschedule?\n죄송해요, 못 갈 것 같아요. — Sorry, can\'t make it.\n다음에 다시 잡아요. — Let\'s reschedule.\n갑자기 일이 생겼어요. — Something came up.'},
 ],
 'L1L16':[
  {k:['기숙사생활','dormitory life','기숙사규칙','숙소생활'],r:'기숙사 생활:\n기숙사 사용 규칙을 지켜요.\n소음 주의하세요 — Be quiet after hours.\n쓰레기 분리수거 하세요.\n공용 화장실/주방 함께 사용해요.\n기숙사 사용료 dormitory fee'},
  {k:['방구하기','finding room','집구하기','월세전세'],r:'방 구하기:\n방 있어요? — Is there a room available?\n월세 monthly rent / 전세 lump sum lease\n보증금 deposit / 관리비 maintenance fee\n부동산 real estate agency\n얼마예요? 계약서 써요? — Contract?'},
  {k:['집관련표현','house expression','집어휘','방주방'],r:'집 관련 어휘:\n방 room / 거실 living room\n부엌/주방 kitchen / 화장실 bathroom\n베란다 balcony / 창문 window\n에어컨 AC / 보일러 boiler/heater\n엘리베이터 elevator / 계단 stairs'},
  {k:['이웃인사','greeting neighbor','이웃과인사','층간소음'],r:'이웃과 인사:\n안녕하세요! — Hello!\n잘 부탁드립니다. — Nice to meet you.\n층간 소음 조심하세요. — Mind the noise.\n소음이 심해요. — It\'s too noisy.\n문제가 있으면 관리실에 연락해요.'},
  {k:['주거규칙','housing rules','집규칙','퇴실'],r:'주거 규칙:\n입실/퇴실 시 점검하세요.\n파손 시 변상해야 해요. — Pay for damage.\n외부인 출입 시 신고해요.\n청소 당번 cleaning schedule\n계약 만료 전 통보해요. — Notice before leaving.'},
 ],
 'L1L17':[
  {k:['취미말하기','hobby','취미뭐예요','좋아하는것'],r:'취미 말하기:\n취미가 뭐예요? — What\'s your hobby?\n저는 [활동]을 좋아해요.\n저는 주말에 [활동]해요.\n예: 저는 축구를 좋아해요.\n취미로 [활동]을 해요.'},
  {k:['얼마나자주','how often','주기표현','자주가끔'],r:'빈도 표현:\n매일 every day / 매주 every week\n자주 often / 가끔 sometimes\n거의 안 해요 rarely\n일주일에 한 번 once a week\n저는 주말마다 운동해요.'},
  {k:['잘해요못해요','can cannot','~을잘해요','실력표현'],r:'실력 표현:\n저는 [활동]을 잘해요. — I\'m good at [activity].\n저는 [활동]을 못해요. — I\'m not good at [activity].\n조금 할 줄 알아요. — I know a little.\n배우고 싶어요. — I want to learn.'},
  {k:['새취미배우기','learning new hobby','배우고싶어요','어디배워요'],r:'새 취미 배우기:\n어디서 배울 수 있어요? — Where can I learn?\n학원 academy / 유튜브 YouTube\n무료 강좌 free class\n외국인 문화 센터 cultural center\n취미 교실에 참여해보세요!'},
  {k:['취미대화','hobby conversation','취미이야기','같이취미'],r:'취미 대화:\nA: 취미가 뭐예요?\nB: 저는 배드민턴을 좋아해요.\nA: 같이 해요!\nB: 좋아요! 언제 할까요?\n동료와 함께 취미를 즐겨보세요!'},
 ],
 'L1L18':[
  {k:['외국인등록증','alien registration','외국인등록','등록증'],r:'외국인등록증:\n한국 체류 90일 이상 → 필수 발급\n출입국외국인청 방문\n필요서류: 여권, 사진, 신청서\n발급 기간: 약 2~3주\n항상 소지하세요!'},
  {k:['서류신청','document application','서류제출','신청방법'],r:'서류 신청 표현:\n신청서를 작성해 주세요. — Please fill out the form.\n서류를 제출해 주세요. — Submit documents.\n언제 받을 수 있어요? — When can I get it?\n안내해 주세요. — Please guide me.'},
  {k:['비자종류','visa type','비자연장','체류자격'],r:'비자 종류 (조선소 관련):\nE-9 비제조업 취업 비자\nE-7 특정활동 비자\nH-2 방문취업 비자\n비자 연장: 만료 3개월 전 신청\n고용주가 도와줄 수 있어요.'},
  {k:['서류작성','form filling','양식작성','신청서쓰기'],r:'서류 작성 표현:\n이름 name / 생년월일 date of birth\n주소 address / 연락처 contact\n국적 nationality / 서명 signature\n모르면 직원에게 물어보세요.\n도장 stamp / 사인 signature'},
  {k:['행정표현','administrative','민원','공공기관'],r:'행정 표현:\n출입국외국인청 Immigration Office\n고용노동부 Ministry of Employment\n건강보험공단 NHIS\n민원 신청 civil petition\n통역 도움 요청하세요 — Ask for interpreter!'},
 ],
 'L1L19':[
  {k:['한국예절','korean manner','기본예절','예의'],r:'한국 기본 예절:\n어른께 먼저 인사해요 — Greet elders first\n두 손으로 물건 받아요 — Use both hands\n어른 앞에서 술 돌려 마셔요 (고개 돌리기)\n공공장소에서 조용히 해요\n존댓말 사용 — Use formal speech'},
  {k:['식사예절','dining manner','밥먹을때','식탁예절'],r:'식사 예절:\n어른이 먼저 드세요. — Elders eat first.\n잘 먹겠습니다 — Before eating\n잘 먹었습니다 — After eating\n소리 내며 먹지 마세요.\n음식 남기지 마세요.\n술: 두 손으로 받아요.'},
  {k:['명절휴일','holiday festival','추석설날','공휴일'],r:'한국 명절/공휴일:\n설날 Seollal (음력 1/1) — 새해\n추석 Chuseok (음력 8/15) — 추수감사\n어린이날 Children\'s Day (5/5)\n광복절 Liberation Day (8/15)\n크리스마스 Christmas (12/25)'},
  {k:['직장문화','workplace culture','한국직장','회사문화'],r:'한국 직장 문화:\n상사에게 존댓말 사용\n야근 있을 수 있어요\n회식 company dinner — 참여 중요\n선배에게 먼저 인사\n팀워크 중시 — Team first!\n모르면 물어보세요.'},
  {k:['한국생활팁','korean life tip','한국에서생활','생활팁'],r:'한국 생활 팁:\n대중교통 — 교통카드 사용\n편의점 24시간 이용 가능\n배달앱: 배달의민족, 쿠팡이츠\n병원 — 건강보험 적용\n한국어 배우면 생활이 편해져요!\nGoogle Translate 활용!'},
 ],
 'L1L20':[
  {k:['으ㄹ거예요만들기','future tense','미래형','~ㄹ거예요'],r:'미래 표현 "(으)ㄹ 거예요":\n모음/ㄹ 끝 → ㄹ 거예요\n예: 가다→갈 거예요, 살다→살 거예요\n자음 끝 → 을 거예요\n예: 먹다→먹을 거예요\n내일 일할 거예요. — I will work tomorrow.'},
  {k:['계획말하기','describing plans','앞으로계획','무슨계획'],r:'계획 표현:\n저는 [동사]ㄹ 거예요. — I plan to [verb].\n다음 달에 한국어 시험을 볼 거예요.\n올해 KIIP를 완료할 거예요.\n내년에 가족을 데려올 거예요.\n계획이 있어요? — Do you have plans?'},
  {k:['희망꿈표현','hope dream','~고싶어요','원해요'],r:'희망 표현:\n~고 싶어요 — I want to...\n한국어를 잘 하고 싶어요. — Want to speak Korean well.\n기술자격증을 따고 싶어요. — Get certification.\n가족과 함께 살고 싶어요.\n꿈을 이루세요! — Pursue your dream!'},
  {k:['미래목표','future goal','목표말하기','앞으로'],r:'미래 목표:\n저의 목표는 [목표]예요.\n5년 후에 [목표]할 거예요.\n한국어 능숙하게 할 거예요.\n기술 향상시킬 거예요.\n가족 행복하게 할 거예요.\n목표를 향해 화이팅!'},
  {k:['미래대화','future conversation','계획이야기','꿈이야기'],r:'미래 대화:\nA: 앞으로 어떤 계획이 있어요?\nB: 기술자 자격증을 딸 거예요.\nA: 정말요? 열심히 하세요!\nB: 네, 한국어도 더 배울 거예요.\n동료와 미래 이야기를 해보세요!'},
 ],
 'L2L1':[
  {k:['경력소개','career intro','자기소개경력','직장경력'],r:'경력 소개:\n저는 [직업]으로 [기간] 일했어요.\n[기술]을 할 줄 알아요.\n이전 직장에서 [경험]했어요.\n예: 저는 용접공으로 5년 일했어요.\nI have 5 years experience as a welder.'},
  {k:['으ㄴ는데문법','background contrast','~는데문법','ㄴ데는데'],r:'"(으)ㄴ/는데" — 배경/대조 표현:\n현재: 동사+는데 (바쁜데, 가는데)\n과거: 동사+(으)ㄴ데 (먹었는데)\n형용사+(으)ㄴ데 (바쁜데, 좋은데)\n예: 바쁜데 잠깐 얘기할 수 있어요?'},
  {k:['기술자격증','skill certificate','자격증','기술어필'],r:'기술/자격증 표현:\n저는 [기술] 기술이 있어요.\n[자격증] 자격증을 갖고 있어요.\n용접 자격증 welding certificate\n지게차 자격증 forklift license\n산업안전기사 industrial safety license'},
  {k:['직장경험','work experience','어디서일했어요','경험말하기'],r:'직장 경험 표현:\n[회사]에서 [기간] 일했어요.\n주요 업무는 [업무]예요.\n팀장으로 일한 경험이 있어요.\n안전 관리도 담당했어요.\n이전 경험을 적극 어필하세요!'},
  {k:['자기어필','selling yourself','강점말하기','잘하는것'],r:'자기 어필:\n저의 강점은 [강점]이에요.\n저는 성실하고 안전을 중시해요.\n빠르게 배워요 — I learn quickly.\n팀워크를 중요하게 생각해요.\n경험과 기술로 어필하세요!'},
 ],
 'L2L2':[
  {k:['직장전화받기','answering work call','여보세요직장','회사전화'],r:'직장 전화 받기:\n네, [회사명]입니다. — Yes, this is [company].\n누구세요? / 어디세요? — Who\'s calling?\n잠깐만요. — Please hold.\n바로 연결해 드릴게요. — I\'ll connect you now.\n메모 준비하세요!'},
  {k:['메모남기기','taking message','메모전달','전언'],r:'메모 남기기:\n메모 남겨도 될까요? — Can I leave a message?\n성함이 어떻게 되세요? — Your name please?\n연락처 알려주세요. — Your number please.\n전달해 드릴게요. — I\'ll pass the message.\n나중에 전화해 주세요. — Please call back later.'},
  {k:['전화연결','transferring call','연결해드릴게요','담당자연결'],r:'전화 연결:\n담당자에게 연결해 드릴게요. — I\'ll connect to the person in charge.\n잠깐 기다려 주세요. — Please wait a moment.\n자리에 없어요. — Not at their desk.\n다시 전화 주세요. — Please call again.\n이메일로 보내주세요.'},
  {k:['잠깐만요','hold on','기다려주세요','잠시만요'],r:'"잠깐만요" 표현:\n잠깐만요. — Just a moment.\n잠시만요. — One moment please.\n조금만 기다려 주세요. — Please wait a bit.\n곧 돌아올 거예요. — Will be back soon.\n천천히 말씀해 주세요. — Please speak slowly.'},
  {k:['부재중','missed call','자리비움','전화못받았어요'],r:'부재중 대응:\n부재중 전화가 왔어요. — Missed call.\n다시 전화드릴게요. — I\'ll call back.\n문자 남겨주세요. — Please leave a text.\n이메일 주소: [email]\n내일 전화드려도 될까요?'},
 ],
 'L2L3':[
  {k:['약속변경요청','reschedule','변경해도될까요','일정변경'],r:'약속 변경 요청:\n약속을 변경해도 될까요? — Can I reschedule?\n[날짜]로 변경하고 싶어요. — Want to change to [date].\n다른 날로 미뤄도 될까요? — Can we postpone?\n불편을 드려서 죄송해요. — Sorry for inconvenience.'},
  {k:['약속취소','cancel appointment','취소하기','못가요'],r:'약속 취소:\n약속을 취소해야 할 것 같아요. — Need to cancel.\n갑자기 일이 생겼어요. — Something came up.\n죄송하지만 못 갈 것 같아요. — Sorry, can\'t make it.\n다음에 다시 잡아요. — Let\'s reschedule.\n미리 알려줘서 감사해요.'},
  {k:['날짜요일표현','date day expression','날짜말하기','요일'],r:'날짜/요일 표현:\n월(Mon) 화(Tue) 수(Wed) 목(Thu) 금(Fri)\n이번 주 금요일 this Friday\n다음 주 월요일 next Monday\n며칠이에요? What date is it?\n3월 5일 = 삼월 오일'},
  {k:['회의일정잡기','schedule meeting','회의잡기','언제시간'],r:'회의 일정:\n언제 시간이 되세요? — When are you available?\n오후 2시 어때요? — How about 2pm?\n회의실을 예약할게요. — I\'ll book the meeting room.\n화상회의 video call 할까요?\n일정 확인하고 알려줄게요.'},
  {k:['는데복습','는데grammar review','는데연습','배경설명'],r:'"-는데" 복습:\n배경 설명: 바쁜데 잠깐 얘기할게요.\n대조: 비가 오는데 우산이 없어요.\n부드러운 요청: 약속이 있는데 변경해도 될까요?\n동사+는데 / 형용사+(으)ㄴ데\nBackground/contrast connector!'},
 ],
 'L2L4':[
  {k:['계좌개설','open bank account','통장만들기','은행계좌'],r:'계좌 개설:\n외국인 계좌: 여권+외국인등록증 필요\n주거래 은행 추천: 국민, 신한, 하나\n인터넷뱅킹 신청도 함께 해요\n통장 bankbook / 체크카드 debit card\n월급 입금 계좌를 개설하세요!'},
  {k:['송금이체','money transfer','고향송금','해외송금'],r:'송금/이체:\n고향으로 송금하는 법:\nWestern Union / MoneyGram\n하나은행 외환 / 카카오뱅크\n이체 transfer: 계좌번호 입력\n수수료 fee / 환율 exchange rate\n웨스턴유니온 앱 편리해요!'},
  {k:['atm사용','atm use','현금인출','카드기계'],r:'ATM 사용:\n현금 인출 withdraw cash\n잔액 조회 check balance\n이체 transfer\n카드 넣기 → PIN 번호 → 금액 선택\n영문 ATM: English option 선택'},
  {k:['환전하기','currency exchange','환율','외화'],r:'환전:\n환전소 exchange office\n환율 exchange rate 확인 먼저!\n은행 환전 vs 환전소 비교해보세요\n공항 환전소는 비싸요\n인터넷 환전 예약이 저렴해요\n어느 통화로 환전하세요?'},
  {k:['은행표현','banking expression','은행에서','금융'],r:'은행 기본 표현:\n계좌 account / 잔액 balance\n입금 deposit / 출금 withdrawal\n이체 transfer / 이자 interest\n비밀번호 PIN / 공인인증서 certificate\n통장 분실: 즉시 신고하세요!'},
 ],
 'L2L5':[
  {k:['증상설명','symptom description','어디아파요','의사에게'],r:'증상 설명:\n[부위]가 아파요. — My [part] hurts.\n열이 나요. — I have a fever.\n어지러워요. — I\'m dizzy.\n기침이 나요. — I\'m coughing.\n토할 것 같아요. — I feel nauseous.\n언제부터요? — Since when?'},
  {k:['진단서처방전','diagnosis prescription','진단서','처방전'],r:'진단서/처방전:\n진단서 diagnosis letter\n처방전 prescription\n약국에서 처방전 제출해요\n진단서 필요해요. — I need a diagnosis letter.\n산재 신청 시 진단서 필요!'},
  {k:['약국에서','at pharmacy','약사','약이름'],r:'약국 표현:\n이 처방전으로 약 주세요. — This prescription please.\n두통약 headache medicine\n소화제 digestive / 감기약 cold medicine\n하루 몇 번이요? — How many times/day?\n식후 30분에 드세요. — 30 min after meal.'},
  {k:['의료보험','health insurance','건강보험','보험카드'],r:'의료보험:\n건강보험 가입 확인하세요!\n사업주가 가입해줘야 해요\n외국인도 건강보험 적용\n보험 카드 지참 → 병원비 할인\n산재보험 — 작업 중 다치면 적용'},
  {k:['응급상황','emergency situation','응급실','119전화'],r:'응급 상황:\n119 전화 (화재/구급)\n빨리 구급차 불러주세요!\n응급실 Emergency Room\n어디에 있어요? 빨리 오세요!\n회사 응급 연락처를 저장해두세요\nSave emergency numbers!'},
 ],
 'L2L6':[
  {k:['뉴스읽기','reading news','뉴스보기','뉴스이해'],r:'뉴스 읽기 팁:\n제목(headline)부터 읽어요\n모르는 단어 → 사전 확인\n네이버뉴스, YTN 활용\n한국어+영어 뉴스 비교\n쉬운 한국어 뉴스: 나라살림 연구소'},
  {k:['미디어표현','media expression','방송','신문'],r:'미디어 어휘:\n뉴스 news / 신문 newspaper\n방송 broadcast / 채널 channel\n기사 article / 헤드라인 headline\n특집 special report\n한국 방송: KBS, MBC, SBS, YTN'},
  {k:['기사이해','understanding article','뉴스단어','기사어휘'],r:'기사 이해 핵심 어휘:\n~에 따르면 according to\n~로 인해 due to\n증가했다 increased\n감소했다 decreased\n발표했다 announced\n예상된다 is expected'},
  {k:['의견말하기','expressing opinion','생각말하기','내생각'],r:'의견 표현:\n제 생각에는... — In my opinion...\n저는 [의견]이라고 생각해요.\n동의해요 / 동의하지 않아요.\n왜냐하면... — Because...\n예를 들면... — For example...\n그렇지만... — However...'},
  {k:['뉴스어휘','news vocabulary','뉴스단어','미디어용어'],r:'뉴스 자주 나오는 단어:\n경제 economy / 정치 politics\n사회 society / 문화 culture\n사고 accident / 재난 disaster\n협약 agreement / 선거 election\n매일 뉴스 10분 듣기 도전!'},
 ],
 'L2L7':[
  {k:['회의시작','starting meeting','회의시작하기','회의개회'],r:'회의 시작:\n회의를 시작하겠습니다. — Let\'s start the meeting.\n오늘 안건은 [주제]입니다. — Today\'s agenda is [topic].\n출석 확인: 다 오셨나요?\n회의록 작성할게요. — I\'ll take minutes.\n먼저 [이름]씨 발언해 주세요.'},
  {k:['의견제시','presenting opinion','의견말하기','회의발언'],r:'의견 제시:\n제 의견을 말씀드리면... — My opinion is...\n제안하고 싶은 게 있어요. — I have a suggestion.\n[의견]이 좋을 것 같아요. — I think [opinion] is good.\n추가로 말씀드리면... — Additionally...\n발언 기회 주세요.'},
  {k:['동의반대','agree disagree','동의해요','반대해요'],r:'동의/반대 표현:\n동의해요 — I agree\n맞아요! — That\'s right!\n저도 그렇게 생각해요. — I think so too.\n죄송하지만 의견이 달라요. — I respectfully disagree.\n다른 방법은 어떨까요? — How about another way?'},
  {k:['회의록','meeting minutes','회의기록','안건'],r:'회의록 표현:\n안건 agenda / 결론 conclusion\n담당자 person in charge\n기한 deadline / 다음 회의 next meeting\n회의록 공유할게요. — I\'ll share the minutes.\n액션 아이템 action items 정리'},
  {k:['회의마무리','closing meeting','회의끝내기','마무리'],r:'회의 마무리:\n이것으로 회의를 마치겠습니다. — Meeting adjourned.\n수고하셨습니다. — Thank you for your efforts.\n오늘 결정 사항: [내용]\n다음 회의: [일시]\n회의록은 이메일로 보낼게요.'},
 ],
 'L2L8':[
  {k:['근로계약서','work contract','계약서읽기','고용계약'],r:'근로계약서 확인 사항:\n임금 wage / 근무시간 work hours\n휴가 vacation / 업무 내용 job duties\n계약 기간 contract period\n서명 전에 꼭 읽어보세요!\n모르면 통역 도움 받으세요.'},
  {k:['근로조건','work condition','근무환경','조건확인'],r:'근로 조건:\n법정 근로시간: 주 40시간\n초과근무 수당: 기본임금 1.5배\n주휴수당: 주 15시간 이상 근무 시\n연차휴가 annual leave\n산재보험/고용보험 의무 가입'},
  {k:['임금수당','wage allowance','월급','급여'],r:'임금/수당:\n기본급 base salary\n야간수당 night shift allowance (1.5배)\n연장수당 overtime (1.5배)\n휴일수당 holiday pay (2배)\n임금 명세서 pay slip 꼭 확인!\n임금 체불 시 고용노동부 신고'},
  {k:['권리주장','asserting rights','권리','노동자권리'],r:'권리 주장 표현:\n저는 [권리]를 요청합니다. — I request [right].\n이건 법적으로 제 권리예요. — This is my legal right.\n고용노동부에 문의하겠어요. — I\'ll contact Ministry of Employment.\n근로자 상담: 1350 (전화)\n외국인 노동자 지원센터'},
  {k:['노동관련기관','labor agency','고용노동부','노동청'],r:'노동 관련 기관:\n고용노동부 Ministry of Employment: 1350\n외국인노동자지원센터\n근로복지공단 Workers Welfare Corp.\n국가인권위원회 Human Rights Commission\n도움이 필요하면 주저하지 말고!'},
 ],
 'L2L9':[
  {k:['고장신고','equipment failure report','장비고장','기계고장'],r:'고장 신고:\n[장비]가 고장났어요. — [Equipment] broke down.\n작동이 안 돼요. — It\'s not working.\n팀장님께 즉시 보고하세요!\n고장 보고서 작성해요.\n혼자 수리하지 마세요!'},
  {k:['문제설명','describing problem','어디이상','고장증상'],r:'문제 설명:\n[부위]에서 소리가 나요. — [Part] is making noise.\n기름이 새요. — Oil is leaking.\n과열되었어요. — It\'s overheated.\n전원이 안 들어와요. — No power.\n연기가 나요. — Smoke is coming out.'},
  {k:['수리요청','repair request','수리해주세요','AS요청'],r:'수리 요청:\n수리 요청합니다. — Requesting repair.\n언제 수리 가능해요? — When can it be fixed?\n임시 대체 장비 있어요? — Any temporary equipment?\n수리 완료 확인: 작동 확인해 주세요.\n수리 기록 보관해요.'},
  {k:['안전조치','safety measures','작업중지','위험구역'],r:'안전 조치:\n위험 구역 설정: 접근 금지!\n작업 중지권 행사 가능\n안전 담당자에게 즉시 보고\n사고 예방 우선!\n장비 이상 → 즉시 작업 중단\nSafety first!'},
  {k:['장비어휘','equipment vocabulary','기계용어','공구이름'],r:'장비 관련 어휘:\n크레인 crane / 지게차 forklift\n그라인더 grinder / 용접기 welder\n드릴 drill / 컴프레서 compressor\n고장 malfunction / 수리 repair\n점검 inspection / 교체 replacement'},
 ],
 'L2L10':[
  {k:['한국역사표현','history expression','역사어휘','역사말하기'],r:'역사 표현:\n~시대 era/period\n~년에 in [year]\n~가 일어났어요 [event] occurred\n역사적으로 historically\n중요한 사건 important event\n예: 1945년에 광복이 있었어요.'},
  {k:['주요역사사건','key event','한국역사사건','역사이야기'],r:'한국 주요 역사:\n고조선 (BC 2333)\n삼국시대: 고구려 백제 신라\n조선시대 (1392-1897)\n일제강점기 (1910-1945)\n광복 Liberation (1945.8.15)\n6.25 전쟁 Korean War (1950)'},
  {k:['한국문화배경','cultural background','한국문화역사','역사문화'],r:'한국 문화 배경:\n유교 Confucianism 영향 — 어른 공경\n불교 Buddhism — 사찰, 문화재\n한류 Korean Wave — K-pop, K-drama\n한복 hanbok / 한옥 traditional house\n한글 창제: 1443년 세종대왕'},
  {k:['역사어휘','history vocabulary','역사단어','역사용어'],r:'역사 어휘:\n왕 king / 왕조 dynasty\n전쟁 war / 평화 peace\n독립 independence / 통일 unification\n문화유산 cultural heritage\n유물 artifact / 유적 ruins\n박물관 museum'},
  {k:['문화유산','cultural heritage','세계유산','유네스코'],r:'한국 문화유산:\n수원화성 Hwaseong Fortress\n경복궁 Gyeongbokgung Palace\n해인사 팔만대장경 Haeinsa Temple\n판소리 (유네스코 등재)\n유네스코 세계유산이 많아요!'},
 ],
 'L2L11':[
  {k:['여행계획','travel planning','어디여행','여행하기'],r:'여행 계획 표현:\n어디로 여행 가고 싶어요? — Where to travel?\n[장소]에 가고 싶어요. — Want to go to [place].\n언제 출발해요? — When to depart?\n몇 박이에요? — How many nights?\n예산은 얼마예요? — What\'s the budget?'},
  {k:['숙소예약','accommodation booking','호텔예약','숙박'],r:'숙소 예약:\n호텔 hotel / 게스트하우스 guesthouse\n에어비앤비 Airbnb\n예약 방법: 야놀자, 여기어때 앱\n체크인 check-in / 체크아웃 check-out\n예약 확인증 booking confirmation'},
  {k:['교통편예약','transportation booking','기차버스예약','티켓'],r:'교통 예약:\n기차: KTX / 무궁화호 (코레일 앱)\n버스: 고속버스 (고버 앱)\n비행기 airplane: 항공권 ticket\n왕복 round trip / 편도 one way\n예약 취소 booking cancellation'},
  {k:['여행지표현','tourist spot','관광지','가볼만한곳'],r:'한국 여행지:\n서울: 경복궁, 명동, 한강\n부산: 해운대, 광안리, 자갈치시장\n제주도 Jeju Island\n경주 Gyeongju (역사도시)\n여행지 추천 앱: 여기어때'},
  {k:['여행준비','travel preparation','여행챙기기','여행전'],r:'여행 준비:\n여권 passport 유효기간 확인\n보험 travel insurance\n환전 currency exchange\n날씨 확인 check weather\n숙소/교통 미리 예약\n짐 packing / 필수품 essentials'},
 ],
 'L2L12':[
  {k:['맛표현','taste expression','음식맛','맛어때요'],r:'맛 표현:\n맛있어요 Delicious / 맛없어요 Not good\n매워요 Spicy / 달아요 Sweet\n짜요 Salty / 싱거워요 Bland\n고소해요 Nutty/Rich / 담백해요 Light\n부드러워요 Soft / 바삭해요 Crunchy'},
  {k:['조리방법','cooking method','요리법','어떻게요리'],r:'조리 방법:\n굽다 grill / 튀기다 fry\n삶다 boil / 볶다 stir-fry\n찌다 steam / 끓이다 boil (soup)\n날것으로 raw\n조리법: 오븐에 구워요, 기름에 튀겨요'},
  {k:['음식재료','ingredients','재료이름','식재료'],r:'주요 재료:\n고기: 소고기, 돼지고기, 닭고기\n해산물: 생선, 새우, 오징어\n채소: 배추, 무, 시금치, 파\n양념: 고추장, 된장, 간장, 참기름\n이 재료 한국어로 뭐예요?'},
  {k:['레시피읽기','reading recipe','레시피','요리순서'],r:'레시피 읽기:\n재료 준비 prepare ingredients\n썰어요 cut / 씻어요 wash\n넣어요 add / 섞어요 mix\n[시간] 동안 끓여요 boil for [time]\n간 맞춰요 adjust seasoning\n레시피 따라 해보세요!'},
  {k:['한국음식문화','korean food culture','식문화','음식문화'],r:'한국 음식 문화:\n밥+반찬이 기본\n김치는 거의 모든 식사에 나와요\n국/찌개 함께 먹어요\n수저 (숟가락+젓가락) 사용\n어른 먼저 드세요!\n한국 음식을 즐겨보세요!'},
 ],
 'L2L13':[
  {k:['분리수거','sorting recyclables','재활용분리','쓰레기분리'],r:'분리수거 방법:\n일반 쓰레기 — 종량제 봉투 사용\n재활용: 플라스틱, 종이, 유리, 캔\n음식물 쓰레기 — 별도 수거\n대형 폐기물 — 스티커 구매\n아파트: 지정 장소에 버려요'},
  {k:['환경보호','environmental protection','환경지키기','친환경'],r:'환경 보호 표현:\n환경을 보호해요. — Protect the environment.\n일회용품을 줄여요. — Reduce disposables.\n텀블러를 사용해요. — Use a tumbler.\n대중교통 이용해요. — Use public transport.\n에너지 절약 save energy'},
  {k:['재활용','recycling','재활용방법','재활용품'],r:'재활용 방법:\n플라스틱 plastic — 세척 후 배출\n종이 paper — 종이박스 납작하게\n유리 glass — 뚜껑 제거\n캔 can — 찌그러뜨려서\n스티로폼 — 별도 배출\n재활용하면 환경이 살아요!'},
  {k:['환경규정','environmental regulation','환경법','규정'],r:'환경 관련 규정:\n쓰레기 불법 투기 금지 — 과태료!\n산업 폐기물 별도 처리\n소음 규제 noise regulation\n미세먼지 fine dust 주의보 확인\n작업장 환경 기준 지켜요'},
  {k:['환경어휘','environmental vocabulary','환경단어','지구'],r:'환경 어휘:\n환경 environment / 오염 pollution\n기후 변화 climate change\n탄소 carbon / 온실가스 greenhouse gas\n신재생에너지 renewable energy\n조선소 환경관리 — 엄격해요!'},
 ],
 'L2L14':[
  {k:['직업훈련신청','job training application','훈련신청','교육신청'],r:'직업훈련 신청:\n고용노동부 HRD-Net 사이트\n훈련비 지원 — 무료/저렴!\n외국인 근로자도 신청 가능\n필요 서류: 외국인등록증, 재직증명서\n1350 전화로 문의하세요'},
  {k:['자격증취득','getting certificate','자격증','국가기술자격'],r:'자격증 취득:\n국가기술자격: 한국산업인력공단\n용접기능사 welding technician\n지게차운전기능사 forklift operator\n산업안전기사 industrial safety\nQ-NET에서 시험 접수해요'},
  {k:['훈련과정','training course','교육과정','직업교육'],r:'훈련 과정:\n용접 과정 / 배관 과정 / 전기 과정\n한국어 능력 향상 과정\n안전 교육 safety training\n온라인 e-learning 과정도 있어요\n수료 후 수료증 발급'},
  {k:['취업준비','job preparation','이직준비','구직'],r:'취업 준비:\n이력서 resume / 자기소개서 cover letter\n포트폴리오 portfolio\n직업훈련 → 자격증 → 취업!\n잡코리아, 사람인 구직 사이트\n외국인 근로자 취업 지원센터'},
  {k:['훈련표현','training expression','교육표현','수료'],r:'훈련 관련 표현:\n신청하다 apply / 수강하다 take course\n수료하다 complete / 합격하다 pass\n자격증을 취득했어요. — I got certified.\n훈련 비용 지원 신청할게요.\n열심히 배워서 성장해요!'},
 ],
 'L2L15':[
  {k:['경제뉴스읽기','reading economic news','경제뉴스','경제기사'],r:'경제 뉴스 읽기:\n경제면 Economy section 먼저\n핵심 키워드: 성장률, 금리, 환율\n그래프 그래프 읽는 법 배워요\n한국경제, 매일경제 신문 추천\n경제 용어 사전 앱 활용!'},
  {k:['경제용어','economic term','경제단어','금융용어'],r:'경제 기본 용어:\nGDP 국내총생산\n금리 interest rate / 환율 exchange rate\n물가 price level / 인플레이션 inflation\n경기 침체 recession\n수출 export / 수입 import\n주가 stock price'},
  {k:['물가표현','price inflation','물가올랐어요','비싸졌어요'],r:'물가 표현:\n물가가 올랐어요. — Prices went up.\n많이 비싸졌어요. — Got much more expensive.\n인플레이션이 심해요. — High inflation.\n생활비 living cost 증가\n월급 대비 생활비가 부담이에요.'},
  {k:['경제동향','economic trend','경제상황','경제전망'],r:'경제 동향 표현:\n경기가 좋아요/나빠요. — Economy is good/bad.\n성장세 growth trend\n불황 recession / 호황 boom\n취업률 employment rate\n경기 회복 중 economic recovery\n한국 경제 전망은?'},
  {k:['재정표현','financial expression','돈관리','저축'],r:'재정 표현:\n저축 savings / 투자 investment\n대출 loan / 이자 interest\n지출 expenditure / 수입 income\n절약하다 save money\n가계부 household account book\n매달 저축하는 습관을!'},
 ],
 'L2L16':[
  {k:['근로기준법','labor standards act','노동법','법적권리'],r:'근로기준법 핵심:\n주 40시간 근무 (법정)\n연장근무 최대 주 12시간\n연차휴가: 1년 후 15일\n최저임금 확인 (매년 변경)\n위반 시 고용노동부 신고: 1350'},
  {k:['휴가휴일권리','leave rights','연차','공휴일'],r:'휴가/휴일:\n연차휴가 annual leave: 1년=15일\n공휴일 public holiday\n출산휴가 maternity leave (90일)\n병가 sick leave\n주휴일 weekly rest day (보통 일요일)\n휴가 신청은 미리 하세요!'},
  {k:['산재보험','industrial accident','산재','작업중부상'],r:'산업재해보험:\n작업 중 다치면 산재 신청!\n산재보험: 사업주가 의무 가입\n치료비, 휴업급여 지원\n신청: 근로복지공단 1588-0075\n다쳐도 개인 돈 내지 마세요!'},
  {k:['권리주장표현','asserting right','권리말하기','노동권'],r:'권리 주장 표현:\n제 권리를 요청합니다. — I request my rights.\n이건 법적 권리예요. — This is my legal right.\n부당한 대우를 받았어요. — Unfair treatment.\n고용노동부에 신고할게요. — Will report to Ministry.\n도움 요청하기를 두려워하지 마세요!'},
  {k:['노동관련기관','labor agency','상담기관','신고방법'],r:'노동 관련 기관:\n고용노동부: 1350\n근로복지공단: 1588-0075\n외국인노동자지원센터\n국가인권위원회: 1331\n법률구조공단: 132\n한국어 통역 서비스 있어요!'},
 ],
 'L2L17':[
  {k:['자기소개서작성','writing resume','이력서','소개서'],r:'자기소개서 구성:\n1. 지원 동기 motivation\n2. 경력/경험 experience\n3. 강점/기술 strengths/skills\n4. 향후 목표 future goals\n간결하게 1-2페이지\n한국어+영어 버전 준비!'},
  {k:['면접질문준비','interview prep','면접질문','인터뷰'],r:'면접 주요 질문:\n자기소개 해보세요.\n이 회사에 지원한 이유?\n강점과 약점이 뭐예요?\n어디서 일해봤어요?\n5년 후 목표가 뭐예요?\n미리 답변을 준비해요!'},
  {k:['면접답변패턴','interview answer','답변패턴','면접잘하기'],r:'면접 답변 패턴:\n질문: 자기소개 해보세요.\n답변: 저는 [이름]입니다. [경력]이 있고 [기술]을 갖고 있습니다. [지원 이유]로 지원했습니다.\nSTAR 기법: 상황-과제-행동-결과'},
  {k:['이력서작성','cv writing','영문이력서','이력서항목'],r:'이력서 항목:\n인적사항 personal info\n학력 education\n경력 work history\n자격증 certifications\n기술 skills / 언어 languages\n사진 photo (한국은 필수)\n깔끔하게 작성해요!'},
  {k:['취업표현','job application','취업','채용'],r:'취업 표현:\n채용공고 job posting 확인\n지원하다 apply\n서류전형 document screening\n면접 interview\n합격 pass / 불합격 fail\n채용: 잡코리아, 사람인, 워크넷\n외국인 고용 허가 확인!'},
 ],
 'L2L18':[
  {k:['다문화사회이해','multicultural society','다문화','외국인근로자'],r:'다문화 사회:\n한국에 외국인 250만 명 이상\n다문화 가정 증가 중\n서로 다른 문화 존중!\n다문화지원센터 활용\n다양성 속에서 함께 성장'},
  {k:['문화차이','cultural difference','문화충격','한국vs우리나라'],r:'문화 차이 표현:\n한국에서는 [문화]이에요.\n제 나라에서는 [문화]이에요.\n문화가 달라요. — Cultures differ.\n이해해주세요. — Please understand.\n서로 이해하고 존중해요!'},
  {k:['차별대응','responding to discrimination','차별','부당대우'],r:'차별 대응:\n이건 차별이에요. — This is discrimination.\n국가인권위원회에 신고: 1331\n고용평등상담실: 1350\n부당한 대우는 기록하세요\n도움 받을 권리가 있어요!\nYou have rights!'},
  {k:['다문화정책','multicultural policy','외국인정책','지원정책'],r:'다문화 지원 정책:\n사회통합프로그램 (KIIP)\n다문화가족지원센터\n외국인력지원센터\n결혼이민자 지원 서비스\n무료 한국어 교육\n지역 다문화센터를 찾아보세요!'},
  {k:['문화교류','cultural exchange','문화나누기','다양성'],r:'문화 교류:\n내 나라 음식 소개해요\n명절에 문화 나눠요\n언어 교환 language exchange\n한국 친구 사귀어요\n다문화 축제 참여해요\n서로의 문화에서 배워요!'},
 ],
 'L2L19':[
  {k:['발표시작','starting presentation','발표시작하기','프레젠테이션시작'],r:'발표 시작:\n안녕하세요, 저는 [이름]입니다.\n오늘 [주제]에 대해 발표하겠습니다.\n발표는 약 [시간] 분입니다.\n질문은 마지막에 받겠습니다.\n시작하겠습니다!'},
  {k:['발표진행','presenting','발표하기','내용설명'],r:'발표 진행 표현:\n첫 번째로... First...\n다음으로... Next...\n그리고... And also...\n정리하면... In summary...\n예를 들면... For example...\n이 자료를 보시면...'},
  {k:['시각자료설명','explaining visual','그래프표설명','슬라이드'],r:'시각 자료 설명:\n이 그래프를 보시면... — Looking at this graph...\n[수치]를 나타냅니다. — This shows [figure].\n증가/감소 추세 increasing/decreasing trend\n표에 따르면 according to the table\n이 부분에 주목해 주세요.'},
  {k:['질의응답','q and a','질문받기','답변하기'],r:'Q&A 표현:\n질문 있으신 분? — Any questions?\n좋은 질문이에요. — Good question.\n제가 아는 한에서 말씀드리면... — As far as I know...\n나중에 확인해 드릴게요. — I\'ll get back to you.\n이해하셨나요?'},
  {k:['발표마무리','closing presentation','발표끝내기','마무리인사'],r:'발표 마무리:\n이것으로 발표를 마치겠습니다.\n들어주셔서 감사합니다. — Thank you for listening.\n질문이 있으시면 연락 주세요.\n발표 자료 공유할게요.\n수고하셨습니다!'},
 ],
 'L2L20':[
  {k:['졸업소감','graduation thoughts','졸업후','과정완료'],r:'졸업 소감:\n드디어 완료했어요! — Finally completed!\n정말 뿌듯해요. — I\'m so proud.\n많이 배웠어요. — Learned so much.\n처음보다 많이 성장했어요. — Grown a lot.\n함께한 동료들 감사해요!'},
  {k:['미래목표말하기','stating future goal','앞으로계획','목표'],r:'미래 목표 표현:\n저의 목표는 [목표]예요.\n앞으로 [기간] 안에 [목표]할 거예요.\n기술을 더 향상시킬 거예요.\n가족과 행복하게 살 거예요.\n목표를 향해 계속 나아갈게요!'},
  {k:['성취표현','expressing achievement','해냈어요','성과'],r:'성취 표현:\n해냈어요! — I did it!\n드디어 완료했어요! — Finally finished!\n열심히 한 결과예요. — Result of hard work.\n자랑스러워요. — I\'m proud.\n다음 단계도 도전할게요!'},
  {k:['감사인사','thank you expression','감사말','고마움표현'],r:'감사 인사:\n선생님, 감사합니다! — Thank you, teacher!\n동료들, 고마워요! — Thank you, friends!\n도움 주셔서 감사해요. — Thanks for your help.\n덕분에 많이 배웠어요. — Learned a lot thanks to you.\n앞으로도 잘 부탁드려요!'},
  {k:['앞으로계획','plans going forward','다음단계','미래다짐'],r:'앞으로의 다짐:\n한국어 공부를 계속할 거예요!\n다음 KIIP 단계에 도전할게요.\n기술 자격증을 딸 거예요.\n가족에게 좋은 사람이 될게요.\n화이팅! 여러분의 미래를 응원해요!'},
 ],
};

/* ── 구 범용 FAQ (레슨 매칭 실패 시 폴백) ─────────────── */
const FAQ = [
  // ── 발음 ──────────────────────────────────────────────
  { k:['ㅏ','아','a','발음','어떻게'], l:0,
    r:'ㅏ는 "아"로 발음해요. 입을 크게 벌리고 발음합니다.\nㅏ is pronounced "ah" — open your mouth wide, like "father".' },
  { k:['ㅓ','어','eo'],
    r:'ㅓ는 "어"로 발음해요. 입을 반쯤 벌리고 발음합니다.\nㅓ is pronounced "uh" — like "fun" or "sun".' },
  { k:['ㅗ','오','o'],
    r:'ㅗ는 "오"로 발음해요. 입술을 둥글게 모아요.\nㅗ is pronounced "oh" — round your lips like "go".' },
  { k:['ㅜ','우','u'],
    r:'ㅜ는 "우"로 발음해요. 입술을 앞으로 내밀어요.\nㅜ is pronounced "oo" — like "food", lips forward.' },
  { k:['ㅡ','으','eu'],
    r:'ㅡ는 "으"로 발음해요. 입술을 양옆으로 당기고 평평하게 해요.\nㅡ is "eu" — flatten your lips side-to-side, no English equivalent.' },
  { k:['ㅣ','이','i','ee'],
    r:'ㅣ는 "이"로 발음해요. 입을 양옆으로 당겨 웃는 모양이에요.\nㅣ is "ee" — like "see", smile shape.' },
  { k:['모음','vowel','모음표'],
    r:'기본 모음 6개: ㅏ(아) ㅓ(어) ㅗ(오) ㅜ(우) ㅡ(으) ㅣ(이)\n복합 모음: ㅐ(애) ㅔ(에) ㅑ(야) ㅕ(여) ㅛ(요) ㅠ(유)\nBasic vowels: ㅏ(ah) ㅓ(uh) ㅗ(oh) ㅜ(oo) ㅡ(eu) ㅣ(ee)' },
  // ── 자음 ──────────────────────────────────────────────
  { k:['자음','consonant','ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ'],
    r:'기본 자음 14개: ㄱ(g/k) ㄴ(n) ㄷ(d/t) ㄹ(r/l) ㅁ(m) ㅂ(b/p) ㅅ(s) ㅇ(silent/ng) ㅈ(j) ㅊ(ch) ㅋ(k) ㅌ(t) ㅍ(p) ㅎ(h)\n14 basic consonants in Korean.' },
  // ── 받침 ──────────────────────────────────────────────
  { k:['받침','batchim','받침소리','종성'],
    r:'받침은 음절의 맨 아래에 오는 자음이에요.\n예: 밥(bap) → ㅂ이 받침 / 학교(hakgyo) → ㄱ이 받침\nBatchim is the final consonant at the bottom of a syllable.' },
  // ── 숫자 ──────────────────────────────────────────────
  { k:['숫자','number','일','이','삼','사','오','육','칠','팔','구','십'],
    r:'한자어 숫자: 일(1) 이(2) 삼(3) 사(4) 오(5) 육(6) 칠(7) 팔(8) 구(9) 십(10)\n고유어 숫자: 하나(1) 둘(2) 셋(3) 넷(4) 다섯(5) 여섯(6) 일곱(7) 여덟(8) 아홉(9) 열(10)\nSino-Korean: il,i,sam... / Native Korean: hana,dul,set...' },
  { k:['전화','층','호','번호','몇'],
    r:'전화번호·층수는 한자어 숫자를 써요: 010-1234-5678 = 공일공-일이삼사-오육칠팔\n물건 세기는 고유어: 사과 하나, 커피 둘\nFor phone/floor numbers use Sino-Korean. For counting objects use native Korean.' },
  // ── 인사 ──────────────────────────────────────────────
  { k:['안녕','hello','hi','인사','greeting','처음','만나서'],
    r:'안녕하세요 — Hello (formal, any time)\n안녕하십니까 — Hello (very formal)\n처음 뵙겠습니다 — Nice to meet you\n안녕히 계세요 — Goodbye (you stay)\n안녕히 가세요 — Goodbye (you go)' },
  { k:['감사','thank','고마워','고맙'],
    r:'감사합니다 — Thank you (formal)\n고맙습니다 — Thank you (slightly casual)\n천만에요 — You\'re welcome\n괜찮아요 — It\'s okay / No problem' },
  { k:['죄송','미안','sorry','사과'],
    r:'죄송합니다 — I\'m sorry (formal)\n미안합니다 — I\'m sorry (casual)\n괜찮아요 — It\'s okay\n실례합니다 — Excuse me' },
  // ── 자기소개 ───────────────────────────────────────────
  { k:['이름','name','저는','나는','소개'],
    r:'자기소개 예시:\n저는 [이름]입니다. — I am [name].\n저는 [나라] 사람이에요. — I am from [country].\n직업은 [직업]이에요. — My job is [job].\nI am [name]. I am from [country]. My job is [job].' },
  { k:['나라','country','국적','어디서','where from','vietnam','indonesia','myanmar','philippines','cambodia'],
    r:'나라 이름:\n베트남 Vietnam / 인도네시아 Indonesia / 미얀마 Myanmar\n필리핀 Philippines / 캄보디아 Cambodia / 태국 Thailand\n저는 베트남 사람이에요. — I am Vietnamese.' },
  // ── 문법 ──────────────────────────────────────────────
  { k:['이에요','예요','이다','입니다','is'],
    r:'"이에요/예요"는 "~입니다/~이다"의 구어체예요.\n자음으로 끝날 때: 학생이에요 (I am a student)\n모음으로 끝날 때: 의사예요 (I am a doctor)\nUse 이에요 after consonant, 예요 after vowel.' },
  { k:['은','는','topic','주어','topic marker'],
    r:'"은/는"은 주제를 나타내요 (topic marker).\n자음 뒤: 학생은 (as for the student)\n모음 뒤: 저는 (as for me)\nUse 은 after consonant, 는 after vowel ending.' },
  { k:['이','가','subject','주격'],
    r:'"이/가"는 주격 조사예요 (subject marker).\n자음 뒤: 학생이 / 모음 뒤: 의사가\n은/는 vs 이/가: 은/는은 화제(topic), 이/가는 새 정보(new info)' },
  { k:['을','를','object','목적어'],
    r:'"을/를"은 목적격 조사예요 (object marker).\n자음 뒤: 밥을 먹어요 / 모음 뒤: 물을 마셔요\n을 after consonant, 를 after vowel.' },
  { k:['에서','에','에게','장소','place','location'],
    r:'"에"는 장소/방향, "에서"는 행동이 일어나는 장소.\n회사에 가요 — go to the company\n회사에서 일해요 — work at the company\n에 = location/direction, 에서 = where action happens' },
  // ── 직장·조선소 ─────────────────────────────────────────
  { k:['용접','welding','welder','용접공'],
    r:'용접 관련 표현:\n용접공 — welder\n용접하다 — to weld\n안전모를 쓰세요 — Please wear a hard hat\n보호 장갑을 끼세요 — Please wear protective gloves' },
  { k:['안전','safety','위험','danger','조심'],
    r:'안전 표현:\n위험 — Danger\n조심하세요 — Be careful\n안전모 — Hard hat\n안전화 — Safety shoes\n소화기 — Fire extinguisher\n비상구 — Emergency exit\n금지 — Prohibited\n착용 — Wear/Put on' },
  { k:['비상','emergency','대피','evacuate','화재','fire'],
    r:'비상 상황 표현:\n비상구 — Emergency exit\n대피하세요 — Please evacuate\n화재 — Fire\n119 — Fire/Emergency number\n도와주세요 — Help me please\n빨리 — Quickly / Hurry' },
  { k:['식당','밥','점심','저녁','아침','식사','canteen','lunch'],
    r:'식사 관련 표현:\n식당 — Cafeteria/Restaurant\n아침 — Breakfast\n점심 — Lunch\n저녁 — Dinner/Supper\n맛있어요 — It\'s delicious\n배고파요 — I\'m hungry\n물 주세요 — Water please' },
  { k:['화장실','toilet','bathroom','어디','where'],
    r:'화장실이 어디예요? — Where is the bathroom?\n화장실 — Bathroom/Toilet\n왼쪽 — Left\n오른쪽 — Right\n직진 — Go straight\n계단 — Stairs / 엘리베이터 — Elevator' },
  { k:['병원','의사','아파','sick','hurt','다쳐'],
    r:'응급 표현:\n아파요 — I\'m sick/It hurts\n다쳤어요 — I\'m injured\n병원에 가야 해요 — I need to go to the hospital\n구급차 — Ambulance\n119 — Emergency number\n어디가 아파요? — Where does it hurt?' },
  // ── KIIP 관련 ──────────────────────────────────────────
  { k:['kiip','사회통합','이민','비자','visa','영주권','귀화','naturalization'],
    r:'KIIP(사회통합프로그램) 단계:\n0단계 — 기초 한국어 (15시간)\n1단계 — 초급1 (100시간)\n2단계 — 초급2 (100시간)\n3단계 — 중급1 (100시간)\n4단계 — 중급2 (100시간)\n5단계 — 고급 (82시간)\n사전평가로 해당 단계 배치. 귀화·영주권 신청 시 이수 인정.' },
  // ── 학습 방법 ──────────────────────────────────────────
  { k:['공부','study','배우','learn','어떻게','how','tip','방법'],
    r:'한국어 학습 팁:\n1. 매일 10분씩 꾸준히 반복하세요\n2. 배운 단어를 현장에서 바로 사용해보세요\n3. 한국어로 된 안전 표지판을 읽어보세요\n4. 동료 한국인과 인사 연습을 해보세요\nTip: Practice 10 min daily, use new words at work!' },
  // ── 기본 대화 ──────────────────────────────────────────
  { k:['네','아니요','yes','no','맞아','틀려'],
    r:'네 — Yes\n아니요 — No\n맞아요 — That\'s right / Correct\n틀려요 — That\'s wrong / Incorrect\n모르겠어요 — I don\'t know\n다시 말해주세요 — Please say it again' },
  { k:['얼마','가격','price','비싸','싸','cost'],
    r:'가격 표현:\n얼마예요? — How much is it?\n비싸요 — It\'s expensive\n싸요 — It\'s cheap\n할인 — Discount\n영수증 — Receipt' },
];

function faqAnswer(userMsg, sysPrompt) {
  const q = (userMsg || '').toLowerCase();
  const sys = (sysPrompt || '').toLowerCase();

  // 레슨 ID 추출: sysPrompt에서 "LESSON:L2L3" 형식 또는 "level X" + "lesson Y" 파싱
  let lessonId = null;
  const tagMatch = (sysPrompt || '').match(/LESSON:(L\d+L\d+)/i);
  if (tagMatch) {
    lessonId = tagMatch[1].toUpperCase();
  } else {
    const lvM = sys.match(/level\s*(\d)/i);
    const lsM = sys.match(/lesson\s*(\d+)/i);
    if (lvM && lsM) lessonId = 'L' + lvM[1] + 'L' + lsM[1];
  }

  // 1) 레슨 특화 FAQ 매칭
  if (lessonId && LESSON_FAQ[lessonId]) {
    let best = null, bestScore = 0;
    for (const item of LESSON_FAQ[lessonId]) {
      let score = 0;
      for (const kw of item.k) { if (q.includes(kw.toLowerCase())) score += kw.length; }
      if (score > bestScore) { bestScore = score; best = item; }
    }
    if (best && bestScore >= 2) return best.r;
    // 점수 낮아도 첫 번째 항목을 기본으로 반환
    if (LESSON_FAQ[lessonId].length > 0) return LESSON_FAQ[lessonId][0].r;
  }

  // 2) 전체 LESSON_FAQ 검색 (레슨 무관)
  let best2 = null, bestScore2 = 0;
  for (const [, items] of Object.entries(LESSON_FAQ)) {
    for (const item of items) {
      let score = 0;
      for (const kw of item.k) { if (q.includes(kw.toLowerCase())) score += kw.length; }
      if (score > bestScore2) { bestScore2 = score; best2 = item; }
    }
  }
  if (best2 && bestScore2 >= 3) return best2.r;

  // 3) 범용 FAQ 폴백
  const lvMatch = sys.match(/level\s*(\d)/i);
  const lv = lvMatch ? parseInt(lvMatch[1]) : null;
  let bestF = null, bestFScore = 0;
  for (const item of FAQ) {
    let score = 0;
    for (const kw of item.k) { if (q.includes(kw.toLowerCase())) score += kw.length; }
    if (score > 0 && item.l !== undefined && item.l === lv) score += 5;
    if (score > bestFScore) { bestFScore = score; bestF = item; }
  }
  if (bestF && bestFScore >= 2) return bestF.r;

  return '궁금한 점을 구체적으로 물어보세요!\n'
    + '버튼을 클릭하거나 아래처럼 질문하세요:\n'
    + '• 발음 / 문법 / 어휘 질문\n'
    + '• 안전 / 직장 / 생활 표현\n'
    + 'Ask in Korean or English — I\'ll help!';
}

/* ── FAQ 채팅 핸들러 (토큰 없음) ────────────────────────── */
function handleChat(request, env) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

  return request.json().then(({ messages }) => {
    const userMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
    const sysMsg = messages.find(m => m.role === 'system')?.content || '';
    const reply = faqAnswer(userMsg, sysMsg);
    return new Response(JSON.stringify({
      choices: [{ message: { content: reply } }]
    }), { headers: cors });
  }).catch(() => {
    return new Response(JSON.stringify({
      choices: [{ message: { content: '질문을 다시 입력해 주세요. Please re-enter your question.' } }]
    }), { headers: cors });
  });
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
