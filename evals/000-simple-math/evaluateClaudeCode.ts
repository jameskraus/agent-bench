import { copyFileSync, mkdirSync, rmSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const tempDir = join(import.meta.dir, "temp");
const inputDir = join(import.meta.dir, "input");
const preludeFile = join(import.meta.dir, "prelude.md");
const promptFile = join(import.meta.dir, "prompt.md");

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

console.log("Reading prelude and prompt...");
const prelude = readFileSync(preludeFile, "utf-8").trim();
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

console.log("\nCleaning up...");
rmSync(tempDir, { recursive: true, force: true });

if (testExitCode === 0) {
  console.log("\n✅ EVALUATION PASSED: All tests passing");
} else {
  console.log("\n❌ EVALUATION FAILED: Tests did not pass");
}

process.exit(testExitCode);
