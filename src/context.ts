import { Program } from "acorn";
import { SourceMapConsumer } from "source-map";
import RootVariable from "./rootVariable";

type GetSourceMapConsumer = {
  (): Promise<SourceMapConsumer>;
  (path: string): Promise<SourceMapConsumer | null>;
};

type Context = {
  body: Program["body"];
  code: string;
  nodeIndex: number;
  getRootVariables: () => RootVariable[];
  getSourceMapConsumer: GetSourceMapConsumer;
};

export default Context;
export type { GetSourceMapConsumer };
