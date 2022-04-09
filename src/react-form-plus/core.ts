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
import { FormControlOptions } from "./FormControl";

import { FormCore } from "./FormCore";
import { AnySchema } from "./Validator";

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


interface Then {
  value?: any;
  validator?: AnySchema;
  touched?: boolean;
  disabled?: boolean;
  requiredGroup?: 1 | 2 | 3 | 4 | 5;
  error?: string | string[];
  reset?: boolean;
}
export interface FormControlProp {
  name: string;
  value: any;
  disabled?: boolean;
  touched?: boolean;
  validator?: AnySchema;
  //when: [string | string[], "is" | "some" | "every", Then];
  when?: {
    field: string | string[];
    is?: () => void;
    some?: () => void;
    map?: () => void;
    then(): void;
  };
}

type UseFormControl = ({ name, value, disabled, touched, validator }: FormControlProp) => any;

/* 
----- FORM CONTROLLER -----
*/

export const useFormControl: UseFormControl = ({
  name,
  value,
  disabled = false,
  touched = false,
}) => {
  const { formCore } = useFormContext();
  const formControl = useRef({
    control: formCore.get(name),
    previous: {},
    set(value: any) {
      setValue(value);
      this.control.setValue(value);
    },
    onMount() {
      this.control.changes.subscribe((change) => {
        setValue(change.value);
        setDisabled(change.disabled);
      });
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
