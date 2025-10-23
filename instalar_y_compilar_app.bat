@echo off
title 🚀 Instalador Automático para Crear APK sin Android Studio
echo ===========================================================
echo EL FUNDO FAST FOOD - CONVERTIDOR AUTOMATICO
echo ===========================================================
echo.

:: Requiere Node.js y npm
echo 🧩 Verificando Node.js...
node -v >nul 2>&1 || (
    echo ❌ Node.js no está instalado. Instálalo desde https://nodejs.org
    pause
    exit /b
)

:: 1️⃣ Crear carpetas base
echo 📁 Creando carpetas...
mkdir C:\Android >nul 2>&1
mkdir C:\Android\cmdline-tools >nul 2>&1

:: 2️⃣ Descargar e instalar JDK Temurin 17
echo ☕ Instalando Java JDK (Temurin 17)...
powershell -Command "Invoke-WebRequest https://github.com/adoptium/temurin17-binaries/releases/latest/download/OpenJDK17U-jdk_x64_windows_hotspot.zip -OutFile C:\Android\jdk.zip"
powershell -Command "Expand-Archive C:\Android\jdk.zip -DestinationPath C:\Android\jdk >$null"
for /d %%i in (C:\Android\jdk\*) do set "JDKPATH=%%i"

setx JAVA_HOME "%JDKPATH%"
setx PATH "%PATH%;%JDKPATH%\bin"
echo ✅ JAVA_HOME configurado: %JDKPATH%

:: 3️⃣ Descargar Android SDK Command Line Tools
echo 📦 Descargando Android SDK Command Line Tools...
powershell -Command "Invoke-WebRequest https://dl.google.com/android/repository/commandlinetools-win-9477386_latest.zip -OutFile C:\Android\tools.zip"
powershell -Command "Expand-Archive C:\Android\tools.zip -DestinationPath C:\Android\cmdline-tools >$null"
mkdir C:\Android\cmdline-tools\latest >nul 2>&1
xcopy "C:\Android\cmdline-tools\cmdline-tools" "C:\Android\cmdline-tools\latest" /E /H /Y >nul

setx ANDROID_HOME "C:\Android"
setx PATH "%PATH%;C:\Android\cmdline-tools\latest\bin;C:\Android\platform-tools"
echo ✅ ANDROID_HOME configurado.

:: 4️⃣ Instalar herramientas necesarias
echo ⚙️ Instalando herramientas SDK...
call sdkmanager.bat "platform-tools" "platforms;android-33" "build-tools;33.0.2"

:: 5️⃣ Instalar Cordova
echo 🔧 Instalando Cordova globalmente...
npm install -g cordova

:: 6️⃣ Crear app Cordova si no existe
if not exist restaurante (
    echo 📂 Creando estructura de app...
    cordova create restaurante el.fundo.fastfood RestauranteApp
)

cd restaurante

:: 7️⃣ Agregar plataforma Android si falta
cordova platform ls | find "android" >nul 2>&1
if errorlevel 1 (
    echo 📱 Agregando plataforma Android...
    cordova platform add android
)

:: 8️⃣ Copiar tu proyecto web compilado
echo ⚙️ Copiando tu carpeta dist al proyecto Cordova...
if exist "..\dist" (
    xcopy "..\dist" "www" /E /H /Y >nul
) else (
    echo ❌ No se encontró carpeta 'dist'. Asegúrate de ejecutar 'npm run build' antes.
    pause
    exit /b
)

:: 9️⃣ Compilar APK
echo 🏗️ Compilando APK (esto puede demorar unos minutos)...
cordova build android

:: 🔟 Mostrar ubicación final
echo ===========================================================
echo ✅ APK GENERADO CON ÉXITO
echo 📍 Ubicación:
echo restaurante\platforms\android\app\build\outputs\apk\debug\app-debug.apk
echo ===========================================================
pause
