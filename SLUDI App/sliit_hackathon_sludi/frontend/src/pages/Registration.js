import React from "react";
import Background from "../components/Background";
import Registration from "../components/Registration";
import relyingPartyService from "../services/relyingPartyService";

export default function RegistrationPage({ langOptions }) {
  return (
    <Background
      component={React.createElement(Registration, {
        relyingPartyService: relyingPartyService,
      })}
      langOptions={langOptions}
    />
  );
}
