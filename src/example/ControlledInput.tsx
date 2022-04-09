import { FC } from "react";
import { useFormControl } from "../react-form-plus/core";
import { Validator } from "../react-form-plus/Validator";
interface Props {
  name: string;
  value: string;
}
export const ControlledInput: FC<Props> = ({ name, value }) => {
  const { control } = useFormControl({
    name,
    value,
  });

  function setClassname() {
    let classname = "test";
    if (control.disabled) classname += " disabled";
    return classname;
  }

  return <input type="text" {...control} className={setClassname()} />;
};
