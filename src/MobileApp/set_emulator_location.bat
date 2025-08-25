@echo off
REM Set Android emulator location to Sri Lankan cities
REM Usage: set_emulator_location.bat [city]
REM Cities: colombo, malabe, negombo, kandy, galle, ratnapura

set CITY=%1
if "%CITY%"=="" set CITY=colombo

if "%CITY%"=="colombo" (
    echo 🏙️ Setting location to Colombo, Sri Lanka...
    adb emu geo fix 79.8612 6.9271
    goto :success
)

if "%CITY%"=="malabe" (
    echo 🏫 Setting location to Malabe, Sri Lanka...
    adb emu geo fix 79.958 6.9056
    goto :success
)

if "%CITY%"=="negombo" (
    echo 🏖️ Setting location to Negombo, Sri Lanka...
    adb emu geo fix 79.8353 7.2083
    goto :success
)

if "%CITY%"=="kandy" (
    echo ⛰️ Setting location to Kandy, Sri Lanka...
    adb emu geo fix 80.6337 7.2966
    goto :success
)

if "%CITY%"=="galle" (
    echo 🏰 Setting location to Galle, Sri Lanka...
    adb emu geo fix 80.2170 6.0367
    goto :success
)

if "%CITY%"=="ratnapura" (
    echo 💎 Setting location to Ratnapura, Sri Lanka...
    adb emu geo fix 80.4037 6.6828
    goto :success
)

echo ❌ Unknown city: %CITY%
echo Available cities: colombo, malabe, negombo, kandy, galle, ratnapura
exit /b 1

:success
echo ✅ Location set to %CITY%
echo 📱 Open your app and check the coordinates!
pause
