---
name: style-guard
description: Enforces NativeWind Tailwind styling conventions, Material You / Material Design 3 tokens, and prohibits inline style pollution.
---

# Style Guard — NativeWind & Design Tokens

## Rules
1. Use predefined theme color tokens (`primary`, `secondary`, `surface`, `background`).
2. Do not use ad-hoc hex codes in inline styles; reference `PALETTE` from `@/constants/theme` or NativeWind classes.
3. Ensure dark mode support and contrast ratios meet WCAG AA standards.
