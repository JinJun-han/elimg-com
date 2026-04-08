/**
 * Level1 Lessons 6~20 — 과별 고유 AI 섹션 적용
 */
const fs = require('fs');
const path = require('path');
const dir = __dirname;

const LESSONS = {

  'HanwhaOcean_Level1_Lesson6.html': {
    bannerTitle: '🍱 AI 식당 주문 코치',
    bannerSub: '구내식당 메뉴 · 음식 이름 · 주문 표현',
    bannerTag: '🔵 Cafeteria Order Coach × Food Korean',
    quickBtns: `[
  { emoji:'🍽️', label:'구내식당 주문',
    q:'조선소 구내식당에서 밥을 주문하는 한국어 대화를 연습해주세요. "불고기 주세요", "국 없이 주세요", "밥 더 주세요" 같은 표현을 롤플레이로 해주세요. 영어도 함께요.' },
  { emoji:'🥘', label:'음식 이름 알려줘',
    q:'한국 음식 이름을 알려주세요: 밥, 국, 반찬, 불고기, 김치찌개, 된장찌개, 비빔밥. 각 음식의 특징을 영어로 설명해주세요. 조선소 식당에서 자주 나오는 메뉴로요.' },
  { emoji:'🌶️', label:'맵기/알레르기 표현',
    q:'음식 알레르기나 맵기 조절을 요청하는 한국어를 알려주세요. "안 맵게 해주세요", "돼지고기 빼주세요", "이것 뭐예요?" 같은 표현을 영어와 함께 5가지요.' },
  { emoji:'🥢', label:'식사 예절 표현',
    q:'한국 식사 예절과 관련 표현을 알려주세요. "잘 먹겠습니다", "잘 먹었습니다", "맛있어요", "배불러요" 같은 식사 표현을 영어와 함께 알려주세요.' },
  { emoji:'📋', label:'오늘 메뉴 묻기',
    q:'조선소 구내식당에서 오늘 메뉴를 묻는 대화를 연습해주세요. "오늘 메뉴가 뭐예요?", "채식 메뉴 있어요?", "언제 식사 시간이에요?" 표현을 영어와 함께요.' },
]`,
    systemPrompt: `You are a Korean food and dining coach for shipyard workers. Lesson focus: food vocabulary 밥(rice), 국(soup), 반찬(side dishes), 불고기(bulgogi), 김치찌개(kimchi stew), ordering with ~주세요, 을/를 먹어요 object marker. Keep answers SHORT with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국 구내식당에서 음식을 주문하고 메뉴를 이해하는 연습을 도와주세요. 한국 음식 이름과 주문 표현을 영어로도 설명해 주세요."`,
    inputPlaceholder: `음식 이름/주문 질문 / Ask about Korean food and ordering...`,
    pronunciationItems: `[
      {sent:'불고기 주세요.', eng:'Please give me bulgogi.'},
      {sent:'오늘 메뉴가 뭐예요?', eng:'What is today\'s menu?'},
      {sent:'잘 먹겠습니다.', eng:'I will eat well. (Said before eating)'},
      {sent:'밥을 더 주세요.', eng:'Please give me more rice.'},
      {sent:'맵지 않게 해주세요.', eng:'Please make it not spicy.'},
    ]`,
  },

  'HanwhaOcean_Level1_Lesson7.html': {
    bannerTitle: '🎮 AI 주말 계획 도우미',
    bannerSub: '여가 활동 · 주말 대화 · ~아/어요 연습',
    bannerTag: '🔵 Weekend Planner × Leisure Korean',
    quickBtns: `[
  { emoji:'⚽', label:'주말 계획 말하기',
    q:'조선소 동료와 주말 계획을 이야기하는 한국어 대화를 연습해주세요. "주말에 뭐 해요?", "축구 해요", "같이 가요?" 같은 표현을 롤플레이로 해주세요. 영어도 함께요.' },
  { emoji:'🎬', label:'여가 활동 표현',
    q:'한국에서 외국인 근로자들이 즐기는 여가 활동 표현을 알려주세요. 운동하다, 영화 보다, 쉬다, 여행하다, 친구 만나다를 예문과 영어로 설명해주세요.' },
  { emoji:'📅', label:'주말 일정 만들기',
    q:'주말 일정을 한국어로 만드는 연습을 해주세요. "토요일 오전에 운동해요", "일요일 오후에 쉬어요" 같은 문장을 시간+활동 패턴으로 5개 만들어주세요.' },
  { emoji:'🤝', label:'함께 할래요? 표현',
    q:'동료를 활동에 초대하는 한국어 표현을 알려주세요. "같이 밥 먹어요", "주말에 운동해요?", "영화 보러 가요" 같은 초대 표현을 영어와 함께 5가지 알려주세요.' },
  { emoji:'💬', label:'~아/어요 연습',
    q:'~아/어요 폴라이트 현재형을 주말 활동으로 연습해주세요. 자다→자요, 먹다→먹어요, 보다→봐요 변형 규칙을 활동 예문으로 5개 설명해주세요.' },
]`,
    systemPrompt: `You are a Korean leisure and weekend activity coach for shipyard workers. Lesson focus: weekend activities 쉬다(rest), 운동하다(exercise), 축구(soccer), 여행(travel), 영화 보다(watch movie), polite present tense ~아/어요 conjugation. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국어로 주말 계획을 이야기하고 동료를 활동에 초대하는 연습을 도와주세요. ~아/어요 표현을 사용한 대화를 영어로도 설명해 주세요."`,
    inputPlaceholder: `주말 계획/여가 질문 / Ask about weekend activities...`,
    pronunciationItems: `[
      {sent:'주말에 뭐 해요?', eng:'What do you do on weekends?'},
      {sent:'저는 축구를 해요.', eng:'I play soccer.'},
      {sent:'같이 영화 봐요.', eng:'Let\'s watch a movie together.'},
      {sent:'일요일에 쉬어요.', eng:'I rest on Sundays.'},
      {sent:'운동하러 가요.', eng:'I go to exercise.'},
    ]`,
  },

  'HanwhaOcean_Level1_Lesson8.html': {
    bannerTitle: '🌤️ AI 날씨 안전 코치',
    bannerSub: '날씨 표현 · 계절 · 야외 작업 안전',
    bannerTag: '🔵 Weather Safety Coach × Climate Korean',
    quickBtns: `[
  { emoji:'🌡️', label:'오늘 날씨 표현',
    q:'조선소에서 날씨 이야기를 나누는 한국어 대화를 연습해주세요. "오늘 날씨가 어때요?", "더워요/추워요", "비가 와요" 같은 표현을 롤플레이로 해주세요. 영어도 함께요.' },
  { emoji:'🌧️', label:'계절별 날씨',
    q:'한국의 4계절 날씨를 한국어로 알려주세요. 봄(따뜻해요), 여름(더워요), 가을(시원해요), 겨울(추워요). 거제 조선소 날씨 특징도 영어와 함께 설명해주세요.' },
  { emoji:'⛑️', label:'날씨별 작업 안전',
    q:'날씨에 따른 조선소 안전 주의사항을 한국어로 알려주세요. 폭염 때, 태풍 때, 안개 낄 때, 미끄러울 때 주의해야 할 표현을 영어와 함께 5가지요.' },
  { emoji:'🌪️', label:'태풍/폭염 표현',
    q:'극단적 날씨 상황에서 쓰는 한국어 표현을 알려주세요. "태풍 주의보예요", "작업 중단이에요", "안전 대피하세요" 같은 표현을 영어와 함께 5가지 알려주세요.' },
  { emoji:'📝', label:'날씨 형용사 연습',
    q:'날씨를 표현하는 한국어 형용사를 연습해주세요. 덥다→더워요, 춥다→추워요, 맑다→맑아요 변형과 조선소 야외 작업 날씨 예문 5개를 영어와 함께요.' },
]`,
    systemPrompt: `You are a Korean weather and seasonal safety coach for shipyard workers. Lesson focus: weather vocabulary 날씨(weather), 덥다(hot), 춥다(cold), 비(rain), 눈(snow), descriptive adjective pattern ~(으)ㄴ, seasonal safety warnings relevant to outdoor shipyard work. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 야외 근로자예요. 한국어로 날씨를 표현하고 날씨에 따른 작업 안전 주의사항을 이야기하는 연습을 도와주세요. 영어로도 설명해 주세요."`,
    inputPlaceholder: `날씨/안전 질문 / Ask about weather and safety...`,
    pronunciationItems: `[
      {sent:'오늘 날씨가 어때요?', eng:'What is the weather like today?'},
      {sent:'많이 더워요. 조심하세요.', eng:'It\'s very hot. Please be careful.'},
      {sent:'비가 와서 미끄러워요.', eng:'It\'s slippery because it\'s raining.'},
      {sent:'태풍 주의보가 있어요.', eng:'There is a typhoon advisory.'},
      {sent:'오늘 작업이 중단되었어요.', eng:'Work has been suspended today.'},
    ]`,
  },

  'HanwhaOcean_Level1_Lesson9.html': {
    bannerTitle: '🏥 AI 몸 상태 표현 코치',
    bannerSub: '신체 부위 · 증상 설명 · 조선소 부상 표현',
    bannerTag: '🔵 Body & Health Coach × Medical Korean',
    quickBtns: `[
  { emoji:'🤕', label:'몸 어디 아파요?',
    q:'조선소에서 아플 때 한국어로 증상을 설명하는 연습을 해주세요. "머리가 아파요", "허리가 아파요", "손이 다쳤어요" 같은 표현을 의무실 직원에게 말하는 롤플레이로요.' },
  { emoji:'🦴', label:'신체 부위 이름',
    q:'한국어 신체 부위 이름을 조선소 작업과 연결해서 알려주세요. 머리, 눈, 귀, 코, 손, 발, 허리, 어깨를 영어와 함께, 작업 중 다칠 수 있는 상황으로요.' },
  { emoji:'🚑', label:'작업 부상 신고',
    q:'조선소 작업 중 부상을 신고하는 한국어 대화를 연습해주세요. "작업 중에 다쳤어요", "~에서 떨어졌어요", "병원에 가야 해요" 표현을 영어와 함께 알려주세요.' },
  { emoji:'💊', label:'아파서/감기 표현',
    q:'~아/어서 (because/so) 표현을 건강 상황으로 연습해주세요. "머리가 아파서 쉬어요", "열이 있어서 병원에 가요" 같은 이유-결과 문장 5개를 영어와 함께요.' },
  { emoji:'🌡️', label:'건강 상태 말하기',
    q:'건강 상태를 동료/상사에게 알리는 한국어를 알려주세요. "오늘 몸 상태가 안 좋아요", "쉬어야 할 것 같아요", "내일은 괜찮을 거예요" 표현을 영어와 함께요.' },
]`,
    systemPrompt: `You are a Korean health and first aid coach for shipyard workers. Lesson focus: body parts 머리(head), 배(stomach), 목(throat), descriptive verb 아프다(hurts), 감기(cold), cause-reason connector ~아/어서. Help workers describe injuries and symptoms at the infirmary. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 작업 중 아프거나 다쳤을 때 한국어로 증상을 설명하는 연습을 도와주세요. 의무실에서 쓰는 표현과 신체 부위 이름을 영어로도 알려주세요."`,
    inputPlaceholder: `증상/신체 질문 / Ask about health expressions...`,
    pronunciationItems: `[
      {sent:'머리가 많이 아파요.', eng:'My head hurts a lot.'},
      {sent:'작업 중에 손을 다쳤어요.', eng:'I hurt my hand while working.'},
      {sent:'어지러워서 쉬어야 해요.', eng:'I\'m dizzy so I need to rest.'},
      {sent:'의무실에 가고 싶어요.', eng:'I want to go to the infirmary.'},
      {sent:'열이 있어서 병원에 가요.', eng:'I have a fever so I\'m going to the hospital.'},
    ]`,
  },

  'HanwhaOcean_Level1_Lesson10.html': {
    bannerTitle: '📱 AI 디지털 소통 코치',
    bannerSub: '전화번호 · 카카오톡 · 문자 표현 연습',
    bannerTag: '🔵 Digital Communication Coach × Phone Korean',
    quickBtns: `[
  { emoji:'📞', label:'전화번호 교환',
    q:'한국어로 전화번호를 교환하는 대화를 연습해주세요. "전화번호가 몇 번이에요?", "공일공-~이에요", "카카오톡 있어요?" 같은 표현을 롤플레이로 해주세요. 영어도요.' },
  { emoji:'💬', label:'카카오톡 표현',
    q:'카카오톡으로 동료에게 보내는 한국어 문자 표현을 알려주세요. "내일 7시에 출근해요", "오늘 야근이에요", "지금 어디예요?" 같은 직장 문자 표현 5가지를 영어와 함께요.' },
  { emoji:'🔢', label:'전화번호 읽기',
    q:'한국 전화번호를 한국어로 읽는 연습을 해주세요. 0=영, 010-1234-5678을 한국어로 어떻게 읽는지, 숫자 읽기 규칙을 예문과 영어로 설명해주세요.' },
  { emoji:'📵', label:'전화 못 받을 때',
    q:'전화를 못 받을 때 보내는 한국어 문자를 알려주세요. "지금 작업 중이에요. 나중에 전화할게요", "회의 중이에요", "10분 후에 전화해요" 표현을 영어와 함께요.' },
  { emoji:'🆘', label:'긴급 연락 표현',
    q:'조선소 긴급 상황에서 문자/전화로 사용하는 한국어를 알려주세요. "사고 났어요. 빨리 와주세요", "119에 신고해주세요" 같은 표현을 영어와 함께 5가지요.' },
]`,
    systemPrompt: `You are a Korean digital communication coach for shipyard workers. Lesson focus: phone number expressions, 휴대폰(mobile phone), 문자(text message), 카카오톡(KakaoTalk), 전화하다(to call), ability expression ~(으)ㄹ 수 있다/없다. Help with practical phone/text communication. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국어로 전화번호 교환, 카카오톡 문자 보내기, 전화 통화 연습을 도와주세요. 직장 동료와 소통하는 표현을 영어로도 설명해 주세요."`,
    inputPlaceholder: `전화/문자 표현 질문 / Ask about phone communication...`,
    pronunciationItems: `[
      {sent:'전화번호가 몇 번이에요?', eng:'What is your phone number?'},
      {sent:'공일공-일이삼사-오육칠팔이에요.', eng:'It\'s 010-1234-5678.'},
      {sent:'카카오톡 아이디가 뭐예요?', eng:'What is your KakaoTalk ID?'},
      {sent:'지금 작업 중이에요.', eng:'I\'m working right now.'},
      {sent:'나중에 다시 전화할게요.', eng:'I\'ll call again later.'},
    ]`,
  },

  'HanwhaOcean_Level1_Lesson11.html': {
    bannerTitle: '👨‍👩‍👧‍👦 AI 가족 소개 도우미',
    bannerSub: '가족 관계 · 호칭 · 고향 가족 이야기',
    bannerTag: '🔵 Family Introduction × Family Korean',
    quickBtns: `[
  { emoji:'👨‍👩‍👧', label:'가족 소개하기',
    q:'한국어로 가족을 소개하는 연습을 해주세요. "아버지, 어머니, 형, 누나, 동생이 있어요" 같은 문장을 조선소 동료에게 소개하는 대화로 만들어주세요. 영어도요.' },
  { emoji:'📞', label:'고향 가족과 통화',
    q:'고향 가족에게 전화하는 한국어 대화를 연습해주세요. "잘 지내요?", "한국 생활은 어때요?", "곧 돌아갈게요" 같은 표현을 영어와 함께 알려주세요.' },
  { emoji:'🏠', label:'가족 관계 표현',
    q:'한국어 가족 호칭을 알려주세요. 아버지/아빠, 어머니/엄마, 형/오빠, 누나/언니, 동생의 차이(남자/여자 기준)를 영어로 쉽게 설명해주세요.' },
  { emoji:'💌', label:'가족 걱정 표현',
    q:'가족을 그리워하거나 걱정하는 한국어 표현을 알려주세요. "가족이 보고 싶어요", "어머니가 아프셔요", "빨리 집에 가고 싶어요" 같은 감정 표현을 영어와 함께요.' },
  { emoji:'📝', label:'~(으)ㄴ 수식 연습',
    q:'형용사 수식 ~(으)ㄴ + 명사를 가족 표현으로 연습해주세요. "착한 형", "바쁜 아버지", "어린 동생" 같은 표현 5개를 영어와 함께 만들어주세요.' },
]`,
    systemPrompt: `You are a Korean family vocabulary coach for shipyard workers far from home. Lesson focus: family members 아버지(father), 어머니(mother), 형(older brother for males), 누나(older sister for males), 동생(younger sibling), adjective modifier ~(으)ㄴ. Help workers talk about family. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 가족을 그리워하고 한국어로 가족을 소개하는 연습을 도와주세요. 가족 호칭과 가족 이야기를 나누는 표현을 영어로도 설명해 주세요."`,
    inputPlaceholder: `가족 표현 질문 / Ask about family Korean...`,
    pronunciationItems: `[
      {sent:'저는 형이 한 명 있어요.', eng:'I have one older brother.'},
      {sent:'어머니가 보고 싶어요.', eng:'I miss my mother.'},
      {sent:'가족이 베트남에 있어요.', eng:'My family is in Vietnam.'},
      {sent:'아버지는 농부예요.', eng:'My father is a farmer.'},
      {sent:'곧 고향에 돌아갈 거예요.', eng:'I will return home soon.'},
    ]`,
  },

  'HanwhaOcean_Level1_Lesson12.html': {
    bannerTitle: '📖 AI 어제 일과 코치',
    bannerSub: '과거 시제 · 어제 뭐 했어요? 표현',
    bannerTag: '🔵 Past Tense Coach × Daily Routine Korean',
    quickBtns: `[
  { emoji:'🕐', label:'어제 일과 말하기',
    q:'조선소 외국인 근로자가 어제 일과를 한국어로 말하는 연습을 해주세요. "어제 8시에 출근했어요", "야근했어요", "12시에 잤어요" 과거형 문장을 영어와 함께 만들어주세요.' },
  { emoji:'⚙️', label:'야근/잔업 표현',
    q:'조선소에서 야근과 잔업에 관한 한국어 표현을 알려주세요. "어제 야근했어요", "오늘 잔업이 있어요", "너무 피곤해요" 같은 표현을 영어와 함께 5가지요.' },
  { emoji:'🔄', label:'~았/었어요 변형',
    q:'과거 시제 ~았/었어요를 조선소 일과 동사로 연습해주세요. 일하다→일했어요, 먹다→먹었어요, 자다→잤어요. 불규칙 변형도 5가지 영어 해석과 함께요.' },
  { emoji:'📊', label:'작업 완료 보고',
    q:'작업 완료를 상사에게 보고하는 한국어 과거형 문장을 알려주세요. "용접 작업을 완료했어요", "점검을 끝냈어요" 같은 보고 표현을 영어와 함께 5가지요.' },
  { emoji:'🌙', label:'피로 표현하기',
    q:'피로와 컨디션을 표현하는 한국어를 알려주세요. "어제 야근해서 피곤해요", "잠을 못 잤어요", "오늘 쉬고 싶어요" 같은 표현을 영어와 함께 알려주세요.' },
]`,
    systemPrompt: `You are a Korean past tense and daily routine coach for shipyard workers. Lesson focus: past tense ~았/었어요, work routine words 출근(start work), 퇴근(leave work), 야근(night shift/overtime), time expressions 어제(yesterday), 일했어요(worked). Help workers describe their daily work routines. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 어제 한 일을 한국어로 말하는 연습을 도와주세요. 과거 시제 ~았/었어요를 써서 야근, 작업, 식사를 표현하고 싶어요. 영어로도 설명해 주세요."`,
    inputPlaceholder: `어제 일과 / 과거 표현 질문 / Ask about past tense Korean...`,
    pronunciationItems: `[
      {sent:'어제 야근했어요.', eng:'I worked overtime yesterday.'},
      {sent:'작업을 완료했어요.', eng:'I completed the work.'},
      {sent:'아침 일찍 출근했어요.', eng:'I started work early in the morning.'},
      {sent:'너무 피곤해서 일찍 잤어요.', eng:'I was so tired that I went to bed early.'},
      {sent:'점심을 빨리 먹었어요.', eng:'I ate lunch quickly.'},
    ]`,
  },

  'HanwhaOcean_Level1_Lesson13.html': {
    bannerTitle: '🚌 AI 교통 안내 도우미',
    bannerSub: '버스 · 지하철 · 조선소 통근 표현',
    bannerTag: '🔵 Transportation Guide × Commute Korean',
    quickBtns: `[
  { emoji:'🚌', label:'버스 타기 연습',
    q:'한국에서 버스를 타는 한국어 대화를 연습해주세요. "이 버스 거제시청 가요?", "어디서 내려요?", "다음 정류장이에요" 같은 버스 표현을 롤플레이로 해주세요.' },
  { emoji:'🚇', label:'지하철 표현',
    q:'한국 지하철 이용 한국어를 알려주세요. "어디서 갈아타요?", "몇 호선이에요?", "종착역이에요" 같은 표현과 거제/부산 교통 관련 표현을 영어와 함께요.' },
  { emoji:'🛵', label:'조선소 통근 방법',
    q:'조선소까지 가는 방법을 한국어로 설명하는 연습을 해주세요. "버스로 20분이에요", "택시 타요", "셔틀버스가 있어요" 같은 통근 표현을 영어와 함께 알려주세요.' },
  { emoji:'🗺️', label:'길 물어보기',
    q:'교통 수단을 이용해 목적지까지 가는 방법을 묻는 한국어를 연습해주세요. "어떻게 가요?", "얼마나 걸려요?", "몇 번 버스예요?" 표현을 롤플레이로 해주세요.' },
  { emoji:'💳', label:'교통카드/요금',
    q:'한국 교통카드와 요금 관련 한국어를 알려주세요. 교통카드, 충전, 요금, 무임, 환승 할인을 영어와 함께, 외국인 근로자에게 유용한 팁도 알려주세요.' },
]`,
    systemPrompt: `You are a Korean public transportation coach for shipyard workers commuting in Korea. Lesson focus: transportation vocab 버스(bus), 지하철(subway), 택시(taxi), 갈아타다(transfer), 정류장(bus stop), direction particle ~(으)로 (by/via). Help workers navigate Korean public transit. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국 버스와 지하철을 이용하는 한국어 대화 연습을 도와주세요. 조선소까지 가는 방법과 교통 표현을 영어로도 설명해 주세요."`,
    inputPlaceholder: `교통/통근 질문 / Ask about transportation in Korean...`,
    pronunciationItems: `[
      {sent:'이 버스 조선소 앞에 서요?', eng:'Does this bus stop in front of the shipyard?'},
      {sent:'여기서 내려 주세요.', eng:'Please drop me off here.'},
      {sent:'얼마나 걸려요?', eng:'How long does it take?'},
      {sent:'버스로 20분이에요.', eng:'It\'s 20 minutes by bus.'},
      {sent:'어디서 갈아타요?', eng:'Where do I transfer?'},
    ]`,
  },

  'HanwhaOcean_Level1_Lesson14.html': {
    bannerTitle: '🛍️ AI 마트 쇼핑 코치',
    bannerSub: '가게 · 할인 · 쇼핑 대화 연습',
    bannerTag: '🔵 Shopping Coach × Retail Korean',
    quickBtns: `[
  { emoji:'🏪', label:'마트 쇼핑 대화',
    q:'한국 마트에서 쇼핑하는 한국어 대화를 연습해주세요. "이거 어디 있어요?", "할인 있어요?", "교환/환불 할 수 있어요?" 같은 표현을 롤플레이로 해주세요. 영어도요.' },
  { emoji:'💰', label:'할인/세일 표현',
    q:'한국 마트 할인 관련 표현을 알려주세요. 1+1, 세일, 특가, 쿠폰, 할인쿠폰을 어떻게 한국어로 말하고 활용하는지 영어와 함께 설명해주세요.' },
  { emoji:'🛒', label:'필요한 것 목록',
    q:'조선소 생활에 필요한 물건들을 한국어로 사는 연습을 해주세요. 세면도구, 속옷, 음료수, 라면 등을 마트에서 찾고 묻는 표현을 영어와 함께 알려주세요.' },
  { emoji:'🔄', label:'교환/환불 요청',
    q:'물건을 교환하거나 환불하는 한국어 표현을 알려주세요. "이거 교환하고 싶어요", "영수증 있어요", "사이즈가 안 맞아요" 같은 표현을 영어와 함께 5가지요.' },
  { emoji:'🤔', label:'~(으)ㄹ까요? 표현',
    q:'~(으)ㄹ까요? 표현을 쇼핑 상황으로 연습해주세요. "이게 좋을까요?", "같이 살까요?", "어디서 살까요?" 같은 제안 표현을 영어와 함께 5가지 만들어주세요.' },
]`,
    systemPrompt: `You are a Korean retail shopping coach for shipyard workers in Korea. Lesson focus: shopping vocab 가게(store), 마트(mart), 사다(buy), 비싸다(expensive), 할인(discount), suggestion pattern ~(으)ㄹ까요? (Shall we?). Help workers shop for daily necessities. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국 마트와 편의점에서 쇼핑하는 한국어 대화 연습을 도와주세요. 할인 표현과 필요한 물건 찾는 방법을 영어로도 알려주세요."`,
    inputPlaceholder: `쇼핑/마트 질문 / Ask about shopping in Korean...`,
    pronunciationItems: `[
      {sent:'이거 어디 있어요?', eng:'Where is this?'},
      {sent:'지금 세일 중이에요?', eng:'Is there a sale now?'},
      {sent:'교환할 수 있어요?', eng:'Can I exchange this?'},
      {sent:'영수증 있어요.', eng:'I have the receipt.'},
      {sent:'더 싼 것 있어요?', eng:'Is there a cheaper one?'},
    ]`,
  },

  'HanwhaOcean_Level1_Lesson15.html': {
    bannerTitle: '📅 AI 약속 계획 도우미',
    bannerSub: '만남 약속 · 미래 계획 · ~(으)ㄹ 거예요',
    bannerTag: '🔵 Future Plans Coach × Schedule Korean',
    quickBtns: `[
  { emoji:'🤝', label:'약속 잡기',
    q:'한국어로 동료와 약속을 잡는 대화를 연습해주세요. "이번 주말에 만날까요?", "몇 시에 어디서 만나요?", "알겠어요. 그때 봐요" 같은 표현을 롤플레이로 해주세요.' },
  { emoji:'🎯', label:'주말 계획 말하기',
    q:'~(으)ㄹ 거예요 표현으로 주말 계획을 말하는 연습을 해주세요. "내일 운동할 거예요", "주말에 부산에 갈 거예요" 같은 미래 계획 문장 5개를 영어와 함께요.' },
  { emoji:'📍', label:'만날 장소 정하기',
    q:'약속 장소를 정하는 한국어 표현을 알려주세요. "어디서 만날까요?", "정문 앞에서 만나요", "버스 정류장에서 기다릴게요" 같은 위치+약속 표현을 영어와 함께요.' },
  { emoji:'⏰', label:'약속 시간 표현',
    q:'약속 시간을 한국어로 정하는 표현을 알려주세요. "몇 시가 좋아요?", "오후 3시 어때요?", "조금 늦을 것 같아요" 같은 시간+약속 표현을 영어와 함께 5가지요.' },
  { emoji:'❌', label:'약속 취소하기',
    q:'불가피하게 약속을 취소해야 할 때 한국어 표현을 알려주세요. "갑자기 일이 생겼어요", "미안해요. 다음에 만나요", "다음 주에 다시 약속해요" 표현을 영어와 함께요.' },
]`,
    systemPrompt: `You are a Korean appointment and future plans coach for shipyard workers. Lesson focus: appointment vocab 약속(appointment), 계획(plan), 만나다(meet), 시간(time), 장소(place), future tense ~(으)ㄹ 거예요 (will/going to). Help workers make and manage social plans. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국어로 동료와 약속을 잡고 주말 계획을 말하는 연습을 도와주세요. ~(으)ㄹ 거예요 표현을 사용한 대화를 영어로도 설명해 주세요."`,
    inputPlaceholder: `약속/계획 질문 / Ask about making plans in Korean...`,
    pronunciationItems: `[
      {sent:'이번 주말에 뭐 할 거예요?', eng:'What will you do this weekend?'},
      {sent:'같이 밥 먹을까요?', eng:'Shall we eat together?'},
      {sent:'오후 6시에 정문 앞에서 만나요.', eng:'Let\'s meet at 6 PM in front of the main gate.'},
      {sent:'갑자기 야근이 생겼어요.', eng:'Suddenly I have overtime work.'},
      {sent:'다음에 꼭 같이 가요.', eng:'Let\'s definitely go together next time.'},
    ]`,
  },

  'HanwhaOcean_Level1_Lesson16.html': {
    bannerTitle: '🏠 AI 숙소 문제 해결',
    bannerSub: '기숙사 생활 · 불편 신고 · 시설 요청',
    bannerTag: '🔵 Dormitory Life Coach × Housing Korean',
    quickBtns: `[
  { emoji:'🛏️', label:'기숙사 문제 신고',
    q:'조선소 기숙사 불편 사항을 신고하는 한국어 대화를 연습해주세요. "에어컨이 고장났어요", "뜨거운 물이 안 나와요", "수리해 주세요" 같은 표현을 롤플레이로요.' },
  { emoji:'🏢', label:'기숙사 규칙 표현',
    q:'기숙사 생활 규칙을 한국어로 이해하는 연습을 해주세요. "취침 시간이 뭐예요?", "외출 규정이 어떻게 돼요?", "세탁기 사용 시간이 있어요?" 같은 질문을 영어와 함께요.' },
  { emoji:'🌊', label:'시설 이름 알기',
    q:'기숙사/숙소 시설 이름을 한국어로 알려주세요. 침실, 거실, 화장실, 욕실, 세탁실, 식당을 영어와 함께, 각 시설에서 쓰는 표현도 알려주세요.' },
  { emoji:'👥', label:'룸메이트 대화',
    q:'기숙사 룸메이트와 한국어로 대화하는 연습을 해주세요. "불 꺼주세요", "조용히 해주세요", "같이 청소해요" 같은 공동생활 표현을 영어와 함께 5가지요.' },
  { emoji:'📝', label:'~고 있다 연습',
    q:'현재 진행 ~고 있다 표현을 기숙사 상황으로 연습해주세요. "지금 자고 있어요", "샤워하고 있어요", "청소하고 있어요" 문장 5개를 영어와 함께 만들어주세요.' },
]`,
    systemPrompt: `You are a Korean dormitory life coach for shipyard workers. Lesson focus: housing vocabulary 주거(housing), 침실(bedroom), 거실(living room), facilities 에어컨(AC), 세탁기(washing machine), progressive tense ~고 있다, making complaints and requests politely. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 기숙사에 사는 외국인 근로자예요. 기숙사 불편 사항을 신고하고 룸메이트와 소통하는 한국어 연습을 도와주세요. 시설 이름과 규칙 관련 표현을 영어로도 알려주세요."`,
    inputPlaceholder: `기숙사/숙소 질문 / Ask about dormitory Korean...`,
    pronunciationItems: `[
      {sent:'에어컨이 고장났어요.', eng:'The air conditioner is broken.'},
      {sent:'뜨거운 물이 안 나와요.', eng:'There\'s no hot water.'},
      {sent:'수리를 요청하고 싶어요.', eng:'I want to request repairs.'},
      {sent:'조용히 해 주세요.', eng:'Please be quiet.'},
      {sent:'지금 자고 있어요.', eng:'I\'m sleeping right now.'},
    ]`,
  },

  'HanwhaOcean_Level1_Lesson17.html': {
    bannerTitle: '🎨 AI 취미 대화 코치',
    bannerSub: '좋아하는 것 · 여가 · 취미 표현 연습',
    bannerTag: '🔵 Hobbies Coach × Leisure Korean',
    quickBtns: `[
  { emoji:'🎵', label:'취미 소개하기',
    q:'한국어로 취미를 소개하는 연습을 해주세요. "저는 노래 부르는 것을 좋아해요", "주말에 운동해요" 같은 취미 표현을 동료와 나누는 대화로 만들어주세요. 영어도요.' },
  { emoji:'🏋️', label:'운동/스포츠 표현',
    q:'조선소 근로자들이 즐기는 운동과 스포츠를 한국어로 알려주세요. 축구, 배드민턴, 헬스, 수영, 달리기. 각각 언제 어디서 하는지 예문과 영어로 설명해주세요.' },
  { emoji:'📺', label:'한국 엔터테인먼트',
    q:'한국 드라마, K팝, 유튜브를 즐기는 방법을 한국어로 알려주세요. "한국 드라마 좋아해요?", "어떤 음악 들어요?" 같은 대화 표현을 영어와 함께 5가지요.' },
  { emoji:'📸', label:'주말 여행 이야기',
    q:'거제도 관광지를 한국어로 소개하는 연습을 해주세요. 외도, 해금강, 바람의 언덕을 한국어로 이야기하는 표현을 영어와 함께 알려주세요.' },
  { emoji:'💬', label:'좋아하는 것 표현',
    q:'~는 것을 좋아하다 표현을 취미로 연습해주세요. "축구하는 것을 좋아해요", "음악 듣는 것이 좋아요" 같은 문장 5개를 만드는 방법을 영어와 함께 설명해주세요.' },
]`,
    systemPrompt: `You are a Korean hobbies and leisure coach for shipyard workers. Lesson focus: hobby vocab 취미(hobby), 여가(leisure), 노래(song/singing), 춤(dance), 영화 보다(watch movies), like-doing expression ~는 것을 좋아하다. Help workers talk about personal interests. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국어로 취미와 여가 활동을 이야기하는 연습을 도와주세요. 거제도 관광지와 한국 문화 즐기기를 영어로도 설명해 주세요."`,
    inputPlaceholder: `취미/여가 질문 / Ask about hobbies in Korean...`,
    pronunciationItems: `[
      {sent:'취미가 뭐예요?', eng:'What is your hobby?'},
      {sent:'저는 축구하는 것을 좋아해요.', eng:'I like playing soccer.'},
      {sent:'주말에 거제도 여행했어요.', eng:'I traveled around Geoje Island on the weekend.'},
      {sent:'한국 드라마를 자주 봐요.', eng:'I often watch Korean dramas.'},
      {sent:'같이 배드민턴 할까요?', eng:'Shall we play badminton together?'},
    ]`,
  },

  'HanwhaOcean_Level1_Lesson18.html': {
    bannerTitle: '📋 AI 서류 작성 도우미',
    bannerSub: '외국인 서류 · 비자 · 등록 표현 연습',
    bannerTag: '🔵 Document Guide × Administrative Korean',
    quickBtns: `[
  { emoji:'🪪', label:'외국인 등록증',
    q:'외국인 등록증 관련 한국어 표현을 알려주세요. "외국인 등록증을 만들어야 해요", "출입국관리소가 어디예요?", "서류가 뭐 필요해요?" 같은 표현을 영어와 함께요.' },
  { emoji:'📝', label:'서류 작성 표현',
    q:'한국 서류를 작성할 때 나오는 한국어 항목을 설명해주세요. 성명, 생년월일, 국적, 주소, 서명, 직인이 뭔지 영어로 설명하고, 작성 방법도 알려주세요.' },
  { emoji:'🔐', label:'비자/체류 표현',
    q:'한국 비자와 체류 관련 한국어를 알려주세요. E-9 비자, 체류 기간, 연장 신청, 출입국관리소 같은 표현을 외국인 근로자 상황으로 영어와 함께 알려주세요.' },
  { emoji:'🏥', label:'건강보험 등록',
    q:'한국 건강보험 가입 관련 한국어를 알려주세요. "건강보험에 가입했어요?", "직장 가입자예요", "보험증이 있어요?" 같은 표현을 영어와 함께 5가지 알려주세요.' },
  { emoji:'⚠️', label:'~아/어야 하다 표현',
    q:'의무 표현 ~아/어야 하다를 서류 상황으로 연습해주세요. "여권을 가져와야 해요", "서명해야 해요", "기한 안에 제출해야 해요" 문장 5개를 영어와 함께요.' },
]`,
    systemPrompt: `You are a Korean administrative documents coach for foreign workers in Korea. Lesson focus: document vocabulary 서류(documents), 성명(full name), 국적(nationality), 여권(passport), 서명(signature), obligation ~아/어야 하다 (must/have to). Help workers navigate Korean bureaucracy. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국에서 외국인 등록증 만들기, 비자 연장, 건강보험 가입에 필요한 한국어 표현을 배우고 싶어요. 서류 작성할 때 쓰는 단어를 영어로도 설명해 주세요."`,
    inputPlaceholder: `서류/비자 질문 / Ask about Korean documents...`,
    pronunciationItems: `[
      {sent:'외국인 등록증을 만들어야 해요.', eng:'I need to get a foreigner registration card.'},
      {sent:'여기에 서명해 주세요.', eng:'Please sign here.'},
      {sent:'어떤 서류가 필요해요?', eng:'What documents are needed?'},
      {sent:'체류 기간이 언제까지예요?', eng:'When does my stay period end?'},
      {sent:'출입국관리소가 어디 있어요?', eng:'Where is the immigration office?'},
    ]`,
  },

  'HanwhaOcean_Level1_Lesson19.html': {
    bannerTitle: '🌏 AI 한국 생활 가이드',
    bannerSub: '문화 적응 · 생활 팁 · 외국인 지원',
    bannerTag: '🔵 Korea Life Guide × Daily Life Korean',
    quickBtns: `[
  { emoji:'🏪', label:'한국 생활 적응',
    q:'한국에서 처음 생활하는 외국인 근로자를 위한 팁을 한국어로 알려주세요. 분리수거, 교통카드 충전, 편의점 활용, 공중 예절 표현을 영어와 함께 5가지요.' },
  { emoji:'🤝', label:'한국 문화 이해',
    q:'한국 직장 문화를 이해하는 데 도움되는 한국어 표현을 알려주세요. "어른에게 존댓말을 써요", "밥 먹었어요?" 인사, "수고하셨습니다" 의미를 영어로 설명해주세요.' },
  { emoji:'🆘', label:'도움 요청하기',
    q:'한국 생활에서 도움이 필요할 때 쓰는 한국어를 알려주세요. "도와주세요", "모르겠어요", "한국어를 잘 못해요. 천천히 말해주세요" 같은 표현을 영어와 함께요.' },
  { emoji:'📱', label:'외국인 지원 서비스',
    q:'한국 외국인 지원 서비스를 한국어로 알려주세요. 다누리 콜센터(1577-1366), 외국인 근로자 지원센터, 통역 서비스 이용 방법을 영어와 함께 설명해주세요.' },
  { emoji:'💬', label:'~(으)ㄴ/는 것 같다',
    q:'추측 표현 ~(으)ㄴ/는 것 같다를 한국 생활 상황으로 연습해주세요. "여기가 편의점인 것 같아요", "저 분이 팀장인 것 같아요" 문장 5개를 영어와 함께요.' },
]`,
    systemPrompt: `You are a Korean daily life adaptation coach for foreign workers in Korea. Lesson focus: daily life vocab 생활(daily life), 문화(culture), 적응(adaptation), life skill words, seeming/guessing expression ~(으)ㄴ/는 것 같다, useful resources like 다누리 콜센터. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국 생활에 적응하는 데 필요한 한국어 표현과 문화 팁을 알고 싶어요. 외국인 지원 서비스와 일상생활 표현을 영어로도 설명해 주세요."`,
    inputPlaceholder: `한국 생활 질문 / Ask about living in Korea...`,
    pronunciationItems: `[
      {sent:'천천히 말해 주세요.', eng:'Please speak slowly.'},
      {sent:'한국어를 조금밖에 못해요.', eng:'I can only speak a little Korean.'},
      {sent:'도와주세요. 모르겠어요.', eng:'Please help me. I don\'t understand.'},
      {sent:'외국인 지원센터가 어디예요?', eng:'Where is the foreign worker support center?'},
      {sent:'수고하셨습니다.', eng:'Thank you for your hard work.'},
    ]`,
  },

  'HanwhaOcean_Level1_Lesson20.html': {
    bannerTitle: '🚀 AI 미래 계획 코치',
    bannerSub: '꿈 · 자격증 · 목표 선언 표현',
    bannerTag: '🔵 Future Goals Coach × Aspiration Korean',
    quickBtns: `[
  { emoji:'🎯', label:'내 꿈 말하기',
    q:'한국어로 꿈과 목표를 표현하는 연습을 해주세요. "저는 조선소 기술자가 되고 싶어요", "한국어를 잘하고 싶어요" 같은 표현을 영어와 함께 5가지 만들어주세요.' },
  { emoji:'📜', label:'자격증/기술 목표',
    q:'조선소 기술 자격증과 관련된 한국어 표현을 알려주세요. 용접 자격증, 기술 향상, 승진, 자격 시험 준비에 쓰는 표현을 영어와 함께 5가지 알려주세요.' },
  { emoji:'📈', label:'성장/발전 표현',
    q:'직업적 성장을 표현하는 한국어를 알려주세요. "기술이 늘고 있어요", "작년보다 잘 해요", "계속 배우고 싶어요" 같은 발전 표현을 영어와 함께 알려주세요.' },
  { emoji:'🏠', label:'고향/미래 계획',
    q:'고향으로 돌아가거나 한국에서 정착하는 미래 계획을 한국어로 말하는 연습을 해주세요. "3년 후에 고향에 돌아갈 거예요", "한국에서 더 일하고 싶어요" 표현을 영어와 함께요.' },
  { emoji:'💬', label:'~(으)려고 하다',
    q:'의도 표현 ~(으)려고 하다를 목표 문장으로 연습해주세요. "한국어를 공부하려고 해요", "자격증을 따려고 해요" 같은 계획 문장 5개를 영어와 함께 만들어주세요.' },
]`,
    systemPrompt: `You are a Korean future goals and aspirations coach for shipyard workers. Lesson focus: goal vocab 꿈(dream), 미래(future), 계획(plan), 목표(goal), 자격증(certificate), intention expression ~(으)려고 하다 (intend to/plan to). Help workers express career and life goals. SHORT answers with English.`,
    geminiPrompt: `"저는 한화오션 조선소 외국인 근로자예요. 한국어로 미래 꿈과 목표를 표현하는 연습을 도와주세요. 자격증 취득 계획과 한국 생활 후 미래를 이야기하는 표현을 영어로도 설명해 주세요."`,
    inputPlaceholder: `꿈/목표 질문 / Ask about future goals in Korean...`,
    pronunciationItems: `[
      {sent:'저는 용접 기술자가 되고 싶어요.', eng:'I want to become a welding technician.'},
      {sent:'한국어를 더 잘하려고 공부해요.', eng:'I\'m studying to get better at Korean.'},
      {sent:'올해 자격증을 따려고 해요.', eng:'I\'m planning to get a certification this year.'},
      {sent:'3년 후에 고향에 돌아갈 거예요.', eng:'I will return home after 3 years.'},
      {sent:'열심히 일해서 성공하고 싶어요.', eng:'I want to work hard and succeed.'},
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
