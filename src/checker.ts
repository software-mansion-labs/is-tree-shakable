import { Comment, Program } from "acorn";
import checkExpressionStatement from "./checkExpressionStatement";
import getRootVariables from "./getRootVariables";
import { SourceMap } from "rollup";
import { SourceMapConsumer } from "source-map";
import { readFile } from "fs/promises";
import { dirname, join } from "path";
import Context from "./context";
import Problem from "./problem";
import RootVariable from "./rootVariable";
import { InternalError } from "./errors";
import checkClassDeclaration from "./checkClassDeclaration";
import GetSourceMapConsumer from "./getSourceMapConsumer";

const INLINE_SOURCE_MAP_PREFIX = "data:";
const SOURCE_MAP_REGEX = /\/\/[#@]\s*sourceMappingURL=(\S+)/;

const decodeSourceMap = (reference: string) => {
  const commaIndex = reference.indexOf(",");
  const metadata = reference.slice(INLINE_SOURCE_MAP_PREFIX.length, commaIndex).toLowerCase();
  const payload = reference.slice(commaIndex + 1);
  return metadata.includes(";base64") ? Buffer.from(payload, "base64").toString("utf-8") : decodeURIComponent(payload);
};

class Checker {
  private program: Program;
  private readonly code: string;
  private readonly sourceMap: SourceMap | null;
  private readonly comments: Comment[];

  private rootVariables: RootVariable[] | null = null;
  private internalSourceMapConsumer: SourceMapConsumer | null = null;
  private sourceMapConsumers: { [path: string]: SourceMapConsumer | null } = {};
  private problems: Problem[] = [];
  private hasSuppression = false;

  constructor(program: Program, code: string, sourceMap: SourceMap | null, comments: Comment[]) {
    this.program = program;
    this.code = code;
    this.sourceMap = sourceMap;
    this.comments = comments;
  }

  private addProblems = (problems: Problem[]) => {
    for (const problem of problems) this.problems.push(problem);
  };

  private getRootVariables = () => {
    if (this.rootVariables === null) this.rootVariables = getRootVariables(this.program.body);
    return this.rootVariables;
  };

  private getSourceMapConsumer = async (path?: string) => {
    if (path === undefined) {
      if (this.internalSourceMapConsumer === null) {
        if (this.sourceMap === null) throw new InternalError("Source map doesn’t exist.");
        this.internalSourceMapConsumer = await new SourceMapConsumer(this.sourceMap);
      }
      return this.internalSourceMapConsumer;
    }
    if (!(path in this.sourceMapConsumers)) {
      const reference = (await readFile(path, "utf-8")).match(SOURCE_MAP_REGEX)?.[1];
      if (reference === undefined) {
        this.sourceMapConsumers[path] = null;
        return null;
      }
      const raw = reference.startsWith(INLINE_SOURCE_MAP_PREFIX)
        ? decodeSourceMap(reference)
        : await readFile(join(dirname(path), reference), "utf-8");
      this.sourceMapConsumers[path] = await new SourceMapConsumer(raw);
    }
    return this.sourceMapConsumers[path];
  };

  private reportSuppression = () => {
    this.hasSuppression = true;
  };

  private getContext = (nodeIndex: number): Context => ({
    body: this.program.body,
    code: this.code,
    nodeIndex: nodeIndex,
    getRootVariables: this.getRootVariables,
    getSourceMapConsumer: this.getSourceMapConsumer as GetSourceMapConsumer,
    comments: this.comments,
    reportSuppression: this.reportSuppression,
  });

  async check() {
    const startNodeIndex = this.program.body.findIndex((node) => node.type !== "ImportDeclaration");
    if (startNodeIndex === -1) return true;
    for (let index = startNodeIndex; index < this.program.body.length; index++) {
      const node = this.program.body[index];
      const context = this.getContext(index);
      switch (node.type) {
        case "ExpressionStatement":
          this.addProblems(await checkExpressionStatement(node, context));
          break;
        case "ClassDeclaration":
          this.addProblems(await checkClassDeclaration(node, context));
          break;
      }
    }
    if (this.problems.length === 0 && this.hasSuppression) return false;
    return this.problems;
  }
}

export default Checker;
