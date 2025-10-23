@echo off
title Compilador APK - ElFundoFastFoodFinal
echo =============================================
echo   🧱 Compilando APK con Java 17 y Gradle
echo =============================================
echo.

REM === CONFIGURA TU JAVA 17 - ajusta si tu ruta es distinta ===
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"

REM === IR A LA CARPETA ANDROID DEL PROYECTO ===
cd /d "%~dp0android"

echo Limpiando compilaciones anteriores...
gradlew clean

echo.
echo Iniciando compilación Debug...
gradlew assembleDebug

IF EXIST "app\build\outputs\apk\debug\app-debug.apk" (
    echo.
    echo ✅ ¡Compilación completada con éxito!
    echo 📦 APK generado en:
    echo %CD%\app\build\outputs\apk\debug\app-debug.apk
) ELSE (
    echo.
    echo ❌ Error: no se generó el APK.
    echo Revisa los errores anteriores.
)

pause
