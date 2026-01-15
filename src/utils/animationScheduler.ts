/**
 * アニメーション日程表（スケジューラ）
 * 複数のアニメーション・エフェクトのタイミングを一元管理
 *
 * 使用例：
 * const scheduler = new AnimationScheduler();
 * scheduler.schedule(0, () => playSound());
 * scheduler.schedule(300, () => showEffect());
 * scheduler.start();
 */

interface ScheduledTask {
  time: number;
  callback: () => void;
  id?: string;
}

interface ScheduleSequence {
  [key: string]: ScheduledTask;
}

export class AnimationScheduler {
  private tasks: ScheduledTask[] = [];
  private currentSequence: ScheduleSequence = {};
  private startTime: number = 0;
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;

  /**
   * タスクをスケジュールに追加
   * @param delayMs - ディレイ時間（ミリ秒）
   * @param callback - 実行するコールバック
   * @param id - タスクID（後での参照・キャンセル用）
   */
  schedule(delayMs: number, callback: () => void, id?: string): void {
    const task: ScheduledTask = {
      time: delayMs,
      callback,
      id,
    };

    this.tasks.push(task);
    // 時間でソート
    this.tasks.sort((a, b) => a.time - b.time);

    if (id) {
      this.currentSequence[id] = task;
    }
  }

  /**
   * 指定されたIDのタスクをキャンセル
   */
  cancel(id: string): boolean {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      this.tasks.splice(index, 1);
      delete this.currentSequence[id];
      return true;
    }
    return false;
  }

  /**
   * すべてのタスクをクリア
   */
  clear(): void {
    this.tasks = [];
    this.currentSequence = {};
    this.stop();
  }

  /**
   * スケジュール実行開始
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.startTime = performance.now();
    this.processNextFrame();
  }

  /**
   * スケジュール実行停止
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * フレーム処理
   */
  private processNextFrame(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now() - this.startTime;

    // 実行時刻に達したタスクを実行
    for (let i = this.tasks.length - 1; i >= 0; i--) {
      const task = this.tasks[i];
      if (currentTime >= task.time) {
        try {
          task.callback();
        } catch (error) {
          console.error('Animation task error:', error);
        }

        // タスクを実行済みリストから削除
        this.tasks.splice(i, 1);
        if (task.id) {
          delete this.currentSequence[task.id];
        }
      }
    }

    // タスクが残っていれば続行
    if (this.tasks.length > 0) {
      this.animationFrameId = requestAnimationFrame(() =>
        this.processNextFrame()
      );
    } else {
      this.isRunning = false;
    }
  }

  /**
   * 残りのタスク数を取得
   */
  getRemainingTaskCount(): number {
    return this.tasks.length;
  }

  /**
   * スケジュール内容を取得（デバッグ用）
   */
  getSchedule(): Array<{ time: number; id?: string }> {
    return this.tasks.map(task => ({
      time: task.time,
      id: task.id,
    }));
  }
}

/**
 * 一般的なゲーム演出用のプリセット
 */
export class GameEffectScheduler extends AnimationScheduler {
  /**
   * 単語完了演出シーケンス
   */
  scheduleWordComplete(callbacks: {
    sound?: () => void;
    shake?: () => void;
    explosion?: () => void;
    nextWord?: () => void;
  }): void {
    if (callbacks.sound) {
      this.schedule(0, callbacks.sound, 'wordComplete-sound');
    }
    if (callbacks.shake) {
      this.schedule(0, callbacks.shake, 'wordComplete-shake');
    }
    if (callbacks.explosion) {
      this.schedule(0, callbacks.explosion, 'wordComplete-explosion');
    }
    if (callbacks.nextWord) {
      this.schedule(300, callbacks.nextWord, 'wordComplete-nextWord');
    }
  }

  /**
   * コンボマイルストーン演出シーケンス
   */
  scheduleComboMilestone(callbacks: {
    start?: () => void;
    glow?: () => void;
    ripple?: () => void;
    text?: () => void;
    sound?: () => void;
    haptic?: () => void;
  }): void {
    if (callbacks.start) {
      this.schedule(0, callbacks.start, 'combo-start');
    }
    if (callbacks.glow) {
      this.schedule(0, callbacks.glow, 'combo-glow');
    }
    if (callbacks.ripple) {
      this.schedule(150, callbacks.ripple, 'combo-ripple');
    }
    if (callbacks.text) {
      this.schedule(300, callbacks.text, 'combo-text');
    }
    if (callbacks.sound) {
      this.schedule(300, callbacks.sound, 'combo-sound');
    }
    if (callbacks.haptic) {
      this.schedule(0, callbacks.haptic, 'combo-haptic');
    }
  }

  /**
   * 結果画面演出シーケンス
   */
  scheduleResultScreen(callbacks: {
    rankCard?: () => void;
    detailsPanel?: () => void;
    rankMessage?: () => void;
    score?: () => void;
    newRecord?: () => void;
    scoreDiff?: () => void;
    soundMain?: () => void;
    soundAchievement?: () => void;
  }): void {
    if (callbacks.rankCard) {
      this.schedule(0, callbacks.rankCard, 'result-rankCard');
    }
    if (callbacks.detailsPanel) {
      this.schedule(300, callbacks.detailsPanel, 'result-detailsPanel');
    }
    if (callbacks.rankMessage) {
      this.schedule(500, callbacks.rankMessage, 'result-rankMessage');
    }
    if (callbacks.score) {
      this.schedule(700, callbacks.score, 'result-score');
    }
    if (callbacks.newRecord) {
      this.schedule(800, callbacks.newRecord, 'result-newRecord');
    }
    if (callbacks.scoreDiff) {
      this.schedule(1000, callbacks.scoreDiff, 'result-scoreDiff');
    }
    if (callbacks.soundMain) {
      this.schedule(300, callbacks.soundMain, 'result-soundMain');
    }
    if (callbacks.soundAchievement) {
      this.schedule(400, callbacks.soundAchievement, 'result-soundAchievement');
    }
  }

  /**
   * ダメージ演出シーケンス
   */
  scheduleDamage(callbacks: {
    damageSound?: () => void;
    hapticDamage?: () => void;
    hpBar?: () => void;
    critical?: () => void;
  }): void {
    if (callbacks.damageSound) {
      this.schedule(0, callbacks.damageSound, 'damage-sound');
    }
    if (callbacks.hapticDamage) {
      this.schedule(0, callbacks.hapticDamage, 'damage-haptic');
    }
    if (callbacks.hpBar) {
      this.schedule(50, callbacks.hpBar, 'damage-hpBar');
    }
    if (callbacks.critical) {
      this.schedule(100, callbacks.critical, 'damage-critical');
    }
  }
}

/**
 * Reactホック用ファクトリー
 */
export function createGameEffectScheduler(): GameEffectScheduler {
  return new GameEffectScheduler();
}
