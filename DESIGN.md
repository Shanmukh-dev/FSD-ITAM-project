---
name: Syntropic Asset OS
colors:
  surface: '#150f29'
  surface-dim: '#150f29'
  surface-bright: '#3b3551'
  surface-container-lowest: '#0f0a23'
  surface-container-low: '#1d1831'
  surface-container: '#211c36'
  surface-container-high: '#2c2641'
  surface-container-highest: '#37314c'
  on-surface: '#e7deff'
  on-surface-variant: '#c7c4d9'
  inverse-surface: '#e7deff'
  inverse-on-surface: '#322d48'
  outline: '#918fa2'
  outline-variant: '#464556'
  surface-tint: '#c3c0ff'
  primary: '#c3c0ff'
  on-primary: '#1e00a5'
  primary-container: '#574bff'
  on-primary-container: '#ece8ff'
  inverse-primary: '#4b3cf4'
  secondary: '#c3c0ff'
  on-secondary: '#282475'
  secondary-container: '#3f3c8d'
  on-secondary-container: '#afadff'
  tertiary: '#f7bc69'
  on-tertiary: '#452b00'
  tertiary-container: '#8e6014'
  on-tertiary-container: '#ffe6ca'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3010dd'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#110661'
  on-secondary-fixed-variant: '#3f3c8d'
  tertiary-fixed: '#ffddb3'
  tertiary-fixed-dim: '#f7bc69'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#633f00'
  background: '#150f29'
  on-background: '#e7deff'
  surface-variant: '#37314c'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
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
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system targets IT administrators, asset controllers, and enterprise operations teams who spend hours tracking hardware lifecycles, software licenses, and cloud footprints. Traditional enterprise IT tools present hostile, pitch-black terminals or eye-straining high-contrast stark themes. This design system counters that fatigue by blending **Corporate Modern** rigor with an **approachable, human-scaled interface**.

Key emotional targets:
- **Calm Mastery:** Eliminates dashboard anxiety through structured visual hierarchy and soothing slate undertones.
- **Immediate Legibility:** Prioritizes effortless scanning across hundreds of inventory lines without ocular strain.
- **Trustworthy Vitality:** Combines deep, disciplined electric indigo tones with warm amber accents to signify active, healthy infrastructure.

## Colors

The palette is engineered specifically for extended dark-mode usage, using rich slate blues rather than pure hollow black (#000000). This eliminates glare while maintaining crisp depth perception.

- **Primary (`#574BFF` - Electric Indigo):** The engine of intentional action. Used for primary CTAs, active operational filters, system commits, and high-visibility focus indicators.
- **Tertiary (`#C38E40` - Amber Glow):** The alert and maintenance beacon. Highlights upcoming license expirations, depreciation thresholds, and non-blocking provisioning warnings.
- **Neutral Canvas (`#7A7392` - Midnight Slate):** The root viewport backdrop, establishing structured grounding for operational workflows.
- **Typography Tone:** `#F8FAFC` for headline authority and primary data fields; `#94A3B8` for secondary labels, table headers, and metadata. All foreground-to-background combinations comply strictly with WCAG AAA standards for text reading and AA for graphical interfaces.

## Typography

The design system relies exclusively on **Inter** to ensure maximum computational clarity, tabular alignment, and zero distraction.

- Numerical figures and financial metrics within tables utilize tabular figures (`font-variant-numeric: tabular-nums`) to preserve optical alignment across rapid column sorting.
- Headlines maintain a slightly negative tracking (-0.01em to -0.02em) to ensure titles remain tight and modern without looking condensed.
- Micro-labels and tag indicators employ uppercase styling at `label-sm` with widened tracking to guarantee crisp readability on lower-DPI monitor workstations.

## Layout & Spacing

A balanced 12-column fluid grid accommodates high-density data visualizations, inventory lists, and hardware topology graphs.

- **Desktop (1280px+):** 12-column grid with `margin: 2rem` and `gutter: 1.5rem`. Side-navigation is anchored in a fixed 260px sidebar while content areas dynamically scale.
- **Tablet (768px - 1279px):** 8-column layout. Gutter shrinks to `1rem` and side navigation collapses into an icon dock to maintain minimum table widths.
- **Mobile (< 768px):** 4-column flow with `margin-sm: 1rem`. Data grids transition into stacked expandable asset cards.
- **Component Flow:** Padding follows a strict 4px/8px modular base (`space-xs` to `space-xl`). Data table cells default to `space-sm` vertically and `space-md` horizontally to preserve dense scan paths without looking claustrophobic.

## Elevation & Depth

Visual hierarchy is constructed through **Tonal Layering** paired with **Low-Contrast Outlines**, avoiding murky shadows that muddy dark themes.

- **Base Layer (Canvas):** Forms the ground plane.
- **Surface Layer (Cards, Data Tables, Canvas Sections):** Raised with a crisp 1px perimeter border rendered in subtle outlines.
- **Raised Interactive Layer (Modals, Dropdowns, Tooltips):** Elevated with an ambient glow shadow: `0 12px 32px -4px rgba(2, 6, 23, 0.6)`.
- **Focus & Selection Indication:** A dual-ring technique ensures focus states never clip and remain instantly recognizable for keyboard navigation.

## Shapes

The interface embraces a clean, tighter curvature (`roundedness: 1`) that projects precision and utility-focused efficiency.

- Buttons, form fields, and status badges utilize compact corner radiuses, creating ergonomic, crisp interaction targets.
- Structural containers such as cards, slide-over panels, and data modals utilize structured geometry.
- Small chips, metadata tags, and metric indicators use tight rounding to maintain geometry scale with reduced font sizes.

## Components

### Buttons
- **Primary:** Filled primary indigo with high-contrast text and subtle hover brightening. Active states feature a gentle scale down.
- **Secondary:** Surface with 1px border, text in high-contrast tone. Hover brings a background shift.
- **Tertiary / Ghost:** Transparent background with muted text, transitioning to bright text and subtle background tint on hover.

### Asset Status Badges & Chips
- Designed with pill-like precision using soft, luminous background tints and crisp borders.

### Input Fields & Controls
- **Inputs:** Background canvas, 1px border, high-contrast text and placeholder tones. Focus transitions border to primary indigo with a subtle halo.
- **Checkboxes & Radios:** Rounded square for checkboxes and full circle for radios. Unchecked state uses surface borders; checked state fills with primary color containing a clear checkmark icon.

### Data Tables & Asset Cards
- **Table Headers:** Distinct surface background, border-bottom 1px solid, text in secondary label tone.
- **Table Rows:** Hover states tint row background. Multi-select rows showcase an active left border indicator.
- **Metric Cards:** Structured container with a hairline top accent border tinted according to context.