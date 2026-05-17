const fs = require('fs');
let c = fs.readFileSync('C:/Users/kodhj/elimg-com/KIIP_Level2_Lesson6.html', 'utf8');

// --- VOCAB_SHIPYARD: replace with general KIIP life contexts ---
const oldSV = `const VOCAB_SHIPYARD = [
  {kor:"산업 뉴스",eng:"industry news",sit:"조선 산업"},
  {kor:"수주",eng:"order/contract",sit:"수주 소식"},
  {kor:"실적",eng:"performance/achievement",sit:"실적 발표"},
  {kor:"기술 개발",eng:"technology development",sit:"기술 뉴스"},
  {kor:"친환경 선박",eng:"eco-friendly ship",sit:"환경 뉴스"},
  {kor:"LNG 운반선",eng:"LNG carrier",sit:"제품 뉴스"},
  {kor:"국제 경쟁",eng:"international competition",sit:"시장 뉴스"},
  {kor:"투자",eng:"investment",sit:"경제 뉴스"},
  {kor:"고용",eng:"employment",sit:"인사 뉴스"},
  {kor:"안전 사건",eng:"safety incident",sit:"안전 뉴스"},
  {kor:"협력사",eng:"partner/supplier",sit:"관계사 뉴스"},
  {kor:"수출",eng:"export",sit:"무역 뉴스"},
  {kor:"국내 시장",eng:"domestic market",sit:"시장 분석"},
  {kor:"글로벌 확장",eng:"global expansion",sit:"경영 뉴스"},
  {kor:"임금 협상",eng:"wage negotiation",sit:"노사 이슈"},
];`;
const newSV = `const VOCAB_SHIPYARD = [
  {kor:"생활 뉴스",eng:"daily life news",sit:"생활 정보"},
  {kor:"날씨",eng:"weather",sit:"날씨 뉴스"},
  {kor:"교통",eng:"transportation",sit:"교통 뉴스"},
  {kor:"교육",eng:"education",sit:"교육 뉴스"},
  {kor:"의료",eng:"healthcare",sit:"의료 뉴스"},
  {kor:"주거",eng:"housing",sit:"주거 정보"},
  {kor:"취업",eng:"employment",sit:"취업 뉴스"},
  {kor:"이민",eng:"immigration",sit:"이민 정보"},
  {kor:"행사",eng:"event",sit:"지역 행사"},
  {kor:"안전",eng:"safety",sit:"안전 뉴스"},
  {kor:"문화",eng:"culture",sit:"문화 뉴스"},
  {kor:"경제",eng:"economy",sit:"경제 뉴스"},
  {kor:"한국 생활",eng:"life in Korea",sit:"생활 정보"},
  {kor:"사회통합",eng:"social integration",sit:"이민자 정보"},
  {kor:"비자",eng:"visa",sit:"법률 정보"},
];`;
if (c.includes(oldSV)) { c = c.replace(oldSV, newSV); console.log('VOCAB_SHIPYARD replaced'); }
else console.log('WARN: VOCAB_SHIPYARD not found as expected');

// --- VOCAB_SHIPYARD_NOUNS: replace with general Korean life nouns ---
const oldSN_start = `const VOCAB_SHIPYARD_NOUNS = [
  {kor:"조선 산업",eng:"shipbuilding industry"},{kor:"조선사",eng:"shipbuilder"},`;
if (c.includes(oldSN_start)) {
  const idx1 = c.indexOf('const VOCAB_SHIPYARD_NOUNS = [');
  const idx2 = c.indexOf('];', idx1) + 2;
  const oldSN = c.substring(idx1, idx2);
  const newSN = `const VOCAB_SHIPYARD_NOUNS = [
  {kor:"사회통합프로그램",eng:"social integration program"},{kor:"이민자",eng:"immigrant"},
  {kor:"외국인 등록",eng:"foreigner registration"},{kor:"한국 생활",eng:"life in Korea"},
  {kor:"대중교통",eng:"public transportation"},{kor:"지하철",eng:"subway"},
  {kor:"주민센터",eng:"community center"},{kor:"건강보험",eng:"health insurance"},
  {kor:"근로계약",eng:"employment contract"},{kor:"한국어 능력",eng:"Korean language ability"},
  {kor:"KIIP",eng:"Korea Immigration Integration Program"},{kor:"귀화",eng:"naturalization"},
  {kor:"영주권",eng:"permanent residency"},{kor:"다문화",eng:"multicultural"},
  {kor:"문화 체험",eng:"cultural experience"},{kor:"한국 문화",eng:"Korean culture"},
  {kor:"생활비",eng:"living expenses"},{kor:"주거 지원",eng:"housing support"},
  {kor:"취업 지원",eng:"employment support"},{kor:"언어 교육",eng:"language education"},
  {kor:"이주민",eng:"migrant"},{kor:"공동체",eng:"community"},
];`;
  c = c.substring(0, idx1) + newSN + c.substring(idx2);
  console.log('VOCAB_SHIPYARD_NOUNS replaced');
} else console.log('WARN: VOCAB_SHIPYARD_NOUNS not found');

// --- DIALOGUES: neutralize ---
const oldD1 = `  {title:"뉴스 시청과 이해",eng:"Watching and Understanding News",lines:[
    {sp:"동료1",role:"colleague 1",text:"어제 글로컬 아카데미 뉴스 봤어요?",eng:"Did you see the Hanwha Ocean news yesterday?",side:"L"},
    {sp:"동료2",role:"colleague 2",text:"아니요, 못 봤는데 뭐가 나왔어요?",eng:"No, I didn't. What was the news about?",side:"R"},
    {sp:"동료1",text:"글로컬 아카데미이 LNG 운반선 수주를 받았대요. 큰 계약이래요.",eng:"Hanwha Ocean received an LNG carrier order. It's a big deal.",side:"L"},
    {sp:"동료2",text:"오! 정말 중요한 뉴스네요. 기사에는 뭐가 있었어요?",eng:"Wow! That's really important news. What was in the article?",side:"R"},
    {sp:"동료1",text:"기사에서는 이 계약이 회사의 미래를 바꿀 수 있다고 했어요.",eng:"The article said this contract could change the company's future.",side:"L"},
    {sp:"동료2",text:"정말요? 그럼 우리도 이 뉴스에 대해 알아야 할 수밖에 없겠네요.",eng:"Really? Then we have to know about this news.",side:"R"},
  ]},`;
const newD1 = `  {title:"뉴스 시청과 이해",eng:"Watching and Understanding News",lines:[
    {sp:"친구1",role:"friend 1",text:"어제 한국 뉴스 봤어요?",eng:"Did you watch Korean news yesterday?",side:"L"},
    {sp:"친구2",role:"friend 2",text:"아니요, 못 봤는데 뭐가 나왔어요?",eng:"No, I didn't. What was the news about?",side:"R"},
    {sp:"친구1",text:"외국인 등록 관련 새 법이 생겼대요. 이민자들에게 중요한 뉴스래요.",eng:"There's a new law related to foreigner registration. It's important news for immigrants.",side:"L"},
    {sp:"친구2",text:"오! 정말 중요한 뉴스네요. 기사에는 뭐가 있었어요?",eng:"Wow! That's really important news. What was in the article?",side:"R"},
    {sp:"친구1",text:"기사에서는 이 법이 이민자 생활에 도움이 될 수 있다고 했어요.",eng:"The article said this law could help the lives of immigrants.",side:"L"},
    {sp:"친구2",text:"정말요? 그럼 우리도 이 뉴스에 대해 알아야 할 수밖에 없겠네요.",eng:"Really? Then we have to know about this news.",side:"R"},
  ]},`;
if (c.includes(oldD1)) { c = c.replace(oldD1, newD1); console.log('Dialogue 1 replaced'); }
else console.log('WARN: Dialogue 1 not found');

const oldD2 = `  {title:"인터뷰와 기사 작성",eng:"Interview and Article Writing",lines:[
    {sp:"기자",role:"journalist",text:"안녕하세요. 저는 산업 뉴스 기자예요. 인터뷰를 해도 될까요?",eng:"Hello. I'm an industry news reporter. Can I interview you?",side:"L"},
    {sp:"직원",role:"worker",text:"네, 괜찮아요. 뭘 물어보실 건데요?",eng:"Sure. What would you like to ask?",side:"R"},
    {sp:"기자",text:"글로컬 아카데미에서 일하신 지 얼마나 되셨어요?",eng:"How long have you been working at Hanwha Ocean?",side:"L"},
    {sp:"직원",text:"3년 일했어요. 처음엔 배우는 과정이었지만 이제는 능숙해요.",eng:"I've worked for 3 years. It was a learning process at first, but now I'm skilled.",side:"R"},
    {sp:"기자",text:"최근 기술 개발에 대해 어떻게 생각하세요?",eng:"What do you think about recent technology development?",side:"L"},
    {sp:"직원",text:"매우 인상적이에요. 친환경 기술이 발전해서 자랑스러워요.",eng:"It's very impressive. I'm proud that eco-friendly technology is advancing.",side:"R"},
  ]},`;
const newD2 = `  {title:"인터뷰와 기사 작성",eng:"Interview and Article Writing",lines:[
    {sp:"기자",role:"journalist",text:"안녕하세요. 저는 생활 뉴스 기자예요. 인터뷰를 해도 될까요?",eng:"Hello. I'm a lifestyle news reporter. Can I interview you?",side:"L"},
    {sp:"이민자",role:"immigrant",text:"네, 괜찮아요. 뭘 물어보실 건데요?",eng:"Sure. What would you like to ask?",side:"R"},
    {sp:"기자",text:"한국에 오신 지 얼마나 되셨어요?",eng:"How long have you been in Korea?",side:"L"},
    {sp:"이민자",text:"3년 됐어요. 처음엔 어려웠지만 이제는 한국 생활에 익숙해졌어요.",eng:"It's been 3 years. It was difficult at first, but now I'm used to life in Korea.",side:"R"},
    {sp:"기자",text:"한국 뉴스를 이해하는 데 어려움은 없어요?",eng:"Is there any difficulty understanding Korean news?",side:"L"},
    {sp:"이민자",text:"처음엔 어려웠지만, 매일 보다 보니 이제 조금씩 이해할 수 있어요.",eng:"It was hard at first, but watching every day, I can understand a little more now.",side:"R"},
  ]},`;
if (c.includes(oldD2)) { c = c.replace(oldD2, newD2); console.log('Dialogue 2 replaced'); }
else console.log('WARN: Dialogue 2 not found');

// --- GRAMMAR examples: fix 글로컬 아카데미 뉴스 reference ---
c = c.replace(
  `{q:"뉴스를 봤어요?",a:"네, 글로컬 아카데미 뉴스를 본 적이 있어요.",eng:"Yes, I have seen Hanwha Ocean news.",note:"본 적이 있어요"},`,
  `{q:"뉴스를 봤어요?",a:"네, 한국 생활 뉴스를 본 적이 있어요.",eng:"Yes, I have seen Korean life news.",note:"본 적이 있어요"},`
);

// --- Fix grammar example referencing 회사 보도 ---
c = c.replace(
  `{q:"왜 이 뉴스를 봤어요?",a:"회사에서 보도했으니까 봐야 할 수밖에 없었어요.",eng:"The company reported it, so I had no choice but to watch.",note:"했을 수밖에 없었어요"},`,
  `{q:"왜 이 뉴스를 봤어요?",a:"이민자에게 중요하니까 봐야 할 수밖에 없었어요.",eng:"It's important for immigrants, so I had no choice but to watch.",note:"할 수밖에 없었어요"},`
);

// --- QUIZ: replace shipyard-specific questions ---
c = c.replace(
  `{q:"글로컬 아카데미은 어떤 뉴스로 유명해요?",o:["조선·해양 산업 뉴스","영화·연예 뉴스","스포츠 뉴스","날씨 뉴스"],a:0},`,
  `{q:"KIIP는 어떤 프로그램이에요?",o:["사회통합프로그램","취미 프로그램","여행 프로그램","스포츠 프로그램"],a:0},`
);
c = c.replace(
  `{q:"LNG 운반선은 뭐예요?",o:["천연가스 운반 선박","일반 화물선","여객선","어선"],a:0},`,
  `{q:"이민자들이 한국어를 배우면 어떤 점이 좋아요?",o:["생활이 편해져요","여행이 어려워요","친구가 없어요","일이 힘들어요"],a:0},`
);
c = c.replace(
  `{q:"한국 조선사는 세계에서 몇 등이에요?",o:["1등","2등","3등","5등"],a:0},`,
  `{q:"한국에서 외국인이 정착하는 데 도움이 되는 것은?",o:["한국어 교육","음식만 먹기","집에만 있기","친구 안 만나기"],a:0},`
);

// --- CULTURE SECTION: replace shipyard culture with general Korean media/life culture ---
const oldCulture3 = `  {icon:"🚢",t:"조선·해양 산업 뉴스",eng:"Shipbuilding and Maritime Industry News",d:"글로컬 아카데미, 현대중공업, 삼성중공업의 뉴스는 한국 경제에 중요해요. 수주, 실적, 기술 개발은 주요 뉴스 주제예요. K-조선의 글로벌 경쟁력이 높아서 국제 뉴스로도 보도돼요. 조선 근로자들은 산업 뉴스를 알고 있으면 일에 도움이 돼요.",de:"News about Hanwha Ocean, Hyundai Heavy Industries, Samsung Heavy Industries is important to Korea's economy. Orders, performance, and technology development are key news topics. K-shipbuilding's global competitiveness leads to international coverage. Knowing industry news helps shipyard workers."},`;
const newCulture3 = `  {icon:"🌏",t:"이민자와 한국 뉴스",eng:"Immigrants and Korean News",d:"한국에 사는 외국인들에게 뉴스는 매우 중요한 정보 출처예요. 비자, 건강보험, 주거, 취업 등 생활 관련 뉴스를 잘 이해하면 한국 생활이 더 편해져요. 사회통합프로그램(KIIP) 관련 뉴스도 이민자들에게 유용해요. 한국어 능력이 늘수록 더 많은 정보를 얻을 수 있어요.",de:"For foreigners living in Korea, news is a very important source of information. Understanding news about visas, health insurance, housing, and employment makes life in Korea easier. News related to the KIIP program is also useful for immigrants. As your Korean improves, you can access more information."},`;
if (c.includes(oldCulture3)) { c = c.replace(oldCulture3, newCulture3); console.log('Culture 3 replaced'); }
else console.log('WARN: Culture 3 not found');

const oldCulture4 = `  {icon:"🌐",t:"국제 뉴스와 무역",eng:"International News and Trade",d:"한국 조선 산업은 글로벌이에요. 중동, 유럽, 아메리카 등 세계 곳곳에서 주문을 받아요. 국제 뉴스를 이해하면 조선 산업을 더 잘 알 수 있어요. 영어 뉴스나 다국어 뉴스를 보는 것도 도움이 돼요.",de:"Korea's shipbuilding industry is global. It receives orders from around the world - Middle East, Europe, Americas. Understanding international news helps you better understand the shipbuilding industry. Watching English or multilingual news is helpful."},`;
const newCulture4 = `  {icon:"🌐",t:"다국어 뉴스 활용하기",eng:"Using Multilingual News",d:"한국어 뉴스가 어려우면 영어 뉴스와 비교하며 보세요. KBS World, Arirang TV는 영어로 한국 뉴스를 제공해요. 자신의 모국어 뉴스와 비교하면 한국 상황을 더 잘 이해할 수 있어요. 다국어 뉴스 활용은 한국어 실력 향상에도 도움이 돼요.",de:"If Korean news is difficult, compare it with English news. KBS World and Arirang TV provide Korean news in English. Comparing with news in your native language helps you better understand the Korean situation. Using multilingual news also helps improve your Korean."},`;
if (c.includes(oldCulture4)) { c = c.replace(oldCulture4, newCulture4); console.log('Culture 4 replaced'); }
else console.log('WARN: Culture 4 not found');

// --- LOCAL_INFO: replace shipyard-specific content ---
const oldLocalInfo = `const LOCAL_INFO = {
  title: "한국 미디어 & 뉴스 · Korean Media & News Industry",
  eng: "Korean Media & News Industry",
  facts: [
    {label:"주요 방송국",val:"KBS, MBC, SBS, JTBC + 케이블"},
    {label:"온라인 뉴스",val:"네이버뉴스, 카카오뉴스, 다음뉴스"},
    {label:"신문사",val:"조선·중앙·동아·경향·한겨레"},
    {label:"경제신문",val:"한국경제, 매일경제, 아주경제"},
    {label:"산업 뉴스",val:"조선·해양산업 전문지"},
    {label:"뉴스 시간",val:"KBS 9시 뉴스, MBC 뉴스데스크"},
    {label:"글로벌 미디어",val:"BBC, CNN, Reuters, AP News"},
  ],
  desc: "한국의 뉴스 미디어는 다양해요! 텔레비전 방송국으로는 KBS, MBC, SBS 같은 공영·민영방송이 있어요. 케이블 채널로는 JTBC, TV 조선, 채널 A 등이 있어요. 온라인에서는 네이버뉴스, 카카오뉴스, 다음뉴스가 인기예요. 신문으로는 조선일보, 중앙일보, 동아일보 같은 종합 신문과 한국경제, 매일경제 같은 경제 신문이 있어요. 조선산업 뉴스는 '해양일보' 같은 전문지에서 찾을 수 있어요. 글로컬 아카데미, 현대중공업, 삼성중공업 같은 조선사의 뉴스는 한국 경제에 매우 중요해요. K-조선의 글로벌 경쟁력 때문에 국제 뉴스로도 보도돼요. 조선 근로자들이 산업 뉴스를 알고 있으면 자신의 일을 더 잘 이해하고 회사의 미래에 대해서도 알 수 있어요.",
  descEng: "Korean news media is diverse! Television includes public broadcasters (KBS, MBC, SBS) and private broadcasters. Cable channels include JTBC, TV Chosun, Channel A. Online, Naver News, Kakao News, Daum News are popular. Newspapers include general dailies (Chosun, JoongAng, Dong-A) and business papers (Korea Economic, Maeil Business). Shipbuilding news appears in specialized publications like Maritime Daily. News from Hanwha Ocean, Hyundai Heavy, Samsung Heavy is crucial to Korea's economy. K-shipbuilding's global competitiveness brings international coverage. Shipyard workers understanding industry news helps them better understand their work and the company's future."
};`;
const newLocalInfo = `const LOCAL_INFO = {
  title: "한국 미디어 & 뉴스 · Korean Media & News",
  eng: "Korean Media & News",
  facts: [
    {label:"주요 방송국",val:"KBS, MBC, SBS, JTBC + 케이블"},
    {label:"온라인 뉴스",val:"네이버뉴스, 카카오뉴스, 다음뉴스"},
    {label:"신문사",val:"조선·중앙·동아·경향·한겨레"},
    {label:"경제신문",val:"한국경제, 매일경제, 아주경제"},
    {label:"이민자 정보",val:"하이코리아, 외국인종합안내센터"},
    {label:"뉴스 시간",val:"KBS 9시 뉴스, MBC 뉴스데스크"},
    {label:"글로벌 미디어",val:"BBC, CNN, Reuters, Arirang TV"},
  ],
  desc: "한국의 뉴스 미디어는 다양해요! 텔레비전 방송국으로는 KBS, MBC, SBS 같은 공영·민영방송이 있어요. 케이블 채널로는 JTBC, TV 조선, 채널 A 등이 있어요. 온라인에서는 네이버뉴스, 카카오뉴스, 다음뉴스가 인기예요. 신문으로는 조선일보, 중앙일보, 동아일보 같은 종합 신문과 한국경제, 매일경제 같은 경제 신문이 있어요. 이민자들에게는 하이코리아(HiKorea)와 외국인종합안내센터(1345)가 중요한 정보 출처예요. 한국어 뉴스를 이해하면 생활 정보, 비자, 건강보험 등 실생활에 필요한 정보를 쉽게 얻을 수 있어요. 매일 뉴스를 보면 한국어 실력도 늘고 한국 사회를 더 잘 이해할 수 있어요.",
  descEng: "Korean news media is diverse! Television includes public broadcasters (KBS, MBC, SBS) and private broadcasters. Cable channels include JTBC, TV Chosun, Channel A. Online, Naver News, Kakao News, Daum News are popular. Newspapers include general dailies (Chosun, JoongAng, Dong-A) and business papers (Korea Economic, Maeil Business). For immigrants, HiKorea and the Foreigner Comprehensive Information Center (1345) are important resources. Understanding Korean news helps you easily get information on daily life, visas, health insurance, and more. Watching news every day improves your Korean and helps you better understand Korean society."
};`;
if (c.includes(oldLocalInfo)) { c = c.replace(oldLocalInfo, newLocalInfo); console.log('LOCAL_INFO replaced'); }
else console.log('WARN: LOCAL_INFO not found');

// --- READING PASSAGES: replace 글로컬 아카데미 news passage with general KIIP passage ---
const oldRP1 = `  {title:"글로컬 아카데미 뉴스",eng:"Hanwha Ocean News",
   text:"어제 글로컬 아카데미이 큰 뉴스를 발표했어요.\\n글로컬 아카데미이 LNG 운반선 3척의 수주를 받았대요.\\n이것은 글로컬 아카데미 역사상 가장 큰 계약이래요.\\n이 계약으로 향후 5년간 많은 일자리가 생길 거래요.\\n지역 경제도 크게 발전할 거라고 전문가들이 예상했어요.\\n글로컬 아카데미은 이미 여러 선진국에서 같은 주문을 받았어요.\\n한국의 조선 기술이 세계에서 인정받고 있다는 증거예요.",
   textEng:"Hanwha Ocean announced big news yesterday.\\nHanwha Ocean received an order for 3 LNG carriers.\\nIt's the largest contract in Hanwha Ocean's history.\\nAccording to reports, many jobs will be created for the next 5 years.\\nExperts predict the regional economy will also develop greatly.\\nHanwha Ocean has already received similar orders from several developed countries.\\nIt's evidence that Korea's shipbuilding technology is recognized worldwide.",
   questions:[
     {q:"글로컬 아카데미이 뭘 받았어요?",a:"LNG 운반선 수주",ae:"LNG carrier order"},
     {q:"이것은 글로컬 아카데미 역사상 뭐예요?",a:"가장 큰 계약",ae:"the largest contract"},
     {q:"이 계약으로 뭐가 생길 거래요?",a:"일자리",ae:"jobs"},
   ]},`;
const newRP1 = `  {title:"KIIP 한국어 교육 뉴스",eng:"KIIP Korean Education News",
   text:"한국 정부가 이민자를 위한 새로운 한국어 교육 프로그램을 발표했어요.\\nKIIP(사회통합프로그램)에 새 과정이 추가된대요.\\n이것은 이민자들의 한국 생활 적응을 더 잘 도와주기 위한 거래요.\\n새 과정에는 생활 한국어, 문화 이해, 취업 지원이 포함된대요.\\n전문가들은 이 프로그램이 이민자 정착에 큰 도움이 될 거라고 했어요.\\n한국 전국 지역 센터에서 무료로 수강할 수 있어요.\\n한국어 능력이 늘수록 한국 생활이 더 편해진다는 것을 잊지 마세요.",
   textEng:"The Korean government announced a new Korean language education program for immigrants.\\nA new course has been added to KIIP (Korea Immigration Integration Program).\\nIt is designed to better help immigrants adapt to life in Korea.\\nThe new course includes everyday Korean, cultural understanding, and employment support.\\nExperts said this program will be a great help for immigrant settlement.\\nYou can take the course for free at regional centers across Korea.\\nDon't forget that the better your Korean, the easier life in Korea becomes.",
   questions:[
     {q:"새 프로그램은 누구를 위한 거예요?",a:"이민자",ae:"immigrants"},
     {q:"새 과정에 뭐가 포함돼요?",a:"생활 한국어, 문화 이해, 취업 지원",ae:"everyday Korean, cultural understanding, employment support"},
     {q:"어디서 수강할 수 있어요?",a:"전국 지역 센터",ae:"regional centers across Korea"},
   ]},`;
if (c.includes(oldRP1)) { c = c.replace(oldRP1, newRP1); console.log('Reading Passage 1 replaced'); }
else console.log('WARN: Reading Passage 1 not found - checking...');

// --- TOPIK PRACTICE: replace shipyard-specific TOPIK questions ---
// Reading Q1
c = c.replace(
  `{q:"다음을 읽고 맞는 것을 고르세요.\\n\\n어제 글로컬 아카데미이 LNG 운반선 수주를 받았어요.\\n이것은 글로컬 아카데미 역사상 가장 큰 계약이에요.\\n이 계약으로 많은 일자리가 생길 거예요.",o:["글로컬 아카데미이 수주를 받았어요.","글로컬 아카데미이 수주를 잃었어요.","글로컬 아카데미이 수주를 찾고 있어요.","글로컬 아카데미이 수주를 거부했어요."],a:0,ae:"Hanwha Ocean received an order."},`,
  `{q:"다음을 읽고 맞는 것을 고르세요.\\n\\n어제 정부가 이민자를 위한 새 한국어 교육 프로그램을 발표했어요.\\nKIIP에 새 과정이 추가됐어요.\\n이 프로그램은 이민자의 한국 생활 적응을 도와줘요.",o:["정부가 새 교육 프로그램을 발표했어요.","정부가 프로그램을 없앴어요.","정부가 프로그램을 찾고 있어요.","정부가 프로그램을 거부했어요."],a:0,ae:"The government announced a new education program."},`
);

// Reading Q2
c = c.replace(
  `{q:"다음을 읽고 맞는 것을 고르세요.\\n\\n조선 산업은 한국의 중요한 산업이에요.\\nK-조선은 세계에서 1등이에요.\\nLNG 운반선 시장에서 한국이 80% 점유해요.",o:["한국이 조선 산업 1등이에요.","중국이 조선 산업 1등이에요.","일본이 조선 산업 1등이에요.","미국이 조선 산업 1등이에요."],a:0,ae:"Korea is #1 in shipbuilding."},`,
  `{q:"다음을 읽고 맞는 것을 고르세요.\\n\\nKIIP는 한국의 중요한 이민자 프로그램이에요.\\n이민자들은 이 프로그램에서 한국어를 배울 수 있어요.\\n전국 센터에서 무료로 수강할 수 있어요.",o:["KIIP는 이민자를 위한 프로그램이에요.","KIIP는 한국인만 수강할 수 있어요.","KIIP는 유료 프로그램이에요.","KIIP는 서울에만 있어요."],a:0,ae:"KIIP is a program for immigrants."},`
);

// Reading Q3
c = c.replace(
  `{q:"다음 빈칸에 알맞은 것을 고르세요.\\n\\n기자가 인터뷰를 했는데, _____ 회사의 미래에 대해 물었어요.",o:["글로컬 아카데미의","SBS의","KBS의","MBC의"],a:0,ae:"the journalist asked about Hanwha Ocean's future"},`,
  `{q:"다음 빈칸에 알맞은 것을 고르세요.\\n\\n기자가 인터뷰를 했는데, _____ 한국 생활에 대해 물었어요.",o:["이민자의","방송국의","신문사의","대학교의"],a:0,ae:"the journalist asked about the immigrant's life in Korea"},`
);

// Listening Q1
c = c.replace(
  `{q:"[뉴스 듣기] 다음을 듣고 주제를 고르세요.\\n\\n'어제 글로컬 아카데미에서 큰 뉴스가 있었어요.\\n글로컬 아카데미이 LNG 운반선 3척의 수주를 받았대요.\\n이것은 회사 역사상 가장 큰 계약이래요.'",o:["글로컬 아카데미이 수주를 받았어요.","글로컬 아카데미이 직원을 뽑았어요.","글로컬 아카데미이 새 공장을 지었어요.","글로컬 아카데미이 기술을 개발했어요."],a:0,ae:"Hanwha Ocean received an order"},`,
  `{q:"[뉴스 듣기] 다음을 듣고 주제를 고르세요.\\n\\n'어제 정부에서 중요한 뉴스가 있었어요.\\n이민자를 위한 새 한국어 교육 프로그램이 생겼대요.\\n이것은 이민자 지원 역사상 가장 큰 정책이래요.'",o:["정부가 이민자 교육 프로그램을 발표했어요.","정부가 이민자를 내보냈어요.","정부가 새 공장을 지었어요.","정부가 외국어를 금지했어요."],a:0,ae:"The government announced an immigrant education program"},`
);

// Listening Q2
c = c.replace(
  `{q:"[뉴스 듣기] 다음을 듣고 세부 내용을 고르세요.\\n\\n'조선 산업 소식이에요.\\nK-조선은 세계에서 1등이라고 해요.\\nLNG 운반선 기술에서 한국이 가장 앞서가고 있어요.\\n앞으로도 더 발전할 거라고 전문가들이 말했어요.'",o:["한국이 LNG 운반선 1등이에요.","한국이 VLCC 1등이에요.","한국이 FPSO 1등이에요.","한국이 자동차 1등이에요."],a:0,ae:"Korea is #1 in LNG carriers"},`,
  `{q:"[뉴스 듣기] 다음을 듣고 세부 내용을 고르세요.\\n\\n'이민자 생활 소식이에요.\\nKIIP 프로그램 수강생이 매년 늘고 있다고 해요.\\n한국어 교육에서 이민자들이 가장 높은 만족도를 보였어요.\\n앞으로도 더 발전할 거라고 전문가들이 말했어요.'",o:["한국어 교육 만족도가 높아요.","이민자가 줄고 있어요.","KIIP가 없어질 거예요.","이민자들이 뉴스를 안 봐요."],a:0,ae:"Korean language education satisfaction is high"},`
);

// Listening Q3: replace 조선소 근무자 with general
c = c.replace(
  `{q:"[안내방송] 다음을 듣고 내용을 고르세요.\\n\\n'조선소 근무자분들께 안내합니다.\\n오후 2시에 안전 교육이 있습니다.\\n소회의실에서 1시간 동안 진행됩니다.\\n모든 근무자분들의 참석을 부탁드립니다.'",o:["안전 교육이 있어요.","기술 교육이 있어요.","언어 교육이 있어요.","문화 교육이 있어요."],a:0,ae:"There's a safety training"},`,
  `{q:"[안내방송] 다음을 듣고 내용을 고르세요.\\n\\n'KIIP 수강생 여러분께 안내합니다.\\n오후 2시에 한국어 특별 수업이 있습니다.\\n강의실에서 1시간 동안 진행됩니다.\\n모든 수강생분들의 참석을 부탁드립니다.'",o:["한국어 특별 수업이 있어요.","기술 교육이 있어요.","안전 교육이 있어요.","문화 행사가 있어요."],a:0,ae:"There's a special Korean language class"},`
);

// Listening Q4: replace 글로컬 아카데미 interview
c = c.replace(
  `{q:"[인터뷰] 다음을 듣고 대답을 고르세요.\\n\\n기자: '글로컬 아카데미에서 일한 지 얼마나 되셨어요?'\\n직원: '3년이 됐어요. 여기서 많이 배웠어요.'",o:["3년","1년","5년","10년"],a:0,ae:"3 years"},`,
  `{q:"[인터뷰] 다음을 듣고 대답을 고르세요.\\n\\n기자: '한국에 오신 지 얼마나 되셨어요?'\\n이민자: '3년이 됐어요. 한국어를 많이 배웠어요.'",o:["3년","1년","5년","10년"],a:0,ae:"3 years"},`
);

// Listening Q5: replace 글로컬 아카데미 수주
c = c.replace(
  `{q:"[뉴스 해석] 다음 뉴스에서 암시하는 바를 고르세요.\\n\\n'글로컬 아카데미의 수주로 많은 일자리가 생길 거예요.\\n지역 경제도 좋아질 거라고 전문가들이 예측했어요.'",o:["글로컬 아카데미의 성공이 지역 경제에 도움이 돼요.","글로컬 아카데미의 성공이 지역 경제에 해가 돼요.","글로컬 아카데미의 성공이 지역 경제와 관계가 없어요.","글로컬 아카데미이 지역을 떠날 거예요."],a:0,ae:"Hanwha Ocean's success helps the local economy"},`,
  `{q:"[뉴스 해석] 다음 뉴스에서 암시하는 바를 고르세요.\\n\\n'이민자들의 한국어 실력이 좋아지면 취업이 쉬워질 거예요.\\n한국 생활도 더 안정될 거라고 전문가들이 예측했어요.'",o:["한국어 능력이 이민자 생활에 도움이 돼요.","한국어 능력이 이민자 생활에 해가 돼요.","한국어 능력이 이민자 생활과 관계가 없어요.","이민자들이 한국어를 배울 필요가 없어요."],a:0,ae:"Korean language ability helps immigrant life"},`
);

// --- REVIEW_DATA: neutralize K-조선 reference ---
c = c.replace(
  `{title:"K-조선 지식",icon:"🚢",items:["KBS, MBC, SBS, JTBC","네이버뉴스·카카오뉴스","조선·중앙·동아 신문","글로컬 아카데미 수주 뉴스"]},`,
  `{title:"KIIP 생활 지식",icon:"🌏",items:["KBS, MBC, SBS, JTBC","네이버뉴스·카카오뉴스","조선·중앙·동아 신문","KIIP·이민자 생활 뉴스"]},`
);
c = c.replace(
  `dictation: ["뉴스를 보다.","기사를 읽다.","방송을 듣다.","속보입니다.","중요한 소식이에요.","글로컬 아카데미이 수주를 받았어요.","한국이 조선 1등이에요.","LNG 운반선 기술이 최고예요.","뉴스를 본 적이 있어요.","일하다가 뉴스를 들었어요."],`,
  `dictation: ["뉴스를 보다.","기사를 읽다.","방송을 듣다.","속보입니다.","중요한 소식이에요.","한국 생활 뉴스를 봤어요.","이민자에게 중요한 뉴스예요.","한국어 공부가 도움이 돼요.","뉴스를 본 적이 있어요.","밥 먹다가 뉴스를 들었어요."],`
);

// --- PREVIEW section: remove shipyard reference ---
c = c.replace(
  `{label:"조선소 어휘",val:"회의 진행, 기술 논의, 실적 보고",detail:"meeting progress, technical discussion, performance reporting"},`,
  `{label:"생활 어휘",val:"회의 진행, 의견 나누기, 일상 표현",detail:"meeting progress, sharing opinions, everyday expressions"},`
);
c = c.replace(
  `3. 글로컬 아카데미과 조선 산업 뉴스를 미리 알아보세요.`,
  `3. KIIP와 한국 생활 관련 뉴스를 미리 알아보세요.`
);
c = c.replace(
  `3. Learn about Hanwha Ocean and shipbuilding industry news.`,
  `3. Learn about KIIP and news related to Korean daily life.`
);

// --- Geoje page: fix remaining references ---
c = c.replace(
  `<div style="font-size:18px;font-weight:800;margin-bottom:10px">GlocalBridge · 글로컬 아카데미 한화오션</div>`,
  `<div style="font-size:18px;font-weight:800;margin-bottom:10px">GlocalBridge · 글로컬 아카데미</div>`
);
c = c.replace(
  `{item:'업계 뉴스',price:'글로컬 아카데미·조선',emoji:'⛓️',eng:'Industry News'},`,
  `{item:'이민자 정보',price:'하이코리아·1345',emoji:'🌏',eng:'Immigrant Info'},`
);

// --- AI section: fix shipyard-specific system prompt and pronunciation sentences ---
c = c.replace(
  `var sysP = 'You are a Korean news and media literacy coach for shipyard workers. Lesson focus: media vocabulary 뉴스(news), 기사(article), 인터뷰(interview), 미디어(media), 보도(report), experience expression ~(으)ㄴ 적이 있다 (have experienced). Help workers understand Korean news related to shipbuilding industry. SHORT answers with English. LESSON:L2L6';`,
  `var sysP = 'You are a Korean news and media literacy coach for KIIP students and immigrants. Lesson focus: media vocabulary 뉴스(news), 기사(article), 인터뷰(interview), 미디어(media), 보도(report), experience expression ~(으)ㄴ 적이 있다 (have experienced). Help learners understand Korean news related to daily life and social integration. SHORT answers with English. LESSON:L2L6';`
);

// Fix pronunciation coach sentences (shipyard-specific -> general)
c = c.replace(
  `{sent:'글로컬 아카데미이 대형 선박을 수주했어요.', eng:'Hanwha Ocean received an order for a large ship.'},`,
  `{sent:'오늘 날씨가 어떻다고 했어요?', eng:'What did they say the weather is like today?'},`
);
c = c.replace(
  `{sent:'조선업이 요즘 바빠요.', eng:'The shipbuilding industry is busy these days.'},`,
  `{sent:'한국 생활에 이제 익숙해졌어요.', eng:'I have gotten used to life in Korea.'},`
);
c = c.replace(
  `{sent:'안전 교육이 있다고 공지가 났어요.', eng:'There was a notice about safety training.'},`,
  `{sent:'KIIP 수업이 있다고 공지가 났어요.', eng:'There was a notice about a KIIP class.'},`
);

// Fix AI banner reference
c = c.replace(
  `<div style="font-size:11px;opacity:0.85;line-height:1.7">한국 뉴스 · 조선업 기사 · 미디어 표현<br>\n    <span style="color:#93c5fd">🔵 News Reading Coach × Media Korean</span></div>`,
  `<div style="font-size:11px;opacity:0.85;line-height:1.7">한국 뉴스 · 생활 기사 · 미디어 표현<br>\n    <span style="color:#93c5fd">🔵 News Reading Coach × Media Korean</span></div>`
);

// Fix Gemini prompt text (shipyard roleplay -> general KIIP)
c = c.replace(
  `"저는 한화오션 조선소 외국인 근로자예요. 한국 뉴스를 읽고 이해하는 연습을 도와주세요. 조선업 관련 뉴스 어휘와 미디어 표현을 영어로도 설명해 주세요."`,
  `"저는 한국에 사는 이민자예요. 한국 뉴스를 읽고 이해하는 연습을 도와주세요. 일상 생활 관련 뉴스 어휘와 미디어 표현을 영어로도 설명해 주세요."`
);
c = c.replace(
  `Copy &amp; paste to Gemini for shipyard roleplay practice`,
  `Copy &amp; paste to Gemini for KIIP Korean news practice`
);
c = c.replace(
  `조선소 안전 표지판 사진 → 업로드 → "이게 무슨 뜻이에요?"<br>\n          <span style="color:#555">Photo of Korean safety signs → Upload → Ask what it means</span>`,
  `한국 뉴스 기사 사진 → 업로드 → "이 기사가 무슨 뜻이에요?"<br>\n          <span style="color:#555">Photo of Korean news article → Upload → Ask what it means</span>`
);
c = c.replace(
  `"저는 조선소 외국인 근로자입니다. 제 한국어 문장을 고쳐주세요: [내 문장]. 영어로 설명해 주세요."`,
  `"저는 한국에 사는 이민자입니다. 제 한국어 문장을 고쳐주세요: [내 문장]. 영어로 설명해 주세요."`
);
c = c.replace(
  `Copy your sentence → paste to Claude → get corrections in English`,
  `Copy your Korean sentence → paste to Claude → get corrections in English`
);

// Fix Gemini photo label
c = c.replace(
  `<div style="font-weight:700;color:#1d4ed8;margin-bottom:3px">📸 현장 사진 질문 (Gemini 특화)</div>`,
  `<div style="font-weight:700;color:#1d4ed8;margin-bottom:3px">📸 뉴스 사진 질문 (Gemini 특화)</div>`
);

// Fix nav title
c = c.replace(
  `<div class="nav-title">글로컬 아카데미 KIIP</div><div class="nav-sub">← Level 2 목차 · Contents</div>`,
  `<div class="nav-title">글로컬 아카데미 KIIP</div><div class="nav-sub">← Level 2 목차 · Contents</div>`
);

// Fix home card button text referencing 글로컬 아카데미 아카데미 if doubled
c = c.replace(/글로컬 아카데미 아카데미/g, '글로컬 아카데미');

// Fix og:site_name
c = c.replace(
  'content="글로컬 아카데미 KIIP · GlocalBridge"',
  'content="글로컬 아카데미 KIIP · GlocalBridge"'
);

// Fix og:title and og:description and twitter meta
c = c.replace(
  'content="KIIP 글로컬 아카데미 한국어교육 | KIIP 글로컬 아카데미 한국어교육"',
  'content="KIIP 2급 6과 - 글로컬 아카데미"'
);
c = c.replace(
  /<meta name="twitter:title" content="[^"]*">/,
  '<meta name="twitter:title" content="KIIP 2급 6과 - 글로컬 아카데미">'
);
c = c.replace(
  /초급 2급 6과 · 글로컬 아카데미 KIIP · KIIP 사회통합프로그램/g,
  '초급 2급 6과 · 글로컬 아카데미 · KIIP 사회통합프로그램'
);

// Fix theme-color to blue
c = c.replace(/content="#1E3A5F"/g, 'content="#1e40af"');

// Fix --navy var definition
c = c.replace('--navy:#1e40af;', '--navy:#1e40af;');  // already done

console.log('All transformations done');
fs.writeFileSync('C:/Users/kodhj/elimg-com/KIIP_Level2_Lesson6.html', c, 'utf8');
console.log('Written OK, length:', c.length);
