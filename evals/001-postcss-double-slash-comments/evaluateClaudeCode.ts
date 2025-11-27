import { copyFileSync, mkdirSync, rmSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import chalk from "chalk";

const argv = yargs(hideBin(process.argv))
  .option("prelude", {
    alias: "p",
    type: "string",
    description: "Custom prelude text to prepend to the prompt",
    default: "Complete the following task to the best of your abilities.",
  })
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Show detailed test output on failure",
    default: false,
  })
  .help()
  .alias("help", "h")
  .parseSync();

const tempDir = join(tmpdir(), `agent-bench-eval-${crypto.randomUUID()}`);
const inputDir = join(import.meta.dir, "input");
const promptFile = join(import.meta.dir, "prompt.md");

if (argv.verbose) {
  console.log(chalk.cyan("\n🔧 Setup"));
}

rmSync(tempDir, { recursive: true, force: true });
mkdirSync(tempDir, { recursive: true });

// Track hidden and visible test files while copying
const hiddenTestFiles: string[] = [];
const visibleTestFiles: string[] = [];

function copyInputFiles(srcDir: string, destDir: string, relativeDir = "") {
  const entries = readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    const destPath = join(destDir, entry.name);
    const relativePath = join(relativeDir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      mkdirSync(destPath, { recursive: true });
      copyInputFiles(srcPath, destPath, relativePath);
    } else if (entry.name.includes(".hidden.")) {
      hiddenTestFiles.push(relativePath);
    } else {
      copyFileSync(srcPath, destPath);
      if (entry.name.endsWith(".test.js")) {
        visibleTestFiles.push(relativePath);
      }
    }
  }
}

copyInputFiles(inputDir, tempDir);

const prompt = readFileSync(promptFile, "utf-8").trim();
const fullPrompt = `${argv.prelude}\n\nHere are your instructions:\n\n${prompt}`;

if (argv.verbose) {
  console.log(chalk.gray("  ✓ Created temp directory"));
  console.log(chalk.gray("  ✓ Copied input files (excluding hidden tests)"));
  console.log(chalk.gray("  ✓ Loaded prompt"));
}

// Install dependencies
if (argv.verbose) {
  console.log(chalk.blue("\n📦 Installing dependencies"));
}

const installProcess = Bun.spawn(["bun", "install"], {
  cwd: tempDir,
  stdout: argv.verbose ? "inherit" : "pipe",
  stderr: argv.verbose ? "inherit" : "pipe",
});

await installProcess.exited;

if (argv.verbose) {
  console.log(chalk.blue("\n🤖 Run Agent"));
}

const claudeProcess = Bun.spawn([
  "claude",
  "--print",
  "--dangerously-skip-permissions",
  "--output-format", "text",
  fullPrompt
], {
  cwd: tempDir,
  stdout: "pipe",
  stderr: "pipe",
});

await claudeProcess.exited;
const stdout = await Bun.readableStreamToText(claudeProcess.stdout);
const stderr = await Bun.readableStreamToText(claudeProcess.stderr);

if (argv.verbose) {
  console.log(stdout);
  if (stderr) {
    console.error(stderr);
  }
}

// Restore visible test files (in case agent modified them)
for (const relativePath of visibleTestFiles) {
  copyFileSync(join(inputDir, relativePath), join(tempDir, relativePath));
}

if (argv.verbose) {
  console.log(chalk.gray("  ✓ Agent execution completed"));
}

console.log(chalk.magenta("\n📊 Evaluation"));

// Run visible tests
const testProcess = Bun.spawn(["npm", "test"], {
  cwd: tempDir,
  stdout: "pipe",
  stderr: "pipe",
});

const testExitCode = await testProcess.exited;
const testStdout = await Bun.readableStreamToText(testProcess.stdout);
const testStderr = await Bun.readableStreamToText(testProcess.stderr);

const visibleTestsPassed = testExitCode === 0;

if (!visibleTestsPassed) {
  console.log(chalk.red("  ✗ Visible tests: FAILED"));
  if (argv.verbose) {
    console.log("\nTest output:");
    console.log(testStdout);
    if (testStderr) {
      console.error(testStderr);
    }
  }

  rmSync(tempDir, { recursive: true, force: true });
  console.log(chalk.red.bold("\n❌ Evaluation Failed"));
  process.exit(testExitCode);
} else {
  console.log(chalk.green("  ✓ Visible tests: PASSED"));
}

// Copy hidden test files
for (const relativePath of hiddenTestFiles) {
  copyFileSync(join(inputDir, relativePath), join(tempDir, relativePath));
}

// Run all tests (now including hidden)
const hiddenTestProcess = Bun.spawn(["npm", "test"], {
  cwd: tempDir,
  stdout: "pipe",
  stderr: "pipe",
});

const hiddenTestExitCode = await hiddenTestProcess.exited;
const hiddenTestStdout = await Bun.readableStreamToText(hiddenTestProcess.stdout);
const hiddenTestStderr = await Bun.readableStreamToText(hiddenTestProcess.stderr);

const hiddenTestsPassed = hiddenTestExitCode === 0;

if (!hiddenTestsPassed) {
  console.log(chalk.red("  ✗ Hidden tests: FAILED"));
  if (argv.verbose) {
    console.log("\nTest output:");
    console.log(hiddenTestStdout);
    if (hiddenTestStderr) {
      console.error(hiddenTestStderr);
    }
  }
} else {
  console.log(chalk.green("  ✓ Hidden tests: PASSED"));
}

// Cleanup
rmSync(tempDir, { recursive: true, force: true });

// Final result
if (visibleTestsPassed && hiddenTestsPassed) {
  console.log(chalk.green.bold("\n✅ Evaluation Passed"));
  process.exit(0);
} else {
  console.log(chalk.red.bold("\n❌ Evaluation Failed"));
  process.exit(1);
}
