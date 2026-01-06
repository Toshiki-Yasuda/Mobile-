/**
 * 第4章: 練（レン）- ヨークシン編
 * ヨークシンシティでのオークションと旅団との対決をモチーフに
 */

import type { Word } from '@/types/game';

// ステージ4-1: ヨークシン登場キャラクター
export const stage4_1: Word[] = [
  { id: '4-1-1', display: 'クラピカ', hiragana: 'くらぴか', category: 'character', difficulty: 3 },
  { id: '4-1-2', display: 'センリツ', hiragana: 'せんりつ', category: 'character', difficulty: 3 },
  { id: '4-1-3', display: 'ネオン', hiragana: 'ねおん', category: 'character', difficulty: 2 },
  { id: '4-1-4', display: 'ゼパイル', hiragana: 'ぜぱいる', category: 'character', difficulty: 3 },
  { id: '4-1-5', display: 'ライト', hiragana: 'らいと', category: 'character', difficulty: 2 },
  { id: '4-1-6', display: 'イワレンコフ', hiragana: 'いわれんこふ', category: 'character', difficulty: 4 },
  { id: '4-1-7', display: 'スクワラ', hiragana: 'すくわら', category: 'character', difficulty: 3 },
  { id: '4-1-8', display: 'バショウ', hiragana: 'ばしょう', category: 'character', difficulty: 2 },
  { id: '4-1-9', display: 'シズク', hiragana: 'しずく', category: 'character', difficulty: 2 },
  { id: '4-1-10', display: 'ボノレノフ', hiragana: 'ぼのれのふ', category: 'character', difficulty: 4 },
];

// ステージ4-2: ヨークシン用語
export const stage4_2: Word[] = [
  { id: '4-2-1', display: 'ヨークシンシティ', hiragana: 'よーくしんしてぃ', category: 'location', difficulty: 4 },
  { id: '4-2-2', display: 'オークション', hiragana: 'おーくしょん', category: 'term', difficulty: 3 },
  { id: '4-2-3', display: 'マフィア', hiragana: 'まふぃあ', category: 'term', difficulty: 2 },
  { id: '4-2-4', display: 'シャドウビースト', hiragana: 'しゃどうびーすと', category: 'term', difficulty: 4 },
  { id: '4-2-5', display: 'じゅうろうとう', hiragana: 'じゅうろうとう', category: 'term', difficulty: 3 },
  { id: '4-2-6', display: 'さつじんいらい', hiragana: 'さつじんいらい', category: 'term', difficulty: 4 },
  { id: '4-2-7', display: 'ぞうひん', hiragana: 'ぞうひん', category: 'term', difficulty: 2 },
  { id: '4-2-8', display: 'さくひん', hiragana: 'さくひん', category: 'term', difficulty: 2 },
  { id: '4-2-9', display: 'ほうせき', hiragana: 'ほうせき', category: 'item', difficulty: 2 },
  { id: '4-2-10', display: 'おおがね', hiragana: 'おおがね', category: 'term', difficulty: 2 },
];

// ステージ4-3: クラピカの念能力
export const stage4_3: Word[] = [
  { id: '4-3-1', display: 'エンペラータイム', hiragana: 'えんぺらーたいむ', category: 'ability', difficulty: 5 },
  { id: '4-3-2', display: 'くさりのうでわ', hiragana: 'くさりのうでわ', category: 'ability', difficulty: 4 },
  { id: '4-3-3', display: 'ホーリーチェーン', hiragana: 'ほーりーちぇーん', category: 'ability', difficulty: 4 },
  { id: '4-3-4', display: 'チェーンジェイル', hiragana: 'ちぇーんじぇいる', category: 'ability', difficulty: 4 },
  { id: '4-3-5', display: 'ダウジングチェーン', hiragana: 'だうじんぐちぇーん', category: 'ability', difficulty: 5 },
  { id: '4-3-6', display: 'ジャッジメントチェーン', hiragana: 'じゃっじめんとちぇーん', category: 'ability', difficulty: 5 },
  { id: '4-3-7', display: 'ぐるたぞく', hiragana: 'ぐるたぞく', category: 'term', difficulty: 3 },
  { id: '4-3-8', display: 'ひのめ', hiragana: 'ひのめ', category: 'term', difficulty: 2 },
  { id: '4-3-9', display: 'ふっしゅう', hiragana: 'ふっしゅう', category: 'term', difficulty: 2 },
  { id: '4-3-10', display: 'せいやく', hiragana: 'せいやく', category: 'term', difficulty: 2 },
];

// ステージ4-4: 旅団との戦い
export const stage4_4: Word[] = [
  { id: '4-4-1', display: 'たいけつ', hiragana: 'たいけつ', category: 'term', difficulty: 2 },
  { id: '4-4-2', display: 'ひとじち', hiragana: 'ひとじち', category: 'term', difficulty: 2 },
  { id: '4-4-3', display: 'こうしょう', hiragana: 'こうしょう', category: 'term', difficulty: 3 },
  { id: '4-4-4', display: 'ひきかえ', hiragana: 'ひきかえ', category: 'term', difficulty: 2 },
  { id: '4-4-5', display: 'さいかい', hiragana: 'さいかい', category: 'term', difficulty: 2 },
  { id: '4-4-6', display: 'ついせき', hiragana: 'ついせき', category: 'action', difficulty: 2 },
  { id: '4-4-7', display: 'せんにゅう', hiragana: 'せんにゅう', category: 'action', difficulty: 3 },
  { id: '4-4-8', display: 'ほかく', hiragana: 'ほかく', category: 'action', difficulty: 2 },
  { id: '4-4-9', display: 'とうそう', hiragana: 'とうそう', category: 'action', difficulty: 2 },
  { id: '4-4-10', display: 'きゅうしゅつ', hiragana: 'きゅうしゅつ', category: 'action', difficulty: 3 },
];

// ステージ4-5: オークションアイテム
export const stage4_5: Word[] = [
  { id: '4-5-1', display: 'グリードアイランド', hiragana: 'ぐりーどあいらんど', category: 'item', difficulty: 5 },
  { id: '4-5-2', display: 'ひのたまのルビー', hiragana: 'ひのたまのるびー', category: 'item', difficulty: 4 },
  { id: '4-5-3', display: 'じんるいのいさん', hiragana: 'じんるいのいさん', category: 'term', difficulty: 4 },
  { id: '4-5-4', display: 'こだいのひほう', hiragana: 'こだいのひほう', category: 'item', difficulty: 3 },
  { id: '4-5-5', display: 'きぼうのかちは', hiragana: 'きぼうのかちは', category: 'phrase', difficulty: 4 },
  { id: '4-5-6', display: 'さいこうがく', hiragana: 'さいこうがく', category: 'term', difficulty: 3 },
  { id: '4-5-7', display: 'らくさつ', hiragana: 'らくさつ', category: 'term', difficulty: 2 },
  { id: '4-5-8', display: 'にゅうさつ', hiragana: 'にゅうさつ', category: 'term', difficulty: 2 },
  { id: '4-5-9', display: 'けいやく', hiragana: 'けいやく', category: 'term', difficulty: 2 },
  { id: '4-5-10', display: 'とりひき', hiragana: 'とりひき', category: 'term', difficulty: 2 },
];

// ステージ4-6: ボスステージ - クロロ戦
export const stage4_6: Word[] = [
  { id: '4-6-1', display: 'ぞくちょうとのたたかい', hiragana: 'ぞくちょうとのたたかい', category: 'phrase', difficulty: 5 },
  { id: '4-6-2', display: 'とくぼんむほん', hiragana: 'とくぼんむほん', category: 'ability', difficulty: 4 },
  { id: '4-6-3', display: 'ぜつぼうのふち', hiragana: 'ぜつぼうのふち', category: 'phrase', difficulty: 3 },
  { id: '4-6-4', display: 'さいごのひきふだ', hiragana: 'さいごのひきふだ', category: 'phrase', difficulty: 4 },
  { id: '4-6-5', display: 'きょうせいぜつ', hiragana: 'きょうせいぜつ', category: 'ability', difficulty: 4 },
  { id: '4-6-6', display: 'うらぎり', hiragana: 'うらぎり', category: 'term', difficulty: 2 },
  { id: '4-6-7', display: 'ごうりきのちから', hiragana: 'ごうりきのちから', category: 'phrase', difficulty: 4 },
  { id: '4-6-8', display: 'いじでもかつ', hiragana: 'いじでもかつ', category: 'phrase', difficulty: 3 },
  { id: '4-6-9', display: 'しょうりのかくしん', hiragana: 'しょうりのかくしん', category: 'phrase', difficulty: 4 },
  { id: '4-6-10', display: 'しめいをはたす', hiragana: 'しめいをはたす', category: 'phrase', difficulty: 4 },
];

// チャプター4の全ステージ
export const chapter4Stages = {
  '4-1': stage4_1,
  '4-2': stage4_2,
  '4-3': stage4_3,
  '4-4': stage4_4,
  '4-5': stage4_5,
  '4-6': stage4_6,
};

