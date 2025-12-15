import RESOLUTION from "./resolution";
import Options from "./options";
import { InputError } from "./errors";

const getOptions = (): Options => {
  const args = process.argv.slice(2);
  let resolution = RESOLUTION.base;
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (argument === "--resolution") {
      const value = args[index + 1];
      if (!value) throw new InputError("No `--resolution` value.");
      if (!(value in RESOLUTION)) throw new InputError("Unknown `--resolution` value.");
      resolution = RESOLUTION[value];
      index++;
      continue;
    }
    throw new InputError(`Unknown argument \`${argument}\`.`);
  }
  return { resolution };
};

export default getOptions;
