# Contributing

Single source of truth for how work happens in this repository. Other documents
must not restate these rules.

## Collaboration surface

GitHub only: issues, PRs, milestones, releases. No mirrors, no second home for
issues.

## Merge policy

**Rebase merge only.** Nothing external references individual commit SHAs
long-term; releases are identified by tags and GitHub Releases. Repo settings
to keep in sync (owner applies in GitHub UI):

- allow **rebase merging** only (squash/merge-commit disabled)
- **Automatically delete head branches** enabled
- branch protection on `main` if the plan allows; if not available, this
  document is the substitute discipline: never commit to `main` directly
  after bootstrap, always via PR.

## Branches

- long-lived branch: `main` only
- work branches: `<type>/<slug>` or `<type>/<area>-<slug>`
  (e.g. `feat/article-toc`, `fix/comment-duplicate-id`)
- scope: days, not weeks — split the issue if it grows
- after merge: branches are deleted on remote; locally
  `git fetch --prune && git branch -D <branch>`. History lives in PRs, not
  in kept branches.

## Commits

```
<type>: <lowercase imperative english summary>   # no scope, no period, ~70 chars

- why the change was needed
- what materially changed
- compatibility or behavior impact (if any)
```

- types: `feat` `fix` `docs` `chore` `refactor` `perf` `test`
- body is bullets, not prose; trivial changes may be title-only
- one commit = one kind of change
- forbidden: emoji, `Co-Authored-By`, `Generated with`, AI-tool promotion,
  verification logs (those go in the PR)
- no rebase/amend/force-push of pushed history without explicit owner approval

## Issues

Labels — three axes, ASCII identifiers only:

- `type:feat` `type:bug` `type:docs` `type:chore` `type:decision`
- `area:` one of `foundation` `design` `template` `home` `list` `article`
  `navigation` `comments` `theme` `tistory` `preview` `quality` `build`
  `release` `docs` (add more only when work actually exists there)
- no priority labels until a real prioritization conflict appears

Rules:

- one issue = one verifiable outcome; undecided product judgment is a
  `type:decision` issue, escalated to an ADR only when architecturally
  long-lived
- milestone = release (`0.1.0`, `0.2.0`, `0.5.0`, `1.0.0`); an issue gets at
  most one milestone, and only when committed to that release

## Pull requests

Template lives in `.github/PULL_REQUEST_TEMPLATE.md`. Requirements:

- `Closes #N` in Why
- record actually-run verification only; wrong hypotheses and failures are
  recorded, not hidden
- one PR ≠ many screens + architecture changes at once
- build artifacts (`dist/`) are never committed

Solo work still goes through PRs — they preserve the plan→work→done narrative.

## Validation

Single definition: `scripts/check.sh` (thin wrapper) → `scripts/check.mjs`
(logic, Windows-friendly); `npm run check` calls the same logic. CI calls the
same script and never restates commands in YAML.

Gate rules: uncommitted changes are in scope; changes to shared files
(lockfile, build config, check script, workflows) escalate to `--all`; if
nothing applicable ran, output `skipped: no applicable checks` — never a false
`passed`; non-zero exit on failure; summary of executed checks at the end.

CI cost: fast checks on PR/push; heavy browser/visual jobs behind `--all`,
manual dispatch, or release candidates. Workflow permissions default to
`contents: read`. A red CI is fixed or the trigger is honestly disabled with a
comment — never left permanently red.

## Releases

Tags `v*` drive the release workflow: clean install → full validation →
production build → ZIP → ZIP content validation → GitHub Release with notes.
No automated upload to any Tistory blog — production skin changes are always a
manual, owner-approved step.

## Bootstrap exception

The initial foundation commits landed directly on `main` (empty repository, no
base to branch from). Everything after that follows the rules above.
