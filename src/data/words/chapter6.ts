/**
 * 第6章: 極意 - キメラアント編
 * キメラアント編の激闘をモチーフに
 */

import type { Word } from '@/types/game';

// ステージ6-1: キメラアントキャラクター
export const stage6_1: Word[] = [
  { id: '6-1-1', display: 'メルエム', hiragana: 'めるえむ', category: 'character', difficulty: 3 },
  { id: '6-1-2', display: 'ネフェルピトー', hiragana: 'ねふぇるぴとー', category: 'character', difficulty: 4 },
  { id: '6-1-3', display: 'シャウアプフ', hiragana: 'しゃうあぷふ', category: 'character', difficulty: 4 },
  { id: '6-1-4', display: 'モントゥトゥユピー', hiragana: 'もんとぅとぅゆぴー', category: 'character', difficulty: 5 },
  { id: '6-1-5', display: 'コムギ', hiragana: 'こむぎ', category: 'character', difficulty: 2 },
  { id: '6-1-6', display: 'ネテロ', hiragana: 'ねてろ', category: 'character', difficulty: 3 },
  { id: '6-1-7', display: 'ノヴ', hiragana: 'のぶ', category: 'character', difficulty: 2 },
  { id: '6-1-8', display: 'モラウ', hiragana: 'もらう', category: 'character', difficulty: 2 },
  { id: '6-1-9', display: 'ナックル', hiragana: 'なっくる', category: 'character', difficulty: 3 },
  { id: '6-1-10', display: 'シュート', hiragana: 'しゅーと', category: 'character', difficulty: 2 },
];

// ステージ6-2: キメラアント用語
export const stage6_2: Word[] = [
  { id: '6-2-1', display: 'キメラアント', hiragana: 'きめらあんと', category: 'term', difficulty: 4 },
  { id: '6-2-2', display: 'じょうおうあり', hiragana: 'じょうおうあり', category: 'term', difficulty: 3 },
  { id: '6-2-3', display: 'おう', hiragana: 'おう', category: 'term', difficulty: 1 },
  { id: '6-2-4', display: 'ごえいぐんだん', hiragana: 'ごえいぐんだん', category: 'term', difficulty: 4 },
  { id: '6-2-5', display: 'へいたいあり', hiragana: 'へいたいあり', category: 'term', difficulty: 3 },
  { id: '6-2-6', display: 'たべる', hiragana: 'たべる', category: 'action', difficulty: 2 },
  { id: '6-2-7', display: 'しんか', hiragana: 'しんか', category: 'term', difficulty: 2 },
  { id: '6-2-8', display: 'にんげん', hiragana: 'にんげん', category: 'term', difficulty: 2 },
  { id: '6-2-9', display: 'きおく', hiragana: 'きおく', category: 'term', difficulty: 2 },
  { id: '6-2-10', display: 'こころ', hiragana: 'こころ', category: 'term', difficulty: 2 },
];

// ステージ6-3: 討伐隊メンバー念能力
export const stage6_3: Word[] = [
  { id: '6-3-1', display: 'ひゃくしきかんのん', hiragana: 'ひゃくしきかんのん', category: 'ability', difficulty: 5 },
  { id: '6-3-2', display: 'きっかのせいやく', hiragana: 'きっかのせいやく', category: 'ability', difficulty: 4 },
  { id: '6-3-3', display: 'ディープパープル', hiragana: 'でぃーぷぱーぷる', category: 'ability', difficulty: 4 },
  { id: '6-3-4', display: 'ハコワレ', hiragana: 'はこわれ', category: 'ability', difficulty: 3 },
  { id: '6-3-5', display: 'スクリームインセイン', hiragana: 'すくりーむいんせいん', category: 'ability', difficulty: 5 },
  { id: '6-3-6', display: 'マンションあんこく', hiragana: 'まんしょんあんこく', category: 'ability', difficulty: 5 },
  { id: '6-3-7', display: 'ホテルラフレシア', hiragana: 'ほてるらふれしあ', category: 'ability', difficulty: 5 },
  { id: '6-3-8', display: 'きゅうはんせいきの', hiragana: 'きゅうはんせいきの', category: 'ability', difficulty: 5 },
  { id: '6-3-9', display: 'いくらでもくる', hiragana: 'いくらでもくる', category: 'phrase', difficulty: 4 },
  { id: '6-3-10', display: 'ポットクリン', hiragana: 'ぽっとくりん', category: 'ability', difficulty: 4 },
];

// ステージ6-4: 宮殿攻略
export const stage6_4: Word[] = [
  { id: '6-4-1', display: 'きゅうでんとつにゅう', hiragana: 'きゅうでんとつにゅう', category: 'phrase', difficulty: 5 },
  { id: '6-4-2', display: 'さくせんかいし', hiragana: 'さくせんかいし', category: 'phrase', difficulty: 3 },
  { id: '6-4-3', display: 'ぶんだん', hiragana: 'ぶんだん', category: 'action', difficulty: 2 },
  { id: '6-4-4', display: 'とうばつ', hiragana: 'とうばつ', category: 'action', difficulty: 2 },
  { id: '6-4-5', display: 'せんとう', hiragana: 'せんとう', category: 'term', difficulty: 2 },
  { id: '6-4-6', display: 'ぎせい', hiragana: 'ぎせい', category: 'term', difficulty: 2 },
  { id: '6-4-7', display: 'いのち', hiragana: 'いのち', category: 'term', difficulty: 2 },
  { id: '6-4-8', display: 'まもる', hiragana: 'まもる', category: 'action', difficulty: 2 },
  { id: '6-4-9', display: 'にんげんのちから', hiragana: 'にんげんのちから', category: 'phrase', difficulty: 4 },
  { id: '6-4-10', display: 'しょうりのために', hiragana: 'しょうりのために', category: 'phrase', difficulty: 4 },
];

// ステージ6-5: ゴンの成長
export const stage6_5: Word[] = [
  { id: '6-5-1', display: 'せいちょう', hiragana: 'せいちょう', category: 'term', difficulty: 2 },
  { id: '6-5-2', display: 'おおひとゴン', hiragana: 'おおひとごん', category: 'term', difficulty: 3 },
  { id: '6-5-3', display: 'いかり', hiragana: 'いかり', category: 'term', difficulty: 2 },
  { id: '6-5-4', display: 'かなしみ', hiragana: 'かなしみ', category: 'term', difficulty: 2 },
  { id: '6-5-5', display: 'やくそく', hiragana: 'やくそく', category: 'term', difficulty: 2 },
  { id: '6-5-6', display: 'カイトをすくう', hiragana: 'かいとをすくう', category: 'phrase', difficulty: 4 },
  { id: '6-5-7', display: 'ぜんりょくのいちげき', hiragana: 'ぜんりょくのいちげき', category: 'phrase', difficulty: 5 },
  { id: '6-5-8', display: 'だいけん', hiragana: 'だいけん', category: 'term', difficulty: 2 },
  { id: '6-5-9', display: 'ともだち', hiragana: 'ともだち', category: 'term', difficulty: 2 },
  { id: '6-5-10', display: 'ぜったいにゆるさない', hiragana: 'ぜったいにゆるさない', category: 'phrase', difficulty: 5 },
];

// ステージ6-6: ボスステージ - 最終決戦
export const stage6_6: Word[] = [
  { id: '6-6-1', display: 'さいごのたたかい', hiragana: 'さいごのたたかい', category: 'phrase', difficulty: 4 },
  { id: '6-6-2', display: 'ネテロのかくご', hiragana: 'ねてろのかくご', category: 'phrase', difficulty: 4 },
  { id: '6-6-3', display: 'にんげんのあくい', hiragana: 'にんげんのあくい', category: 'phrase', difficulty: 4 },
  { id: '6-6-4', display: 'ミニチュアローズ', hiragana: 'みにちゅあろーず', category: 'ability', difficulty: 4 },
  { id: '6-6-5', display: 'きぼうとぜつぼう', hiragana: 'きぼうとぜつぼう', category: 'phrase', difficulty: 4 },
  { id: '6-6-6', display: 'こむぎとのさいご', hiragana: 'こむぎとのさいご', category: 'phrase', difficulty: 4 },
  { id: '6-6-7', display: 'あいとは', hiragana: 'あいとは', category: 'phrase', difficulty: 2 },
  { id: '6-6-8', display: 'ぐんぎ', hiragana: 'ぐんぎ', category: 'term', difficulty: 2 },
  { id: '6-6-9', display: 'ゴンとのさいかい', hiragana: 'ごんとのさいかい', category: 'phrase', difficulty: 4 },
  { id: '6-6-10', display: 'つぎのぼうけんへ', hiragana: 'つぎのぼうけんへ', category: 'phrase', difficulty: 4 },
];

// チャプター6の全ステージ
export const chapter6Stages = {
  '6-1': stage6_1,
  '6-2': stage6_2,
  '6-3': stage6_3,
  '6-4': stage6_4,
  '6-5': stage6_5,
  '6-6': stage6_6,
};


