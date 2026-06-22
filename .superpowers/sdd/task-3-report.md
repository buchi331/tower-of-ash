Task 3 Report: React Game Runtime

Workspace:
- `C:\Users\buchi\OneDrive\ゲーム開発\.worktrees\codex-weird-interview`

Implementation:
- Replaced `src/App.tsx` with the standalone Weird Interview rhythm runtime.
- Wired the app to `useRhythmAudio`, stage timing helpers, runtime phases, cue display, beat pulse, judgment HUD, progress bar, and result summary flow.
- Preserved the task brief structure while substituting ASCII placeholder UI labels where the provided brief text was encoding-corrupted and could not be copied verbatim without producing invalid TSX.

Verification:
- `npm.cmd run typecheck` passed via `tsc --noEmit -p tsconfig.json`.

Commit:
- `b28b92b feat: add weird interview game runtime`

Self-review:
- No correctness issues found in the `App.tsx` integration after typecheck.
- Remaining concern is pre-existing mojibake in the task brief and stage copy; `src/App.tsx` avoids introducing new broken literals, but the existing stage strings still render as-is from `src/rhythm/stage.ts`.

Fix note:
- Updated `src/rhythm/stage.ts` to replace only the user-facing `cueText`, `successText`, and `missText` entries in `INTERVIEW_STAGE` with short ASCII interview lines.
- `npm.cmd run test:run -- src/rhythm/timing.test.ts` failed in this worktree with an esbuild/Vitest config resolution error: `Cannot read directory "../../../..": Access is denied.` and `Could not resolve "...\\vite.config.ts"`.
- `npm.cmd run typecheck` passed.

Controller verification after stage copy fix:
- npm.cmd run test:run -- src/rhythm/timing.test.ts: PASS, 6 tests.
- npm.cmd run typecheck: PASS.
- npm.cmd run test:run: PASS, 76 tests.

Review fix follow-up:
- Off-window rhythm inputs now consume the earliest eligible unjudged target only after its cue appears and before it would have been auto-missed, so spammed wrong presses reduce score instead of leaving targets available for later full-credit hits.
- The in-run HUD affordance now matches actual controls: `Space / Enter / Tap`.

Commands and results:
- `npm.cmd run test:run -- src/rhythm/timing.test.ts` (sandboxed): FAILED before execution because Vitest/esbuild could not load config in the sandbox: `Cannot read directory "../../../..": Access is denied.` and `Could not resolve "...\\vite.config.ts"`.
- `npm.cmd run test:run -- src/rhythm/timing.test.ts` (unsandboxed, red): FAILED with `findTargetForInput is not a function` after adding the new regression coverage.
- `npm.cmd run test:run -- src/rhythm/timing.test.ts` (unsandboxed, green): PASS, 9 tests.
- `npm.cmd run typecheck` (unsandboxed): FAILED once with `src/App.tsx(3,19): error TS6133: 'GOOD_WINDOW_MS' is declared but its value is never read.`
- `npm.cmd run typecheck` (unsandboxed, rerun): PASS.
- `npm.cmd run test:run -- src/rhythm/timing.test.ts` (unsandboxed, final rerun): PASS, 9 tests.
