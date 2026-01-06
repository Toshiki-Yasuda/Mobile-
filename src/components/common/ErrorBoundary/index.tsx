/**
 * エラーバウンダリコンポーネント
 * 子コンポーネントのエラーをキャッチして表示
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="screen-container bg-hunter-dark">
          <div className="card max-w-md text-center">
            {/* エラーアイコン */}
            <div className="text-6xl mb-4">😵</div>

            {/* タイトル */}
            <h1 className="text-2xl font-bold text-error mb-2">
              エラーが発生しました
            </h1>

            {/* メッセージ */}
            <p className="text-white/60 mb-6">
              予期せぬエラーが発生しました。
              <br />
              もう一度お試しください。
            </p>

            {/* エラー詳細（開発時のみ表示） */}
            {import.meta.env.MODE === 'development' && this.state.error && (
              <div className="bg-hunter-dark rounded-lg p-4 mb-6 text-left">
                <p className="text-error text-sm font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* ボタン */}
            <div className="flex gap-4 justify-center">
              <button onClick={this.handleRetry} className="btn-primary">
                再試行
              </button>
              <button onClick={this.handleReload} className="btn-ghost">
                ページを再読み込み
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
