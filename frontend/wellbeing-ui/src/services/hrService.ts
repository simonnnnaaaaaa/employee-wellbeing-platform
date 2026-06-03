import axios from "axios";

const API_URL = "https://localhost:7258/api/hr";

export async function getHRDashboard(days: number) {
  const token = localStorage.getItem("token");

  const response = await axios.get(`${API_URL}/dashboard?days=${days}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}