import { Node } from "acorn";
import * as walk from "acorn-walk";
import Context from "./context";
import RootVariable from "./rootVariable";

const isRootVariableUsedOutside = (node: Node, variables: RootVariable[], context: Context) => {
  if (variables.length === 0) return false;
  let result = false;
  for (const bodyNode of context.body) {
    if (result) break;
    walk.ancestor(bodyNode, {
      Identifier: (identifier, _, ancestors) => {
        if (result || !variables.some((variable) => variable.name === identifier.name) || ancestors.includes(node)) return;
        result = true;
      },
    });
  }
  return result;
};

export default isRootVariableUsedOutside;
