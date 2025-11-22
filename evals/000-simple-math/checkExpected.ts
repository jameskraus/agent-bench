import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

// Create temp directory
const tempDir = join(import.meta.dir, "temp");
console.log("Creating temp directory...");
mkdirSync(tempDir, { recursive: true });

// Copy implementation from expected to temp
const expectedImplPath = join(import.meta.dir, "expected", "math.ts");
const tempImplPath = join(tempDir, "math.ts");
console.log("Copying implementation from expected to temp...");
copyFileSync(expectedImplPath, tempImplPath);

// Copy spec file from input to temp
const inputSpecPath = join(import.meta.dir, "input", "math.spec.ts");
const tempSpecPath = join(tempDir, "math.spec.ts");
console.log("Copying spec file from input to temp...");
copyFileSync(inputSpecPath, tempSpecPath);

// Run the tests in the temp folder
console.log("\nRunning tests...");
const testProcess = Bun.spawn(["bun", "test", tempSpecPath], {
  cwd: import.meta.dir,
  stdout: "inherit",
  stderr: "inherit",
});

const exitCode = await testProcess.exited;

// Clean up - remove the temp directory
console.log("\nCleaning up...");
rmSync(tempDir, { recursive: true, force: true });
console.log("Temp directory removed.");

process.exit(exitCode);
