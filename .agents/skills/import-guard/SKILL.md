---
name: import-guard
description: Enforces clean TypeScript imports, absolute path aliases (@/), and prevents circular dependencies.
---

# Import Guard

## Rules
1. Always use `@/...` path aliases configured in `tsconfig.json` and `babel.config.js`.
2. Prohibit relative deep paths like `../../../../components/ui/Button`.
3. Keep third-party module imports at the top, followed by internal alias imports.
