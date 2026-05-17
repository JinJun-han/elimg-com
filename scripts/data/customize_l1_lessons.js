/**
 * Level1 Lessons 1~5 — 과별 고유 AI 섹션 적용
 * 각 과의 학습 내용에 맞는 AI 활동으로 교체
 */
const fs = require('fs');
const path = require('path');
const dir = __dirname;

// ─── 과별 커스텀 데이터 ───────────────────────────────────────────────────────
const LESSONS = {

  'HanwhaOcean_Level1_Lesson1.html': {
    bannerTitle: '🤝 AI 자기소개 생성기',
    bannerSub: '이름 · 나라 · 직업 → AI가 자기소개 만들어줘요',
    bannerTag: '🔵 Introduction Builder × Shipyard Korean',
    quickBtns: `[
  { emoji:'🙋', label:'자기소개 만들어줘',
    q:'한화오션 조선소 외국인 근로자입니다. 저는 베트남 출신 용접공이에요. "저는 ~이에요" 패턴으로 짧은 한국어 자기소개를 만들어주세요. 영어 해석도 함께 써주세요.' },
  { emoji:'🌏', label:'나라/직업 어휘',
    q:'조선소에서 일하는 외국인들의 나라 이름(베트남, 필리핀, 인도네시아, 스리랑카)과 직업 이름(용접공, 배관공, 도장공, 전기공)을 한국어로 알려주세요. 발음도 함께요.' },
  { emoji:'👋', label:'인사 표현 연습',
    q:'조선소에서 매일 쓰는 한국어 인사 표현 5가지를 알려주세요: 출근할 때, 퇴근할 때, 식사 전후, 감사할 때, 사과할 때. 각각 영어도 함께요.' },
  { emoji:'📝', label:'이에요/예요 차이',
    q:'한국어 초급입니다. 이에요 vs 예요 차이를 조선소 직업 예문으로 설명해주세요. 용접공이에요 vs 배관공예요처럼요. 규칙을 쉽게 알려주세요.' },
  { emoji:'✏️', label:'내 문장 고쳐줘',
    q:'제 한국어 자기소개를 고쳐주세요: "저는 라민 이에요. 나라는 베트남. 직업이 용접공입니다." 더 자연스러운 표현으로 고쳐주고 이유도 영어로 알려주세요.' },
]`,
    systemPrompt: `You are a Korean self-introduction coach for foreign workers at Hanwha Ocean shipyard. Lesson 1 focus: greetings (안녕하세요), name/nationality/job introductions using 이에요/예요 and 은/는 topic markers. Keep answers SHORT. Always include English translations. Use examples like: 저는 라민이에요, 직업은 용접공이에요.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국어 자기소개 연습을 도와주세요. 이름, 나라, 직업을 소개하는 대화를 연습하고 싶어요. 영어로도 설명해 주세요."`,
    inputPlaceholder: `이름/나라/직업 입력 → AI가 자기소개 만들어줘요...`,
    pronunciationItems: `[
      {sent:'안녕하세요. 저는 라민이에요.', eng:'Hello. I am Ramin.'},
      {sent:'직업은 용접공이에요.', eng:'My job is welder.'},
      {sent:'저는 베트남 사람이에요.', eng:'I am Vietnamese.'},
      {sent:'처음 뵙겠습니다.', eng:'Nice to meet you for the first time.'},
      {sent:'잘 부탁드립니다.', eng:'Please take care of me. / Nice to work with you.'},
    ]`,
  },

  'HanwhaOcean_Level1_Lesson2.html': {
    bannerTitle: '🔧 AI 도구 이름 퀴즈',
    bannerSub: '이것/그것/저것 + 조선소 도구 이름 맞히기',
    bannerTag: '🔵 Tool Name Quiz × Demonstratives',
    quickBtns: `[
  { emoji:'❓', label:'이것 뭐예요? 퀴즈',
    q:'조선소 도구 이름 맞히기 퀴즈를 해주세요. 도구의 특징을 설명하면 제가 한국어로 대답할게요. 예: "이것은 철을 자르는 도구예요. 이것은 뭐예요?" — 5개만 내주세요.' },
  { emoji:'🔩', label:'조선소 도구 이름',
    q:'한화오션 조선소에서 쓰는 도구/장비 이름을 한국어로 알려주세요: 그라인더, 용접기, 크레인, 안전모, 도면 등 10가지. 한국어 + 영어 + 발음을 함께요.' },
  { emoji:'👆', label:'이/그/저 차이',
    q:'이것/그것/저것 차이를 조선소 상황으로 설명해주세요. 예: 내 앞 도구=이것, 상대방 앞=그것, 멀리 보이는 크레인=저것. 쉽게 영어로도 설명해주세요.' },
  { emoji:'🗣️', label:'도구 가리키며 말하기',
    q:'조선소에서 도구를 가리키며 말하는 연습을 도와주세요. "이 용접기는 제 거예요", "저 크레인이 뭐예요?" 같은 표현 5가지를 알려주세요. 영어도 함께요.' },
  { emoji:'✏️', label:'이에요/예요 복습',
    q:'조선소 도구 이름으로 이에요/예요 복습을 해주세요. 그라인더예요, 용접기이에요, 크레인이에요 — 받침 규칙을 도구 예문으로 5개 만들어주세요.' },
]`,
    systemPrompt: `You are a Korean vocabulary coach for shipyard tool identification. Lesson 2 focus: demonstratives 이것/그것/저것 (this/that/that over there), 이/그/저+noun, and tool names like 용접기(welder), 그라인더(grinder), 크레인(crane), 도면(blueprint), 안전모(hard hat). Keep answers SHORT with English. Use quiz-style when asked.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 조선소 도구 이름을 이것/그것/저것으로 가리키는 연습을 도와주세요. 도구 사진을 보여주면 한국어로 설명해 주세요. 영어로도 알려주세요."`,
    inputPlaceholder: `조선소 도구 이름 질문 / 이것 뭐예요? ...`,
    pronunciationItems: `[
      {sent:'이것은 용접기예요.', eng:'This is a welding machine.'},
      {sent:'저것은 크레인이에요.', eng:'That over there is a crane.'},
      {sent:'이 그라인더는 제 거예요.', eng:'This grinder is mine.'},
      {sent:'그것이 뭐예요?', eng:'What is that?'},
      {sent:'이 도면을 확인하세요.', eng:'Please check this blueprint.'},
    ]`,
  },

  'HanwhaOcean_Level1_Lesson3.html': {
    bannerTitle: '🗺️ AI 조선소 길 안내',
    bannerSub: '여기/거기/저기 · 위치 표현 실전 연습',
    bannerTag: '🔵 Shipyard Navigator × Location Korean',
    quickBtns: `[
  { emoji:'🏥', label:'의무실 어디예요?',
    q:'조선소에서 다쳤어요. 의무실 찾는 대화를 연습해주세요. "의무실이 어디예요?", "2층에 있어요", "왼쪽으로 가세요" 같은 표현을 롤플레이로 연습시켜주세요.' },
  { emoji:'📍', label:'장소 이름 알려줘',
    q:'한화오션 조선소 안 주요 장소 이름을 한국어로 알려주세요: 도크, 기숙사, 구내식당, 화장실, 의무실, 정문, 주차장. 한국어+영어+위치 힌트 함께요.' },
  { emoji:'🧭', label:'여기/거기/저기 차이',
    q:'여기/거기/저기 차이를 조선소 상황으로 설명해주세요. 위치 표현 있어요/없어요도 함께요. 예: "화장실은 저기 오른쪽에 있어요." 영어로도 설명해주세요.' },
  { emoji:'🚶', label:'길 안내 표현',
    q:'조선소에서 길을 안내하는 한국어 표현 5가지를 알려주세요. 앞으로, 뒤로, 왼쪽, 오른쪽, 엘리베이터, 계단 등 방향 표현도 영어와 함께요.' },
  { emoji:'🆘', label:'긴급 상황 위치',
    q:'조선소 긴급 상황에서 쓰는 위치/장소 표현을 알려주세요. "비상구는 어디예요?", "구급함이 여기 있어요", "빨리 의무실로 가세요" 등을 영어와 함께요.' },
]`,
    systemPrompt: `You are a Korean location guide for Hanwha Ocean shipyard. Lesson 3 focus: location words 여기(here)/거기(there)/저기(over there), 에 있어요/없어요 (exists/doesn't exist at location), ~은/는 어디예요? (Where is...?), shipyard places: 도크(dock), 기숙사(dormitory), 의무실(infirmary), 구내식당(cafeteria), 화장실(restroom). Give SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 조선소 안에서 길을 찾고 위치를 설명하는 한국어 연습을 도와주세요. 여기/거기/저기와 있어요/없어요 표현으로 롤플레이해 주세요. 영어로도 설명해 주세요."`,
    inputPlaceholder: `어디예요? 위치 질문 / Ask about shipyard locations...`,
    pronunciationItems: `[
      {sent:'화장실은 어디예요?', eng:'Where is the restroom?'},
      {sent:'의무실은 2층에 있어요.', eng:'The infirmary is on the 2nd floor.'},
      {sent:'저기 왼쪽으로 가세요.', eng:'Go to the left over there.'},
      {sent:'기숙사는 조선소 밖에 있어요.', eng:'The dormitory is outside the shipyard.'},
      {sent:'비상구는 여기 있어요.', eng:'The emergency exit is here.'},
    ]`,
  },

  'HanwhaOcean_Level1_Lesson4.html': {
    bannerTitle: '⏰ AI 일과표 코치',
    bannerSub: '시간 표현 · 내 하루 일과를 한국어로 말해요',
    bannerTag: '🔵 Daily Schedule Coach × Time Korean',
    quickBtns: `[
  { emoji:'📅', label:'내 일과 말하기',
    q:'조선소 외국인 근로자의 하루 일과를 한국어로 표현해주세요. 아침 7시 기상, 8시 출근, 12시 점심, 17시 퇴근, 22시 취침. 시간+동사 문장으로 만들어주세요. 영어도 함께요.' },
  { emoji:'🕐', label:'시간 읽기 연습',
    q:'한국어 시간 읽기를 연습시켜주세요. 고유어 숫자(하나=한 시, 둘=두 시)로 1시~12시를 어떻게 읽는지 알려주세요. 퀴즈 형식으로 5개 내주세요.' },
  { emoji:'⚙️', label:'근무 시간 표현',
    q:'조선소 근무 시간 관련 한국어 표현을 알려주세요. "출근", "퇴근", "점심시간", "야간 근무", "초과 근무". 각각 영어와 예문을 함께 알려주세요.' },
  { emoji:'📐', label:'부터/까지 사용법',
    q:'한국어 "~부터 ~까지" 표현을 조선소 일과 예문으로 설명해주세요. "아침 8시부터 5시까지 일해요" 같은 문장 5개를 만들어주세요. 영어도 함께요.' },
  { emoji:'❓', label:'몇 시예요? 퀴즈',
    q:'시간 읽기 퀴즈를 해주세요. "열두 시 삼십 분이에요" 같은 시간을 숫자로 쓰거나, 숫자를 한국어로 읽는 퀴즈 5개를 내주세요.' },
]`,
    systemPrompt: `You are a Korean time expression tutor for shipyard workers. Lesson 4 focus: native Korean numbers for hours (한 시=1:00, 두 시=2:00, 세 시=3:00...), sino-Korean numbers for minutes (일 분, 이십 분...), time+에 particle (8시에 출근해요), ~부터 ~까지 (from ~ to ~), daily schedule words: 출근(start work), 퇴근(leave work), 점심(lunch). SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 하루 일과를 한국어로 표현하는 연습을 도와주세요. 출근 시간, 점심, 퇴근 시간을 한국어로 말하고 싶어요. 부터/까지와 시간+에 표현을 연습하고 싶어요. 영어로도 설명해 주세요."`,
    inputPlaceholder: `몇 시예요? 일과 질문 / Ask about time and schedule...`,
    pronunciationItems: `[
      {sent:'지금 몇 시예요?', eng:'What time is it now?'},
      {sent:'아침 여덟 시에 출근해요.', eng:'I start work at 8 AM.'},
      {sent:'점심시간은 열두 시예요.', eng:'Lunch time is at noon.'},
      {sent:'다섯 시에 퇴근해요.', eng:'I finish work at 5 o\'clock.'},
      {sent:'여덟 시부터 다섯 시까지 일해요.', eng:'I work from 8 AM to 5 PM.'},
    ]`,
  },

  'HanwhaOcean_Level1_Lesson5.html': {
    bannerTitle: '💰 AI 쇼핑 대화 코치',
    bannerSub: '얼마예요? · 숫자와 돈 표현 실전 연습',
    bannerTag: '🔵 Shopping Dialogue Coach × Numbers & Money',
    quickBtns: `[
  { emoji:'🛒', label:'편의점 쇼핑 연습',
    q:'조선소 근처 편의점에서 쇼핑하는 한국어 대화를 연습해주세요. "이거 얼마예요?", "삼천 원이에요", "카드 되요?" 같은 실전 대화를 롤플레이로 연습시켜주세요.' },
  { emoji:'💵', label:'숫자 읽기 연습',
    q:'한국어 한자어 숫자(일,이,삼,사,오,육,칠,팔,구,십)로 가격 읽기를 연습시켜주세요. 1,000원~50,000원까지 퀴즈 5개를 내주세요. 영어도 함께요.' },
  { emoji:'💳', label:'결제 표현',
    q:'조선소 생활에서 쓰는 결제 한국어를 알려주세요. "카드로 결제할 수 있어요?", "현금이요", "영수증 주세요", "거스름돈이에요". 각각 영어와 함께요.' },
  { emoji:'🏪', label:'가격 흥정/비교',
    q:'한국어로 가격을 표현하는 연습을 도와주세요. 비싸요/싸요/적당해요 표현과 "더 싼 것 있어요?" 같은 표현을 영어와 함께 5가지 알려주세요.' },
  { emoji:'📱', label:'월급/생활비 표현',
    q:'조선소 근로자들이 쓰는 돈 관련 한국어 표현을 알려주세요. 월급, 식비, 교통비, 생활비를 숫자로 말하는 연습을 영어와 함께 알려주세요.' },
]`,
    systemPrompt: `You are a Korean shopping and money coach for shipyard workers. Lesson 5 focus: sino-Korean numbers (일,이,삼... 천,만), price expressions (얼마예요? how much, 원 won), 주세요 (please give me), 비싸요(expensive)/싸요(cheap), payment: 카드(card)/현금(cash)/영수증(receipt). Use practical price examples. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국 편의점과 마트에서 쇼핑하는 한국어 대화를 연습하고 싶어요. 숫자 읽기와 가격 묻고 답하기를 도와주세요. 영어로도 설명해 주세요."`,
    inputPlaceholder: `얼마예요? 쇼핑 질문 / Ask about prices and shopping...`,
    pronunciationItems: `[
      {sent:'이거 얼마예요?', eng:'How much is this?'},
      {sent:'삼천 원이에요.', eng:'It\'s 3,000 won.'},
      {sent:'카드로 결제할 수 있어요?', eng:'Can I pay by card?'},
      {sent:'영수증 주세요.', eng:'Please give me a receipt.'},
      {sent:'거스름돈이에요.', eng:'Here is your change.'},
    ]`,
  },

};

// ─── 공통 적용 함수 ────────────────────────────────────────────────────────────
function applyLesson(fname, cfg) {
  const fpath = path.join(dir, fname);
  let content = fs.readFileSync(fpath, 'utf8');
  let changes = 0;

  // 1) AI_QUICK_BTNS 교체
  const btnStart = content.indexOf('var AI_QUICK_BTNS = [');
  const btnEnd   = content.indexOf('];', btnStart) + 2;
  if (btnStart === -1 || btnEnd === 1) { console.log(`  [WARN] ${fname} — AI_QUICK_BTNS 못 찾음`); return; }
  const newBtns = 'var AI_QUICK_BTNS = ' + cfg.quickBtns;
  content = content.slice(0, btnStart) + newBtns + content.slice(btnEnd);
  changes++;

  // 2) 시스템 프롬프트 교체
  const sysOld = `'You are a Korean language tutor for foreign workers at Hanwha Ocean shipyard in Geoje, Korea. Students are beginner level (KIIP Level 1-2). Always: 1) Keep answers SHORT and CLEAR 2) Include English translations 3) Focus on practical shipyard expressions 4) Use simple grammar. Reply in Korean with English translation.'`;
  const sysNew = `'${cfg.systemPrompt}'`;
  if (content.includes(sysOld)) { content = content.replace(sysOld, sysNew); changes++; }
  else { console.log(`  [WARN] ${fname} — 시스템 프롬프트 못 찾음`); }

  // 3) 배너 제목 교체
  const bannerOld = '에이전틱 G스택 조선소 한국어 실습';
  const bannerNew = cfg.bannerTitle;
  if (content.includes(bannerOld)) { content = content.replace(bannerOld, bannerNew); changes++; }

  // 4) 배너 서브 태그 교체
  const bannerTagOld = '🔵 Shipyard Korean Learning × AI Agents';
  const bannerTagNew = cfg.bannerTag;
  if (content.includes(bannerTagOld)) { content = content.replace(bannerTagOld, bannerTagNew); changes++; }

  // 5) 배너 설명 (Google · Claude · Agent Harness 줄) 아래에 서브타이틀 주입
  // 배너 서브 설명을 cfg.bannerSub로 변경 — "Google Gemini · Claude AI · Agent Harness 연계" 줄 교체
  const bannerSubOld = 'Google Gemini · Claude AI · Agent Harness 연계';
  const bannerSubNew = cfg.bannerSub;
  if (content.includes(bannerSubOld)) { content = content.replace(bannerSubOld, bannerSubNew); changes++; }

  // 6) 입력창 placeholder 교체
  const phOld = 'placeholder="조선소 한국어 질문 / Ask about shipyard Korean..."';
  const phNew = `placeholder="${cfg.inputPlaceholder}"`;
  if (content.includes(phOld)) { content = content.replace(phOld, phNew); changes++; }

  // 7) Gemini 프롬프트 교체
  const gemOld = `"저는 한화오션 조선소 외국인 근로자예요. 이번 과에서 배운 표현으로 상사와 대화하는 롤플레이를 도와주세요. 영어로도 설명해 주세요."`;
  const gemNew = cfg.geminiPrompt;
  if (content.includes(gemOld)) { content = content.replace(gemOld, gemNew); changes++; }

  // 8) 발음 연습 문장 교체 — 기존 5개 항목 배열을 새 것으로 교체
  // 패턴: [{sent:'안전모를 착용하세요.', ... }, ... 5번째 항목 }] 블록
  const pronOld = `[
      {sent:'안전모를 착용하세요.', eng:'Please wear your safety helmet.'},
      {sent:'작업 지시서를 확인하세요.', eng:'Please check the work order.'},
      {sent:'도움이 필요합니다.', eng:'I need help.'},
      {sent:'작업이 완료되었습니다.', eng:'The work is complete.'},
      {sent:'위험합니다. 조심하세요!', eng:'It is dangerous. Please be careful!'},
    ]`;
  const pronNew = cfg.pronunciationItems;
  if (content.includes(pronOld)) { content = content.replace(pronOld, pronNew); changes++; }
  else { console.log(`  [WARN] ${fname} — 발음 문장 배열 못 찾음`); }

  fs.writeFileSync(fpath, content, 'utf8');
  console.log(`  [OK] ${fname} — ${changes}개 변경`);
}

// ─── 실행 ─────────────────────────────────────────────────────────────────────
let done = 0;
for (const [fname, cfg] of Object.entries(LESSONS)) {
  try {
    applyLesson(fname, cfg);
    done++;
  } catch(e) {
    console.log(`  [ERR] ${fname}: ${e.message}`);
  }
}
console.log(`\n✅ 완료: ${done}개 파일`);
