import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const nextDirectory = resolve(projectRoot, "node_modules", "next");
const wasmDirectory = resolve(
  projectRoot,
  "node_modules",
  "@next",
  "swc-wasm-nodejs",
);
const nextBinary = resolve(nextDirectory, "dist", "bin", "next");
const nextPackagePath = resolve(nextDirectory, "package.json");
const wasmPackagePath = resolve(wasmDirectory, "package.json");
const [command, ...forwardedArguments] = process.argv.slice(2);

if (!["dev", "build", "start"].includes(command)) {
  console.error("Usage: node scripts/next-wasm.mjs <dev|build|start> [...args]");
  process.exit(1);
}

if (
  !existsSync(nextBinary) ||
  !existsSync(nextPackagePath) ||
  !existsSync(wasmPackagePath)
) {
  console.error(
    "Next.js or its WebAssembly compiler is missing. Run `npm install` and try again.",
  );
  process.exit(1);
}

const nextPackage = JSON.parse(readFileSync(nextPackagePath, "utf8"));
const wasmPackage = JSON.parse(readFileSync(wasmPackagePath, "utf8"));

if (nextPackage.version !== wasmPackage.version) {
  console.error(
    `Compiler version mismatch: next is ${nextPackage.version}, but @next/swc-wasm-nodejs is ${wasmPackage.version}. Install matching versions before continuing.`,
  );
  process.exit(1);
}

const nextArguments = [nextBinary, command];

// Turbopack requires the native SWC binary. Webpack supports the WASM fallback
// used on Windows machines where Application Control blocks native Node add-ons.
if (command === "dev" || command === "build") {
  nextArguments.push("--webpack");
}

nextArguments.push(...forwardedArguments);

const child = spawn(process.execPath, nextArguments, {
  cwd: projectRoot,
  env: {
    ...process.env,
    NEXT_TEST_WASM_DIR: wasmDirectory,
  },
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(`Unable to start Next.js: ${error.message}`);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exitCode = code ?? 1;
});
