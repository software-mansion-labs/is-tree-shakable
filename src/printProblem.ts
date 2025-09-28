import { readFile } from "fs/promises";
import Problem from "./problem";
import chalk from "chalk";

const printProblem = async (problem: Problem) => {
  const sourceContent = await readFile(problem.position.path, "utf8");
  const positionSuffix = `${problem.position.start.line}:${problem.position.start.column}`;
  console.error();
  console.error(`• ${chalk.blue(`${problem.position.path}:${positionSuffix}`)}: ${problem.description}`);
  console.error();
  const sourceLines = sourceContent.split("\n").slice(problem.position.start.line - 1, problem.position.end.line);
  const gutterWidth = problem.position.start.line.toString().length;
  for (const [index, line] of sourceLines.entries()) {
    const lineNumber = problem.position.start.line + index;
    let underlineStartColumn = 0;
    let underlineEndColumn = line.length - 1;
    if (lineNumber === problem.position.start.line) underlineStartColumn = problem.position.start.column;
    if (lineNumber === problem.position.end.line) underlineEndColumn = problem.position.end.column;
    const paddedLineNumber = lineNumber.toString().padStart(gutterWidth);
    const prefix = line.slice(0, underlineStartColumn);
    const underlined = line.slice(underlineStartColumn, underlineEndColumn + 1);
    const suffix = line.slice(underlineEndColumn + 1);
    console.error(`    ${chalk.dim(paddedLineNumber)}  ${prefix}${chalk.underline(underlined)}${suffix}`);
  }
};

export default printProblem;
