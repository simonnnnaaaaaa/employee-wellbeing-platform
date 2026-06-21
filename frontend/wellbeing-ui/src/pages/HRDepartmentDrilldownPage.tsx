import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import { ArrowLeft, Building2, Loader2, Sparkles } from "lucide-react";
import {
  getDepartmentDrilldown,
  type DepartmentDrilldownData,
} from "../services/hrService";
import { getDepartmentWellbeingInsight } from "../services/aiService";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

type DepartmentInsight = {
  department: string;
  riskLevel: string;
  summary: string;
  recommendations: string[];
};

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

function calculateMoodHealthScore(
  moods: DepartmentDrilldownData["moodDistribution"]
) {
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
  if (score >= 75) return "Strong";
  if (score >= 55) return "Moderate";
  if (score >= 35) return "At risk";
  return "Critical";
}

function getMoodHealthClass(score: number) {
  if (score >= 75) return "text-emerald-600";
  if (score >= 55) return "text-amber-600";
  if (score >= 35) return "text-orange-600";
  return "text-rose-600";
}

function HRDepartmentDrilldownPage() {
  const { departmentName } = useParams();
  const [searchParams] = useSearchParams();

  const days = searchParams.get("days") ?? "30";
  const selectedDays = Number(days);
  const decodedDepartmentName = decodeURIComponent(departmentName ?? "");

  const [data, setData] = useState<DepartmentDrilldownData | null>(null);
  const [loading, setLoading] = useState(true);

  const [insight, setInsight] = useState<DepartmentInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);

  useEffect(() => {
    async function loadDepartmentData() {
      try {
        setLoading(true);

        const result = await getDepartmentDrilldown(
          decodedDepartmentName,
          selectedDays
        );

        setData(result);
      } finally {
        setLoading(false);
      }
    }

    async function loadInsight() {
      try {
        setInsightLoading(true);

        const result = await getDepartmentWellbeingInsight(
          decodedDepartmentName,
          selectedDays
        );

        setInsight(result);
      } finally {
        setInsightLoading(false);
      }
    }

    if (decodedDepartmentName) {
      loadDepartmentData();
      loadInsight();
    }
  }, [decodedDepartmentName, selectedDays]);

  const moodHealthScore = data
    ? calculateMoodHealthScore(data.moodDistribution)
    : 0;

  const moodHealthLevel = getMoodHealthLevel(moodHealthScore);

  const trendData =
    data?.dailyTrend.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      }),
      stress: Number(item.averageStress.toFixed(1)),
      energy: Number(item.averageEnergy.toFixed(1)),
    })) ?? [];

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#f4faf2]">
        <Header />
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-green-600" />
            <p className="text-sm text-slate-500">
              Loading department details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4faf2]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-green-300/20 blur-3xl" />
        <div className="absolute -left-40 top-1/2 h-80 w-80 rounded-full bg-yellow-200/30 blur-3xl" />
      </div>

      <Header />

      <main className="relative mx-auto max-w-7xl px-4 pt-28 pb-8">
        <Link
          to="/hr-dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-green-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to HR Dashboard
        </Link>

        <section className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {decodedDepartmentName}
              </h1>
              <p className="text-sm text-slate-500">
                Department wellbeing drill-down · Last {days} days
              </p>
            </div>
          </div>

          {data && (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <DrilldownKpiCard label="Total Check-ins" value={data.totalCheckIns} />
              <DrilldownKpiCard label="Avg. Stress" value={data.averageStress.toFixed(1)} />
              <DrilldownKpiCard label="Avg. Energy" value={data.averageEnergy.toFixed(1)} />
              <DrilldownKpiCard label="High Stress" value={data.highStressCount} />
              <DrilldownKpiCard
                label="Risk Score"
                value={data.riskScore.toFixed(1)}
                sublabel={data.riskLevel}
              />
            </div>
          )}

          {data && (
            <section className="mt-8 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Mood Distribution
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Mood breakdown for {data.department} in the selected period
                </p>
              </div>

              {data.moodDistribution.length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500">
                  No mood data available for this department.
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
                            <Cell
                              key={entry.mood}
                              fill={getMoodColor(entry.mood)}
                            />
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

                        <p
                          className={`mt-1 text-3xl font-bold ${getMoodHealthClass(
                            moodHealthScore
                          )}`}
                        >
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
          )}

          {data && (
            <section className="mt-8 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Stress & Energy Trend
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Daily wellbeing evolution for {data.department}
                </p>
              </div>

              {trendData.length === 0 ? (
                <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500">
                  No trend data available.
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trendData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                      />

                      <YAxis
                        domain={[0, 10]}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                      />

                      <Tooltip />
                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="stress"
                        name="Avg. Stress"
                        stroke="#f87171"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />

                      <Line
                        type="monotone"
                        dataKey="energy"
                        name="Avg. Energy"
                        stroke="#fbbf24"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          )}

          <section className="mt-8 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100">
                <Sparkles className="h-5 w-5 text-violet-600" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  AI Department Insight
                </h2>

                <p className="text-sm text-slate-500">
                  AI-generated wellbeing analysis for {decodedDepartmentName}
                </p>
              </div>
            </div>

            {insightLoading ? (
              <p className="text-sm text-slate-500">
                Generating department insight...
              </p>
            ) : insight ? (
              <div className="space-y-4">
                <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
                  {insight.riskLevel} wellbeing risk
                </span>

                <p className="text-sm leading-6 text-slate-600">
                  {insight.summary}
                </p>

                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-800">
                    Recommendations
                  </p>

                  <ul className="space-y-2">
                    {insight.recommendations.map((recommendation, index) => (
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
                No insight available.
              </p>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

function DrilldownKpiCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {sublabel && (
        <p className="mt-1 text-xs font-medium text-slate-500">{sublabel}</p>
      )}
    </div>
  );
}

export default HRDepartmentDrilldownPage;