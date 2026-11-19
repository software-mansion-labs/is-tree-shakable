let number = 0;
number++;
number = 0;
console.log(number);

if (globalThis.toString()) {
  console.log();
}

class Class {
  static {
    number++;
    console.log();
  }
}

const pure = () => 1;
class Fields {
  static literal = 42;
  static pureCall = pure();
  static annotated = /* @__PURE__ */ console.log("annotated");
  instance = console.log("only when constructed");
  static #effect = console.log("at definition");
  [globalThis.toString()]() {}
}

export default class {
  static x = console.log("default export");
}

const keys = {
  get field(): "key" {
    console.log("computing the key");
    return "key";
  },
};
class Local {
  static x = console.log("local class");
  static [keys.field] = 1;
}
