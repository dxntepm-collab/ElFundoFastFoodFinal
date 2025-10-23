@echo off
title Generador APK - El Fundo Fast Food
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

echo JAVA_HOME    = %JAVA_HOME%
echo ANDROID_HOME = %ANDROID_HOME%
echo GRADLE_HOME  = %GRADLE_HOME%
echo PROYECTO     = %PROJECT_DIR%
echo.
echo Verificando herramientas...
echo.

:: ===== VERIFICAR VERSIONES =====
java -version
if %errorlevel% neq 0 (
    echo ❌ Java no detectado. Instala el JDK 24.
    pause
    exit /b
)

gradle -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Gradle no detectado. Revisa la carpeta C:\Gradle\gradle-9.1.0\bin
    pause
    exit /b
)

sdkmanager --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Android SDK no detectado. Revisa la carpeta C:\Android
    pause
    exit /b
)

echo ✅ Todo correcto.
echo.

:: ===== COPIAR BUILD DE DIST A WWW =====
echo 📂 Copiando archivos de dist/ a www/ ...
if not exist "%DIST_DIR%" (
    echo ❌ No se encontro la carpeta DIST. Asegurate de haber ejecutado npm run build.
    pause
    exit /b
)
if not exist "%PROJECT_DIR%\www" mkdir "%PROJECT_DIR%\www"
xcopy "%DIST_DIR%\*" "%PROJECT_DIR%\www" /E /H /Y >nul
echo ✅ Archivos copiados correctamente.
echo.

:: ===== COMPILAR CORDOVA =====
cd /d "%PROJECT_DIR%"
if not exist config.xml (
    echo ❌ No se encontro config.xml, este no es un proyecto Cordova valido.
    pause
    exit /b
)

echo 🚀 Compilando APK...
cordova build android

if %errorlevel% neq 0 (
    echo ❌ Error al construir el APK.
    pause
    exit /b
)

echo.
echo ✅ APK generado correctamente.
echo 📂 Ubicacion:
echo %PROJECT_DIR%\platforms\android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
