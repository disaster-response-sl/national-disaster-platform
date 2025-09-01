import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

/**
 * @param {string} errorCode is a key from locales file under errors namespace
 * @param {string} errorMsg (Optional) is a fallback value if transaction for errorCode not found.
 * If errorMsg is not passed then errorCode key itself became the fallback value.
 */

const Error = ({ errorCode, errorMsg, i18nKeyPrefix = "errors", showToast = false }) => {
  const { t } = useTranslation("translation", { keyPrefix: i18nKeyPrefix });
  const toastTimeout = process.env.REACT_APP_TOAST_TIMEOUT_IN_SEC;

  useEffect(() => {
    if (showToast) {
      toast.error(t(errorCode, errorMsg), { autoClose: toastTimeout * 1000 });
    }
  }, []);

  if (showToast) {
    return <></>;
  }
  return (
    <div
      className="p-4 w-full mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
      role="alert"
    >
      {t(errorCode, errorMsg)}
    </div>
  );
};

export { Error };
