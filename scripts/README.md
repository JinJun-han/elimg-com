# scripts/ — 운영 스크립트 아카이브

elimg.com 운영 중 발생한 일회성·반복 스크립트들. 라이브(elimg.com)에는 `.assetsignore`로 노출 차단.

## debug/

KIIP·한화오션 AI 챗봇 디버깅 흔적. 일회성으로 작성된 fix/check/test 스크립트.
대부분 한 번 실행 후 폐기 대상. 재사용 가능성 낮지만 디버깅 패턴 참고용으로 보관.

## data/

KIIP 레슨·한화오션 콘텐츠를 일괄 변환·생성한 빌드 스크립트.
- `build_kiip_lessons.js` — KIIP 레슨 일괄 생성
- `customize_l*_lessons.js`, `customize_l*_6to20.js` — Level 1·2 레슨 커스터마이징
- `_transform_kiip6.js` — KIIP 6급 데이터 변환
- `add_ai_*` — AI 챗봇 일괄 주입
- `upgrade_ai_*` — AI 챗봇 일괄 업그레이드
- `patch_*` — UI/스트리밍/타이핑 일괄 패치
- `inject_shared.js` — 공통 스크립트 주입

대규모 데이터 변환이 필요할 때 참조·재실행 가능.

## deploy/

배포 스크립트. **주의**: 셋 중 하나만 실제 동작.

- ✅ `deploy.bat` — `npx wrangler deploy --yes` (실제 Cloudflare 배포). 단 `--yes` 옵션은 wrangler 4.x에서 제거됨. 사용 시 `--yes` 빼고 실행.
- ❌ `deploy.bat.bat` — git push만 실행 (Cloudflare 배포 X). 주석에 "Cloudflare Pages 자동 배포"라고 적혀있지만 실제로는 GitHub에만 올림. **사용 금지 또는 wrangler 명령 추가 필요**.
- ❌ `배포_4급.bat` — git push만 실행. 위와 동일 문제.

**진짜 배포**: `npx wrangler deploy` (수동 실행)

## 재사용 시

```powershell
cd D:\Dev\projects\elimg-com
node scripts/data/build_kiip_lessons.js   # 예시
```
