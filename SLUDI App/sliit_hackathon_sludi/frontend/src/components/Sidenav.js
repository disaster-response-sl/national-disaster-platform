import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import clientDetails from "../constants/clientDetails";
import { LoadingStates as states } from "../constants/states";
import Select from "react-select";
import LoadingIndicator from "../common/LoadingIndicator";
export default function Sidenav({
  component,
  langOptions,
  relyingPartyService,
  i18nKeyPrefix = "sidenav",
}) {
  const userInfo_keyname = "user_info";
  const post_fetchUserInfo = relyingPartyService.post_fetchUserInfo;
  const get_claimProvider = relyingPartyService.get_claimProvider;
  const get_messages = relyingPartyService.get_messages;
  const { t, i18n } = useTranslation("translation", {
    keyPrefix: i18nKeyPrefix,
  });
  const [isOpen, setIsOpen] = useState(false);
  const currentDate = new Date();
  const [searchParams, setSearchParams] = useSearchParams();
  const [userInfo, setUserInfo] = useState(null);
  const [status, setStatus] = useState(states.LOADING);
  const [claimInfo, setClaimInfo] = useState([]);
  const [messagesInfo, setMessagesInfo] = useState([]);
  const [address, setAddress] = useState(null);
  const [emailAddress, setEmailAddress] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  function getAllKeys(input) {
    if (Array.isArray(input)) {
      // If it's an array, get keys of each object
      return input.flatMap((obj) => Object.keys(obj));
    } else {
      // If it's a single object, just get its keys
      return Object.keys(input);
    }
  }

  const navigateToLogin = (errorCode, errorDescription) => {
    let params = "?";
    if (errorDescription) {
      params = params + "error_description=" + errorDescription + "&";
    }

    //REQUIRED
    params = params + "error=" + errorCode;
    navigate(process.env.PUBLIC_URL + "/" + params, { replace: true });
  };
  const [selectedLang, setSelectedLang] = useState();
  const changeLanguageHandler = (e) => {
    i18n.changeLanguage(e.value);
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      border: 0,
      boxShadow: "none",
    }),
  };

  useEffect(() => {
    let lang = langOptions?.find((option) => {
      return option.value === i18n.language;
    });
    setSelectedLang(lang);
  }, [langOptions]);

  //Gets fired when changeLanguage got called.
  i18n.on("languageChanged", function (lng) {
    let lang = langOptions.find((option) => {
      return option.value === lng;
    });
    setSelectedLang(lang);
  });

  useEffect(() => {
    const getSearchParams = async () => {
      let authCode = searchParams.get("code");
      let errorCode = searchParams.get("error");
      let error_desc = searchParams.get("error_description");
      if (errorCode) {
        navigateToLogin(errorCode, error_desc);
        return;
      }
      getClaimProvider();
      getMessages();
      getUserDetails(authCode);
    };
    getSearchParams();
    // hiding or showing the side nav
    // according to windows height
    const handleResize = () => setShowMenu(window.innerWidth > 767);
    // initial call to handleResize
    handleResize();
    // adding event listener for window resize
    window.addEventListener("resize", handleResize);
    // removing event listener for window resize
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getUserDetails = async (authCode) => {
    setUserInfo(null);
    setStatus(states.LOADING);
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
      localStorage.setItem(userInfo_keyname, JSON.stringify(userInfo));
      setStatus(states.LOADED);
    } catch (errormsg) {
      //Load from local storage
      if (localStorage.getItem(userInfo_keyname)) {
        let userInf = JSON.parse(localStorage.getItem(userInfo_keyname));
        let address = getAddress(userInf?.address);
        setAddress(address);
        setEmailAddress(userInf?.email_verified ?? userInf?.email);
        setUserInfo(userInf);
        setStatus(states.LOADED);
      } else {
        navigateToLogin("session_expired", "Session Expired");
      }
    }
  };

  //claimproviders details
  const getClaimProvider = () => {
    setClaimInfo(null);
    var claimInfo = get_claimProvider();
    setClaimInfo(claimInfo);
  };

  //Getting message information from json
  const getMessages = () => {
    setMessagesInfo(null);
    var messagesInfo = get_messages();
    setMessagesInfo(messagesInfo);
  };
  const messagesCount = messagesInfo.messages?.length;

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

  const verifiedIcon = (
    <img
      className="w-5 h-5 rounded-full shadow-lg ml-1 relative top-[1px] hover:cursor-pointer"
      src="images/verification-symbol.svg"
      title="Verified"
    />
  );

  // new message component
  const newMessageComponent = () => {
    return (
      <>
        <p className="text-lg font-medium mb-4">
          {t("new_messages")} <span className="">({messagesCount})</span>
        </p>
        {messagesInfo?.messages?.map((message, index) => {
          const pastDate = new Date(
            currentDate.getTime() - message["days"] * 24 * 60 * 60 * 1000
          );
          const formattedDate = new Intl.DateTimeFormat(i18n.language, {
            dateStyle: "full",
          }).format(pastDate);
          return (
            <div
              className=" bg-white overflow-auto border rounded border-gray-200 hover:bg-gray-100 shadow p-3 sm:p-4"
              key={index}
            >
              <div className="flex ">
                <img
                  className="w-8 h-8 rounded-full shadow-lg"
                  src="images/doctor_logo.png"
                  alt="Jese Leos image"
                />

                <div className="ml-3 mr-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {t(message["doctorName"])}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {i18n.t(formattedDate)}
                  </p>

                  <p className="text-sm text-gray-500 truncate max-w-xs whitespace-pre-wrap">
                    {t("hi")} {userInfo?.name} , {t(message["message"])}
                  </p>
                </div>
                <button
                  type="button"
                  className="ml-auto -mx-1.5 -my-1.5  text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8"
                  data-dismiss-target="#toast-message-cta"
                  aria-label="Close"
                >
                  <svg
                    className="h-4 w-4 text-gray-500"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {" "}
                    <path stroke="none" d="M0 0h24v24H0z" />{" "}
                    <circle cx="12" cy="12" r="1" />{" "}
                    <circle cx="12" cy="19" r="1" />{" "}
                    <circle cx="12" cy="5" r="1" />
                  </svg>{" "}
                </button>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  // vaccination history component
  const vaccinationHistoryComponent = () => {
    return (
      <>
        <div className="w-full p-2 grid grid-cols-3 rounded bg-white border border-gray-200  shadow sm:p-2 m-1">
          <div>
            <p className=" text-lg font-medium ">{t("vaccinations")}</p>
          </div>
          <div className="col-end-5">
            <a
              href="#"
              className=" text-sm text-gray-500 truncate hover:underline"
            >
              {t("vaccinations_history")}
            </a>
          </div>
        </div>
        <div className="w-full flex">
          <table className="w-full p-4 mx-1 mb-4 table-auto whitespace-pre-wrap shadow-lg text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-white">
              <tr>
                <th scope="col" className="p-3 sm:px-6">
                  <p>{t("vaccination_details")}</p>
                </th>
                <th scope="col" className="p-3 sm:px-6">
                  {t("date")}
                </th>
                <th scope="col" className="p-3 sm:px-6">
                  {t("vaccination_center")}
                </th>
                <th scope="col" className="p-3 sm:px-6">
                  {t("total_cost")}
                </th>
              </tr>
            </thead>
            <tbody>
              {claimInfo?.claimproviders?.map((item, idx) => {
                const pastDate = new Date(
                  currentDate.getTime() - item["days"] * 24 * 60 * 60 * 1000
                );
                return (
                  <tr className="bg-white border-b" key={idx}>
                    <th
                      scope="row"
                      className="sm:px-6 p-3 pr-2 font-medium text-gray-900 whitespace-nowrap"
                    >
                      <p className="text-xs">{t(item["vaccinationName"])}</p>
                    </th>
                    <td className="sm:px-6 py-3 px-2">
                      <p>{pastDate.toLocaleDateString()}</p>
                    </td>
                    <td className="sm:px-6 py-3 px-2">
                      <p>{t(item["vaccinationCenter"])}</p>
                    </td>
                    <th className="sm:px-6 p-3 pl-2">
                      <p>{item["totalCost"]}</p>
                    </th>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  let el = (
    <>
      <aside
        id="default-sidebar"
        className={
          "fixed top-0 ltr:left-0 rtl:right-0 z-40 bg-white md:w-64 w-full h-full overflow-hidden transition-transform-translate-x-full shadow-md sm:translate-x-0  " +
          (showMenu ? "" : "hidden")
        }
        aria-label="Sidebar"
      >
        <div className="md:px-3 md:py-4">
          <div className="hidden md:flex items-center justify-center col-start-1">
            <img src="images/doctor_logo.png" className="w-16 h-16 mx-4" />
            <span className="title-font text-1xl text-gray-900 font-medium">
              {t("health_portal")}
            </span>
          </div>
          <div className="flex md:hidden justify-between col-start-3 p-2 border-b-2">
            <div className="flex justify-start">
              <img
                src="images/menu_icon.png"
                alt="hamburger_menu"
                className="w-[18px] h-3 my-3.5 mx-[11px] cursor-pointer"
                onClick={() => setShowMenu((current) => !current)}
              />
              <img
                src="images/doctor_logo.png"
                alt="profile_logo"
                className="w-[38px] h-[38px] mx-2"
              />
              <div className="w-[58px] font-normal text-base/[18px]">
                Health Portal
              </div>
            </div>
            <div className="flex justify-end items-center">
              <div
                className="p-1.5 m-1.5 before:content-['\2715'] cursor-pointer"
                onClick={() => setShowMenu((current) => !current)}
              ></div>
            </div>
          </div>
        </div>
        <div className="h-full md:px-3 pb-[110px] overflow-scroll">
          <ul className="p-4 md:px-0 md:py-2">
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <svg
                  className="h-5 w-5 text-black"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {" "}
                  <path stroke="none" d="M0 0h24v24H0z" />{" "}
                  <rect x="4" y="4" width="16" height="16" rx="2" />{" "}
                  <line x1="4" y1="10" x2="20" y2="10" />{" "}
                  <line x1="10" y1="4" x2="10" y2="20" />
                </svg>
                <span className="ml-3 mr-3">{t("health_snapshot")}</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <svg
                  className="h-5 w-5 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="flex-1 ml-3 mr-3 whitespace-nowrap">
                  {t("search")}
                </span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <svg
                  className="h-5 w-5 text-black"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {" "}
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="flex-1 ml-3 mr-3 whitespace-nowrap">
                  {t("messages")}
                </span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <svg
                  className="h-5 w-5 text-black"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {" "}
                  <path stroke="none" d="M0 0h24v24H0z" />{" "}
                  <path d="M14 3v4a1 1 0 0 0 1 1h4" />{" "}
                  <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                </svg>
                <span className="flex-1 ml-3 mr-3 whitespace-nowrap">
                  {t("reports")}
                </span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <svg
                  className="h-5 w-5 text-black"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {" "}
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />{" "}
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="flex-1 ml-3 mr-3 whitespace-nowrap">
                  {t("profile")}
                </span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <svg
                  className="h-5 w-5 text-black"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {" "}
                  <path stroke="none" d="M0 0h24v24H0z" />{" "}
                  <path d="M4.5 12.5l8 -8a4.94 4.94 0 0 1 7 7l-8 8a4.94 4.94 0 0 1 -7 -7" />{" "}
                  <path d="M8.5 8.5l7 7" />
                </svg>
                <span className="flex-1 ml-3 mr-3 whitespace-nowrap">
                  {t("medications")}
                </span>
              </a>
            </li>
            <li>
              <Link
                to={process.env.PUBLIC_URL + "/bookappointment"}
                className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <svg
                  className="h-5 w-5 text-black"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {" "}
                  <path stroke="none" d="M0 0h24v24H0z" />{" "}
                  <rect x="4" y="5" width="16" height="16" rx="2" />{" "}
                  <line x1="16" y1="3" x2="16" y2="7" />{" "}
                  <line x1="8" y1="3" x2="8" y2="7" />{" "}
                  <line x1="4" y1="11" x2="20" y2="11" />{" "}
                  <rect x="8" y="15" width="2" height="2" />
                </svg>{" "}
                <span className="flex-1 ml-3 mr-3 whitespace-nowrap">
                  {t("vaccination")}
                </span>
              </Link>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <svg
                  className="h-5 w-5 text-black"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {" "}
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <span className="flex-1 ml-3 mr-3 whitespace-nowrap">
                  {t("health_records")}
                </span>
              </a>
            </li>
            <div className="py-10">
              <li>
                <a
                  href="#"
                  className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100"
                >
                  <svg
                    className="h-5 w-5 text-black"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {" "}
                    <circle cx="12" cy="12" r="3" />{" "}
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <span className="flex-1 ml-3 mr-3 whitespace-nowrap">
                    {t("settings")}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100"
                >
                  <svg
                    className="h-5 w-5 text-black"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {" "}
                    <path stroke="none" d="M0 0h24v24H0z" />{" "}
                    <circle cx="12" cy="12" r="9" />{" "}
                    <line x1="3.6" y1="9" x2="20.4" y2="9" />{" "}
                    <line x1="3.6" y1="15" x2="20.4" y2="15" />{" "}
                    <path d="M11.5 3a17 17 0 0 0 0 18" />{" "}
                    <path d="M12.5 3a17 17 0 0 1 0 18" />
                  </svg>
                  <span className="flex-1 ml-3 mr-3 whitespace-nowrap">
                    {t("help")}
                  </span>
                </a>
              </li>
            </div>
          </ul>
        </div>
        <div className="md:hidden w-full absolute bottom-0 border-t-2 p-4 bg-white z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img
                alt={"profile_picture"}
                className="h-10 w-10 ml-3 mr-3"
                src={
                  userInfo?.picture ? userInfo.picture : "User-Profile-Icon.png"
                }
              />
              <div className="flex flex-col my-3 max-w-xs">
                <p
                  className="text-[#344054] truncate font-semibold text-sm"
                  title={userInfo?.name}
                >
                  {userInfo?.name}
                </p>
                <p
                  className="text-[#475467] truncate font-normal text-sm"
                  title={userInfo?.email}
                >
                  {userInfo?.email}
                </p>
              </div>
            </div>
            <img
              src="images/signout_icon.png"
              alt="signout"
              className="size-5 m-2 cursor-pointer"
              onClick={(e) => {
                localStorage.removeItem(userInfo_keyname);
                navigateToLogin("logged_out", "User Logout");
              }}
            />
          </div>
        </div>
      </aside>
      <div className="flex justify-between md:justify-end col-start-3 md:mr-3 p-2 border-b-2 md:border-0">
        <div className="flex justify-start md:hidden">
          <img
            src="images/menu_icon.png"
            alt="hamburger_menu"
            className="w-[18px] h-3 my-3.5 mx-[11px] cursor-pointer"
            onClick={() => setShowMenu((current) => !current)}
          />
          <img
            src="images/doctor_logo.png"
            alt="profile_logo"
            className="w-[38px] h-[38px] mx-2"
          />
          <div className="w-[58px] font-normal text-base/[18px]">
            Health Portal
          </div>
        </div>
        <div className="flex justify-end items-center">
          <img
            src="images/language_icon.png"
            alt={t("language")}
            className="sm:mr-2 w-[38px] h-[38px]"
          />
          <Select
            styles={customStyles}
            isSearchable={false}
            className="appearance-none w-[125px]"
            value={selectedLang}
            options={langOptions}
            placeholder="Language"
            onChange={changeLanguageHandler}
          />
        </div>
      </div>
      {status === states.LOADING && (
        <div className="relative inset-52 flex justify-center items-center">
          <LoadingIndicator size="medium" message={t("loading_msg")} />
        </div>
      )}

      {status === states.LOADED && (
        <>
          <div className="p-4 ltr:md:ml-64 rtl:md:mr-64 overflow-auto bg-gray-50 font-sans bg-none">
            <div className="flex flex-wrap justify-between items-center px-3 py-2.5">
              <a className="flex-1 items-center truncate">
                <span className="self-center text-2xl font-semibold whitespace-nowrap">
                  {t("welcome")}, {userInfo?.name}
                </span>
                <p className="text-sm text-gray-500 truncate bg-gray-50 font-sans">
                  {t("message_notification")}
                </p>
              </a>

              <div className="md:flex items-center hidden">
                <div className="relative">
                  <div className="flex">
                    <img
                      alt={"profile_picture"}
                      className="h-12 w-12 ml-3 mr-3"
                      src={
                        userInfo?.picture
                          ? userInfo.picture
                          : "User-Profile-Icon.png"
                      }
                    />
                    <div className="flex my-3 max-w-xs">
                      <p
                        className="text-gray-500 truncate bg-gray-50"
                        title={userInfo?.name}
                      >
                        {userInfo?.name}
                      </p>
                    </div>
                    <button
                      className="flex items-center px-4 py-2  text-sm leading-5 font-medium rounded-md text-gray-700 bg-transparent hover:text-gray-500  active:text-gray-800 active:bg-gray-50 transition duration-150 ease-in-out"
                      onClick={() => setIsOpen(!isOpen)}
                    >
                      <svg
                        className="h-5 w-5 ml-1 text-black"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {" "}
                        <path stroke="none" d="M0 0h24v24H0z" />{" "}
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>
                  {isOpen && (
                    <div className="origin-top-left absolute ltr:right-0 rtl:left-0 max-w-xs shadow-lg">
                      <div className="flex flex-col px-1 py-1 rounded-md bg-white shadow-xs mt-2">
                        {emailAddress && (
                          <a
                            className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900 flex w-max"
                            title={emailAddress}
                          >
                            {t("email")}:&nbsp;
                            <span className="truncate">
                              {emailAddress?.split("@")[0]}
                            </span>
                            @
                            <span className="truncate">
                              {emailAddress?.split("@")[1]}
                            </span>
                            {userInfo?.verified_claims &&
                              getAllKeys(
                                userInfo?.verified_claims[0].claims
                              ).includes("emailAddress") &&
                              verifiedIcon}
                          </a>
                        )}
                        {userInfo?.birthdate && (
                          <a className="px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900 flex w-max">
                            {t("dob")}: {userInfo?.birthdate}
                            {userInfo?.verified_claims &&
                              getAllKeys(
                                userInfo?.verified_claims[0].claims
                              ).includes("birthdate") &&
                              verifiedIcon}
                          </a>
                        )}
                        {userInfo?.gender && (
                          <a className="px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900 flex w-max">
                            {t("gender")}: {userInfo?.gender}
                            {userInfo?.verified_claims &&
                              getAllKeys(
                                userInfo?.verified_claims[0].claims
                              ).includes("gender") &&
                              verifiedIcon}
                          </a>
                        )}
                        {userInfo?.phone_number && (
                          <a className="px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900 flex w-max">
                            {t("mobile_no")}: {userInfo?.phone_number}
                            {userInfo?.verified_claims &&
                              getAllKeys(
                                userInfo?.verified_claims[0].claims
                              ).includes("phone_number") &&
                              verifiedIcon}
                          </a>
                        )}
                        {address && (
                          <a className="px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900 flex w-max">
                            {t("address")}: {address}
                            {userInfo?.verified_claims &&
                              getAllKeys(
                                userInfo?.verified_claims[0].claims
                              ).includes("address") &&
                              verifiedIcon}
                          </a>
                        )}
                        <button
                          className="w-full ltr:text-left rtl:text-right block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
                          onClick={(e) => {
                            localStorage.removeItem(userInfo_keyname);
                            navigateToLogin("logged_out", "User Logout");
                          }}
                        >
                          {t("sign_out")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-1 ">
              <div className="flex">
                <div className="flex flex-wrap w-full sm:w-30 md:w-30 p-1">
                  <div className="w-full">{component}</div>
                  <div className="w-full p-2 md:hidden">
                    {newMessageComponent()}
                  </div>
                  {vaccinationHistoryComponent()}
                </div>
                <div className="w-full sm:w-1/2 md:w-30 p-2 hidden md:block">
                  {newMessageComponent()}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
  return el;
}
