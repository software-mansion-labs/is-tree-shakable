#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { randomUUID } from "crypto";
import build from "./build";
import { exit } from "process";
import Checker from "./checker";
import { mkdir, writeFile } from "fs/promises";
import printProblem from "./printProblem";
import chalk from "chalk";
import Problem from "./problem";
import { InputError, InternalError } from "./errors";

(async () => {
  const packageJSON: { module: string | undefined; main: string | undefined } = JSON.parse(readFileSync("package.json", "utf8"));
  const entryPointPath = packageJSON.module ?? packageJSON.main;
  if (entryPointPath === undefined || !existsSync(entryPointPath)) {
    console.error("No entry point.");
    process.exit(1);
  }
  const { program, code, sourceMap } = await build(resolve(entryPointPath));
  const checker = new Checker(program, code, sourceMap);
  let result: true | Problem[];
  try {
    result = await checker.check();
  } catch (error) {
    if (error instanceof InputError) {
      console.error(error.message);
    } else if (error instanceof InternalError) {
      console.error(`Internal error: ${error.message}`);
    } else {
      console.error("Unknown error.");
    }
    exit(1);
  }
  if (result === true) return;
  const uuid = randomUUID();
  await mkdir(`/tmp/is-tree-shakable`, { recursive: true });
  if (result.length > 0) {
    for (const problem of result) await printProblem(problem);
    console.error();
  } else {
    const path = `/tmp/is-tree-shakable/${uuid}.js`;
    await writeFile(path, code);
    console.error(`Not tree-shakable. Cause unknown; check output at ${chalk.blue(path)}.`);
  }
  exit(1);
})();
