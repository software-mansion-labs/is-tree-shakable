import { RollupNodeResolveOptions } from "@rollup/plugin-node-resolve";

const MODULE_EXTENSIONS = [".js", ".mjs"];
const BASE_EXTENSIONS = [...MODULE_EXTENSIONS, ".json", ".node"];

const getExtensions = (suffixes: string[]) => [
  ...new Set([...suffixes.flatMap((suffix) => MODULE_EXTENSIONS.map((extension) => `${suffix}${extension}`)), ...BASE_EXTENSIONS]),
];

const RESOLUTION: Record<string, RollupNodeResolveOptions> = {
  base: {},
  web: { exportConditions: ["browser"], extensions: getExtensions([".web"]), mainFields: ["browser", "module", "main"] },
};

export default RESOLUTION;
