@echo off
title Crear App Restaurante
echo ===============================================
echo 🚀 CONVERTIDOR DE PROYECTO WEB A APP ANDROID
echo ===============================================
echo.

:: 1️⃣ Verificar Node y npm
echo 🧩 Verificando Node.js...
node -v >nul 2>&1 || (
    echo ❌ Node.js no está instalado. Instálalo desde https://nodejs.org
    pause
    exit /b
)

:: 2️⃣ Instalar Cordova
echo 🧩 Instalando Cordova...
npm install -g cordova

:: 3️⃣ Construir proyecto web
echo ⚙️ Generando versión optimizada de tu web...
npm run build

:: 4️⃣ Crear carpeta base para la app
echo 📦 Creando estructura de la app...
cordova create restaurante el.fundo.fastfood RestauranteApp
cd restaurante

:: 5️⃣ Agregar plataforma Android
echo 📱 Agregando plataforma Android...
cordova platform add android

:: 6️⃣ Copiar tu web dentro del proyecto Cordova
echo 📂 Copiando archivos de tu proyecto compilado...
xcopy "..\dist" "www" /E /H /Y >nul

:: 7️⃣ Compilar APK
echo 🏗️ Construyendo APK (puede tardar unos minutos)...
cordova build android

:: 8️⃣ Mostrar ruta del APK generado
echo ===============================================
echo ✅ COMPILACIÓN COMPLETA
echo 📍 Tu APK está aquí:
echo restaurante\platforms\android\app\build\outputs\apk\debug\app-debug.apk
echo ===============================================
pause
