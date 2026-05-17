/**
 * Level2 Lessons 1~5 — 과별 고유 AI 섹션 적용
 */
const fs = require('fs');
const path = require('path');
const dir = __dirname;

const LESSONS = {

  'HanwhaOcean_Level2_Lesson1.html': {
    bannerTitle: '💼 AI 자기소개 업그레이드',
    bannerSub: '경력 · 장점 · 목표 → 중급 자기소개 완성',
    bannerTag: '🔵 Career Intro Builder × Level2 Korean',
    quickBtns: `[
  { emoji:'🏆', label:'경력 소개 만들기',
    q:'한화오션 조선소 중급 한국어 학습자입니다. "저는 3년 경력의 용접공입니다. 장점은 성실한 것이에요." 처럼 경력과 장점을 소개하는 문장 5개를 만들어주세요. 영어도 함께요.' },
  { emoji:'🌟', label:'장점/단점 표현',
    q:'자기소개에서 쓰는 장점/단점 표현을 알려주세요. 성실하다, 꼼꼼하다, 적응력이 있다, 경험이 있다. 조선소 상황 예문으로 5개씩 영어와 함께 알려주세요.' },
  { emoji:'🎯', label:'목표/포부 표현',
    q:'한국어로 목표와 포부를 표현하는 방법을 알려주세요. "한국어를 더 잘하고 싶어요", "기술을 향상시키고 싶어요" 같은 표현을 조선소 맥락으로 5개 알려주세요.' },
  { emoji:'📝', label:'~는데 사용법',
    q:'한국어 ~(으)ㄴ/는데 표현을 자기소개에서 어떻게 쓰는지 설명해주세요. "경력이 있는데 더 배우고 싶어요", "어렵지만 열심히 해요" 같은 예문 5개를 영어와 함께요.' },
  { emoji:'🤝', label:'첫 출근 대화',
    q:'조선소 첫 출근 날 상사/동료에게 자기소개하는 대화를 연습해주세요. 이름, 나라, 경력, 포부를 말하는 롤플레이를 영어 해석과 함께 해주세요.' },
]`,
    systemPrompt: `You are a Korean self-introduction coach for intermediate learners at Hanwha Ocean shipyard. Lesson focus: career self-intro using ~(으)ㄴ/는데 (background/contrast), ~지만 (but/however), personality words: 자신감(confidence), 성격(personality), 장점(strength), 단점(weakness), 경력(career), 목표(goal). Keep answers SHORT with English translations.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국어로 경력과 장점을 소개하는 중급 자기소개 연습을 도와주세요. ~는데와 ~지만을 사용한 자연스러운 표현을 연습하고 싶어요. 영어로도 설명해 주세요."`,
    inputPlaceholder: `경력/장점/목표 질문 / Ask about career introductions...`,
    pronunciationItems: `[
      {sent:'안녕하세요. 저는 라민입니다.', eng:'Hello. I am Ramin.'},
      {sent:'저의 장점은 성실한 것이에요.', eng:'My strength is being diligent.'},
      {sent:'3년의 경력이 있어요.', eng:'I have 3 years of experience.'},
      {sent:'경력이 있는데 더 배우고 싶어요.', eng:'I have experience, but I want to learn more.'},
      {sent:'잘 부탁드립니다.', eng:'Please take good care of me.'},
    ]`,
  },

  'HanwhaOcean_Level2_Lesson2.html': {
    bannerTitle: '📞 AI 전화 통화 코치',
    bannerSub: '회사 전화 · 부재중 · 메시지 전달 연습',
    bannerTag: '🔵 Phone Call Coach × Workplace Korean',
    quickBtns: `[
  { emoji:'📲', label:'전화 받기 연습',
    q:'조선소 회사에서 전화를 받는 한국어 연습을 해주세요. "여보세요", "잠깐만요", "전화 바꿔드릴게요" 같은 표현을 롤플레이로 연습시켜주세요. 영어도 함께요.' },
  { emoji:'💬', label:'메시지 전달하기',
    q:'부재중에 메시지를 전달하는 한국어 표현을 알려주세요. "지금 자리에 없어요", "메모 남겨드릴까요?", "다시 전화해 주세요" 같은 표현 5가지를 영어와 함께요.' },
  { emoji:'🏭', label:'부서/이름 연결',
    q:'회사 전화에서 부서와 사람을 연결하는 한국어를 연습해주세요. "용접팀 연결해 주세요", "김 팀장님 계세요?" 같은 표현을 조선소 상황으로 5가지 알려주세요.' },
  { emoji:'🚨', label:'긴급 전화 표현',
    q:'조선소 긴급 상황에서 쓰는 전화 표현을 알려주세요. "사고가 났어요!", "빨리 와주세요", "의무실에 연락해주세요" 같은 긴급 표현을 영어와 함께 알려주세요.' },
  { emoji:'✏️', label:'전화 표현 복습',
    q:'회사 전화 관련 한국어 표현을 복습해주세요. 여보세요, 잠깐만요, 다시 전화할게요, 메시지, 부재중 — 이 단어들을 예문으로 영어와 함께 설명해주세요.' },
]`,
    systemPrompt: `You are a Korean workplace phone call coach for shipyard workers. Lesson focus: phone expressions like 여보세요(hello on phone), 잠깐만요(hold on), 전화 바꿔드릴게요(I'll transfer the call), 메시지 남기기(leave a message), 부재중(absent). Also demonstratives 이것/그것/저것 for identifying objects on the job. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 회사에서 한국어로 전화하는 연습을 도와주세요. 전화 받기, 메시지 전달하기, 긴급 상황 전화 표현을 롤플레이로 연습하고 싶어요. 영어로도 설명해 주세요."`,
    inputPlaceholder: `전화 표현 질문 / Ask about phone call Korean...`,
    pronunciationItems: `[
      {sent:'여보세요. 한화오션입니다.', eng:'Hello. This is Hanwha Ocean.'},
      {sent:'잠깐만요. 바꿔드릴게요.', eng:'Please hold. I\'ll transfer the call.'},
      {sent:'지금 자리에 없어요.', eng:'He/She is not at their desk right now.'},
      {sent:'메시지 남겨드릴까요?', eng:'Would you like to leave a message?'},
      {sent:'다시 전화해 주세요.', eng:'Please call again.'},
    ]`,
  },

  'HanwhaOcean_Level2_Lesson3.html': {
    bannerTitle: '📅 AI 약속 변경 도우미',
    bannerSub: '일정 조율 · 취소 · 변경 표현 실전 연습',
    bannerTag: '🔵 Appointment Manager × Schedule Korean',
    quickBtns: `[
  { emoji:'🔄', label:'약속 변경 요청',
    q:'약속을 변경 요청하는 한국어 대화를 연습해주세요. "목요일 오후 2시로 변경하고 싶어요", "괜찮으시면 다음 주로 미뤄도 될까요?" 같은 표현을 롤플레이로 해주세요.' },
  { emoji:'❌', label:'약속 취소하기',
    q:'약속을 취소하는 한국어 표현을 알려주세요. "갑자기 일이 생겼어요", "죄송하지만 취소하고 싶어요", "다음에 다시 잡아도 될까요?" 표현 5개를 영어와 함께 알려주세요.' },
  { emoji:'📆', label:'날짜/요일 표현',
    q:'한국어로 날짜와 요일을 말하는 연습을 해주세요. 월화수목금토일, 이번 주, 다음 주, 모레, 글피 표현을 조선소 일정 예문으로 영어와 함께 알려주세요.' },
  { emoji:'🤝', label:'회의 일정 잡기',
    q:'조선소에서 회의 일정을 잡는 한국어 대화를 연습해주세요. "언제 시간이 되세요?", "오후 3시는 어때요?", "그 시간은 괜찮아요" 같은 표현을 롤플레이로 해주세요.' },
  { emoji:'📝', label:'~는데 복습',
    q:'약속/일정 상황에서 ~(으)ㄴ/는데 표현을 연습해주세요. "회의가 있는데 시간을 바꿀 수 있어요?", "약속이 있었는데 취소해야 해요" — 예문 5개를 영어와 함께요.' },
]`,
    systemPrompt: `You are a Korean appointment and schedule coach for shipyard workers. Lesson focus: appointment change/cancel expressions like 약속 변경(appointment change), 취소(cancellation), 회의(meeting), 일정(schedule), ~(으)ㄴ/는데 for background explanation, date/time expressions for rescheduling. SHORT practical answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국어로 약속을 변경하고 취소하는 연습을 도와주세요. 회의 일정 조율과 날짜 표현을 롤플레이로 연습하고 싶어요. 영어로도 설명해 주세요."`,
    inputPlaceholder: `약속/일정 질문 / Ask about appointments and schedules...`,
    pronunciationItems: `[
      {sent:'약속을 변경해도 될까요?', eng:'May I change the appointment?'},
      {sent:'목요일 오후 2시로 바꾸고 싶어요.', eng:'I want to change it to Thursday at 2 PM.'},
      {sent:'갑자기 일이 생겼어요.', eng:'Something suddenly came up.'},
      {sent:'죄송합니다. 취소해야 할 것 같아요.', eng:'I\'m sorry. I think I need to cancel.'},
      {sent:'다음 주에 다시 잡을 수 있을까요?', eng:'Can we reschedule for next week?'},
    ]`,
  },

  'HanwhaOcean_Level2_Lesson4.html': {
    bannerTitle: '🏦 AI 은행 업무 도우미',
    bannerSub: '계좌 개설 · 송금 · 환전 표현 실전 연습',
    bannerTag: '🔵 Banking Guide × Financial Korean',
    quickBtns: `[
  { emoji:'💳', label:'계좌 개설하기',
    q:'한국 은행에서 계좌를 개설하는 한국어 대화를 연습해주세요. "계좌를 만들고 싶어요", "외국인 등록증이 있어요", "통장 주세요" 같은 표현을 롤플레이로 해주세요.' },
  { emoji:'💸', label:'해외 송금하기',
    q:'고향으로 돈을 보내는 한국어 표현을 알려주세요. "해외 송금하고 싶어요", "환율이 얼마예요?", "수수료가 얼마예요?" 같은 은행 표현 5개를 영어와 함께 알려주세요.' },
  { emoji:'🔢', label:'계좌번호 말하기',
    q:'한국어로 계좌번호, 전화번호, 금액을 말하는 연습을 해주세요. 숫자를 한국어로 읽는 방법과 "제 계좌번호는 ~입니다" 표현을 영어와 함께 알려주세요.' },
  { emoji:'🏧', label:'ATM 사용 표현',
    q:'한국 ATM 사용 관련 한국어를 알려주세요. 입금, 출금, 이체, 잔액조회, 비밀번호 표현을 영어와 함께 알려주세요. ATM 화면 한국어도 설명해주세요.' },
  { emoji:'❓', label:'은행 어휘 복습',
    q:'은행에서 쓰는 중요한 한국어 단어를 복습해주세요. 계좌, 입금, 출금, 이자, 수수료, 환율, 원금을 예문과 영어 설명으로 각각 알려주세요.' },
]`,
    systemPrompt: `You are a Korean banking guide for foreign workers in Korea. Lesson focus: banking vocabulary 계좌(account), 입금(deposit), 출금(withdrawal), 이자(interest), 수수료(fee), 환율(exchange rate), 송금(remittance). Help with practical banking conversations at Korean banks. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국 은행에서 계좌 개설, 송금, 환전하는 한국어 대화를 연습하고 싶어요. 은행 직원과 대화하는 롤플레이를 도와주세요. 영어로도 설명해 주세요."`,
    inputPlaceholder: `은행 업무 질문 / Ask about banking in Korean...`,
    pronunciationItems: `[
      {sent:'계좌를 만들고 싶어요.', eng:'I want to open an account.'},
      {sent:'오늘 환율이 얼마예요?', eng:'What is today\'s exchange rate?'},
      {sent:'해외 송금 수수료가 얼마예요?', eng:'How much is the overseas transfer fee?'},
      {sent:'돈을 출금하고 싶어요.', eng:'I want to withdraw money.'},
      {sent:'잔액이 얼마예요?', eng:'What is my balance?'},
    ]`,
  },

  'HanwhaOcean_Level2_Lesson5.html': {
    bannerTitle: '🏥 AI 병원 통역 도우미',
    bannerSub: '증상 설명 · 처방 · 진단 표현 실전 연습',
    bannerTag: '🔵 Hospital Guide × Medical Korean',
    quickBtns: `[
  { emoji:'🤒', label:'증상 설명하기',
    q:'조선소 작업 중 다치거나 아플 때 한국어로 증상을 설명하는 연습을 해주세요. "여기가 아파요", "어지러워요", "숨이 차요" 같은 표현을 의사에게 말하는 롤플레이로 해주세요.' },
  { emoji:'💊', label:'처방/약 표현',
    q:'병원에서 처방받고 약국에서 약을 사는 한국어를 알려주세요. "이 약은 언제 먹어요?", "식후에 드세요", "하루 세 번" 같은 표현을 영어와 함께 알려주세요.' },
  { emoji:'🚑', label:'긴급 상황 표현',
    q:'조선소 작업 중 긴급 의료 상황에서 쓰는 한국어를 알려주세요. "119에 신고해주세요", "사람이 쓰러졌어요", "빨리 구급차를 불러주세요" 표현을 영어와 함께요.' },
  { emoji:'📋', label:'~다고 하다 표현',
    q:'한국어 간접화법 ~다고 하다를 의료 상황으로 연습해주세요. "의사가 감기라고 했어요", "약을 먹으라고 했어요" 같은 표현 5개를 영어와 함께 알려주세요.' },
  { emoji:'🏪', label:'의료보험/비용',
    q:'한국에서 외국인 근로자가 병원을 이용할 때 알아야 할 한국어를 알려주세요. 건강보험, 진찰료, 약값, 산재보험 관련 표현을 영어와 함께 5가지 알려주세요.' },
]`,
    systemPrompt: `You are a Korean medical guide for foreign workers in Korea. Lesson focus: hospital/medical vocabulary 병원(hospital), 의사(doctor), 처방(prescription), 약(medicine), 약국(pharmacy), 증상(symptom), indirect quotation ~다고 하다 (doctor said...), ~(으)면 좋겠다 (I hope...). Help describe symptoms and understand doctor instructions. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국 병원에서 증상을 설명하고 의사 말을 이해하는 한국어 연습을 도와주세요. 아플 때 쓰는 표현과 처방전 읽는 방법을 알고 싶어요. 영어로도 설명해 주세요."`,
    inputPlaceholder: `증상/병원 질문 / Ask about medical Korean...`,
    pronunciationItems: `[
      {sent:'여기가 많이 아파요.', eng:'It hurts a lot here.'},
      {sent:'의사가 감기라고 했어요.', eng:'The doctor said it is a cold.'},
      {sent:'약을 하루 세 번 먹으세요.', eng:'Take the medicine three times a day.'},
      {sent:'119에 신고해 주세요.', eng:'Please call 119 (emergency).'},
      {sent:'산재 처리를 해주세요.', eng:'Please process the industrial accident insurance.'},
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
  content = content.slice(0, btnStart) + 'var AI_QUICK_BTNS = ' + cfg.quickBtns + content.slice(btnEnd);
  changes++;

  // 2) 시스템 프롬프트 교체
  const sysOld = `'You are a Korean language tutor for foreign workers at Hanwha Ocean shipyard in Geoje, Korea. Students are beginner level (KIIP Level 1-2). Always: 1) Keep answers SHORT and CLEAR 2) Include English translations 3) Focus on practical shipyard expressions 4) Use simple grammar. Reply in Korean with English translation.'`;
  if (content.includes(sysOld)) { content = content.replace(sysOld, `'${cfg.systemPrompt}'`); changes++; }

  // 3) 배너 제목
  const bannerOld = '에이전틱 G스택 조선소 한국어 실습';
  if (content.includes(bannerOld)) { content = content.replace(bannerOld, cfg.bannerTitle); changes++; }

  // 4) 배너 태그
  const tagOld = '🔵 Shipyard Korean Learning × AI Agents';
  if (content.includes(tagOld)) { content = content.replace(tagOld, cfg.bannerTag); changes++; }

  // 5) 배너 서브
  const subOld = 'Google Gemini · Claude AI · Agent Harness 연계';
  if (content.includes(subOld)) { content = content.replace(subOld, cfg.bannerSub); changes++; }

  // 6) 입력 placeholder
  const phOld = 'placeholder="조선소 한국어 질문 / Ask about shipyard Korean..."';
  if (content.includes(phOld)) { content = content.replace(phOld, `placeholder="${cfg.inputPlaceholder}"`); changes++; }

  // 7) Gemini 프롬프트
  const gemOld = `"저는 한화오션 조선소 외국인 근로자예요. 이번 과에서 배운 표현으로 상사와 대화하는 롤플레이를 도와주세요. 영어로도 설명해 주세요."`;
  if (content.includes(gemOld)) { content = content.replace(gemOld, cfg.geminiPrompt); changes++; }

  // 8) 발음 문장
  const pronOld = `[
      {sent:'안전모를 착용하세요.', eng:'Please wear your safety helmet.'},
      {sent:'작업 지시서를 확인하세요.', eng:'Please check the work order.'},
      {sent:'도움이 필요합니다.', eng:'I need help.'},
      {sent:'작업이 완료되었습니다.', eng:'The work is complete.'},
      {sent:'위험합니다. 조심하세요!', eng:'It is dangerous. Please be careful!'},
    ]`;
  if (content.includes(pronOld)) { content = content.replace(pronOld, cfg.pronunciationItems); changes++; }

  fs.writeFileSync(fpath, content, 'utf8');
  console.log(`  [OK] ${fname} — ${changes}개 변경`);
}

let done = 0;
for (const [fname, cfg] of Object.entries(LESSONS)) {
  try { applyLesson(fname, cfg); done++; }
  catch(e) { console.log(`  [ERR] ${fname}: ${e.message}`); }
}
console.log(`\n✅ 완료: ${done}개 파일`);
