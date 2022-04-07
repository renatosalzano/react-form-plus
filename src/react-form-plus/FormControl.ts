import { isArray } from "./utils/isArray";
import { AnySchema, TestSchema } from "./Validator";

interface Options {
  schema?: AnySchema;
  disabled?: boolean;
  touched?: boolean;
  when?: When;
}

export interface When {
  [key: string]: {
    is: ((value: any) => boolean) | (string | number | boolean);
    touched?: boolean;
    disabled?: boolean;
    schema?: AnySchema;
  };
}
type Condition = string | number | ((value: any) => boolean);
class Methods {
  static some(conditon?: Condition) {}
  static every(conditon?: Condition) {}
}

class Then {}

export class Option {
  public schema: AnySchema;
  public touched = false;
  public disabled = false;

  constructor({
    schema,
    touched,
    disabled,
    when,
  }: {
    schema: AnySchema;
    touched?: boolean;
    disabled?: boolean;
    when?: (field: string | string[]) => Test;
  }) {
    this.schema = schema;
  }
}

export type FormControl = [any, AnySchema | Options];

type InitControl = any | FormControl;

function isOptions(object: any) {
  if (object.schema) return true;
  else return false;
}

export class Control {
  private observer: any[] = [];

  private validator?: TestSchema;
  private schema: AnySchema = new TestSchema();

  private mounted = false;
  private defaultValue: any;

  public value: any;
  public disabled = false;
  public touched = false;
  public valid = false;
  public error = "";

  public dependencies: string[] = [];
  private when: When = {};

  constructor(initControl: InitControl) {
    if (isArray(initControl)) {
      const [value, rest] = [...initControl] as FormControl;
      this.defaultValue = value;
      this.value = value;
      if (isOptions(rest)) {
        const options = rest as Options;
        this.updateOptions(options);
      } else {
        const schema = rest as AnySchema;
        this.schema = schema;
      }
    } else {
      this.defaultValue = initControl;
      this.value = initControl;
    }
  }
  public updateOptions(options: Options) {
    if (options.touched) this.touched = options.touched;
    if (options.disabled) this.disabled = options.disabled;
    if (options.schema) this.schema = options.schema;
    if (options.when) {
      this.when = options.when;
      for (let name in options.when) {
        this.dependencies.push(name);
      }
    }
  }

  public testDependency(name: string, value: any) {
    if (this.when[name]) {
      switch (typeof this.when[name].is) {
        case "number":
        case "string":
          return value === this.when[name].is;
        case "boolean":
          return !!value;
        case "function":
          const _ = this.when[name].is as (value: any) => boolean;
          return _(value);
      }
    } else return false;
  }

  public setValue(value: any) {
    this.touched = true;
    this.value = value;
    if (this.validator) {
    }
    this.notify(value);
  }
  public reset() {
    this.value = this.defaultValue;
    this.valid = false;
    this.touched = false;
    this.error = "";
  }
  public subscribe(callback: (value?: any) => void) {
    this.observer.push(callback);
  }

  private notify(value: any) {
    this.observer.forEach((obs) => obs(value));
  }

  private dispatch = {
    setValue(value: any) {},
    setDisabled(disabled: boolean) {},
    setTouched(touched: boolean) {},
  };

  public mount() {
    this.mounted = true;

    return this;
  }

  public isMounted() {
    return this.mounted;
  }
}
