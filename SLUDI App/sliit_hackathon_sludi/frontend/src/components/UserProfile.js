import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Error } from "../common/Errors";
import clientDetails from "../constants/clientDetails";
import { LoadingStates as states } from "../constants/states";
import LoadingIndicator from "../common/LoadingIndicator";
import { useTranslation } from "react-i18next";

export default function UserProfile({
  relyingPartyService,
  i18nKeyPrefix = "userprofile",
}) {
  const { t } = useTranslation("translation", {
    keyPrefix: i18nKeyPrefix,
  });

  const { post_fetchUserInfo } = {
    ...relyingPartyService,
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState({ errorCode: "", errorMsg: "" });
  const [userInfo, setUserInfo] = useState(null);
  const [status, setStatus] = useState(states.LOADING);
  const [showRawUserInfo, setShowRawUserInfo] = useState(false);
  const [address, setAddress] = useState(null);
  const [emailAddress, setEmailAddress] = useState(null);

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
    const getSearchParams = async () => {
      let authCode = searchParams.get("code");
      let errorCode = searchParams.get("error");
      let error_desc = searchParams.get("error_description");

      if (errorCode) {
        navigateToLogin(errorCode, error_desc);
        return;
      }

      if (authCode) {
        getUserDetails(authCode);
      } else {
        setError({
          errorCode: "authCode_missing",
        });
        setStatus(states.ERROR);
        return;
      }
    };
    getSearchParams();
  }, []);

  //Handle Login API Integration here
  const getUserDetails = async (authCode) => {
    setError(null);
    setUserInfo(null);

    try {
      let client_id = clientDetails.clientId;
      let redirect_uri = clientDetails.redirect_uri_userprofile;
      let grant_type = clientDetails.grant_type;

      var userInfo = await post_fetchUserInfo(
        authCode,
        client_id,
        redirect_uri,
        grant_type
      );

      let address = getAddress(userInfo?.address);
      setAddress(address);
      setUserInfo(userInfo);
      setEmailAddress(userInfo?.email_verified ?? userInfo?.email);
      setStatus(states.LOADED);
    } catch (errormsg) {
      setError({ errorCode: "", errorMsg: errormsg.message });
      setStatus(states.ERROR);
    }
  };

  const getAddress = (userAddress) => {
    let address = "";

    if (userAddress?.formatted) {
      address += userAddress?.formatted + ", ";
    }

    if (userAddress?.street_address) {
      address += userAddress?.street_address + ", ";
    }

    if (userAddress?.addressLine1) {
      address += userAddress?.addressLine1 + ", ";
    }

    if (userAddress?.addressLine2) {
      address += userAddress?.addressLine2 + ", ";
    }

    if (userAddress?.addressLine3) {
      address += userAddress?.addressLine3 + ", ";
    }

    if (userAddress?.locality) {
      address += userAddress?.locality + ", ";
    }

    if (userAddress?.city) {
      address += userAddress?.city + ", ";
    }

    if (userAddress?.province) {
      address += userAddress?.province + ", ";
    }

    if (userAddress?.region) {
      address += userAddress?.region + ", ";
    }

    if (userAddress?.postalCode) {
      address += "(" + userAddress?.postalCode + "), ";
    }

    if (userAddress?.country) {
      address += userAddress?.country + ", ";
    }

    //returning after removing last ", " characters
    return address.substring(0, address.length - 2);
  };

  let el = (
    <div className="w-full flex-grow bg-[#F2F4F4] mt-8 mb-6 shadow-lg rounded">
      <div className="py-10">
        {status === states.LOADING && (
          <LoadingIndicator size="medium" message={t("loading_msg")} />
        )}
        {status === states.LOADED && (
          <>
            <div className="px-4">
              <div className="font-bold flex justify-center">
                {userInfo?.given_name ?? userInfo?.name}
              </div>
              <div className="font-bold flex justify-center">
                {t("welcome_msg")}
              </div>
            </div>
            <div className=" px-3 py-6 flex justify-center">
              <img
                alt={t("profile_picture")}
                className="h-20 w-20"
                src={
                  userInfo?.picture ? userInfo.picture : "User-Profile-Icon.png"
                }
              />
            </div>

            <div className="divide-slate-300 gap-2">
              <div className="px-4 py-3 grid grid-cols-2">
                <div className="flex justify-start">{t("email_address")}</div>
                <div className="flex justify-end" title={emailAddress}>
                  <span className="truncate">
                    {emailAddress?.split("@")[0]}
                  </span>
                  @
                  <span className="truncate">
                    {emailAddress?.split("@")[1]}
                  </span>
                </div>
              </div>
              <div className="px-4 py-3 bg-white grid grid-cols-2">
                <div className="flex justify-start">{t("gender")}</div>
                <div className="flex justify-end">{userInfo?.gender}</div>
              </div>
              <div className="px-4 py-3 grid grid-cols-2">
                <div className="flex justify-start">{t("phone_number")}</div>
                <div className="flex justify-end">
                  {userInfo?.phone_number_verified ??
                    userInfo?.phone ??
                    userInfo?.phone_number}
                </div>
              </div>
              <div className="px-4 py-3 bg-white grid grid-cols-2">
                <div className="flex justify-start">{t("birth_date")}</div>
                <div className="flex justify-end">{userInfo?.birthdate}</div>
              </div>
              <div className="px-4 py-3 grid grid-cols-2">
                <div className="flex justify-start">{t("address")}</div>
                <div className="flex justify-end">{address}</div>
              </div>
            </div>
            <div className="px-4">
              <button
                type="button"
                className="font-medium text-cyan-700 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  setShowRawUserInfo(!showRawUserInfo);
                }}
              >
                {showRawUserInfo
                  ? t("hide_raw_user_info")
                  : t("show_raw_user_info")}
              </button>
              {showRawUserInfo && (
                <p dir="ltr" className="break-words">
                  {JSON.stringify(userInfo)}
                </p>
              )}
            </div>
          </>
        )}
        {status === states.ERROR && (
          <Error errorCode={error.errorCode} errorMsg={error.errorMsg} />
        )}
      </div>
    </div>
  );

  return el;
}
