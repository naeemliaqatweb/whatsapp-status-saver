---
name: component-creator
description: Standardized blueprint for generating high-performance, reusable React Native UI components with NativeWind, strict TypeScript, accessibility, and React.memo.
---

# Component Creator — React Native UI Generator

Use this skill whenever you create or refactor UI components for the PakTax Vault application.

## Rules & Standards
1. **Typed Props**: Every component must declare strict interfaces for its props in `src/types/` or co-located if component-specific.
2. **NativeWind Styling**: Utilize Tailwind CSS classes via NativeWind. Avoid inline style objects except for dynamic layout measurements.
3. **Accessibility**: Every interactive element (`Pressable`, `TouchableOpacity`) must have `accessibilityRole`, `accessibilityLabel`, and minimum 48px touch targets.
4. **Performance**: Wrap components in `React.memo` when rendering items in virtualized lists or complex trees.
5. **Variants Support**: Support variants (e.g. `primary`, `secondary`, `outline`, `ghost`, `danger`) cleanly via mapping objects or class variant helpers.
