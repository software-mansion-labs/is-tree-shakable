import { resolve } from "path";
import build from "../src/build";

(async () => {
  console.log((await build(resolve(__dirname, "index.js"))).code);
})();
