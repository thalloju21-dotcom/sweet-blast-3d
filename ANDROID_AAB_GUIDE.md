# SWEET BLAST 3D — Complete Android `.aab` (Play Store Bundle) Guide

AI Studio runs inside a web browser container (Node.js only, without the 5 GB Google Android SDK / Java JDK). Because `.aab` files are binary Android packages compiled by Google's `gradle` + `aapt2` tools, we have pre-configured **3 automatic ways** inside this project so you can get your `.aab` file in minutes:

---

## విధానం 1: సాఫ్ట్‌వేర్ ఇన్‌స్టాల్ చేయకుండా ఉచితంగా క్లౌడ్‌లో `.aab` ఫైల్ డౌన్‌లోడ్ చేసుకోవడం (GitHub Actions — సులభమైన మార్గం)

మీ కంప్యూటర్‌లో Android Studio లేకపోయినా, ఈ ప్రాజెక్ట్‌లో మేము **`.github/workflows/build-aab.yml`** అనే ఆటోమేటిక్ బిల్డర్‌ని జత చేశాము:

1. AI Studio పైన ఉన్న **Download / Export ZIP** బటన్ నొక్కి ఈ ప్రాజెక్ట్‌ని డౌన్‌లోడ్ చేసుకోండి.
2. [github.com](https://github.com) లో ఒక కొత్త Repository క్రియేట్ చేసి, ఈ ZIP లోని ఫైల్స్ అన్నీ అందులో అప్‌లోడ్ (Push) చేయండి.
3. GitHub లో **Actions** ట్యాబ్ ఓపెన్ చేస్తే **"Build Android AAB & APK (Sweet Blast 3D)"** ఆటోమేటిక్‌గా రన్ అవుతుంది.
4. 2 నిమిషాల్లో బిల్డ్ పూర్తయ్యాక, కింద **Artifacts** లో **`Sweet-Blast-3D-PlayStore-AAB`** పై క్లిక్ చేస్తే మీ **Signed `.aab` ఫైల్** మరియు **`.apk` ఫైల్** నేరుగా డౌన్‌లోడ్ అవుతాయి!

---

## విధానం 2: మీ కంప్యూటర్‌లో 1-Click తో `.aab` తయారు చేయడం (`build-aab.bat`)

మీ కంప్యూటర్‌లో Node.js మరియు Android Studio (JDK) ఉంటే:

1. AI Studio నుండి డౌన్‌లోడ్ చేసిన ZIP ఫైల్‌ని Extract చేయండి.
2. అందులో ఉన్న **`build-aab.bat`** (Windows) లేదా **`./build-aab.sh`** (Mac/Linux) పై డబుల్-క్లిక్ చేయండి (లేదా టెర్మినల్‌లో `npm run android:aab` అని రన్ చేయండి).
3. ఇది ఆటోమేటిక్‌గా గేమ్ బిల్డ్ చేసి, మీ `.aab` ఫైల్‌ని ఈ ఫోల్డర్‌లో సేవ్ చేస్తుంది:
   ```
   android/app/build/outputs/bundle/release/app-release.aab
   ```

---

## విధానం 3: Android Studio లో నేరుగా Signed `.aab` తయారు చేయడం

1. ZIP ఫైల్ Extract చేసి టెర్మినల్‌లో ఈ కమాండ్స్ రన్ చేయండి:
   ```bash
   npm install
   npm run build:android
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap add android
   npx cap sync android
   npx cap open android
   ```
2. Android Studio ఓపెన్ అవుతుంది.
3. పైన మెనూలో **Build → Generate Signed App Bundle / APK → Android App Bundle (.aab)** సెలెక్ట్ చేసి **Next** నొక్కండి.
4. మీ `.aab` ఫైల్ Play Store కి అప్‌లోడ్ చేయడానికి సిద్ధంగా వస్తుంది!
