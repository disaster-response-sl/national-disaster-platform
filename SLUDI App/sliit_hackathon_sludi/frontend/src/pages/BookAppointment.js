import React, { useEffect, useState } from "react";
import relyingPartyService from "../services/relyingPartyService";
import BookAppointment from "../components/BookAppointment";
import Sidenav from "../components/Sidenav";
import { useNavigate } from "react-router-dom";
export default function BookAppointmentPage({ langOptions }) {

  const userInfo_keyname = "user_info";
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const navigateToLogin = (errorCode, errorDescription) => {
    let params = "?";
    if (errorDescription) {
      params = params + "error_description=" + errorDescription + "&";
    }
    //REQUIRED
    params = params + "error=" + errorCode;
    navigate(process.env.PUBLIC_URL + "/" + params, { replace: true });
  };

  useEffect(() => {
    if (localStorage.getItem(userInfo_keyname)) {
      let userInf = JSON.parse(localStorage.getItem(userInfo_keyname));
      setUserInfo(userInf);
    } else {
      navigateToLogin("session_expired", "Session Expired");
    }
  }, []);

  return (
    <Sidenav relyingPartyService={relyingPartyService} langOptions={langOptions} component={React.createElement(BookAppointment, { userInfo: userInfo })}
    />
  );
}
