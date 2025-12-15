import { Comment, Program } from "acorn";
import RootVariable from "./rootVariable";
import GetSourceMapConsumer from "./getSourceMapConsumer";

type Context = {
  body: Program["body"];
  code: string;
  nodeIndex: number;
  getRootVariables: () => RootVariable[];
  getSourceMapConsumer: GetSourceMapConsumer;
  comments: Comment[];
  reportSuppression: () => void;
};

export default Context;
