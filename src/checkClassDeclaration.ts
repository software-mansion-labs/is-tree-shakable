import { ClassDeclaration } from "acorn";
import Context from "./context";
import SourcePosition from "./sourcePosition";
import getSourcePosition from "./getSourcePosition";
import isExpressionStatementPossiblySideEffectful from "./isExpressionStatementPossiblySideEffectful";
import hasSuppression from "./hasSuppression";

const checkClassDeclaration = async (declaration: ClassDeclaration, context: Context) => {
  const positions: SourcePosition[] = [];
  for (const node of declaration.body.body) {
    if (node.type !== "StaticBlock") continue;
    for (const statement of node.body) {
      if (statement.type !== "ExpressionStatement" || hasSuppression(statement, context)) continue;
      if (await isExpressionStatementPossiblySideEffectful(statement, context)) {
        positions.push(await getSourcePosition(statement.expression.loc, context));
      }
    }
  }
  return positions;
};

export default checkClassDeclaration;
