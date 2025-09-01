import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Error } from "../common/Errors";
import clientDetails from "../constants/clientDetails";
import { LoadingStates as states } from "../constants/states";
import LoadingIndicator from "../common/LoadingIndicator";
import { useTranslation } from "react-i18next";

export default function Registration({
  relyingPartyService,
  i18nKeyPrefix = "registration",
}) {
  const { i18n, t } = useTranslation("translation", {
    keyPrefix: i18nKeyPrefix,
  });

  const { post_fetchUserInfo } = {
    ...relyingPartyService,
  };

  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [userInfo, setUserInfo] = useState(null);
  const [status, setStatus] = useState(states.LOADING);
  const [showRawUserInfo, setShowRawUserInfo] = useState(false);
  const [address, setAddress] = useState(null);
  const [emailAddress, setEmailAddress] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    setError({
      errorCode: "invalid_details",
    });
  };

  useEffect(() => {
    setError(null);
    setStatus(states.LOADING);

    const getSearchParams = async () => {
      let authCode = searchParams.get("code");
      let errorCode = searchParams.get("error");
      let error_desc = searchParams.get("error_description");

      if (errorCode) {
        setError({ errorCode: errorCode, errorMsg: error_desc });
        setStatus(states.ERROR);
        return;
      }

      if (authCode) {
        getUserDetails(authCode);
      } else {
        setStatus(states.LOADED);
      }
    };
    getSearchParams();

    renderSignInButton();

    i18n.on("languageChanged", function (lng) {
      renderSignInButton();
    });
  }, []);

  const renderSignInButton = () => {

    const oidcConfig = {
      authorizeUri: clientDetails.uibaseUrl + clientDetails.authorizeEndpoint,
      redirect_uri: clientDetails.redirect_uri_registration,
      client_id: clientDetails.clientId,
      scope: clientDetails.scopeRegistration,
      nonce: clientDetails.nonce,
      state: clientDetails.state,
      acr_values: clientDetails.acr_values,
      claims_locales: clientDetails.claims_locales,
      display: clientDetails.display,
      prompt: clientDetails.prompt,
      max_age: clientDetails.max_age,
      ui_locales: i18n.language,
      claims: JSON.parse(decodeURIComponent(clientDetails.registrationClaims)),
    };

    window.SignInWithEsignetButton?.init({
      oidcConfig: oidcConfig,
      buttonConfig: {
        shape: "soft_edges",
        labelText: t("fetch_details"),
        width: "100%"
      },
      signInElement: document.getElementById("sign-in-with-esignet"),
    });
  }

  //Handle Login API Integration here
  const getUserDetails = async (authCode) => {
    setError(null);
    setUserInfo(null);

    try {
      let client_id = clientDetails.clientId;
      let redirect_uri = clientDetails.redirect_uri_registration;
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

  return (
    <>
      <div className="w-full">
        <h1 className="w-full text-center title-font sm:text-3xl text-3xl my-4 font-medium text-gray-900">
          {t("child_registration")}
        </h1>

        <div className="px-3 flex justify-center">
          <img
            alt={t("profile_picture")}
            className="h-20 w-20"
            src={userInfo?.picture ? userInfo.picture : "User-Profile-Icon.png"}
          />
        </div>
        <div className="flex grid grid-cols-2 gap-2 w-full">
          <div className="w-full flex flex-col mb-2 text-slate-500">
            <label className="flex">{t("full_name")}</label>
            <input
              type="text"
              value={userInfo?.given_name ?? userInfo?.name}
              className="rounded bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 text-sm border-gray-300 p-2"
            />
          </div>
          <div className="w-full flex flex-col mb-2 text-slate-500">
            <label className="flex">{t("gender")}</label>
            <input
              type="text"
              value={userInfo?.gender}
              className="rounded bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 text-sm border-gray-300 p-2"
            />
          </div>
        </div>
        <div className="flex grid grid-cols-2 gap-2 w-full">
          <div className="w-full flex flex-col mb-2 text-slate-500">
            <label className="flex">{t("date_of_birth")}</label>
            <input
              type="text"
              value={userInfo?.birthdate}
              className="rounded bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 text-sm border-gray-300 p-2"
            />
          </div>
          <div className="w-full flex flex-col mb-2 text-slate-500">
            <label className="flex">{t("phone_number")}</label>
            <input
              type="text"
              className="rounded bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 text-sm border-gray-300 p-2"
              value={
                userInfo?.phone_number_verified ??
                userInfo?.phone ??
                userInfo?.phone_number
              }
            />
          </div>
        </div>
        <div className="flex grid grid-cols-2 gap-2 w-full">
          <div className="w-full flex flex-col mb-2 text-slate-500">
            <label className="flex">{t("email_address")}</label>
            <input
              type="text"
              value={emailAddress}
              className="rounded bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 text-sm border-gray-300 p-2"
            />
          </div>
          <div className="w-full flex flex-col mb-2 text-slate-500">
            <label className="flex">{t("address")}</label>
            <input
              type="text"
              className="rounded bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 text-sm border-gray-300 p-2"
              value={address}
            />
          </div>
        </div>
        <div className="">
          <button
            type="button"
            className="w-full justify-center text-white bg-[#2F8EA3] hover:bg-[#2F8EA3]/90 font-medium rounded-lg text-sm px-5 py-2.5 flex items-center mr-2 mb-2"
            onClick={handleLogin}
          >
            {t("register")}
          </button>

          <div id="sign-in-with-esignet" className="w-full"></div>

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
              {JSON.stringify(userInfo ?? {})}
            </p>
          )}
        </div>

        {status === states.LOADING && (
          <LoadingIndicator size="medium" message={t("loading_msg")} />
        )}

        {error && (
          <Error errorCode={error.errorCode} errorMsg={error.errorMsg} />
        )}
      </div>
    </>
  );
}
