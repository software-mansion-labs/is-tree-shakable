import { Program } from "acorn";
import checkExpressionStatement from "./checkExpressionStatement";
import getRootVariables from "./getRootVariables";
import { SourceMap } from "rollup";
import { SourceMapConsumer } from "source-map";
import { readFile } from "fs/promises";
import Context from "./context";
import Problem from "./problem";
import RootVariable from "./rootVariable";
import { InternalError } from "./errors";

class Checker {
  private program: Program;
  private code: string;
  private sourceMap: SourceMap | null;

  private rootVariables: RootVariable[] | null = null;
  private internalSourceMapConsumer: SourceMapConsumer | null = null;
  private sourceMapConsumers: { [path: string]: SourceMapConsumer } = {};
  private problems: Problem[] = [];

  constructor(program: Program, code: string, sourceMap: SourceMap | null) {
    this.program = program;
    this.code = code;
    this.sourceMap = sourceMap;
  }

  private addProblem = (problem: Problem | null) => {
    if (problem !== null) this.problems.push(problem);
  };

  private getRootVariables = () => {
    if (this.rootVariables === null) this.rootVariables = getRootVariables(this.program.body);
    return this.rootVariables;
  };

  private getSourceMapConsumer = async (path?: string) => {
    if (path === undefined) {
      if (this.internalSourceMapConsumer === null) {
        if (this.sourceMap === null) throw new InternalError("Source map doesn’t exist.");
        const consumer = await new SourceMapConsumer(this.sourceMap);
        this.internalSourceMapConsumer = consumer;
      }
      return this.internalSourceMapConsumer;
    }
    if (!(path in this.sourceMapConsumers)) {
      const sourceMap = await readFile(path, "utf-8");
      this.sourceMapConsumers[path] = await new SourceMapConsumer(sourceMap);
    }
    return this.sourceMapConsumers[path];
  };

  private getContext = (nodeIndex: number): Context => ({
    body: this.program.body,
    code: this.code,
    nodeIndex: nodeIndex,
    getRootVariables: this.getRootVariables,
    getSourceMapConsumer: this.getSourceMapConsumer,
  });

  public async check(): Promise<true | Problem[]> {
    const startNodeIndex = this.program.body.findIndex((node) => node.type !== "ImportDeclaration");
    if (startNodeIndex === -1) return true;
    for (let index = startNodeIndex; index < this.program.body.length; index++) {
      const node = this.program.body[index];
      const context = this.getContext(index);
      switch (node.type) {
        case "ExpressionStatement":
          this.addProblem(await checkExpressionStatement(node, context));
          break;
      }
    }
    return this.problems;
  }
}

export default Checker;
