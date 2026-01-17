# Dependency Audit Report

**Date:** 2026-01-17
**Project:** hxh-typing-master (HUNTER×HUNTER Typing Master)

## Executive Summary

This audit identifies **2 unused dependencies**, **7 security vulnerabilities** (moderate severity), and **19 outdated packages**. The node_modules folder is 175MB with 1,527 packages total.

---

## 1. Unused Dependencies (Bloat)

The following dependencies are installed but **not used anywhere in the codebase**:

| Package | Size Impact | Recommendation |
|---------|-------------|----------------|
| `clsx` | ~2KB | **Remove** - No imports found |
| `howler` | ~30KB | **Remove** - Native HTML5 Audio API is used instead (`src/hooks/useSound.ts`, `src/utils/bgmManager.ts`) |

### Action Required
```bash
npm uninstall clsx howler @types/howler
```

**Estimated savings:** ~32KB + reduced dependency tree

---

## 2. Security Vulnerabilities

### Current Status: 7 moderate severity vulnerabilities

| Package | Severity | Issue | Fix |
|---------|----------|-------|-----|
| `esbuild` (<=0.24.2) | Moderate | [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99) - Development server request vulnerability | Update vite to v7.x |

### Affected Dependency Chain:
```
esbuild <= 0.24.2
  └── vite (0.11.0 - 6.1.6)
        ├── vite-node (<= 2.2.0-beta.2)
        │     └── vitest
        │           ├── @vitest/coverage-v8
        │           └── @vitest/ui
        └── vite-plugin-pwa (0.3.0 - 0.21.0)
```

### Recommended Fix:
```bash
# Update entire toolchain (breaking changes expected)
npm install vite@^7.3.1 vitest@^4.0.17 @vitest/coverage-v8@^4.0.17 @vitest/ui@^4.0.17 vite-plugin-pwa@^1.2.0
```

**Note:** This is a major version upgrade requiring testing. The vulnerability only affects development servers, not production builds.

---

## 3. Outdated Packages

### Production Dependencies

| Package | Current | Latest | Priority | Breaking Changes |
|---------|---------|--------|----------|------------------|
| `framer-motion` | ^10.16.16 | 12.26.2 | Medium | Yes (v11, v12) |
| `react` | ^18.2.0 | 19.2.3 | Low | Yes (v19) |
| `react-dom` | ^18.2.0 | 19.2.3 | Low | Yes (v19) |
| `zustand` | ^4.4.7 | 5.0.10 | Medium | Yes (v5) |

### Dev Dependencies

| Package | Current | Latest | Priority | Breaking Changes |
|---------|---------|--------|----------|------------------|
| `@testing-library/react` | ^14.1.2 | 16.3.1 | Low | Yes |
| `@types/react` | ^18.2.45 | 19.2.8 | Low | Yes (React 19) |
| `@types/react-dom` | ^18.2.18 | 19.2.3 | Low | Yes (React 19) |
| `@typescript-eslint/eslint-plugin` | ^6.15.0 | 8.53.0 | Medium | Yes (v7, v8) |
| `@typescript-eslint/parser` | ^6.15.0 | 8.53.0 | Medium | Yes (v7, v8) |
| `@vitejs/plugin-react` | ^4.2.1 | 5.1.2 | Medium | Yes |
| `@vitest/coverage-v8` | ^1.1.0 | 4.0.17 | High | Yes (security fix) |
| `@vitest/ui` | ^1.1.0 | 4.0.17 | High | Yes (security fix) |
| `eslint` | ^8.56.0 | 9.39.2 | Medium | Yes (v9 flat config) |
| `eslint-plugin-react-hooks` | ^4.6.0 | 7.0.1 | Low | Yes |
| `jsdom` | ^23.0.1 | 27.4.0 | Low | Yes |
| `prettier` | ^3.1.1 | 3.8.0 | Low | No |
| `tailwindcss` | ^3.4.0 | 4.1.18 | Low | Yes (v4) |
| `vite` | ^5.0.10 | 7.3.1 | High | Yes (security fix) |
| `vite-plugin-pwa` | ^0.17.4 | 1.2.0 | Medium | Yes |
| `vitest` | ^1.1.0 | 4.0.17 | High | Yes (security fix) |

---

## 4. Recommended Actions

### Immediate (High Priority)
1. **Remove unused dependencies:**
   ```bash
   npm uninstall clsx howler @types/howler
   ```

2. **Update patch versions (non-breaking):**
   ```bash
   npm update prettier
   ```

### Short-term (Medium Priority)
3. **Update Vite toolchain** (fixes security vulnerability):
   ```bash
   npm install vite@^7.3.1 vitest@^4.0.17 @vitest/coverage-v8@^4.0.17 @vitest/ui@^4.0.17 @vitejs/plugin-react@^5.1.2 vite-plugin-pwa@^1.2.0
   ```
   - Requires testing build pipeline and test suite
   - Review migration guides for breaking changes

4. **Update ESLint toolchain:**
   ```bash
   npm install eslint@^9.39.2 @typescript-eslint/eslint-plugin@^8.53.0 @typescript-eslint/parser@^8.53.0 eslint-plugin-react-hooks@^7.0.1
   ```
   - ESLint 9 uses flat config format (eslint.config.js instead of .eslintrc)

### Long-term (Low Priority)
5. **Consider React 19 upgrade** when ecosystem is ready:
   - Requires updating `framer-motion`, `@testing-library/react`, and all React-related types
   - Many breaking changes in React 19

6. **Consider Tailwind CSS v4** when stable:
   - Major API changes, requires configuration migration

7. **Update zustand to v5:**
   ```bash
   npm install zustand@^5.0.10
   ```
   - Review [migration guide](https://github.com/pmndrs/zustand/blob/main/docs/migrations/migrating-to-v5.md)

---

## 5. Updated package.json (Recommended)

Below is an immediately applicable update removing unused dependencies:

```json
{
  "dependencies": {
    "framer-motion": "^10.16.16",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.6",
    "@testing-library/react": "^14.1.2",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "@vitejs/plugin-react": "^4.2.1",
    "@vitest/coverage-v8": "^1.1.0",
    "@vitest/ui": "^1.1.0",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.56.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "jsdom": "^23.0.1",
    "postcss": "^8.4.32",
    "prettier": "^3.1.1",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.10",
    "vite-plugin-pwa": "^0.17.4",
    "vitest": "^1.1.0"
  }
}
```

**Removed:**
- `clsx` (unused)
- `howler` (unused)
- `@types/howler` (unused)

---

## 6. Dependency Usage Summary

| Package | Status | Usage Count | Notes |
|---------|--------|-------------|-------|
| `framer-motion` | USED | 33 imports, 429+ refs | Core animation library |
| `zustand` | USED | 8 imports | State management in 4 stores |
| `react` | USED | 47 imports | Core framework |
| `react-dom` | USED | - | Core framework |
| `vite-plugin-pwa` | USED | 1 (vite.config.ts) | PWA support |
| `clsx` | NOT USED | 0 | **Remove** |
| `howler` | NOT USED | 0 | **Remove** |

---

## 7. Node Modules Statistics

- **Total packages:** 1,527
- **Total size:** 175 MB
- **Direct dependencies:** 6 production + 22 dev = 28 total

After removing unused packages, expect minimal size reduction (~32KB direct + transitive deps).

---

## Appendix: Security Advisory Details

### GHSA-67mh-4wv8-2f99 (esbuild)
- **Severity:** Moderate
- **Description:** esbuild enables any website to send any requests to the development server and read the response
- **Impact:** Development only (not production builds)
- **Fixed in:** esbuild > 0.24.2 (requires vite >= 7.0.0)
