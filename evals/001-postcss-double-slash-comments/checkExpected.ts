import { copyFileSync, mkdirSync, rmSync, readdirSync } from "node:fs";
import { join } from "node:path";

const tempDir = join(import.meta.dir, "temp");
const inputDir = join(import.meta.dir, "input");
const expectedDir = join(import.meta.dir, "expected");

console.log("Creating temp directory...");
rmSync(tempDir, { recursive: true, force: true });
mkdirSync(tempDir, { recursive: true });

function copyDir(srcDir: string, destDir: string) {
  const entries = readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    const destPath = join(destDir, entry.name);

    if (entry.isDirectory()) {
      mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

console.log("Copying input files to temp...");
copyDir(inputDir, tempDir);

console.log("Copying expected implementations...");
copyFileSync(join(expectedDir, "lib", "tokenizer.js"), join(tempDir, "lib", "tokenizer.js"));
copyFileSync(join(expectedDir, "lib", "parser.js"), join(tempDir, "lib", "parser.js"));
copyFileSync(join(expectedDir, "lib", "stringifier.js"), join(tempDir, "lib", "stringifier.js"));

console.log("\nInstalling dependencies...");
const installProcess = Bun.spawn(["npm", "install"], {
  cwd: tempDir,
  stdout: "inherit",
  stderr: "inherit",
});

await installProcess.exited;

console.log("\nRunning tests...");
const testProcess = Bun.spawn(["npm", "test"], {
  cwd: tempDir,
  stdout: "inherit",
  stderr: "inherit",
});

const exitCode = await testProcess.exited;

console.log("\nCleaning up...");
rmSync(tempDir, { recursive: true, force: true });

process.exit(exitCode);
