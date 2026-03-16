import { ExpressionStatement } from "acorn";
import Context from "./context";
import getSourcePosition from "./getSourcePosition";
import isExpressionStatementPossiblySideEffectful from "./isExpressionStatementPossiblySideEffectful";
import hasSuppression from "./hasSuppression";

const checkExpressionStatement = async (statement: ExpressionStatement, context: Context) => {
  if (hasSuppression(statement, context) || !(await isExpressionStatementPossiblySideEffectful(statement, context))) return [];
  return [await getSourcePosition(statement.expression.loc, context)];
};

export default checkExpressionStatement;
