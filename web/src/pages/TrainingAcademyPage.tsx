import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Clock,
  Layers,
  Award,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Play,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { api } from '../api/client';
import { CourseListItem } from '../types';
import heroImage from '../assets/sports_telemetry_hero.jpg';

export const TrainingAcademyPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const data = await api.academy.getCourses();
      setCourses(data);
    } catch (err: any) {
      console.error('Failed to load courses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEnrollAndOpen = async (courseId: string, slug: string) => {
    setEnrollingCourseId(courseId);
    try {
      await api.academy.enroll(courseId);
      navigate(`/academy/courses/${slug}`);
    } catch (err: any) {
      alert(`Could not enrol in course: ${err.message}`);
    } finally {
      setEnrollingCourseId(null);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-cardDark border border-accentCyan/30 shadow-2xl p-6 md:p-8">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Training Academy Biomechanics"
            className="w-full h-full object-cover object-center opacity-20 filter saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surfaceDark via-surfaceDark/90 to-surfaceDark/70" />
        </div>

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accentCyan/15 border border-accentCyan/30 text-accentCyan text-xs font-bold tracking-wider uppercase">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Structured Athletic Curriculum</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-textLight tracking-tight">
            Training Academy
          </h1>
          <p className="text-xs md:text-sm text-textMuted leading-relaxed">
            Master running mechanics through coach-reviewed structured programmes. Progressive lessons,
            slow-motion technique breakdowns, practical field drills, and verified knowledge quizzes.
          </p>

          <div className="pt-2 flex items-center gap-4 text-xs font-mono text-textDim">
            <span className="flex items-center gap-1.5 text-accentCyan">
              <CheckCircle2 className="w-3.5 h-3.5" /> 3 Curriculum Levels
            </span>
            <span className="flex items-center gap-1.5 text-electricTeal">
              <CheckCircle2 className="w-3.5 h-3.5" /> 18 Interactive Lessons
            </span>
          </div>
        </div>
      </div>

      {/* 2. Three Course Levels Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-extrabold text-textLight tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accentCyan" />
            <span>Curriculum Programmes</span>
          </h2>
          <span className="text-xs text-textDim font-mono">Persisted in PostgreSQL</span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs text-textMuted font-mono flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-accentCyan" />
            <span>Loading training programmes...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const isEnrolled = course.is_enrolled;
              const isCompleted = course.progress_pct >= 100.0;
              return (
                <div
                  key={course.id}
                  className="rounded-3xl bg-cardDark border border-borderSubtle hover:border-accentCyan/40 transition-all flex flex-col justify-between overflow-hidden shadow-xl group"
                >
                  <div className="p-6 space-y-4">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          course.level === 'BEGINNER'
                            ? 'bg-emeraldGreen/15 text-emeraldGreen border border-emeraldGreen/30'
                            : course.level === 'INTERMEDIATE'
                            ? 'bg-accentCyan/15 text-accentCyan border border-accentCyan/30'
                            : 'bg-warningAmber/15 text-warningAmber border border-warningAmber/30'
                        }`}
                      >
                        {course.level} Level
                      </span>

                      {isEnrolled && (
                        <span className="text-[10px] font-mono text-emeraldGreen font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {isCompleted ? 'Completed' : 'Enrolled'}
                        </span>
                      )}
                    </div>

                    {/* Course Title & Description */}
                    <div>
                      <h3 className="text-base font-extrabold text-textLight group-hover:text-accentCyan transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-textMuted mt-1.5 leading-relaxed line-clamp-3">
                        {course.description}
                      </p>
                    </div>

                    {/* Course Metrics */}
                    <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-surfaceDark/60 border border-borderSubtle text-center text-xs">
                      <div>
                        <span className="text-[10px] text-textDim block font-mono">Duration</span>
                        <span className="font-bold text-textLight">{course.estimated_duration_min} min</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-textDim block font-mono">Modules</span>
                        <span className="font-bold text-accentCyan">{course.modules_count}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-textDim block font-mono">Lessons</span>
                        <span className="font-bold text-electricTeal">{course.lessons_count}</span>
                      </div>
                    </div>

                    {/* Progress Bar if Enrolled */}
                    {isEnrolled && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-textDim">Course Progress</span>
                          <span className="font-bold text-accentCyan">{course.progress_pct}%</span>
                        </div>
                        <div className="w-full bg-surfaceDark rounded-full h-2 overflow-hidden border border-borderSubtle">
                          <div
                            className="bg-accent-gradient h-full rounded-full transition-all duration-500"
                            style={{ width: `${course.progress_pct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Action */}
                  <div className="p-6 pt-0">
                    {isEnrolled ? (
                      <Link
                        to={`/academy/courses/${course.slug}`}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-accentCyan/15 hover:bg-accentCyan/25 border border-accentCyan/30 text-accentCyan font-bold text-xs uppercase tracking-wider transition-all"
                      >
                        <span>Continue Programme</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleEnrollAndOpen(course.id, course.slug)}
                        disabled={enrollingCourseId === course.id}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-accent-gradient text-surfaceDark font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-neon-cyan disabled:opacity-50"
                      >
                        {enrollingCourseId === course.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Enrolling...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-surfaceDark" />
                            <span>Enrol & Begin</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default TrainingAcademyPage;
