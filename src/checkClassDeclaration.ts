import { ClassDeclaration } from "acorn";
import Context from "./context";
import Problem from "./problem";
import getSourcePosition from "./getSourcePosition";
import isExpressionStatementPossiblySideEffectful from "./isExpressionStatementPossiblySideEffectful";
import hasSuppression from "./hasSuppression";

const checkClassDeclaration = async (declaration: ClassDeclaration, context: Context) => {
  const problems: Problem[] = [];
  for (const node of declaration.body.body) {
    if (node.type !== "StaticBlock") continue;
    for (const statement of node.body) {
      if (statement.type !== "ExpressionStatement" || hasSuppression(statement, context)) continue;
      if (await isExpressionStatementPossiblySideEffectful(statement, context)) {
        problems.push({
          description: "Possibly side-effectful expression in static context.",
          position: await getSourcePosition(statement.expression.loc, context),
        });
      }
    }
  }
  return problems;
};

export default checkClassDeclaration;
