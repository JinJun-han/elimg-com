@echo off
chcp 65001 > nul
title elimg.com 4급 배포
cd /d "C:\Users\kodhj\elimg-com"

echo.
echo =====================================================
echo    한화오션 4급 20과 자동 배포 스크립트
echo =====================================================
echo.

echo [1/5] 잠금 파일 제거 중...
if exist ".git\HEAD.lock" del /f /q ".git\HEAD.lock"
if exist ".git\index.lock" del /f /q ".git\index.lock"
echo     완료.
echo.

echo [2/5] 현재 상태 확인...
git status --short
echo.

echo [3/5] 4급 파일 스테이징...
git add HanwhaOcean_Level4_Lesson*.html
git add HanwhaOcean_Level4_Index.html
git add HanwhaOcean_Level5_Index.html
git add Korean_Education_Hub.html
echo     완료.
echo.

echo [4/5] 커밋 생성...
git commit -m "한화오션 4급 중급2 20과 레슨 추가"
echo.

echo [5/5] GitHub 푸시...
git push origin main
echo.

echo =====================================================
echo    배포 완료! 1~2분 후 아래 주소에서 확인하세요.
echo.
echo    https://elimg.com/HanwhaOcean_Level4_Lesson1.html
echo =====================================================
echo.
pause
