import { AlertTriangle, ShieldAlert } from "lucide-react";
import type { HrPredictiveAlert } from "../services/hrPredictiveAlertService";

interface Props {
  alerts: HrPredictiveAlert[];
  loading: boolean;
}

export default function HrPredictiveAlertsCard({
  alerts,
  loading,
}: Props) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100">
          <ShieldAlert className="h-5 w-5 text-rose-500" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Organizational Risk Alerts
          </h2>
          <p className="text-sm text-slate-500">
            Predictive wellbeing signals across the organization
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">
          Analyzing organizational wellbeing...
        </p>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  {alert.title}
                </h3>

                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                  {alert.severity}
                </span>
              </div>

              <p className="text-sm text-slate-600">
                {alert.message}
              </p>

              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                Affected employees: {alert.affectedEmployeesCount}
              </div>

              <div className="mt-3 rounded-xl bg-white p-3">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Recommendation
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {alert.recommendation}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}