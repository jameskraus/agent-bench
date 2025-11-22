## Repository Layout

Agent benchmarking system for testing Claude Code. Evaluations live in `evals/` directory.

Each eval contains:
- `prompt.md` - Task description
- `input/` - Starting files for the agent
- `expected/` - Reference implementation
- `evaluateClaudeCode.ts` - Runs the evaluation on Claude Code
- `checkExpected.ts` - Verifies the expected implementation works correctly

**Important**: If the repository structure or eval conventions change, update this CLAUDE.md file to reflect those changes.

## Autonomous Work Preferences

The user prefers agents to work autonomously with the following workflow:

- **ALWAYS** open a PR on GitHub immediately when starting work on a new branch - do not wait
- **ALWAYS** commit changes after every meaningful change - never ask for permission to commit
- **ALWAYS** push commits to GitHub regularly to keep the remote branch up to date
- Work proactively without requiring excessive confirmation for standard development tasks
- Keep the PR updated as work progresses with regular commits and pushes

## Bun Runtime

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.md`.
