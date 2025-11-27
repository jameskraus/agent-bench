import { copyFileSync, mkdirSync, rmSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
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

const tempDir = join(import.meta.dir, `temp-${crypto.randomUUID()}`);
const inputDir = join(import.meta.dir, "input");
const promptFile = join(import.meta.dir, "prompt.md");

const prelude = argv.prelude;

if (argv.verbose) {
  console.log(chalk.cyan("\n🔧 Setup"));
}

rmSync(tempDir, { recursive: true, force: true });
mkdirSync(tempDir, { recursive: true });

const inputFiles = readdirSync(inputDir);
const hiddenSpecFiles = inputFiles.filter(file => file.includes(".hidden.spec.ts"));
const visibleFiles = inputFiles.filter(file => !file.includes(".hidden.spec.ts"));

for (const file of visibleFiles) {
  copyFileSync(join(inputDir, file), join(tempDir, file));
}

const specFiles = visibleFiles.filter(file => file.endsWith(".spec.ts"));
const prompt = readFileSync(promptFile, "utf-8").trim();
const fullPrompt = `${prelude}\n\nHere are your instructions:\n\n${prompt}`;

if (argv.verbose) {
  console.log(chalk.gray("  ✓ Created temp directory"));
  console.log(chalk.gray(`  ✓ Copied ${visibleFiles.length} visible input files`));
  console.log(chalk.gray("  ✓ Loaded prompt"));
}

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

const exitCode = await claudeProcess.exited;
const stdout = await Bun.readableStreamToText(claudeProcess.stdout);
const stderr = await Bun.readableStreamToText(claudeProcess.stderr);

if (argv.verbose) {
  console.log(stdout);
  if (stderr) {
    console.error(stderr);
  }
}

// Restore spec files for testing
for (const file of specFiles) {
  copyFileSync(join(inputDir, file), join(tempDir, file));
}

if (argv.verbose) {
  console.log(chalk.gray("  ✓ Agent execution completed"));
}

console.log(chalk.magenta("\n📊 Evaluation"));

// Run visible tests
const testProcess = Bun.spawn(["bun", "test", tempDir], {
  cwd: import.meta.dir,
  stdout: "pipe",
  stderr: "pipe",
});

const testExitCode = await testProcess.exited;
const testStdout = await Bun.readableStreamToText(testProcess.stdout);
const testStderr = await Bun.readableStreamToText(testProcess.stderr);

// Parse test results
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

// Copy hidden spec files for testing
for (const file of hiddenSpecFiles) {
  copyFileSync(join(inputDir, file), join(tempDir, file));
}

// Run hidden tests
const hiddenTestProcess = Bun.spawn(["bun", "test", "math.hidden.spec.ts"], {
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
