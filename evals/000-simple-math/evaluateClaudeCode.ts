import { copyFileSync, mkdirSync, rmSync, readdirSync } from "node:fs";
import { join } from "node:path";

const tempDir = join(import.meta.dir, "temp");
const inputDir = join(import.meta.dir, "input");

console.log("Creating temp directory...");
rmSync(tempDir, { recursive: true, force: true });
mkdirSync(tempDir, { recursive: true });

console.log("Copying input files to temp...");
const inputFiles = readdirSync(inputDir);
for (const file of inputFiles) {
  copyFileSync(join(inputDir, file), join(tempDir, file));
}

console.log("\nInvoking Claude Code to implement math.ts...");
const claudeProcess = Bun.spawn([
  "claude",
  "--print",
  "--dangerously-skip-permissions",
  "--output-format", "text",
  "Please implement the functions in math.ts. The file currently has stub implementations that return undefined. You need to implement add, subtract, multiply, and divide functions. For divide, make sure to return undefined when dividing by zero. Run the tests in math.spec.ts to verify your implementation is correct."
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

console.log("\n=== Running tests to verify implementation ===");
const testProcess = Bun.spawn(["bun", "test", join(tempDir, "math.spec.ts")], {
  cwd: import.meta.dir,
  stdout: "inherit",
  stderr: "inherit",
});

const testExitCode = await testProcess.exited;

console.log("\nCleaning up...");
rmSync(tempDir, { recursive: true, force: true });

if (testExitCode === 0) {
  console.log("\n✅ EVALUATION PASSED: Claude Code successfully implemented math.ts");
} else {
  console.log("\n❌ EVALUATION FAILED: Tests did not pass");
}

process.exit(testExitCode);
