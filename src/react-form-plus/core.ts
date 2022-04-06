import { createContext, createElement, FC, Fragment, useContext, useEffect, useRef, useState } from "react";

import { FormCore } from "./FormCore";
import { Control, When } from "./FormControl";

interface Context {
  formCore: FormCore;
}

const FormContext = createContext({} as Context);
const useFormContext = () => useContext(FormContext);

interface FormStoreProps {
  schema: { [key: string]: any };
}

export const FormStore: FC<FormStoreProps> = ({ schema, children }) => {
  const formCore = useRef<FormCore>(new FormCore(schema)).current;

  return createElement(FormContext.Provider, { value: { formCore } }, children);
};

export interface FormControlProp {
  name: string;
  defaultValue: any;
  disabled?: boolean;
  rule?: {
    required?: boolean | string;
    min?: number;
    max?: number;
  };
}

type UseFormControl = ({ name, defaultValue, rule }: FormControlProp) => any;

/* 
----- FORM CONTROLLER -----
*/

export const useFormControl: UseFormControl = ({ name, defaultValue, disabled = false, rule }) => {
  const { formCore } = useFormContext();
  const formControl = useRef({
    control: formCore.get(name).mount(),
    set(value: any) {
      setValue(value);
      this.control.setValue(value);
    },
    checkDependency(dependency: When) {
      const hasDependency = Object.keys(dependency).length > 0;
      if (hasDependency) {
        for (let controlName in dependency) {
          if (formCore.get(controlName).isMounted()) {
            formCore.get(controlName).subscribe((value) => {
              const options = this.control.when[controlName];
              let test = false;
              switch (typeof options.is) {
                case "number":
                case "string":
                  test = options.is === value;
                  break;
                case "boolean":
                  test = !!value;
                  break;
                case "function":
                  test = value(value);
              }
              if (test) {
                console.log(options);
              }
            });
          }
        }
      }
    },
    onMount() {
      const dependency = this.control.when;
      this.checkDependency(dependency);
    },
  }).current;

  const [_value, setValue] = useState(formCore.get(name).value);
  const [_disabled, setDisabled] = useState(formCore.get(name).disabled);

  useEffect(() => {
    formControl.onMount();
  }, [formControl, name]);

  return {
    control: {
      name,
      value: _value,
      disabled: _disabled,
      onChange(event: any) {
        let value: any;
        if (event.target) {
          value = event.target.value;
        } else {
          value = event;
        }
        formControl.set(value);
      },
    },
  };
};
