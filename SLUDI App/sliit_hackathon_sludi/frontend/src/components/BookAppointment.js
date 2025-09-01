import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import AppointmentConfirmation from "./AppointmentConfirmation";
export default function BookAppointment({
  userInfo,
  i18nKeyPrefix = "bookappointment",
}) {
  const { t, i18n } = useTranslation("translation", {
    keyPrefix: i18nKeyPrefix,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function handleDialogClose() {
    setIsDialogOpen(false);
  }

  return (
    <>
      <div className="p-1 bg-gray-50 font-sans ">
        <div className="p-1">
          <div className="flex w-full px-4 pb-4 bg-gray-50">
            <div className="flex flex-wrap">
              <p className=" text-lg font-medium">{t("book_appointment")}</p>
              <div>
                <img src="images/Schedule for Vaccination.jpeg"></img>
              </div>
              <div className="p-2 m-2">
                <Link to={process.env.PUBLIC_URL + "/userprofile"}>
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    {t("cancel")}
                  </button>
                </Link>
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 ml-2 mr-2 rounded"
                >
                  {t("book_appointment")}
                </button>
                <AppointmentConfirmation
                  username={userInfo?.name}
                  isOpen={isDialogOpen}
                  onClose={handleDialogClose}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
