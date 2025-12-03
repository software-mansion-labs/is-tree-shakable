import { ExpressionStatement } from "acorn";
import * as walk from "acorn-walk";
import Context from "./context";
import getNamesFromPattern from "./getNamesFromPattern";
import isRootVariableUsedOutside from "./isRootVariableUsedOutside";
import RootVariable from "./rootVariable";

const isExpressionStatementPossiblySideEffectful = async (statement: ExpressionStatement, context: Context) => {
  const modifiedVariableNames: string[] = [];
  let skip = false;
  walk.simple(statement, {
    AssignmentExpression: (expression) => {
      skip ||= !getNamesFromPattern(expression.left, modifiedVariableNames);
    },
    UpdateExpression: (expression) => {
      if (expression.argument.type !== "Identifier" && expression.argument.type !== "MemberExpression") {
        skip = true;
        return;
      }
      skip ||= !getNamesFromPattern(expression.argument, modifiedVariableNames);
    },
  });
  if (skip) return false;
  const modifiedRootVariables: RootVariable[] = [];
  for (const rootVariable of context.getRootVariables()) {
    if (rootVariable.declarationStart > statement.start) break;
    if (modifiedVariableNames.includes(rootVariable.name)) modifiedRootVariables.push(rootVariable);
  }
  return !isRootVariableUsedOutside(statement, modifiedRootVariables, context);
};

export default isExpressionStatementPossiblySideEffectful;
