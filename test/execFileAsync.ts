import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export default execFileAsync;
