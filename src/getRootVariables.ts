import { Program } from "acorn";
import getNamesFromPattern from "./getNamesFromPattern";
import RootVariable from "./rootVariable";

const getRootVariables = (body: Program["body"]) => {
  const variables: RootVariable[] = [];
  for (const node of body) {
    if (node.type !== "VariableDeclaration" || (node.kind !== "let" && node.kind !== "var")) continue;
    const names: string[] = [];
    for (const declaration of node.declarations) getNamesFromPattern(declaration.id, names);
    for (const name of names) variables.push({ name, declarationStart: node.start });
  }
  return variables.reverse();
};

export default getRootVariables;
