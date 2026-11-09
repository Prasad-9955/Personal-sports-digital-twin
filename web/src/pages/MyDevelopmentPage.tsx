import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Award,
  BookOpen,
  Target,
  Clock,
  Calendar,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Info,
  Activity,
  Flame,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { api } from '../api/client';
import { MyDevelopmentData } from '../types';
import heroImage from '../assets/sports_telemetry_hero.jpg';

export const MyDevelopmentPage: React.FC = () => {
  const [data, setData] = useState<MyDevelopmentData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const summary = await api.development.getSummary();
      setData(summary);
    } catch (err: any) {
      console.error('Failed to load development summary:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-2 border-accentCyan border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-textMuted tracking-wider uppercase">
          Synthesizing academy progress, goals & biomechanical telemetry...
        </span>
      </div>
    );
  }

  // Course Progress Donut Data
  const coursePieData = data
    ? [
        { name: 'Completed', value: data.course_progress.completed_lessons, color: '#00F0FF' },
        { name: 'In Progress', value: data.course_progress.in_progress_lessons, color: '#3B82F6' },
        { name: 'Not Started', value: data.course_progress.not_started_lessons, color: '#334155' },
      ].filter((d) => d.value > 0)
    : [];

  // Goal Progress Donut Data
  const goalPieData = data
    ? [
        { name: 'Completed', value: data.goal_progress.completed_goals, color: '#10B981' },
        { name: 'In Progress', value: data.goal_progress.in_progress_goals, color: '#00D2C4' },
        { name: 'Not Started', value: data.goal_progress.not_started_goals, color: '#475569' },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-cardDark border border-accentCyan/30 shadow-2xl p-6 md:p-8">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="My Development Hero"
            className="w-full h-full object-cover object-center opacity-20 filter saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surfaceDark via-surfaceDark/90 to-surfaceDark/70" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accentCyan/15 border border-accentCyan/30 text-accentCyan text-xs font-bold tracking-wider uppercase">
              <Award className="w-3.5 h-3.5" />
              <span>Unified Athlete Competency Command Center</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-textLight tracking-tight">
              My Development
            </h1>
            <p className="text-xs md:text-sm text-textMuted leading-relaxed">
              Consolidated intelligence uniting academic course progress, measurable training targets,
              6-dimensional sports science skill criteria, and longitudinal biomechanical evolution.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cardDark/80 hover:bg-cardDark border border-borderSubtle text-textLight text-xs font-bold tracking-wider uppercase transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-accentCyan' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              to="/timeline"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-gradient text-surfaceDark text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-neon-cyan"
            >
              <Calendar className="w-4 h-4" />
              <span>Training Timeline</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Scientific Separation Framework Notice */}
      <div className="p-4 md:p-5 rounded-2xl bg-cardGlass border border-borderSubtle flex items-start gap-3.5 text-xs text-textMuted">
        <ShieldCheck className="w-5 h-5 text-accentCyan shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-textLight uppercase tracking-wider block">
            Objective Athletic Measurement Standards
          </span>
          <p className="mt-0.5 leading-relaxed">
            Sports mastery is never claimed solely from video uploads or course completions. We decouple{' '}
            <strong className="text-accentCyan">Academic Lesson Completion</strong> from{' '}
            <strong className="text-emeraldGreen">Empirical Biomechanical Deltas</strong> and{' '}
            <strong className="text-electricTeal">Assessed Skill Scores</strong>.
          </p>
        </div>
      </div>

      {/* 3. Donut Charts Section (Course Progress vs Goal Progress) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. Course Progress Donut */}
        <div className="p-6 rounded-3xl bg-cardDark border border-borderSubtle flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-borderSubtle">
            <div>
              <h2 className="text-base font-extrabold text-textLight tracking-tight flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-accentCyan" />
                <span>Training Academy Progress</span>
              </h2>
              <p className="text-xs text-textMuted mt-0.5">
                Completed curriculum lessons across all 3 programmes
              </p>
            </div>
            <Link
              to="/academy"
              className="text-xs text-accentCyan hover:underline font-semibold font-mono"
            >
              Open Academy →
            </Link>
          </div>

          <div className="py-6 flex flex-col sm:flex-row items-center justify-around gap-6">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {coursePieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={coursePieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {coursePieData.map((entry, index) => (
                        <Cell key={`course-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full rounded-full border-4 border-slate-700/40 flex items-center justify-center text-xs text-textDim">
                  No courses
                </div>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black font-mono text-textLight">
                  {data?.course_progress.overall_course_completion_pct}%
                </span>
                <span className="text-[9px] uppercase font-bold text-textDim tracking-wider">
                  Academy
                </span>
              </div>
            </div>

            <div className="space-y-2.5 w-full sm:w-auto text-xs">
              <div className="flex items-center justify-between gap-6 p-2 rounded-xl bg-cardGlass border border-borderSubtle">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-accentCyan" />
                  <span className="text-textLight font-semibold">Completed</span>
                </div>
                <span className="font-mono font-bold text-accentCyan">
                  {data?.course_progress.completed_lessons}
                </span>
              </div>
              <div className="flex items-center justify-between gap-6 p-2 rounded-xl bg-cardGlass border border-borderSubtle">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-textLight font-semibold">In Progress</span>
                </div>
                <span className="font-mono font-bold text-blue-400">
                  {data?.course_progress.in_progress_lessons}
                </span>
              </div>
              <div className="flex items-center justify-between gap-6 p-2 rounded-xl bg-cardGlass border border-borderSubtle">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                  <span className="text-textMuted">Not Started</span>
                </div>
                <span className="font-mono text-textDim">
                  {data?.course_progress.not_started_lessons}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-borderSubtle/60 text-[11px] text-textDim flex justify-between font-mono">
            <span>Total Units: {data?.course_progress.total_lessons} Lessons</span>
            <span className="text-accentCyan font-bold">Self-paced sports learning</span>
          </div>
        </div>

        {/* B. Training Goal Donut */}
        <div className="p-6 rounded-3xl bg-cardDark border border-borderSubtle flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-borderSubtle">
            <div>
              <h2 className="text-base font-extrabold text-textLight tracking-tight flex items-center gap-2">
                <Target className="w-4 h-4 text-emeraldGreen" />
                <span>Training Goal Progress</span>
              </h2>
              <p className="text-xs text-textMuted mt-0.5">
                Measurable athletic and biomechanical benchmarks
              </p>
            </div>
            <span className="text-xs font-mono text-emeraldGreen font-bold bg-emeraldGreen/10 px-2 py-0.5 rounded border border-emeraldGreen/20">
              {data?.goal_progress.total_goals} Active Goals
            </span>
          </div>

          <div className="py-6 flex flex-col sm:flex-row items-center justify-around gap-6">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {goalPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={goalPieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {goalPieData.map((entry, index) => (
                        <Cell key={`goal-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full rounded-full border-4 border-slate-700/40 flex items-center justify-center text-xs text-textDim">
                  No goals
                </div>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black font-mono text-textLight">
                  {data?.goal_progress.overall_goal_completion_pct}%
                </span>
                <span className="text-[9px] uppercase font-bold text-textDim tracking-wider">
                  Target Met
                </span>
              </div>
            </div>

            <div className="space-y-2.5 w-full sm:w-auto text-xs">
              <div className="flex items-center justify-between gap-6 p-2 rounded-xl bg-cardGlass border border-borderSubtle">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emeraldGreen" />
                  <span className="text-textLight font-semibold">Completed</span>
                </div>
                <span className="font-mono font-bold text-emeraldGreen">
                  {data?.goal_progress.completed_goals}
                </span>
              </div>
              <div className="flex items-center justify-between gap-6 p-2 rounded-xl bg-cardGlass border border-borderSubtle">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-electricTeal" />
                  <span className="text-textLight font-semibold">In Progress</span>
                </div>
                <span className="font-mono font-bold text-electricTeal">
                  {data?.goal_progress.in_progress_goals}
                </span>
              </div>
              <div className="flex items-center justify-between gap-6 p-2 rounded-xl bg-cardGlass border border-borderSubtle">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                  <span className="text-textMuted">Pending</span>
                </div>
                <span className="font-mono text-textDim">
                  {data?.goal_progress.not_started_goals}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-borderSubtle/60 text-[11px] text-textDim flex justify-between font-mono">
            <span>Automated re-evaluation via Digital Twin</span>
            <span className="text-emeraldGreen font-bold">100% Empirically tracked</span>
          </div>
        </div>
      </div>

      {/* 4. Skill Development Matrix Across 6 Defined Criteria */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-extrabold text-textLight tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-electricTeal" />
              <span>Skill Development Matrix</span>
            </h2>
            <p className="text-xs text-textMuted mt-0.5">
              Assessed strictly from documented criteria (joint coordinates, quiz evaluations, adherence)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.skills.map((skill, index) => {
            const isProficient = skill.status === 'PROFICIENT';
            const isCompetent = skill.status === 'COMPETENT';
            return (
              <div
                key={index}
                className="p-5 rounded-2xl bg-cardDark border border-borderSubtle hover:border-accentCyan/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-textDim">
                      {skill.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isProficient
                          ? 'bg-emeraldGreen/15 text-emeraldGreen border border-emeraldGreen/30'
                          : isCompetent
                          ? 'bg-accentCyan/15 text-accentCyan border border-accentCyan/30'
                          : 'bg-warningAmber/15 text-warningAmber border border-warningAmber/30'
                      }`}
                    >
                      {skill.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-textLight">{skill.skill_name}</h3>
                  <p className="text-xs text-textMuted mt-1 leading-relaxed">
                    {skill.explanation}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-borderSubtle/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-textDim">Observed Metric:</span>
                    <span className="font-mono font-bold text-textLight">{skill.observed_value}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-textDim">Competency Score:</span>
                    <span className="font-mono font-bold text-accentCyan">
                      {skill.score} <span className="text-[10px] text-textDim">/ {skill.benchmark_target} Target</span>
                    </span>
                  </div>

                  <div className="w-full bg-surfaceDark rounded-full h-2 overflow-hidden border border-borderSubtle">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isProficient
                          ? 'bg-emeraldGreen'
                          : isCompetent
                          ? 'bg-accentCyan'
                          : 'bg-warningAmber'
                      }`}
                      style={{ width: `${Math.min(100, skill.score)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Biomechanical Progress (Historical Parametric Changes) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-extrabold text-textLight tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emeraldGreen" />
              <span>Biomechanical Progress & Movement Changes</span>
            </h2>
            <p className="text-xs text-textMuted mt-0.5">
              Empirical changes across authenticated sessions compared to personal baseline
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl bg-cardDark border border-borderSubtle shadow-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-borderSubtle bg-surfaceDark/50 text-[11px] font-bold text-textDim uppercase tracking-wider font-mono">
                <th className="py-3.5 px-4 md:px-6">Kinematic Parameter</th>
                <th className="py-3.5 px-4">Initial Observation</th>
                <th className="py-3.5 px-4">Baseline Median</th>
                <th className="py-3.5 px-4">Latest Measurement</th>
                <th className="py-3.5 px-4">Measured Delta</th>
                <th className="py-3.5 px-4 text-right">Data Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderSubtle/60">
              {data?.biomechanical_progress.map((item, index) => {
                const isPositive = item.delta_value > 0;
                return (
                  <tr key={index} className="hover:bg-cardGlass/50 transition-colors">
                    <td className="py-4 px-4 md:px-6 font-bold text-textLight">
                      {item.display_name}
                      <span className="block text-[10px] font-mono text-textDim">
                        Unit: {item.unit}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-textMuted">
                      {item.initial_value} {item.unit}
                    </td>
                    <td className="py-4 px-4 font-mono text-accentCyan">
                      {item.baseline_median} {item.unit}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-textLight">
                      {item.current_value} {item.unit}
                    </td>
                    <td className="py-4 px-4 font-mono">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          item.is_favorable
                            ? 'bg-emeraldGreen/15 text-emeraldGreen border border-emeraldGreen/30'
                            : 'bg-cardGlass text-textDim border border-borderSubtle'
                        }`}
                      >
                        {item.is_favorable ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        <span>{isPositive ? `+${item.delta_pct}%` : `${item.delta_pct}%`}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-emeraldGreen font-bold">
                      {item.quality_score.toFixed(0)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Estimated Goal Completion Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-extrabold text-textLight tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-accentCyan" />
              <span>Measurable Goals & Estimated Completion</span>
            </h2>
            <p className="text-xs text-textMuted mt-0.5">
              Velocity projections calculated strictly from empirical session progress rate
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.estimated_goals.map((g) => (
            <div
              key={g.goal_id}
              className="p-5 rounded-2xl bg-cardDark border border-borderSubtle hover:border-accentCyan/30 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-accentCyan bg-accentCyan/10 px-2 py-0.5 rounded">
                  Measurable Benchmark
                </span>
                <h3 className="text-sm font-bold text-textLight mt-2">{g.goal_title}</h3>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-surfaceDark/60 border border-borderSubtle">
                    <span className="text-[10px] text-textDim block">Start</span>
                    <span className="font-mono font-semibold text-textMuted">
                      {g.start_value} {g.unit}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-cardGlass border border-accentCyan/20">
                    <span className="text-[10px] text-accentCyan block">Current</span>
                    <span className="font-mono font-bold text-textLight">
                      {g.current_value} {g.unit}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-surfaceDark/60 border border-borderSubtle">
                    <span className="text-[10px] text-textDim block">Target</span>
                    <span className="font-mono font-semibold text-emeraldGreen">
                      {g.target_value} {g.unit}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surfaceDark/80 border border-borderSubtle text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-textDim">Estimated Completion:</span>
                  <span className="font-mono font-bold text-accentCyan">
                    {g.estimated_completion_date || 'Awaiting 3 sessions'}
                  </span>
                </div>
                <p className="text-[11px] text-textMuted leading-relaxed pt-1">
                  {g.estimation_note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Weekly & Monthly Training Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activities */}
        <div className="p-6 rounded-3xl bg-cardDark border border-borderSubtle shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-borderSubtle">
            <h3 className="text-sm font-extrabold text-textLight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-electricTeal" />
              <span>Weekly Training Volume (Rolling 4 Weeks)</span>
            </h3>
            <span className="text-xs text-textDim font-mono">Sessions & Lessons</span>
          </div>

          <div className="space-y-3">
            {data?.weekly_activity.map((w, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-cardGlass border border-borderSubtle flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-textLight">{w.period_label}</span>
                  <span className="text-[10px] font-mono text-textDim block">
                    {w.sessions_completed} Video Sessions • {w.lessons_completed} Academy Lessons
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-accentCyan">
                    {w.consistency_pct}%
                  </span>
                  <span className="text-[10px] text-emeraldGreen block">Consistency</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Activities */}
        <div className="p-6 rounded-3xl bg-cardDark border border-borderSubtle shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-borderSubtle">
            <h3 className="text-sm font-extrabold text-textLight flex items-center gap-2">
              <Flame className="w-4 h-4 text-warningAmber" />
              <span>Monthly Longitudinal Achievements</span>
            </h3>
            <span className="text-xs text-textDim font-mono">Quarterly Cadence</span>
          </div>

          <div className="space-y-3">
            {data?.monthly_activity.map((m, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-cardGlass border border-borderSubtle flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-textLight">{m.period_label}</span>
                  <span className="text-[10px] font-mono text-textDim block">
                    {m.sessions_completed} Analyzed Sessions • {m.lessons_completed} Lessons Done
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emeraldGreen">
                    {m.consistency_pct}%
                  </span>
                  <span className="text-[10px] text-textMuted block">Target Adherence</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default MyDevelopmentPage;
