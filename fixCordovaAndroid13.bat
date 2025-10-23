@echo off
title Reparador Cordova Android 13 - El Fundo Fast Food
color 0a
setlocal

echo ==========================================
echo   🧹 LIMPIANDO PROYECTO (platforms/www/plugins)...
echo ==========================================
if exist platforms rmdir /s /q platforms
if exist plugins rmdir /s /q plugins
if exist www rmdir /s /q www
echo Limpieza completada.

echo ==========================================
echo   📦 INSTALANDO DEPENDENCIAS...
echo ==========================================
npm install
if %errorlevel% neq 0 (
  echo Error en npm install. Revisa tu npm/node.
  pause
  exit /b 1
)

echo ==========================================
echo   🔧 CREANDO/ACTUALIZANDO vite.config.ts
echo ==========================================
>vite.config.ts (
  echo import { defineConfig } from 'vite'
  echo import react from '@vitejs/plugin-react-swc'
  echo import path from 'path'
  echo.
  echo export default defineConfig({
  echo   plugins: [react()],
  echo   base: './',
  echo   build: { outDir: 'www' },
  echo   resolve: {
  echo     alias: { '@': path.resolve(__dirname, './src') }
  echo   }
  echo })
)

echo ==========================================
echo   🔧 ASEGURANDO INDEX.HTML con rutas relativas...
echo ==========================================
if exist index.html (
  powershell -Command "(Get-Content index.html) -replace 'src=\"/','src=\"./' | Set-Content index.html"
  powershell -Command "(Get-Content index.html) -replace 'href=\"/','href=\"./' | Set-Content index.html"
)

echo ==========================================
echo   🔧 MOVER config.xml a la RAIZ si esta en restaurant...
echo ==========================================
if exist restaurante\config.xml (
  echo Moviendo restaurante\config.xml a .\config.xml
  move /Y restaurante\config.xml . >nul
)

echo ==========================================
echo   📦 INSTALANDO cordova-android@13.0.0...
echo ==========================================
npm uninstall cordova-android -D 2>nul
npm install cordova-android@13.0.0 --save-dev
if %errorlevel% neq 0 (
  echo Error instalando cordova-android@13.0.0
  pause
  exit /b 1
)

echo ==========================================
echo   🏗️ AGREGANDO PLATAFORMA ANDROID...
echo ==========================================
cordova platform add android@13.0.0
if %errorlevel% neq 0 (
  echo Error agregando platform android.
  echo Intentando forzar creacion...
  cordova platform add android@13.0.0 -- --template
)

echo ==========================================
echo   🔍 VERIFICANDO Api.js...
echo ==========================================
if not exist "platforms\android\cordova\Api.js" (
  echo ⚠️ Api.js no encontrado. Creando parche temporal...
  md platforms\android\cordova 2>nul
  echo module.exports = require('cordova-common').CordovaError;>"platforms\android\cordova\Api.js"
) else (
  echo ✅ Api.js existe.
)

echo ==========================================
echo   🚀 BUILD (Vite -> Cordova)...
echo ==========================================
npm run build
if %errorlevel% neq 0 (
  echo Error: npm run build falló. Ver salida anterior.
  pause
  exit /b 1
)

echo ==========================================
echo   🚧 Copiando www y compilando Android...
echo ==========================================
cordova platform remove android 2>nul
cordova platform add android@13.0.0
cordova build android
if %errorlevel% neq 0 (
  echo ❌ Error al compilar con Cordova.
  echo Revisa la salida arriba para el error.
  pause
  exit /b 1
)

echo ==========================================
echo   ✅ BUILD COMPLETADO
echo ==========================================
echo APK en: platforms\android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Presiona una tecla para cerrar...
pause >nul
endlocal
