import { FormCore } from "./FormCore";
import { isArray } from "./utils/isArray";
import { AnySchema } from "./Validator";

interface Options {
  disabled?: boolean;
  touched?: boolean;
  dependency?: Dependency;
}

export interface Dependency {
  [key: string]: {
    is: string | number | boolean | ((args: any) => boolean);
    disabled?: boolean;
    validator?: AnySchema;
  };
}

export type FormControl = [any, AnySchema] | [any, AnySchema, Options];

type TControl = any | FormControl;

export class Control {
  private observer: any[] = [];

  private validator?: AnySchema;

  private mounted = false;
  private defaultValue: any;
  public value: any;
  public disabled = false;
  public touched = false;
  public valid = false;
  public error = "";

  public dependency: Dependency = {};

  constructor(initControl: TControl) {
    if (isArray(initControl)) {
      const [value, validator, options] = [...initControl];
      this.defaultValue = initControl[0];
      this.value = value;
      this.validator = validator;
      if (options) this.checkOptions(options);
    } else {
      this.defaultValue = initControl;
      this.value = initControl;
    }
  }
  private checkOptions(options: Options) {
    if (options.touched) this.touched = true;
    if (options.disabled) this.disabled = true;
    if (options.dependency) this.dependency = options.dependency;
  }

  public setValue(value: any) {
    this.touched = true;
    this.value = value;
    if (this.validator) {
      const { valid, error } = this.validator.validate(value);
      console.log(valid, error);
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

  public mount() {
    this.mounted = true;

    return this;
  }

  public isMounted() {
    return this.mounted;
  }
}
