import { ClassDeclaration, Node } from "acorn";
import Context from "./context";
import SourcePosition from "./sourcePosition";
import getSourcePosition from "./getSourcePosition";
import checkExpressionStatement from "./checkExpressionStatement";
import hasSuppression from "./hasSuppression";

const checkClassDeclaration = async (declaration: ClassDeclaration, context: Context, effects: Set<Node>) => {
  if (hasSuppression(declaration, context, context.body[context.nodeIndex + 1])) return [];
  const positions: SourcePosition[] = [];
  const members = declaration.body.body;
  for (const [index, member] of members.entries()) {
    if (member.type === "StaticBlock") {
      if (hasSuppression(member, context, members[index + 1])) continue;
      for (const statement of member.body) {
        if (statement.type === "ExpressionStatement") positions.push(...(await checkExpressionStatement(statement, context)));
      }
      continue;
    }
    const operands = member.type === "PropertyDefinition" && member.value ? [member.key, member.value] : [member.key];
    for (const operand of operands) {
      if (effects.has(operand) && !hasSuppression(member, context, members[index + 1])) {
        positions.push(await getSourcePosition(operand.loc, context));
      }
    }
  }
  return positions;
};

export default checkClassDeclaration;
