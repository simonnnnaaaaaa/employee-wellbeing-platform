import axios from "axios";

const API_URL = "https://localhost:7258/api/ai";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function getMyWellbeingInsight() {
  const response = await axios.get(
    `${API_URL}/my-wellbeing-insight`,
    getAuthHeaders()
  );

  return response.data;
}

export async function getHrWellbeingSummary(days: number) {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `https://localhost:7258/api/ai/hr-wellbeing-summary?days=${days}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}