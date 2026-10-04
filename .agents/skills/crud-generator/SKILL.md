---
name: crud-generator
description: Blueprint for generating SQLite models, migrations, type-safe repositories, and service layer CRUD methods for local storage in React Native.
---

# CRUD Generator — SQLite & Local Repositories

Use this skill when implementing new data models for offline storage in `src/database/` and `src/services/`.

## Architecture Flow
`UI Hook` -> `Service Layer (Business Logic)` -> `Repository (SQLite Queries)` -> `Database Driver`

## Standard Repository Contract
```typescript
export interface IRepository<T, CreateDTO, UpdateDTO> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(data: CreateDTO): Promise<T>;
  update(id: string, data: UpdateDTO): Promise<T>;
  delete(id: string): Promise<boolean>;
}
```
