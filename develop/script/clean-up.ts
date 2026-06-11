import fs from "node:fs";

/** clean-up target paths */
const targetPaths = [
  ".output",
  ".vinxi",
  ".pnpm-store",
  "node_modules",
];

targetPaths.forEach((path) => {
  if (!fs.existsSync(path)) {
    console.log("Directory does not exist: ", path);
    return;
  }
  console.log("Deleting file: ", path);
  fs.rmSync(path, { recursive: true, force: true });
});
