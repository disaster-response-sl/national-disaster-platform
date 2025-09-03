import { useTranslation } from "react-i18next";

const RedirectButton = ({ redirectURL, text, logoPath }) => {
  const { i18n } = useTranslation("translation");

  return (
    <a
      href={redirectURL + "&ui_locales=" + i18n.language}
      className="w-full font-medium text-blue-600 hover:text-blue-500"
    >
      <button
        type="button"
        className="relative w-full text-black bg-gray-50 shadow-lg hover:bg-gray-100  font-medium rounded-lg text-sm px-5 py-2.5 flex items-center mr-2 mb-2"
      >
        {text}
        <div className="flex absolute inset-y-0  items-center px-3 pointer-events-none ltr:right-0 rtl:left-0">
          <img className="flex mx-1 w-6 h-6" src={logoPath} />
        </div>
      </button>
    </a>
  );
};

export default RedirectButton;
