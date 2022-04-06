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
    is: string | number | boolean | ((args: any) => boolean);
    touched?: boolean;
    disabled?: boolean;
    schema?: AnySchema;
  };
}

export type FormControl = [any, AnySchema | Options];

type InitControl = any | FormControl;

export class Control {
  private observer: any[] = [];

  private validator?: TestSchema;

  private mounted = false;
  private defaultValue: any;
  public value: any;
  public disabled = false;
  public touched = false;
  public valid = false;
  public error = "";

  public when: When = {};

  constructor(initControl: InitControl) {
    if (isArray(initControl)) {
      const [value, rest] = [...initControl] as FormControl;
      this.defaultValue = value;
      this.value = value;
      if (rest instanceof Schema) {
      }
    } else {
      this.defaultValue = initControl;
      this.value = initControl;
    }
  }
  private checkOptions(options: Options) {
    if (options.touched) this.touched = true;
    if (options.disabled) this.disabled = true;
    if (options.when) this.when = options.when;
  }

  public setValue(value: any) {
    this.touched = true;
    this.value = value;
    if (this.validator) {
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
