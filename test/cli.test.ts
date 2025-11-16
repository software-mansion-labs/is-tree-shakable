import { beforeAll, describe, expect, it } from "vitest";
import runCli from "./runCli";
import { resolve } from "path";
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
  it("Correctly diagnoses non-tree-shakable package", async () => {
    const { code, output } = await runCli("non-tree-shakable");
    expect(code).toBe(1);
    expect(output.match(/•/g)?.length).toBe(1);
    expect(output).toContain("src/index.ts:4:0: Possibly side-effectful root-level expression.");
  });
});
