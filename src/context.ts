import { Program } from "acorn";
import RootVariable from "./rootVariable";
import GetSourceMapConsumer from "./getSourceMapConsumer";

type Context = {
  body: Program["body"];
  code: string;
  nodeIndex: number;
  getRootVariables: () => RootVariable[];
  getSourceMapConsumer: GetSourceMapConsumer;
};

export default Context;
