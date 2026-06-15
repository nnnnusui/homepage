---
applyTo: "src/fn/state/**"
---

## State (`src/fn/state`)

- Root signals must be placed under `./root/` and named in the form `useXxxxx.ts`.
- Signal return values must always be functions. Even when returning a plain value, wrap it as `return () => value`.
