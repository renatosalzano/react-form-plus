import { FC } from "react";
import { FormStore } from "../react-form-plus/core";
import { ControlledInput } from "./ControlledInput";
import { Validator } from "../react-form-plus/Validator";
import { FormControl } from "../react-form-plus/FormControl";

interface Schema {
  personal: {
    fristname: FormControl;
    lastname: FormControl;
    alias: FormControl;
  };
}

const mySchema: Schema = {
  personal: {
    fristname: new FormControl("pippo"),
    lastname: new FormControl(""),
    alias: new FormControl("", { validator: Validator.string(), disabled: true })
      .when(["fristname", "lastname"])
      .map({ fristname: "pippo", lastname: "baudo" })
      .then({ disabled: false }),
  },
};

export const Example: FC = () => {
  return (
    <FormStore schema={mySchema}>
      <ControlledInput name="fristname" value="" />
      <ControlledInput name="lastname" value="" />
      <ControlledInput name="alias" value="" />
    </FormStore>
  );
};
