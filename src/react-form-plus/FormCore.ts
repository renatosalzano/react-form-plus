import { FormControl } from "./FormControl";

export class FormCore {
  private options = {};
  public values: { [key: string]: any } = {};
  public errors: { [key: string]: any } = {};
  private path: { [key: string]: any } = {};
  private fristTest = false;

  constructor(schema: { [key: string]: any }) {
    try {
      if (typeof schema !== "object") throw new Error("Schema must be an object");
      this.values = schema;
      this.initController(schema);
    } catch (err) {
      console.error(err);
    }
  }
  private initController(object: { [key: string]: any }, prefix?: string) {
    const keys = Object.keys(object);
    prefix = prefix ? prefix + "." : "";
    return keys.reduce((result: string[], key) => {
      if (object[key] instanceof FormControl) {
        // eslint-disable-next-line no-eval
        this.path[key] = eval(`this.values.${prefix + key}`);
        this.path[key] = object[key];
        this.testDependencies(object[key]);
      } else {
        result = [...result, ...this.initController(object[key], prefix + key)];
      }

      return result;
    }, []);
  }

  private testDependencies(control: FormControl) {
    if (control.hasDependency) {
      for (let controlName in control.getDependencies()) {
        const formControl = this.get(controlName);
        if (!this.fristTest) {
          control.testCondition(controlName, formControl.value);
          this.fristTest = true;
        }
        formControl.valueChanges.subscribe((value) => control.testCondition(controlName, value));
      }
    }
  }

  public async validate() {}

  public get(name: string): FormControl {
    try {
      if (this.path[name] instanceof FormControl) {
        return this.path[name];
      } else throw new Error(`FORM CORE:\n ${name} is undefined`);
    } catch (error) {
      console.error(error);
      return new FormControl();
    }
  }

  public getValues() {
    return this.values;
  }
  /* public reset(controlName?: string) {
    if (controlName) {
      this.get(controlName).reset();
    }
  } */
}

class Controller {
  constructor(public formControl: FormControl) {}
}
