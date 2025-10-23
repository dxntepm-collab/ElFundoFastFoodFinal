#!/bin/bash
echo "🧹 LIMPIANDO PROYECTO Y RESTOS DE CAPACITOR..."
rm -rf android ios dist node_modules capacitor.config.* www
npm uninstall @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios 2>/dev/null

echo "📦 INSTALANDO DEPENDENCIAS..."
npm install

echo "🧠 CREANDO CONFIGURACIÓN DE VITE PARA CORDOVA..."
cat > vite.config.ts <<'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
plugins: [react()],
base: './', // rutas relativas
build: {
outDir: 'www' // Cordova usa "www"
}
})
EOF

echo "🧩 ACTUALIZANDO config.xml..."
mkdir -p restaurante
cat > restaurante/config.xml <<'EOF'

<?xml version='1.0' encoding='utf-8'?>

<widget id="com.elfundofastfood.app"
     version="1.0.0"
     xmlns="http://www.w3.org/ns/widgets"
     xmlns:cdv="http://cordova.apache.org/ns/1.0">

```
<name>El Fundo Fast Food</name>
<description>Gestión interna del restaurante El Fundo Fast Food</description>
<author email="admin@elfundofastfood.local">DXNTE</author>

<content src="index.html" />

<access origin="*" />
<allow-navigation href="*" />
<allow-intent href="*" />

<platform name="android">
    <icon src="logo.png" density="mdpi" />
    <icon src="logo.png" density="hdpi" />
    <icon src="logo.png" density="xhdpi" />
    <icon src="logo.png" density="xxhdpi" />
    <icon src="logo.png" density="xxxhdpi" />
</platform>

<platform name="ios">
    <icon src="logo.png" width="180" height="180" />
    <allow-intent href="itms:*" />
    <allow-intent href="itms-apps:*" />
</platform>

<preference name="ScrollEnabled" value="false" />
<preference name="Orientation" value="portrait" />
<preference name="BackgroundColor" value="0xffffffff" />
<preference name="SplashMaintainAspectRatio" value="true" />
```

</widget>
EOF

echo "🧠 AJUSTANDO INDEX.HTML A RUTAS RELATIVAS..."
if grep -q 'src="/src/main.tsx"' index.html; then
sed -i 's|src="/src/main.tsx"|src="./src/main.tsx"|g' index.html
fi
if grep -q 'href="/assets' index.html; then
sed -i 's|href="/assets|href="./assets|g' index.html
fi

echo "🏗️ CONSTRUYENDO APP PARA CORDOVA..."
npm run build

echo "🔧 AGREGANDO Y COMPILANDO ANDROID..."
cordova platform remove android 2>/dev/null
cordova platform add android
cordova build android

echo "✅ TODO LISTO!"
echo "APK generada en: platforms/android/app/build/outputs/apk/debug/app-debug.apk"
