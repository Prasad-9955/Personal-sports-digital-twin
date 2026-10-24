import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Calendar,
  Clock,
  ChevronRight,
  Video,
  UploadCloud,
  Loader2,
} from 'lucide-react';
import { api } from '../api/client';
import { SessionItem } from '../types';
import { QualityBadge } from '../components/ui/QualityBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { format } from 'date-fns';

export const SessionsHistoryPage: React.FC = () => {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'real' | 'demo'>('all');

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const data = await api.sessions.list(100);
        setSessions(data);
      } catch (err) {
        console.error('Failed to load session history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.video_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'real') return matchesSearch && !s.is_demo_data;
    if (filterType === 'demo') return matchesSearch && s.is_demo_data;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-textLight">
            Recorded Movement History
          </h2>
          <p className="text-xs text-textMuted mt-1">
            Chronological log of all computer vision sessions & kinematic extractions
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-gradient text-surfaceDark font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-neon-cyan active:scale-95 self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New Session</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-textDim absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by video filename or ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cardDark border border-borderSubtle focus:border-accentCyan text-textLight text-xs placeholder:text-textDim outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-cardDark border border-borderSubtle p-1 rounded-xl">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-accentCyan/15 text-accentCyan border border-accentCyan/30'
                : 'text-textMuted hover:text-textLight'
            }`}
          >
            All ({sessions.length})
          </button>
          <button
            onClick={() => setFilterType('real')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'real'
                ? 'bg-accentCyan/15 text-accentCyan border border-accentCyan/30'
                : 'text-textMuted hover:text-textLight'
            }`}
          >
            Live Recordings ({sessions.filter((s) => !s.is_demo_data).length})
          </button>
          <button
            onClick={() => setFilterType('demo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'demo'
                ? 'bg-accentCyan/15 text-accentCyan border border-accentCyan/30'
                : 'text-textMuted hover:text-textLight'
            }`}
          >
            Synthesized Demo ({sessions.filter((s) => s.is_demo_data).length})
          </button>
        </div>
      </div>

      {/* Sessions Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-textMuted font-mono text-xs gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-accentCyan" />
          <span>Loading historical movement logs...</span>
        </div>
      ) : filteredSessions.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Sessions Found"
          message={
            searchTerm
              ? 'No training sessions match your search criteria.'
              : 'You have not recorded any movement sessions yet.'
          }
          actionText="Upload First Video"
          onAction={() => (window.location.href = '/upload')}
        />
      ) : (
        <div className="rounded-3xl bg-cardDark border border-borderSubtle overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-borderSubtle bg-cardGlass/30 text-textDim uppercase tracking-wider font-mono">
                  <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                  <th className="py-3.5 px-4 font-semibold">Video Resource</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Pose Fidelity</th>
                  <th className="py-3.5 px-4 font-semibold">Duration</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Telemetry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSubtle/60">
                {filteredSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-cardGlass/40 transition-colors">
                    <td className="py-4 px-4 font-medium text-textLight">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-textDim" />
                        <span>{format(new Date(s.recorded_at), 'MMM dd, yyyy • HH:mm')}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-textMuted">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[200px]">{s.video_filename}</span>
                        {s.is_demo_data && (
                          <span className="px-1.5 py-0.5 rounded bg-warningAmber/15 text-warningAmber text-[9px] font-bold border border-warningAmber/30">
                            DEMO
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                          s.processing_status === 'COMPLETED'
                            ? 'text-emeraldGreen bg-emeraldGreen/10 border border-emeraldGreen/20'
                            : s.processing_status === 'PROCESSING'
                            ? 'text-accentCyan bg-accentCyan/10 border border-accentCyan/20 animate-pulse'
                            : 'text-warningAmber bg-warningAmber/10 border border-warningAmber/20'
                        }`}
                      >
                        {s.processing_status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {s.quality_score != null ? (
                        <QualityBadge score={s.quality_score} />
                      ) : (
                        <span className="text-textDim">--</span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono text-textMuted">
                      {s.duration_sec ? `${s.duration_sec.toFixed(1)}s` : '--'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/sessions/${s.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cardGlass border border-borderSubtle hover:border-accentCyan/40 text-accentCyan font-bold text-xs transition-all hover:shadow-neon-cyan/20"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
