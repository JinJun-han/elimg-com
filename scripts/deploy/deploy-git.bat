@echo off
chcp 65001 > nul
title elimg.com 배포 (git 방식 - 로그인 불필요)
cd /d "C:\Users\kodhj\elimg-com"

echo =====================================================
echo    elimg.com 배포 (git push 방식)
echo =====================================================
echo.

if exist ".git\index.lock" del /f /q ".git\index.lock"
if exist ".git\HEAD.lock" del /f /q ".git\HEAD.lock"

echo [1/3] 변경 파일 모으는 중...
git add -A

echo [2/3] 커밋 생성...
git commit -m "사이트 업데이트: 2025 사역 보고 페이지 추가"

echo [3/3] GitHub 푸시 (자동 배포)...
git push origin main

echo.
echo =====================================================
echo    배포 요청 완료! 1~2분 후 아래에서 확인하세요.
echo    https://elimg.com/report
echo =====================================================
echo.
pause
