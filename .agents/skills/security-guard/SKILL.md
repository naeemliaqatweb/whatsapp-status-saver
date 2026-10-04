---
name: security-guard
description: Security auditing rules for offline-first privacy apps — enforcing local-only data persistence, biometric checks, sanitized logs, and zero telemetry leaks.
---

# Security Guard — Offline & Privacy Best Practices

Use this skill to audit all PRs, storage operations, and components for strict privacy and security compliance.

## Security Rules
1. **Zero External API Leaks**: Financial and tax data must never be transmitted over the internet without explicit user consent.
2. **Biometric Storage**: Use `react-native-biometrics` or hardware-backed secure storage for encryption keys.
3. **No Sensitive Console Logs**: Strip `console.log` statements printing CNIC, bank numbers, asset values, or tax records in production builds.
4. **App Sandbox Storage**: Store user documents strictly within the application's private sandbox directory (`DocumentDirectoryPath`).
