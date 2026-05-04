import { useEffect, useState } from "react";
import Header from "../components/Header";
import { getHRDashboard } from "../services/hrService";

type Department = {
  department: string;
  totalCheckIns: number;
  averageStress: number;
  averageEnergy: number;
  highStressCount: number;
};

function HRDashboardPage() {
  const [data, setData] = useState<any>(null);

  async function loadData() {
    const result = await getHRDashboard();
    setData(result);
  }

  useEffect(() => {
    loadData();
  }, []);

  if (!data) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <Header />

      <h2>HR Dashboard</h2>

      <h3>Company Overview</h3>
      <p>Total check-ins: {data.totalCheckIns}</p>
      <p>Average stress: {data.averageStress.toFixed(2)}</p>
      <p>Average energy: {data.averageEnergy.toFixed(2)}</p>
      <p>High stress count: {data.highStressCount}</p>

      <h3>By Department</h3>

      <ul>
        {data.departments.map((dep: Department) => (
          <li key={dep.department}>
            <strong>{dep.department}</strong>
            <br />
            Check-ins: {dep.totalCheckIns} | Stress:{" "}
            {dep.averageStress.toFixed(2)} | Energy:{" "}
            {dep.averageEnergy.toFixed(2)} | High stress:{" "}
            {dep.highStressCount}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HRDashboardPage;