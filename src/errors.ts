class InputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InputError";
    Object.setPrototypeOf(this, InputError.prototype);
  }
}

class InternalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InternalError";
    Object.setPrototypeOf(this, InternalError.prototype);
  }
}

export { InputError, InternalError };
