import { Subject } from "./Subject";
import { AnySchema, NumberSchema, StringSchema } from "./Validator";

export interface FormControlOptions {
  validator: AnySchema;
  validateOn?: "blur" | "change" | "submit";
  touched?: boolean;
  disabled?: boolean;
  requiredGroup?: 1 | 2 | 3 | 4 | 5;
}

interface FormControlThenOptions {
  value?: any;
  validator?: AnySchema;
  touched?: boolean;
  disabled?: boolean;
  requiredGroup?: 1 | 2 | 3 | 4 | 5;
  error?: string | string[];
  reset?: boolean;
}

type Operator = "some" | "every" | "map";
type Condition = undefined | string | number | boolean | object | Date | ((value: any) => boolean);
interface MapCondition {
  [key: string]: Condition;
}

interface Modifiers {
  operator: Operator;
  condition: Condition;
  map: { [key: string]: Condition };
  mapCache: { [key: string]: boolean };
}

export class FormControl {
  private defaultValues: { [key: string]: any } = {};
  private validator?: AnySchema;
  private valid = false;
  private errors: string | string[] = [];
  private requiredGroup: number = 1;

  public value: any;
  public touched = false;
  public disabled = false;

  public hasDependency = false;
  private dependencies: { [key: string]: any } = {};
  private modifiers: Modifiers = {
    operator: "every",
    condition: undefined,
    map: {},
    mapCache: {},
  };

  private options: { prev: { [key: string]: any }; then: FormControlThenOptions } = {
    prev: {},
    then: {},
  };

  private thenOptions: FormControlThenOptions = {};

  public valueChanges: Subject<any> = new Subject(undefined);
  public changes: Subject<{
    value: any;
    touched: boolean;
    disabled: boolean;
    errors: string | string[];
    requiredGroup: number;
  }> = new Subject({ value: "", touched: false, disabled: false, errors: [], requiredGroup: 1 });

  constructor(value: any = null, option?: FormControlOptions | AnySchema) {
    this.value = value;
    this.valueChanges.next(value);
    if (option && isOption(option as FormControlOptions)) {
      this.setControl(option as FormControlOptions);
    } else {
      this.validator = option as AnySchema;
    }
    this.setDefaultValue();
  }

  private setDefaultValue() {
    this.defaultValues = { ...this.getControl() };
    Object.freeze(this.defaultValues);
  }

  private getControl() {
    const { value, touched, disabled, errors, requiredGroup } = this;
    return { value, touched, disabled, errors, requiredGroup };
  }

  public updateOptions(options: FormControlOptions) {
    this.options.prev = { ...options };
  }

  private setControl(options: FormControlThenOptions) {
    if (options.value) this.value = options.value;
    if (options.validator) this.validator = options.validator;
    if (options.touched) this.touched = options.touched;
    if (options.disabled) this.disabled = options.disabled;
    if (options.error) this.errors = options.error;
    if (options.requiredGroup) this.requiredGroup = options.requiredGroup;
    this.changes.next({ ...this.getControl(), ...options });
  }

  setValue(value: any) {
    this.value = value;
    this.valueChanges.next(value);
    this.changes.next({ ...this.getControl(), value });
  }

  reset() {
    const clone = { ...this.defaultValues };
    this.value = clone.value;
    this.setControl(clone);
  }
  /* 
    ----- FORM CONTROL DEPENDENCIES
  */

  when(field: string | string[]) {
    this.setDependencies(field);
    const set = this.setModifiers.bind(this);
    return {
      is(condition?: Condition) {
        return set("every", condition);
      },
      some(condition?: Condition) {
        return set("some", condition);
      },
      map(conditions: MapCondition) {
        return set("map", undefined, conditions);
      },
    };
  }

  private setDependencies(field: string | string[]) {
    try {
      const error = "FormControl invalid Methods:\nERROR: method when() can be invoked once.";
      if (this.hasDependency) throw new Error(error);
      else this.hasDependency = true;

      if (Array.isArray(field)) {
        field.forEach((name) => (this.dependencies[name] = null));
      } else {
        this.dependencies[field] = null;
      }
    } catch (error) {
      console.error(error);
    }
  }

  private setModifiers(operator: Operator, condition: Condition, map: MapCondition = {}) {
    this.modifiers = { ...this.modifiers, operator, condition, map };
    if (operator === "map") {
      const { mapCache } = this.modifiers;
      Object.keys(map).forEach((key) => (mapCache[key] = false));
    }
    return {
      then: this.then.bind(this),
    };
  }

  private then(formControlOptions: FormControlThenOptions) {
    this.options = {
      prev: { ...this.getControl() },
      then: { ...formControlOptions },
    };
    this.options.then = { ...formControlOptions };
    return this;
  }

  /* 
    ----- HANDLE DEPENDENCIES
  */

  public getDependencies() {
    return this.dependencies;
  }

  public testCondition(name: string, value: any) {
    this.dependencies[name] = value;
    const values = Object.values(this.dependencies);
    const { operator, condition, map, mapCache } = this.modifiers;
    switch (operator) {
      case "some":
      case "every":
        if (values[operator]((value) => test(value, condition))) {
          // CONDITION OK
          this.runThen();
        } else {
          // CONDITION NO
          this.restore();
        }
        break;
      case "map":
        mapCache[name] = test(value, map[name]);
        if (Object.values(mapCache).every((_) => _ === true)) {
          console.log("MAP TRUE");
          this.runThen();
        } else {
          console.log("MAP FALSE");
          this.restore();
        }
        break;
    }
  }

  private runThen() {
    this.setControl(this.options.then);
    if (this.options.then.reset) {
      this.reset();
    }
  }

  private restore() {
    this.setControl(this.options.prev);
  }
}

function test(value: any, condition: Condition) {
  switch (typeof condition) {
    case "boolean":
    case "string":
    case "number":
    case "bigint":
      return value === condition;
    case "object":
      if (value instanceof Date && condition instanceof Date) {
        const a = new Date(value).getTime();
        const b = new Date(condition).getTime();
        return a === b;
      }
      return JSON.stringify(value) === JSON.stringify(condition);
    case "function":
      return condition(value) as boolean;
    case "undefined":
    default:
      return !!value;
  }
}

function isOption(option: FormControlOptions) {
  if (option.validator) {
    testSchema(option.validator);
    return true;
  } else {
    testSchema(option);
    return false;
  }
}

function testSchema(validator: any) {
  try {
    switch (true) {
      case validator instanceof StringSchema:
      case validator instanceof NumberSchema:
        return true;
      default:
        throw new Error("FormControl( validator: 'MUST BE AN SCHEMA OBJECT')");
    }
  } catch (err) {
    console.error(err);
  }
}
