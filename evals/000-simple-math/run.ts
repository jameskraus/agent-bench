import { copyFileSync } from "node:fs";
import { join } from "node:path";

// Copy the spec file from input to expected
const inputSpecPath = join(import.meta.dir, "input", "math.spec.ts");
const expectedSpecPath = join(import.meta.dir, "expected", "math.spec.ts");

console.log("Copying spec file from input to expected...");
copyFileSync(inputSpecPath, expectedSpecPath);
console.log("Spec file copied successfully.");

// Run the tests in the expected folder
console.log("\nRunning tests...");
const testProcess = Bun.spawn(["bun", "test", expectedSpecPath], {
  cwd: import.meta.dir,
  stdout: "inherit",
  stderr: "inherit",
});

const exitCode = await testProcess.exited;
process.exit(exitCode);
