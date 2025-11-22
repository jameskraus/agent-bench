## Repository Layout

This is an **agent benchmarking system** for evaluating Claude Code's capabilities through automated tests.

### Structure

```
agent-bench/
├── .conductor/          # Multiple git worktree-based conductor environments
│   ├── santiago/       # This conductor instance
│   └── columbia/       # Other conductor instances
├── evals/              # Evaluation test suites
│   └── 000-simple-math/
│       ├── input/      # Starting files (stubs) given to the agent
│       ├── expected/   # Reference correct implementation
│       ├── prompt.md   # Task description for Claude
│       ├── evaluateClaudeCode.ts  # Main evaluation runner
│       └── checkExpected.ts       # Verification script
└── .github/workflows/  # CI/CD automation
```

### How Evaluations Work

Each evaluation tests Claude Code's ability to complete a coding task:

1. **prompt.md** - Contains the task description
2. **input/** - Starting files (usually stubs) that the agent modifies
3. **expected/** - Reference implementation showing the correct solution
4. **evaluateClaudeCode.ts** - Runs Claude Code with the prompt, then runs tests
5. **checkExpected.ts** - Verifies the expected implementation passes tests

The evaluation runner creates a temp directory, invokes Claude Code, runs tests against the modified files, and reports pass/fail based on test results.

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
