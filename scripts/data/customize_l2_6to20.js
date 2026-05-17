/**
 * Level2 Lessons 6~20 — 과별 고유 AI 섹션 적용
 */
const fs = require('fs');
const path = require('path');
const dir = __dirname;

const LESSONS = {

  'HanwhaOcean_Level2_Lesson6.html': {
    bannerTitle: '📰 AI 뉴스 읽기 코치',
    bannerSub: '한국 뉴스 · 조선업 기사 · 미디어 표현',
    bannerTag: '🔵 News Reading Coach × Media Korean',
    quickBtns: `[
  { emoji:'📡', label:'조선소 관련 뉴스',
    q:'한화오션 관련 뉴스 표현을 한국어로 알려주세요. 수주, 선박 건조, 수출, 조선업 동향 관련 표현을 영어와 함께 5가지 알려주세요. 뉴스에서 자주 보이는 단어로요.' },
  { emoji:'🗞️', label:'뉴스 어휘 설명',
    q:'한국 뉴스에서 자주 나오는 어휘를 설명해주세요. 기사, 인터뷰, 보도, 발표, 정책이 뭔지 영어로 설명하고 뉴스 헤드라인 예시를 3개 만들어주세요.' },
  { emoji:'🎙️', label:'~(으)ㄴ 적이 있다',
    q:'경험 표현 ~(으)ㄴ 적이 있다를 한국 생활/뉴스 상황으로 연습해주세요. "한국 뉴스를 본 적이 있어요?", "조선소 사고를 들은 적이 있어요?" 문장 5개를 영어와 함께요.' },
  { emoji:'📱', label:'SNS/미디어 소비',
    q:'한국 SNS와 미디어를 이용하는 방법을 한국어로 알려주세요. 유튜브, 네이버, 카카오뉴스에서 한국어 뉴스를 찾고 이해하는 팁을 영어와 함께 알려주세요.' },
  { emoji:'🔔', label:'안전 뉴스/공지',
    q:'조선소 안전 공지와 뉴스를 이해하는 한국어 표현을 알려주세요. 작업 중단 공지, 안전 교육 안내, 태풍 경보 공지를 이해하는 표현을 영어와 함께요.' },
]`,
    systemPrompt: `You are a Korean news and media literacy coach for shipyard workers. Lesson focus: media vocabulary 뉴스(news), 기사(article), 인터뷰(interview), 미디어(media), 보도(report), experience expression ~(으)ㄴ 적이 있다 (have experienced). Help workers understand Korean news related to shipbuilding industry. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국 뉴스를 읽고 이해하는 연습을 도와주세요. 조선업 관련 뉴스 어휘와 미디어 표현을 영어로도 설명해 주세요."`,
    inputPlaceholder: `뉴스/미디어 질문 / Ask about Korean news and media...`,
    pronunciationItems: `[
      {sent:'오늘 뉴스에서 뭐라고 했어요?', eng:'What did they say in today\'s news?'},
      {sent:'한화오션이 대형 선박을 수주했어요.', eng:'Hanwha Ocean received an order for a large ship.'},
      {sent:'조선업이 요즘 바빠요.', eng:'The shipbuilding industry is busy these days.'},
      {sent:'안전 교육이 있다고 공지가 났어요.', eng:'There was a notice about safety training.'},
      {sent:'한국 뉴스를 매일 보려고 해요.', eng:'I try to watch Korean news every day.'},
    ]`,
  },

  'HanwhaOcean_Level2_Lesson7.html': {
    bannerTitle: '🤝 AI 회의 참여 코치',
    bannerSub: '의견 표현 · 발언 · 한국 회의 문화',
    bannerTag: '🔵 Meeting Participation Coach × Workplace Korean',
    quickBtns: `[
  { emoji:'💼', label:'회의 참여 표현',
    q:'조선소 작업 회의에서 참여하는 한국어 표현을 알려주세요. "저도 의견이 있어요", "잘 모르겠어요", "동의해요" 같은 회의 참여 표현을 영어와 함께 5가지요.' },
  { emoji:'🗣️', label:'의견 말하기',
    q:'한국어로 의견을 표현하는 방법을 알려주세요. "제 생각에는 ~인 것 같아요", "~뿐만 아니라 ~도 있어요", "저는 ~라고 생각해요" 같은 표현을 영어와 함께요.' },
  { emoji:'❓', label:'모를 때 표현',
    q:'회의에서 이해 못 했을 때 쓰는 한국어를 알려주세요. "다시 한번 말씀해 주세요", "이 부분이 잘 이해가 안 돼요", "제가 맞게 이해한 건가요?" 표현을 영어와 함께요.' },
  { emoji:'⏰', label:'회의 시작/종료',
    q:'작업 회의 시작과 종료 표현을 한국어로 알려주세요. "회의 시작하겠습니다", "오늘 안건은 ~입니다", "회의를 마치겠습니다" 같은 공식 표현을 영어와 함께요.' },
  { emoji:'📋', label:'작업 보고하기',
    q:'작업 현황을 회의에서 보고하는 한국어 표현을 알려주세요. "어제 작업은 완료했습니다", "문제가 있어요", "내일까지 마칠 예정이에요" 표현을 영어와 함께요.' },
]`,
    systemPrompt: `You are a Korean workplace meeting coach for shipyard workers. Lesson focus: meeting vocabulary 회의(meeting), 참석(attendance), 발언(speak up), 의견(opinion), 조직(organization), complex pattern ~(으)ㄹ 뿐만 아니라 (not only...but also). Help workers participate in Korean workplace meetings. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국어로 작업 회의에 참여하고 의견을 표현하는 연습을 도와주세요. 한국 회의 문화와 발언 표현을 영어로도 설명해 주세요."`,
    inputPlaceholder: `회의/의견 표현 질문 / Ask about Korean meeting expressions...`,
    pronunciationItems: `[
      {sent:'저도 의견이 있어요.', eng:'I have an opinion too.'},
      {sent:'다시 한번 말씀해 주세요.', eng:'Please say that one more time.'},
      {sent:'어제 작업은 완료했습니다.', eng:'Yesterday\'s work has been completed.'},
      {sent:'문제가 발생했어요.', eng:'A problem has occurred.'},
      {sent:'회의에서 안전 사항을 확인했어요.', eng:'We confirmed safety matters at the meeting.'},
    ]`,
  },

  'HanwhaOcean_Level2_Lesson8.html': {
    bannerTitle: '📄 AI 계약서 이해 도우미',
    bannerSub: '근로 계약 · 노동 조건 · 권리 표현',
    bannerTag: '🔵 Labor Contract Guide × Legal Korean',
    quickBtns: `[
  { emoji:'📝', label:'계약서 항목 이해',
    q:'한국 근로 계약서에 나오는 한국어 항목을 설명해주세요. 임금, 근무 시간, 휴가, 계약 기간, 복리후생이 영어로 뭔지, 계약서에서 중요한 부분을 알려주세요.' },
  { emoji:'⚖️', label:'근로자 권리',
    q:'한국에서 외국인 근로자의 권리를 한국어로 알려주세요. 최저임금, 초과근무 수당, 유급 휴가, 산재보험 관련 표현과 권리를 영어와 함께 설명해주세요.' },
  { emoji:'💰', label:'임금/수당 표현',
    q:'임금과 수당 관련 한국어 표현을 알려주세요. "이번 달 월급이 얼마예요?", "야근 수당 받았어요?", "명세서 확인해 주세요" 같은 표현을 영어와 함께 5가지요.' },
  { emoji:'📞', label:'근로 분쟁 도움',
    q:'근로 조건에 문제가 생겼을 때 도움을 요청하는 한국어를 알려주세요. 노동부, 근로감독관, 외국인 근로자 지원센터에 연락하는 표현을 영어와 함께요.' },
  { emoji:'📜', label:'~에 의하면 표현',
    q:'인용 표현 ~에 의하면을 계약/법률 상황으로 연습해주세요. "계약서에 의하면 월급은 ~이에요", "법에 의하면 ~해야 해요" 문장 5개를 영어와 함께요.' },
]`,
    systemPrompt: `You are a Korean labor rights and contract guide for foreign workers in Korea. Lesson focus: contract vocabulary 계약(contract), 조건(conditions), 협의(negotiation), 서명(signature), 기한(deadline), quote/source expression ~에 의하면 (according to). Help workers understand their rights. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국 근로 계약서를 이해하고 근로자 권리를 알고 싶어요. 임금, 수당, 휴가 관련 한국어 표현을 영어로도 설명해 주세요."`,
    inputPlaceholder: `계약/노동권 질문 / Ask about labor contracts in Korean...`,
    pronunciationItems: `[
      {sent:'계약서를 읽어야 해요.', eng:'I need to read the contract.'},
      {sent:'월급이 언제 나와요?', eng:'When does the salary come out?'},
      {sent:'야근 수당이 있어요?', eng:'Is there overtime pay?'},
      {sent:'이 조항이 무슨 뜻이에요?', eng:'What does this clause mean?'},
      {sent:'근로자 권리를 알고 싶어요.', eng:'I want to know my worker rights.'},
    ]`,
  },

  'HanwhaOcean_Level2_Lesson9.html': {
    bannerTitle: '🔧 AI 고장 신고 코치',
    bannerSub: '장비 결함 · 수리 요청 · 안전 보고',
    bannerTag: '🔵 Equipment Report Coach × Maintenance Korean',
    quickBtns: `[
  { emoji:'🚨', label:'고장 신고하기',
    q:'조선소 장비가 고장났을 때 한국어로 신고하는 연습을 해주세요. "용접기가 고장났어요", "크레인이 작동 안 해요", "수리가 필요해요" 표현을 롤플레이로 해주세요.' },
  { emoji:'⚠️', label:'안전 위험 보고',
    q:'작업 현장 안전 위험을 보고하는 한국어 표현을 알려주세요. "가스가 새요", "바닥이 미끄러워요", "전기 스파크가 있어요" 같은 위험 신고 표현을 영어와 함께요.' },
  { emoji:'🔩', label:'부품/도구 요청',
    q:'부품이나 도구 교체를 요청하는 한국어 표현을 알려주세요. "새 부품이 필요해요", "이 부분을 교체해야 해요", "예비 부품 있어요?" 표현을 영어와 함께 5가지요.' },
  { emoji:'📋', label:'작업 중단 요청',
    q:'안전을 이유로 작업 중단을 요청하는 한국어를 알려주세요. "지금 작업하면 위험해요", "작업을 잠깐 멈춰야 해요", "안전 점검이 필요해요" 표현을 영어와 함께요.' },
  { emoji:'📝', label:'~아/어 놓다 표현',
    q:'완료 상태 유지 표현 ~아/어 놓다를 작업 상황으로 연습해주세요. "부품을 교체해 놓았어요", "점검해 놓았어요", "준비해 놓았어요" 문장 5개를 영어와 함께요.' },
]`,
    systemPrompt: `You are a Korean equipment maintenance and safety reporting coach for shipyard workers. Lesson focus: malfunction vocabulary 고장(breakdown), 신고(report), 결함(defect), 수리(repair), 안전(safety), leave-in-state expression ~아/어 놓다. Help workers report equipment issues. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 장비 고장을 신고하고 안전 위험을 보고하는 한국어 표현을 배우고 싶어요. 수리 요청과 안전 점검 표현을 영어로도 설명해 주세요."`,
    inputPlaceholder: `고장/안전 신고 질문 / Ask about equipment reports...`,
    pronunciationItems: `[
      {sent:'용접기가 고장났어요.', eng:'The welding machine is broken.'},
      {sent:'즉시 수리가 필요해요.', eng:'Immediate repair is needed.'},
      {sent:'작업을 잠깐 중단해야 해요.', eng:'We need to temporarily stop work.'},
      {sent:'안전 점검을 요청합니다.', eng:'I request a safety inspection.'},
      {sent:'바닥이 미끄러워서 위험해요.', eng:'The floor is slippery and dangerous.'},
    ]`,
  },

  'HanwhaOcean_Level2_Lesson10.html': {
    bannerTitle: '🏛️ AI 한국 문화 가이드',
    bannerSub: '역사 · 전통 · 문화유산 이해하기',
    bannerTag: '🔵 Korean Culture Guide × Heritage Korean',
    quickBtns: `[
  { emoji:'🎎', label:'한국 전통 문화',
    q:'한국 전통 문화를 한국어로 소개해주세요. 설날, 추석, 한복, 태권도, 판소리 같은 전통 표현을 영어와 함께, 외국인 근로자가 알면 도움 되는 문화 상식으로 알려주세요.' },
  { emoji:'🗺️', label:'거제도 역사',
    q:'한화오션이 있는 거제도의 역사와 문화를 한국어로 알려주세요. 거제도 유명 관광지와 역사적 배경을 영어와 함께 소개해주세요.' },
  { emoji:'🎋', label:'한국 명절 이해',
    q:'한국 주요 명절을 이해하는 데 도움이 되는 한국어 표현을 알려주세요. 추석, 설날, 한국 공휴일에 쓰는 인사와 전통 음식 이름을 영어와 함께 5가지요.' },
  { emoji:'🏯', label:'역사 어휘 연습',
    q:'한국 역사 관련 한국어 어휘를 알려주세요. 역사, 문화유산, 전통, 왕조, 유물이 영어로 뭔지 설명하고, 한국 역사에서 외국인이 알면 좋은 내용을 간단히 알려주세요.' },
  { emoji:'🤝', label:'문화 차이 이해',
    q:'한국 문화와 외국인 근로자 나라의 문화 차이를 한국어로 이해하는 방법을 알려주세요. 존댓말 문화, 나이 표현, 식사 예절 차이를 영어로 쉽게 설명해주세요.' },
]`,
    systemPrompt: `You are a Korean culture and history guide for foreign workers. Lesson focus: history/culture vocabulary 역사(history), 문화유산(cultural heritage), 전통(tradition), 시대(era), 유물(artifact). Help workers understand Korean culture and traditions relevant to living in Geoje, Korea. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국 전통 문화와 역사를 이해하는 데 도움이 되는 한국어 표현을 알고 싶어요. 거제도 문화와 한국 명절에 대해 영어로도 설명해 주세요."`,
    inputPlaceholder: `한국 문화/역사 질문 / Ask about Korean culture...`,
    pronunciationItems: `[
      {sent:'추석에 뭐 해요?', eng:'What do you do during Chuseok?'},
      {sent:'한국 전통 음식을 먹어봤어요.', eng:'I\'ve tried traditional Korean food.'},
      {sent:'거제도에 관광지가 많아요.', eng:'There are many tourist attractions in Geoje.'},
      {sent:'한국 문화가 흥미로워요.', eng:'Korean culture is interesting.'},
      {sent:'한국에서 좋은 경험을 하고 있어요.', eng:'I\'m having a good experience in Korea.'},
    ]`,
  },

  'HanwhaOcean_Level2_Lesson11.html': {
    bannerTitle: '✈️ AI 여행 계획 코치',
    bannerSub: '한국 여행 · 예약 · 여행 표현 연습',
    bannerTag: '🔵 Travel Planning Coach × Tourism Korean',
    quickBtns: `[
  { emoji:'🗺️', label:'한국 여행 계획',
    q:'외국인 근로자가 한국에서 여행하는 계획을 한국어로 세우는 연습을 해주세요. 부산, 서울, 제주도 여행 계획을 "~에 가려고 해요", "~을/를 예약했어요"로 표현하는 방법을요.' },
  { emoji:'🏨', label:'호텔 예약',
    q:'한국어로 호텔을 예약하는 대화를 연습해주세요. "1박 2일로 예약하고 싶어요", "체크인이 몇 시예요?", "조식 포함이에요?" 같은 표현을 롤플레이로 해주세요.' },
  { emoji:'✈️', label:'비행기/교통 예약',
    q:'한국에서 비행기와 기차를 예약하는 한국어를 알려주세요. 코레일, KTX, 항공권 예약 관련 표현과 외국인 근로자가 귀국할 때 필요한 표현을 영어와 함께요.' },
  { emoji:'🍜', label:'여행지 음식 표현',
    q:'한국 여행지에서 먹을 수 있는 음식을 한국어로 알려주세요. 부산 해물탕, 서울 떡볶이, 제주 흑돼지 같은 지역 음식을 주문하는 표현을 영어와 함께 알려주세요.' },
  { emoji:'📸', label:'여행 경험 말하기',
    q:'여행 경험을 한국어로 이야기하는 연습을 해주세요. "부산에 간 적이 있어요", "해운대에서 수영했어요", "경치가 정말 좋았어요" 같은 경험 표현을 영어와 함께요.' },
]`,
    systemPrompt: `You are a Korean travel planning coach for foreign workers in Korea. Lesson focus: travel vocabulary 여행(travel), 계획(plan), 비행기(airplane), 예약(reservation), 호텔(hotel), past experience ~(으)ㄴ 적이 있다. Help workers plan domestic Korean travel during vacation. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국 국내 여행 계획을 세우고 숙소와 교통을 예약하는 한국어 연습을 도와주세요. 여행지 표현을 영어로도 설명해 주세요."`,
    inputPlaceholder: `여행/예약 질문 / Ask about travel in Korean...`,
    pronunciationItems: `[
      {sent:'부산에 여행 가고 싶어요.', eng:'I want to travel to Busan.'},
      {sent:'호텔을 예약했어요.', eng:'I made a hotel reservation.'},
      {sent:'체크인이 몇 시예요?', eng:'What time is check-in?'},
      {sent:'해운대에 가 본 적이 있어요?', eng:'Have you ever been to Haeundae?'},
      {sent:'경치가 정말 아름다워요.', eng:'The scenery is really beautiful.'},
    ]`,
  },

  'HanwhaOcean_Level2_Lesson12.html': {
    bannerTitle: '🍜 AI 음식 리뷰 코치',
    bannerSub: '맛 표현 · 식당 주문 · 음식 문화',
    bannerTag: '🔵 Food Review Coach × Taste Korean',
    quickBtns: `[
  { emoji:'😋', label:'맛 표현하기',
    q:'한국어로 음식 맛을 표현하는 연습을 해주세요. "맵지만 맛있어요", "짜요", "달아요", "고소해요" 같은 맛 형용사를 써서 음식 리뷰를 만드는 방법을 영어와 함께 알려주세요.' },
  { emoji:'🍱', label:'한식 메뉴 이해',
    q:'한국 식당 메뉴판에서 자주 보이는 음식을 한국어로 설명해주세요. 갈비탕, 순두부찌개, 삼겹살, 냉면을 영어로 설명하고 주문 방법도 알려주세요.' },
  { emoji:'🌶️', label:'요청/조절 표현',
    q:'음식을 주문할 때 요청사항을 말하는 한국어를 알려주세요. "덜 맵게 해주세요", "육수 빼주세요", "따뜻한 물 주세요" 같은 요청 표현을 영어와 함께 5가지요.' },
  { emoji:'⭐', label:'식당 리뷰 작성',
    q:'한국어로 식당 리뷰를 쓰는 연습을 해주세요. "음식이 신선해요", "서비스가 좋아요", "다음에 또 올 거예요" 같은 리뷰 표현을 영어와 함께 만들어주세요.' },
  { emoji:'🍺', label:'회식 문화 이해',
    q:'한국 회식 문화를 이해하는 데 필요한 한국어를 알려주세요. "건배!", "한 잔 더?", "제가 한 턱 낼게요" 같은 회식 표현과 문화 설명을 영어와 함께요.' },
]`,
    systemPrompt: `You are a Korean food and dining culture coach. Lesson focus: food taste vocabulary 음식(food), 맛(taste), 맵다(spicy), 김치(kimchi), 맛있다(delicious), adjective descriptions with 아/어요 forms. Help workers understand Korean cuisine and restaurant culture. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국 음식 맛을 표현하고 식당에서 자연스럽게 주문하는 한국어 연습을 도와주세요. 한국 음식 문화도 영어로 설명해 주세요."`,
    inputPlaceholder: `음식/맛 표현 질문 / Ask about Korean food expressions...`,
    pronunciationItems: `[
      {sent:'이 음식이 너무 맛있어요.', eng:'This food is so delicious.'},
      {sent:'좀 덜 맵게 해 주세요.', eng:'Please make it a little less spicy.'},
      {sent:'한국 음식이 입에 맞아요.', eng:'Korean food suits my taste.'},
      {sent:'여기 어떤 음식이 유명해요?', eng:'What food is famous here?'},
      {sent:'건배! 다 같이 화이팅!', eng:'Cheers! Everyone, fighting!'},
    ]`,
  },

  'HanwhaOcean_Level2_Lesson13.html': {
    bannerTitle: '♻️ AI 환경 생활 가이드',
    bannerSub: '분리수거 · 환경 규칙 · 한국 환경 문화',
    bannerTag: '🔵 Eco Guide × Environmental Korean',
    quickBtns: `[
  { emoji:'🗑️', label:'분리수거 방법',
    q:'한국 분리수거 방법을 한국어로 설명해주세요. 플라스틱, 종이, 유리, 캔, 음식물 쓰레기를 어떻게 버리는지, 쓰레기봉투 사는 방법을 영어와 함께 알려주세요.' },
  { emoji:'🌿', label:'환경 어휘 이해',
    q:'한국 환경 관련 한국어 어휘를 설명해주세요. 환경, 오염, 재활용, 분리수거, 탄소 배출이 영어로 뭔지, 조선소에서 환경 보호를 위해 하는 일도 알려주세요.' },
  { emoji:'🏭', label:'조선소 환경 규칙',
    q:'조선소에서 지켜야 하는 환경 관련 규칙을 한국어로 알려주세요. 폐기물 처리, 기름 유출 방지, 소음 규정 같은 환경 규칙 표현을 영어와 함께 알려주세요.' },
  { emoji:'💧', label:'절약 표현 연습',
    q:'에너지와 자원을 절약하는 한국어 표현을 알려주세요. "물을 아껴 써야 해요", "불을 꺼야 해요", "에너지를 절약합시다" 같은 표현을 영어와 함께 5가지요.' },
  { emoji:'📋', label:'~해야 해요 연습',
    q:'의무 표현 ~해야 해요를 환경 규칙 상황으로 연습해주세요. "분리수거해야 해요", "쓰레기를 함부로 버리면 안 돼요" 같은 규칙 문장 5개를 영어와 함께요.' },
]`,
    systemPrompt: `You are a Korean environmental practices coach for workers in Korea. Lesson focus: environment vocabulary 환경(environment), 오염(pollution), 쓰레기(garbage), 분리수거(waste sorting), 재활용(recycling), obligation ~해야 해요 (must/should). Help workers follow Korean recycling rules. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국의 분리수거 방법과 환경 규칙을 이해하는 한국어 표현을 배우고 싶어요. 조선소 환경 규정도 영어로 설명해 주세요."`,
    inputPlaceholder: `환경/분리수거 질문 / Ask about Korean environmental rules...`,
    pronunciationItems: `[
      {sent:'여기서 분리수거해야 해요.', eng:'We need to sort waste here.'},
      {sent:'플라스틱은 저 통에 버려요.', eng:'Put plastic in that bin.'},
      {sent:'음식물 쓰레기는 따로 버려요.', eng:'Food waste goes in a separate bin.'},
      {sent:'환경을 보호해야 해요.', eng:'We must protect the environment.'},
      {sent:'쓰레기를 함부로 버리면 안 돼요.', eng:'You should not litter carelessly.'},
    ]`,
  },

  'HanwhaOcean_Level2_Lesson14.html': {
    bannerTitle: '📚 AI 교육 훈련 도우미',
    bannerSub: '직업 훈련 · 시험 · 학습 표현 연습',
    bannerTag: '🔵 Training & Education Coach × Learning Korean',
    quickBtns: `[
  { emoji:'🎓', label:'직업 훈련 표현',
    q:'조선소 직업 훈련과 관련된 한국어 표현을 알려주세요. "안전 교육을 받았어요", "기술 훈련이 있어요", "수료증을 받고 싶어요" 같은 표현을 영어와 함께 5가지요.' },
  { emoji:'📝', label:'시험/평가 표현',
    q:'한국 시험과 평가 관련 한국어를 알려주세요. 시험, 평가, 합격, 불합격, 성적이 영어로 뭔지, 자격시험을 준비할 때 필요한 표현을 영어와 함께요.' },
  { emoji:'🏫', label:'사회통합프로그램',
    q:'KIIP 사회통합프로그램에 대해 한국어로 설명해주세요. 참여 방법, 단계, 수료 혜택을 외국인 근로자가 이해할 수 있도록 영어와 함께 설명해주세요.' },
  { emoji:'💡', label:'모르는 것 물어보기',
    q:'교육/훈련 중 모르는 것을 질문하는 한국어를 알려주세요. "이 부분을 다시 설명해 주세요", "실습해볼 수 있어요?", "숙제가 있어요?" 표현을 영어와 함께요.' },
  { emoji:'🔑', label:'~해야 해요 교육 표현',
    q:'교육에서 쓰는 의무/필요 표현을 연습해주세요. "교육에 참석해야 해요", "안전 규정을 숙지해야 해요", "시험에 합격해야 해요" 문장 5개를 영어와 함께요.' },
]`,
    systemPrompt: `You are a Korean vocational training and education coach. Lesson focus: education vocabulary 교육(education), 학교(school), 학생(student), 시험(exam), 졸업(graduation), necessity/requirement ~해야 해요. Help workers understand training programs and educational requirements. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 직업 훈련과 교육 프로그램에 참여하는 데 필요한 한국어 표현을 배우고 싶어요. KIIP 프로그램과 자격증 취득 관련 표현을 영어로도 설명해 주세요."`,
    inputPlaceholder: `교육/훈련 질문 / Ask about education in Korean...`,
    pronunciationItems: `[
      {sent:'안전 교육을 받아야 해요.', eng:'I need to receive safety training.'},
      {sent:'시험에 합격했어요.', eng:'I passed the exam.'},
      {sent:'이 부분을 다시 설명해 주세요.', eng:'Please explain this part again.'},
      {sent:'수료증을 받고 싶어요.', eng:'I want to receive a certificate of completion.'},
      {sent:'열심히 공부해서 합격할 거예요.', eng:'I will study hard and pass.'},
    ]`,
  },

  'HanwhaOcean_Level2_Lesson15.html': {
    bannerTitle: '📈 AI 경제 뉴스 코치',
    bannerSub: '조선업 경제 · 무역 · 경제 뉴스 이해',
    bannerTag: '🔵 Business News Coach × Economic Korean',
    quickBtns: `[
  { emoji:'🚢', label:'조선업 경제 뉴스',
    q:'한화오션과 조선업 관련 경제 뉴스를 이해하는 한국어 어휘를 알려주세요. 수주, 선박 건조, 수출, 매출, 흑자/적자 같은 표현을 영어와 함께 설명해주세요.' },
  { emoji:'💹', label:'환율/물가 표현',
    q:'한국 경제와 외국인 근로자 생활에 관련된 표현을 알려주세요. 환율이 올랐어요/내렸어요, 물가가 높아요, 월급 실수령액이 영어와 함께 어떻게 표현하는지요.' },
  { emoji:'🌏', label:'무역/수출 어휘',
    q:'조선소와 관련된 무역과 수출 한국어 어휘를 알려주세요. 수출, 수입, 무역, 계약, LNG 선박, 컨테이너선이 영어로 뭔지 설명하고 예문도 만들어주세요.' },
  { emoji:'📊', label:'경제 지표 이해',
    q:'한국 경제 뉴스에서 자주 나오는 지표를 한국어로 설명해주세요. 최저임금, 실업률, GDP, 경제 성장률이 영어로 뭔지, 외국인 근로자와 관련된 내용으로요.' },
  { emoji:'💰', label:'임금/생활비 계산',
    q:'외국인 근로자의 임금과 생활비를 한국어로 계산하는 연습을 해주세요. 총급여, 공제, 실수령, 생활비, 저축을 한국어로 표현하는 방법을 영어와 함께요.' },
]`,
    systemPrompt: `You are a Korean economics and business news coach for foreign workers. Lesson focus: economic vocabulary 경제(economy), 뉴스(news), 무역(trade), 수출(export), 투자(investment), article reading patterns. Help workers understand Korean economic news related to shipbuilding. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 조선업 경제 뉴스를 이해하고 임금과 생활비 관련 한국어 표현을 배우고 싶어요. 경제 어휘를 영어로도 설명해 주세요."`,
    inputPlaceholder: `경제/뉴스 질문 / Ask about economic Korean...`,
    pronunciationItems: `[
      {sent:'한화오션이 대형 선박을 수주했어요.', eng:'Hanwha Ocean received an order for large ships.'},
      {sent:'환율이 올라서 송금이 유리해요.', eng:'The exchange rate rose so remittance is favorable.'},
      {sent:'올해 조선업이 호황이에요.', eng:'The shipbuilding industry is booming this year.'},
      {sent:'최저임금이 인상되었어요.', eng:'The minimum wage has been raised.'},
      {sent:'이번 달 월급 명세서예요.', eng:'This is this month\'s paycheck stub.'},
    ]`,
  },

  'HanwhaOcean_Level2_Lesson16.html': {
    bannerTitle: '⚖️ AI 법률 상식 도우미',
    bannerSub: '근로자 권리 · 법 표현 · 법적 보호',
    bannerTag: '🔵 Legal Rights Guide × Korean Labor Law',
    quickBtns: `[
  { emoji:'🛡️', label:'외국인 근로자 권리',
    q:'한국에서 외국인 근로자의 법적 권리를 한국어로 알려주세요. 체불 임금, 부당 해고, 산재 보상, 차별 금지 관련 표현과 도움받는 곳을 영어와 함께 알려주세요.' },
  { emoji:'📋', label:'근로 계약 권리',
    q:'근로 계약에서 외국인 근로자가 알아야 할 권리를 한국어로 알려주세요. 계약 해지, 퇴직금, 해고 예고 같은 표현과 권리를 영어와 함께 설명해주세요.' },
  { emoji:'⚠️', label:'차별/폭언 신고',
    q:'직장 내 차별이나 부당 대우를 신고하는 한국어를 알려주세요. "신고하고 싶어요", "차별을 받았어요", "노동청에 신고해야 해요" 표현을 영어와 함께 알려주세요.' },
  { emoji:'📞', label:'도움 기관 안내',
    q:'한국에서 외국인 근로자를 도와주는 기관을 한국어로 알려주세요. 고용노동부, 외국인 근로자 지원센터, 노동청, 다누리 콜센터 연락 방법을 영어와 함께요.' },
  { emoji:'💼', label:'산재/보험 표현',
    q:'산재 보험과 산업 재해 관련 한국어를 알려주세요. "작업 중 다쳤어요", "산재 처리 해주세요", "산재 보상을 받고 싶어요" 표현을 영어와 함께 알려주세요.' },
]`,
    systemPrompt: `You are a Korean labor law rights coach for foreign workers. Lesson focus: legal vocabulary 법(law), 권리(right), 의무(duty), 계약(contract), 위반(violation), imperative forms. Help workers understand their legal rights and report violations. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국에서 외국인 근로자의 법적 권리를 이해하고 부당 대우를 신고하는 한국어 표현을 배우고 싶어요. 도움 기관도 영어로 알려주세요."`,
    inputPlaceholder: `법률/권리 질문 / Ask about worker rights in Korean...`,
    pronunciationItems: `[
      {sent:'저는 외국인 근로자 권리가 있어요.', eng:'I have rights as a foreign worker.'},
      {sent:'임금이 체불되었어요.', eng:'My wages have been withheld.'},
      {sent:'고용노동부에 신고하고 싶어요.', eng:'I want to report to the Ministry of Labor.'},
      {sent:'작업 중 사고가 났어요.', eng:'An accident occurred during work.'},
      {sent:'산재 처리를 도와주세요.', eng:'Please help me with the industrial accident process.'},
    ]`,
  },

  'HanwhaOcean_Level2_Lesson17.html': {
    bannerTitle: '💼 AI 면접 코치',
    bannerSub: '이력서 · 면접 답변 · 취업 표현 연습',
    bannerTag: '🔵 Job Interview Coach × Career Korean',
    quickBtns: `[
  { emoji:'🎤', label:'면접 질문 연습',
    q:'한국 조선소 면접에서 자주 나오는 질문에 답하는 연습을 해주세요. "자기소개해 주세요", "지원 동기가 뭐예요?", "경력이 어떻게 되세요?" 같은 면접 롤플레이를 해주세요.' },
  { emoji:'📄', label:'이력서 표현',
    q:'한국 이력서(자기소개서) 작성에 필요한 한국어 표현을 알려주세요. 이름, 생년월일, 학력, 경력, 자격증, 지원 동기를 쓰는 방법을 영어와 함께 설명해주세요.' },
  { emoji:'👔', label:'강점 표현하기',
    q:'면접에서 강점과 경력을 표현하는 한국어를 알려주세요. "저의 강점은 ~이에요", "~년의 경력이 있어요", "~을 잘 해요" 같은 자기 어필 표현을 영어와 함께 5가지요.' },
  { emoji:'🏭', label:'조선소 재취업',
    q:'같은 조선소나 다른 조선소에 재취업할 때 쓰는 한국어를 알려주세요. 계약 갱신, 직종 변경, 급여 협상 관련 표현을 영어와 함께 알려주세요.' },
  { emoji:'🤔', label:'고용 조건 묻기',
    q:'취업 시 고용 조건을 확인하는 한국어 표현을 알려주세요. "근무 시간이 어떻게 돼요?", "숙소 제공이 돼요?", "비자 지원이 가능해요?" 표현을 영어와 함께요.' },
]`,
    systemPrompt: `You are a Korean job interview and career coach for foreign workers. Lesson focus: employment vocabulary 면접(interview), 이력서(resume), 경력(career experience), 채용(hiring), 복지(benefits), experience expressions. Help workers succeed in Korean job interviews. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국어로 면접을 준비하고 이력서를 쓰는 연습을 도와주세요. 강점 표현과 면접 답변 방법을 영어로도 설명해 주세요."`,
    inputPlaceholder: `면접/취업 질문 / Ask about job interviews in Korean...`,
    pronunciationItems: `[
      {sent:'저는 용접 경력이 5년 있어요.', eng:'I have 5 years of welding experience.'},
      {sent:'이 회사에서 일하고 싶어요.', eng:'I want to work at this company.'},
      {sent:'저의 강점은 성실함이에요.', eng:'My strength is diligence.'},
      {sent:'근무 조건이 어떻게 되나요?', eng:'What are the working conditions?'},
      {sent:'열심히 하겠습니다.', eng:'I will work hard.'},
    ]`,
  },

  'HanwhaOcean_Level2_Lesson18.html': {
    bannerTitle: '🌐 AI 사회 문화 코치',
    bannerSub: '한국 사회 이해 · 다문화 · 존중 표현',
    bannerTag: '🔵 Multicultural Coach × Social Korean',
    quickBtns: `[
  { emoji:'🤝', label:'다문화 존중 표현',
    q:'다양한 나라 사람들과 함께 일할 때 쓰는 한국어 표현을 알려주세요. "서로 존중해요", "문화 차이를 이해해요", "다같이 협력해요" 같은 표현을 영어와 함께 5가지요.' },
  { emoji:'🏢', label:'한국 조직 문화',
    q:'한국 직장 조직 문화를 이해하는 데 도움이 되는 표현을 알려주세요. 상하 관계, 존댓말, 집단주의 문화를 외국인이 이해하고 적응할 수 있는 팁을 영어와 함께요.' },
  { emoji:'🎌', label:'차별 대응 표현',
    q:'직장에서 차별을 경험했을 때 한국어로 대응하는 방법을 알려주세요. "그 말은 차별적이에요", "불편해요", "공정하게 대우해 주세요" 표현을 영어와 함께요.' },
  { emoji:'💬', label:'갈등 해결 표현',
    q:'동료와 갈등이 생겼을 때 한국어로 해결하는 표현을 알려주세요. "제 말을 오해한 것 같아요", "솔직하게 이야기해요", "타협합시다" 표현을 영어와 함께요.' },
  { emoji:'🌍', label:'내 나라 문화 소개',
    q:'내 나라 문화를 한국어로 소개하는 연습을 해주세요. 음식, 명절, 인사 방법, 종교를 한국어로 소개하는 표현을 영어와 함께 만드는 방법을 알려주세요.' },
]`,
    systemPrompt: `You are a Korean multicultural society coach for foreign workers. Lesson focus: social vocabulary 사회(society), 문화(culture), 전통(tradition), 차별(discrimination), 존중(respect), normative expressions ~어야 해요. Help workers navigate Korean workplace culture respectfully. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국 사회와 직장 문화를 이해하고 다문화 환경에서 존중하며 소통하는 한국어 표현을 배우고 싶어요. 영어로도 설명해 주세요."`,
    inputPlaceholder: `사회/문화 질문 / Ask about Korean social culture...`,
    pronunciationItems: `[
      {sent:'서로 존중하며 일해요.', eng:'We work while respecting each other.'},
      {sent:'문화 차이를 이해해요.', eng:'I understand cultural differences.'},
      {sent:'모두 평등하게 대우받아야 해요.', eng:'Everyone should be treated equally.'},
      {sent:'한국 문화를 배우고 싶어요.', eng:'I want to learn Korean culture.'},
      {sent:'함께 일하면 더 잘 할 수 있어요.', eng:'We can do better when we work together.'},
    ]`,
  },

  'HanwhaOcean_Level2_Lesson19.html': {
    bannerTitle: '🎤 AI 발표 준비 코치',
    bannerSub: '프레젠테이션 · 발표 표현 · 질문 답변',
    bannerTag: '🔵 Presentation Coach × Speaking Korean',
    quickBtns: `[
  { emoji:'🎙️', label:'발표 시작/마무리',
    q:'한국어 발표를 시작하고 마무리하는 표현을 알려주세요. "발표를 시작하겠습니다", "주제는 ~입니다", "이상 발표를 마치겠습니다" 같은 표현을 영어와 함께 알려주세요.' },
  { emoji:'📊', label:'작업 현황 발표',
    q:'조선소 작업 현황을 발표하는 한국어 표현을 알려주세요. "이번 주 작업은 ~입니다", "진행 상황은 ~%입니다", "문제점은 ~이에요" 같은 보고 표현을 영어와 함께요.' },
  { emoji:'❓', label:'질문에 답하기',
    q:'발표 후 질문에 한국어로 답하는 연습을 해주세요. "좋은 질문이에요", "제 생각에는 ~인 것 같아요", "잘 모르겠지만 ~이라고 생각해요" 표현을 영어와 함께요.' },
  { emoji:'📋', label:'중간 점검 표현',
    q:'작업 중간 점검을 보고하는 한국어 표현을 알려주세요. "현재까지 ~을 완료했어요", "일정대로 진행 중이에요", "추가 작업이 필요해요" 표현을 영어와 함께 5가지요.' },
  { emoji:'🗣️', label:'발표 자료 설명',
    q:'발표 자료를 설명하는 한국어 표현을 알려주세요. "이 그래프는 ~을 보여줍니다", "이 수치를 보시면", "표를 참고해 주세요" 같은 발표용 표현을 영어와 함께요.' },
]`,
    systemPrompt: `You are a Korean public speaking and presentation coach for shipyard workers. Lesson focus: presentation vocabulary 발표(presentation), 준비(preparation), 주제(topic), 자료(material), 질문(question), imperative/instructional Korean forms. Help workers give confident reports in Korean. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국어로 작업 현황을 발표하고 질문에 답하는 연습을 도와주세요. 발표 시작과 마무리 표현을 영어로도 설명해 주세요."`,
    inputPlaceholder: `발표/보고 표현 질문 / Ask about presentations in Korean...`,
    pronunciationItems: `[
      {sent:'발표를 시작하겠습니다.', eng:'I will begin the presentation.'},
      {sent:'이번 주 작업 현황을 보고합니다.', eng:'I am reporting this week\'s work status.'},
      {sent:'현재까지 80% 완료했습니다.', eng:'We have completed 80% so far.'},
      {sent:'질문 있으시면 말씀해 주세요.', eng:'Please ask if you have any questions.'},
      {sent:'이상으로 발표를 마치겠습니다.', eng:'This concludes my presentation.'},
    ]`,
  },

  'HanwhaOcean_Level2_Lesson20.html': {
    bannerTitle: '🎓 AI 수료 소감 코치',
    bannerSub: '성취 표현 · 감사 · 미래 다짐',
    bannerTag: '🔵 Graduation Coach × Achievement Korean',
    quickBtns: `[
  { emoji:'🏆', label:'수료 소감 말하기',
    q:'한국어 수료 소감을 표현하는 연습을 해주세요. "한국어 공부가 보람 있었어요", "많이 성장했어요", "앞으로도 계속 공부하겠어요" 같은 성취 표현을 영어와 함께요.' },
  { emoji:'🙏', label:'감사 표현',
    q:'수료 소감에서 선생님과 동료에게 감사를 전하는 한국어 표현을 알려주세요. "가르쳐 주셔서 감사합니다", "덕분에 많이 배웠어요", "다음에 또 만나요" 표현을 영어와 함께요.' },
  { emoji:'🌟', label:'성장/변화 표현',
    q:'한국어 학습을 통한 성장과 변화를 표현하는 방법을 알려주세요. "처음보다 많이 늘었어요", "이제 조금씩 들려요", "자신감이 생겼어요" 표현을 영어와 함께요.' },
  { emoji:'🚀', label:'미래 다짐',
    q:'앞으로의 한국어 학습과 직업 계획을 다짐하는 표현을 알려주세요. "계속 열심히 하겠어요", "다음 단계를 공부하겠어요", "한국에서 성공하겠어요" 표현을 영어와 함께요.' },
  { emoji:'💬', label:'배운 표현 복습',
    q:'초급 2급에서 배운 가장 유용한 표현들을 복습해주세요. 은행, 병원, 전화, 약속, 쇼핑에서 쓰는 핵심 표현을 정리해서 영어와 함께 알려주세요.' },
]`,
    systemPrompt: `You are a Korean achievement and graduation coach for foreign workers completing their language course. Lesson focus: achievement vocabulary 꿈(dream), 목표(goal), 미래(future), 희망(hope), 성공(success), motivational and aspirational expressions. Help workers celebrate their Korean learning journey. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국어 과정을 수료하면서 수료 소감과 미래 다짐을 표현하는 연습을 도와주세요. 감사 표현과 성취 느낌을 영어로도 표현하고 싶어요."`,
    inputPlaceholder: `수료/성취 소감 / Share your learning achievements...`,
    pronunciationItems: `[
      {sent:'한국어를 많이 배웠어요.', eng:'I have learned a lot of Korean.'},
      {sent:'가르쳐 주셔서 감사합니다.', eng:'Thank you for teaching me.'},
      {sent:'앞으로도 계속 공부하겠어요.', eng:'I will continue to study from now on.'},
      {sent:'한국에서 열심히 일하겠습니다.', eng:'I will work hard in Korea.'},
      {sent:'꿈을 향해 계속 나아갈 거예요.', eng:'I will keep moving forward toward my dream.'},
    ]`,
  },

};

// ─── 공통 적용 함수 ────────────────────────────────────────────────────────────
function applyLesson(fname, cfg) {
  const fpath = path.join(dir, fname);
  let content = fs.readFileSync(fpath, 'utf8');
  let changes = 0;

  const btnStart = content.indexOf('var AI_QUICK_BTNS = [');
  const btnEnd   = content.indexOf('];', btnStart) + 2;
  if (btnStart === -1) { console.log(`  [WARN] ${fname} — AI_QUICK_BTNS 못 찾음`); return; }
  content = content.slice(0, btnStart) + 'var AI_QUICK_BTNS = ' + cfg.quickBtns + content.slice(btnEnd);
  changes++;

  const sysOld = `'You are a Korean language tutor for foreign workers at Hanwha Ocean shipyard in Geoje, Korea. Students are beginner level (KIIP Level 1-2). Always: 1) Keep answers SHORT and CLEAR 2) Include English translations 3) Focus on practical shipyard expressions 4) Use simple grammar. Reply in Korean with English translation.'`;
  if (content.includes(sysOld)) { content = content.replace(sysOld, `'${cfg.systemPrompt}'`); changes++; }

  if (content.includes('에이전틱 G스택 조선소 한국어 실습')) { content = content.replace('에이전틱 G스택 조선소 한국어 실습', cfg.bannerTitle); changes++; }
  if (content.includes('🔵 Shipyard Korean Learning × AI Agents')) { content = content.replace('🔵 Shipyard Korean Learning × AI Agents', cfg.bannerTag); changes++; }
  if (content.includes('Google Gemini · Claude AI · Agent Harness 연계')) { content = content.replace('Google Gemini · Claude AI · Agent Harness 연계', cfg.bannerSub); changes++; }
  if (content.includes('placeholder="조선소 한국어 질문 / Ask about shipyard Korean..."')) { content = content.replace('placeholder="조선소 한국어 질문 / Ask about shipyard Korean..."', `placeholder="${cfg.inputPlaceholder}"`); changes++; }

  const gemOld = `"저는 한화오션 조선소 외국인 근로자예요. 이번 과에서 배운 표현으로 상사와 대화하는 롤플레이를 도와주세요. 영어로도 설명해 주세요."`;
  if (content.includes(gemOld)) { content = content.replace(gemOld, cfg.geminiPrompt); changes++; }

  const pronOld = `[
      {sent:'안전모를 착용하세요.', eng:'Please wear your safety helmet.'},
      {sent:'작업 지시서를 확인하세요.', eng:'Please check the work order.'},
      {sent:'도움이 필요합니다.', eng:'I need help.'},
      {sent:'작업이 완료되었습니다.', eng:'The work is complete.'},
      {sent:'위험합니다. 조심하세요!', eng:'It is dangerous. Please be careful!'},
    ]`;
  if (content.includes(pronOld)) { content = content.replace(pronOld, cfg.pronunciationItems); changes++; }
  else { console.log(`  [WARN] ${fname} — 발음 배열 못 찾음`); }

  fs.writeFileSync(fpath, content, 'utf8');
  console.log(`  [OK] ${fname} — ${changes}개 변경`);
}

let done = 0;
for (const [fname, cfg] of Object.entries(LESSONS)) {
  try { applyLesson(fname, cfg); done++; }
  catch(e) { console.log(`  [ERR] ${fname}: ${e.message}`); }
}
console.log(`\n✅ 완료: ${done}개 파일`);
