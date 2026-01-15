# Performance Optimization Plan - iPad Jank Fix

**Priority**: HIGH
**Severity**: Users reporting jank/lag on iPad
**Date**: 2026-01-15

---

## Problem Summary

iPad users experience choppy/laggy gameplay during typing. Root cause: **40-50+ DOM elements animating concurrently** without throttling or optimization.

### Performance Bottlenecks Ranked

| Component | Issue | Type | Impact |
|-----------|-------|------|--------|
| **NenAura.tsx** | Continuous floating particles | 🔴 CRITICAL | Always animating (max 10 particles) |
| **HPBar.tsx** | Continuous pulsing when critical | 🔴 CRITICAL | 0.5s animation cycle = high refresh |
| **TypingCard.tsx** | 26+ simultaneous animations per word | 🟠 HIGH | Burst animation on completion |
| **CardDestruction.tsx** | 7-13 particle explosions | 🟠 HIGH | Stacks on top of TypingCard |
| **TypingCard cursor** | Continuous blinking | 🟡 MEDIUM | Constant `repeat: Infinity` |
| **ScreenShake.tsx** | Event-triggered shake | 🟢 OK | Properly implemented |
| **ScreenFlash.tsx** | Temporary flash effects | 🟢 OK | Properly cleaned up |

---

## Solution Strategy

### Tier 1: Immediate Fixes (High Impact, Low Risk)
These fixes remove unnecessary continuous animations.

#### 1.1 **Disable NenAura Particles on iPad** 🔴 CRITICAL
**File**: `src/components/effects/NenAura.tsx`

**Problem**: Floating particles animate continuously, especially at high combos (up to 10 particles)

**Fix**:
```typescript
// Detect device type
const isLowPowerDevice = /iPad|iPhone|Android/i.test(navigator.userAgent) &&
                         /iPad/.test(navigator.userAgent);

// Disable particle animations on iPad
const shouldShowParticles = !isLowPowerDevice && combo >= 10;
```

**Expected Impact**: -10-15 FPS improvement (removes 10 continuous animations)

#### 1.2 **Reduce HPBar Pulsing Frequency** 🔴 CRITICAL
**File**: `src/components/effects/HPBar.tsx`

**Problem**: 0.5-second pulsing cycle is too fast, causes constant repaints

**Fix**:
```typescript
// Increase pulsing duration from 0.5s to 1.2s
const pulseAnimation = {
  duration: 1.2,  // Was: 0.5
  times: [0, 0.5, 1],
  repeat: Infinity
};

// Or disable pulsing on iPad
const shouldPulse = !isLowPowerDevice;
```

**Expected Impact**: -5-8 FPS improvement (slower refresh cycle)

#### 1.3 **Limit Particle Count by Device** 🟠 HIGH
**File**: `src/components/effects/CardDestruction.tsx`

**Problem**: Particle counts scale with combo (max 13) without budget

**Fix**:
```typescript
const PARTICLE_CONFIG = {
  desktop: { max: 12, threshold: 10 },
  tablet:  { max: 6,  threshold: 15 },
  mobile:  { max: 3,  threshold: 20 }
};

const deviceType = getDeviceType(); // iOS/Android/Desktop
const particleLimit = PARTICLE_CONFIG[deviceType].max;
const particlesToShow = Math.min(calculatedParticles, particleLimit);
```

**Expected Impact**: -5-10 FPS improvement (fewer particles)

---

### Tier 2: Animation Simplification (Medium Impact, Medium Risk)
These reduce animation complexity per-effect.

#### 2.1 **Simplify TypingCard Explosion** 🟠 HIGH
**File**: `src/components/screens/TypingScreen/TypingCard.tsx`

**Problem**: 26+ elements animate simultaneously (rays, particles, light burst, rings, text)

**Fix Option A - Disable on iPad**:
```typescript
const isLowPowerDevice = /iPad/i.test(navigator.userAgent);

// Skip complex explosion on iPad
if (isLowPowerDevice && isPerfect) {
  // Use simple 0.2s scale animation instead of complex burst
  return <motion.div animate={{ scale: [1, 1.1, 1] }} />;
}
```

**Fix Option B - Reduce Effect Count**:
```typescript
// Only show rays + center light on iPad (not particles + rings + text)
const showRays = !isLowPowerDevice;
const showParticles = !isLowPowerDevice;
const showRings = !isLowPowerDevice;
```

**Expected Impact**: -15-20 FPS improvement (75% fewer animations)

#### 2.2 **Optimize Cursor Blinking** 🟡 MEDIUM
**File**: `src/components/screens/TypingScreen/TypingCard.tsx`

**Problem**: Constant `repeat: Infinity` cursor blink (1-second cycle)

**Fix**:
```typescript
// Use CSS animation instead of Framer Motion (more efficient)
// src/styles/globals.css
@keyframes blink {
  0%, 49%, 100% { opacity: 1; }
  50%, 99% { opacity: 0; }
}

.cursor-blink {
  animation: blink 1s step-start infinite;
}

// In component: <span className="cursor-blink">|</span>
```

**Expected Impact**: -2-3 FPS improvement (removes 1 motion component)

---

### Tier 3: Advanced Optimizations (Lower Priority, Higher Risk)
These require careful testing to avoid breaking animations.

#### 3.1 **Add Motion Reduction Support**
**File**: `src/hooks/useTheme.ts` (extend with motion preferences)

**Problem**: Some users prefer reduced motion, iOS `prefers-reduced-motion` not respected

**Fix**:
```typescript
export const useMotionPreference = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    mediaQuery.addEventListener('change', (e) => {
      setPrefersReducedMotion(e.matches);
    });
  }, []);

  return prefersReducedMotion;
};
```

#### 3.2 **Add Performance Settings**
**File**: `src/stores/settingsStore.ts`

**Add** to `SettingsStore` interface:
```typescript
interface SettingsStore {
  // ... existing fields ...

  // Performance settings
  reduceAnimations: boolean;
  particleQuality: 'high' | 'medium' | 'low';
  setReduceAnimations: (value: boolean) => void;
  setParticleQuality: (value: 'high' | 'medium' | 'low') => void;
}
```

#### 3.3 **Implement GPU Optimization**
Add to `motion.div` components:
```typescript
<motion.div
  style={{
    willChange: 'transform, opacity',  // Hint browser for GPU acceleration
    backfaceVisibility: 'hidden',       // Prevent flickering
    perspective: 1000,                  // Smooth 3D transforms
  }}
  // ... animation props ...
/>
```

---

## Implementation Roadmap

### Phase 1: Quick Wins (1-2 hours)
1. ✅ Add device detection utility
2. ⏳ Disable NenAura particles on iPad
3. ⏳ Increase HPBar pulsing duration
4. ⏳ Limit CardDestruction particles

### Phase 2: Animation Simplification (2-3 hours)
1. ⏳ Simplify TypingCard explosion on iPad
2. ⏳ Replace cursor blink with CSS animation
3. ⏳ Test all changes on iPad

### Phase 3: Advanced (Optional, 3-4 hours)
1. ⏳ Add prefers-reduced-motion support
2. ⏳ Add performance settings to SettingsScreen
3. ⏳ Implement GPU optimization hints

---

## Device Detection Helper

Create `src/utils/deviceUtils.ts`:
```typescript
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const ua = navigator.userAgent;

  if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) {
    return 'tablet';  // iPad or Android tablet
  }

  if (/iPhone|Android.*Mobile/i.test(ua)) {
    return 'mobile';  // iPhone or Android phone
  }

  return 'desktop';  // Desktop/laptop
};

export const isLowPowerDevice = (): boolean => {
  const ua = navigator.userAgent;
  // iPad 5 or older, iPhone 6s or older, older Android
  return /iPad|iPhone OS 12|iPhone OS 11|Android [45]/i.test(ua);
};
```

---

## Testing Checklist

### Before Changes
- [ ] Record baseline FPS on iPad (Developer Tools > Performance)
- [ ] Note jank points during gameplay
- [ ] Measure exact animation frame times

### After Each Phase
- [ ] Run on iPad with FPS monitoring
- [ ] Check for visual regressions
- [ ] Verify animations still look smooth
- [ ] Test high-combo scenarios (≥20 combo)
- [ ] Test low-HP critical states

### Performance Targets
- **Minimum**: Maintain 30 FPS on iPad (2017+)
- **Target**: 45-50 FPS on iPad
- **Ideal**: 60 FPS on all devices

---

## Expected Results

### Before Optimization
- iPad FPS: ~20-25 FPS (choppy)
- Jank points: Word completion, 10+ combo, low HP
- Noticeable lag in touch response

### After Phase 1 (Quick Wins)
- iPad FPS: ~35-40 FPS (playable)
- Jank significantly reduced
- Touch response improved

### After Phase 2 (Animation Simplification)
- iPad FPS: ~45-50 FPS (smooth)
- No visible lag
- Desktop experience unchanged (all animations enabled)

### After Phase 3 (Advanced)
- iPad FPS: 50-60 FPS (excellent)
- Optional reduced-motion support
- Best-in-class performance across all devices

---

## Notes

1. **Backward Compatibility**: All changes should maintain desktop visual quality
2. **User Preference**: Never force reduced animations - make it optional
3. **Testing**: Must test on actual iPad hardware, not just emulator
4. **Graceful Degradation**: Features should disable gracefully on low-power devices
5. **Accessibility**: Respect `prefers-reduced-motion` system preference

---

## Success Criteria

✅ iPad typing screen runs at 45+ FPS consistently
✅ No jank during word completions
✅ No jank during high-combo scenarios
✅ Desktop users see no animation reduction
✅ All animations remain visually appealing
✅ Battery usage reduced on mobile devices

---

**Status**: Ready to implement
**Owner**: Performance optimization task
**Estimated Time**: 6-9 hours across 3 phases
