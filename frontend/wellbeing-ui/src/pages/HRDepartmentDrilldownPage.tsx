import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import {
    getDepartmentDrilldown,
    type DepartmentDrilldownData,
} from "../services/hrService";

function HRDepartmentDrilldownPage() {
    const { departmentName } = useParams();
    const [searchParams] = useSearchParams();
    const [departmentData, setDepartmentData] = useState<DepartmentDrilldownData | null>(null);
    const [loading, setLoading] = useState(true);
    const days = searchParams.get("days") ?? "30";
    const decodedDepartmentName = decodeURIComponent(departmentName ?? "");

    const [data, setData] = useState<DepartmentDrilldownData | null>(null);
    const selectedDays = Number(days);

    useEffect(() => {
        if (departmentName) {
            setLoading(true);
            getDepartmentDrilldown(decodeURIComponent(departmentName), Number(days))
                .then((data) => {
                    setDepartmentData(data);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [departmentName, days]);



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

        loadDepartmentData();
    }, [decodedDepartmentName, selectedDays]);

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