import { Link } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Brain,
  CheckCircle2,
  HeartPulse,
  Leaf,
  LineChart,
  ShieldAlert,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f4faf2]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-green-300/20 blur-3xl" />
        <div className="absolute -left-40 top-1/3 h-80 w-80 rounded-full bg-yellow-200/30 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-64 w-64 rounded-full bg-sky-200/20 blur-3xl" />
      </div>

      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
            <Leaf className="h-5 w-5 text-green-600" />
          </div>
          <span className="text-lg font-semibold text-slate-900">
            Wellbeing
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white/70"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-xl bg-[#4caf58] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-green-500/20 hover:bg-[#43a04f]"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-10">
        <section className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/80 px-4 py-2 text-sm font-medium text-green-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              AI-powered wellbeing analytics
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-tight text-slate-900 md:text-6xl">
              Understand employee wellbeing before small signals become big risks.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              A modern platform for daily check-ins, AI insights, predictive wellbeing alerts,
              and HR analytics built around mood, stress, energy, and organizational health.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="rounded-2xl bg-[#4caf58] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/20 hover:bg-[#43a04f]"
              >
                Start tracking wellbeing
              </Link>

              <Link
                to="/login"
                className="rounded-2xl border border-slate-200 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-white"
              >
                Login
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 max-w-xl">
              <MiniStat value="AI" label="Insights" />
              <MiniStat value="HR" label="Analytics" />
              <MiniStat value="24/7" label="Monitoring" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-green-900/5 backdrop-blur">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">HR Dashboard Preview</p>
                <h2 className="text-xl font-bold text-slate-900">
                  Organizational Health
                </h2>
              </div>

              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                Risk detected
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <PreviewCard
                icon={<Brain className="h-5 w-5 text-rose-500" />}
                label="Avg Stress"
                value="6.8"
                bg="bg-rose-100"
              />
              <PreviewCard
                icon={<Zap className="h-5 w-5 text-amber-500" />}
                label="Avg Energy"
                value="5.2"
                bg="bg-amber-100"
              />
              <PreviewCard
                icon={<Users className="h-5 w-5 text-green-600" />}
                label="Check-ins"
                value="248"
                bg="bg-green-100"
              />
              <PreviewCard
                icon={<ShieldAlert className="h-5 w-5 text-orange-500" />}
                label="Risk Score"
                value="72"
                bg="bg-orange-100"
              />
            </div>

            <div className="mt-6 rounded-3xl bg-slate-50 p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">
                  Mood Distribution
                </p>
                <p className="text-xs text-slate-400">Last 30 days</p>
              </div>

              <div className="space-y-3">
                <MoodBar label="Neutral" value="39%" width="w-[78%]" />
                <MoodBar label="Tired" value="34%" width="w-[68%]" />
                <MoodBar label="Happy" value="16%" width="w-[32%]" />
                <MoodBar label="Stressed" value="11%" width="w-[22%]" />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Built for employees and HR teams
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              One platform, two perspectives: personal wellbeing support and organizational insights.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <AudienceCard
              title="Employee Experience"
              icon={<HeartPulse className="h-6 w-6 text-green-600" />}
              items={[
                "Daily mood, stress and energy check-ins",
                "AI-generated personal wellbeing insights",
                "Predictive alerts and recommendations",
                "Speech-to-text notes for easier reflection",
              ]}
            />

            <AudienceCard
              title="HR Analytics"
              icon={<BarChart3 className="h-6 w-6 text-green-600" />}
              items={[
                "Department-level wellbeing analytics",
                "Mood health score and distribution",
                "Risk scoring and highest-risk department detection",
                "AI organizational summaries and predictive alerts",
              ]}
            />
          </div>
        </section>

        <section className="mt-20 grid grid-cols-1 gap-4 md:grid-cols-4">
          <FeatureCard
            icon={<Sparkles className="h-6 w-6 text-violet-600" />}
            title="AI Insights"
            text="Generate personalized and organizational wellbeing summaries using real check-in data."
          />
          <FeatureCard
            icon={<ShieldAlert className="h-6 w-6 text-rose-500" />}
            title="Predictive Alerts"
            text="Detect stress, burnout, energy and mood patterns before they escalate."
          />
          <FeatureCard
            icon={<LineChart className="h-6 w-6 text-green-600" />}
            title="Trend Analytics"
            text="Compare selected periods and understand how wellbeing changes over time."
          />
          <FeatureCard
            icon={<Activity className="h-6 w-6 text-orange-500" />}
            title="Mood Health"
            text="Transform mood check-ins into a clear wellbeing score for HR decision-making."
          />
        </section>

      </main>
    </div>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-center shadow-sm">
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

function PreviewCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${bg}`}>
        {icon}
      </div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function MoodBar({
  label,
  value,
  width,
}: {
  label: string;
  value: string;
  width: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="text-slate-400">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-white">
        <div className={`h-2 rounded-full bg-green-400 ${width}`} />
      </div>
    </div>
  );
}

function AudienceCard({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
}) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
            <p className="text-sm leading-6 text-slate-600">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

export default LandingPage;