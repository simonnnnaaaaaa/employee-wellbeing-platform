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
  const response = await axios.get(
    `${API_URL}/hr-wellbeing-summary?days=${days}`,
    getAuthHeaders()
  );

  return response.data;
}

export async function getDepartmentWellbeingInsight(
  departmentName: string,
  days: number
) {
  const response = await axios.get(
    `${API_URL}/department-wellbeing-insight/${encodeURIComponent(
      departmentName
    )}?days=${days}`,
    getAuthHeaders()
  );

  return response.data;
}