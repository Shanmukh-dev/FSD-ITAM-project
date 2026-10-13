---
name: Monochromatic & Champagne Gold Glassmorphic OS
colors:
  surface: '#09090b'
  surface-dim: '#09090b'
  surface-bright: '#18181b'
  surface-container-lowest: '#050507'
  surface-container-low: '#0f0f12'
  surface-container: '#141418'
  surface-container-high: '#1c1c22'
  surface-container-highest: '#27272e'
  on-surface: '#f8fafc'
  on-surface-variant: '#a1a1aa'
  inverse-surface: '#f8fafc'
  inverse-on-surface: '#18181b'
  outline: '#71717a'
  outline-variant: '#27272a'
  surface-tint: '#f1cb8d'
  primary: '#f1cb8d'
  on-primary: '#09090b'
  primary-container: '#382f1d'
  on-primary-container: '#fdf6ea'
  inverse-primary: '#b88728'
  secondary: '#f8fafc'
  on-secondary: '#09090b'
  secondary-container: '#27272a'
  on-secondary-container: '#f4f4f5'
  tertiary: '#f1cb8d'
  on-tertiary: '#09090b'
  tertiary-container: '#382f1d'
  on-tertiary-container: '#fdf6ea'
  error: '#a1a1aa'
  on-error: '#09090b'
  error-container: '#27272a'
  on-error-container: '#f4f4f5'
  background: '#09090b'
  on-background: '#f8fafc'
  surface-variant: '#18181b'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.375rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.25rem
  2xl: 1.5rem
  3xl: 1.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
---

## Brand & Style

This design system targets IT asset controllers, administrators, and enterprise operations teams seeking an ultra-premium, high-focus workstation experience.

Key principles:
- **Strict Monochromatic Foundation**: Deep obsidian black (`#09090B`) in dark mode and near-white (`#FAFAFA`) in light mode with subtle shades of zinc and titanium.
- **Champagne Gold (`#F1CB8D`) Accent**: The sole intentional color accent across the platform. Signifies active commits, high-priority actions, focus indicators, and primary CTAs.
- **Bento-Grid Floating Window Deck**: Modular glass containers with window-header bars, rounded-3xl corners, and subtle hairline borders.
- **Subtle Glassmorphism & Soft Halo**: Frosted acrylic panels (`backdrop-blur-md` / `backdrop-blur-xl`) with low-contrast borders and an ambient soft gold glow halo (`rgba(241, 203, 141, 0.15)`) on card hover and active controls.
- **Strict Monochromatic & Gold Tonal Badges**: Uses Champagne Gold, pure white/titanium, and varying shades of gray/zinc for status telemetry.