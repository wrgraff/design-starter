# Prototypes

This folder holds **design and logic references** for upcoming features — typically exports from Claude Design, Figma Make, Lovable, v0, bolt.new, or hand-written specs.

## Important

Code in this folder is **not** part of the application. It is never imported into `src/`. It is read as a reference, then discarded once the corresponding feature is built.

For the full porting workflow, see [`../docs/IMPORTING-DESIGNS.md`](../docs/IMPORTING-DESIGNS.md).

## Convention

Each prototype is a **spec file** paired with a **prototype folder**, both named the same:

```
prototypes/
  README.md                ← this file (committed)
  song-list-v1.md          ← spec / TZ for an iteration (committed)
  song-list-v1/            ← raw export from the tool (gitignored)
  settings-v2.md           ← spec for another iteration (committed)
  settings-v2/             ← raw export (gitignored)
```

- Spec files (`*.md` at the root of this folder) **are committed**. They are project documentation — the decisions that drove a feature.
- Prototype folders (`*/`) **are gitignored**. They are large, churn frequently, and are not the source of truth.

If you only have a prototype and no spec, write the spec first by inspecting the prototype. The spec is what the agent will use to port the feature.

## Naming

Use the same name for the spec file and the folder. Suffix with a version when iterating: `-v1`, `-v2`, `-mvp`, `-redesign`, etc.

The name should match the **feature folder** that will eventually be created in `src/lib/features/`:

- `prototypes/song-list-v1.md` + `prototypes/song-list-v1/` → `src/lib/features/song-list/`

This makes the lineage obvious.

## Spec File Template

```markdown
# <Feature Name> — v<N>

## Goal

One paragraph: what user problem this feature solves and for whom.

## Flows

1. Primary flow as numbered steps.
2. ...

## States

- Empty
- Loading
- Error (which errors are recoverable, which are fatal)
- Success
- Partial / offline
- (Anything else state-shaped)

## Data

- What it reads (tables, RPC, external APIs)
- What it writes
- Expected shape of inputs and outputs

## A11y

- Anything non-obvious about keyboard, focus, live regions, semantics

## Out of Scope

- Explicit non-goals to prevent scope creep

## Open Questions

- Things to clarify before implementation
```

## Workflow

1. Generate a prototype with your tool of choice. Drop it into `prototypes/<name>/`.
2. Write `prototypes/<name>.md` based on the prototype. Refine until you are confident in the contract.
3. Open the project and tell an agent: "Port `prototypes/<name>` into `src/lib/features/<name>/` following `docs/IMPORTING-DESIGNS.md`."
4. The agent reads the spec, looks at the prototype as reference, and writes a fresh feature using this project's design system, primitives, tokens, and conventions.
5. The agent commits the new feature. The prototype folder stays on disk locally for future reference but is never imported.
6. When the feature is shipped and stable, the spec file remains in this folder as documentation of why the feature is the way it is.

## What Not to Do

- Do not import anything from `prototypes/` into `src/`.
- Do not copy hex colors, paddings, fonts, shadows, or radii from a prototype.
- Do not copy entire component files. Read, understand, rewrite.
- Do not modify a prototype after the corresponding feature has been built. If requirements change, create a new spec (`-v2`) and a new prototype folder.
