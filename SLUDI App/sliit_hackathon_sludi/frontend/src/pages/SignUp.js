import React from "react";
import Background from "../components/Background";
import SignUp from "../components/SignUp";

export default function SignUpPage({ langOptions }) {
  return (
    <Background
      component={React.createElement(SignUp)}
      langOptions={langOptions}
    />
  );
}
