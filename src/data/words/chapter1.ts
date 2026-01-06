/**
 * 第1章: 念の基礎（ホームポジション編）
 * ハンター試験・一次試験をモチーフに
 */

import type { Word } from '@/types/game';

// ステージ1-1: 基本の母音
export const stage1_1: Word[] = [
  { id: '1-1-1', display: 'あ', hiragana: 'あ', category: 'term', difficulty: 1 },
  { id: '1-1-2', display: 'い', hiragana: 'い', category: 'term', difficulty: 1 },
  { id: '1-1-3', display: 'う', hiragana: 'う', category: 'term', difficulty: 1 },
  { id: '1-1-4', display: 'え', hiragana: 'え', category: 'term', difficulty: 1 },
  { id: '1-1-5', display: 'お', hiragana: 'お', category: 'term', difficulty: 1 },
  { id: '1-1-6', display: 'あい', hiragana: 'あい', category: 'term', difficulty: 1 },
  { id: '1-1-7', display: 'うえ', hiragana: 'うえ', category: 'term', difficulty: 1 },
  { id: '1-1-8', display: 'あお', hiragana: 'あお', category: 'term', difficulty: 1 },
  { id: '1-1-9', display: 'いえ', hiragana: 'いえ', category: 'term', difficulty: 1 },
  { id: '1-1-10', display: 'おい', hiragana: 'おい', category: 'term', difficulty: 1 },
];

// ステージ1-2: ホームポジション基礎
export const stage1_2: Word[] = [
  { id: '1-2-1', display: 'ゴン', hiragana: 'ごん', category: 'character', difficulty: 1 },
  { id: '1-2-2', display: 'かけ', hiragana: 'かけ', category: 'term', difficulty: 1 },
  { id: '1-2-3', display: 'さす', hiragana: 'さす', category: 'term', difficulty: 1 },
  { id: '1-2-4', display: 'はし', hiragana: 'はし', category: 'term', difficulty: 1 },
  { id: '1-2-5', display: 'きく', hiragana: 'きく', category: 'term', difficulty: 1 },
  { id: '1-2-6', display: 'すき', hiragana: 'すき', category: 'term', difficulty: 1 },
  { id: '1-2-7', display: 'かさ', hiragana: 'かさ', category: 'term', difficulty: 1 },
  { id: '1-2-8', display: 'しか', hiragana: 'しか', category: 'term', difficulty: 1 },
  { id: '1-2-9', display: 'あさ', hiragana: 'あさ', category: 'term', difficulty: 1 },
  { id: '1-2-10', display: 'かお', hiragana: 'かお', category: 'term', difficulty: 1 },
];

// ステージ1-3: キャラクター名（短め）
export const stage1_3: Word[] = [
  { id: '1-3-1', display: 'ゴン', hiragana: 'ごん', category: 'character', difficulty: 1 },
  { id: '1-3-2', display: 'ジン', hiragana: 'じん', category: 'character', difficulty: 1 },
  { id: '1-3-3', display: 'ミト', hiragana: 'みと', category: 'character', difficulty: 1 },
  { id: '1-3-4', display: 'カイト', hiragana: 'かいと', category: 'character', difficulty: 1 },
  { id: '1-3-5', display: 'サトツ', hiragana: 'さとつ', category: 'character', difficulty: 1 },
  { id: '1-3-6', display: 'メンチ', hiragana: 'めんち', category: 'character', difficulty: 1 },
  { id: '1-3-7', display: 'ブハラ', hiragana: 'ぶはら', category: 'character', difficulty: 1 },
  { id: '1-3-8', display: 'リッポー', hiragana: 'りっぽー', category: 'character', difficulty: 2 },
  { id: '1-3-9', display: 'トンパ', hiragana: 'とんぱ', category: 'character', difficulty: 1 },
  { id: '1-3-10', display: 'ハンゾー', hiragana: 'はんぞー', category: 'character', difficulty: 2 },
];

// ステージ1-4: 主要キャラクター
export const stage1_4: Word[] = [
  { id: '1-4-1', display: 'キルア', hiragana: 'きるあ', category: 'character', difficulty: 1 },
  { id: '1-4-2', display: 'クラピカ', hiragana: 'くらぴか', category: 'character', difficulty: 2 },
  { id: '1-4-3', display: 'レオリオ', hiragana: 'れおりお', category: 'character', difficulty: 2 },
  { id: '1-4-4', display: 'ヒソカ', hiragana: 'ひそか', category: 'character', difficulty: 1 },
  { id: '1-4-5', display: 'イルミ', hiragana: 'いるみ', category: 'character', difficulty: 1 },
  { id: '1-4-6', display: 'ネテロ', hiragana: 'ねてろ', category: 'character', difficulty: 1 },
  { id: '1-4-7', display: 'ポックル', hiragana: 'ぽっくる', category: 'character', difficulty: 2 },
  { id: '1-4-8', display: 'ポンズ', hiragana: 'ぽんず', category: 'character', difficulty: 1 },
  { id: '1-4-9', display: 'ボドロ', hiragana: 'ぼどろ', category: 'character', difficulty: 1 },
  { id: '1-4-10', display: 'ゲレタ', hiragana: 'げれた', category: 'character', difficulty: 1 },
];

// ステージ1-5: ハンター試験用語
export const stage1_5: Word[] = [
  { id: '1-5-1', display: 'ハンター', hiragana: 'はんたー', category: 'term', difficulty: 2 },
  { id: '1-5-2', display: 'しけん', hiragana: 'しけん', category: 'term', difficulty: 1 },
  { id: '1-5-3', display: 'ライセンス', hiragana: 'らいせんす', category: 'term', difficulty: 2 },
  { id: '1-5-4', display: 'しんさいん', hiragana: 'しんさいん', category: 'term', difficulty: 2 },
  { id: '1-5-5', display: 'さばいばる', hiragana: 'さばいばる', category: 'term', difficulty: 2 },
  { id: '1-5-6', display: 'トリック', hiragana: 'とりっく', category: 'term', difficulty: 2 },
  { id: '1-5-7', display: 'まらそん', hiragana: 'まらそん', category: 'term', difficulty: 2 },
  { id: '1-5-8', display: 'りょうり', hiragana: 'りょうり', category: 'term', difficulty: 2 },
  { id: '1-5-9', display: 'たいまん', hiragana: 'たいまん', category: 'term', difficulty: 2 },
  { id: '1-5-10', display: 'とうひょう', hiragana: 'とうひょう', category: 'term', difficulty: 2 },
];

// ステージ1-6: ボスステージ（複合）
export const stage1_6: Word[] = [
  { id: '1-6-1', display: 'くじらじま', hiragana: 'くじらじま', category: 'location', difficulty: 2 },
  { id: '1-6-2', display: 'ゾルディック', hiragana: 'ぞるでぃっく', category: 'term', difficulty: 3 },
  { id: '1-6-3', display: 'ハンターきょうかい', hiragana: 'はんたーきょうかい', category: 'term', difficulty: 3 },
  { id: '1-6-4', display: 'ぬまのぬし', hiragana: 'ぬまのぬし', category: 'term', difficulty: 2 },
  { id: '1-6-5', display: 'トリックタワー', hiragana: 'とりっくたわー', category: 'location', difficulty: 3 },
  { id: '1-6-6', display: 'ゼビルとう', hiragana: 'ぜびるとう', category: 'location', difficulty: 2 },
  { id: '1-6-7', display: 'プレート', hiragana: 'ぷれーと', category: 'item', difficulty: 2 },
  { id: '1-6-8', display: 'じゅけんばんごう', hiragana: 'じゅけんばんごう', category: 'term', difficulty: 3 },
  { id: '1-6-9', display: 'さいしゅうしけん', hiragana: 'さいしゅうしけん', category: 'term', difficulty: 3 },
  { id: '1-6-10', display: 'ごうかく', hiragana: 'ごうかく', category: 'term', difficulty: 2 },
];

// チャプター1の全ステージ
export const chapter1Stages = {
  '1-1': stage1_1,
  '1-2': stage1_2,
  '1-3': stage1_3,
  '1-4': stage1_4,
  '1-5': stage1_5,
  '1-6': stage1_6,
};
