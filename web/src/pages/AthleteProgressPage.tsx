import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  Award,
  TrendingUp,
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Info,
  ShieldCheck,
  Zap,
  Flame,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { api } from '../api/client';
import {
  ProgressSummaryResponse,
  TrainingGoalItem,
  TrainingGoalCreate,
  SkillScoreItem,
} from '../types';
import heroImage from '../assets/sports_telemetry_hero.jpg';

export const AthleteProgressPage: React.FC = () => {
  const [summary, setSummary] = useState<ProgressSummaryResponse | null>(null);
  const [goals, setGoals] = useState<TrainingGoalItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmittingGoal, setIsSubmittingGoal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Goal Form State
  const [newGoal, setNewGoal] = useState<TrainingGoalCreate>({
    title: '',
    category: 'technique',
    metric_name: 'step_cadence',
    target_direction: 'INCREASE',
    baseline_value: 160.0,
    target_value: 175.0,
    current_value: 160.0,
    unit: 'spm',
    target_date: '',
  });

  const fetchData = async () => {
    try {
      setErrorMessage(null);
      const [sumData, goalsData] = await Promise.all([
        api.goals.getProgressSummary(),
        api.goals.list(),
      ]);
      setSummary(sumData);
      setGoals(goalsData);
    } catch (err: any) {
      console.error('Failed to load progress telemetry:', err);
      setErrorMessage(err.message || 'Unable to retrieve athlete progress data.');
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

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;

    setIsSubmittingGoal(true);
    try {
      await api.goals.create({
        ...newGoal,
        target_date: newGoal.target_date ? new Date(newGoal.target_date).toISOString() : undefined,
      });
      setIsModalOpen(false);
      // Reset form
      setNewGoal({
        title: '',
        category: 'technique',
        metric_name: 'step_cadence',
        target_direction: 'INCREASE',
        baseline_value: 160.0,
        target_value: 175.0,
        current_value: 160.0,
        unit: 'spm',
        target_date: '',
      });
      await fetchData();
    } catch (err: any) {
      alert(`Could not create training goal: ${err.message}`);
    } finally {
      setIsSubmittingGoal(false);
    }
  };

  // Metric presets helper for modal form
  const handleMetricSelect = (metric: string) => {
    switch (metric) {
      case 'step_cadence':
        setNewGoal((prev) => ({
          ...prev,
          metric_name: 'step_cadence',
          category: 'cadence',
          unit: 'spm',
          target_direction: 'INCREASE',
          baseline_value: 160.0,
          target_value: 175.0,
          current_value: 160.0,
        }));
        break;
      case 'bilateral_symmetry_index':
        setNewGoal((prev) => ({
          ...prev,
          metric_name: 'bilateral_symmetry_index',
          category: 'symmetry',
          unit: '%',
          target_direction: 'DECREASE',
          baseline_value: 9.5,
          target_value: 4.5,
          current_value: 9.5,
        }));
        break;
      case 'trunk_inclination_angle':
        setNewGoal((prev) => ({
          ...prev,
          metric_name: 'trunk_inclination_angle',
          category: 'posture',
          unit: 'degrees',
          target_direction: 'DECREASE',
          baseline_value: 13.5,
          target_value: 9.5,
          current_value: 13.5,
        }));
        break;
      case 'knee_flexion_left':
        setNewGoal((prev) => ({
          ...prev,
          metric_name: 'knee_flexion_left',
          category: 'knee_flexion',
          unit: 'degrees',
          target_direction: 'INCREASE',
          baseline_value: 140.0,
          target_value: 155.0,
          current_value: 140.0,
        }));
        break;
      case 'session_count':
        setNewGoal((prev) => ({
          ...prev,
          metric_name: 'session_count',
          category: 'consistency',
          unit: 'sessions',
          target_direction: 'INCREASE',
          baseline_value: 1.0,
          target_value: 10.0,
          current_value: 1.0,
        }));
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-2 border-accentCyan border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-textMuted tracking-wider uppercase">
          Synthesizing athlete development telemetry & training goals...
        </span>
      </div>
    );
  }

  // Goal Pie Chart Data
  const goalPieData = summary
    ? [
        { name: 'Completed', value: summary.completed_goals, color: '#00F0FF' },
        { name: 'In Progress', value: summary.in_progress_goals, color: '#3B82F6' },
        { name: 'Not Started', value: summary.not_started_goals, color: '#475569' },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Hero Banner with High-Quality Sports Visual */}
      <div className="relative overflow-hidden rounded-3xl bg-cardDark border border-accentCyan/30 shadow-2xl">
        {/* Background Image with Deep Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Track & Field Biomechanical Telemetry"
            className="w-full h-full object-cover object-center opacity-25 filter saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surfaceDark via-surfaceDark/90 to-surfaceDark/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accentCyan/15 border border-accentCyan/30 text-accentCyan text-xs font-bold tracking-wider uppercase">
              <Award className="w-3.5 h-3.5" />
              <span>Multi-Session Athlete Mastery Matrix</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-textLight tracking-tight">
              Athlete Progress & Skill Development
            </h1>
            <p className="text-xs md:text-sm text-textMuted leading-relaxed">
              Continuous assessment of longitudinal competency, parametric movement evolution, and
              measurable training goal attainment calibrated against your unique digital baseline.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cardDark/80 hover:bg-cardDark border border-borderSubtle hover:border-accentCyan/50 text-textLight text-xs font-bold tracking-wider uppercase transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-accentCyan' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-gradient text-surfaceDark text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-neon-cyan active:scale-95"
            >
              <Plus className="w-4 h-4 font-black" />
              <span>New Goal</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Scientific Disclaimer & 4-Pillar Separation Banner */}
      <div className="p-4 md:p-5 rounded-2xl bg-cardGlass border border-borderSubtle flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-accentCyan/10 text-accentCyan mt-0.5 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-textLight uppercase tracking-wider flex items-center gap-2">
              <span>Scientific Measurement Framework</span>
              <span className="text-[10px] text-textDim font-normal lowercase">(4 distinct pillars)</span>
            </h3>
            <p className="text-xs text-textMuted mt-1 leading-relaxed">
              Pose estimation evaluates kinematic trajectories and consistency. To avoid misleading claims of
              "sport mastery," measurements are decoupled into <span className="text-accentCyan font-semibold">Goal Completion</span>,{' '}
              <span className="text-electricTeal font-semibold">Skill Development</span>,{' '}
              <span className="text-emeraldGreen font-semibold">Parametric Biomechanical Improvement</span>, and{' '}
              <span className="text-warningAmber font-semibold">Training Consistency</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-accentCyan shrink-0 bg-accentCyan/5 px-3 py-1.5 rounded-xl border border-accentCyan/20">
          <Zap className="w-3.5 h-3.5" />
          <span>Grounded in MediaPipe & OpenCV telemetry</span>
        </div>
      </div>

      {/* 3. The 4 Big Pillars Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Pillar 1: Goal Completion */}
        <div className="p-4 rounded-2xl bg-cardDark/70 border border-borderSubtle hover:border-accentCyan/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-textDim uppercase tracking-wider">
              1. Goal Completion
            </span>
            <Target className="w-4 h-4 text-accentCyan" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold font-mono text-textLight">
              {summary?.overall_goal_completion_pct ?? 0}%
            </span>
            <span className="text-[11px] text-accentCyan font-semibold">
              {summary?.completed_goals ?? 0}/{summary?.total_goals ?? 0} Goals
            </span>
          </div>
          <div className="w-full bg-surfaceDark/80 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-accentCyan h-full rounded-full transition-all duration-500"
              style={{ width: `${summary?.overall_goal_completion_pct ?? 0}%` }}
            />
          </div>
        </div>

        {/* Pillar 2: Skill Development */}
        <div className="p-4 rounded-2xl bg-cardDark/70 border border-borderSubtle hover:border-electricTeal/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-textDim uppercase tracking-wider">
              2. Skill Development
            </span>
            <Award className="w-4 h-4 text-electricTeal" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold font-mono text-textLight">
              {summary?.overall_skill_development_pct ?? 0}
            </span>
            <span className="text-[11px] text-textMuted font-mono">/ 100 Index</span>
          </div>
          <div className="w-full bg-surfaceDark/80 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-electricTeal h-full rounded-full transition-all duration-500"
              style={{ width: `${summary?.overall_skill_development_pct ?? 0}%` }}
            />
          </div>
        </div>

        {/* Pillar 3: Biomechanical Improvement */}
        <div className="p-4 rounded-2xl bg-cardDark/70 border border-borderSubtle hover:border-emeraldGreen/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-textDim uppercase tracking-wider">
              3. Biomechanical Delta
            </span>
            <TrendingUp className="w-4 h-4 text-emeraldGreen" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold font-mono text-emeraldGreen">
              +{(summary?.mean_improvement_pct ?? 0) > 0 ? summary?.mean_improvement_pct : 0}%
            </span>
            <span className="text-[11px] text-textMuted">vs Baseline</span>
          </div>
          <p className="text-[11px] text-textDim mt-2 truncate">
            4 critical kinematic parameters tracked
          </p>
        </div>

        {/* Pillar 4: Training Consistency */}
        <div className="p-4 rounded-2xl bg-cardDark/70 border border-borderSubtle hover:border-warningAmber/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-textDim uppercase tracking-wider">
              4. Consistency
            </span>
            <Flame className="w-4 h-4 text-warningAmber" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold font-mono text-textLight">
              {summary?.training_consistency_pct ?? 0}%
            </span>
            <span className="text-[11px] text-warningAmber font-semibold">
              {summary?.completed_sessions_count ?? 0}/{summary?.planned_sessions_count ?? 6} S
            </span>
          </div>
          <div className="w-full bg-surfaceDark/80 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-warningAmber h-full rounded-full transition-all duration-500"
              style={{ width: `${summary?.training_consistency_pct ?? 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Donut Charts Section (Overall Progress & Skill Development Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. Overall Progress Donut Chart */}
        <div className="p-6 rounded-3xl bg-cardDark border border-borderSubtle flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-borderSubtle">
            <div>
              <h2 className="text-base font-extrabold text-textLight tracking-tight flex items-center gap-2">
                <Target className="w-4 h-4 text-accentCyan" />
                <span>Overall Training Goals Progress</span>
              </h2>
              <p className="text-xs text-textMuted mt-0.5">
                Proportion of validated target goals completed vs in flight
              </p>
            </div>
            <span className="text-xs font-mono text-accentCyan font-bold bg-accentCyan/10 px-2.5 py-1 rounded-lg border border-accentCyan/20">
              {summary?.total_goals ?? 0} Goals
            </span>
          </div>

          <div className="py-6 flex flex-col sm:flex-row items-center justify-around gap-6">
            {/* Donut Chart */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              {goalPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={goalPieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {goalPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                      itemStyle={{ color: '#F8FAFC' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full rounded-full border-4 border-slate-700/40 flex items-center justify-center">
                  <span className="text-xs text-textDim">No active goals</span>
                </div>
              )}
              {/* Donut Hole Value */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black font-mono text-textLight">
                  {summary?.overall_goal_completion_pct ?? 0}%
                </span>
                <span className="text-[10px] uppercase font-bold text-textDim tracking-wider">
                  Completed
                </span>
              </div>
            </div>

            {/* Legend & Breakdown */}
            <div className="space-y-3 w-full sm:w-auto">
              <div className="flex items-center justify-between gap-6 p-2.5 rounded-xl bg-cardGlass border border-borderSubtle">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-accentCyan" />
                  <span className="text-xs font-semibold text-textLight">Completed</span>
                </div>
                <div className="flex items-baseline gap-1.5 font-mono">
                  <span className="text-sm font-bold text-accentCyan">
                    {summary?.completed_goals ?? 0}
                  </span>
                  <span className="text-[11px] text-textMuted">
                    ({summary?.total_goals ? Math.round(((summary.completed_goals / summary.total_goals) * 100)) : 0}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-6 p-2.5 rounded-xl bg-cardGlass border border-borderSubtle">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs font-semibold text-textLight">In Progress</span>
                </div>
                <div className="flex items-baseline gap-1.5 font-mono">
                  <span className="text-sm font-bold text-blue-400">
                    {summary?.in_progress_goals ?? 0}
                  </span>
                  <span className="text-[11px] text-textMuted">
                    ({summary?.total_goals ? Math.round(((summary.in_progress_goals / summary.total_goals) * 100)) : 0}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-6 p-2.5 rounded-xl bg-cardGlass border border-borderSubtle">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-600" />
                  <span className="text-xs font-semibold text-textMuted">Not Started</span>
                </div>
                <div className="flex items-baseline gap-1.5 font-mono">
                  <span className="text-sm font-bold text-textDim">
                    {summary?.not_started_goals ?? 0}
                  </span>
                  <span className="text-[11px] text-textMuted">
                    ({summary?.total_goals ? Math.round(((summary.not_started_goals / summary.total_goals) * 100)) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-borderSubtle/60 flex items-center justify-between text-[11px] text-textDim">
            <span>Dynamic progress re-calculated after each video upload</span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-accentCyan hover:underline font-semibold"
            >
              + Add Target Goal
            </button>
          </div>
        </div>

        {/* B. Estimated Time to Completion Timeline Card */}
        <div className="p-6 rounded-3xl bg-cardDark border border-borderSubtle flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-borderSubtle">
            <div>
              <h2 className="text-base font-extrabold text-textLight tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-electricTeal" />
                <span>Estimated Time to Goal Completion</span>
              </h2>
              <p className="text-xs text-textMuted mt-0.5">
                Velocity projection calibrated against historical improvement rate
              </p>
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                summary?.estimation_confidence === 'HIGH'
                  ? 'bg-emeraldGreen/15 text-emeraldGreen border border-emeraldGreen/30'
                  : summary?.estimation_confidence === 'MODERATE'
                  ? 'bg-accentCyan/15 text-accentCyan border border-accentCyan/30'
                  : 'bg-warningAmber/15 text-warningAmber border border-warningAmber/30'
              }`}
            >
              {summary?.estimation_confidence ?? 'INSUFFICIENT'} CONFIDENCE
            </span>
          </div>

          <div className="py-6 flex flex-col justify-center space-y-4">
            <div className="p-4 rounded-2xl bg-cardGlass border border-borderSubtle">
              <span className="text-[11px] uppercase tracking-wider text-textDim font-mono block">
                Projected Milestone Target
              </span>
              <p className="text-xl md:text-2xl font-extrabold text-accentCyan mt-1">
                {summary?.projected_completion_date ?? 'Awaiting 3rd session baseline'}
              </p>
              {summary?.estimated_days_to_goals != null && summary.estimated_days_to_goals > 0 && (
                <p className="text-xs text-textMuted mt-1">
                  Approx. <span className="text-textLight font-bold">{summary.estimated_days_to_goals} days</span> of
                  continued periodic training
                </p>
              )}
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-surfaceDark/60 border border-borderSubtle/60 text-xs text-textMuted">
              <Info className="w-4 h-4 text-electricTeal shrink-0 mt-0.5" />
              <p className="leading-relaxed">{summary?.estimation_note}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-borderSubtle/60 flex items-center justify-between text-[11px] text-textDim">
            <span>Projection updates dynamically with session frequency</span>
            <span className="text-emeraldGreen font-mono">Streak: {summary?.current_streak_days ?? 1} Days Active</span>
          </div>
        </div>
      </div>

      {/* 5. Skill Development Breakdown Across 6 Defined Criteria */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-extrabold text-textLight tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-electricTeal" />
              <span>Skill Development Across 6 Sports Science Criteria</span>
            </h2>
            <p className="text-xs text-textMuted mt-0.5">
              Assessed strictly from observed kinematic parameters — not arbitrary mastery scores
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-textDim uppercase tracking-wider font-mono">Composite Index</span>
            <p className="text-lg font-black font-mono text-electricTeal">
              {summary?.overall_skill_development_pct ?? 0}/100
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summary?.skills.map((skill, index) => {
            const isProficient = skill.status === 'PROFICIENT';
            const isCompetent = skill.status === 'COMPETENT';
            return (
              <div
                key={index}
                className="p-5 rounded-2xl bg-cardDark border border-borderSubtle hover:border-accentCyan/40 transition-all duration-200 flex flex-col justify-between space-y-4"
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
                    {skill.criteria_explanation}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-borderSubtle/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-textDim">Observed ({skill.measured_parameter}):</span>
                    <span className="font-mono font-bold text-textLight">{skill.observed_value}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-textDim">Competency Score:</span>
                    <span className="font-mono font-bold text-accentCyan">
                      {skill.current_score} <span className="text-[10px] text-textDim">/ target {skill.benchmark_target}</span>
                    </span>
                  </div>

                  <div className="w-full bg-surfaceDark rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isProficient
                          ? 'bg-emeraldGreen'
                          : isCompetent
                          ? 'bg-accentCyan'
                          : 'bg-warningAmber'
                      }`}
                      style={{ width: `${Math.min(100, skill.current_score)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Measurable Biomechanical Improvements Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-extrabold text-textLight tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emeraldGreen" />
              <span>Measurable Biomechanical Improvements (Initial vs Current)</span>
            </h2>
            <p className="text-xs text-textMuted mt-0.5">
              Empirical changes in measured movement parameters across completed video sessions
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl bg-cardDark border border-borderSubtle shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-borderSubtle bg-surfaceDark/50 text-[11px] font-bold text-textDim uppercase tracking-wider">
                <th className="py-3.5 px-4 md:px-6">Biomechanics Parameter</th>
                <th className="py-3.5 px-4">Initial Baseline</th>
                <th className="py-3.5 px-4">Current Measurement</th>
                <th className="py-3.5 px-4">Measured Delta</th>
                <th className="py-3.5 px-4">Percentage Change</th>
                <th className="py-3.5 px-4 md:px-6">Scientific Significance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderSubtle/60 text-xs">
              {summary?.biomechanical_improvements.map((item, index) => {
                const isPositiveDelta = item.delta_value > 0;
                return (
                  <tr key={index} className="hover:bg-cardGlass/50 transition-colors">
                    <td className="py-4 px-4 md:px-6">
                      <div className="font-bold text-textLight">{item.display_name}</div>
                      <span className="text-[10px] font-mono text-textDim uppercase">
                        Unit: {item.unit}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-textMuted">
                      {item.initial_value} {item.unit}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-textLight">
                      {item.current_value} {item.unit}
                    </td>
                    <td className="py-4 px-4 font-mono">
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          item.is_favorable ? 'text-emeraldGreen' : 'text-textDim'
                        }`}
                      >
                        {isPositiveDelta ? '+' : ''}
                        {item.delta_value} {item.unit}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
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
                        <span>{item.delta_pct > 0 ? `+${item.delta_pct}%` : `${item.delta_pct}%`}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 md:px-6 text-textMuted text-[11px] leading-relaxed max-w-xs md:max-w-md">
                      {item.scientific_significance}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Active Training Goals List & Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-extrabold text-textLight tracking-tight flex items-center gap-2">
              <Target className="w-5 h-5 text-accentCyan" />
              <span>Active Athlete Training Goals</span>
            </h2>
            <p className="text-xs text-textMuted mt-0.5">
              Specific, measurable movement goals with automated progress tracking
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-accentCyan/15 text-accentCyan border border-accentCyan/30 text-xs font-bold uppercase tracking-wider hover:bg-accentCyan/25 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Goal</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const isCompleted = goal.status === 'COMPLETED';
            const isInProgress = goal.status === 'IN_PROGRESS';
            return (
              <div
                key={goal.id}
                className="p-5 rounded-2xl bg-cardDark border border-borderSubtle hover:border-accentCyan/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-accentCyan bg-accentCyan/10 px-2 py-0.5 rounded">
                      {goal.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isCompleted
                          ? 'bg-emeraldGreen/15 text-emeraldGreen border border-emeraldGreen/30'
                          : isInProgress
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                      }`}
                    >
                      {goal.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-textLight">{goal.title}</h3>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-surfaceDark/60 border border-borderSubtle">
                      <span className="text-[10px] text-textDim block">Baseline</span>
                      <span className="font-mono font-semibold text-textMuted">
                        {goal.baseline_value} {goal.unit}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-cardGlass border border-accentCyan/20">
                      <span className="text-[10px] text-accentCyan block">Current</span>
                      <span className="font-mono font-bold text-textLight">
                        {goal.current_value} {goal.unit}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-surfaceDark/60 border border-borderSubtle">
                      <span className="text-[10px] text-textDim block">Target</span>
                      <span className="font-mono font-semibold text-emeraldGreen">
                        {goal.target_value} {goal.unit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-borderSubtle/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-textDim">Progress:</span>
                    <span className="font-mono font-bold text-accentCyan">
                      {goal.progress_pct}%
                    </span>
                  </div>
                  <div className="w-full bg-surfaceDark rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emeraldGreen' : 'bg-accentCyan'
                      }`}
                      style={{ width: `${Math.min(100, goal.progress_pct)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. Longitudinal Learning Milestones Journey Track */}
      <div className="p-6 md:p-8 rounded-3xl bg-cardDark border border-borderSubtle shadow-xl space-y-6">
        <div>
          <h2 className="text-base md:text-lg font-extrabold text-textLight tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-warningAmber" />
            <span>Longitudinal Athlete Learning Journey & Milestones</span>
          </h2>
          <p className="text-xs text-textMuted mt-0.5">
            Key research milestones achieved during continuous video observation and digital twin evolution
          </p>
        </div>

        <div className="relative pl-6 md:pl-8 border-l-2 border-accentCyan/30 space-y-8">
          {summary?.milestones.map((m, index) => (
            <div key={index} className="relative group">
              {/* Timeline Pin */}
              <div
                className={`absolute -left-[31px] md:-left-[39px] top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                  m.achieved
                    ? 'bg-accentCyan text-surfaceDark shadow-neon-cyan'
                    : 'bg-cardDark border border-borderSubtle text-textDim'
                }`}
              >
                {m.achieved ? <CheckCircle2 className="w-3.5 h-3.5" /> : index + 1}
              </div>

              {/* Content Card */}
              <div className="p-4 rounded-2xl bg-cardGlass border border-borderSubtle group-hover:border-accentCyan/30 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-accentCyan bg-accentCyan/10 px-2 py-0.5 rounded">
                      {m.day_label}
                    </span>
                    <h3 className="text-sm font-bold text-textLight">{m.title}</h3>
                  </div>
                  <span className="text-[11px] font-mono text-textDim">{m.date_str}</span>
                </div>
                <p className="text-xs text-textMuted mt-1 leading-relaxed">{m.description}</p>
                {m.metric_highlight && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surfaceDark/70 border border-borderSubtle text-[11px] font-mono text-electricTeal">
                    <Activity className="w-3 h-3" />
                    <span>{m.metric_highlight}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. Modal Dialog: Create Measurable Training Goal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-cardDark border border-borderSubtle rounded-3xl p-6 md:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-borderSubtle mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-accentCyan/15 border border-accentCyan/30 flex items-center justify-center text-accentCyan">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-textLight">Create Training Goal</h3>
                  <p className="text-xs text-textMuted">Define measurable biomechanical target</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-textDim hover:text-textLight p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              {/* Preset Selector */}
              <div>
                <label className="text-xs font-semibold text-textDim uppercase tracking-wider block mb-1.5">
                  Target Metric Preset
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'step_cadence', label: 'Cadence (spm)' },
                    { key: 'bilateral_symmetry_index', label: 'Symmetry Index (%)' },
                    { key: 'trunk_inclination_angle', label: 'Trunk Inclination (°)' },
                    { key: 'knee_flexion_left', label: 'Knee Flexion (°)' },
                  ].map((p) => (
                    <button
                      type="button"
                      key={p.key}
                      onClick={() => handleMetricSelect(p.key)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        newGoal.metric_name === p.key
                          ? 'bg-accentCyan/15 border-accentCyan text-accentCyan font-bold'
                          : 'bg-cardGlass border-borderSubtle text-textMuted hover:text-textLight'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal Title */}
              <div>
                <label className="text-xs font-semibold text-textDim uppercase tracking-wider block mb-1.5">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g. Achieve 175 spm step cadence"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surfaceDark border border-borderSubtle text-textLight text-xs focus:outline-none focus:border-accentCyan"
                />
              </div>

              {/* Target Direction */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-textDim uppercase tracking-wider block mb-1.5">
                    Direction
                  </label>
                  <select
                    value={newGoal.target_direction}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, target_direction: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surfaceDark border border-borderSubtle text-textLight text-xs focus:outline-none focus:border-accentCyan"
                  >
                    <option value="INCREASE">Increase Value</option>
                    <option value="DECREASE">Decrease Value</option>
                    <option value="MAINTAIN">Maintain Range</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-textDim uppercase tracking-wider block mb-1.5">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newGoal.target_date || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surfaceDark border border-borderSubtle text-textLight text-xs focus:outline-none focus:border-accentCyan"
                  />
                </div>
              </div>

              {/* Baseline & Target Values */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-textDim uppercase tracking-wider block mb-1.5">
                    Baseline Value ({newGoal.unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newGoal.baseline_value}
                    onChange={(e) =>
                      setNewGoal({
                        ...newGoal,
                        baseline_value: parseFloat(e.target.value) || 0,
                        current_value: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surfaceDark border border-borderSubtle text-textLight text-xs focus:outline-none focus:border-accentCyan"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-textDim uppercase tracking-wider block mb-1.5">
                    Target Value ({newGoal.unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newGoal.target_value}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, target_value: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surfaceDark border border-borderSubtle text-textLight text-xs focus:outline-none focus:border-accentCyan"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-borderSubtle flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-cardGlass border border-borderSubtle text-textMuted text-xs font-semibold hover:text-textLight"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGoal}
                  className="px-5 py-2.5 rounded-xl bg-accent-gradient text-surfaceDark text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-neon-cyan disabled:opacity-50"
                >
                  {isSubmittingGoal ? 'Saving Goal...' : 'Establish Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AthleteProgressPage;
