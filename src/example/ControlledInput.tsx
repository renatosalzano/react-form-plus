import { FC } from "react";
import { useFormControl } from "../react-form-plus/core";
interface Props {
  name: string;
  value: string;
}
export const ControlledInput: FC<Props> = ({ name, value }) => {
  const { control } = useFormControl({
    name,
    defaultValue: value,
    rule: {
      required: "obbligatorio",
      min: 5,
      max: 16,
    },
  });

  function setClassname() {
    let classname = "test";
    if (control.disabled) classname += " disabled";
    return classname;
  }

  return <input type="text" {...control} className={setClassname()} />;
};
