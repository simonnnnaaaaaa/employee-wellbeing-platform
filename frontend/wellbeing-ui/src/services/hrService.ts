import axios from "axios";

const API_URL = "https://localhost:7258/api/hr";

export async function getHRDashboard() {
  const token = localStorage.getItem("token");

  const response = await axios.get(`${API_URL}/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}