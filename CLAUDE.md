# CLAUDE.md — elimg.com

## 프로젝트 개요
글로컬 사역 공식 웹사이트. 후원자·동역자·일반 방문자 대상.

## 배포 환경
- **플랫폼**: Cloudflare (Pages 또는 Workers)
- **도메인**: elimg.com
- **저장소**: `C:\Users\kodhj\elimg-com\`
- ⚠️ Vercel 관련 없음 — `.vercel` 폴더 있어도 무시. 항상 Cloudflare 기준 안내.
- 라우팅: `_redirects` 파일 (Cloudflare Pages 규칙)

## 콘텐츠 톤
- 사역 정체성 유지 — 후원자·미신자 모두 읽기 편한 톤
- 외부 공개물은 `@gabriel`(후원자), `@kitt`(법무 검토) 거쳐 발행
- 다국어 필요 시 `@hermes`

## Claude × Codex 협업
- 단순 페이지·컴포넌트 → `/plan-exec`
- 결제·후원 흐름 → Claude 직접 + `/cross-review` 필수
- 배포 전 → `@hal` 보안 점검 + `@wall-e` 배포

## GSD 작업
- 새 기능 → `/gsd:plan-phase`
- 상세: `D:\AgentTeam\GSD_CODEX_INTEGRATION.md`

## 주의사항
- 후원자 개인정보 노출 금지 — `@kitt` 사전 검토
- 한국어 콘텐츠가 기본, 영문은 `@hermes` 별도 작업
