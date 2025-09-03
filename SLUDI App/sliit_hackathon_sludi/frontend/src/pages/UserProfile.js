import React from "react";
import relyingPartyService from "../services/relyingPartyService";
import ProfileUI from "../components/ProfileUI";
import Sidenav from "../components/Sidenav";

export default function UserProfilePage({ langOptions }) {
  return (
    <Sidenav relyingPartyService={relyingPartyService} langOptions={langOptions} component={React.createElement(ProfileUI, {
      relyingPartyService:relyingPartyService
    })}/>
  );
}
