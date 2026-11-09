import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  Filter,
  GraduationCap,
  Video,
  Target,
  Award,
  Activity,
  ArrowLeft,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { api } from '../api/client';
import { TimelineEventData } from '../types';

export const TrainingTimelinePage: React.FC = () => {
  const [events, setEvents] = useState<TimelineEventData[]>([]);
  const [filterWindow, setFilterWindow] = useState<'week' | 'month' | 'all'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTimeline = async () => {
    setIsLoading(true);
    try {
      const data = await api.development.getTimeline(filterWindow);
      setEvents(data);
    } catch (err: any) {
      console.error('Failed to load timeline:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [filterWindow]);

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'COURSE_ENROLLED':
        return {
          icon: <GraduationCap className="w-3.5 h-3.5 text-accentCyan" />,
          color: 'bg-accentCyan/15 text-accentCyan border-accentCyan/30',
          label: 'Course Enrolled',
        };
      case 'LESSON_COMPLETED':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emeraldGreen" />,
          color: 'bg-emeraldGreen/15 text-emeraldGreen border-emeraldGreen/30',
          label: 'Lesson Completed',
        };
      case 'QUIZ_PASSED':
        return {
          icon: <Award className="w-3.5 h-3.5 text-blue-400" />,
          color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          label: 'Quiz Achievement',
        };
      case 'VIDEO_ANALYSIS':
        return {
          icon: <Video className="w-3.5 h-3.5 text-electricTeal" />,
          color: 'bg-electricTeal/15 text-electricTeal border-electricTeal/30',
          label: 'Movement Analysis',
        };
      case 'BASELINE_ESTABLISHED':
        return {
          icon: <Activity className="w-3.5 h-3.5 text-warningAmber" />,
          color: 'bg-warningAmber/15 text-warningAmber border-warningAmber/30',
          label: 'Baseline Evolution',
        };
      case 'GOAL_ACHIEVED':
        return {
          icon: <Target className="w-3.5 h-3.5 text-emeraldGreen" />,
          color: 'bg-emeraldGreen/15 text-emeraldGreen border-emeraldGreen/30',
          label: 'Goal Met',
        };
      default:
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-textLight" />,
          color: 'bg-cardGlass text-textMuted border-borderSubtle',
          label: 'System Milestone',
        };
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/my-development"
          className="inline-flex items-center gap-2 text-xs font-semibold text-textMuted hover:text-accentCyan transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Development</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-cardDark border border-borderSubtle shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accentCyan" />
            <h1 className="text-xl md:text-2xl font-extrabold text-textLight tracking-tight">
              Training Development Timeline
            </h1>
          </div>
          <p className="text-xs text-textMuted mt-1">
            Chronological audit log of athletic milestones, course completions, and digital twin evolutions
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {(['week', 'month', 'all'] as const).map((w) => (
            <button
              key={w}
              onClick={() => setFilterWindow(w)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                filterWindow === w
                  ? 'bg-accent-gradient text-surfaceDark font-bold shadow-neon-cyan'
                  : 'bg-cardGlass border border-borderSubtle text-textMuted hover:text-textLight'
              }`}
            >
              {w === 'week' ? 'Weekly' : w === 'month' ? 'Monthly' : 'All-Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-textMuted font-mono flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-accentCyan" />
          <span>Retrieving chronological event records...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="p-8 text-center text-xs text-textMuted font-mono rounded-3xl bg-cardDark border border-borderSubtle">
          No training milestones recorded for this time filter.
        </div>
      ) : (
        <div className="relative pl-6 md:pl-8 border-l-2 border-accentCyan/30 space-y-8">
          {events.map((ev, index) => {
            const badge = getEventBadge(ev.event_type);
            return (
              <div key={ev.id} className="relative group">
                {/* Timeline Node */}
                <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-cardDark border-2 border-accentCyan flex items-center justify-center shadow-neon-cyan/40">
                  <span className="w-2 h-2 rounded-full bg-accentCyan" />
                </div>

                {/* Event Card */}
                <div className="p-5 rounded-2xl bg-cardDark border border-borderSubtle group-hover:border-accentCyan/40 transition-all shadow-md space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.color}`}
                      >
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>
                      <h3 className="text-sm font-bold text-textLight">{ev.title}</h3>
                    </div>

                    <span className="text-[11px] font-mono text-textDim">{ev.date_formatted}</span>
                  </div>

                  <p className="text-xs text-textMuted leading-relaxed">{ev.description}</p>

                  {ev.metric_highlight && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surfaceDark/80 border border-borderSubtle text-[11px] font-mono text-accentCyan">
                      <Activity className="w-3 h-3" />
                      <span>{ev.metric_highlight}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default TrainingTimelinePage;
