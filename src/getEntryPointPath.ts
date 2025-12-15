import { existsSync } from "fs";
import { resolve } from "path";
import Options from "./options";
import { InputError } from "./errors";

const DEFAULT_MAIN_FIELDS = ["module", "main"];
const DEFAULT_EXTENSIONS = [".js"];

const getEntryPointPath = (packageJSON: Record<string, unknown>, options: Options): string => {
  const mainFields =
    options.resolution.mainFields !== undefined && options.resolution.mainFields.length > 0
      ? options.resolution.mainFields
      : DEFAULT_MAIN_FIELDS;
  const extensions =
    options.resolution.extensions !== undefined && options.resolution.extensions.length > 0
      ? options.resolution.extensions
      : DEFAULT_EXTENSIONS;
  for (const mainField of mainFields) {
    const path = packageJSON[mainField];
    if (typeof path !== "string") continue;
    const resolved = resolve(path);
    if (existsSync(resolved)) return resolved;
    if (extensions.some((extension) => path.endsWith(extension))) continue;
    for (const extension of extensions) {
      const resolvedWithExtension = resolve(`${path}${extension}`);
      if (existsSync(resolvedWithExtension)) return resolvedWithExtension;
    }
  }
  throw new InputError("No entry point.");
};

export default getEntryPointPath;
