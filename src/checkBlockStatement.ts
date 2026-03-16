import { BlockStatement } from "acorn";
import Context from "./context";
import SourcePosition from "./sourcePosition";
import getSourcePosition from "./getSourcePosition";
import isExpressionStatementPossiblySideEffectful from "./isExpressionStatementPossiblySideEffectful";
import hasSuppression from "./hasSuppression";

const checkBlockStatement = async (statement: BlockStatement, context: Context) => {
  if (hasSuppression(statement, context)) return [];
  const positions: SourcePosition[] = [];
  for (const node of statement.body) {
    if (node.type !== "ExpressionStatement" || hasSuppression(node, context)) continue;
    if (await isExpressionStatementPossiblySideEffectful(node, context)) {
      positions.push(await getSourcePosition(node.expression.loc, context));
    }
  }
  return positions;
};

export default checkBlockStatement;
