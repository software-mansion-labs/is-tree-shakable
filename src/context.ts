import { Program } from "acorn";
import { SourceMapConsumer } from "source-map";
import RootVariable from "./rootVariable";

type Context = {
  body: Program["body"];
  code: string;
  nodeIndex: number;
  getRootVariables: () => RootVariable[];
  getSourceMapConsumer: (path?: string) => Promise<SourceMapConsumer>;
};

export default Context;
