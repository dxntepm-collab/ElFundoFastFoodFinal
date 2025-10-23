@echo off
title 🧱 Generador APK - Modo Debug
echo ==========================================
echo     🧩 Creando APK para Android
echo ==========================================
echo.

:: ===== CONFIGURAR RUTAS =====
set JAVA_HOME=C:\Program Files\Java\jdk-24
set ANDROID_HOME=C:\Android
set GRADLE_HOME=C:\Gradle\gradle-9.1.0
set PROJECT_DIR=C:\Users\DXNTE\Desktop\El Fundo Fast Food\restaurante
set DIST_DIR=C:\Users\DXNTE\Desktop\El Fundo Fast Food\dist

set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\cmdline-tools\latest\bin;%ANDROID_HOME%\platform-tools;%GRADLE_HOME%\bin;%PATH%
set CORDOVA_PATH=C:\Users\DXNTE\AppData\Roaming\npm
set PATH=%PATH%;%CORDOVA_PATH%

echo 🔍 Verificando configuraciones...
echo JAVA_HOME    = %JAVA_HOME%
echo ANDROID_HOME = %ANDROID_HOME%
echo GRADLE_HOME  = %GRADLE_HOME%
echo PROYECTO     = %PROJECT_DIR%
echo.

:: ===== VERIFICAR VERSIONES =====
echo Comprobando Java...
java -version || echo ⚠️ Java no detectado
echo ------------------------------------------
echo Comprobando Gradle...
gradle -v || echo ⚠️ Gradle no detectado
echo ------------------------------------------
echo Comprobando Android SDK...
sdkmanager --version || echo ⚠️ SDK no detectado
echo ------------------------------------------
pause

:: ===== COPIAR ARCHIVOS =====
echo 📂 Copiando dist -> www ...
if not exist "%DIST_DIR%" (
    echo ❌ No se encontro DIST en: %DIST_DIR%
    pause
    exit /b
)
if not exist "%PROJECT_DIR%\www" mkdir "%PROJECT_DIR%\www"
xcopy "%DIST_DIR%\*" "%PROJECT_DIR%\www" /E /H /Y
echo ✅ Archivos copiados.
echo ------------------------------------------
pause

:: ===== COMPILAR =====
cd /d "%PROJECT_DIR%"
if not exist config.xml (
    echo ❌ No se encontro config.xml en %PROJECT_DIR%
    pause
    exit /b
)

echo 🚀 Compilando APK...
"%CORDOVA_PATH%\cordova.cmd" build android

echo ------------------------------------------
echo ✅ Si no aparece ningun error arriba, el APK esta en:
echo %PROJECT_DIR%\platforms\android\app\build\outputs\apk\debug\app-debug.apk
echo ------------------------------------------
pause
