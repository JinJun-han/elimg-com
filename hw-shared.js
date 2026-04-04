/**
 * hw-shared.js — 한화오션 한국어교육 공유 스크립트
 * 모든 레슨 페이지에서 자동으로 실행:
 * 1. KIIP 단계 배지 표시
 * 2. 학습 진도 localStorage 저장
 * 3. 피드백 버튼 삽입
 */
(function () {
  // ── URL에서 레벨·레슨 파싱 ──────────────────────────
  var m = location.pathname.match(/HanwhaOcean_Level(\d)_Lesson(\d+)/i);
  if (!m) return;
  var LEVEL = parseInt(m[1]);
  var LESSON = parseInt(m[2]);

  // ── KIIP 단계 정보 ───────────────────────────────────
  var KIIP = {
    0: { label: 'KIIP 0단계 · 기초', bg: '#15803d', idx: '/HanwhaOcean_Level0_Index.html' },
    1: { label: 'KIIP 1단계 · 초급1', bg: '#1d4ed8', idx: '/HanwhaOcean_Level1_Index.html' },
    2: { label: 'KIIP 2단계 · 초급2', bg: '#1d4ed8', idx: '/HanwhaOcean_Level2_Index.html' },
    3: { label: 'KIIP 3단계 · 중급1', bg: '#7c3aed', idx: '/HanwhaOcean_Level3_Index.html' },
    4: { label: 'KIIP 4단계 · 중급2', bg: '#7c3aed', idx: '/HanwhaOcean_Level4_Index.html' },
    5: { label: 'KIIP 5단계 · 고급',  bg: '#b45309', idx: '/HanwhaOcean_Level5_Index.html' },
  };
  var ki = KIIP[LEVEL] || { label: 'KIIP ' + LEVEL + '단계', bg: '#003366', idx: '/' };

  // ── 1. 학습 진도 저장 ─────────────────────────────────
  try {
    var key = 'hw_l' + LEVEL + '_progress';
    var p = JSON.parse(localStorage.getItem(key) || '{}');
    p[LESSON] = Date.now();
    localStorage.setItem(key, JSON.stringify(p));
    localStorage.setItem('hw_l' + LEVEL + '_last', String(LESSON));
  } catch (e) {}

  // ── 2. KIIP 배지 삽입 ────────────────────────────────
  var badge = document.createElement('div');
  badge.id = 'kiip-badge';
  badge.title = ki.label + ' — 목차로 이동';
  badge.style.cssText =
    'position:fixed;top:0;right:0;z-index:9998;background:' + ki.bg +
    ';color:#fff;font-size:10px;font-weight:800;padding:5px 12px 5px 10px;' +
    'border-radius:0 0 0 12px;letter-spacing:.2px;cursor:pointer;' +
    'box-shadow:0 2px 8px rgba(0,0,0,.2);';
  badge.textContent = ki.label + ' ↗';
  badge.onclick = function () { location.href = ki.idx; };
  document.body.appendChild(badge);

  // ── 3. 피드백 버튼 + 모달 삽입 ───────────────────────
  var style = document.createElement('style');
  style.textContent =
    '#hw-fb-btn{position:fixed;bottom:80px;right:16px;z-index:9999;background:#E8C05A;color:#003366;' +
    'border:none;border-radius:50px;padding:10px 16px;font-size:13px;font-weight:800;cursor:pointer;' +
    'box-shadow:0 4px 12px rgba(0,0,0,.25);display:flex;align-items:center;gap:6px;transition:transform .15s;}' +
    '#hw-fb-btn:hover{transform:scale(1.05);}' +
    '#hw-fb-modal{display:none;position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.55);' +
    'align-items:center;justify-content:center;}' +
    '#hw-fb-modal.open{display:flex;}' +
    '#hw-fb-box{background:#fff;border-radius:18px;padding:24px;width:min(360px,92vw);box-shadow:0 8px 32px rgba(0,0,0,.2);}' +
    '#hw-fb-box h3{margin:0 0 14px;font-size:17px;color:#003366;}' +
    '.hw-stars{display:flex;gap:6px;margin-bottom:14px;}' +
    '.hw-star{font-size:26px;cursor:pointer;opacity:.3;transition:opacity .1s;}' +
    '.hw-star.on{opacity:1;}' +
    '#hw-fb-comment{width:100%;box-sizing:border-box;border:1.5px solid #ddd;border-radius:10px;' +
    'padding:10px;font-size:14px;resize:vertical;min-height:70px;font-family:inherit;margin-bottom:8px;}' +
    '#hw-fb-name{width:100%;box-sizing:border-box;border:1.5px solid #ddd;border-radius:10px;' +
    'padding:8px 10px;font-size:14px;margin-bottom:10px;font-family:inherit;}' +
    '.hw-fb-btns{display:flex;gap:8px;justify-content:flex-end;}' +
    '.hw-fb-btns button{border:none;border-radius:10px;padding:10px 18px;font-size:14px;font-weight:700;cursor:pointer;}' +
    '#hw-fb-cancel{background:#f1f5f9;color:#555;}' +
    '#hw-fb-submit{background:#003366;color:#fff;}' +
    '#hw-fb-thanks{display:none;text-align:center;padding:12px 0;color:#15803d;font-weight:700;}';
  document.head.appendChild(style);

  var btnHtml =
    '<button id="hw-fb-btn" onclick="document.getElementById(\'hw-fb-modal\').classList.add(\'open\')">💬 의견 남기기</button>' +
    '<div id="hw-fb-modal"><div id="hw-fb-box">' +
    '<h3>📝 이 레슨 어떠셨나요?</h3>' +
    '<div class="hw-stars">' +
    '<span class="hw-star" data-v="1">⭐</span><span class="hw-star" data-v="2">⭐</span>' +
    '<span class="hw-star" data-v="3">⭐</span><span class="hw-star" data-v="4">⭐</span>' +
    '<span class="hw-star" data-v="5">⭐</span>' +
    '</div>' +
    '<input id="hw-fb-name" type="text" placeholder="이름 (선택)" />' +
    '<textarea id="hw-fb-comment" placeholder="자유롭게 의견을 남겨주세요 (선택)"></textarea>' +
    '<div class="hw-fb-btns">' +
    '<button id="hw-fb-cancel" onclick="document.getElementById(\'hw-fb-modal\').classList.remove(\'open\')">취소</button>' +
    '<button id="hw-fb-submit">보내기 ✉️</button>' +
    '</div>' +
    '<div id="hw-fb-thanks">🙏 감사합니다! 소중한 의견을 받았습니다.</div>' +
    '</div></div>';

  var wrap = document.createElement('div');
  wrap.innerHTML = btnHtml;
  document.body.appendChild(wrap);

  // 별점 이벤트
  var rating = 0;
  document.querySelectorAll('.hw-star').forEach(function (s) {
    s.addEventListener('click', function () {
      rating = parseInt(s.getAttribute('data-v'));
      document.querySelectorAll('.hw-star').forEach(function (x, i) {
        x.classList.toggle('on', i < rating);
      });
    });
  });

  // 보내기
  document.getElementById('hw-fb-submit').addEventListener('click', function () {
    var comment = (document.getElementById('hw-fb-comment').value || '').slice(0, 500);
    var name = (document.getElementById('hw-fb-name').value || '').slice(0, 50);
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: LEVEL, lesson: LESSON, rating: rating, comment: comment, name: name }),
    }).catch(function () {});
    document.getElementById('hw-fb-box').querySelectorAll('h3,.hw-stars,#hw-fb-name,#hw-fb-comment,.hw-fb-btns').forEach(function (el) {
      el.style.display = 'none';
    });
    document.getElementById('hw-fb-thanks').style.display = 'block';
    setTimeout(function () { document.getElementById('hw-fb-modal').classList.remove('open'); }, 2000);
  });
})();
