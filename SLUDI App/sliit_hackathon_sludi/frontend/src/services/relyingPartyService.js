import axios from "axios";
const baseUrl =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_MOCK_RELYING_PARTY_SERVER_URL
    : window._env_.MOCK_RELYING_PARTY_SERVER_URL;
const fetchUserInfoEndPoint = "/fetchUserInfo";
/**
 * Triggers /fetchUserInfo API on relying party server
 * @param {string} code auth code
 * @param {string} client_id registered client id
 * @param {string} redirect_uri validated redirect_uri
 * @param {string} grant_type grant_type
 * @returns decode/decrypted user information json
 */
const post_fetchUserInfo = async (
  code,
  client_id,
  redirect_uri,
  grant_type
) => {
  let request = {
    code: code,
    client_id: client_id,
    redirect_uri: redirect_uri,
    grant_type: grant_type,
  };
  const endpoint = baseUrl + fetchUserInfoEndPoint;
  const response = await axios.post(endpoint, request, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};
const get_claimProvider = () => {
  return {
    claimproviders: [
      {
        vaccinationName: "covaxin",
        days: 7,
        vaccinationCenter: "aiims_address",
        totalCost: "$234",
      },
      {
        vaccinationName: "hepatitis_a.",
        days: 40,
        vaccinationCenter: "apollo_address",
        totalCost: "$85",
      },
      {
        vaccinationName: "rubella",
        days: 295,
        vaccinationCenter: "urban_address",
        totalCost: "$55",
      },
      {
        vaccinationName: "influenza",
        days: 390,
        vaccinationCenter: "manipal_address",
        totalCost: "$75",
      },
    ],
  };
};
const get_currentMedications = () => {
  return {
    medications: [
      {
        tabletName: "acebutolol_400mg",
        dailyDosage: "dailydosage_2",
      },
      {
        tabletName: "aluminium_hydroxide_(otc)_320mg",
        dailyDosage: "dailydosage_2",
      },
      {
        tabletName: "warfarin_2mg",
        dailyDosage: "dailydoseage_1",
      },
    ],
  };
};
const get_messages = () => {
  return {
    messages: [
      {
        doctorName: "dr_alexander_kalish",
        days: "1",
        message: "dr_alexander_kalish_message_1",
      },
      {
        doctorName: "dr_alexander_kalish",
        days: "3",
        message:
          "dr_alexander_kalish_message_2",
      },
      {
        doctorName: "samantha_kleizar",
        days: "4",
        message:
          "samantha_kleizar_message_1",
      },
      {
        doctorName: "dr_fariz",
        days: "5",
        message: "dr_fariz_message_1",
      },
    ],
  };
};
const get_nextAppointment = () => {
  return {
    appointment: [
      {
        time: "10:30am - 11:00am 30mins",
        location: "appointment_location",
        doctorName: "dr_alexander_kalish",
        department: "endocrin",
      },
    ],
  };
};
const relyingPartyService = {
  post_fetchUserInfo,
  get_claimProvider,
  get_currentMedications,
  get_messages,
  get_nextAppointment,
};
export default relyingPartyService;