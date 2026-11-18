import { LanguageCode } from '../types/game';

export interface TranslationStrings {
  play: string;
  levels: string;
  shop: string;
  dailyBonus: string;
  settings: string;
  moves: string;
  score: string;
  target: string;
  level: string;
  victoryTitle: string;
  gameOverTitle: string;
  nextLevel: string;
  replay: string;
  retry: string;
  useExtraMoves: string;
  music: string;
  sound: string;
  vibration: string;
  language: string;
  resetProgress: string;
  confirmReset: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationStrings> = {
  en: {
    play: 'Play Level',
    levels: 'Kingdom Map',
    shop: 'Candy Shop',
    dailyBonus: 'Daily Gift',
    settings: 'Settings',
    moves: 'Moves',
    score: 'Score',
    target: 'Goal',
    level: 'Level',
    victoryTitle: 'Sweet Victory!',
    gameOverTitle: 'Out of Moves!',
    nextLevel: 'Next Level',
    replay: 'Replay',
    retry: 'Try Again',
    useExtraMoves: '+5 Extra Moves',
    music: 'Background Music',
    sound: 'Sound Effects',
    vibration: 'Haptic Vibration',
    language: 'Language',
    resetProgress: 'Reset All Progress',
    confirmReset: 'Confirm Reset?',
  },
  es: {
    play: 'Jugar Nivel',
    levels: 'Mapa Real',
    shop: 'Tienda Dulce',
    dailyBonus: 'Regalo Diario',
    settings: 'Ajustes',
    moves: 'Turnos',
    score: 'Puntos',
    target: 'Meta',
    level: 'Nivel',
    victoryTitle: '¡Dulce Victoria!',
    gameOverTitle: '¡Sin Movimientos!',
    nextLevel: 'Siguiente Nivel',
    replay: 'Repetir',
    retry: 'Reintentar',
    useExtraMoves: '+5 Movimientos',
    music: 'Música de Fondo',
    sound: 'Efectos de Sonido',
    vibration: 'Vibración Háptica',
    language: 'Idioma',
    resetProgress: 'Borrar Progreso',
    confirmReset: '¿Confirmar Borrado?',
  },
  fr: {
    play: 'Jouer Niveau',
    levels: 'Carte Royale',
    shop: 'Confiserie',
    dailyBonus: 'Cadeau du Jour',
    settings: 'Options',
    moves: 'Coups',
    score: 'Score',
    target: 'Objectif',
    level: 'Niveau',
    victoryTitle: 'Douce Victoire !',
    gameOverTitle: 'Plus de Coups !',
    nextLevel: 'Niveau Suivant',
    replay: 'Rejouer',
    retry: 'Réessayer',
    useExtraMoves: '+5 Coups Bonus',
    music: 'Musique',
    sound: 'Effets Sonores',
    vibration: 'Vibrations',
    language: 'Langue',
    resetProgress: 'Réinitialiser',
    confirmReset: 'Confirmer ?',
  },
  de: {
    play: 'Level Spielen',
    levels: 'Königskarte',
    shop: 'Bonbon-Laden',
    dailyBonus: 'Tagesbonus',
    settings: 'Optionen',
    moves: 'Züge',
    score: 'Punkte',
    target: 'Ziel',
    level: 'Level',
    victoryTitle: 'Süßer Sieg!',
    gameOverTitle: 'Keine Züge mehr!',
    nextLevel: 'Nächstes Level',
    replay: 'Nochmal',
    retry: 'Neuversuch',
    useExtraMoves: '+5 Extra-Züge',
    music: 'Hintergrundmusik',
    sound: 'Soundeffekte',
    vibration: 'Vibration',
    language: 'Sprache',
    resetProgress: 'Fortschritt löschen',
    confirmReset: 'Wirklich löschen?',
  },
  ja: {
    play: 'プレイ開始',
    levels: 'ワールドマップ',
    shop: 'キャンディショップ',
    dailyBonus: 'デイリーギフト',
    settings: '設定',
    moves: '残り手数',
    score: 'スコア',
    target: 'クリア目標',
    level: 'レベル',
    victoryTitle: 'スイートクリア！',
    gameOverTitle: '手数切れ！',
    nextLevel: '次のレベルへ',
    replay: 'もう一度',
    retry: 'リトライ',
    useExtraMoves: '+5手追加',
    music: 'BGM音楽',
    sound: '効果音',
    vibration: 'バイブレーション',
    language: '言語',
    resetProgress: 'データ初期化',
    confirmReset: '本当に初期化しますか？',
  },
  hi: {
    play: 'लेवल खेलें',
    levels: 'किंगडम मैप',
    shop: 'कैंडी शॉप',
    dailyBonus: 'दैनिक उपहार',
    settings: 'सेटिंग्स',
    moves: 'चालें',
    score: 'स्कोर',
    target: 'लक्ष्य',
    level: 'लेवल',
    victoryTitle: 'शानदार जीत!',
    gameOverTitle: 'चालें समाप्त!',
    nextLevel: 'अगला लेवल',
    replay: 'फिर से खेलें',
    retry: 'पुनः प्रयास करें',
    useExtraMoves: '+5 अतिरिक्त चालें',
    music: 'बैकग्राउंड संगीत',
    sound: 'ध्वनि प्रभाव',
    vibration: 'वाइब्रेशन',
    language: 'भाषा',
    resetProgress: 'प्रगति रीसेट करें',
    confirmReset: 'रीसेट की पुष्टि करें?',
  },
};
