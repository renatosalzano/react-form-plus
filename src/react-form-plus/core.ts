import {
  createContext,
  createElement,
  FC,
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

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
    previous: {},
    set(value: any) {
      setValue(value);
      this.control.setValue(value);
    },
    testDependencies() {
      if (this.control.dependencies.length > 0) {
        this.control.dependencies.forEach((name) => {
          const dep = formCore.get(name);
          if (dep.isMounted()) {
            dep.subscribe((value) => {
              if (this.control.testDependency(name, value)) {

                console.log("TEST WORK");
              } else {
                console.log("TEST FAIL");
              }
            });
          }
        });
      }
    },
    onMount() {
      this.testDependencies();
      this.control.
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
