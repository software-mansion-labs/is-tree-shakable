import { readFile } from "fs/promises";
import SourcePosition from "./sourcePosition";
import chalk from "chalk";

const DESCRIPTION = "Possibly side-effectful expression.";

const printProblem = async (position: SourcePosition) => {
  const sourceContent = await readFile(position.path, "utf8");
  const positionSuffix = `${position.start.line}:${position.start.column}`;
  console.error();
  console.error(`• ${chalk.blue(`${position.path}:${positionSuffix}`)}: ${DESCRIPTION}`);
  console.error();
  const sourceLines = sourceContent.split("\n").slice(position.start.line - 1, position.end.line);
  const gutterWidth = position.start.line.toString().length;
  for (const [index, line] of sourceLines.entries()) {
    const lineNumber = position.start.line + index;
    let underlineStartColumn = 0;
    let underlineEndColumn = line.length - 1;
    if (lineNumber === position.start.line) underlineStartColumn = position.start.column;
    if (lineNumber === position.end.line) underlineEndColumn = position.end.column;
    const paddedLineNumber = lineNumber.toString().padStart(gutterWidth);
    const prefix = line.slice(0, underlineStartColumn);
    const underlined = line.slice(underlineStartColumn, underlineEndColumn + 1);
    const suffix = line.slice(underlineEndColumn + 1);
    console.error(`    ${chalk.dim(paddedLineNumber)}  ${prefix}${chalk.underline(underlined)}${suffix}`);
  }
};

export default printProblem;
