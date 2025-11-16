import { Pattern } from "acorn";
import * as walk from "acorn-walk";

type State = { names: string[]; result: boolean };

const functions: walk.RecursiveVisitors<State> = {
  Identifier: (identifier, state) => {
    state.names.push(identifier.name);
  },
  ObjectPattern: (pattern, state, callback) => {
    for (const property of pattern.properties) {
      switch (property.type) {
        case "Property":
          callback(property.value, state);
          break;
        case "RestElement":
          callback(property.argument, state);
          break;
      }
    }
  },
  ArrayPattern: (pattern, state, callback) => {
    for (const element of pattern.elements) {
      if (element === null) continue;
      callback(element, state);
    }
  },
  RestElement: (element, state, callback) => {
    callback(element.argument, state);
  },
  AssignmentPattern: (pattern, state, callback) => {
    callback(pattern.left, state);
  },
  MemberExpression: (expression, state, callback) => {
    if (expression.object.type !== "Identifier" && expression.object.type !== "MemberExpression") {
      state.result = false;
      return;
    }
    callback(expression.object, state);
  },
};

const getNamesFromPattern = (pattern: Pattern, names: string[]) => {
  const state: State = { names, result: true };
  walk.recursive(pattern, state, functions);
  return state.result;
};

export default getNamesFromPattern;
