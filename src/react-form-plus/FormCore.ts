import { Control } from "./FormControl";

export class FormCore {
  private options = {};
  public values: { [key: string]: any } = {};
  public errors: { [key: string]: any } = {};
  private path: { [key: string]: any } = {};

  constructor(schema: { [key: string]: any }) {
    try {
      if (typeof schema !== "object") throw new Error("Schema must be an object");
      this.values = schema;
      this.initSchema(schema);
      console.log(this.path);
    } catch (err) {
      console.error(err);
    }
  }
  private initSchema(object: { [key: string]: any }, prefix?: string) {
    const keys = Object.keys(object);
    prefix = prefix ? prefix + "." : "";
    return keys.reduce((result: string[], key) => {
      if (typeof object[key] === "object" && !Array.isArray(object[key])) {
        result = [...result, ...this.initSchema(object[key], prefix + key)];
      } else {
        // eslint-disable-next-line no-eval
        this.path[key] = eval(`this.values.${prefix + key}`);
        this.path[key] = new Control(object[key]);
      }
      return result;
    }, []);
  }

  public async validate() {}

  public get(name: string): Control {
    try {
      if (this.path[name] instanceof Control) {
        return this.path[name];
      } else throw new Error(`${name} undefined`);
    } catch (error) {
      console.error(error);
      return new Control("ERROR");
    }
  }

  public getValues() {
    return this.values;
  }
  public reset(controlName?: string) {
    if (controlName) {
      this.get(controlName).reset();
    }
  }
}
