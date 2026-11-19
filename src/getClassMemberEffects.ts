import { MethodDefinition, Node, Program, PropertyDefinition, tokenizer } from "acorn";
import virtual from "@rollup/plugin-virtual";
import { rollup } from "rollup";
import { randomUUID } from "crypto";

// Acorn's expression range omits enclosing parentheses and leading pure annotations.
// Only scan the punctuation around the operand so the copy includes both.
const operandRange = (code: string, member: MethodDefinition | PropertyDefinition, expression: Node) => {
  const prefixStart = expression === member.key ? member.start : member.key.end;
  let start = prefixStart;
  for (const token of tokenizer(code.slice(prefixStart, expression.start), { ecmaVersion: "latest" })) {
    if (token.type.label !== "(") start = prefixStart + token.end;
  }
  for (const token of tokenizer(code.slice(expression.end, member.end), { ecmaVersion: "latest" })) {
    if (token.type.label !== ")") return { start, end: expression.end + token.start };
  }
  return { start, end: member.end };
};

const getClassMemberEffects = async (body: Program["body"], code: string) => {
  const expressions = new Map<string, Node>();
  const effects = new Set<Node>();
  const markerModule = `_its_${randomUUID().replace(/-/g, "")}`;
  const parts: string[] = [];
  let offset = 0;

  // Rollup retains whole class members even if their values are pure. In an
  // analysis-only copy, turn each operand into (/* @__PURE__ */ mark(expr), expr).
  // The unused call's import survives only when evaluating its argument has effects.
  const probe = (member: MethodDefinition | PropertyDefinition, expression: Node) => {
    const name = `${markerModule}_${expressions.size}`;
    expressions.set(name, expression);
    const { start, end } = operandRange(code, member, expression);
    const source = code.slice(start, end);
    parts.push(code.slice(offset, start), `(/* @__PURE__ */ ${name}(${source}\n),${source}\n)`);
    offset = end;
  };

  for (const declaration of body) {
    if (declaration.type !== "ClassDeclaration") continue;
    for (const member of declaration.body.body) {
      if (member.type === "StaticBlock") continue;
      if (member.computed) probe(member, member.key);
      if (member.type === "PropertyDefinition" && member.static && member.value) probe(member, member.value);
    }
  }
  if (expressions.size === 0) return effects;

  const input = "class-member-effects";
  const imports = `import { ${[...expressions.keys()].join(", ")} } from "${markerModule}";\n`;
  parts.push(code.slice(offset));
  const bundle = await rollup({
    input,
    external: (_id, importer) => importer !== undefined,
    plugins: [virtual({ [input]: imports + parts.join("") })],
    onwarn: () => {},
  });
  try {
    const { output } = await bundle.generate({ format: "esm" });
    for (const name of output[0].importedBindings[markerModule] ?? []) effects.add(expressions.get(name)!);
    return effects;
  } finally {
    await bundle.close();
  }
};

export default getClassMemberEffects;
