/**
 * localStorage キー定義
 * 
 * すべてのlocalStorageアクセスはこのファイルのキーを使用すること
 */

export const STORAGE_KEYS = {
  /** 設定データ */
  SETTINGS: 'hxh-typing-settings',
  /** 進捗データ */
  PROGRESS: 'hxh-typing-progress',
  /** キャッシュバージョン */
  CACHE_VERSION: 'hxh-typing-cache-version',
  /** 最終プレイ日時 */
  LAST_PLAYED: 'hxh-typing-last-played',
} as const;

/** ストレージバージョン（マイグレーション用） */
export const STORAGE_VERSION = {
  SETTINGS: 1,
  PROGRESS: 1,
} as const;

/** キャッシュバージョン */
export const CACHE_VERSION = '1.0.0';
