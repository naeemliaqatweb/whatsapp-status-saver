---
name: screen-builder
description: Guide for creating feature-complete, production-ready React Native screens with SafeAreaView, responsive layouts, header integration, and zero business logic inside UI.
---

# Screen Builder — PakTax Vault

Use this skill to assemble new screens in `src/features/<feature>/screens/`.

## Screen Structure
1. Wrap screen in `SafeAreaView` from `react-native-safe-area-context` with `bg-background` (or theme background).
2. Delegate state management and data fetching to custom hooks (`useDashboard`, `useAssets`, etc.).
3. Structure views into modular section components inside `src/features/<feature>/components/`.
4. Handle loading, error, and empty states cleanly with `Loader` and `EmptyState` components.
