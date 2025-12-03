import { Node } from "acorn";
import Context from "./context";
import { dirname, relative, resolve } from "path";
import { InputError, InternalError } from "./errors";
import { MappedPosition, NullableMappedPosition } from "source-map";
import { cwd } from "process";
import SourcePosition from "./sourcePosition";

function assertMappedPositionValid(
  position: NullableMappedPosition,
  getError: (message: string) => Error
): asserts position is Omit<MappedPosition, "name"> & Pick<NullableMappedPosition, "name"> {
  if (position.source === null || position.line === null || position.column === null) throw getError("Invalid source map.");
}

const getSourcePosition = async (location: Node["loc"], context: Context): Promise<SourcePosition> => {
  if (location == null) throw new InternalError("`location` is nullish.");
  const internalSourceMapConsumer = await context.getSourceMapConsumer();
  const entryPointStart = internalSourceMapConsumer.originalPositionFor(location.start);
  assertMappedPositionValid(entryPointStart, (message) => new InternalError(message));
  const entryPointEnd = internalSourceMapConsumer.originalPositionFor(location.end);
  assertMappedPositionValid(entryPointEnd, (message) => new InternalError(message));
  const entryPointPath = entryPointStart.source;
  const entryPointDirectoryPath = dirname(entryPointPath);
  const entryPointSourceMapConsumer = await context.getSourceMapConsumer(entryPointPath);
  if (entryPointSourceMapConsumer === null) {
    if (entryPointPath.startsWith("build/") || entryPointPath.startsWith("dist/")) {
      throw new InputError("Missing source map.");
    }
    return {
      path: entryPointPath,
      start: { line: entryPointStart.line, column: entryPointStart.column },
      end: { line: entryPointEnd.line, column: entryPointEnd.column },
    };
  }
  const sourceStart = entryPointSourceMapConsumer.originalPositionFor({ line: entryPointStart.line, column: entryPointStart.column });
  assertMappedPositionValid(sourceStart, (message) => new InputError(message));
  const sourceEnd = entryPointSourceMapConsumer.originalPositionFor({ line: entryPointEnd.line, column: entryPointEnd.column });
  assertMappedPositionValid(sourceEnd, (message) => new InputError(message));
  return {
    path: relative(cwd(), resolve(entryPointDirectoryPath, sourceStart.source)),
    start: { line: sourceStart.line, column: sourceStart.column },
    end: { line: sourceEnd.line, column: sourceEnd.column },
  };
};

export default getSourcePosition;
