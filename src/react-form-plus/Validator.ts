export type AnySchema = StringSchema;

class Schema<T> {
  private valid = false;
  private errors: string[] = [];
  private rules: ((value: T) => void)[] = [];
  public required(message = "Required") {
    this.rules.unshift((value: T) => {
      if (value) {
        this.valid = true;
      } else {
        this.valid = false;
        this.errors.unshift(message);
      }
    });
    return this;
  }
  public validate(value: T, abortEarly = false) {
    this.errors = [];
    this.rules.forEach((rule) => rule(value));
  }
  public resolve() {
    return { valid: this.valid, errors: this.errors };
  }
}

class StringSchema extends Schema<string> {
  constructor(readonly schema: Schema<string>) {
    super();
  }
  required(message?: string) {
    return super.required(message);
  }
}

class NumberSchema {}

export class Validator {
  static string() {
    return new StringSchema(new Schema<string>());
  }
}

export class TestSchema extends Schema<any> {
  constructor(readonly schema: Schema<any>) {
    super();
  }
  validate(value: any, abortEarly = false) {
    return super.validate(value, abortEarly);
  }
}
