import { FC } from "react";
import { FormStore } from "../react-form-plus/core";
import { ControlledInput } from "./ControlledInput";
import { Validator } from "../react-form-plus/Validator";
import { FormControl } from "../react-form-plus/FormControl";

interface Schema {
  personal: {
    fristname: FormControl;
    lastname: FormControl;
  };
}

const mySchema: Schema = {
  personal: {
    fristname: ["", Validator.string().required("lol")],
    lastname: [
      "",
      {
        schema: Validator.string(),
        disabled: true,
        when: {
          fristname: { is: true, schema: Validator.string().required() },
        },
      },
    ],
  },
};

export const Example: FC = () => {
  return (
    <FormStore schema={mySchema}>
      <ControlledInput name="fristname" value="" />
      <ControlledInput name="lastname" value="" />
    </FormStore>
  );
};
