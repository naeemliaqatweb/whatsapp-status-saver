---
name: react-native-native-modules
description: Configuration and troubleshooting guide for React Native Native Modules (Reanimated, Vision Camera, MMKV, Biometrics, FS, SQLite).
---

# React Native Native Modules Integration

## Critical Modules
- `react-native-reanimated`: Requires plugin entry in `babel.config.js`.
- `react-native-gesture-handler`: Requires import at top of root `index.js`.
- `react-native-mmkv`: Fast C++ JSI based storage.
- `react-native-biometrics`: Hardware biometric authentication.
- `react-native-fs`: Local sandboxed filesystem management.
