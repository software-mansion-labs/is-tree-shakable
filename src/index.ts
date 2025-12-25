#!/usr/bin/env node

import { readFileSync } from "fs";
import { randomUUID } from "crypto";
import build from "./build";
import { exit } from "process";
import Checker from "./checker";
import { mkdir, writeFile } from "fs/promises";
import printProblem from "./printProblem";
import chalk from "chalk";
import { InputError, InternalError } from "./errors";
import getOptions from "./getOptions";
import getEntryPointPath from "./getEntryPointPath";

(async () => {
  try {
    const packageJSON: Record<string, unknown> = JSON.parse(readFileSync("package.json", "utf8"));
    const options = getOptions();
    const entryPointPath = getEntryPointPath(packageJSON, options);
    const { program, code, sourceMap, comments } = await build(entryPointPath, options);
    const checker = new Checker(program, code, sourceMap, comments);
    const result = await checker.check();
    if (result === true) return;
    if (Array.isArray(result) && result.length > 0) {
      for (const problem of result) await printProblem(problem);
      console.error();
      exit(1);
    }
    const uuid = randomUUID();
    await mkdir(`/tmp/is-tree-shakable`, { recursive: true });
    const path = `/tmp/is-tree-shakable/${uuid}.js`;
    await writeFile(path, code);
    if (result === false) {
      console.log(`No problems found. Suppression active; check output at ${chalk.blue(path)}, and ensure no unwanted retention.`);
      return;
    }
    console.error(`Not tree-shakable. Cause unknown; check output at ${chalk.blue(path)}.`);
    exit(1);
  } catch (error) {
    if (error instanceof InputError) {
      console.error(error.message);
      exit(1);
    } else if (error instanceof InternalError) {
      console.error(`Internal error: ${error.message}`);
      exit(1);
    } else {
      throw error;
    }
  }
})();
