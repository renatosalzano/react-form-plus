
export type AnySchema = StringSchema;

class StringSchema {
  private valid = false;
  private error = "";
  private rules: ((value: string) => void)[] = [];
  private checkError() {
    if (this.error) {
      return { error: this.error, valid: false };
    }
  }
  private returnSchema() {
    return { valid: this.valid, error: this.error };
  }
  min(minLenght: number, message?: string) {
    this.rules.push((value: string) => {
      this.checkError();
      if (value.length < minLenght) {
        this.valid = false;
      } else {
        this.valid = true;
      }
      return this.returnSchema();
    });
    return this;
  }
  max() {
    return this;
  }
  required(message?: string) {
    this.rules.unshift((value: any) => {
      if (value !== "") {
        this.valid = true;
        this.error = "";
      } else {
        this.valid = false;
        this.error = message ? message : "Required";
      }
    });
    return this;
  }
  validate(value: string) {
    this.error = "";
    this.rules.forEach((rule) => rule(value));

    return this.returnSchema();
  }
}





export class Validator {
  static string() {
    return new StringSchema();
  }
}

export function validation(schema: Validator) {}
