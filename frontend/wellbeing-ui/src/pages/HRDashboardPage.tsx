import { useEffect, useState } from "react";
import Header from "../components/Header";
import { getHRDashboard } from "../services/hrService";
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
} from "recharts";

type Department = {
  department: string;
  totalCheckIns: number;
  averageStress: number;
  averageEnergy: number;
  highStressCount: number;
};

type HRDashboardData = {
  totalCheckIns: number;
  averageStress: number;
  averageEnergy: number;
  highStressCount: number;
  departments: Department[];
};

function getStressLevel(stress: number) {
  if (stress <= 3) return { label: "Low", color: "text-emerald-600", bgColor: "bg-emerald-100" };
  if (stress <= 5) return { label: "Moderate", color: "text-amber-600", bgColor: "bg-amber-100" };
  if (stress <= 7) return { label: "High", color: "text-orange-600", bgColor: "bg-orange-100" };
  return { label: "Critical", color: "text-rose-600", bgColor: "bg-rose-100" };
}

function getEnergyLevel(energy: number) {
  if (energy <= 3) return { label: "Low", color: "text-rose-600", bgColor: "bg-rose-100" };
  if (energy <= 5) return { label: "Moderate", color: "text-amber-600", bgColor: "bg-amber-100" };
  if (energy <= 7) return { label: "Good", color: "text-emerald-600", bgColor: "bg-emerald-100" };
  return { label: "Excellent", color: "text-teal-600", bgColor: "bg-teal-100" };
}

function HRDashboardPage() {
  const [data, setData] = useState<HRDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const result = await getHRDashboard();
      setData(result);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

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

      <main className="relative mx-auto max-w-7xl px-4 py-8">
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

        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Activity className="h-5 w-5 text-green-600" />
            Company Overview
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <OverviewCard
              label="Total Check-ins"
              value={data.totalCheckIns}
              sublabel="All time"
              icon={<Users className="h-6 w-6 text-green-600" />}
              iconBg="bg-green-100"
            />

            <OverviewCard
              label="Avg. Stress Level"
              value={data.averageStress.toFixed(1)}
              badge={getStressLevel(data.averageStress).label}
              badgeClass={`${getStressLevel(data.averageStress).bgColor} ${getStressLevel(data.averageStress).color}`}
              icon={<TrendingDown className="h-6 w-6 text-rose-500" />}
              iconBg="bg-rose-100"
            />

            <OverviewCard
              label="Avg. Energy Level"
              value={data.averageEnergy.toFixed(1)}
              badge={getEnergyLevel(data.averageEnergy).label}
              badgeClass={`${getEnergyLevel(data.averageEnergy).bgColor} ${getEnergyLevel(data.averageEnergy).color}`}
              icon={<Zap className="h-6 w-6 text-amber-500" />}
              iconBg="bg-amber-100"
            />

            <OverviewCard
              label="High Stress Alerts"
              value={data.highStressCount}
              sublabel={`${data.totalCheckIns > 0 ? ((data.highStressCount / data.totalCheckIns) * 100).toFixed(1) : "0.0"}% of check-ins`}
              icon={<AlertTriangle className="h-6 w-6 text-orange-500" />}
              iconBg="bg-orange-100"
            />
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
            <h2 className="mb-6 flex items-center gap-2 text-base font-semibold text-slate-900">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Stress & Energy by Department
            </h2>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
                      <h3 className="font-semibold text-slate-900">{dep.department}</h3>
                    </div>

                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs text-slate-600">
                      {dep.totalCheckIns} check-ins
                    </span>
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
  icon,
  iconBg,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  badge?: string;
  badgeClass?: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-sm text-slate-500">{label}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>

          {sublabel && <p className="mt-1 text-xs text-slate-400">{sublabel}</p>}

          {badge && (
            <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
              {badge}
            </span>
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