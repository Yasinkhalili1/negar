@echo off
chcp 65001 >nul
title Negar Server
echo.
echo   ================================
echo     نگار - سرور محلی
echo   ================================
echo.
echo   سایت اینجا باز می‌شود:  http://127.0.0.1:9000
echo   برای خاموش کردن: Ctrl+C
echo.
start "" "http://127.0.0.1:9000"
python -m http.server 9000
pause