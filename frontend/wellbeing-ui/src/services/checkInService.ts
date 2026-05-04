import axios from "axios";

const API_URL = "https://localhost:7258/api/checkins";

export type CreateCheckInRequest = {
  stressLevel: number;
  energyLevel: number;
  mood: string;
  notes?: string;
};

export async function createCheckIn(request: CreateCheckInRequest) {
  const token = localStorage.getItem("token");

  const response = await axios.post(API_URL, request, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function getMyCheckIns() {
  const token = localStorage.getItem("token");

  const response = await axios.get(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}