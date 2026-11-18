#!/usr/bin/env bash
set -e

echo "========================================================"
echo "  SWEET BLAST 3D - Automated Android AAB Builder"
echo "========================================================"
echo ""

echo "[1/4] Installing dependencies..."
npm install

echo "[2/4] Building production game bundle (dist/)..."
npm run build:android

echo "[3/4] Setting up Capacitor Android platform..."
npm install @capacitor/core @capacitor/cli @capacitor/android --no-save
if [ ! -d "android" ]; then
  npx cap add android
fi
npx cap sync android

echo "[4/4] Building Android App Bundle (.aab)..."
cd android
chmod +x gradlew
./gradlew bundleRelease
cd ..

echo ""
echo "========================================================"
echo "  SUCCESS! Your AAB file is ready at:"
echo "  android/app/build/outputs/bundle/release/app-release.aab"
echo "========================================================"
