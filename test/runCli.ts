import { spawn } from "child_process";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { once } from "events";
import execFileAsync from "./execFileAsync";

const runCli = async (packageName: string): Promise<{ code: number; output: string }> => {
  const path = resolve(dirname(fileURLToPath(import.meta.url)), `packages/${packageName}`);
  await execFileAsync("npm", ["run", "build"], { cwd: path });
  const child = spawn(process.execPath, [resolve(process.cwd(), "build/index.js")], {
    cwd: path,
    env: process.env,
    stdio: ["pipe", "pipe", "pipe"],
  });
  let output = "";
  child.stderr?.on("data", (chunk) => {
    output += chunk;
  });
  const [result] = await Promise.race([
    once(child, "close"),
    once(child, "error").then(([error]) => {
      throw error;
    }),
  ]);
  return { code: Array.isArray(result) ? result[0] : result, output };
};

export default runCli;
