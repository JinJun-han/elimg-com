/**
 * build_kiip_lessons.js
 * Generates missing KIIP lesson HTML files:
 *   Level3 Lessons 2-20 (orange/amber theme)
 *   Level0 Lessons 2-8  (green theme)
 *
 * Run: node build_kiip_lessons.js  (from C:\Users\kodhj\elimg-com\)
 */

const fs   = require('fs');
const path = require('path');

// ── LEVEL 3 LESSON DATA ─────────────────────────────────────────────────────

const L3_LESSONS = [
  // lesson 1 already exists, start from 2
  {
    num: 2,
    titleKo: '건강한 생활',
    titleEn: 'Healthy Life',
    emoji: '🏃',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 3. The student is likely Vietnamese. This lesson is about healthy lifestyle (건강한 생활). Answer in Korean with Vietnamese translation. Be concise and friendly. Focus on KIIP content.',
    quickBtns: [
      { emoji:'🥗', label:'건강 어휘 설명', q:'KIIP 3급 2과 어휘: 건강한 생활 관련 단어를 10개 알려주세요. 한국어, 발음, 영어, 베트남어 번역을 포함해 주세요.' },
      { emoji:'💊', label:'건강 표현 연습', q:'KIIP 3급 2과: "건강을 위해 운동을 하면 할수록 좋다" 같은 문장을 5개 만들어 주세요. -(으)ㄹ수록 문법을 사용해 주세요.' },
      { emoji:'🏥', label:'병원 롤플레이', q:'병원에서 의사와 환자 대화 롤플레이를 해주세요. 저는 KIIP 3급 학습자입니다. 증상 설명하는 표현을 연습하고 싶어요.' },
      { emoji:'🇻🇳', label:'베트남어로 설명', q:'건강한 생활 관련 한국어 표현을 베트남어로 설명해 주세요. 운동, 식사, 수면 관련 단어와 문장을 알려주세요.' },
    ],
  },
  {
    num: 3,
    titleKo: '소비와 경제',
    titleEn: 'Consumption & Economy',
    emoji: '💰',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 3. The student is likely Vietnamese. This lesson is about consumption and economy (소비와 경제). Answer in Korean with Vietnamese translation. Be concise and friendly.',
    quickBtns: [
      { emoji:'🛒', label:'소비 어휘 설명', q:'KIIP 3급 3과: 소비와 경제 관련 어휘 10개를 한국어, 발음, 영어, 베트남어로 알려주세요. 쇼핑, 저축, 지출 관련 단어 포함해 주세요.' },
      { emoji:'💳', label:'쇼핑 표현 연습', q:'한국에서 쇼핑할 때 사용하는 표현을 알려주세요. 가격 흥정, 환불, 교환 관련 문장을 베트남어 번역과 함께 알려주세요.' },
      { emoji:'🏦', label:'은행 롤플레이', q:'한국 은행에서 계좌 개설하는 롤플레이를 해주세요. KIIP 3급 학습자입니다. 자주 쓰는 표현을 연습하고 싶어요.' },
      { emoji:'📊', label:'경제 단어 퀴즈', q:'소비와 경제 관련 KIIP 3급 수준 퀴즈 3개를 만들어 주세요. 정답과 베트남어 해설을 포함해 주세요.' },
    ],
  },
  {
    num: 4,
    titleKo: '직업과 일',
    titleEn: 'Occupation & Work',
    emoji: '💼',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 3. The student is likely Vietnamese. This lesson is about occupations and work (직업과 일). Answer in Korean with Vietnamese translation. Be concise and friendly.',
    quickBtns: [
      { emoji:'👔', label:'직업 어휘 설명', q:'KIIP 3급 4과: 직업과 일 관련 어휘 10개를 한국어, 발음, 영어, 베트남어로 알려주세요. 다양한 직종 이름 포함해 주세요.' },
      { emoji:'📋', label:'이력서 표현', q:'한국 이력서와 자기소개서에 자주 쓰는 표현을 알려주세요. 베트남어 번역과 예시 문장도 포함해 주세요.' },
      { emoji:'🤝', label:'면접 롤플레이', q:'한국 취업 면접 롤플레이를 해주세요. KIIP 3급 학습자입니다. 자기소개, 지원 동기, 강점 설명하는 표현을 연습하고 싶어요.' },
      { emoji:'🏭', label:'직장 문화 설명', q:'한국 직장 문화에 대해 설명해 주세요. 상하관계, 회식, 야근 관련 표현을 베트남어로 설명해 주세요.' },
    ],
  },
  {
    num: 5,
    titleKo: '공공 서비스',
    titleEn: 'Public Services',
    emoji: '🏛️',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 3. The student is likely Vietnamese. This lesson is about public services (공공 서비스). Answer in Korean with Vietnamese translation. Be concise and friendly.',
    quickBtns: [
      { emoji:'🏢', label:'공공기관 어휘', q:'KIIP 3급 5과: 공공 서비스 관련 어휘 10개를 한국어, 발음, 영어, 베트남어로 알려주세요. 주민센터, 경찰서, 소방서 등 포함해 주세요.' },
      { emoji:'📝', label:'민원 신청 표현', q:'한국 주민센터에서 민원 신청할 때 사용하는 표현을 알려주세요. 전입신고, 외국인등록증 관련 문장을 베트남어와 함께 알려주세요.' },
      { emoji:'🚌', label:'대중교통 연습', q:'한국 대중교통 이용할 때 표현을 연습해 주세요. 버스, 지하철, 환승 관련 대화를 롤플레이 형식으로 알려주세요.' },
      { emoji:'❓', label:'공공서비스 퀴즈', q:'공공 서비스 관련 KIIP 3급 수준 퀴즈 3개를 만들어 주세요. 정답과 베트남어 해설을 포함해 주세요.' },
    ],
  },
  {
    num: 6,
    titleKo: '미디어',
    titleEn: 'Media',
    emoji: '📱',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 3. The student is likely Vietnamese. This lesson is about media (미디어). Answer in Korean with Vietnamese translation. Be concise and friendly.',
    quickBtns: [
      { emoji:'📺', label:'미디어 어휘 설명', q:'KIIP 3급 6과: 미디어 관련 어휘 10개를 한국어, 발음, 영어, 베트남어로 알려주세요. SNS, 뉴스, 방송 관련 단어 포함해 주세요.' },
      { emoji:'🗞️', label:'뉴스 표현 연습', q:'한국 뉴스를 보거나 설명할 때 사용하는 표현을 알려주세요. 보도, 취재, 기사 관련 문장을 베트남어 번역과 함께 알려주세요.' },
      { emoji:'📲', label:'SNS 표현 롤플레이', q:'SNS 사용 관련 한국어 표현을 연습해 주세요. 게시물 작성, 댓글, 공유, 팔로우 관련 문장을 예시로 알려주세요.' },
      { emoji:'🎬', label:'미디어 퀴즈', q:'미디어 관련 KIIP 3급 수준 퀴즈 3개를 만들어 주세요. 정답과 베트남어 해설을 포함해 주세요.' },
    ],
  },
  {
    num: 7,
    titleKo: '여가와 취미',
    titleEn: 'Leisure & Hobbies',
    emoji: '🎨',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 3. The student is likely Vietnamese. This lesson is about leisure and hobbies (여가와 취미). Answer in Korean with Vietnamese translation. Be concise and friendly.',
    quickBtns: [
      { emoji:'🎯', label:'취미 어휘 설명', q:'KIIP 3급 7과: 여가와 취미 관련 어휘 10개를 한국어, 발음, 영어, 베트남어로 알려주세요. 다양한 취미 활동 이름 포함해 주세요.' },
      { emoji:'🎮', label:'취미 소개 연습', q:'취미를 소개하는 한국어 표현을 연습해 주세요. "저는 ~을/를 즐겨요", "~하는 것을 좋아해요" 등 표현을 베트남어와 함께 알려주세요.' },
      { emoji:'💬', label:'여가 계획 롤플레이', q:'주말 여가 계획을 세우는 대화 롤플레이를 해주세요. KIIP 3급 학습자입니다. 친구에게 여행, 운동, 독서 등 제안하는 표현을 연습하고 싶어요.' },
      { emoji:'🌟', label:'한국 여가 문화', q:'한국인의 여가 문화에 대해 설명해 주세요. 취미 활동, 여행, 한류 등을 베트남어 번역과 함께 알려주세요.' },
    ],
  },
  {
    num: 8,
    titleKo: '사고와 안전',
    titleEn: 'Accidents & Safety',
    emoji: '🚨',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 3. The student is likely Vietnamese. This lesson is about accidents and safety (사고와 안전). Answer in Korean with Vietnamese translation. Be concise and friendly.',
    quickBtns: [
      { emoji:'🚒', label:'안전 어휘 설명', q:'KIIP 3급 8과: 사고와 안전 관련 어휘 10개를 한국어, 발음, 영어, 베트남어로 알려주세요. 사고, 응급, 구조 관련 단어 포함해 주세요.' },
      { emoji:'📞', label:'신고 표현 연습', q:'한국에서 사고 발생 시 신고하는 표현을 알려주세요. 119, 112 신고 시 사용하는 문장을 베트남어 번역과 함께 알려주세요.' },
      { emoji:'🏥', label:'응급 롤플레이', q:'응급 상황에서의 대화 롤플레이를 해주세요. 사고 신고, 부상 설명, 응급처치 요청 표현을 연습하고 싶어요.' },
      { emoji:'⚠️', label:'안전 규칙 설명', q:'한국의 안전 규칙과 주의사항을 알려주세요. 교통안전, 화재예방, 지진 대처 관련 표현을 베트남어로 설명해 주세요.' },
    ],
  },
  {
    num: 9,
    titleKo: '여행',
    titleEn: 'Travel',
    emoji: '✈️',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 3. The student is likely Vietnamese. This lesson is about travel (여행). Answer in Korean with Vietnamese translation. Be concise and friendly.',
    quickBtns: [
      { emoji:'🗺️', label:'여행 어휘 설명', q:'KIIP 3급 9과: 여행 관련 어휘 10개를 한국어, 발음, 영어, 베트남어로 알려주세요. 교통, 숙박, 관광 관련 단어 포함해 주세요.' },
      { emoji:'🏨', label:'호텔 표현 연습', q:'호텔 체크인/체크아웃, 방 예약 관련 표현을 알려주세요. KIIP 3급 수준 대화 예시를 베트남어 번역과 함께 알려주세요.' },
      { emoji:'🗼', label:'관광지 롤플레이', q:'한국 관광지에서 길 묻기, 입장권 구매 대화 롤플레이를 해주세요. 자주 사용하는 표현을 연습하고 싶어요.' },
      { emoji:'🌏', label:'한국 여행지 추천', q:'한국의 유명 여행지를 소개해 주세요. 서울, 부산, 제주도 등 주요 관광지 설명을 베트남어와 함께 알려주세요.' },
    ],
  },
  {
    num: 10,
    titleKo: '환경과 자연',
    titleEn: 'Environment & Nature',
    emoji: '🌿',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 3. The student is likely Vietnamese. This lesson is about environment and nature (환경과 자연). Answer in Korean with Vietnamese translation. Be concise and friendly.',
    quickBtns: [
      { emoji:'♻️', label:'환경 어휘 설명', q:'KIIP 3급 10과: 환경과 자연 관련 어휘 10개를 한국어, 발음, 영어, 베트남어로 알려주세요. 오염, 재활용, 기후 관련 단어 포함해 주세요.' },
      { emoji:'🌍', label:'환경 표현 연습', q:'환경 보호 관련 표현을 알려주세요. "환경을 위해 ~해야 합니다" 같은 문장을 5개 베트남어와 함께 알려주세요.' },
      { emoji:'💚', label:'환경 토론 연습', q:'환경 문제에 대한 의견을 표현하는 연습을 해주세요. 환경오염, 기후변화에 대한 생각을 한국어로 말하는 방법을 가르쳐 주세요.' },
      { emoji:'🌱', label:'한국 환경 정책', q:'한국의 환경 정책과 분리수거 방법을 설명해 주세요. 베트남과 비교해서 비슷한 점, 다른 점을 베트남어로 알려주세요.' },
    ],
  },
  {
    num: 11,
    titleKo: '교육',
    titleEn: 'Education',
    emoji: '📚',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 3. The student is likely Vietnamese. This lesson is about education (교육). Answer in Korean with Vietnamese translation. Be concise and friendly.',
    quickBtns: [
      { emoji:'🏫', label:'교육 어휘 설명', q:'KIIP 3급 11과: 교육 관련 어휘 10개를 한국어, 발음, 영어, 베트남어로 알려주세요. 학교, 학원, 시험 관련 단어 포함해 주세요.' },
      { emoji:'📖', label:'학습 표현 연습', q:'공부, 시험, 성적 관련 표현을 알려주세요. 자녀 교육, 학교 관련 문장을 베트남어 번역과 함께 알려주세요.' },
      { emoji:'👨‍👩‍👧', label:'학부모 롤플레이', q:'학교 선생님과 학부모 상담 대화 롤플레이를 해주세요. KIIP 3급 학습자입니다. 자녀 교육 상담 표현을 연습하고 싶어요.' },
      { emoji:'🎓', label:'한국 교육 제도', q:'한국 교육 제도를 설명해 주세요. 초등학교, 중학교, 고등학교, 대학교 체계를 베트남 교육과 비교해서 알려주세요.' },
    ],
  },
  {
    num: 12,
    titleKo: '공동체 생활',
    titleEn: 'Community Life',
    emoji: '🏘️',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 3. The student is likely Vietnamese. This lesson is about community life (공동체 생활). Answer in Korean with Vietnamese translation. Be concise and friendly.',
    quickBtns: [
      { emoji:'🏠', label:'공동체 어휘 설명', q:'KIIP 3급 12과: 공동체 생활 관련 어휘 10개를 한국어, 발음, 영어, 베트남어로 알려주세요. 아파트, 이웃, 층간소음 관련 단어 포함해 주세요.' },
      { emoji:'🤝', label:'이웃 소통 표현', q:'이웃과 소통하는 한국어 표현을 알려주세요. 인사, 불편 사항 전달, 요청 관련 문장을 베트남어 번역과 함께 알려주세요.' },
      { emoji:'📣', label:'아파트 생활 연습', q:'아파트 관리소에 민원 제기하는 대화를 롤플레이해 주세요. 층간소음, 주차 문제 관련 표현을 연습하고 싶어요.' },
      { emoji:'🌏', label:'한국 공동체 문화', q:'한국의 아파트 문화와 공동체 생활 규칙을 설명해 주세요. 베트남 공동체 생활과 비교해서 베트남어로 알려주세요.' },
    ],
  },
  {
    num: 13,
    titleKo: '한국의 역사',
    titleEn: 'Korean History',
    emoji: '🏯',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 3. The student is likely Vietnamese. This lesson is about Korean history (한국의 역사). Answer in Korean with Vietnamese translation. Be concise and friendly.',
    quickBtns: [
      { emoji:'📜', label:'역사 어휘 설명', q:'KIIP 3급 13과: 한국 역사 관련 어휘 10개를 한국어, 발음, 영어, 베트남어로 알려주세요. 왕조, 독립, 근현대사 관련 단어 포함해 주세요.' },
      { emoji:'🏛️', label:'역사 표현 연습', q:'한국 역사를 설명할 때 사용하는 표현을 알려주세요. 조선시대, 일제강점기, 6·25전쟁 관련 문장을 베트남어와 함께 알려주세요.' },
      { emoji:'🗺️', label:'역사 문화재 연습', q:'한국 주요 역사 문화재에 대한 소개 표현을 연습해 주세요. 경복궁, 남대문, 석굴암 관련 표현을 롤플레이 형식으로 알려주세요.' },
      { emoji:'🇰🇷', label:'한국 역사 간략 정리', q:'KIIP 3급 학습자를 위한 한국 역사 핵심 내용을 요약해 주세요. 시험에 자주 나오는 역사 내용을 베트남어로 설명해 주세요.' },
    ],
  },
  {
    num: 14,
    titleKo: '한국의 지역',
    titleEn: 'Regions of Korea',
    emoji: '🗺️',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 3. The student is likely Vietnamese. This lesson is about the regions of Korea (한국의 지역). Answer in Korean with Vietnamese translation. Be concise and friendly.',
    quickBtns: [
      { emoji:'🌆', label:'지역 어휘 설명', q:'KIIP 3급 14과: 한국 지역 관련 어휘 10개를 한국어, 발음, 영어, 베트남어로 알려주세요. 수도권, 지방, 도시 관련 단어 포함해 주세요.' },
      { emoji:'🚄', label:'지역 소개 표현', q:'한국 주요 도시를 소개하는 표현을 알려주세요. 서울, 부산, 인천, 대구, 제주 등 특징을 베트남어와 함께 설명해 주세요.' },
      { emoji:'🏙️', label:'지역 비교 연습', q:'서울과 지방의 차이점에 대해 이야기하는 연습을 해주세요. 물가, 교통, 생활 환경 비교 표현을 KIIP 3급 수준으로 알려주세요.' },
      { emoji:'📍', label:'내가 사는 지역', q:'한국에서 사는 외국인이 자신의 거주 지역을 소개하는 표현을 알려주세요. 지역 특색 설명하는 문장을 베트남어 번역과 함께 알려주세요.' },
    ],
  },
  {
    num: 15,
    titleKo: '한국 사회',
    titleEn: 'Korean Society',
    emoji: '🇰🇷',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 3. The student is likely Vietnamese. This lesson is about Korean society (한국 사회). Answer in Korean with Vietnamese translation. Be concise and friendly.',
    quickBtns: [
      { emoji:'🌐', label:'사회 어휘 설명', q:'KIIP 3급 15과: 한국 사회 관련 어휘 10개를 한국어, 발음, 영어, 베트남어로 알려주세요. 다문화, 인구, 사회 현상 관련 단어 포함해 주세요.' },
      { emoji:'📊', label:'사회 현상 표현', q:'한국 사회 현상을 설명하는 표현을 알려주세요. 저출산, 고령화, 다문화 사회 관련 문장을 베트남어와 함께 알려주세요.' },
      { emoji:'💬', label:'사회 이슈 토론', q:'한국 사회 이슈에 대한 의견을 표현하는 연습을 해주세요. 외국인 근로자, 다문화 가정에 대한 생각을 한국어로 말하는 방법을 알려주세요.' },
      { emoji:'🤝', label:'다문화 사회 이해', q:'한국의 다문화 사회 정책을 설명해 주세요. KIIP 프로그램의 목적과 사회통합 관련 내용을 베트남어로 알려주세요.' },
    ],
  },
  {
    num: 16,
    titleKo: '공공시설 이용',
    titleEn: 'Public Facilities',
    emoji: '🏢',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 3. The student is likely Vietnamese. This lesson is about using public facilities (공공시설 이용). Answer in Korean with Vietnamese translation. Be concise and friendly.',
    quickBtns: [
      { emoji:'🏛️', label:'공공시설 어휘', q:'KIIP 3급 16과: 공공시설 관련 어휘 10개를 한국어, 발음, 영어, 베트남어로 알려주세요. 도서관, 체육관, 복지관 관련 단어 포함해 주세요.' },
      { emoji:'📚', label:'도서관 이용 표현', q:'도서관에서 사용하는 표현을 알려주세요. 도서 대출, 반납, 연장 관련 대화를 베트남어 번역과 함께 알려주세요.' },
      { emoji:'🏋️', label:'공공시설 롤플레이', q:'공공 체육관 등록하는 대화를 롤플레이해 주세요. 시설 이용 방법 문의, 가격 확인 관련 표현을 연습하고 싶어요.' },
      { emoji:'🗂️', label:'공공시설 이용 안내', q:'한국의 주요 공공시설 이용 방법을 안내해 주세요. 외국인도 이용 가능한 복지 시설과 서비스를 베트남어로 설명해 주세요.' },
    ],
  },
  {
    num: 17,
    titleKo: '법과 제도',
    titleEn: 'Law & Systems',
    emoji: '⚖️',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 3. The student is likely Vietnamese. This lesson is about law and systems (법과 제도). Answer in Korean with Vietnamese translation. Be concise and friendly.',
    quickBtns: [
      { emoji:'📋', label:'법·제도 어휘 설명', q:'KIIP 3급 17과: 법과 제도 관련 어휘 10개를 한국어, 발음, 영어, 베트남어로 알려주세요. 법률, 권리, 의무 관련 단어 포함해 주세요.' },
      { emoji:'🪪', label:'체류 관련 표현', q:'외국인 체류 및 비자 관련 표현을 알려주세요. 비자 갱신, 체류 연장, 외국인등록증 관련 문장을 베트남어와 함께 알려주세요.' },
      { emoji:'⚖️', label:'법적 권리 연습', q:'한국에서 외국인이 알아야 할 권리와 의무를 설명해 주세요. 근로 권리, 의료 보험 관련 표현을 KIIP 수준으로 알려주세요.' },
      { emoji:'🚔', label:'법 관련 롤플레이', q:'경찰이나 법적 기관과 대화하는 상황 롤플레이를 해주세요. 신분 확인, 도움 요청 관련 표현을 베트남어와 함께 알려주세요.' },
    ],
  },
  {
    num: 18,
    titleKo: '취업과 진로',
    titleEn: 'Employment & Career',
    emoji: '🎯',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 3. The student is likely Vietnamese. This lesson is about employment and career (취업과 진로). Answer in Korean with Vietnamese translation. Be concise and friendly.',
    quickBtns: [
      { emoji:'💼', label:'취업 어휘 설명', q:'KIIP 3급 18과: 취업과 진로 관련 어휘 10개를 한국어, 발음, 영어, 베트남어로 알려주세요. 구직, 이력서, 면접 관련 단어 포함해 주세요.' },
      { emoji:'📄', label:'이력서 작성 연습', q:'한국어 이력서와 자기소개서 작성 방법을 알려주세요. 자신을 소개하는 표현과 경력 설명 문장을 베트남어와 함께 알려주세요.' },
      { emoji:'👔', label:'면접 롤플레이', q:'취업 면접 롤플레이를 해주세요. KIIP 3급 학습자입니다. 지원 동기, 강점 약점, 포부를 말하는 표현을 연습하고 싶어요.' },
      { emoji:'🌟', label:'직업 계획 표현', q:'미래 진로 계획을 설명하는 표현을 알려주세요. 창업, 취업, 기술 자격증 관련 표현을 KIIP 3급 수준으로 베트남어와 함께 알려주세요.' },
    ],
  },
  {
    num: 19,
    titleKo: '한국의 전통과 현대',
    titleEn: 'Tradition & Modernity',
    emoji: '🎎',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 3. The student is likely Vietnamese. This lesson is about Korean tradition and modernity (한국의 전통과 현대). Answer in Korean with Vietnamese translation. Be concise and friendly.',
    quickBtns: [
      { emoji:'🏮', label:'전통 어휘 설명', q:'KIIP 3급 19과: 한국 전통과 현대 관련 어휘 10개를 한국어, 발음, 영어, 베트남어로 알려주세요. 명절, 한복, K-콘텐츠 관련 단어 포함해 주세요.' },
      { emoji:'🎊', label:'명절 표현 연습', q:'한국의 명절(설날, 추석)에 사용하는 표현을 알려주세요. 인사말, 풍습 설명 관련 문장을 베트남어 번역과 함께 알려주세요.' },
      { emoji:'🎵', label:'한류 K-culture 연습', q:'한류 K-팝, K-드라마에 대해 이야기하는 표현을 연습해 주세요. 좋아하는 K-콘텐츠를 소개하는 표현을 롤플레이 형식으로 알려주세요.' },
      { emoji:'⛩️', label:'전통과 현대 비교', q:'한국의 전통 문화와 현대 문화를 비교해 주세요. 변화한 것과 유지된 것을 베트남 문화와 비교해서 베트남어로 설명해 주세요.' },
    ],
  },
  {
    num: 20,
    titleKo: '종합 복습 & 수료 시험',
    titleEn: 'Final Review & Exam',
    emoji: '🎓',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 3. The student is likely Vietnamese and preparing for the KIIP Level 3 final exam. Help them review all topics covered in the course. Answer in Korean with Vietnamese translation. Be encouraging and thorough.',
    quickBtns: [
      { emoji:'📝', label:'핵심 어휘 총정리', q:'KIIP 3급 전체 핵심 어휘를 주제별로 정리해 주세요. 대인관계, 건강, 직업, 경제, 역사 등 각 단원 핵심 단어를 베트남어와 함께 알려주세요.' },
      { emoji:'📐', label:'핵심 문법 복습', q:'KIIP 3급에서 배운 핵심 문법 패턴을 정리해 주세요. -(으)ㄹ수록, -아/어서인지, -는 반면에 등 문법을 예문과 베트남어 번역으로 알려주세요.' },
      { emoji:'📋', label:'모의시험 문제', q:'KIIP 3급 수료 시험 형식의 모의문제 5개를 만들어 주세요. 어휘, 문법, 읽기 영역을 포함하고 정답과 해설을 베트남어로 알려주세요.' },
      { emoji:'🎯', label:'시험 합격 전략', q:'KIIP 3급 수료 시험 합격을 위한 전략을 알려주세요. 시험 유형, 자주 나오는 문제, 효과적인 공부 방법을 베트남어로 설명해 주세요.' },
    ],
  },
];

// ── LEVEL 0 LESSON DATA ─────────────────────────────────────────────────────

const L0_LESSONS = [
  {
    num: 2,
    titleKo: '음절 조합과 받침',
    titleEn: 'Syllable Combination',
    emoji: '🔗',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 0 beginners. This lesson covers syllable combination and final consonants (받침). Students cannot read Korean well yet. Always keep answers SHORT, simple, with romanization and English translations. Be very encouraging.',
    quickBtns: [
      { emoji:'🔗', label:'음절 조합 설명', q:'KIIP 0급 2과: 한글 음절이 어떻게 만들어지는지 설명해 주세요. 자음+모음=음절 구조를 쉬운 예시 5개로 보여주세요 (예: ㄱ+ㅏ=가).' },
      { emoji:'🔤', label:'받침이 뭐예요?', q:'한글 받침(final consonant)이 무엇인지 초보자에게 설명해 주세요. 받침이 있는 글자와 없는 글자의 차이를 예시로 보여주세요.' },
      { emoji:'🃏', label:'받침 카드 연습', q:'받침이 있는 단어 10개를 알려주세요. 각 단어의 발음과 영어 뜻도 함께 알려주세요. 초보자 수준으로 쉽게 설명해 주세요.' },
      { emoji:'🎵', label:'음절 읽기 연습', q:'간단한 2음절, 3음절 단어를 10개 알려주세요. 발음 기호(romanization)와 영어 뜻도 포함해 주세요. 받침이 있는 단어도 포함해 주세요.' },
    ],
  },
  {
    num: 3,
    titleKo: '기초 발음 규칙',
    titleEn: 'Basic Pronunciation Rules',
    emoji: '🔊',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 0 beginners. This lesson covers basic Korean pronunciation rules. Students are complete beginners. Always keep answers SHORT, simple, with romanization and English translations. Be very encouraging.',
    quickBtns: [
      { emoji:'🔊', label:'연음이 뭐예요?', q:'한국어 연음법칙(liaison)을 초보자에게 설명해 주세요. "먹어요" 같은 예시 5개로 받침이 다음 모음과 연결되는 것을 보여주세요.' },
      { emoji:'🔇', label:'격음화 설명', q:'한국어 격음화(aspiration) 발음 규칙을 설명해 주세요. ㄱ+ㅎ=ㅋ 같은 규칙을 쉬운 예시로 알려주세요.' },
      { emoji:'🎙️', label:'비음화 설명', q:'한국어 비음화(nasalization) 발음 규칙을 초보자에게 설명해 주세요. "국물→궁물" 같은 예시를 romanization과 함께 알려주세요.' },
      { emoji:'🗣️', label:'발음 연습 단어', q:'기초 발음 규칙을 연습하기 좋은 단어 10개를 알려주세요. 연음, 격음화, 비음화 규칙이 포함된 단어와 발음 방법을 알려주세요.' },
    ],
  },
  {
    num: 4,
    titleKo: '숫자와 날짜',
    titleEn: 'Numbers & Dates',
    emoji: '🔢',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 0 beginners. This lesson covers Korean numbers and dates. Students are complete beginners. Always keep answers SHORT, simple, with romanization and English translations. Be very encouraging.',
    quickBtns: [
      { emoji:'1️⃣', label:'숫자 1-10 알려줘', q:'한국어 숫자 1-10을 한자어 숫자(일이삼...)와 고유어 숫자(하나둘셋...) 두 가지로 알려주세요. romanization과 영어도 포함해 주세요.' },
      { emoji:'📅', label:'날짜 읽는 법', q:'한국어로 날짜 읽는 방법을 설명해 주세요. 년, 월, 일을 읽는 법과 오늘, 어제, 내일 표현을 쉽게 알려주세요.' },
      { emoji:'🕐', label:'시간 표현 연습', q:'한국어로 시간을 말하는 방법을 알려주세요. "몇 시예요?", "지금 두 시예요" 같은 표현을 romanization과 함께 알려주세요.' },
      { emoji:'🎂', label:'숫자 사용 연습', q:'일상에서 숫자를 사용하는 표현을 10개 알려주세요. 나이, 전화번호, 주소, 가격 말하기 등 실용적인 표현을 포함해 주세요.' },
    ],
  },
  {
    num: 5,
    titleKo: '기초 생활 단어 100',
    titleEn: '100 Basic Life Words',
    emoji: '📖',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 0 beginners. This lesson covers 100 essential daily life words. Students are complete beginners. Always keep answers SHORT, simple, with romanization and English translations. Be very encouraging.',
    quickBtns: [
      { emoji:'🏠', label:'집 관련 단어', q:'집, 방, 가구 관련 기초 한국어 단어 15개를 알려주세요. 각 단어의 romanization과 영어 뜻을 포함해 주세요. 초보자 수준으로 쉽게 설명해 주세요.' },
      { emoji:'🍚', label:'음식 관련 단어', q:'한국 음식, 식재료, 식사 관련 기초 단어 15개를 알려주세요. 각 단어의 romanization과 영어 뜻을 포함해 주세요.' },
      { emoji:'👗', label:'옷·외모 관련 단어', q:'옷, 색깔, 외모 관련 기초 한국어 단어 15개를 알려주세요. 각 단어의 romanization과 영어 뜻을 포함해 주세요.' },
      { emoji:'🚌', label:'교통·장소 단어', q:'대중교통, 장소, 방향 관련 기초 한국어 단어 15개를 알려주세요. 각 단어의 romanization과 영어 뜻을 포함해 주세요.' },
    ],
  },
  {
    num: 6,
    titleKo: '인사말과 자기소개',
    titleEn: 'Greetings & Self-Introduction',
    emoji: '👋',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 0 beginners. This lesson covers Korean greetings and self-introduction. Students are complete beginners. Always keep answers SHORT, simple, with romanization and English translations. Be very encouraging.',
    quickBtns: [
      { emoji:'👋', label:'인사말 알려줘', q:'한국어 기본 인사말을 알려주세요. 안녕하세요, 반갑습니다, 감사합니다, 미안합니다, 잘 자요 등 10가지 인사 표현을 romanization과 함께 알려주세요.' },
      { emoji:'🙋', label:'자기소개 연습', q:'한국어로 자기소개하는 방법을 알려주세요. 이름, 나라, 직업, 나이 말하는 표현을 romanization과 영어로 설명해 주세요. 예시 자기소개 문장도 포함해 주세요.' },
      { emoji:'💬', label:'첫 대화 롤플레이', q:'한국인과 처음 만났을 때 대화를 연습해 주세요. 인사, 자기소개, 날씨 이야기 등 기초 대화를 romanization과 함께 알려주세요.' },
      { emoji:'🎌', label:'한국 인사 문화', q:'한국의 인사 문화를 설명해 주세요. 절하는 방법, 악수, 명함 교환 등 한국 특유의 인사 예절을 초보자에게 쉽게 알려주세요.' },
    ],
  },
  {
    num: 7,
    titleKo: '한글 쓰기 연습',
    titleEn: 'Hangul Writing Practice',
    emoji: '✏️',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 0 beginners. This lesson covers Hangul writing practice. Students are just starting to write Korean. Always keep answers SHORT, simple, with romanization and English translations. Be very encouraging.',
    quickBtns: [
      { emoji:'✏️', label:'쓰기 순서 알려줘', q:'한글 자음과 모음의 필순(stroke order)을 설명해 주세요. ㄱ, ㄴ, ㄷ, ㅏ, ㅓ, ㅗ의 올바른 쓰는 순서를 텍스트로 설명해 주세요.' },
      { emoji:'📝', label:'간단한 단어 쓰기', q:'한글 쓰기 연습을 위한 쉬운 단어 10개를 알려주세요. 각 단어의 획순과 romanization, 영어 뜻을 포함해 주세요. 받침 없는 단어부터 시작해 주세요.' },
      { emoji:'🖊️', label:'문장 쓰기 연습', q:'초보자가 연습하기 좋은 짧은 한국어 문장 5개를 알려주세요. 각 문장의 romanization과 영어 번역을 포함해 주세요.' },
      { emoji:'🎯', label:'쓰기 실력 점검', q:'한글 쓰기 초보자를 위한 퀴즈 5개를 만들어 주세요. romanization을 보고 한글을 쓰는 문제나, 단어를 보고 뜻을 맞히는 문제를 포함해 주세요.' },
    ],
  },
  {
    num: 8,
    titleKo: '0급 종합 복습 & 시험',
    titleEn: 'Final Review & Exam',
    emoji: '🎓',
    sysPrompt: 'You are a Korean language tutor for KIIP Level 0 beginners preparing for their final review. Help them review Hangul consonants, vowels, syllable combination, basic vocabulary and greetings. Be very encouraging. Keep answers simple with romanization.',
    quickBtns: [
      { emoji:'🔤', label:'자음·모음 총복습', q:'KIIP 0급에서 배운 자음 14개와 모음 10개를 전부 정리해 주세요. 각 자음/모음의 romanization과 발음 방법을 간단히 요약해 주세요.' },
      { emoji:'📝', label:'핵심 어휘 정리', q:'KIIP 0급 핵심 생활 어휘 20개를 정리해 주세요. 인사말, 숫자, 일상 단어를 romanization과 영어로 정리해 주세요.' },
      { emoji:'📋', label:'모의시험 문제', q:'KIIP 0급 수준의 시험 문제 5개를 만들어 주세요. 자음/모음 식별, 단어 읽기, 기초 표현 관련 문제를 romanization으로 설명해 주세요.' },
      { emoji:'🌟', label:'다음 단계 안내', q:'KIIP 0급을 마친 후 1급 학습을 시작하기 위한 조언을 해주세요. 0급에서 배운 것을 바탕으로 1급에서 배울 내용을 미리 소개해 주세요.' },
    ],
  },
];

// ── HTML TEMPLATE ────────────────────────────────────────────────────────────

function buildLevel3Lesson(lesson) {
  const totalLessons = 20;
  const prevNum = lesson.num - 1;
  const nextNum = lesson.num < totalLessons ? lesson.num + 1 : null;
  const prevHref = prevNum === 1
    ? 'KIIP_Level3_Lesson1.html'
    : `KIIP_Level3_Lesson${prevNum}.html`;
  const prevLabel = prevNum === 1
    ? `← ${prevNum}과`
    : `← ${prevNum}과`;
  const nextHref = nextNum
    ? `KIIP_Level3_Lesson${nextNum}.html`
    : 'KIIP_Level3_Index.html';
  const nextLabel = nextNum ? `${nextNum}과 →` : '목차 →';

  const progressPct = Math.round((lesson.num / totalLessons) * 100);

  const quickBtnsJs = JSON.stringify(lesson.quickBtns)
    .replace(/<\/script>/gi, '<\\/script>');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>KIIP 3급 ${lesson.num}과 · ${lesson.titleKo}</title>
<meta property="og:type" content="website">
<meta property="og:site_name" content="KIIP 한국어교육 · GlocalBridge">
<meta property="og:title" content="KIIP 3급 ${lesson.num}과 · ${lesson.titleKo}">
<meta property="og:description" content="법무부 KIIP 사회통합프로그램 3급 중급 1 · ${lesson.num}과 ${lesson.titleKo} · ${lesson.titleEn}">
<meta property="og:image" content="https://elimg.com/images/og-hanwha-level1.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="https://elimg.com/KIIP_Level3_Lesson${lesson.num}.html">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="KIIP 3급 ${lesson.num}과 · ${lesson.titleKo}">
<meta name="twitter:description" content="법무부 KIIP 사회통합프로그램 3급 중급 1 · ${lesson.num}과 ${lesson.titleKo}">
<meta name="twitter:image" content="https://elimg.com/images/og-hanwha-level1.png">
<meta name="theme-color" content="#f59e0b">
<link rel="manifest" href="/manifest.json">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="KIIP Korean">
<script src="/i18n/translations.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--amber:#f59e0b;--dark:#451a03;--brown:#92400e;--orange:#b45309;--green:#22c55e;--red:#ef4444;--gray:#fdf6e3;--white:#fff;--text:#1a202c}
body{font-family:'Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic',sans-serif;background:var(--gray);max-width:520px;margin:0 auto;min-height:100vh;overflow-x:hidden}
button{cursor:pointer;border:none;font-family:inherit}
.hide{display:none!important}
.nav{background:var(--dark);padding:10px 16px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;min-height:48px}
.nav-title{color:#fff;font-weight:700;font-size:14px}
.nav-sub{color:#d97706;font-size:12px}
.nav-back{background:none;color:#fff;font-size:14px;padding:8px 0;text-decoration:none;min-height:44px;display:flex;align-items:center}
.section-tabs{background:#78350f;position:sticky;top:48px;z-index:99;overflow-x:auto;white-space:nowrap;display:flex;padding:6px 8px;gap:4px;-webkit-overflow-scrolling:touch;scroll-snap-type:x mandatory}
.section-tabs::-webkit-scrollbar{height:3px}
.section-tabs::-webkit-scrollbar-thumb{background:#f59e0b;border-radius:2px}
.stab{display:inline-flex;align-items:center;gap:5px;padding:10px 14px;border-radius:20px;background:transparent;color:rgba(255,255,255,0.75);font-size:12px;font-weight:600;flex-shrink:0;min-height:44px;scroll-snap-align:start}
.stab.active{background:var(--amber);color:#fff}
.page{padding:16px;padding-bottom:88px}
h2{color:var(--brown);font-size:18px;margin-bottom:4px;font-weight:800}
.sub{color:#888;font-size:12px;margin-bottom:14px}
.card{background:#fff;border-radius:12px;padding:14px;margin-bottom:10px;border:1px solid #fde68a}
.card-accent{border-left:4px solid var(--amber)}
.card-green{border-left:4px solid var(--green)}
.bottom-nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:520px;background:#fff;border-top:2px solid #fde68a;display:flex;justify-content:space-between;padding:6px 4px;padding-bottom:max(6px,env(safe-area-inset-bottom));z-index:100;min-height:56px}
.bnav-btn{background:none;padding:6px 4px;font-size:12px;color:#888;display:flex;flex-direction:column;align-items:center;gap:2px;flex:1;min-height:44px;justify-content:center;-webkit-tap-highlight-color:transparent}
.bnav-btn.active{color:var(--amber);font-weight:700}
.bnav-icon{font-size:20px}
.intro-header{background:linear-gradient(135deg,#451a03,#92400e,#b45309);color:#fff;border-radius:12px;padding:20px;margin-bottom:12px;text-align:center}
.intro-header h3{font-size:20px;font-weight:800;margin-bottom:4px}
.section-label{display:inline-block;background:var(--amber);color:#fff;font-size:12px;font-weight:700;padding:4px 12px;border-radius:12px;margin-bottom:8px}
.lang-bar{background:#fef3c7;display:flex;justify-content:center;gap:8px;padding:8px}
.lang-btn-sm{background:rgba(180,83,9,0.1);border:1px solid #fbbf24;color:#92400e;padding:8px 16px;border-radius:20px;font-size:13px;cursor:pointer;min-height:44px;display:inline-flex;align-items:center}
.lang-btn-sm.active{background:var(--amber);color:#fff;border-color:var(--amber)}
.wip-banner{background:linear-gradient(135deg,#78350f,#92400e);color:#fff;border-radius:12px;padding:20px;margin-bottom:16px;text-align:center}
.wip-banner h3{font-size:18px;font-weight:800;margin-bottom:8px}
.wip-banner p{font-size:13px;opacity:0.9;line-height:1.7;margin-bottom:4px}
.obj-item{display:flex;align-items:flex-start;gap:8px;padding:10px 0;border-bottom:1px solid #fde68a;font-size:14px;color:var(--text)}
.obj-item:last-child{border-bottom:none}
.obj-check{color:var(--amber);font-size:16px;flex-shrink:0;margin-top:1px}
@keyframes aiDot{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}
</style>
</head>
<body>
<div id="app"></div>
<script>
// ===== TTS =====
const TTS = {
  speak(text, lang='ko-KR', rate=0.8) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = rate; u.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const koVoice = voices.find(v => v.lang.startsWith('ko')) || voices.find(v => v.lang.includes('ko'));
    if (koVoice) u.voice = koVoice;
    window.speechSynthesis.speak(u);
  },
  init() { if (window.speechSynthesis) window.speechSynthesis.getVoices(); }
};
window.addEventListener('load', () => { TTS.init(); setTimeout(TTS.init, 500); });

// ===== STATE =====
const STATE = {
  section: 0,
  lang: localStorage.getItem('kiip_lang') || 'ko',
};

function setState(newState) {
  Object.assign(STATE, newState);
  render();
}

// ===== DATA =====
const SECTIONS = [
  {id:0, label:'도입', icon:'🏠'},
  {id:1, label:'어휘', icon:'📝'},
  {id:2, label:'문법', icon:'📐'},
  {id:3, label:'말하기', icon:'💬'},
  {id:4, label:'듣기', icon:'👂'},
  {id:5, label:'발음', icon:'🔊'},
  {id:6, label:'읽기', icon:'📖'},
  {id:7, label:'쓰기', icon:'✏️'},
  {id:8, label:'문화', icon:'🎎'},
  {id:9, label:'퀴즈', icon:'✅'},
  {id:10, label:'AI실습', icon:'🤖'},
];

var AI_QUICK_BTNS = ${quickBtnsJs};

var AICHAT = {
  history: [],
  loading: false,

  quickSend: function(idx) {
    var b = AI_QUICK_BTNS[idx];
    if (!b) return;
    var inp = document.getElementById('ai-chat-input');
    if (!inp) return;
    inp.value = b.q;
    inp.style.borderColor = '#f59e0b';
    this.send();
  },

  addMsg: function(role, text) {
    var box = document.getElementById('ai-chat-messages');
    if (!box) return;
    var ph = box.querySelector('.ai-placeholder');
    if (ph) ph.remove();
    var isUser = role === 'user';
    var d = document.createElement('div');
    d.style.cssText = 'display:flex;flex-direction:column;align-items:' + (isUser?'flex-end':'flex-start') + ';gap:2px;margin-bottom:6px';
    var safe = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\\n/g,'<br>');
    d.innerHTML = '<div style="font-size:10px;color:#888;margin:0 4px">' + (isUser?'🙋 나':'🤖 AI') + '</div>'
      + '<div style="max-width:90%;padding:10px 13px;border-radius:' + (isUser?'14px 14px 4px 14px':'14px 14px 14px 4px') + ';'
      + 'background:' + (isUser?'#f59e0b':'#fff') + ';color:' + (isUser?'#fff':'#1a202c') + ';'
      + 'font-size:13px;line-height:1.7;border:1px solid ' + (isUser?'#d97706':'#fde68a') + ';word-break:break-word">' + safe + '</div>';
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
  },

  setLoading: function(on) {
    var box = document.getElementById('ai-chat-messages');
    var el  = document.getElementById('ai-loading-dot');
    var btn = document.getElementById('ai-send-btn');
    if (on) {
      if (box && !el) {
        var ld = document.createElement('div');
        ld.id = 'ai-loading-dot';
        ld.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px;margin-bottom:6px';
        ld.innerHTML = '<div style="display:flex;gap:4px">'
          + '<div style="width:9px;height:9px;border-radius:50%;background:#f59e0b;animation:aiDot 1s 0s ease-in-out infinite"></div>'
          + '<div style="width:9px;height:9px;border-radius:50%;background:#f59e0b;animation:aiDot 1s 0.2s ease-in-out infinite"></div>'
          + '<div style="width:9px;height:9px;border-radius:50%;background:#f59e0b;animation:aiDot 1s 0.4s ease-in-out infinite"></div>'
          + '</div><span style="font-size:12px;color:#888">AI 응답 중...</span>';
        box.appendChild(ld);
        box.scrollTop = box.scrollHeight;
      }
      if (btn) { btn.textContent = '⏳'; btn.disabled = true; }
    } else {
      if (el) el.remove();
      if (btn) { btn.textContent = '➤'; btn.disabled = false; }
    }
  },

  send: async function() {
    if (this.loading) return;
    var inp  = document.getElementById('ai-chat-input');
    var text = inp ? inp.value.trim() : '';
    if (!text) return;

    this.history.push({role:'user', content:text});
    this.addMsg('user', text);
    if (inp) inp.value = '';
    this.loading = true;
    this.setLoading(true);

    var sys = ${JSON.stringify(lesson.sysPrompt)};

    try {
      var url = '/api/chat';
      var res  = await fetch(url, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'system',content:sys},{role:'user',content:text}]})});
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var data = await res.json();
      var reply = data.choices[0].message.content;
      if (!reply || reply.trim() === '') throw new Error('빈 응답');
      this.history.push({role:'assistant', content:reply});
      this.setLoading(false);
      this.addMsg('assistant', reply);
    } catch(e) {
      this.setLoading(false);
      this.addMsg('assistant',
        '⚠️ AI 연결 오류\\n오류: ' + e.message + '\\n\\n해결 방법:\\n1. 잠시 후 다시 시도해 주세요\\n2. 인터넷 연결을 확인해 주세요');
    }
    this.loading = false;
  }
};

// ===== RENDER =====
function setLang(lang) {
  STATE.lang = lang;
  localStorage.setItem('kiip_lang', lang);
  render();
}

function renderNav() {
  return \`
    <div class="nav">
      <a href="KIIP_Level3_Index.html" class="nav-back">← 3급 목차</a>
      <div style="text-align:center">
        <div class="nav-title">${lesson.num}과 · ${lesson.titleKo}</div>
        <div class="nav-sub">KIIP 3급 중급 1</div>
      </div>
      <div style="width:60px;text-align:right;font-size:11px;color:#d97706">
        \${STATE.section+1}/\${SECTIONS.length}
      </div>
    </div>
  \`;
}

function renderLangBar() {
  return \`
    <div class="lang-bar">
      \${['ko','en','vi'].map(l=>\`<button class="lang-btn-sm \${STATE.lang===l?'active':''}" onclick="setLang('\${l}')">\${l==='ko'?'🇰🇷 KO':l==='en'?'🇺🇸 EN':'🇻🇳 VI'}</button>\`).join('')}
    </div>
  \`;
}

function renderTabs() {
  return \`
    <div class="section-tabs">
      \${SECTIONS.map(s=>\`<button class="stab \${STATE.section===s.id?'active':''}" onclick="setState({section:\${s.id}})">\${s.icon} \${s.label}</button>\`).join('')}
    </div>
  \`;
}

function renderBottomNav() {
  const prev = STATE.section > 0
    ? \`<button class="bnav-btn" onclick="setState({section:\${STATE.section-1}})">◀ 이전</button>\`
    : \`<button class="bnav-btn" style="opacity:0.3" disabled>◀ 이전</button>\`;
  const next = STATE.section < SECTIONS.length-1
    ? \`<button class="bnav-btn" onclick="setState({section:\${STATE.section+1}})">다음 ▶</button>\`
    : \`<button class="bnav-btn" style="opacity:0.3" disabled>다음 ▶</button>\`;
  return \`
    <div class="bottom-nav">
      \${prev}
      <button class="bnav-btn" onclick="setState({section:0})"><span class="bnav-icon">🏠</span><span>홈</span></button>
      <button class="bnav-btn" onclick="setState({section:10})"><span class="bnav-icon">🤖</span><span>AI</span></button>
      \${next}
    </div>
  \`;
}

function renderWIPSection(title, icon) {
  return \`
    <div class="page">
      <h2>\${icon} \${title}</h2>
      <p class="sub">KIIP 3급 ${lesson.num}과 · ${lesson.titleKo} · ${lesson.titleEn}</p>
      <div class="wip-banner">
        <h3>🚧 콘텐츠 준비 중</h3>
        <p>이 섹션의 학습 자료를 열심히 제작 중입니다.<br>Content is being prepared for this section.</p>
        <p style="margin-top:8px;font-size:12px;opacity:0.8">🇻🇳 Nội dung đang được chuẩn bị. Vui lòng quay lại sau.</p>
      </div>
      <div class="card card-accent">
        <div class="section-label">💡 지금 당장 학습하려면</div>
        <div style="font-size:13px;color:#555;margin-top:6px;line-height:1.8">
          아래 <strong>AI 실습</strong> 탭을 이용하면 이 주제를 바로 공부할 수 있어요!<br>
          <span style="color:#059669;font-size:12px">🇻🇳 Sử dụng tab <strong>AI 실습</strong> bên dưới để học ngay chủ đề này!</span>
        </div>
        <button onclick="setState({section:10})" style="background:var(--amber);color:#fff;border-radius:10px;padding:12px 20px;font-size:14px;font-weight:700;margin-top:12px;width:100%">
          🤖 AI 실습 탭으로 이동
        </button>
      </div>
    </div>
  \`;
}

function renderIntro() {
  return \`
    <div class="page">
      <div class="intro-header">
        <div style="font-size:14px;opacity:0.8;margin-bottom:4px">KIIP 3급 · 중급 1</div>
        <h3>${lesson.num}과 ${lesson.titleKo}</h3>
        <div style="font-size:14px;margin-top:4px;opacity:0.9">${lesson.titleEn}</div>
        <div style="margin-top:12px;font-size:28px">${lesson.emoji}</div>
      </div>

      <div class="card card-accent">
        <div class="section-label">학습 목표</div>
        <div class="obj-item"><span class="obj-check">✅</span><span>${lesson.titleKo} 관련 어휘를 이해하고 사용할 수 있다</span></div>
        <div class="obj-item"><span class="obj-check">✅</span><span>${lesson.titleKo} 주제로 말하기·쓰기를 할 수 있다</span></div>
        <div class="obj-item"><span class="obj-check">✅</span><span>AI 튜터와 함께 ${lesson.titleKo} 표현을 연습할 수 있다</span></div>
      </div>

      <div class="card" style="background:#fef3c7;border:1px solid #fbbf24">
        <div class="section-label" style="background:#92400e">📌 이번 과 주제</div>
        <div style="font-size:24px;text-align:center;margin:12px 0">${lesson.emoji}</div>
        <div style="font-size:18px;font-weight:800;text-align:center;color:var(--brown);margin-bottom:4px">${lesson.num}과 · ${lesson.titleKo}</div>
        <div style="font-size:14px;text-align:center;color:#555;margin-bottom:8px">${lesson.titleEn}</div>
        <div style="background:#fff;border-radius:8px;padding:12px;font-size:13px;color:#555;line-height:1.8;border:1px solid #fde68a">
          🚧 상세 콘텐츠는 준비 중입니다. AI 실습 탭에서 이 주제를 지금 바로 공부해 보세요!<br>
          <span style="color:#059669;font-size:12px">🇻🇳 Nội dung chi tiết đang được chuẩn bị. Hãy dùng tab AI 실습 để học ngay!</span>
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-top:4px">
        <a href="${prevHref}" style="flex:1;background:var(--dark);color:#fff;border-radius:10px;padding:12px;text-align:center;text-decoration:none;font-size:13px;font-weight:700">${prevLabel}</a>
        ${nextNum ? `<a href="${nextHref}" style="flex:1;background:var(--amber);color:#fff;border-radius:10px;padding:12px;text-align:center;text-decoration:none;font-size:13px;font-weight:700">${nextLabel}</a>` : `<a href="${nextHref}" style="flex:1;background:#6b7280;color:#fff;border-radius:10px;padding:12px;text-align:center;text-decoration:none;font-size:13px;font-weight:700">${nextLabel}</a>`}
      </div>

      <div style="margin-top:12px">
        <div style="background:#d1fae5;border-radius:8px;height:6px;overflow:hidden;margin-bottom:4px">
          <div style="background:#22c55e;height:100%;width:${progressPct}%;transition:width 0.5s"></div>
        </div>
        <div style="font-size:11px;color:#888;text-align:center">3급 전체 진도 ${progressPct}% · ${lesson.num} / ${totalLessons}과</div>
      </div>
    </div>
  \`;
}

function renderAI() {
  return \`
    <div class="page">
      <h2>🤖 AI 실습</h2>
      <p class="sub">글로컬 아카데미 × AI 한국어 튜터 · ${lesson.titleKo}</p>

      <div style="background:linear-gradient(135deg,#1e3a5f,#1d4ed8);color:#fff;border-radius:12px;padding:16px;margin-bottom:12px">
        <div style="font-size:11px;opacity:0.7;margin-bottom:4px">GLOCAL ACADEMY · AI-POWERED · 글로컬아카데미</div>
        <div style="font-size:15px;font-weight:800;margin-bottom:6px">KIIP 3급 ${lesson.num}과 · ${lesson.titleKo} AI 실습</div>
        <div style="font-size:11px;opacity:0.85;line-height:1.7">${lesson.titleEn} — 주제별 AI 튜터와 실시간 학습<br>
        <span style="color:#93c5fd">🇻🇳 Luyện tập chủ đề "${lesson.titleKo}" cùng AI ngay trong app</span></div>
      </div>

      <div class="card" style="margin-bottom:10px;border:2px solid #f59e0b;background:#fffbeb">
        <div class="section-label" style="background:#d97706">⚡ 앱 내 AI 채팅 · 로그인 불필요</div>
        <div style="font-size:12px;color:#555;margin:6px 0 10px;line-height:1.6">
          계정 없이 바로 AI에게 질문하세요 — 새 탭 이동 없음<br>
          <span style="color:#059669;font-size:11px">🇻🇳 Hỏi AI ngay trong app — không cần đăng nhập, không chuyển tab</span>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
          \${AI_QUICK_BTNS.map((b,i)=>\`
            <button onclick="AICHAT.quickSend(\${i})"
              style="background:#fff;border:1px solid #fbbf24;color:#92400e;border-radius:20px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer">
              \${b.emoji} \${b.label}
            </button>
          \`).join('')}
        </div>

        <div id="ai-chat-messages" style="max-height:300px;overflow-y:auto;margin-bottom:10px;display:flex;flex-direction:column;gap:8px;min-height:60px;background:#fafafa;border-radius:10px;padding:8px">
          <div class="ai-placeholder" style="text-align:center;font-size:12px;color:#888;padding:16px">
            💡 버튼을 누르면 AI가 바로 답해줘요<br>
            <span style="color:#059669;font-size:11px">🇻🇳 Nhấn nút → AI trả lời ngay</span>
          </div>
        </div>

        <div style="display:flex;gap:6px;align-items:flex-end">
          <textarea id="ai-chat-input"
            placeholder="${lesson.titleKo}에 대해 질문하세요... / Ask about ${lesson.titleEn}..."
            style="flex:1;padding:12px;border:2px solid #fde68a;border-radius:10px;font-size:16px;font-family:inherit;min-height:48px;max-height:120px;resize:none;outline:none"
            onfocus="this.style.borderColor='#f59e0b'"
            onblur="this.style.borderColor='#fde68a'"
            onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();AICHAT.send()}"
          ></textarea>
          <button onclick="AICHAT.send()"
            id="ai-send-btn"
            style="background:#f59e0b;color:#fff;border-radius:10px;padding:10px 14px;font-size:18px;font-weight:700;flex-shrink:0;height:44px">
            ➤
          </button>
        </div>
        <div style="font-size:10px;color:#888;margin-top:4px">Enter로 전송 · Shift+Enter 줄바꿈 · 🆓 완전 무료</div>
      </div>

      <div class="card card-accent" style="margin-bottom:10px">
        <div class="section-label">📖 ${lesson.num}과 학습 가이드</div>
        <div style="font-size:13px;color:#555;margin-top:8px;line-height:1.9">
          <strong style="color:var(--brown)">${lesson.emoji} ${lesson.titleKo} · ${lesson.titleEn}</strong><br>
          위의 빠른 질문 버튼을 눌러 AI 튜터에게 이 주제를 배워보세요.<br>
          직접 질문도 자유롭게 입력할 수 있어요.<br>
          <span style="color:#059669;font-size:12px">🇻🇳 Nhấn các nút câu hỏi nhanh để học chủ đề này với AI.<br>Bạn cũng có thể tự nhập câu hỏi bất kỳ.</span>
        </div>
      </div>

      <p style="font-size:11px;color:#9ca3af;text-align:center;margin-top:8px">🤖 AI Powered by Groq · 무료 · Free forever<br>© 글로컬 아카데미 · elimg.com</p>
    </div>
  \`;
}

function renderSection() {
  switch(STATE.section) {
    case 0: return renderIntro();
    case 10: return renderAI();
    default: return renderWIPSection(SECTIONS[STATE.section].label, SECTIONS[STATE.section].icon);
  }
}

function render() {
  document.getElementById('app').innerHTML =
    renderNav() + renderLangBar() + renderTabs() + renderSection() + renderBottomNav();
}

render();
</script>
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
</script>
</body>
</html>`;
}

// ── LEVEL 0 HTML TEMPLATE ────────────────────────────────────────────────────

function buildLevel0Lesson(lesson) {
  const totalLessons = 8;
  const prevNum = lesson.num - 1;
  const nextNum = lesson.num < totalLessons ? lesson.num + 1 : null;
  const prevHref = prevNum === 1
    ? 'KIIP_Level0_Lesson1.html'
    : `KIIP_Level0_Lesson${prevNum}.html`;
  const nextHref = nextNum
    ? `KIIP_Level0_Lesson${nextNum}.html`
    : 'KIIP_Level0_Index.html';
  const nextLabel = nextNum ? `${nextNum}과 →` : '목차 →';
  const progressPct = Math.round((lesson.num / totalLessons) * 100);

  const quickBtnsJs = JSON.stringify(lesson.quickBtns)
    .replace(/<\/script>/gi, '<\\/script>');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>KIIP 0급 ${lesson.num}과 · ${lesson.titleKo} · 글로컬 아카데미</title>
<meta name="description" content="KIIP 0급 ${lesson.num}과 — ${lesson.titleKo} (${lesson.titleEn}). 글로컬 아카데미 AI 한국어 교육.">
<meta property="og:title" content="KIIP 0급 ${lesson.num}과 · ${lesson.titleKo}">
<meta property="og:description" content="한글 기초부터 시작하는 KIIP 0급 · 글로컬 아카데미 · elimg.com">
<meta property="og:url" content="https://elimg.com/KIIP_Level0_Lesson${lesson.num}.html">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#059669">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --green:#059669;--green-light:#10b981;--green-pale:#ecfdf5;
  --navy:#1B3A6B;--gold:#C49A22;--gold-light:#E8C05A;
  --red:#ef4444;--blue:#3b82f6;--purple:#8b5cf6;
  --bg:#f0fdf4;--white:#fff;--gray:#f8fafc;--dark:#1a2340;
}
body{font-family:'Apple SD Gothic Neo','Noto Sans KR',sans-serif;background:var(--bg);max-width:520px;margin:0 auto;min-height:100vh;overflow-x:hidden;padding-bottom:70px}
button{cursor:pointer;border:none;font-family:inherit}
.nav{background:var(--green);padding:10px 16px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;box-shadow:0 2px 8px rgba(5,150,105,.3)}
.nav-title{color:#fff;font-weight:800;font-size:14px}
.nav-sub{color:rgba(255,255,255,.65);font-size:10px}
.nav-btn{background:none;color:#fff;font-size:22px;padding:4px 8px}
.menu{background:#047857;position:sticky;top:48px;z-index:99}
.menu button{display:flex;align-items:center;gap:8px;width:100%;padding:10px 18px;background:transparent;color:#fff;font-size:13px;text-align:left}
.menu button.active{background:var(--green-light)}
.bottom-nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:520px;background:#fff;border-top:1px solid #d1fae5;display:flex;justify-content:space-around;padding:6px 0;z-index:100;box-shadow:0 -2px 8px rgba(5,150,105,.1)}
.bottom-nav button{background:none;display:flex;flex-direction:column;align-items:center;gap:1px;padding:2px 6px;opacity:.45;font-size:9px;color:#047857}
.bottom-nav button.active{opacity:1;color:var(--green);font-weight:700}
.bottom-nav .icon{font-size:20px}
.page{padding:16px}
h2{color:var(--green);font-size:19px;margin-bottom:4px}
.sub{color:#6b7280;font-size:11px;margin-bottom:14px}
.card{background:#fff;border-radius:14px;padding:14px;margin-bottom:10px;border:1px solid #d1fae5;box-shadow:0 1px 4px rgba(0,0,0,.04)}
.card-green{border-left:4px solid var(--green)}
.prog-bar{background:#d1fae5;border-radius:8px;height:6px;overflow:hidden;margin-bottom:14px}
.prog-fill{background:linear-gradient(90deg,var(--green-light),var(--green));height:100%;border-radius:8px;transition:width .5s}
.ai-msgbox{background:#fff;border-radius:12px;border:1px solid #d1fae5;min-height:180px;max-height:360px;overflow-y:auto;padding:12px;margin-bottom:10px;display:flex;flex-direction:column;gap:8px}
.wip-banner{background:linear-gradient(135deg,var(--green),#047857);color:#fff;border-radius:12px;padding:20px;margin-bottom:16px;text-align:center}
.wip-banner h3{font-size:18px;font-weight:800;margin-bottom:8px}
.wip-banner p{font-size:13px;opacity:0.9;line-height:1.7;margin-bottom:4px}
.tabs{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap}
.tab{padding:7px 14px;border-radius:20px;background:#d1fae5;color:#047857;font-size:12px;font-weight:700;transition:.2s}
.tab.active{background:var(--green);color:#fff}
</style>
</head>
<body>
<div id="app"></div>
<script>
// ===== TTS =====
const TTS={
  speak(text,lang='ko-KR',rate=0.8){
    if(!window.speechSynthesis)return;
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang=lang;u.rate=rate;u.pitch=1;
    const v=window.speechSynthesis.getVoices();
    const kv=v.find(x=>x.lang.startsWith('ko'))||v[0];
    if(kv)u.voice=kv;
    window.speechSynthesis.speak(u);
  },
  init(){if(window.speechSynthesis)window.speechSynthesis.getVoices();}
};
window.addEventListener('load',()=>{TTS.init();setTimeout(TTS.init,500);});

// ===== DATA =====
const PAGES=[
  {id:'home',l:'홈',i:'🏠'},
  {id:'lesson',l:'학습',i:'📚'},
  {id:'practice',l:'연습',i:'✏️'},
  {id:'quiz',l:'퀴즈',i:'🎯'},
  {id:'ai',l:'AI실습',i:'🤖'},
];

var AI_QUICK_BTNS = ${quickBtnsJs};

var AICHAT={
  msgs:[],loading:false,
  addMsg(role,text){
    this.msgs.push({role,text,time:new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})});
    render();
    setTimeout(()=>{const b=document.querySelector('.ai-msgbox');if(b)b.scrollTop=b.scrollHeight;},50);
  },
  quickSend(idx){
    const b=AI_QUICK_BTNS[idx];
    if(!b||this.loading)return;
    this.send(b.q,b.label);
  },
  send:async function(text,label){
    if(this.loading)return;
    text=text||(document.getElementById('ai-input')||{}).value||'';
    text=text.trim();
    if(!text)return;
    if(document.getElementById('ai-input'))document.getElementById('ai-input').value='';
    this.loading=true;
    this.addMsg('user',label||text);
    try{
      const sysP=${JSON.stringify(lesson.sysPrompt)};
      const url='/api/chat';
      const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'system',content:sysP},{role:'user',content:text}]})});
      const data=await res.json();
      const reply=data.choices[0].message.content;
      this.loading=false;
      this.addMsg('assistant',reply);
    }catch(e){
      this.loading=false;
      this.addMsg('assistant','⚠️ 연결 오류. 다시 시도해주세요.\\nConnection error. Please try again.');
    }
  }
};

// ===== STATE =====
let STATE={page:'home',menuOpen:false};
function setState(u){STATE={...STATE,...u};render();}

// ===== RENDER =====
function render(){
  document.getElementById('app').innerHTML=renderNav()+renderPage()+renderBottomNav();
}

function renderNav(){
  const items=PAGES;
  let menu='';
  if(STATE.menuOpen){
    menu='<div class="menu">'+items.map(it=>
      \`<button class="\${STATE.page===it.id?'active':''}" onclick="setState({page:'\${it.id}',menuOpen:false})">\${it.i} \${it.l}</button>\`
    ).join('')+'</div>';
  }
  return \`<div class="nav">
    <div style="display:flex;align-items:center;gap:8px">
      <a href="KIIP_Level0_Index.html" style="color:rgba(255,255,255,.7);text-decoration:none;font-size:18px;padding:4px">←</a>
      <div><div class="nav-title">KIIP 0급 ${lesson.num}과 · ${lesson.titleKo}</div><div class="nav-sub">글로컬 아카데미 · Glocal Academy</div></div>
    </div>
    <button class="nav-btn" onclick="setState({menuOpen:!STATE.menuOpen})">\${STATE.menuOpen?'✕':'☰'}</button>
  </div>\${menu}\`;
}

function renderBottomNav(){
  return \`<div class="bottom-nav">\${PAGES.map(it=>
    \`<button class="\${STATE.page===it.id?'active':''}" onclick="setState({page:'\${it.id}',menuOpen:false})">
      <span class="icon">\${it.i}</span><span>\${it.l}</span>
    </button>\`
  ).join('')}</div>\`;
}

function renderPage(){
  let content;
  switch(STATE.page){
    case 'home': content=renderHome(); break;
    case 'ai': content=renderAI(); break;
    default: content=renderWIP(STATE.page);
  }
  return \`<div class="page">\${content}</div>\`;
}

function renderHome(){
  return \`
  <div style="text-align:center;padding:10px 0 20px">
    <div style="font-size:56px;margin-bottom:10px">${lesson.emoji}</div>
    <h2 style="color:var(--green);font-size:22px;margin-bottom:4px">0급 ${lesson.num}과 · ${lesson.titleKo}</h2>
    <div style="font-size:13px;color:#6b7280;margin-bottom:16px">${lesson.titleEn} · Lesson ${lesson.num} of ${totalLessons}</div>
    <div class="prog-bar"><div class="prog-fill" style="width:${progressPct}%"></div></div>
    <div style="font-size:11px;color:#6b7280;margin-bottom:20px">전체 진도 ${progressPct}% · Overall Progress</div>
  </div>

  <div class="card card-green" style="background:linear-gradient(135deg,var(--green),#047857);border:none;color:#fff;margin-bottom:16px">
    <div style="font-size:15px;font-weight:800;margin-bottom:8px">📌 ${lesson.num}과 주제</div>
    <div style="font-size:13px;opacity:.9;line-height:1.8">
      ${lesson.emoji} ${lesson.titleKo}<br>
      📖 ${lesson.titleEn}
    </div>
  </div>

  <div class="wip-banner">
    <h3>🚧 콘텐츠 준비 중</h3>
    <p>이 과의 상세 학습 자료를 제작 중입니다.<br>Content is being prepared for this lesson.</p>
    <p style="margin-top:8px;font-size:12px;opacity:0.8">🇻🇳 Nội dung đang được chuẩn bị. Vui lòng quay lại sau.</p>
  </div>

  <div class="card card-green">
    <div style="font-size:13px;font-weight:700;color:var(--green);margin-bottom:8px">💡 지금 AI로 학습하기</div>
    <div style="font-size:13px;color:#555;line-height:1.8;margin-bottom:10px">
      AI 실습 탭에서 이 주제를 바로 공부할 수 있어요!<br>
      <span style="font-size:12px;color:#059669">🇻🇳 Học ngay chủ đề này qua tab AI 실습!</span>
    </div>
    <button onclick="setState({page:'ai'})" style="background:var(--green);color:#fff;border-radius:10px;padding:12px 20px;font-size:14px;font-weight:700;width:100%">
      🤖 AI 실습 탭으로 이동
    </button>
  </div>

  <div style="display:flex;gap:10px;margin-top:8px">
    <a href="${prevHref}" style="flex:1;background:#047857;color:#fff;border-radius:10px;padding:12px;text-align:center;text-decoration:none;font-size:13px;font-weight:700">← ${prevNum}과</a>
    ${nextNum ? `<a href="${nextHref}" style="flex:1;background:var(--green);color:#fff;border-radius:10px;padding:12px;text-align:center;text-decoration:none;font-size:13px;font-weight:700">${nextLabel}</a>` : `<a href="${nextHref}" style="flex:1;background:#6b7280;color:#fff;border-radius:10px;padding:12px;text-align:center;text-decoration:none;font-size:13px;font-weight:700">${nextLabel}</a>`}
  </div>
  \`;
}

function renderWIP(page){
  return \`
    <h2>${lesson.emoji} ${lesson.titleKo} · \${page}</h2>
    <p class="sub">${lesson.titleEn} · Lesson ${lesson.num}</p>
    <div class="wip-banner">
      <h3>🚧 콘텐츠 준비 중</h3>
      <p>이 섹션의 학습 자료를 제작 중입니다.</p>
      <p style="font-size:12px;opacity:0.8">🇻🇳 Nội dung đang được chuẩn bị.</p>
    </div>
    <button onclick="setState({page:'ai'})" style="background:var(--green);color:#fff;border-radius:10px;padding:12px 20px;font-size:14px;font-weight:700;width:100%;margin-top:8px">
      🤖 AI 실습으로 배우기
    </button>
  \`;
}

function renderAI(){
  return \`
  <h2>🤖 AI 실습</h2>
  <p class="sub">KIIP 0급 ${lesson.num}과 · ${lesson.titleKo} · AI 튜터와 함께 학습</p>

  <div style="background:linear-gradient(135deg,var(--green),#047857);border-radius:12px;padding:16px;margin-bottom:12px;color:#fff">
    <div style="font-size:11px;opacity:0.8;margin-bottom:4px">GLOCAL ACADEMY · AI TUTOR</div>
    <div style="font-size:15px;font-weight:800;margin-bottom:4px">${lesson.emoji} ${lesson.titleKo}</div>
    <div style="font-size:12px;opacity:.85">${lesson.titleEn} — AI와 함께 지금 바로 학습!</div>
  </div>

  <div style="background:linear-gradient(135deg,#047857,#059669);border-radius:12px;padding:14px;margin-bottom:12px;color:#fff">
    <div style="font-size:13px;opacity:.85;margin-bottom:10px">💡 빠른 질문 / Quick Questions</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      \${AI_QUICK_BTNS.map((b,i)=>\`
        <button onclick="AICHAT.quickSend(\${i})"
          style="background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);border-radius:10px;color:#fff;padding:10px 8px;font-size:12px;font-weight:600;text-align:left;line-height:1.4;font-family:inherit;cursor:pointer">
          \${b.emoji} \${b.label}
        </button>\`).join('')}
    </div>
  </div>

  <div class="ai-msgbox">
    \${AICHAT.msgs.length===0
      ?\`<div style="text-align:center;color:#9ca3af;padding:36px 16px;font-size:13px">
          🤖 위 버튼을 누르거나 아래에 직접 입력하세요<br>
          <span style="font-size:11px">Tap a button above or type below</span>
        </div>\`
      :AICHAT.msgs.map(m=>\`
        <div style="align-self:\${m.role==='user'?'flex-end':'flex-start'};max-width:90%">
          <div style="background:\${m.role==='user'?'var(--green)':'#f0fdf4'};color:\${m.role==='user'?'#fff':'var(--dark)'};border-radius:\${m.role==='user'?'14px 14px 4px 14px':'14px 14px 14px 4px'};padding:10px 13px;font-size:13px;line-height:1.65;white-space:pre-wrap;word-break:break-word">\${m.text}</div>
          <div style="font-size:10px;color:#9ca3af;margin-top:3px;text-align:\${m.role==='user'?'right':'left'}">\${m.time}</div>
        </div>\`).join('')}
    \${AICHAT.loading?\`<div style="align-self:flex-start;background:#f0fdf4;border-radius:14px 14px 14px 4px;padding:10px 14px;font-size:13px;color:var(--green)">⏳ 답변 생성 중... / Generating...</div>\`:''}
  </div>

  <div style="display:flex;gap:8px">
    <input id="ai-input" type="text" placeholder="${lesson.titleKo}에 대해 질문하세요 / Ask about ${lesson.titleEn}..."
      style="flex:1;padding:12px 14px;border:2px solid #d1fae5;border-radius:10px;font-size:14px;font-family:inherit;outline:none;background:#fff"
      onfocus="this.style.borderColor='var(--green)'" onblur="this.style.borderColor='#d1fae5'"
      onkeydown="if(event.key==='Enter'){AICHAT.send();}">
    <button onclick="AICHAT.send()"
      style="background:var(--green);color:#fff;border-radius:10px;padding:0 18px;font-size:20px;min-width:52px;border:none;cursor:pointer">
      ➤
    </button>
  </div>
  <p style="font-size:11px;color:#9ca3af;text-align:center;margin-top:8px">🤖 Powered by Groq AI · 무료 · Free forever<br>© 글로컬 아카데미 · elimg.com</p>
  \`;
}

render();
</script>
<script>
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{});});
}
</script>
</body>
</html>`;
}

// ── MAIN ─────────────────────────────────────────────────────────────────────

const outDir = __dirname;
let created = 0;
let errors   = 0;

console.log('Building KIIP Level 3 lessons 2-20...');
for (const lesson of L3_LESSONS) {
  const filename = `KIIP_Level3_Lesson${lesson.num}.html`;
  const filepath = path.join(outDir, filename);
  try {
    fs.writeFileSync(filepath, buildLevel3Lesson(lesson), 'utf8');
    console.log(`  ✓ ${filename}`);
    created++;
  } catch (e) {
    console.error(`  ✗ ${filename}: ${e.message}`);
    errors++;
  }
}

console.log('\nBuilding KIIP Level 0 lessons 2-8...');
for (const lesson of L0_LESSONS) {
  const filename = `KIIP_Level0_Lesson${lesson.num}.html`;
  const filepath = path.join(outDir, filename);
  try {
    fs.writeFileSync(filepath, buildLevel0Lesson(lesson), 'utf8');
    console.log(`  ✓ ${filename}`);
    created++;
  } catch (e) {
    console.error(`  ✗ ${filename}: ${e.message}`);
    errors++;
  }
}

console.log(`\nDone! Created ${created} files, ${errors} errors.`);
