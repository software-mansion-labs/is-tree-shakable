import { ExpressionStatement, ModuleDeclaration, Statement } from "acorn";

const checkExpressionStatement = (node: ExpressionStatement, code: string) => {
  if (node.expression.type !== "CallExpression") return null;
  const callee = code.slice(
    node.expression.callee.start,
    node.expression.callee.end
  );
  return (
    `\`${callee}\` is called at the top level, either stand-alone or in a variable definition; ` +
    `this is potentially side-effectful.`
  );
};

const ignoredNodeTypes = ["FunctionDeclaration", "VariableDeclaration"];

const check = (
  body: (Statement | ModuleDeclaration)[],
  code: string
): true | string[] => {
  let treeShakable = true;
  const problems: string[] = [];
  const addProblem = (problem: string | null) => {
    if (problem !== null) problems.push(problem);
  };
  for (const node of body) {
    if (node.type === "ImportDeclaration") continue;
    treeShakable = false;
    if (ignoredNodeTypes.includes(node.type)) continue;
    if (node.type === "ExpressionStatement") {
      addProblem(checkExpressionStatement(node, code));
    }
  }
  return treeShakable || problems;
};

export default check;
