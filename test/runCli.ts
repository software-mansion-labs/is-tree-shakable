import { spawn } from "child_process";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { once } from "events";
import execFileAsync from "./execFileAsync";

export const runCliIn = async (cwd: string) => {
  const child = spawn(process.execPath, [resolve(process.cwd(), "build/index.js")], { cwd, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  for (const stream of [child.stdout, child.stderr]) {
    stream.on("data", (chunk) => {
      output += chunk;
    });
  }
  const [code] = await once(child, "close");
  return { code, output };
};

const runCli = async (packageName: string, buildArgs: string[] = []) => {
  const cwd = resolve(dirname(fileURLToPath(import.meta.url)), `packages/${packageName}`);
  await execFileAsync("npm", ["run", "build", "--", ...buildArgs], { cwd });
  return runCliIn(cwd);
};

export default runCli;
