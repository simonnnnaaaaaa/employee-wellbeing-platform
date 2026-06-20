import { useEffect, useState } from "react";
import Header from "../components/Header";
import { getMyCheckIns } from "../services/checkInService";
import {
  Award,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Lock,
  Mail,
  Shield,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";

type CheckIn = {
  id: string;
  stressLevel: number;
  energyLevel: number;
  mood: string;
  notes?: string;
  createdAt: string;
};

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function calculateCurrentStreak(checkIns: CheckIn[]) {
  if (checkIns.length === 0) return 0;

  const uniqueDates = Array.from(
    new Set(
      checkIns.map((checkIn) =>
        new Date(checkIn.createdAt).toISOString().split("T")[0]
      )
    )
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  const today = new Date();

  for (let index = 0; index < uniqueDates.length; index++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - index);

    const actualDate = new Date(uniqueDates[index]);

    if (isSameDay(actualDate, expectedDate)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function calculateLongestStreak(checkIns: CheckIn[]) {
  if (checkIns.length === 0) return 0;

  const uniqueDates = Array.from(
    new Set(
      checkIns.map((checkIn) =>
        new Date(checkIn.createdAt).toISOString().split("T")[0]
      )
    )
  ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  let longest = 1;
  let current = 1;

  for (let index = 1; index < uniqueDates.length; index++) {
    const previousDate = new Date(uniqueDates[index - 1]);
    const currentDate = new Date(uniqueDates[index]);

    const differenceInDays =
      (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24);

    if (differenceInDays === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

function getMostCommonMood(checkIns: CheckIn[]) {
  if (checkIns.length === 0) return "No data yet";

  const moodCounts = checkIns.reduce<Record<string, number>>((acc, checkIn) => {
    acc[checkIn.mood] = (acc[checkIn.mood] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0];
}

function ProfilePage() {
  const firstName = localStorage.getItem("firstName") || "User";
  const lastName = localStorage.getItem("lastName") || "";
  const email = localStorage.getItem("email") || "No email available";
  const role = localStorage.getItem("role") || "Employee";

  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfileData() {
      try {
        const data = await getMyCheckIns();
        setCheckIns(data);
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, []);

  const totalCheckIns = checkIns.length;
  const currentStreak = calculateCurrentStreak(checkIns);
  const longestStreak = calculateLongestStreak(checkIns);
  const mostCommonMood = getMostCommonMood(checkIns);

  const averageStress =
    totalCheckIns > 0
      ? (checkIns.reduce((sum, item) => sum + item.stressLevel, 0) / totalCheckIns).toFixed(1)
      : "0.0";

  const averageEnergy =
    totalCheckIns > 0
      ? (checkIns.reduce((sum, item) => sum + item.energyLevel, 0) / totalCheckIns).toFixed(1)
      : "0.0";

  return (
    <div className="relative min-h-screen bg-[#f4faf2]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-green-300/20 blur-3xl" />
        <div className="absolute -left-40 top-1/3 h-80 w-80 rounded-full bg-yellow-200/30 blur-3xl" />
      </div>

      <Header />

      <main className="relative mx-auto max-w-7xl px-4 pt-28 pb-8">
        <section className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
          <p className="mt-2 text-sm text-slate-500">
            Your account details and personal wellbeing activity.
          </p>
        </section>

        <section className="mb-8 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-green-100">
                <User className="h-8 w-8 text-green-600" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {firstName} {lastName}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{role}</p>
              </div>
            </div>

            <div className="grid gap-3 text-sm text-slate-600 md:text-right">
              <p className="flex items-center gap-2 md:justify-end">
                <Mail className="h-4 w-4 text-green-600" />
                {email}
              </p>
              <p className="flex items-center gap-2 md:justify-end">
                <Shield className="h-4 w-4 text-green-600" />
                Account role: {role}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Wellbeing Activity
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <ProfileMetricCard
              label="Current Streak"
              value={loading ? "..." : currentStreak}
              sublabel="days"
              icon={<CalendarCheck className="h-6 w-6 text-green-600" />}
              iconBg="bg-green-100"
            />

            <ProfileMetricCard
              label="Longest Streak"
              value={loading ? "..." : longestStreak}
              sublabel="days"
              icon={<Award className="h-6 w-6 text-amber-500" />}
              iconBg="bg-amber-100"
            />

            <ProfileMetricCard
              label="Total Check-ins"
              value={loading ? "..." : totalCheckIns}
              sublabel="completed"
              icon={<ClipboardCheck className="h-6 w-6 text-emerald-500" />}
              iconBg="bg-emerald-100"
            />

            <ProfileMetricCard
              label="Most Common Mood"
              value={loading ? "..." : mostCommonMood}
              sublabel="overall"
              icon={<Sparkles className="h-6 w-6 text-violet-500" />}
              iconBg="bg-violet-100"
            />
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Personal Pattern
            </h2>

            <div className="space-y-4">
              <PatternRow label="Average Stress" value={`${averageStress}/10`} />
              <PatternRow label="Average Energy" value={`${averageEnergy}/10`} />
              <PatternRow label="Most Common Mood" value={mostCommonMood} />
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Achievements
            </h2>

            <div className="space-y-3">
              <Achievement unlocked={totalCheckIns >= 1} text="First check-in completed" />
              <Achievement unlocked={totalCheckIns >= 7} text="7 check-ins completed" />
              <Achievement unlocked={currentStreak >= 3} text="3 day check-in streak" />
              <Achievement unlocked={currentStreak >= 7} text="7 day check-in streak" />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-green-100 bg-green-50/80 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white">
              <Lock className="h-5 w-5 text-green-600" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">Privacy note</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your individual notes are part of your personal check-ins. HR dashboards use aggregated wellbeing data to identify organizational patterns, not to display individual notes.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ProfileMetricCard({
  label,
  value,
  sublabel,
  icon,
  iconBg,
}: {
  label: string;
  value: string | number;
  sublabel: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-400">{sublabel}</p>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function PatternRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function Achievement({ unlocked, text }: { unlocked: boolean; text: string }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
        unlocked ? "bg-green-50 text-green-700" : "bg-slate-50 text-slate-400"
      }`}
    >
      <CheckCircle2 className="h-5 w-5" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

export default ProfilePage;