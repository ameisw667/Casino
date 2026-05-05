# 📱 Casino Royale - Mobile Development Standards (Internal)

This guide defines the standards for maintaining and extending the Casino Royale mobile experience. Follow these rules to prevent layout distortion and ensure a premium "Vibe-Coding" experience on all devices.

---

## 🎯 1. Core Principles

1.  **Mobile-First Thinking**: Design for the iPhone 15 (393px width) first, then scale up.
2.  **Fluid Scaling**: Use `clamp()` for typography and spacing instead of fixed pixel values.
3.  **Atomic Layouts**: Prefer `flex-direction: column` on mobile and `row` on desktop.
4.  **Touch Target Integrity**: Interactive elements must be at least **44px x 44px**.

---

## 🧠 2. State Management (`isMobile`)

We use a centralized `isMobile` boolean from `useCasinoStore`. This is the primary source of truth for conditional rendering and style switching.

### Usage Example:
```tsx
const { isMobile } = useCasinoStore();

<div style={{
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  padding: isMobile ? '16px' : '32px'
}}>
  {/* Content */}
</div>
```

---

## 📐 3. Common Mobile Patterns

### A. Persistent Bottom Nav & Fixed Elements
The `MobileNav` is fixed at the bottom (`height: 72px`). Any fixed elements (sticky bars, chat buttons) must account for this offset.
- **Rule**: Sticky bars on mobile should have `bottom: 72px`.
- **Safe Areas**: Always use `env(safe-area-inset-bottom)` to avoid the iPhone home bar.

### B. Content Stacking
Sidebars and controls must stack above or below the main game area.
- **Rule**: Controls usually go below the game area on mobile to allow the user to see the action clearly while adjusting bets.

### C. Hash & Long String Handling
Hash strings (Server Seeds, HMACs) must not break the viewport.
- **Rule**: Use `word-break: break-all` and wrap in a scrollable container if necessary.
```tsx
<div style={{ overflowX: 'auto', whiteSpace: 'nowrap', maxWidth: '100%' }}>
  {longHashString}
</div>
```

---

## 🎨 4. CSS Design Tokens

| Token | Mobile Value | Desktop Value |
| :--- | :--- | :--- |
| **Grid Gaps** | `12px` - `16px` | `24px` - `32px` |
| **Section Padding**| `16px` - `20px` | `48px` - `60px` |
| **H1 Font Size** | `clamp(2.5rem, 8vw, 3rem)` | `clamp(3rem, 10vw, 6rem)` |
| **Border Radius** | `16px` - `24px` | `24px` - `32px` |

---

## ✅ 5. New Feature Checklist

Before committing any new UI component, audit it against this checklist:

- [ ] **Viewport Test**: Does it fit on a 375px - 393px width screen without horizontal scrolling?
- [ ] **Touch Targets**: Are all buttons easily tappable? (No cramped icons).
- [ ] **Overlap Check**: Does the component overlap with `MobileNav` or `GlobalChat`?
- [ ] **isMobile Hook**: Is layout logic using the `isMobile` store state?
- [ ] **Image Scaling**: Do images use `object-fit: contain/cover` to avoid distortion?
- [ ] **Safe Area**: Is `padding-bottom` applied to the main container (`100px` on mobile)?
- [ ] **Hydration Guard**: Does the component use a `mounted` check if accessing `window` or store state?

---

## 🛠 6. Pro-Tips for Developers

- **Avoid `vh` for Heights**: Use `100dvh` or `100%` to account for mobile browser chrome (URL bars).
- **Glassmorphism Scale**: `backdrop-filter: blur(10px)` is expensive. Use it sparingly on complex mobile animations.
- **Font Rendering**: Always use `-webkit-font-smoothing: antialiased` for premium neon text readability.

---
*Created by Antigravity - Mobile Integrity Guardian*
