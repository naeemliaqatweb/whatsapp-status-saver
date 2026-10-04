---
name: modular-architecture
description: Enforces feature-first modular architecture, clean separation of concerns, and unidirectional data flow in React Native CLI apps.
---

# Modular Architecture Guide

## Rules
1. **Feature Encapsulation**: Keep all feature-specific logic, screens, hooks, and types inside `src/features/<feature_name>/`.
2. **Shared UI**: Only purely presentational, reusable primitives belong in `src/components/`.
3. **Data Access**: Never write SQL queries or raw storage mutations in screens. Always use Repositories in `src/database/repositories/`.
4. **Services**: Complex calculations (e.g. FBR Tax Slabs, Wealth Reconciliation) belong in `src/services/` or `src/utils/`.
