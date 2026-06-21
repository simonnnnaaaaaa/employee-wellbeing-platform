import axios from "axios";

const API_URL = "https://localhost:7258/api/hr";

export type DepartmentDrilldownData = {
  department: string;
  totalCheckIns: number;
  averageStress: number;
  averageEnergy: number;
  highStressCount: number;
  riskScore: number;
  riskLevel: string;
  moodDistribution: {
    mood: string;
    count: number;
    percentage: number;
  }[];
  dailyTrend: {
    date: string;
    averageStress: number;
    averageEnergy: number;
    checkInsCount: number;
  }[];
  companyAverageStress: number;
  companyAverageEnergy: number;
  companyRiskScore: number;
  stressDifference: number;
  energyDifference: number;
  riskDifference: number;
};

export async function getHRDashboard(days: number) {
  const token = localStorage.getItem("token");

  const response = await axios.get(`${API_URL}/dashboard?days=${days}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function getDepartmentDrilldown(
  departmentName: string,
  days: number
): Promise<DepartmentDrilldownData> {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `${API_URL}/departments/${encodeURIComponent(
      departmentName
    )}/drilldown?days=${days}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function exportHRReportPdf(startDate: string, endDate: string) {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `${API_URL}/export-pdf?startDate=${startDate}&endDate=${endDate}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    }
  );


  
  const fileUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");

  link.href = fileUrl;
  link.download = `HR-Wellbeing-Report-${startDate}-to-${endDate}.pdf`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(fileUrl);
}

export async function exportDepartmentReportPdf(
  departmentName: string,
  days: number
) {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `${API_URL}/departments/${encodeURIComponent(
      departmentName
    )}/export-pdf?days=${days}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    }
  );

  const fileUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");

  link.href = fileUrl;
  link.download = `HR-Wellbeing-Department-Report-${departmentName}-${days}-days.pdf`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(fileUrl);
}