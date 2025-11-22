import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const tempDir = join(import.meta.dir, "temp");

console.log("Creating temp directory...");
mkdirSync(tempDir, { recursive: true });

console.log("Copying files to temp...");
copyFileSync(join(import.meta.dir, "expected", "math.ts"), join(tempDir, "math.ts"));
copyFileSync(join(import.meta.dir, "input", "math.spec.ts"), join(tempDir, "math.spec.ts"));

console.log("\nRunning tests...");
const testProcess = Bun.spawn(["bun", "test", join(tempDir, "math.spec.ts")], {
  cwd: import.meta.dir,
  stdout: "inherit",
  stderr: "inherit",
});

const exitCode = await testProcess.exited;

console.log("\nCleaning up...");
rmSync(tempDir, { recursive: true, force: true });

process.exit(exitCode);
