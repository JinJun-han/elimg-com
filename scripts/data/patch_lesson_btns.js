/**
 * patch_lesson_btns.js
 * 모든 50개 레슨 HTML 파일에 레슨별 FAQ 버튼 업데이트
 * - Level 0: systemPrompt에 LESSON 태그 추가 + ai-quick 버튼 교체
 * - Level 1/2: sysP에 LESSON 태그 추가 + AI_QUICK_BTNS 교체
 */
const fs = require('fs');
const path = require('path');
const dir = __dirname;

// ── 레슨별 버튼 데이터 ─────────────────────────────────────
const LESSON_BTNS = {
  'L0L1': { title:'모음 발음 도우미', items:[
    {emoji:'📊',label:'기본 모음 6개',  q:'기본 모음 6개를 알려주세요'},
    {emoji:'🔊',label:'ㅏ/ㅓ 발음법',   q:'ㅏ 발음 ㅓ 발음을 어떻게 해요?'},
    {emoji:'🔊',label:'ㅗ/ㅜ/ㅡ/ㅣ 발음',q:'ㅗ 발음 ㅜ 발음 ㅡ 발음 ㅣ 발음을 알려주세요'},
    {emoji:'🔗',label:'복합 모음',       q:'복합 모음 이중모음을 알려주세요'},
    {emoji:'💡',label:'모음 발음 팁',    q:'모음 발음 팁 연습법을 알려주세요'},
  ]},
  'L0L2': { title:'자음1 발음 도우미', items:[
    {emoji:'🔊',label:'ㄱ/ㄴ/ㄷ 발음',  q:'ㄱ 발음 ㄴ 발음 ㄷ 발음을 알려주세요'},
    {emoji:'🔊',label:'ㄹ/ㅁ/ㅂ 발음',  q:'ㄹ 발음 ㅁ 발음 ㅂ 발음을 알려주세요'},
    {emoji:'💨',label:'격음 ㅋ/ㅌ/ㅍ',  q:'격음 aspirated ㅋ ㅌ ㅍ 발음을 알려주세요'},
    {emoji:'💪',label:'경음 ㄲ/ㄸ/ㅃ',  q:'경음 tense ㄲ ㄸ ㅃ 된소리 알려주세요'},
    {emoji:'📋',label:'자음 14개 총정리', q:'자음표 자음총정리 14개 모두 알려주세요'},
  ]},
  'L0L3': { title:'자음2 발음 도우미', items:[
    {emoji:'🔊',label:'ㅅ/ㅈ 발음',     q:'ㅅ 발음 ㅈ 발음을 알려주세요'},
    {emoji:'🔊',label:'ㅊ/ㅋ/ㅌ 발음',  q:'ㅊ 발음 ㅋ 발음 ㅌ 발음을 알려주세요'},
    {emoji:'🔊',label:'ㅍ/ㅎ 발음',     q:'ㅍ 발음 ㅎ 발음을 알려주세요'},
    {emoji:'🔤',label:'ㅇ의 특별 역할',  q:'ㅇ 받침 ㅇ 초성 silent ng 이응 역할을 알려주세요'},
    {emoji:'📋',label:'자음2 총정리',    q:'자음2 총정리 ㅅ부터ㅎ까지 알려주세요'},
  ]},
  'L0L4': { title:'음절 구조 도우미', items:[
    {emoji:'🏗️',label:'음절 구조란?',   q:'음절구조 syllable structure를 알려주세요'},
    {emoji:'🔤',label:'초성+중성 조합',  q:'초성중성 cv syllable 자음 모음 조합을 알려주세요'},
    {emoji:'📦',label:'받침 있는 음절',  q:'받침포함 cvc syllable 자음 모음 자음을 알려주세요'},
    {emoji:'📖',label:'음절 읽기 연습',  q:'음절읽기 읽기연습 syllable reading을 알려주세요'},
    {emoji:'🎯',label:'어려운 음절 팁', q:'쌍자음 겹모음 complex syllable 어려운 음절 팁을 알려주세요'},
  ]},
  'L0L5': { title:'받침 도우미', items:[
    {emoji:'❓',label:'받침이란?',       q:'받침이란 batchim 종성이란 무엇인가요?'},
    {emoji:'7️⃣',label:'대표 받침 7개',  q:'대표받침 7대표 7받침 representative batchim을 알려주세요'},
    {emoji:'🔗',label:'연음 규칙',       q:'연음 연음규칙 liaison 받침 모음을 알려주세요'},
    {emoji:'⚡',label:'겹받침',          q:'겹받침 double batchim 이중받침을 알려주세요'},
    {emoji:'📝',label:'받침 예시 단어',  q:'받침예시 batchim example 받침단어 연습을 알려주세요'},
  ]},
  'L0L6': { title:'숫자 도우미', items:[
    {emoji:'🔢',label:'한자어 숫자 1~10', q:'한자어숫자 일이삼 sino korean 1234 한국어를 알려주세요'},
    {emoji:'🔢',label:'고유어 숫자 1~10', q:'고유어숫자 하나둘셋 native korean 물건세기를 알려주세요'},
    {emoji:'❓',label:'어떤 숫자를 쓰나?', q:'숫자언제 어떤숫자 when to use 숫자구분을 알려주세요'},
    {emoji:'💰',label:'큰 숫자 (백/천/만)', q:'큰숫자 백천만 hundred thousand를 알려주세요'},
    {emoji:'📱',label:'전화번호 읽기',   q:'전화번호 번호읽기 phone number 핸드폰번호를 알려주세요'},
  ]},
  'L0L7': { title:'인사 표현 도우미', items:[
    {emoji:'👋',label:'만날 때 인사',    q:'만날때인사 만날때 greeting hello를 알려주세요'},
    {emoji:'🚶',label:'헤어질 때 인사',  q:'헤어질때 goodbye 작별인사를 알려주세요'},
    {emoji:'🙏',label:'감사/사과 표현', q:'감사표현 사과표현 thank sorry 감사합니다 죄송합니다를 알려주세요'},
    {emoji:'🤝',label:'처음 만날 때',    q:'처음만날때 first meeting 처음뵙겠습니다를 알려주세요'},
    {emoji:'🏭',label:'직장 인사 표현', q:'직장인사 work greeting 출근 퇴근 수고를 알려주세요'},
  ]},
  'L0L8': { title:'나라/국적 도우미', items:[
    {emoji:'🌍',label:'나라 이름',       q:'나라이름 나라목록 country name 베트남필리핀을 알려주세요'},
    {emoji:'🗣️',label:'~사람이에요 표현', q:'사람이에요 국적표현 i am from 출신 nationality를 알려주세요'},
    {emoji:'💬',label:'언어 이름',       q:'언어이름 language 한국어영어베트남어를 알려주세요'},
    {emoji:'❓',label:'국적 묻고 답하기', q:'국적묻기 어디서왔어요 where are you from 나라묻기를 알려주세요'},
    {emoji:'🏠',label:'내 나라 소개',    q:'내나라소개 나라소개 introducing country 고향을 알려주세요'},
  ]},
  'L0L9': { title:'지시어 도우미', items:[
    {emoji:'📍',label:'여기/거기/저기',  q:'여기거기저기 here there 장소지시어를 알려주세요'},
    {emoji:'👉',label:'이것/그것/저것',  q:'이것그것저것 this that 물건지시어를 알려주세요'},
    {emoji:'🏷️',label:'이/그/저 + 명사', q:'이그저 명사 demonstrative noun이 책을 알려주세요'},
    {emoji:'❓',label:'어디예요?',        q:'어디예요 where is 위치묻기를 알려주세요'},
    {emoji:'🎯',label:'지시어 대화 연습', q:'지시어연습 지시어대화 demonstrative practice를 알려주세요'},
  ]},
  'L0L10':{ title:'안전+KIIP 도우미', items:[
    {emoji:'⚠️',label:'안전 기본 표현',  q:'안전표현 safety expression 안전용어 위험조심을 알려주세요'},
    {emoji:'🚨',label:'비상 상황 대처',  q:'비상상황 emergency 대피 화재 119를 알려주세요'},
    {emoji:'📚',label:'KIIP 프로그램',   q:'kiip프로그램 사회통합프로그램 kiip이란 what is kiip를 알려주세요'},
    {emoji:'📊',label:'KIIP 단계 안내',  q:'kiip단계 kiip level 0단계1단계 kiip과정을 알려주세요'},
    {emoji:'🏅',label:'귀화/영주권',     q:'귀화 영주권 naturalization permanent residence 비자를 알려주세요'},
  ]},
  'L1L1': { title:'자기소개 도우미', items:[
    {emoji:'🙋',label:'자기소개 만들기', q:'자기소개만들기 self intro 저는 입니다 introduce yourself 소개패턴을 알려주세요'},
    {emoji:'📝',label:'이에요/예요 차이', q:'이에요예요차이 이에요vs예요 이에요 예요 is am are를 알려주세요'},
    {emoji:'🔤',label:'은/는 사용법',    q:'은는사용법 topic marker 은는조사 은 는 차이를 알려주세요'},
    {emoji:'🌏',label:'나라/직업 어휘',  q:'나라직업어휘 나라이름직업 country job vocabulary 직업단어를 알려주세요'},
    {emoji:'👋',label:'인사 표현 연습',  q:'인사연습 greeting practice 출근인사 안녕연습을 알려주세요'},
  ]},
  'L1L2': { title:'이것/그것 도우미', items:[
    {emoji:'👆',label:'이것/그것/저것',  q:'이것그것저것 this that those 이거뭐예요 물건가리키기를 알려주세요'},
    {emoji:'🔧',label:'도구 이름 알기',  q:'도구이름 공구이름 tool name 조선소도구를 알려주세요'},
    {emoji:'❓',label:'~이 뭐예요?',     q:'이 뭐예요 뭐예요 what is this 이름묻기를 알려주세요'},
    {emoji:'🗣️',label:'의문문 만들기',   q:'의문문만들기 question form 한국어질문 어떻게질문을 알려주세요'},
    {emoji:'🚢',label:'조선소 어휘',     q:'조선소어휘 shipyard vocabulary 현장단어 작업장용어를 알려주세요'},
  ]},
  'L1L3': { title:'위치 표현 도우미', items:[
    {emoji:'📍',label:'에 있어요/없어요', q:'에있어요없어요 location is 어디에있어요를 알려주세요'},
    {emoji:'🧭',label:'위치 표현',       q:'위치표현 위아래앞뒤 position words 위치단어를 알려주세요'},
    {emoji:'❓',label:'어디에 있어요?',  q:'어디에있어요 where is 위치묻기 찾기를 알려주세요'},
    {emoji:'➡️',label:'방향 말하기',     q:'방향말하기 direction 길안내 어떻게가요를 알려주세요'},
    {emoji:'🏭',label:'직장 위치 표현', q:'장소표현 직장장소 workplace location 어디서일해를 알려주세요'},
  ]},
  'L1L4': { title:'시간 표현 도우미', items:[
    {emoji:'⏰',label:'몇 시예요?',       q:'몇시예요 what time 시간묻기 지금몇시를 알려주세요'},
    {emoji:'🌅',label:'오전/오후/밤',    q:'오전오후밤 am pm night 아침점심저녁 시간대를 알려주세요'},
    {emoji:'📅',label:'요일 표현',        q:'요일표현 days of week 월화수목금 무슨요일을 알려주세요'},
    {emoji:'🕐',label:'~에 (시간 표현)', q:'에시간 time particle 시간에 언제에를 알려주세요'},
    {emoji:'🏭',label:'근무 시간 표현',  q:'근무시간 work schedule 교대시간 몇시출근을 알려주세요'},
  ]},
  'L1L5': { title:'가격/쇼핑 도우미', items:[
    {emoji:'💰',label:'얼마예요?',        q:'얼마예요 how much 가격묻기 얼마 price를 알려주세요'},
    {emoji:'💵',label:'원 단위 읽기',     q:'원읽기 won amount 만원천원 금액읽기를 알려주세요'},
    {emoji:'🙏',label:'주세요 사용법',    q:'주세요사용법 please give 주세요 를 알려주세요'},
    {emoji:'🔄',label:'거스름돈/영수증',  q:'거스름돈 change money 잔돈 영수증을 알려주세요'},
    {emoji:'🛒',label:'쇼핑 기본 대화',  q:'쇼핑기본 shopping basic 마트에서 편의점에서를 알려주세요'},
  ]},
  'L1L6': { title:'음식 주문 도우미', items:[
    {emoji:'🍽️',label:'메뉴 주문하기',   q:'메뉴주문 ordering food 음식주문 주문하기를 알려주세요'},
    {emoji:'😋',label:'맛 표현',          q:'맛표현 taste expression 맛있어요 맵다달다를 알려주세요'},
    {emoji:'🍜',label:'음식 이름',        q:'음식이름 korean food 한국음식 식당메뉴를 알려주세요'},
    {emoji:'🚫',label:'알레르기 말하기',  q:'알레르기 allergy 못먹어요 먹을수없어요를 알려주세요'},
    {emoji:'🙇',label:'식당 예절',        q:'식당예절 restaurant manner 식사예절 밥먹을때를 알려주세요'},
  ]},
  'L1L7': { title:'주말 활동 도우미', items:[
    {emoji:'🤔',label:'뭐 해요?',         q:'뭐해요 주말활동 what do you do weekend activity를 알려주세요'},
    {emoji:'🏃',label:'활동 동사',        q:'활동동사 activity verb 운동하다 등산하다를 알려주세요'},
    {emoji:'👫',label:'같이 ~해요',       q:'같이하자 let us 같이해요 함께를 알려주세요'},
    {emoji:'❤️',label:'좋아해요/싫어해요',q:'좋아해요싫어해요 like dislike 좋아해 싫어해를 알려주세요'},
    {emoji:'📅',label:'주말 계획',        q:'주말계획 weekend plan 이번주말 다음주말을 알려주세요'},
  ]},
  'L1L8': { title:'날씨 표현 도우미', items:[
    {emoji:'⛅',label:'날씨 표현',        q:'날씨표현 weather expression 날씨어때요 오늘날씨를 알려주세요'},
    {emoji:'🌸',label:'계절 이름',        q:'계절이름 seasons 봄여름가을겨울 한국계절을 알려주세요'},
    {emoji:'❓',label:'오늘 날씨 어때요?', q:'날씨어때요 how is weather 날씨묻기 오늘어때를 알려주세요'},
    {emoji:'👔',label:'날씨+옷 입기',     q:'날씨옷입기 weather clothing 옷입어요 무슨옷을 알려주세요'},
    {emoji:'🗣️',label:'날씨 대화',        q:'날씨대화 weather conversation 날씨연습 날씨이야기를 알려주세요'},
  ]},
  'L1L9': { title:'건강/신체 도우미', items:[
    {emoji:'💪',label:'신체 부위',        q:'신체부위 body part 어디아파요 몸부위를 알려주세요'},
    {emoji:'🤕',label:'아파요 표현',      q:'아파요표현 expressing pain 어디아파요 다쳤어요를 알려주세요'},
    {emoji:'🏥',label:'병원에 가야 해요', q:'병원가야해 need hospital 응급 구급차를 알려주세요'},
    {emoji:'💊',label:'약 먹어요',        q:'약먹어요 taking medicine 약국 처방전을 알려주세요'},
    {emoji:'⛑️',label:'작업장 건강 안전', q:'작업장건강 workplace health 안전건강 산재를 알려주세요'},
  ]},
  'L1L10':{ title:'전화/카카오톡 도우미', items:[
    {emoji:'📞',label:'전화 받기',        q:'전화받기 answering phone 여보세요 전화수신을 알려주세요'},
    {emoji:'📱',label:'전화 걸기',        q:'전화걸기 making call 전화하기 연락하기를 알려주세요'},
    {emoji:'💬',label:'카카오톡 사용',    q:'카카오톡 kakaotalk 카톡 메신저를 알려주세요'},
    {emoji:'✉️',label:'문자 표현',        q:'문자표현 text message 문자보내기 sms를 알려주세요'},
    {emoji:'💡',label:'전화 어려울 때',   q:'전화어려울때 phone difficult 한국어전화 전화팁을 알려주세요'},
  ]},
  'L1L11':{ title:'가족 호칭 도우미', items:[
    {emoji:'👨‍👩‍👧‍👦',label:'가족 이름',   q:'가족이름 family name 가족호칭 부모형제를 알려주세요'},
    {emoji:'🗣️',label:'가족 소개하기',   q:'가족소개 introducing family 가족있어요 몇명을 알려주세요'},
    {emoji:'👴',label:'친척 호칭',        q:'친척호칭 relative 삼촌이모고모 친척이름을 알려주세요'},
    {emoji:'🔢',label:'가족 수 표현',     q:'가족수 family size 형제자매 몇남몇녀를 알려주세요'},
    {emoji:'📞',label:'가족 대화',        q:'가족대화 family conversation 가족전화 가족연락을 알려주세요'},
  ]},
  'L1L12':{ title:'과거 시제 도우미', items:[
    {emoji:'⏪',label:'~았/었어요 만들기', q:'았었어요만들기 past tense 과거형 았어요었어요를 알려주세요'},
    {emoji:'⚡',label:'불규칙 동사',      q:'불규칙동사 irregular verb ㄷ불규칙 르불규칙을 알려주세요'},
    {emoji:'📅',label:'어제/지난주',      q:'어제지난주 yesterday last week 과거시간 전에를 알려주세요'},
    {emoji:'💼',label:'과거 경험',        q:'과거경험 past experience 해봤어요 본적있어요를 알려주세요'},
    {emoji:'🎯',label:'과거 시제 연습',   q:'과거연습 past practice 어제뭐했어요 과거이야기를 알려주세요'},
  ]},
  'L1L13':{ title:'교통 도우미', items:[
    {emoji:'🚌',label:'버스 타기',        q:'버스타기 taking bus 버스어떻게 버스번호를 알려주세요'},
    {emoji:'🚇',label:'지하철 이용',      q:'지하철이용 subway 지하철역 전철을 알려주세요'},
    {emoji:'❓',label:'어떻게 가요?',     q:'어떻게가요 how to get there 교통방법 가는방법을 알려주세요'},
    {emoji:'💳',label:'요금 내기',        q:'요금내기 paying fare 교통비 카드현금을 알려주세요'},
    {emoji:'📍',label:'교통 표현',        q:'교통표현 transportation expression 정류장 노선을 알려주세요'},
  ]},
  'L1L14':{ title:'쇼핑 도우미', items:[
    {emoji:'👗',label:'옷 쇼핑',          q:'옷쇼핑 clothes shopping 옷가게 의류를 알려주세요'},
    {emoji:'📏',label:'사이즈/색깔',      q:'사이즈색깔 size color 치수색상 색이름을 알려주세요'},
    {emoji:'🔄',label:'교환/환불',        q:'교환환불 exchange refund 반품 영수증교환을 알려주세요'},
    {emoji:'📱',label:'온라인 쇼핑',      q:'온라인쇼핑 online shopping 쿠팡 배달을 알려주세요'},
    {emoji:'🛒',label:'쇼핑 대화',        q:'쇼핑대화 shopping dialogue 가게에서 마트에서를 알려주세요'},
  ]},
  'L1L15':{ title:'약속 잡기 도우미', items:[
    {emoji:'🤝',label:'약속 잡기',        q:'약속잡기 making appointment 언제만나요 약속정하기를 알려주세요'},
    {emoji:'📝',label:'(으)ㄹ게요 문법',  q:'으ㄹ게요 으ㄹ게요문법 ㄹ게요 promise form을 알려주세요'},
    {emoji:'📍',label:'시간/장소 정하기', q:'시간장소정하기 setting time place 몇시에 어디서를 알려주세요'},
    {emoji:'✅',label:'약속 확인',        q:'약속확인 confirm appointment 약속확인하기 맞죠를 알려주세요'},
    {emoji:'🔄',label:'약속 변경/취소',   q:'약속변경취소 change cancel appointment 못가요 일정변경을 알려주세요'},
  ]},
  'L1L16':{ title:'주거 도우미', items:[
    {emoji:'🏠',label:'기숙사 생활',      q:'기숙사생활 dormitory life 기숙사규칙 숙소생활을 알려주세요'},
    {emoji:'🔑',label:'방 구하기',        q:'방구하기 finding room 집구하기 월세전세를 알려주세요'},
    {emoji:'🏡',label:'집 관련 표현',     q:'집관련표현 house expression 집어휘 방주방을 알려주세요'},
    {emoji:'👋',label:'이웃과 인사',      q:'이웃인사 greeting neighbor 이웃과인사 층간소음을 알려주세요'},
    {emoji:'📋',label:'주거 규칙',        q:'주거규칙 housing rules 집규칙 퇴실을 알려주세요'},
  ]},
  'L1L17':{ title:'취미 도우미', items:[
    {emoji:'🎯',label:'취미 말하기',      q:'취미말하기 hobby 취미뭐예요 좋아하는것을 알려주세요'},
    {emoji:'📅',label:'얼마나 자주?',     q:'얼마나자주 how often 주기표현 자주가끔을 알려주세요'},
    {emoji:'🌟',label:'잘 해요/못 해요',  q:'잘해요못해요 can cannot 을잘해요 실력표현을 알려주세요'},
    {emoji:'📚',label:'새 취미 배우기',   q:'새취미배우기 learning new hobby 배우고싶어요 어디배워요를 알려주세요'},
    {emoji:'🗣️',label:'취미 대화',        q:'취미대화 hobby conversation 취미이야기 같이취미를 알려주세요'},
  ]},
  'L1L18':{ title:'서류/외국인등록 도우미', items:[
    {emoji:'🪪',label:'외국인등록증',     q:'외국인등록증 alien registration 외국인등록 등록증을 알려주세요'},
    {emoji:'📄',label:'서류 신청하기',    q:'서류신청 document application 서류제출 신청방법을 알려주세요'},
    {emoji:'🛂',label:'비자 종류',        q:'비자종류 visa type 비자연장 체류자격을 알려주세요'},
    {emoji:'✏️',label:'서류 작성',        q:'서류작성 form filling 양식작성 신청서쓰기를 알려주세요'},
    {emoji:'🏛️',label:'행정 표현',        q:'행정표현 administrative 민원 공공기관을 알려주세요'},
  ]},
  'L1L19':{ title:'한국 문화/예절 도우미', items:[
    {emoji:'🙇',label:'한국 기본 예절',   q:'한국예절 korean manner 기본예절 예의를 알려주세요'},
    {emoji:'🍽️',label:'식사 예절',        q:'식사예절 dining manner 밥먹을때 식탁예절을 알려주세요'},
    {emoji:'🎊',label:'명절/공휴일',      q:'명절휴일 holiday festival 추석설날 공휴일을 알려주세요'},
    {emoji:'🏢',label:'직장 문화',        q:'직장문화 workplace culture 한국직장 회사문화를 알려주세요'},
    {emoji:'💡',label:'한국 생활 팁',     q:'한국생활팁 korean life tip 한국에서생활 생활팁을 알려주세요'},
  ]},
  'L1L20':{ title:'미래 계획 도우미', items:[
    {emoji:'🔮',label:'(으)ㄹ 거예요',   q:'으ㄹ거예요만들기 future tense 미래형 ㄹ거예요를 알려주세요'},
    {emoji:'📅',label:'계획 말하기',      q:'계획말하기 describing plans 앞으로계획 무슨계획을 알려주세요'},
    {emoji:'⭐',label:'희망/꿈 표현',     q:'희망꿈표현 hope dream 고싶어요 원해요를 알려주세요'},
    {emoji:'🎯',label:'미래 목표',        q:'미래목표 future goal 목표말하기 앞으로를 알려주세요'},
    {emoji:'🗣️',label:'미래 대화',        q:'미래대화 future conversation 계획이야기 꿈이야기를 알려주세요'},
  ]},
  'L2L1': { title:'경력 소개 도우미', items:[
    {emoji:'💼',label:'경력 소개하기',    q:'경력소개 career intro 자기소개경력 직장경력을 알려주세요'},
    {emoji:'📝',label:'(으)ㄴ/는데 문법', q:'으ㄴ는데문법 background contrast 는데문법 ㄴ데는데를 알려주세요'},
    {emoji:'🏅',label:'기술/자격증',      q:'기술자격증 skill certificate 자격증 기술어필을 알려주세요'},
    {emoji:'🏭',label:'직장 경험',        q:'직장경험 work experience 어디서일했어요 경험말하기를 알려주세요'},
    {emoji:'⭐',label:'자기 어필',        q:'자기어필 selling yourself 강점말하기 잘하는것을 알려주세요'},
  ]},
  'L2L2': { title:'직장 전화 도우미', items:[
    {emoji:'📞',label:'전화 받기(직장)',  q:'직장전화받기 answering work call 여보세요직장 회사전화를 알려주세요'},
    {emoji:'📋',label:'메모 남기기',      q:'메모남기기 taking message 메모전달 전언을 알려주세요'},
    {emoji:'🔗',label:'전화 연결하기',    q:'전화연결 transferring call 연결해드릴게요 담당자연결을 알려주세요'},
    {emoji:'✋',label:'잠깐만요 표현',    q:'잠깐만요 hold on 기다려주세요 잠시만요를 알려주세요'},
    {emoji:'📱',label:'부재중 대응',      q:'부재중 missed call 자리비움 전화못받았어요를 알려주세요'},
  ]},
  'L2L3': { title:'약속 변경 도우미', items:[
    {emoji:'🔄',label:'약속 변경 요청',   q:'약속변경요청 reschedule 변경해도될까요 일정변경을 알려주세요'},
    {emoji:'❌',label:'약속 취소하기',    q:'약속취소 cancel appointment 취소하기 못가요를 알려주세요'},
    {emoji:'📆',label:'날짜/요일 표현',   q:'날짜요일표현 date day expression 날짜말하기 요일을 알려주세요'},
    {emoji:'🤝',label:'회의 일정 잡기',   q:'회의일정잡기 schedule meeting 회의잡기 언제시간을 알려주세요'},
    {emoji:'📝',label:'-는데 복습',       q:'는데복습 는데grammar review 는데연습 배경설명을 알려주세요'},
  ]},
  'L2L4': { title:'은행 도우미', items:[
    {emoji:'🏦',label:'계좌 개설',        q:'계좌개설 open bank account 통장만들기 은행계좌를 알려주세요'},
    {emoji:'💸',label:'송금/이체',        q:'송금이체 money transfer 고향송금 해외송금을 알려주세요'},
    {emoji:'🏧',label:'ATM 사용법',       q:'atm사용 atm use 현금인출 카드기계를 알려주세요'},
    {emoji:'💱',label:'환전하기',         q:'환전하기 currency exchange 환율 외화를 알려주세요'},
    {emoji:'💬',label:'은행 표현',        q:'은행표현 banking expression 은행에서 금융을 알려주세요'},
  ]},
  'L2L5': { title:'병원/의료 도우미', items:[
    {emoji:'🩺',label:'증상 설명하기',    q:'증상설명 symptom description 어디아파요 의사에게를 알려주세요'},
    {emoji:'📄',label:'진단서/처방전',    q:'진단서처방전 diagnosis prescription 진단서 처방전을 알려주세요'},
    {emoji:'💊',label:'약국에서',         q:'약국에서 at pharmacy 약사 약이름을 알려주세요'},
    {emoji:'🏥',label:'의료보험',         q:'의료보험 health insurance 건강보험 보험카드를 알려주세요'},
    {emoji:'🚨',label:'응급 상황',        q:'응급상황 emergency situation 응급실 119전화를 알려주세요'},
  ]},
  'L2L6': { title:'뉴스/미디어 도우미', items:[
    {emoji:'📰',label:'뉴스 읽기',        q:'뉴스읽기 reading news 뉴스보기 뉴스이해를 알려주세요'},
    {emoji:'📺',label:'미디어 표현',      q:'미디어표현 media expression 방송 신문을 알려주세요'},
    {emoji:'📝',label:'기사 이해하기',    q:'기사이해 understanding article 뉴스단어 기사어휘를 알려주세요'},
    {emoji:'💬',label:'의견 말하기',      q:'의견말하기 expressing opinion 생각말하기 내생각을 알려주세요'},
    {emoji:'📖',label:'뉴스 어휘',        q:'뉴스어휘 news vocabulary 뉴스단어 미디어용어를 알려주세요'},
  ]},
  'L2L7': { title:'회의 도우미', items:[
    {emoji:'🎤',label:'회의 시작',        q:'회의시작 starting meeting 회의시작하기 회의개회를 알려주세요'},
    {emoji:'💡',label:'의견 제시',        q:'의견제시 presenting opinion 의견말하기 회의발언을 알려주세요'},
    {emoji:'👍',label:'동의/반대',        q:'동의반대 agree disagree 동의해요 반대해요를 알려주세요'},
    {emoji:'📋',label:'회의록 작성',      q:'회의록 meeting minutes 회의기록 안건을 알려주세요'},
    {emoji:'✅',label:'회의 마무리',      q:'회의마무리 closing meeting 회의끝내기 마무리를 알려주세요'},
  ]},
  'L2L8': { title:'근로계약/권리 도우미', items:[
    {emoji:'📄',label:'근로계약서 읽기',  q:'근로계약서 work contract 계약서읽기 고용계약을 알려주세요'},
    {emoji:'⚖️',label:'근로 조건',        q:'근로조건 work condition 근무환경 조건확인을 알려주세요'},
    {emoji:'💰',label:'임금/수당',        q:'임금수당 wage allowance 월급 급여를 알려주세요'},
    {emoji:'✊',label:'권리 주장',        q:'권리주장 asserting rights 권리 노동자권리를 알려주세요'},
    {emoji:'🏛️',label:'노동 관련 기관',   q:'노동관련기관 labor agency 고용노동부 노동청을 알려주세요'},
  ]},
  'L2L9': { title:'장비 고장 도우미', items:[
    {emoji:'🔔',label:'고장 신고하기',    q:'고장신고 equipment failure report 장비고장 기계고장을 알려주세요'},
    {emoji:'🔍',label:'문제 설명하기',    q:'문제설명 describing problem 어디이상 고장증상을 알려주세요'},
    {emoji:'🔧',label:'수리 요청하기',    q:'수리요청 repair request 수리해주세요 AS요청을 알려주세요'},
    {emoji:'⛑️',label:'안전 조치',        q:'안전조치 safety measures 작업중지 위험구역을 알려주세요'},
    {emoji:'📖',label:'장비 어휘',        q:'장비어휘 equipment vocabulary 기계용어 공구이름을 알려주세요'},
  ]},
  'L2L10':{ title:'한국 역사 도우미', items:[
    {emoji:'📖',label:'역사 표현',        q:'한국역사표현 history expression 역사어휘 역사말하기를 알려주세요'},
    {emoji:'🏛️',label:'주요 역사 사건',   q:'주요역사사건 key event 한국역사사건 역사이야기를 알려주세요'},
    {emoji:'🎭',label:'한국 문화 배경',   q:'한국문화배경 cultural background 한국문화역사 역사문화를 알려주세요'},
    {emoji:'📚',label:'역사 어휘',        q:'역사어휘 history vocabulary 역사단어 역사용어를 알려주세요'},
    {emoji:'🏰',label:'문화유산',         q:'문화유산 cultural heritage 세계유산 유네스코를 알려주세요'},
  ]},
  'L2L11':{ title:'여행 계획 도우미', items:[
    {emoji:'✈️',label:'여행 계획',        q:'여행계획 travel planning 어디여행 여행하기를 알려주세요'},
    {emoji:'🏨',label:'숙소 예약',        q:'숙소예약 accommodation booking 호텔예약 숙박을 알려주세요'},
    {emoji:'🚄',label:'교통편 예약',      q:'교통편예약 transportation booking 기차버스예약 티켓을 알려주세요'},
    {emoji:'🗺️',label:'여행지 표현',      q:'여행지표현 tourist spot 관광지 가볼만한곳을 알려주세요'},
    {emoji:'🎒',label:'여행 준비',        q:'여행준비 travel preparation 여행챙기기 여행전을 알려주세요'},
  ]},
  'L2L12':{ title:'음식/요리 도우미', items:[
    {emoji:'😋',label:'맛 표현하기',      q:'맛표현 taste expression 음식맛 맛어때요를 알려주세요'},
    {emoji:'👨‍🍳',label:'조리 방법',      q:'조리방법 cooking method 요리법 어떻게요리를 알려주세요'},
    {emoji:'🥬',label:'음식 재료',        q:'음식재료 ingredients 재료이름 식재료를 알려주세요'},
    {emoji:'📖',label:'레시피 읽기',      q:'레시피읽기 reading recipe 레시피 요리순서를 알려주세요'},
    {emoji:'🍱',label:'한국 음식 문화',   q:'한국음식문화 korean food culture 식문화 음식문화를 알려주세요'},
  ]},
  'L2L13':{ title:'환경/분리수거 도우미', items:[
    {emoji:'♻️',label:'분리수거 방법',    q:'분리수거 sorting recyclables 재활용분리 쓰레기분리를 알려주세요'},
    {emoji:'🌱',label:'환경 보호',        q:'환경보호 environmental protection 환경지키기 친환경을 알려주세요'},
    {emoji:'🔄',label:'재활용하기',       q:'재활용 recycling 재활용방법 재활용품을 알려주세요'},
    {emoji:'📋',label:'환경 규정',        q:'환경규정 environmental regulation 환경법 규정을 알려주세요'},
    {emoji:'📖',label:'환경 어휘',        q:'환경어휘 environmental vocabulary 환경단어 지구를 알려주세요'},
  ]},
  'L2L14':{ title:'직업훈련 도우미', items:[
    {emoji:'📝',label:'직업훈련 신청',    q:'직업훈련신청 job training application 훈련신청 교육신청을 알려주세요'},
    {emoji:'🏅',label:'자격증 취득',      q:'자격증취득 getting certificate 자격증 국가기술자격을 알려주세요'},
    {emoji:'🏫',label:'훈련 과정',        q:'훈련과정 training course 교육과정 직업교육을 알려주세요'},
    {emoji:'💼',label:'취업 준비',        q:'취업준비 job preparation 이직준비 구직을 알려주세요'},
    {emoji:'🎓',label:'훈련 표현',        q:'훈련표현 training expression 교육표현 수료를 알려주세요'},
  ]},
  'L2L15':{ title:'경제 뉴스 도우미', items:[
    {emoji:'📰',label:'경제 뉴스 읽기',   q:'경제뉴스읽기 reading economic news 경제뉴스 경제기사를 알려주세요'},
    {emoji:'📊',label:'경제 용어',        q:'경제용어 economic term 경제단어 금융용어를 알려주세요'},
    {emoji:'💹',label:'물가 표현',        q:'물가표현 price inflation 물가올랐어요 비싸졌어요를 알려주세요'},
    {emoji:'📈',label:'경제 동향',        q:'경제동향 economic trend 경제상황 경제전망을 알려주세요'},
    {emoji:'💰',label:'재정 표현',        q:'재정표현 financial expression 돈관리 저축을 알려주세요'},
  ]},
  'L2L16':{ title:'노동법/권리 도우미', items:[
    {emoji:'⚖️',label:'근로기준법',       q:'근로기준법 labor standards act 노동법 법적권리를 알려주세요'},
    {emoji:'🏖️',label:'휴가/휴일 권리',  q:'휴가휴일권리 leave rights 연차 공휴일을 알려주세요'},
    {emoji:'🏥',label:'산재보험',         q:'산재보험 industrial accident 산재 작업중부상을 알려주세요'},
    {emoji:'✊',label:'권리 주장 표현',   q:'권리주장표현 asserting right 권리말하기 노동권을 알려주세요'},
    {emoji:'🏛️',label:'노동 관련 기관',   q:'노동관련기관 labor agency 상담기관 신고방법을 알려주세요'},
  ]},
  'L2L17':{ title:'취업 면접 도우미', items:[
    {emoji:'📄',label:'자기소개서 작성',  q:'자기소개서작성 writing resume 이력서 소개서를 알려주세요'},
    {emoji:'❓',label:'면접 질문 준비',   q:'면접질문준비 interview prep 면접질문 인터뷰를 알려주세요'},
    {emoji:'🗣️',label:'면접 답변 패턴',   q:'면접답변패턴 interview answer 답변패턴 면접잘하기를 알려주세요'},
    {emoji:'📝',label:'이력서 작성',      q:'이력서작성 cv writing 영문이력서 이력서항목을 알려주세요'},
    {emoji:'💼',label:'취업 표현',        q:'취업표현 job application 취업 채용을 알려주세요'},
  ]},
  'L2L18':{ title:'다문화 사회 도우미', items:[
    {emoji:'🌍',label:'다문화 사회 이해', q:'다문화사회이해 multicultural society 다문화 외국인근로자를 알려주세요'},
    {emoji:'🤝',label:'문화 차이 표현',   q:'문화차이 cultural difference 문화충격 한국vs우리나라를 알려주세요'},
    {emoji:'✊',label:'차별 대응',        q:'차별대응 responding to discrimination 차별 부당대우를 알려주세요'},
    {emoji:'📋',label:'다문화 정책',      q:'다문화정책 multicultural policy 외국인정책 지원정책을 알려주세요'},
    {emoji:'🌈',label:'문화 교류',        q:'문화교류 cultural exchange 문화나누기 다양성을 알려주세요'},
  ]},
  'L2L19':{ title:'발표 도우미', items:[
    {emoji:'🎤',label:'발표 시작',        q:'발표시작 starting presentation 발표시작하기 프레젠테이션시작을 알려주세요'},
    {emoji:'🗣️',label:'발표 진행',        q:'발표진행 presenting 발표하기 내용설명을 알려주세요'},
    {emoji:'📊',label:'시각자료 설명',    q:'시각자료설명 explaining visual 그래프표설명 슬라이드를 알려주세요'},
    {emoji:'❓',label:'질의응답',         q:'질의응답 q and a 질문받기 답변하기를 알려주세요'},
    {emoji:'✅',label:'발표 마무리',      q:'발표마무리 closing presentation 발표끝내기 마무리인사를 알려주세요'},
  ]},
  'L2L20':{ title:'졸업/미래 도우미', items:[
    {emoji:'🎓',label:'졸업 소감',        q:'졸업소감 graduation thoughts 졸업후 과정완료를 알려주세요'},
    {emoji:'🎯',label:'미래 목표',        q:'미래목표말하기 stating future goal 앞으로계획 목표를 알려주세요'},
    {emoji:'🌟',label:'성취 표현',        q:'성취표현 expressing achievement 해냈어요 성과를 알려주세요'},
    {emoji:'🙏',label:'감사 인사',        q:'감사인사 thank you expression 감사말 고마움표현을 알려주세요'},
    {emoji:'🚀',label:'앞으로의 계획',    q:'앞으로계획 plans going forward 다음단계 미래다짐을 알려주세요'},
  ]},
};

// ── Level 0 패치: systemPrompt + ai-quick 버튼 ─────────────
function patchLevel0(content, level, lesson) {
  const key = `L${level}L${lesson}`;
  const btns = LESSON_BTNS[key];
  if (!btns) return { content, changed: false };
  let changed = false;

  // 1. 시스템 프롬프트 변수에 LESSON 태그 추가 (없으면)
  if (!content.includes(`LESSON:${key}`)) {
    // 패턴A: const systemPrompt = `...`
    const spA = content.match(/(const systemPrompt\s*=\s*`)([^`]*?)(`)/);
    // 패턴B: const SYSTEM_PROMPT = `...`
    const spB = content.match(/(const SYSTEM_PROMPT\s*=\s*`)([^`]*?)(`)/);
    if (spA) {
      const newSp = spA[1] + spA[2].replace(/\s*LESSON:L\d+L\d+\s*$/, '') + `\nLESSON:${key}` + spA[3];
      content = content.replace(spA[0], newSp);
      changed = true;
    } else if (spB) {
      const newSp = spB[1] + spB[2].replace(/\s*LESSON:L\d+L\d+\s*$/, '') + `\nLESSON:${key}` + spB[3];
      content = content.replace(spB[0], newSp);
      changed = true;
      // SYSTEM_PROMPT를 systemPrompt로 alias (fetch 호출이 systemPrompt를 사용하므로)
      if (!content.includes('const systemPrompt = SYSTEM_PROMPT')) {
        content = content.replace(
          /const SYSTEM_PROMPT\s*=\s*`/,
          'const systemPrompt = SYSTEM_PROMPT;\nconst SYSTEM_PROMPT = `'
        );
        // 위 방식은 순서 문제가 있으므로 다른 방식 사용
        // 이미 changed이므로 replace 원래대로 되돌리고 다른 방식 적용
        content = content.replace(
          /const systemPrompt = SYSTEM_PROMPT;\nconst SYSTEM_PROMPT = `/,
          'const SYSTEM_PROMPT = `'
        );
        // 올바른 방식: SYSTEM_PROMPT 정의 뒤에 alias 추가
        content = content.replace(
          /(const SYSTEM_PROMPT\s*=\s*`[^`]*`\s*;?)/,
          `$1\nconst systemPrompt = SYSTEM_PROMPT;`
        );
      }
    }
  }

  // 2. ai-quick 버튼 처리
  const btnLabels = btns.items.map(b => b.label);
  const arrStr = JSON.stringify(btnLabels);
  const btnStyle = 'background:#f0fdf4;border:1px solid #15803d;color:#15803d;border-radius:20px;padding:5px 12px;font-size:11px';

  // 패턴A: 기존 id="ai-quick" 배열 교체
  const quickRe = /(\bid="ai-quick"[^>]*>\s*\$\{)\s*\[.*?\]\s*(\.map\(q=>`<button)/s;
  if (quickRe.test(content)) {
    content = content.replace(quickRe, `$1${arrStr}$2`);
    changed = true;
  } else {
    // 패턴B: aiSection()에 ai-quick 없음 → ai-chat 뒤에 삽입
    const quickHtml = `<div style="margin-bottom:8px;display:flex;gap:6px;flex-wrap:wrap" id="ai-quick">\\n      ${btnLabels.map(q => `<button onclick="(function(){document.getElementById('ai-input').value=${JSON.stringify(q)};sendAI();})()" style="${btnStyle}">${q}</button>`).join('')}\\n    </div>`;
    const chatDivRe = /(<div id="ai-chat"[^>]*><\/div>)\s*(\s*<div style="display:flex;gap:6px">)/;
    if (chatDivRe.test(content)) {
      content = content.replace(chatDivRe, `$1\n    ${quickHtml}$2`);
      changed = true;
    }
  }

  return { content, changed };
}

// ── Level 1/2 패치: sysP + AI_QUICK_BTNS ─────────────────
function patchLevel12(content, level, lesson) {
  const key = `L${level}L${lesson}`;
  const btns = LESSON_BTNS[key];
  if (!btns) return { content, changed: false };
  let changed = false;

  // 1. sysP에 LESSON 태그 추가 (없으면)
  if (!content.includes(`LESSON:${key}`)) {
    // sysP는 backtick 또는 single/double quote
    const spBt = content.match(/(var sysP\s*=\s*`)([^`]*?)(`)/);
    const spSq = content.match(/(var sysP\s*=\s*')([\s\S]*?)('(?:\s*;))/);
    const spDq = content.match(/(var sysP\s*=\s*")([\s\S]*?)("(?:\s*;))/);
    if (spBt) {
      content = content.replace(spBt[0], spBt[1] + spBt[2].replace(/\s*LESSON:L\d+L\d+\s*$/, '') + `\nLESSON:${key}` + spBt[3]);
      changed = true;
    } else if (spSq) {
      content = content.replace(spSq[0], spSq[1] + spSq[2].replace(/\s*LESSON:L\d+L\d+\s*$/, '') + `\nLESSON:${key}` + spSq[3]);
      changed = true;
    } else if (spDq) {
      content = content.replace(spDq[0], spDq[1] + spDq[2].replace(/\s*LESSON:L\d+L\d+\s*$/, '') + `\nLESSON:${key}` + spDq[3]);
      changed = true;
    }
  }

  // 2. AI_QUICK_BTNS 배열 교체
  const newBtns = btns.items.map(b =>
    `  {emoji:'${b.emoji}',label:'${b.label}',\n   q:'${b.q.replace(/'/g, "\\'")}' }`
  ).join(',\n');
  const quickRe = /var AI_QUICK_BTNS\s*=\s*\[[\s\S]*?\];/;
  if (quickRe.test(content)) {
    content = content.replace(quickRe, `var AI_QUICK_BTNS = [\n${newBtns}\n];`);
    changed = true;
  }

  return { content, changed };
}

// ── 메인 실행 ──────────────────────────────────────────────
let updated = 0, skipped = 0, missing = 0;

for (let level = 0; level <= 2; level++) {
  for (let lesson = 1; lesson <= 20; lesson++) {
    const fname = `HanwhaOcean_Level${level}_Lesson${lesson}.html`;
    const fp = path.join(dir, fname);
    if (!fs.existsSync(fp)) { missing++; continue; }

    let content = fs.readFileSync(fp, 'utf8');
    let result;
    if (level === 0) {
      result = patchLevel0(content, level, lesson);
    } else {
      result = patchLevel12(content, level, lesson);
    }

    if (result.changed) {
      fs.writeFileSync(fp, result.content, 'utf8');
      updated++;
      process.stdout.write(`✅ ${fname}\n`);
    } else {
      skipped++;
      process.stdout.write(`⏭  ${fname}\n`);
    }
  }
}

console.log(`\n완료: ${updated}개 업데이트, ${skipped}개 스킵, ${missing}개 없음`);
