import { useEffect, useState } from "react";
import Header from "../components/Header";
import { exportHRReportPdf, getHRDashboard } from "../services/hrService"; import { Info } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  Loader2,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Pie,
  PieChart,
} from "recharts";
import { getHrWellbeingSummary } from "../services/aiService";
import { Sparkles } from "lucide-react";
import HrPredictiveAlertsCard from "../components/HrPredictiveAlertsCard";
import {
  getHrPredictiveAlerts,
  type HrPredictiveAlert,
} from "../services/hrPredictiveAlertService";
import { Link } from "react-router-dom";

type Department = {
  department: string;
  totalCheckIns: number;
  averageStress: number;
  averageEnergy: number;
  highStressCount: number;
  riskScore: number;
  riskLevel: string;
};

type HRDashboardData = {
  totalCheckIns: number;
  averageStress: number;
  averageEnergy: number;
  highStressCount: number;
  stressTrendPercentage: number;
  energyTrendPercentage: number;
  highStressTrendPercentage: number;
  departments: Department[];
  moodDistribution: MoodDistribution[];
};

type HrAiSummary = {
  summary: string;
  riskLevel: string;
  highestRiskDepartment: string;
  recommendations: string[];
};

type MoodDistribution = {
  mood: string;
  count: number;
  percentage: number;
};

const dateRangeOptions = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
  { label: "6 months", value: 180 },
];

function getStressLevel(stress: number) {
  if (stress <= 3) {
    return { label: "Low", color: "text-emerald-600", bgColor: "bg-emerald-100" };
  }

  if (stress <= 5) {
    return { label: "Moderate", color: "text-amber-600", bgColor: "bg-amber-100" };
  }

  if (stress <= 7) {
    return { label: "High", color: "text-orange-600", bgColor: "bg-orange-100" };
  }

  return { label: "Critical", color: "text-rose-600", bgColor: "bg-rose-100" };
}

function getEnergyLevel(energy: number) {
  if (energy <= 3) {
    return { label: "Low", color: "text-rose-600", bgColor: "bg-rose-100" };
  }

  if (energy <= 5) {
    return { label: "Moderate", color: "text-amber-600", bgColor: "bg-amber-100" };
  }

  if (energy <= 7) {
    return { label: "Good", color: "text-emerald-600", bgColor: "bg-emerald-100" };
  }

  return { label: "Excellent", color: "text-teal-600", bgColor: "bg-teal-100" };
}


function getRiskLevelClasses(riskLevel: string) {
  switch (riskLevel) {
    case "Low":
      return "bg-emerald-100 text-emerald-600";
    case "Moderate":
      return "bg-amber-100 text-amber-600";
    case "High":
      return "bg-orange-100 text-orange-600";
    case "Critical":
      return "bg-rose-100 text-rose-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getMoodColor(mood: string) {
  switch (mood) {
    case "Happy":
      return "#4ade80";
    case "Neutral":
      return "#a3a3a3";
    case "Tired":
      return "#60a5fa";
    case "Stressed":
      return "#fb923c";
    case "Anxious":
      return "#fb7185";
    default:
      return "#cbd5e1";
  }
}

function getMoodWeight(mood: string) {
  switch (mood) {
    case "Happy":
      return 2;
    case "Neutral":
      return 1;
    case "Tired":
      return -1;
    case "Stressed":
    case "Anxious":
      return -2;
    default:
      return 0;
  }
}

function calculateMoodHealthScore(moods: MoodDistribution[]) {
  const totalCount = moods.reduce((sum, item) => sum + item.count, 0);

  if (totalCount === 0) {
    return 0;
  }

  const weightedScore = moods.reduce(
    (sum, item) => sum + getMoodWeight(item.mood) * item.count,
    0
  );

  const minScore = -2 * totalCount;
  const maxScore = 2 * totalCount;

  return Math.round(
    ((weightedScore - minScore) / (maxScore - minScore)) * 100
  );
}

function getMoodHealthLevel(score: number) {
  if (score >= 75) {
    return "Strong";
  }

  if (score >= 55) {
    return "Moderate";
  }

  if (score >= 35) {
    return "At risk";
  }

  return "Critical";
}

function getMoodHealthClass(score: number) {
  if (score >= 75) {
    return "text-emerald-600";
  }

  if (score >= 55) {
    return "text-amber-600";
  }

  if (score >= 35) {
    return "text-orange-600";
  }

  return "text-rose-600";
}

function getTrendInfo(value: number) {
  return {
    isPositive: value >= 0,
    arrow: value >= 0 ? "↑" : "↓",
    display: `${Math.abs(value).toFixed(1)}%`,
  };
}

function getTrendClass(value: number, positiveIsBad: boolean) {
  if (value === 0) {
    return "text-slate-400";
  }

  if (positiveIsBad) {
    return value > 0 ? "text-rose-600" : "text-emerald-600";
  }

  return value > 0 ? "text-emerald-600" : "text-rose-600";
}

function getPeriodLabel(days: number) {
  if (days === 180) {
    return "Last 6 months";
  }

  return `Last ${days} days`;
}

function HRDashboardPage() {
  const [data, setData] = useState<HRDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(30);
  const [aiSummary, setAiSummary] = useState<HrAiSummary | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [predictiveAlerts, setPredictiveAlerts] = useState<HrPredictiveAlert[]>([]);
  const [predictiveAlertsLoading, setPredictiveAlertsLoading] = useState(true);
  const [showMoodInfo, setShowMoodInfo] = useState(false);
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  async function loadData() {
    try {
      setLoading(true);
      const result = await getHRDashboard(selectedDays);
      setData(result);
    } finally {
      setLoading(false);
    }
  }

  async function loadAiSummary() {
    try {
      setAiLoading(true);

      const result = await getHrWellbeingSummary(selectedDays);

      setAiSummary(result);
    } finally {
      setAiLoading(false);
    }
  }
  async function loadPredictiveAlerts() {
    try {
      const data = await getHrPredictiveAlerts(selectedDays);
      setPredictiveAlerts(data);
    } finally {
      setPredictiveAlertsLoading(false);
    }
  }

  async function handleExportPdf() {
    setExportError("");

    if (!exportStartDate || !exportEndDate) {
      setExportError("Please select both start and end date.");
      return;
    }

    if (new Date(exportStartDate) > new Date(exportEndDate)) {
      setExportError("Start date cannot be after end date.");
      return;
    }

    try {
      setIsExporting(true);
      await exportHRReportPdf(exportStartDate, exportEndDate);
    } catch (error) {
      console.error("Failed to export HR report:", error);
      setExportError("Could not export PDF report.");
    } finally {
      setIsExporting(false);
    }
  }

  useEffect(() => {
    loadData();
    loadAiSummary();
    loadPredictiveAlerts();
  }, [selectedDays]);

  if (loading || !data) {
    return (
      <div className="relative min-h-screen bg-[#f4faf2]">
        <Header />
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-green-600" />
            <p className="text-sm text-slate-500">Loading HR dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const stressTrend = getTrendInfo(data.stressTrendPercentage);
  const energyTrend = getTrendInfo(data.energyTrendPercentage);
  const highStressTrend = getTrendInfo(data.highStressTrendPercentage);

  const highestRiskDepartment =
    data.departments.length > 0
      ? [...data.departments].sort((a, b) => b.riskScore - a.riskScore)[0]
      : null;

  const moodHealthScore = calculateMoodHealthScore(data.moodDistribution);
  const moodHealthLevel = getMoodHealthLevel(moodHealthScore);

  const chartData = data.departments.map((dep) => ({
    name: dep.department,
    stress: dep.averageStress,
    energy: dep.averageEnergy,
  }));

  const stressChartData = data.departments.map((dep) => ({
    name: dep.department,
    value: dep.highStressCount,
    percentage:
      dep.totalCheckIns > 0
        ? ((dep.highStressCount / dep.totalCheckIns) * 100).toFixed(1)
        : "0.0",
  }));

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4faf2]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-green-300/20 blur-3xl" />
        <div className="absolute -left-40 top-1/2 h-80 w-80 rounded-full bg-yellow-200/30 blur-3xl" />
        <div className="absolute bottom-10 right-1/3 h-72 w-72 rounded-full bg-rose-200/20 blur-3xl" />
      </div>

      <Header />

      <main className="relative mx-auto max-w-7xl px-4 pt-28 pb-8">
        <section className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">HR Dashboard</h1>
          </div>
          <p className="ml-15 text-sm text-slate-500">
            Company-wide wellbeing overview and department insights
          </p>
        </section>

        <section className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur">
          <div>
            <p className="text-sm font-semibold text-slate-900">Time period</p>
            <p className="text-xs text-slate-500">
              Filter HR analytics by recent check-ins
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {dateRangeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedDays(option.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedDays === option.value
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-green-50 text-slate-600 hover:bg-green-100"
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>
        <section className="mb-8 rounded-3xl border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Export HR report
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Download a PDF report for a custom period.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Start date
                </label>
                <input
                  type="date"
                  value={exportStartDate}
                  onChange={(event) => setExportStartDate(event.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-green-300 focus:ring-4 focus:ring-green-200/60"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  End date
                </label>
                <input
                  type="date"
                  value={exportEndDate}
                  onChange={(event) => setExportEndDate(event.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-green-300 focus:ring-4 focus:ring-green-200/60"
                />
              </div>

              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExporting}
                className="h-10 rounded-xl bg-[#4caf58] px-4 text-sm font-medium text-white shadow-lg shadow-green-500/20 transition hover:bg-[#43a04f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isExporting ? "Exporting..." : "Download PDF"}
              </button>
            </div>
          </div>

          {exportError && (
            <p className="mt-3 text-sm text-rose-600">
              {exportError}
            </p>
          )}
        </section>
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Activity className="h-5 w-5 text-green-600" />
            Company Overview
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <OverviewCard
              label="Total Check-ins"
              value={data.totalCheckIns}
              sublabel={getPeriodLabel(selectedDays)}
              icon={<Users className="h-6 w-6 text-green-600" />}
              iconBg="bg-green-100"
            />

            <OverviewCard
              label="Avg. Stress Level"
              value={data.averageStress.toFixed(1)}
              badge={getStressLevel(data.averageStress).label}
              badgeClass={`${getStressLevel(data.averageStress).bgColor} ${getStressLevel(data.averageStress).color}`}
              trend={`${stressTrend.arrow} ${stressTrend.display} vs previous period`}
              trendClass={getTrendClass(data.stressTrendPercentage, true)}
              icon={<TrendingDown className="h-6 w-6 text-rose-500" />}
              iconBg="bg-rose-100"
            />

            <OverviewCard
              label="Avg. Energy Level"
              value={data.averageEnergy.toFixed(1)}
              badge={getEnergyLevel(data.averageEnergy).label}
              badgeClass={`${getEnergyLevel(data.averageEnergy).bgColor} ${getEnergyLevel(data.averageEnergy).color}`}
              trend={`${energyTrend.arrow} ${energyTrend.display} vs previous period`}
              trendClass={getTrendClass(data.energyTrendPercentage, false)}
              icon={<Zap className="h-6 w-6 text-amber-500" />}
              iconBg="bg-amber-100"
            />

            <OverviewCard
              label="High Stress Alerts"
              value={data.highStressCount}
              sublabel={`${data.totalCheckIns > 0
                ? ((data.highStressCount / data.totalCheckIns) * 100).toFixed(1)
                : "0.0"
                }% of check-ins`}
              trend={`${highStressTrend.arrow} ${highStressTrend.display} vs previous period`}
              trendClass={getTrendClass(data.highStressTrendPercentage, true)}
              icon={<AlertTriangle className="h-6 w-6 text-orange-500" />}
              iconBg="bg-orange-100"
            />

            <OverviewCard
              label="Highest Risk Department"
              value={highestRiskDepartment ? highestRiskDepartment.department : "N/A"}
              sublabel={
                highestRiskDepartment
                  ? `Risk score ${highestRiskDepartment.riskScore.toFixed(1)}`
                  : "No data"
              }
              badge={highestRiskDepartment?.riskLevel}
              badgeClass={
                highestRiskDepartment
                  ? getRiskLevelClasses(highestRiskDepartment.riskLevel)
                  : "bg-slate-100 text-slate-600"
              }
              icon={<Building2 className="h-6 w-6 text-rose-500" />}
              iconBg="bg-rose-100"
            />
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100">
              <Sparkles className="h-5 w-5 text-violet-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                AI Organizational Insight
              </h2>

              <p className="text-sm text-slate-500">
                AI-generated wellbeing analysis for the selected period
              </p>
            </div>
          </div>

          {aiLoading ? (
            <p className="text-sm text-slate-500">
              Generating AI organizational insight...
            </p>
          ) : aiSummary ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
                  {aiSummary.riskLevel} organizational risk
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                  {selectedDays === 180
                    ? "Last 6 months"
                    : `Last ${selectedDays} days`}
                </span>

                <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-700">
                  Highest risk: {aiSummary.highestRiskDepartment}
                </span>
              </div>

              <p className="text-sm leading-6 text-slate-600">
                {aiSummary.summary}
              </p>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800">
                  HR Recommendations
                </p>

                <ul className="space-y-2">
                  {aiSummary.recommendations.map((recommendation, index) => (
                    <li
                      key={index}
                      className="rounded-2xl bg-violet-50 px-4 py-3 text-sm text-slate-600"
                    >
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No AI summary available.
            </p>
          )}


        </section>
        <div>
          <section className="mt-8">
            <HrPredictiveAlertsCard
              alerts={predictiveAlerts}
              loading={predictiveAlertsLoading}
            />
          </section>
        </div>

        <br></br>

        <section className="mb-8 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <Activity className="h-5 w-5 text-green-600" />
                Mood Distribution
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Breakdown of reported moods for the selected period
              </p>
            </div>

            {showMoodInfo && (
              <div className="mb-6 rounded-2xl border border-green-100 bg-green-50/70 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">
                  How Mood Health is calculated
                </p>

                <p className="mt-2">
                  Each mood is assigned a weight: Happy +2, Neutral +1, Tired -1,
                  Stressed -2 and Anxious -2. The score is calculated from all check-ins
                  in the selected period and normalized to a 0-100 scale.
                </p>

                <p className="mt-2">
                  Higher scores indicate a healthier overall mood pattern, while lower
                  scores suggest more frequent tired, stressed, or anxious check-ins.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowMoodInfo((value) => !value)}
              className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
              aria-label="Show mood health score explanation"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>

          {data.moodDistribution.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500">
              No mood data available for this period.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="relative h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.moodDistribution}
                      dataKey="count"
                      nameKey="mood"
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={105}
                      paddingAngle={4}
                    >
                      {data.moodDistribution.map((entry) => (
                        <Cell key={entry.mood} fill={getMoodColor(entry.mood)} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Mood Health
                    </p>

                    <p className={`mt-1 text-3xl font-bold ${getMoodHealthClass(moodHealthScore)}`}>
                      {moodHealthScore}
                    </p>

                    <p className="text-xs font-medium text-slate-500">
                      {moodHealthLevel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-3">
                {data.moodDistribution.map((item) => (
                  <div
                    key={item.mood}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: getMoodColor(item.mood) }}
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {item.mood}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.percentage.toFixed(1)}%
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.count} check-ins
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
            <h2 className="mb-6 flex items-center gap-2 text-base font-semibold text-slate-900">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Stress & Energy by Department
            </h2>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="stress" name="Avg. Stress" fill="#f87171" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="energy" name="Avg. Energy" fill="#fbbf24" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
            <h2 className="mb-6 flex items-center gap-2 text-base font-semibold text-slate-900">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              High Stress Cases by Department
            </h2>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stressChartData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal vertical={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <Tooltip />
                  <Bar dataKey="value" name="High Stress Cases" radius={[0, 6, 6, 0]}>
                    {stressChartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          Number(entry.percentage) > 10
                            ? "#f87171"
                            : Number(entry.percentage) > 5
                              ? "#fb923c"
                              : "#4ade80"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Building2 className="h-5 w-5 text-green-600" />
            Department Breakdown
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.departments.map((dep) => {
              const stressLevel = getStressLevel(dep.averageStress);
              const energyLevel = getEnergyLevel(dep.averageEnergy);
              const highStressPercentage =
                dep.totalCheckIns > 0
                  ? ((dep.highStressCount / dep.totalCheckIns) * 100).toFixed(1)
                  : "0.0";

              return (

                <div
                  key={dep.department}
                  className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur transition hover:shadow-md"
                >
                  
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100">
                        <Building2 className="h-4 w-4 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">
                        {dep.department}
                      </h3>
                    </div>

                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs text-slate-600">
                      {dep.totalCheckIns} check-ins
                    </span>
                    
                  </div>

                  <div className="mb-4 rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        Risk Score
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getRiskLevelClasses(
                          dep.riskLevel
                        )}`}
                      >
                        {dep.riskLevel}
                      </span>
                    </div>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {dep.riskScore.toFixed(1)}
                      <span className="text-sm font-normal text-slate-400">/100</span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <MetricRow
                      icon={<TrendingDown className="h-3.5 w-3.5 text-rose-500" />}
                      iconBg="bg-rose-100"
                      label="Stress"
                      value={dep.averageStress.toFixed(1)}
                      badge={stressLevel.label}
                      badgeClass={`${stressLevel.bgColor} ${stressLevel.color}`}
                    />

                    <MetricRow
                      icon={<Zap className="h-3.5 w-3.5 text-amber-500" />}
                      iconBg="bg-amber-100"
                      label="Energy"
                      value={dep.averageEnergy.toFixed(1)}
                      badge={energyLevel.label}
                      badgeClass={`${energyLevel.bgColor} ${energyLevel.color}`}
                    />

                    <div className="border-t border-slate-100 pt-3">
                      <MetricRow
                        icon={<AlertTriangle className="h-3.5 w-3.5 text-orange-500" />}
                        iconBg="bg-orange-100"
                        label="High Stress"
                        value={dep.highStressCount}
                        badge={`${highStressPercentage}%`}
                        badgeClass={
                          Number(highStressPercentage) > 10
                            ? "bg-rose-100 text-rose-600"
                            : Number(highStressPercentage) > 5
                              ? "bg-orange-100 text-orange-600"
                              : "bg-emerald-100 text-emerald-600"
                        }
                      />
                    </div>
                    <Link
                    to={`/hr-dashboard/departments/${encodeURIComponent(
                      dep.department
                    )}?days=${selectedDays}`}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                  >
                    View details
                  </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function OverviewCard({
  label,
  value,
  sublabel,
  badge,
  badgeClass,
  trend,
  trendClass,
  icon,
  iconBg,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  badge?: string;
  badgeClass?: string;
  trend?: string;
  trendClass?: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-sm text-slate-500">{label}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>

          {sublabel && <p className="mt-1 text-xs text-slate-400">{sublabel}</p>}

          {badge && (
            <span
              className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}
            >
              {badge}
            </span>
          )}

          {trend && (
            <p className={`mt-2 text-xs font-medium ${trendClass}`}>
              {trend}
            </p>
          )}
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function MetricRow({
  icon,
  iconBg,
  label,
  value,
  badge,
  badgeClass,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
  badge: string;
  badgeClass: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBg}`}>
          {icon}
        </div>
        <span className="text-sm text-slate-500">{label}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-900">{value}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
          {badge}
        </span>
      </div>
    </div>
  );
}

export default HRDashboardPage;