import { IfStatement } from "acorn";
import Context from "./context";
import SourcePosition from "./sourcePosition";
import getSourcePosition from "./getSourcePosition";
import isExpressionStatementPossiblySideEffectful from "./isExpressionStatementPossiblySideEffectful";
import hasSuppression from "./hasSuppression";

const checkIfStatement = async (statement: IfStatement, context: Context) => {
  if (hasSuppression(statement, context)) return [];
  const positions: SourcePosition[] = [];
  positions.push(await getSourcePosition(statement.test.loc, context));
  if (statement.consequent.type === "BlockStatement") {
    for (const node of statement.consequent.body) {
      if (node.type !== "ExpressionStatement" || hasSuppression(node, context)) continue;
      if (await isExpressionStatementPossiblySideEffectful(node, context)) {
        positions.push(await getSourcePosition(node.expression.loc, context));
      }
    }
  }
  return positions;
};

export default checkIfStatement;
