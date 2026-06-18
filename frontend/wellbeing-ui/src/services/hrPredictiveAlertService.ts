import axios from "axios";

const API_URL = "https://localhost:7258/api";

export interface HrPredictiveAlert {
  type: string;
  severity: string;
  title: string;
  message: string;
  recommendation: string;
  affectedEmployeesCount: number;
}

export const getHrPredictiveAlerts = async (
  days: number
): Promise<HrPredictiveAlert[]> => {
  const token = localStorage.getItem("token");

  const response = await axios.get<HrPredictiveAlert[]>(
    `${API_URL}/hr/predictive-alerts?days=${days}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};