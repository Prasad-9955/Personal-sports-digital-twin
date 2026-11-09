import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Play,
  FileText,
  HelpCircle,
  Dumbbell,
  Video,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
  Award,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '../api/client';
import { CourseDetailItem, CourseLessonItem } from '../types';

export const CourseDetailPage: React.FC = () => {
  const { courseIdOrSlug } = useParams<{ courseIdOrSlug: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseDetailItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [openModuleIds, setOpenModuleIds] = useState<Record<string, boolean>>({});

  // Active Lesson Player Modal
  const [activeLesson, setActiveLesson] = useState<CourseLessonItem | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState<boolean>(false);

  const fetchCourse = async () => {
    if (!courseIdOrSlug) return;
    setIsLoading(true);
    try {
      const data = await api.academy.getCourse(courseIdOrSlug);
      setCourse(data);
      // Open all modules by default
      const openMap: Record<string, boolean> = {};
      data.modules.forEach((m) => {
        openMap[m.id] = true;
      });
      setOpenModuleIds(openMap);
    } catch (err: any) {
      console.error('Failed to load course details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseIdOrSlug]);

  const toggleModule = (modId: string) => {
    setOpenModuleIds((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleOpenLesson = (lesson: CourseLessonItem) => {
    setActiveLesson(lesson);
    setQuizAnswers(lesson.quiz_data ? new Array(lesson.quiz_data.length).fill(-1) : []);
    setQuizSubmitted(lesson.user_progress?.quiz_score != null);
    setQuizScore(lesson.user_progress?.quiz_score ?? null);
  };

  const handleCompleteLesson = async () => {
    if (!activeLesson) return;
    setIsUpdatingProgress(true);
    try {
      await api.academy.updateLessonProgress(
        activeLesson.id,
        'COMPLETED',
        activeLesson.lesson_type === 'QUIZ' ? quizAnswers : undefined
      );
      await fetchCourse();
      setActiveLesson(null);
    } catch (err: any) {
      alert(`Could not update lesson progress: ${err.message}`);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleQuizOptionSelect = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => {
      const copy = [...prev];
      copy[qIdx] = optIdx;
      return copy;
    });
  };

  const handleSubmitQuiz = async () => {
    if (!activeLesson || !activeLesson.quiz_data) return;
    if (quizAnswers.includes(-1)) {
      alert('Please answer all quiz questions before submitting.');
      return;
    }

    setIsUpdatingProgress(true);
    try {
      const res = await api.academy.updateLessonProgress(activeLesson.id, 'COMPLETED', quizAnswers);
      setQuizScore(res.quiz_score ?? 100);
      setQuizSubmitted(true);
      await fetchCourse();
    } catch (err: any) {
      alert(`Failed to submit quiz: ${err.message}`);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Play className="w-4 h-4 text-accentCyan" />;
      case 'TEXT':
        return <FileText className="w-4 h-4 text-emeraldGreen" />;
      case 'DEMO':
        return <Video className="w-4 h-4 text-electricTeal" />;
      case 'PRACTICAL':
        return <Dumbbell className="w-4 h-4 text-warningAmber" />;
      case 'QUIZ':
        return <HelpCircle className="w-4 h-4 text-blue-400" />;
      case 'ASSIGNMENT':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-textMuted" />;
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs text-textMuted font-mono flex items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-accentCyan" />
        <span>Loading course syllabus...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8 text-center text-xs text-textMuted font-mono">
        Course not found.{' '}
        <Link to="/academy" className="text-accentCyan underline">
          Return to Academy
        </Link>
      </div>
    );
  }

  const isCompleted = course.progress_pct >= 100.0;

  return (
    <div className="space-y-8 pb-16">
      {/* Back button */}
      <div>
        <Link
          to="/academy"
          className="inline-flex items-center gap-2 text-xs font-semibold text-textMuted hover:text-accentCyan transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Training Academy</span>
        </Link>
      </div>

      {/* Course Hero Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-cardDark border border-accentCyan/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                course.level === 'BEGINNER'
                  ? 'bg-emeraldGreen/15 text-emeraldGreen border border-emeraldGreen/30'
                  : course.level === 'INTERMEDIATE'
                  ? 'bg-accentCyan/15 text-accentCyan border border-accentCyan/30'
                  : 'bg-warningAmber/15 text-warningAmber border border-warningAmber/30'
              }`}
            >
              {course.level} Level
            </span>
            <span className="text-xs text-textDim font-mono">
              • {course.estimated_duration_min} min curriculum
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-textLight tracking-tight">
            {course.title}
          </h1>
          <p className="text-xs md:text-sm text-textMuted leading-relaxed">
            {course.description}
          </p>
        </div>

        {/* Progress Gauge */}
        <div className="p-5 rounded-2xl bg-cardGlass border border-borderSubtle flex flex-col items-center justify-center shrink-0 min-w-[180px]">
          <span className="text-[10px] font-mono text-textDim uppercase tracking-wider block">
            Curriculum Completion
          </span>
          <span className="text-3xl font-black font-mono text-accentCyan mt-1">
            {course.progress_pct}%
          </span>
          <div className="w-full bg-surfaceDark rounded-full h-2 mt-3 overflow-hidden border border-borderSubtle">
            <div
              className="bg-accent-gradient h-full rounded-full transition-all duration-500"
              style={{ width: `${course.progress_pct}%` }}
            />
          </div>
          {isCompleted && (
            <span className="text-[10px] text-emeraldGreen font-bold flex items-center gap-1 mt-2">
              <Award className="w-3.5 h-3.5" /> Programme Completed
            </span>
          )}
        </div>
      </div>

      {/* Modules & Lessons Accordion */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-textLight">Course Modules & Lessons</h2>

        <div className="space-y-4">
          {course.modules.map((module, mIdx) => {
            const isOpen = !!openModuleIds[module.id];
            return (
              <div
                key={module.id}
                className="rounded-3xl bg-cardDark border border-borderSubtle overflow-hidden shadow-lg"
              >
                {/* Module Header Bar */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-cardGlass/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase text-accentCyan bg-accentCyan/10 px-2 py-0.5 rounded">
                        Module {mIdx + 1}
                      </span>
                      <h3 className="text-sm md:text-base font-bold text-textLight">
                        {module.title}
                      </h3>
                    </div>
                    {module.description && (
                      <p className="text-xs text-textMuted line-clamp-1">{module.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-textDim">
                      {module.completed_lessons_count}/{module.total_lessons_count} Done
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-textDim" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-textDim" />
                    )}
                  </div>
                </button>

                {/* Lessons List */}
                {isOpen && (
                  <div className="px-5 pb-5 divide-y divide-borderSubtle/60">
                    {module.lessons.map((lesson, lIdx) => {
                      const isLessonDone = lesson.user_progress?.status === 'COMPLETED';
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => handleOpenLesson(lesson)}
                          className="py-3.5 flex items-center justify-between hover:bg-cardGlass/30 px-3 rounded-xl cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-surfaceDark border border-borderSubtle">
                              {getLessonIcon(lesson.lesson_type)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-textLight group-hover:text-accentCyan transition-colors">
                                  {lesson.title}
                                </span>
                                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-surfaceDark text-textDim border border-borderSubtle">
                                  {lesson.lesson_type}
                                </span>
                              </div>
                              <span className="text-[11px] text-textMuted">
                                ~{lesson.duration_min} min
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isLessonDone ? (
                              <span className="text-xs font-bold text-emeraldGreen flex items-center gap-1 font-mono">
                                <CheckCircle2 className="w-4 h-4" />
                                {lesson.user_progress?.quiz_score != null
                                  ? `${lesson.user_progress.quiz_score}%`
                                  : 'Done'}
                              </span>
                            ) : (
                              <span className="text-xs text-textDim group-hover:text-accentCyan font-semibold">
                                Start →
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lesson Player Modal */}
      {activeLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-cardDark border border-accentCyan/40 rounded-3xl p-6 md:p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-borderSubtle">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-surfaceDark border border-borderSubtle">
                  {getLessonIcon(activeLesson.lesson_type)}
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-accentCyan tracking-wider font-bold">
                    {activeLesson.lesson_type} LESSON
                  </span>
                  <h3 className="text-base font-extrabold text-textLight">
                    {activeLesson.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveLesson(null)}
                className="text-textDim hover:text-textLight p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Video Player if Video or Demo */}
            {activeLesson.video_url && (
              <div className="relative aspect-video rounded-2xl bg-surfaceDark overflow-hidden border border-borderSubtle">
                <video
                  src={activeLesson.video_url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Instructional Content Text */}
            {activeLesson.content_text && (
              <div className="p-4 rounded-2xl bg-surfaceDark/60 border border-borderSubtle text-xs text-textLight leading-relaxed space-y-2">
                <p>{activeLesson.content_text}</p>
              </div>
            )}

            {/* Practical Drill Assignment Instructions */}
            {activeLesson.assignment_instructions && (
              <div className="p-4 rounded-2xl bg-cardGlass border border-accentCyan/30 space-y-2 text-xs">
                <span className="font-bold text-accentCyan flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /> Assignment Directive
                </span>
                <p className="text-textLight">{activeLesson.assignment_instructions}</p>
                <Link
                  to="/training-lab"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-accentCyan hover:underline font-bold mt-1"
                >
                  <span>Open Training Lab to Upload Video</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Interactive Multiple-Choice Quiz */}
            {activeLesson.lesson_type === 'QUIZ' && activeLesson.quiz_data && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-textDim font-mono">
                  Knowledge Evaluation Questions
                </h4>
                {activeLesson.quiz_data.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-4 rounded-2xl bg-cardGlass border border-borderSubtle space-y-2.5 text-xs"
                  >
                    <p className="font-bold text-textLight">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = quizAnswers[qIdx] === optIdx;
                        const isCorrect = q.correct_index === optIdx;
                        let optionStyle = 'border-borderSubtle bg-surfaceDark/60 text-textMuted';
                        if (isSelected) {
                          optionStyle = 'border-accentCyan bg-accentCyan/15 text-accentCyan font-bold';
                        }
                        if (quizSubmitted) {
                          if (isCorrect) {
                            optionStyle = 'border-emeraldGreen bg-emeraldGreen/15 text-emeraldGreen font-bold';
                          } else if (isSelected && !isCorrect) {
                            optionStyle = 'border-dangerCoral bg-dangerCoral/15 text-dangerCoral';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={quizSubmitted}
                            onClick={() => handleQuizOptionSelect(qIdx, optIdx)}
                            className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {isSelected && <span className="font-bold">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                    {quizSubmitted && (
                      <p className="text-[11px] text-electricTeal font-mono pt-1">
                        Explanation: {q.explanation}
                      </p>
                    )}
                  </div>
                ))}

                {quizSubmitted && quizScore !== null && (
                  <div className="p-3.5 rounded-xl bg-emeraldGreen/15 border border-emeraldGreen/30 text-emeraldGreen text-xs font-mono font-bold text-center">
                    Quiz Score: {quizScore}% • {quizScore >= 70 ? 'Passed!' : 'Review material & retry.'}
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-borderSubtle flex items-center justify-between">
              <span className="text-xs text-textDim font-mono">
                {activeLesson.user_progress?.status === 'COMPLETED'
                  ? 'Completed on record'
                  : 'Ready to complete'}
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveLesson(null)}
                  className="px-4 py-2 rounded-xl bg-cardGlass border border-borderSubtle text-xs text-textMuted hover:text-textLight"
                >
                  Close
                </button>

                {activeLesson.lesson_type === 'QUIZ' && !quizSubmitted ? (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    disabled={isUpdatingProgress}
                    className="px-5 py-2 rounded-xl bg-accent-gradient text-surfaceDark font-bold text-xs uppercase tracking-wider hover:opacity-90 shadow-neon-cyan disabled:opacity-50"
                  >
                    {isUpdatingProgress ? 'Scoring...' : 'Submit Answers'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCompleteLesson}
                    disabled={isUpdatingProgress || activeLesson.user_progress?.status === 'COMPLETED'}
                    className="px-5 py-2 rounded-xl bg-accent-gradient text-surfaceDark font-bold text-xs uppercase tracking-wider hover:opacity-90 shadow-neon-cyan disabled:opacity-50"
                  >
                    {activeLesson.user_progress?.status === 'COMPLETED'
                      ? 'Lesson Completed ✓'
                      : 'Mark Lesson Complete'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CourseDetailPage;
