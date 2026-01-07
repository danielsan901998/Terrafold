# Terrafold TypeScript

Incremental game ported to TypeScript using Bun.

## Tech Stack & Commands
- **Core:** TypeScript, Bun (runtime/bundler/test).
- **Testing:** Bun Test (unit), Playwright (E2E in `tests/`).
- **Commands:** `bun install`, `bun run build`, `bun run start`, `bun run test`, `bunx tsc --build --noEmit`.

## Architecture
- **Core (`src/core/`):** Logic for planets, resources, and population. Orchestrated by `Game` in `src/main.ts`.
- **UI (`src/ui/`):** Presentation layer managed by `View.ts`. Uses `EventEmitter` for decoupling.
- **Loop:** Tick-based system driven by a Web Worker (`src/workers/interval.ts`).
- **State:** Saved to `localStorage` (encoded) every 100 ticks via `copyObject` serialization.

## Conventions
- **OOP:** Logic and UI organized into classes.
- **Updates:** UI refreshes on `tick` events or specific unlock triggers.
- **Tests:** Unit tests in `src/utils/utils.test.ts`; E2E tests for progression and persistence.
