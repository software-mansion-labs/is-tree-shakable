import { ExpressionStatement } from "acorn";
import walk from "acorn-walk";
import getNamesFromPattern from "./getNamesFromPattern";
import Context from "./context";
import Problem from "./problem";
import getSourcePosition from "./getSourcePosition";

const checkExpressionStatement = async (statement: ExpressionStatement, context: Context): Promise<Problem | null> => {
  const modifiedVariableNames: string[] = [];
  let skip = false;
  walk.simple(statement, {
    AssignmentExpression: (expression) => {
      if (!getNamesFromPattern(expression.left, modifiedVariableNames)) skip = true;
    },
    UpdateExpression: (expression) => {
      if (expression.argument.type !== "Identifier") {
        skip = true;
        return;
      }
      modifiedVariableNames.push(expression.argument.name);
    },
  });
  if (skip) return null;
  let modifiedRootVariableNames: string[] = [];
  for (const rootVariable of context.getRootVariables()) {
    if (rootVariable.declarationStart > statement.start) break;
    if (modifiedVariableNames.includes(rootVariable.name)) modifiedRootVariableNames.push(rootVariable.name);
  }
  skip = false;
  for (const node of context.body.slice(context.nodeIndex + 1)) {
    if (skip) break;
    walk.simple(node, {
      Identifier: (identifier) => {
        if (modifiedRootVariableNames.includes(identifier.name)) skip = true;
      },
    });
  }
  if (skip) return null;
  return {
    description: "Possibly side-effectful root-level expression.",
    position: await getSourcePosition(context, statement.expression.loc),
  };
};

export default checkExpressionStatement;
