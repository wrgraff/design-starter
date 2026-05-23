# Contributing

This repository is primarily developed by delegating tasks to AI agents (Claude Code, Cursor, Codex, etc.). Whether you are an agent or a human, the rules are the same and they live in [`AGENTS.md`](./AGENTS.md).

## Quick checklist for any change

1. Read [`AGENTS.md`](./AGENTS.md) before starting.
2. New business logic goes in `src/lib/features/<name>/` with a `README.md` contract.
3. No hardcoded visual values. Tokens only — see [`docs/DESIGN-SYSTEM.md`](./docs/DESIGN-SYSTEM.md).
4. A11y baseline is mandatory — see [`docs/A11Y.md`](./docs/A11Y.md).
5. Database changes via migrations only — see [`docs/DATABASE.md`](./docs/DATABASE.md).

## Workflow

Push directly to `main`. No branch or PR conventions required for pet-project use.

Pre-push hooks run `pnpm check` (types) and `pnpm test` automatically via Lefthook.

> If this project grows into something production-grade: add branch protection, PR reviews, Conventional Commits, and a staging environment. The template is already structured for it — it's a process decision, not an architecture one.

## Local setup

See [`README.md`](./README.md) → _Quick Start_.

## Documentation

See [`docs/CONVENTIONS.md`](./docs/CONVENTIONS.md) for file naming and other repository conventions.
