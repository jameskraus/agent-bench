# agent-bench

A benchmarking suite for evaluating coding agents (like Claude Code) against standardized tasks.

## Overview

This repository contains a collection of evaluations designed to test agent capabilities across various coding scenarios. Each evaluation provides a task description, starting files, and expected outputs to verify correct implementation.

## Repository Structure

- `evals/` - Directory containing all evaluation scenarios
  - Each eval includes:
    - `prompt.md` - Task description given to the agent
    - `input/` - Starting files for the agent to work with
    - `expected/` - Reference implementation
    - `evaluateClaudeCode.ts` - Script to run the evaluation
    - `checkExpected.ts` - Verification script for the expected solution

## Getting Started

Install dependencies:

```bash
bun install
```

Run an evaluation:

```bash
bun run evals/000-simple-math/evaluateClaudeCode.ts
```

## Creating New Evaluations

Follow the existing structure in `evals/` to add new benchmark scenarios. See `CLAUDE.md` for detailed conventions.

---

This project was created using `bun init` in bun v1.3.1. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
