import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import type { PredictiveAlert } from "../services/predictiveAlertService";

interface PredictiveAlertsCardProps {
  alerts: PredictiveAlert[];
  loading: boolean;
}

export default function PredictiveAlertsCard({
  alerts,
  loading,
}: PredictiveAlertsCardProps) {
  const getSeverityClasses = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "bg-rose-100 text-rose-700";
      case "medium":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-emerald-100 text-emerald-700";
    }
  };

  const Icon = alerts.some((alert) => alert.severity.toLowerCase() === "high")
    ? ShieldAlert
    : alerts.some((alert) => alert.severity.toLowerCase() === "medium")
    ? AlertTriangle
    : CheckCircle2;

  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100">
          <Icon className="h-5 w-5 text-orange-500" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Predictive Alerts
          </h2>
          <p className="text-sm text-slate-500">
            Early wellbeing risk detection based on your check-ins
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          No predictive wellbeing risks detected.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  {alert.title}
                </h3>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getSeverityClasses(
                    alert.severity
                  )}`}
                >
                  {alert.severity}
                </span>
              </div>

              <p className="text-sm leading-6 text-slate-600">
                {alert.message}
              </p>

              <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-600">
                <span className="font-semibold text-slate-800">
                  Recommendation:
                </span>{" "}
                {alert.recommendation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}