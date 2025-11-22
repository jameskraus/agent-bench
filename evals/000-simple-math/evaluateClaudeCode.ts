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

console.log("Creating temp directory...");
rmSync(tempDir, { recursive: true, force: true });
mkdirSync(tempDir, { recursive: true });

console.log("Copying input files to temp...");
const inputFiles = readdirSync(inputDir);
for (const file of inputFiles) {
  copyFileSync(join(inputDir, file), join(tempDir, file));
}

// Track spec files for later restoration
const specFiles = inputFiles.filter(file => file.endsWith(".spec.ts"));

console.log("Reading prompt...");
const prompt = readFileSync(promptFile, "utf-8").trim();
const fullPrompt = `${prelude}\n\nHere are your instructions:\n\n${prompt}`;

console.log("\nInvoking Claude Code...");
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

console.log("\n=== Claude Code Output ===");
console.log(stdout);
if (stderr) {
  console.log("\n=== Stderr ===");
  console.log(stderr);
}

console.log("\n=== Restoring spec files from input directory ===");
for (const file of specFiles) {
  copyFileSync(join(inputDir, file), join(tempDir, file));
}

console.log("\n=== Running all spec files to verify implementation ===");
const testProcess = Bun.spawn(["bun", "test", tempDir], {
  cwd: import.meta.dir,
  stdout: "inherit",
  stderr: "inherit",
});

const testExitCode = await testProcess.exited;

if (testExitCode !== 0) {
  console.log("\nCleaning up...");
  rmSync(tempDir, { recursive: true, force: true });
  console.log("\n❌ EVALUATION FAILED: Tests did not pass");
  process.exit(testExitCode);
}

console.log("\n=== Running hidden tests ===");
const hiddenTestProcess = Bun.spawn(["bun", "test", "math.hidden.spec.ts"], {
  cwd: import.meta.dir,
  stdout: "inherit",
  stderr: "inherit",
});

const hiddenTestExitCode = await hiddenTestProcess.exited;

console.log("\nCleaning up...");
rmSync(tempDir, { recursive: true, force: true });

if (hiddenTestExitCode === 0) {
  console.log("\n✅ EVALUATION PASSED: All tests passing (including hidden tests)");
} else {
  console.log("\n❌ EVALUATION FAILED: Hidden tests did not pass");
}

process.exit(hiddenTestExitCode);
