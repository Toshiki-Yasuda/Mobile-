/**
 * ローマ字入力エンジンのエクスポート
 */

export {
  tokenizeHiragana,
  createInitialState,
  processKeyInput,
  getCurrentValidKeys,
  getDisplayRomaji,
  calculateProgress,
} from './romajiEngine';

export { ROMAJI_PATTERNS, SOKUON_CONSONANTS, N_REQUIRES_DOUBLE, N_SINGLE_OK_CONSONANTS } from './romajiPatterns';
