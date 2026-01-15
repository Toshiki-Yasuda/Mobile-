/**
 * デバイス検出ユーティリティ
 * モバイル/タブレット/デスクトップの判定と性能検出
 */

/**
 * デバイスタイプを判定
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const ua = navigator.userAgent;

  // iPad や Android タブレット
  if (/iPad|Android(?!.*Mobile)|Tablet|PlayBook|Silk/i.test(ua)) {
    return 'tablet';
  }

  // iPhone や Android スマートフォン
  if (/iPhone|Android.*Mobile|iPod|IEMobile|BlackBerry/i.test(ua)) {
    return 'mobile';
  }

  // デスクトップ/ノートパソコン
  return 'desktop';
};

/**
 * iPad かどうかを判定
 */
export const isIPad = (): boolean => {
  return /iPad/.test(navigator.userAgent) ||
         (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 4);
};

/**
 * 低性能デバイスかどうかを判定
 * iPad 5 以前、iPhone 6s 以前、古い Android など
 */
export const isLowPowerDevice = (): boolean => {
  const ua = navigator.userAgent;

  // iPhone 6s 以前 (iOS 12以前)
  if (/iPhone OS (1[012]|[89])/i.test(ua)) {
    return true;
  }

  // iPad 4, 5 (iPad 第4世代, iPad (第5世代))
  if (/iPad[234]/i.test(ua)) {
    return true;
  }

  // Android 4, 5
  if (/Android [45]/i.test(ua)) {
    return true;
  }

  // メモリが少ないデバイス
  if (navigator.deviceMemory && navigator.deviceMemory <= 2) {
    return true;
  }

  return false;
};

/**
 * アニメーション品質を取得
 */
export const getAnimationQuality = (): 'high' | 'medium' | 'low' => {
  const deviceType = getDeviceType();
  const isLowPower = isLowPowerDevice();

  if (isLowPower) {
    return 'low';
  }

  if (deviceType === 'mobile') {
    return 'medium';
  }

  if (deviceType === 'tablet') {
    return 'medium';
  }

  return 'high';  // desktop
};

/**
 * パーティクル数の上限を取得
 */
export const getParticleLimit = (): number => {
  const quality = getAnimationQuality();

  switch (quality) {
    case 'low':
      return 3;
    case 'medium':
      return 6;
    case 'high':
      return 12;
    default:
      return 6;
  }
};

/**
 * アニメーション有効化判定
 * 低性能デバイスでは複雑なアニメーションを無効化
 */
export const shouldEnableComplexAnimations = (): boolean => {
  return !isLowPowerDevice();
};

/**
 * 高フレームレートアニメーション有効化判定
 */
export const shouldEnableHighFramerateAnimation = (): boolean => {
  const quality = getAnimationQuality();
  return quality === 'high';
};

/**
 * システムが `prefers-reduced-motion` を指定しているか
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export default {
  getDeviceType,
  isIPad,
  isLowPowerDevice,
  getAnimationQuality,
  getParticleLimit,
  shouldEnableComplexAnimations,
  shouldEnableHighFramerateAnimation,
  prefersReducedMotion,
};
