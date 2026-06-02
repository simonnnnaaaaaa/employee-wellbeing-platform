import Header from "../components/Header";
import { useEffect, useState } from "react";
import { createCheckIn, getMyCheckIns } from "../services/checkInService";
import { getMyWellbeingInsight } from "../services/aiService";
import { Sparkles } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import {
    Brain,
    Calendar,
    CheckCircle2,
    ChevronRight,
    ClipboardCheck,
    Frown,
    Leaf,
    Meh,
    Smile,
    AlertCircle,
    TrendingUp,
    Zap,
} from "lucide-react";
import PredictiveAlertsCard from "../components/PredictiveAlertsCard";
import { getPredictiveAlerts } from "../services/predictiveAlertService";
import type { PredictiveAlert } from "../services/predictiveAlertService";


type CheckIn = {
    id: string;
    stressLevel: number;
    energyLevel: number;
    mood: string;
    notes?: string;
    createdAt: string;
};

type WellbeingInsight = {
    riskScore: number;
    riskLevel: string;
    summary: string;
    recommendations: string[];
};

const moodOptions = [
    { value: "Happy", icon: Smile, color: "text-emerald-500" },
    { value: "Neutral", icon: Meh, color: "text-amber-500" },
    { value: "Tired", icon: Frown, color: "text-blue-400" },
    { value: "Stressed", icon: AlertCircle, color: "text-orange-500" },
    { value: "Anxious", icon: Brain, color: "text-rose-400" },
];

function getMoodIcon(mood: string) {
    const option = moodOptions.find((item) => item.value === mood);
    if (!option) return <Meh className="h-4 w-4 text-slate-400" />;

    const Icon = option.icon;
    return <Icon className={`h-4 w-4 ${option.color}`} />;
}

function getMoodBgColor(mood: string) {
    switch (mood) {
        case "Happy":
            return "border-emerald-200 bg-emerald-50";
        case "Neutral":
            return "border-amber-200 bg-amber-50";
        case "Tired":
            return "border-blue-200 bg-blue-50";
        case "Stressed":
            return "border-orange-200 bg-orange-50";
        case "Anxious":
            return "border-rose-200 bg-rose-50";
        default:
            return "border-slate-200 bg-slate-50";
    }
}

function DashboardPage() {
    const [stressLevel, setStressLevel] = useState(5);
    const [energyLevel, setEnergyLevel] = useState(5);
    const [mood, setMood] = useState("Neutral");
    const [notes, setNotes] = useState("");

    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkIns, setCheckIns] = useState<CheckIn[]>([]);

    const [insight, setInsight] = useState<WellbeingInsight | null>(null);
    const [insightLoading, setInsightLoading] = useState(true);

    const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveAlert[]>([]);
    const [predictiveAlertsLoading, setPredictiveAlertsLoading] = useState(true);

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setIsSubmitting(true);
        setMessage("");

        try {
            await createCheckIn({
                stressLevel,
                energyLevel,
                mood,
                notes,
            });

            await loadCheckIns();
            await loadInsight();

            setMessage("Check-in saved successfully.");
            setStressLevel(5);
            setEnergyLevel(5);
            setMood("Neutral");
            setNotes("");

            setTimeout(() => setMessage(""), 3000);
        } catch {
            setMessage("Could not save check-in.");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function loadCheckIns() {
        const data = await getMyCheckIns();
        setCheckIns(data);
    }

    async function loadInsight() {
        try {
            const data = await getMyWellbeingInsight();
            setInsight(data);
        } finally {
            setInsightLoading(false);
        }
    }

    useEffect(() => {
        const fetchPredictiveAlerts = async () => {
            try {
                const data = await getPredictiveAlerts();
                setPredictiveAlerts(data);
            } catch (error) {
                console.error("Failed to load predictive alerts:", error);
            } finally {
                setPredictiveAlertsLoading(false);
            }
        };

        fetchPredictiveAlerts();
    }, []);

    useEffect(() => {
        loadCheckIns();
        loadInsight();
    }, []);

    const chartData = [...checkIns].reverse().map((checkIn) => ({
        date: new Date(checkIn.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        }),
        stress: checkIn.stressLevel,
        energy: checkIn.energyLevel,
    }));

    const averageStress =
        checkIns.length > 0
            ? Math.round(
                (checkIns.reduce((sum, item) => sum + item.stressLevel, 0) /
                    checkIns.length) *
                10
            ) / 10
            : 0;

    const averageEnergy =
        checkIns.length > 0
            ? Math.round(
                (checkIns.reduce((sum, item) => sum + item.energyLevel, 0) /
                    checkIns.length) *
                10
            ) / 10
            : 0;

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#f4faf2]">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-green-300/20 blur-3xl" />
                <div className="absolute -left-40 top-1/3 h-80 w-80 rounded-full bg-yellow-200/30 blur-3xl" />
                <div className="absolute bottom-20 right-1/4 h-64 w-64 rounded-full bg-sky-200/20 blur-3xl" />
            </div>

            <Header />

            <main className="relative mx-auto max-w-7xl px-4 py-8">
                <section className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Good morning!</h1>
                    <p className="mt-2 text-sm text-slate-500">
                        How are you feeling today? Take a moment to check in with yourself.
                    </p>
                </section>

                <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100">
                                <Brain className="h-6 w-6 text-rose-500" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Avg. Stress</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {averageStress}
                                    <span className="text-sm font-normal text-slate-500">/10</span>
                                </p>
                            </div>
                        </div>
                    </div>


                    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
                                <Zap className="h-6 w-6 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Avg. Energy</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {averageEnergy}
                                    <span className="text-sm font-normal text-slate-500">/10</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                                <ClipboardCheck className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Total Check-ins</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {checkIns.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-8 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100">
                            <Sparkles className="h-5 w-5 text-violet-600" />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                AI Wellbeing Insight
                            </h2>
                            <p className="text-sm text-slate-500">
                                Personalized insight based on your recent check-ins
                            </p>
                        </div>



                    </div>

                    
                    {insightLoading ? (
                        <p className="text-sm text-slate-500">Generating your insight...</p>
                    ) : insight ? (
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
                                    Risk score: {insight.riskScore}/100
                                </span>

                                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                                    {insight.riskLevel}
                                </span>
                            </div>

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
                            No insight available yet.
                        </p>
                    )}
                    <br></br>
                    <section className="mb-8">
                        <PredictiveAlertsCard
                            alerts={predictiveAlerts}
                            loading={predictiveAlertsLoading}
                        />
                    </section>
                </section>


                <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur lg:col-span-1">
                        <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900">
                            <Calendar className="h-5 w-5 text-green-600" />
                            Daily Check-in
                        </h2>

                        {message && (
                            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                                <CheckCircle2 className="h-4 w-4" />
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-slate-700">
                                        Stress Level
                                    </label>
                                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-sm font-semibold text-rose-500">
                                        {stressLevel}/10
                                    </span>
                                </div>

                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={stressLevel}
                                    onChange={(event) => setStressLevel(Number(event.target.value))}
                                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-rose-100 accent-rose-500"
                                />

                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>Low</span>
                                    <span>High</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-slate-700">
                                        Energy Level
                                    </label>
                                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-sm font-semibold text-amber-500">
                                        {energyLevel}/10
                                    </span>
                                </div>

                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={energyLevel}
                                    onChange={(event) => setEnergyLevel(Number(event.target.value))}
                                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-amber-100 accent-amber-500"
                                />

                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>Low</span>
                                    <span>High</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-700">
                                    Current Mood
                                </label>
                                <select
                                    value={mood}
                                    onChange={(event) => setMood(event.target.value)}
                                    className="h-12 w-full rounded-xl border border-green-200 bg-[#eef4eb] px-4 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-4 focus:ring-green-200/60"
                                >
                                    <option value="Happy">Happy</option>
                                    <option value="Neutral">Neutral</option>
                                    <option value="Tired">Tired</option>
                                    <option value="Stressed">Stressed</option>
                                    <option value="Anxious">Anxious</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-700">
                                    Notes{" "}
                                    <span className="font-normal text-slate-400">(optional)</span>
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(event) => setNotes(event.target.value)}
                                    placeholder="How are you feeling? Any thoughts to capture..."
                                    className="min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-green-300 focus:ring-4 focus:ring-green-200/60"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex h-11 w-full items-center justify-center rounded-xl bg-[#4caf58] font-medium text-white shadow-lg shadow-green-500/20 transition hover:bg-[#43a04f] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? "Saving..." : "Save Check-in"}
                            </button>
                        </form>
                    </div>

                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
                            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                Wellbeing Evolution
                            </h2>

                            {chartData.length === 0 ? (
                                <div className="flex h-72 items-center justify-center text-sm text-slate-500">
                                    No data available yet. Start by creating your first check-in!
                                </div>
                            ) : (
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={chartData}
                                            margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                            <YAxis domain={[1, 10]} tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Line
                                                type="monotone"
                                                dataKey="stress"
                                                name="Stress"
                                                stroke="#f43f5e"
                                                strokeWidth={3}
                                                dot={{ fill: "#f43f5e", r: 4 }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="energy"
                                                name="Energy"
                                                stroke="#f59e0b"
                                                strokeWidth={3}
                                                dot={{ fill: "#f59e0b", r: 4 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-rose-500" />
                                    <span className="text-sm text-slate-500">Stress</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                                    <span className="text-sm text-slate-500">Energy</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
                            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900">
                                <ClipboardCheck className="h-5 w-5 text-green-600" />
                                Recent Check-ins
                            </h2>

                            {checkIns.length === 0 ? (
                                <div className="py-8 text-center text-sm text-slate-500">
                                    No check-ins yet. Create your first one!
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {checkIns.slice(0, 5).map((checkIn) => (
                                        <div
                                            key={checkIn.id}
                                            className={`rounded-2xl border p-4 transition hover:shadow-sm ${getMoodBgColor(
                                                checkIn.mood
                                            )}`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                                                        {getMoodIcon(checkIn.mood)}
                                                    </div>

                                                    <div>
                                                        <p className="flex items-center gap-2 font-medium text-slate-900">
                                                            {checkIn.mood}
                                                            <span className="text-xs font-normal text-slate-500">
                                                                {new Date(checkIn.createdAt).toLocaleDateString(
                                                                    "en-US",
                                                                    {
                                                                        weekday: "short",
                                                                        month: "short",
                                                                        day: "numeric",
                                                                    }
                                                                )}
                                                            </span>
                                                        </p>

                                                        <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                <Brain className="h-3 w-3 text-rose-400" />
                                                                {checkIn.stressLevel}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Zap className="h-3 w-3 text-amber-400" />
                                                                {checkIn.energyLevel}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <ChevronRight className="h-5 w-5 text-slate-400" />
                                            </div>

                                            {checkIn.notes && (
                                                <p className="mt-2 pl-13 text-sm text-slate-500">
                                                    {checkIn.notes}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default DashboardPage;