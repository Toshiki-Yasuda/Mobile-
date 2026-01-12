import { useEffect, useState } from 'react';

interface LiveRegionProps {
  /** アナウンスするメッセージ */
  message: string;
  /** 優先度: polite（礼儀正しく待機）/ assertive（即座に割り込み） */
  priority?: 'polite' | 'assertive';
  /** アナウンス後にメッセージをクリアするまでの時間（ms） */
  clearAfter?: number;
  /** 同じメッセージの再アナウンスを許可 */
  allowDuplicates?: boolean;
}

/**
 * スクリーンリーダー用ライブリージョン
 * 動的なコンテンツ変更をスクリーンリーダーにアナウンス
 *
 * @example
 * // 正解時のアナウンス
 * <LiveRegion message="正解！次の単語です" priority="assertive" />
 *
 * // スコア更新のアナウンス
 * <LiveRegion message={`スコア: ${score}点`} priority="polite" />
 */
export const LiveRegion = ({
  message,
  priority = 'polite',
  clearAfter = 1000,
  allowDuplicates = false
}: LiveRegionProps) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [lastMessage, setLastMessage] = useState('');

  useEffect(() => {
    if (!message) return;

    // 重複メッセージのスキップ（allowDuplicatesがfalseの場合）
    if (!allowDuplicates && message === lastMessage) return;

    // メッセージを設定（一度クリアしてから再設定することで確実にアナウンス）
    setCurrentMessage('');

    const setTimer = setTimeout(() => {
      setCurrentMessage(message);
      setLastMessage(message);
    }, 50);

    // 指定時間後にクリア
    const clearTimer = setTimeout(() => {
      setCurrentMessage('');
    }, clearAfter);

    return () => {
      clearTimeout(setTimer);
      clearTimeout(clearTimer);
    };
  }, [message, clearAfter, allowDuplicates, lastMessage]);

  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {currentMessage}
    </div>
  );
};

export default LiveRegion;
