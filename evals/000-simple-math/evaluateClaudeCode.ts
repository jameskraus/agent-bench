import { copyFileSync, mkdirSync, rmSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv))
  .option("prelude", {
    alias: "p",
    type: "string",
    description: "Custom prelude text to prepend to the prompt",
    default: "Complete the following task to the best of your abilities.",
  })
  .help()
  .alias("help", "h")
  .parseSync();

const tempDir = join(import.meta.dir, "temp");
const inputDir = join(import.meta.dir, "input");
const promptFile = join(import.meta.dir, "prompt.md");

const prelude = argv.prelude;

console.log("\n🔧 SETUP");
console.log("─────────────────────────────────────");

rmSync(tempDir, { recursive: true, force: true });
mkdirSync(tempDir, { recursive: true });

const inputFiles = readdirSync(inputDir);
for (const file of inputFiles) {
  copyFileSync(join(inputDir, file), join(tempDir, file));
}

const specFiles = inputFiles.filter(file => file.endsWith(".spec.ts"));
const prompt = readFileSync(promptFile, "utf-8").trim();
const fullPrompt = `${prelude}\n\nHere are your instructions:\n\n${prompt}`;

console.log("✓ Created temp directory");
console.log(`✓ Copied ${inputFiles.length} input files`);
console.log("✓ Loaded prompt");

console.log("\n🤖 PERFORM");
console.log("─────────────────────────────────────");
console.log("Running Claude Code agent...\n");

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
const stdout = await new Response(claudeProcess.stdout).text();
const stderr = await new Response(claudeProcess.stderr).text();

console.log(stdout);
if (stderr) {
  console.error(stderr);
}

// Restore spec files for testing
for (const file of specFiles) {
  copyFileSync(join(inputDir, file), join(tempDir, file));
}

console.log("✓ Agent execution completed");

console.log("\n📊 EVALUATION");
console.log("─────────────────────────────────────");

// Run visible tests
const testProcess = Bun.spawn(["bun", "test", tempDir], {
  cwd: import.meta.dir,
  stdout: "pipe",
  stderr: "pipe",
});

const testExitCode = await testProcess.exited;
const testStdout = await new Response(testProcess.stdout).text();
const testStderr = await new Response(testProcess.stderr).text();

// Parse test results
const visibleTestsPassed = testExitCode === 0;

if (!visibleTestsPassed) {
  console.log("✗ Visible tests: FAILED");
  console.log("\nTest output:");
  console.log(testStdout);
  if (testStderr) {
    console.error(testStderr);
  }

  rmSync(tempDir, { recursive: true, force: true });
  console.log("\n❌ EVALUATION FAILED");
  process.exit(testExitCode);
} else {
  console.log("✓ Visible tests: PASSED");
}

// Run hidden tests
const hiddenTestProcess = Bun.spawn(["bun", "test", "math.hidden.spec.ts"], {
  cwd: import.meta.dir,
  stdout: "pipe",
  stderr: "pipe",
});

const hiddenTestExitCode = await hiddenTestProcess.exited;
const hiddenTestStdout = await new Response(hiddenTestProcess.stdout).text();
const hiddenTestStderr = await new Response(hiddenTestProcess.stderr).text();

const hiddenTestsPassed = hiddenTestExitCode === 0;

if (!hiddenTestsPassed) {
  console.log("✗ Hidden tests: FAILED");
  console.log("\nTest output:");
  console.log(hiddenTestStdout);
  if (hiddenTestStderr) {
    console.error(hiddenTestStderr);
  }
} else {
  console.log("✓ Hidden tests: PASSED");
}

// Cleanup
rmSync(tempDir, { recursive: true, force: true });

// Final result
console.log("\n─────────────────────────────────────");
if (visibleTestsPassed && hiddenTestsPassed) {
  console.log("✅ EVALUATION PASSED");
  process.exit(0);
} else {
  console.log("❌ EVALUATION FAILED");
  process.exit(1);
}
