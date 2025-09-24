#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import check from "./check";
import { randomUUID } from "crypto";
import build from "./build";
import { exit } from "process";

(async () => {
  const packageJSON: { module: string | undefined; main: string | undefined } =
    JSON.parse(readFileSync("package.json", "utf8"));
  const entryPointPath = packageJSON.module ?? packageJSON.main;
  if (entryPointPath === undefined || !existsSync(entryPointPath)) {
    console.error("No entry point.");
    process.exit(1);
  }
  const { program, code } = await build(resolve(entryPointPath));
  const result = check(program.body, code);
  if (result === true) {
    console.log("Tree-shakable.");
    return;
  }
  const uuid = randomUUID();
  mkdirSync(`/tmp/is-tree-shakable`, { recursive: true });
  const path = `/tmp/is-tree-shakable/${uuid}.js`;
  writeFileSync(path, code);
  if (result.length > 0) {
    console.error("Not tree-shakable:");
    for (const problem of result) {
      console.error(`• ${problem}`);
    }
    console.error(`Output at \`${path}\`.`);
  } else {
    console.error(
      `Not tree-shakable. Cause unknown; check output at \`${path}\`.`
    );
  }
  exit(1);
})();
