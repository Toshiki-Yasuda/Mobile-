/**
 * タイプライターモード: 入力がひらがなと一致するか検証
 * romajiEngineを使って1文字ずつ処理し、最後まで正しく処理できれば正解
 */
import { createInitialState, processKeyInput } from '@/engine/romajiEngine';
import type { TypingState } from '@/types/romaji';

export function validateTypewriterInput(input: string, hiragana: string): boolean {
  if (!input || !hiragana) return false;

  let state: TypingState = createInitialState(hiragana);

  for (const char of input.toLowerCase()) {
    const result = processKeyInput(state, char);

    if (result.isMiss || !result.isValid) {
      return false;
    }

    state = result.newState;
  }

  return state.isComplete;
}
