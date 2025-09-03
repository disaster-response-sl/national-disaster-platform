import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";

export default function ProfileUI({
  relyingPartyService,
  i18nKeyPrefix = "profileui",
}) {
  const get_currentMedications = relyingPartyService.get_currentMedications;
  const get_nextAppointment = relyingPartyService.get_nextAppointment;
  const { t, i18n } = useTranslation("translation", {
    keyPrefix: i18nKeyPrefix,
  });

  const currentDate = new Date();
  //Date with 10 days ahead from current date
  const futureDate = new Date(currentDate.getTime() + 10 * 24 * 60 * 60 * 1000);
  const formattedDate = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'full' }).format(futureDate)

  const [medicationInfo, setMedicationInfo] = useState([]);
  const [appointmentInfo, setappointmentInfo] = useState([]);


  useEffect(() => {
    getCurrentMedication();
    getAppointment();
  }, []);

  //Getting Medication from json
  const getCurrentMedication = () => {
    setMedicationInfo(null);
    var medicationInfo = get_currentMedications();
    setMedicationInfo(medicationInfo)
  };
  const medicationCount = medicationInfo.medications?.length;

  //Next Appointment details
  const getAppointment = () => {
    setappointmentInfo(null);
    var appointmentInfo = get_nextAppointment();
    setappointmentInfo(appointmentInfo);
  };

  let el = (
    <>
      <div className="flex">
        <div className="flex flex-wrap w-full sm:w-30 md:w-30">
          <div className="w-full sm:w-1/2 md:w-30 p-1 ">
            <p className="text-lg font-medium mb-4">{t("current_medication")} ({medicationCount})</p>

            <div className="bg-white border border-gray-200 rounded shadow p-4">
              <div className="flow-root">
                <ul role="list" className="divide-y divide-gray-200">
                  {medicationInfo?.medications?.map((data, index) => (
                    <li className="pb-3 sm:pb-1" key={index}>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0 ">
                          <p className="text-xs font-medium text-gray-900 truncate whitespace-pre-wrap inline-flex">
                            <svg
                              className="h-5 w-5 text-gray-500"
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
                            {t(data["tabletName"])}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {t(data["dailyDosage"])}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                  <li>
                    <div className="flex items-center justify-between my-1 ">
                      <a
                        href="#"
                        className="text-sm text-gray-500 truncate hover:underline whitespace-pre-wrap"
                      >
                        {t("see_all_interactions")}
                      </a>
                      <a
                        href="#"
                        className="text-sm text-gray-500 truncate hover:underline flex items-center mr-2 whitespace-pre-wrap"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 -2 24 24"
                          fill="none"
                          stroke="#000000"
                          strokeWidth="1"
                          strokeLinecap="round"
                          strokeLinejoin="arcs"
                        >
                          <path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38" />
                        </svg>
                        {t("request_refill")}
                      </a>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-1/2 md:w-30 p-1">
            <p className="text-lg font-medium mb-4">{t("next_appointment")}</p>
            <div className="bg-white border border-gray-200 rounded shadow p-4">
              <div className="flow-root">
                <ul role="list" className="divide-y divide-gray-200">
                  {appointmentInfo?.appointment?.map((data, index) => (
                    <li className="pb-3 sm:pb-1" key={index}>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0 my-1">
                          <p className=" font-medium text-lg text-gray-900 truncate whitespace-pre-wrap">
                            {i18n.t(formattedDate)}
                          </p>
                          <p className="text-xs text-gray-500 truncate inline-flex whitespace-pre-wrap">
                            <img src="images/scheduleTime.png" className="h-4 w-4 ml-2 mr-2"></img>
                            {data["time"]}
                          </p>
                          <div className="text-xs text-gray-500 truncate whitespace-pre-wrap inline-flex">
                            <img src="images/marker.png" className="h-4 w-4 ml-2 mr-2 mb-2"></img>
                            {t(data["location"])}
                          </div>
                          <div className="py-2">
                            <div className="flex">
                              <img
                                className="w-8 h-8 rounded-full shadow-lg"
                                src="images/doctor_logo.png"
                                alt="Jese Leos image"
                              />
                              <div className="ml-3 mr-3">
                                <p className="text-sm font-medium text-gray-900 truncate whitespace-pre-wrap">
                                  {t(data["doctorName"])}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {t(data["department"])}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                  <li>
                    <div className="flex items-center justify-center  border-t border-gray-300">
                      <a
                        href="#"
                        className="text-sm text-blue-600 hover:underline truncate my-0.5"
                      >
                        {t("manage_appointment")}
                      </a>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
  return el;
}
