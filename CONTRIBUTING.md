# Contributing

This repository is primarily developed by delegating tasks to AI agents (Claude Code, Cursor, Codex, etc.). Whether you are an agent or a human, the rules are the same and they live in [`AGENTS.md`](./AGENTS.md).

## Quick checklist for any change

1. Read [`AGENTS.md`](./AGENTS.md) before starting.
2. New business logic goes in `src/lib/features/<name>/` with a `README.md` contract.
3. No hardcoded visual values. Tokens only — see [`docs/DESIGN-SYSTEM.md`](./docs/DESIGN-SYSTEM.md).
4. A11y baseline is mandatory — see [`docs/A11Y.md`](./docs/A11Y.md).
5. Database changes via migrations only — see [`docs/DATABASE.md`](./docs/DATABASE.md).
6. Before PR: run `pnpm format:check && pnpm check && pnpm lint && pnpm test && pnpm test:a11y:full && pnpm tokens:check-contrast`. Lefthook additionally enforces commit/push gates automatically.

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `build`, `ci`, `style`, `revert`.

Scope is usually a feature folder name (`song-list`, `auth`, `pwa`) or an area (`docs`, `ci`, `deps`).

Examples:

- `feat(song-list): add tag filter`
- `fix(auth): handle expired session token`
- `docs(a11y): clarify focus order rules`
- `chore(deps): bump @sveltejs/kit`

Lefthook's `commit-msg` hook enforces this format.

## Branches and PRs

- Branch from `main`.
- Branch name: `<type>/<short-description>` (e.g. `feat/song-list-filters`).
- Open a PR against `main`. Keep PRs small and focused — one feature change per PR if possible.
- The PR description should answer: _what changed, why, what to look at._
- The pre-merge checklist in `AGENTS.md` is the review checklist.

## Local setup

See [`README.md`](./README.md) → _Quick Start_.

## Documentation

See [`docs/CONVENTIONS.md`](./docs/CONVENTIONS.md) for naming, file structure, and other repository conventions.
