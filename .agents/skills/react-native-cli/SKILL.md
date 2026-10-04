---
name: react-native-cli
description: Pure React Native CLI workflow guide for building, debugging, testing, and optimizing offline fintech apps with TypeScript, NativeWind, SQLite, and Reanimated.
---

# React Native CLI — Offline FBR Tax & Asset Tracker (PakTax Vault)

Use this skill when developing, refactoring, building, or debugging this project. This is a **Pure React Native CLI** app with strict TypeScript and NativeWind.

---

## 📁 Architecture Rules

1. **Feature-First Structure**: All feature logic resides in `src/features/<feature_name>/`.
2. **Repository Pattern for Data**: UI components never write raw SQL. Use `src/database/repositories/`.
3. **Offline First**: All storage uses SQLite and MMKV. No remote API dependencies for core functionality.
4. **Absolute Imports**: Always use `@/...` path aliases.
5. **Type Safety**: Strict TypeScript with zero `any`.

---

## 🛠️ Commands & Scripts

- `npm start` — Start Metro Bundler
- `npm run android` — Run on Android Device / Emulator
- `npm test` — Run Jest test suite
- `npm run lint` — Run ESLint code checks
- `npm run format` — Run Prettier format checks
