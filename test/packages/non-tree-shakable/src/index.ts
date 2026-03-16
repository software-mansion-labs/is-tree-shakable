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
