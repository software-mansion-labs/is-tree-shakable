import { beforeAll, describe, expect, it } from "vitest";
import runCli, { runCliIn } from "./runCli";
import { mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join, resolve } from "path";
import execFileAsync from "./execFileAsync";

describe("CLI", () => {
  beforeAll(async () => {
    await execFileAsync("npm", ["run", "build"], { cwd: resolve(__dirname, "..") });
  });
  it("Reports no problems for tree-shakable package", async () => {
    const { code, output } = await runCli("tree-shakable");
    expect(code).toBe(0);
    expect(output).toBe("");
  });
  it.each(["ES2022", "ESNext"])("Correctly diagnoses non-tree-shakable package targeting %s", async (target) => {
    const { code, output } = await runCli("non-tree-shakable", ["--target", target]);
    expect(code).toBe(1);
    expect(output.match(/•/g)?.length).toBe(9);
    expect(output).toContain("src/index.ts:4:0");
    expect(output).toContain("src/index.ts:6:4");
    expect(output).toContain("src/index.ts:7:2");
    expect(output).toContain("src/index.ts:13:4");
    expect(output).toContain("src/index.ts:23:19");
    expect(output).toContain("src/index.ts:24:3");
    expect(output).toContain("src/index.ts:28:13");
    expect(output).toContain("src/index.ts:38:13");
    expect(output).toContain("src/index.ts:39:10");
  });
  it.each([
    ["export class A { static x = console.log(1); }", [28]],
    ["export default class { static #x = console.log(1); }", [35]],
    ["class A { [console.log(1)]() {} }", [11]],
    ["class A { static [console.log(1)] = console.log(2); }", [18, 36]],
    ["class A { static [console.log(1)] = 1; }", [18]],
    ["class A { [console.log(1)] = console.log(2); }", [11]],
    ["class A { static x = console.log(1); /* is-tree-shakable-suppress */ static y = console.log(2); }", [21]],
    ["class A { /* is-tree-shakable-suppress */ static x = console.log(1); }", []],
    ["class A { /* is-tree-shakable-suppress */ static [first()] = second(); static x = third(); }", [82]],
    ["console.log(0); /* is-tree-shakable-suppress */ export class A { static x = console.log(1); }", [0]],
    ["/* is-tree-shakable-suppress */ export class A { static x = console.log(1); }", []],
  ] as const)("Checks class evaluation in %s", async (source, columns) => {
    const cwd = await mkdtemp(join(tmpdir(), "is-tree-shakable-test-"));
    try {
      await writeFile(join(cwd, "package.json"), JSON.stringify({ module: "index.js" }));
      await writeFile(join(cwd, "index.js"), source);
      const { code, output } = await runCliIn(cwd);
      if (columns.length === 0) {
        expect(code).toBe(0);
        expect(output).toContain("Suppression active");
      } else {
        expect(code).toBe(1);
        expect(output.match(/• index\.js:1:\d+/g)).toEqual(columns.map((column) => `• index.js:1:${column}`));
      }
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });
});
