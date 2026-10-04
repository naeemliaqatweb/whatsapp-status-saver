---
name: accessibility-checker
description: Accessibility verification skill for React Native ensuring screen reader support, minimum 48px touch targets, accessibilityLabel and accessibilityRole.
---

# Accessibility Checker

## Rules
1. Every interactive element (`TouchableOpacity`, `Pressable`, `Button`, `Chip`, `Switch`) must have `accessibilityRole` and `accessibilityLabel`.
2. All interactive targets must have at least 48x48 logical pixels touch area.
3. Decorative icons must have `accessible={false}` to avoid noise on TalkBack and VoiceOver.
