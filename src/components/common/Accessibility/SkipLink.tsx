interface SkipLinkProps {
  /** スキップ先のID */
  targetId: string;
  /** リンクテキスト */
  children?: string;
}

/**
 * スキップリンクコンポーネント
 * キーボードユーザーがナビゲーションをスキップしてメインコンテンツに移動できる
 *
 * @example
 * <SkipLink targetId="main-content">メインコンテンツへスキップ</SkipLink>
 */
export const SkipLink = ({
  targetId,
  children = 'メインコンテンツへスキップ'
}: SkipLinkProps) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      // scrollIntoViewはjsdomでサポートされていない場合があるため、存在確認
      if (typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="skip-link"
    >
      {children}
    </a>
  );
};

export default SkipLink;
