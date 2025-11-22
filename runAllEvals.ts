import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const evalsDir = join(import.meta.dir, "evals");

interface EvalResult {
  name: string;
  passed: boolean;
  error?: string;
}

async function runEvaluation(evalPath: string, evalName: string): Promise<EvalResult> {
  const evaluateScript = join(evalPath, "evaluateClaudeCode.ts");

  console.log(`\n${"=".repeat(80)}`);
  console.log(`Running evaluation: ${evalName}`);
  console.log("=".repeat(80));

  try {
    const evalProcess = Bun.spawn(["bun", evaluateScript], {
      cwd: evalPath,
      stdout: "inherit",
      stderr: "inherit",
    });

    const exitCode = await evalProcess.exited;

    return {
      name: evalName,
      passed: exitCode === 0,
      error: exitCode !== 0 ? `Exited with code ${exitCode}` : undefined,
    };
  } catch (error) {
    return {
      name: evalName,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  console.log("Agent Bench - Running All Evaluations");
  console.log("=".repeat(80));

  const evalDirs = readdirSync(evalsDir)
    .map(name => join(evalsDir, name))
    .filter(path => {
      try {
        return statSync(path).isDirectory();
      } catch {
        return false;
      }
    })
    .sort();

  if (evalDirs.length === 0) {
    console.log("\n⚠️  No evaluations found in evals/ directory");
    process.exit(1);
  }

  const results: EvalResult[] = [];

  for (const evalPath of evalDirs) {
    const evalName = evalPath.split("/").pop()!;
    const result = await runEvaluation(evalPath, evalName);
    results.push(result);
  }

  // Print summary report
  console.log("\n");
  console.log("=".repeat(80));
  console.log("EVALUATION SUMMARY");
  console.log("=".repeat(80));

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  console.log(`\nTotal: ${total} evaluation(s)`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${total - passed}`);

  console.log("\nResults:");
  for (const result of results) {
    const status = result.passed ? "✅ PASS" : "❌ FAIL";
    console.log(`  ${status} - ${result.name}`);
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    }
  }

  console.log("\n" + "=".repeat(80));

  if (passed === total) {
    console.log("🎉 All evaluations passed!");
    process.exit(0);
  } else {
    console.log("⚠️  Some evaluations failed");
    process.exit(1);
  }
}

main();
