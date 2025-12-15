/*
 * Copyright (c) 2018-22 [these people](https://github.com/rich-harris/agadoo/graphs/contributors)

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy, modify, merge, publish, 
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import virtual from "@rollup/plugin-virtual";
import nodeResolve from "@rollup/plugin-node-resolve";
import { rollup } from "rollup";
import { parse } from "acorn";
import { isAbsolute } from "path";
import Options from "./options";

const BARE_SPECIFIER_REGEX = /^[^.\0]/;

const build = async (entryPointPath: string, options: Options) => {
  const build = await rollup({
    external: (id) => id !== "is-tree-shakable" && !isAbsolute(id) && BARE_SPECIFIER_REGEX.test(id),
    input: "is-tree-shakable",
    onwarn: () => {},
    plugins: [nodeResolve(options.resolution), virtual({ "is-tree-shakable": `import ${JSON.stringify(entryPointPath)}` })],
  });
  const { output } = await build.generate({ format: "esm", sourcemap: true });
  const [{ code, map }] = output;
  const program = parse(code, { ecmaVersion: "latest", locations: true, sourceType: "module" });
  return { program, code, sourceMap: map };
};

export default build;
