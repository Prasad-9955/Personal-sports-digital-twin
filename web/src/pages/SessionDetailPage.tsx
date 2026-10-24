import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Film,
  Activity,
  Layers,
  Zap,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Share2,
} from 'lucide-react';
import { api } from '../api/client';
import { SessionDetailItem } from '../types';
import { QualityBadge } from '../components/ui/QualityBadge';
import { format } from 'date-fns';

export const SessionDetailPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<SessionDetailItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.sessions.getById(sessionId);
        setSession(data);
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve session telemetry.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-textMuted font-mono text-xs gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-accentCyan" />
        <span>Loading session biomechanical telemetry...</span>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-3xl bg-cardDark border border-borderSubtle text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-dangerCoral mx-auto" />
        <h3 className="text-lg font-bold text-textLight">Session Not Found</h3>
        <p className="text-xs text-textMuted">{error || 'Unable to locate session record.'}</p>
        <button
          onClick={() => navigate('/history')}
          className="px-4 py-2 rounded-xl bg-cardGlass border border-borderSubtle text-xs font-semibold text-textLight"
        >
          Return to History
        </button>
      </div>
    );
  }

  const videoUrl = api.sessions.getVideoUrl(session.video_filename);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/history"
          className="inline-flex items-center gap-2 text-xs font-semibold text-textMuted hover:text-accentCyan transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Session History</span>
        </Link>

        {session.is_demo_data && (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-warningAmber/15 text-warningAmber border border-warningAmber/30">
            Synthesized Demo Session
          </span>
        )}
      </div>

      {/* Header Overview Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-cardDark border border-borderSubtle shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-borderSubtle/60">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h2 className="text-xl md:text-2xl font-extrabold text-textLight tracking-tight">
                Movement Session Telemetry
              </h2>
              {session.quality_score != null && (
                <QualityBadge score={session.quality_score} />
              )}
            </div>
            <p className="text-xs font-mono text-textDim">ID: {session.id}</p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                session.processing_status === 'COMPLETED'
                  ? 'text-emeraldGreen bg-emeraldGreen/10 border border-emeraldGreen/30'
                  : 'text-warningAmber bg-warningAmber/10 border border-warningAmber/30'
              }`}
            >
              {session.processing_status}
            </span>
          </div>
        </div>

        {/* Video Metadata Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-cardGlass border border-borderSubtle/60">
            <span className="text-[10px] uppercase font-mono text-textDim block">Recorded</span>
            <span className="text-xs font-bold text-textLight mt-0.5 block">
              {format(new Date(session.recorded_at), 'MMM dd, yyyy • HH:mm')}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-cardGlass border border-borderSubtle/60">
            <span className="text-[10px] uppercase font-mono text-textDim block">Duration</span>
            <span className="text-xs font-bold text-textLight mt-0.5 block font-mono">
              {session.duration_sec ? `${session.duration_sec.toFixed(1)}s` : 'N/A'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-cardGlass border border-borderSubtle/60">
            <span className="text-[10px] uppercase font-mono text-textDim block">Framerate</span>
            <span className="text-xs font-bold text-textLight mt-0.5 block font-mono">
              {session.fps ? `${session.fps.toFixed(0)} FPS` : 'N/A'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-cardGlass border border-borderSubtle/60">
            <span className="text-[10px] uppercase font-mono text-textDim block">Resolution</span>
            <span className="text-xs font-bold text-textLight mt-0.5 block font-mono">
              {session.resolution || 'Standard'}
            </span>
          </div>
        </div>
      </div>

      {/* Video Preview & Pose Playback Player */}
      <div className="p-6 rounded-3xl bg-cardDark border border-borderSubtle shadow-xl">
        <h3 className="text-sm font-bold text-textLight mb-4 flex items-center gap-2">
          <Film className="w-4 h-4 text-accentCyan" />
          <span>Ingested Video Playback</span>
        </h3>

        <div className="relative aspect-video rounded-2xl bg-surfaceDark overflow-hidden border border-borderSubtle flex items-center justify-center">
          <video
            controls
            preload="metadata"
            src={videoUrl}
            className="w-full h-full object-contain"
          >
            Your browser does not support HTML5 video preview.
          </video>
        </div>
        <p className="text-[11px] text-textDim font-mono mt-2 text-center">
          Source: {session.video_filename}
        </p>
      </div>

      {/* Extracted Kinematic Joint Angles */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-accentCyan" />
          <h3 className="text-base font-bold text-textLight tracking-tight">
            Extracted Kinematic Joint Angles
          </h3>
        </div>

        {session.pose_metrics.length === 0 ? (
          <div className="p-6 rounded-2xl bg-cardDark border border-borderSubtle text-center text-xs text-textMuted">
            No pose metrics extracted for this session.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {session.pose_metrics.map((pm) => (
              <div
                key={pm.id}
                className="p-5 rounded-2xl bg-cardDark border border-borderSubtle flex items-center justify-between shadow-md"
              >
                <div>
                  <h4 className="text-sm font-bold text-textLight">
                    {pm.metric_name.replace(/_/g, ' ').toUpperCase()}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-textMuted">
                    <span>{pm.frame_count} frames sampled</span>
                    <span>•</span>
                    <span className="text-emeraldGreen font-mono font-bold">
                      {(pm.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-extrabold text-accentCyan font-mono">
                    {pm.metric_value.toFixed(1)}
                  </span>
                  <span className="text-xs font-semibold text-textMuted ml-1">{pm.unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance & Cadence Measures */}
      {session.performance_metrics.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-electricTeal" />
            <h3 className="text-base font-bold text-textLight tracking-tight">
              Temporal & Performance Measures
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {session.performance_metrics.map((pfm) => (
              <div
                key={pfm.id}
                className="p-5 rounded-2xl bg-cardDark border border-borderSubtle flex items-center justify-between shadow-md"
              >
                <div>
                  <h4 className="text-sm font-bold text-textLight">
                    {pfm.metric_name.replace(/_/g, ' ').toUpperCase()}
                  </h4>
                  <p className="text-[11px] text-textMuted mt-1">
                    Method: {pfm.measurement_method.replace(/_/g, ' ')}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-extrabold text-electricTeal font-mono">
                    {pfm.metric_value.toFixed(0)}
                  </span>
                  <span className="text-xs font-semibold text-textMuted ml-1">{pfm.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
