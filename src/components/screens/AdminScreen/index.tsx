/**
 * 管理者画面コンポーネント
 * 各章の解放状態を手動で管理できる
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';
import { useButtonClick } from '@/utils/soundUtils';

// チャプターデータ
const CHAPTERS = [
  { id: 1, name: '念の基礎', subtitle: 'ホームポジション編' },
  { id: 2, name: '纏（テン）', subtitle: '基本入力編' },
  { id: 3, name: '絶（ゼツ）', subtitle: '天空闘技場編' },
  { id: 4, name: '練（レン）', subtitle: 'ヨークシン編' },
  { id: 5, name: '発（ハツ）', subtitle: 'グリードアイランド編' },
  { id: 6, name: '極意', subtitle: 'キメラアント編' },
];

export const AdminScreen: React.FC = () => {
  const { navigateTo } = useGameStore();
  const { 
    unlockedChapters, 
    unlockChapter, 
    clearedStages,
    resetProgress 
  } = useProgressStore();
  const { handleClick } = useButtonClick();

  // 章をロック/アンロック
  const toggleChapter = (chapterId: number) => {
    if (unlockedChapters.includes(chapterId)) {
      // ロックする（第1章以外）
      if (chapterId !== 1) {
        // progressStoreにlockChapter関数がないので、直接stateを操作
        useProgressStore.setState(state => ({
          unlockedChapters: state.unlockedChapters.filter(id => id !== chapterId)
        }));
      }
    } else {
      // アンロックする
      unlockChapter(chapterId);
    }
  };

  // 全章を解放
  const unlockAll = () => {
    CHAPTERS.forEach(chapter => {
      unlockChapter(chapter.id);
    });
  };

  // 進捗をリセット（確認あり）
  const handleReset = () => {
    if (window.confirm('本当に進捗データをリセットしますか？\nすべてのクリア状況が消去されます。')) {
      resetProgress();
    }
  };

  // 各章のクリアしたステージ数を取得
  const getClearedCount = (chapterId: number) => {
    return Object.keys(clearedStages).filter(id => 
      id.startsWith(`${chapterId}-`)
    ).length;
  };

  return (
    <div className="screen-container relative overflow-hidden">
      {/* 背景デコレーション */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-red-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl" />
      </div>

      {/* ヘッダー */}
      <div className="relative z-10 w-full max-w-2xl mb-8">
        <button
          onClick={handleClick(() => navigateTo('title'))}
          className="text-pop-purple hover:text-accent transition-colors text-base mb-4 font-bold"
        >
          ← タイトルに戻る
        </button>
        <h1 className="text-3xl font-extrabold text-red-600 mb-2">🔧 管理者モード</h1>
        <p className="text-primary/60 text-sm">各章の解放状態を手動で管理できます</p>
      </div>

      {/* 章一覧 */}
      <div className="relative z-10 w-full max-w-2xl space-y-3 mb-8">
        {CHAPTERS.map((chapter, index) => {
          const isUnlocked = unlockedChapters.includes(chapter.id);
          const clearedCount = getClearedCount(chapter.id);

          return (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-4 border-2 border-pop-purple/20 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-pop-purple text-sm font-bold">第{chapter.id}章</span>
                  {isUnlocked ? (
                    <span className="text-green-500 text-xs bg-green-100 px-2 py-0.5 rounded-full">解放済み</span>
                  ) : (
                    <span className="text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded-full">ロック中</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-primary">{chapter.name}</h3>
                <p className="text-sm text-primary/60">{chapter.subtitle}</p>
                {clearedCount > 0 && (
                  <p className="text-xs text-pop-purple mt-1">クリア済み: {clearedCount}/6 ステージ</p>
                )}
              </div>

              <button
                onClick={() => toggleChapter(chapter.id)}
                disabled={chapter.id === 1}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  chapter.id === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isUnlocked
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                }`}
              >
                {chapter.id === 1 ? '🔓 常に解放' : isUnlocked ? '🔒 ロックする' : '🔓 解放する'}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* アクションボタン */}
      <div className="relative z-10 w-full max-w-2xl space-y-3">
        <motion.button
          onClick={handleClick(unlockAll)}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          🔓 全章を解放
        </motion.button>

        <motion.button
          onClick={handleClick(handleReset)}
          className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          🗑️ 進捗をリセット
        </motion.button>
      </div>

      {/* 警告 */}
      <div className="relative z-10 mt-8 text-center text-red-500/60 text-xs">
        ⚠️ この画面での変更は即座に反映されます
      </div>
    </div>
  );
};

export default AdminScreen;

