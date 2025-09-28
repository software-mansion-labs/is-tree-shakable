import { Pattern } from "acorn";

const getNamesFromPattern = (pattern: Pattern, names: string[]): boolean => {
  let result = true;
  switch (pattern.type) {
    case "Identifier":
      names.push(pattern.name);
      break;
    case "ObjectPattern":
      for (const property of pattern.properties) {
        switch (property.type) {
          case "Property":
            result &&= getNamesFromPattern(property.value, names);
            break;
          case "RestElement":
            result &&= getNamesFromPattern(property.argument, names);
            break;
        }
      }
      break;
    case "ArrayPattern":
      for (const element of pattern.elements) {
        if (element === null) continue;
        result &&= getNamesFromPattern(element, names);
      }
      break;
    case "RestElement":
      result &&= getNamesFromPattern(pattern.argument, names);
      break;
    case "AssignmentPattern":
      result &&= getNamesFromPattern(pattern.left, names);
      break;
    default:
      result = false;
      break;
  }
  return result;
};

export default getNamesFromPattern;
