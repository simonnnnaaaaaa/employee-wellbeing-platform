import axios from "axios";

const API_URL = "https://localhost:7258/api";

export interface PredictiveAlert {
  type: string;
  severity: string;
  title: string;
  message: string;
  recommendation: string;
}

export const getPredictiveAlerts = async (): Promise<PredictiveAlert[]> => {
  const token = localStorage.getItem("token");

  const response = await axios.get<PredictiveAlert[]>(
    `${API_URL}/employee/predictive-alerts`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};