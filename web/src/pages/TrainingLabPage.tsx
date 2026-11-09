import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Video,
  UploadCloud,
  Play,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  Camera,
  Layers,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Filter,
  Eye,
  Activity,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { api } from '../api/client';
import { useTwin } from '../context/TwinContext';
import { SampleVideoItem, SampleAnalysisResponse } from '../types';
import heroImage from '../assets/sports_telemetry_hero.jpg';

export const TrainingLabPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshOverview } = useTwin();

  // Navigation tab: 'samples' or 'my_video'
  const [activeTab, setActiveTab] = useState<'samples' | 'my_video'>('samples');

  // Sample Library State
  const [samples, setSamples] = useState<SampleVideoItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCameraAngle, setSelectedCameraAngle] = useState<string>('all');
  const [isLoadingSamples, setIsLoadingSamples] = useState<boolean>(true);
  const [analyzingSampleId, setAnalyzingSampleId] = useState<string | null>(null);
  const [sampleAnalysisResult, setSampleAnalysisResult] = useState<SampleAnalysisResponse | null>(null);

  // Personal Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Sample Videos
  const fetchSamples = async () => {
    setIsLoadingSamples(true);
    try {
      const cat = selectedCategory !== 'all' ? selectedCategory : undefined;
      const angle = selectedCameraAngle !== 'all' ? selectedCameraAngle : undefined;
      const data = await api.trainingLab.getSamples(cat, angle);
      setSamples(data);
    } catch (err: any) {
      console.error('Failed to load sample videos:', err);
    } finally {
      setIsLoadingSamples(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'samples') {
      fetchSamples();
    }
  }, [selectedCategory, selectedCameraAngle, activeTab]);

  // Handle Demo Analysis Run
  const handleAnalyzeSample = async (sample: SampleVideoItem) => {
    setAnalyzingSampleId(sample.id);
    try {
      const res = await api.trainingLab.analyzeSample(sample.id);
      setSampleAnalysisResult(res);
    } catch (err: any) {
      alert(`Sample analysis failed: ${err.message}`);
    } finally {
      setAnalyzingSampleId(null);
    }
  };

  // Personal Video Validation & Selection
  const handleFileSelect = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['mp4', 'mov', 'avi'].includes(ext || '')) {
      setUploadError('Unsupported video format. Please upload MP4, MOV, or AVI.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('Video exceeds maximum allowed size of 50MB.');
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
    setVideoPreviewUrl(URL.createObjectURL(file));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Personal Video Processing Flow
  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setUploadError(null);
    setUploadProgress(0);
    setPipelineStep('Uploading movement video to backend storage...');

    try {
      // 1. Upload video
      const session = await api.sessions.upload(selectedFile, (pct) => {
        setUploadProgress(pct);
        if (pct === 100) {
          setPipelineStep('Running MediaPipe BlazePose 33-point landmark estimation across frames...');
        }
      });

      // 2. Authoritative Processing
      setPipelineStep('Extracting joint kinematics (trunk, knees, symmetry, cadence)...');
      let processed: any = null;
      try {
        processed = await api.sessions.process(session.id);
      } catch (procErr: any) {
        // Polling recovery
        setPipelineStep('Finalizing kinematic calculations & Digital Twin state...');
        for (let attempt = 0; attempt < 25; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          try {
            const check = await api.sessions.getById(session.id);
            if (
              check.processing_status === 'COMPLETED' ||
              check.processing_status === 'REJECTED' ||
              check.processing_status === 'FAILED'
            ) {
              processed = check;
              break;
            }
          } catch (_) {}
        }
        if (!processed) throw procErr;
      }

      if (processed.processing_status === 'REJECTED') {
        setIsProcessing(false);
        setUploadError(
          processed.error_message ||
            'Video rejected: insufficient pose tracking quality. Please ensure the athlete is fully visible.'
        );
        return;
      }

      if (processed.processing_status === 'FAILED') {
        setIsProcessing(false);
        setUploadError(processed.error_message || 'Video processing encountered an issue on the server.');
        return;
      }

      setPipelineStep('Updating Personal Baseline & Digital Twin Version...');
      await refreshOverview();
      navigate(`/sessions/${processed.id}`);
    } catch (err: any) {
      setIsProcessing(false);
      setUploadError(err.message || 'An error occurred during video analysis.');
    }
  };

  const categories = [
    { key: 'all', label: 'All Categories' },
    { key: 'beginner_running', label: 'Beginner Running' },
    { key: 'normal_running', label: 'Normal Running' },
    { key: 'fast_running', label: 'Fast Running' },
    { key: 'walking_gait', label: 'Walking & Gait' },
    { key: 'camera_angles', label: 'Camera Angles' },
  ];

  const cameraAngles = [
    { key: 'all', label: 'All Angles' },
    { key: 'sagittal_lateral', label: 'Sagittal (Lateral)' },
    { key: 'frontal_anterior', label: 'Frontal (Anterior)' },
    { key: 'posterior', label: 'Posterior (Rear)' },
    { key: 'oblique', label: 'Oblique (45°)' },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-cardDark border border-accentCyan/30 shadow-2xl p-6 md:p-8">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Training Lab Sports Telemetry"
            className="w-full h-full object-cover object-center opacity-20 filter saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surfaceDark via-surfaceDark/90 to-surfaceDark/70" />
        </div>

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accentCyan/15 border border-accentCyan/30 text-accentCyan text-xs font-bold tracking-wider uppercase">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Biomechanical Computer Vision Studio</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-textLight tracking-tight">
            Training Lab
          </h1>
          <p className="text-xs md:text-sm text-textMuted leading-relaxed">
            Explore verified public biomechanics running datasets or upload your personal motion video
            for automated 33-point BlazePose landmark analysis and digital twin evolution.
          </p>

          {/* Tab Switcher */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => setActiveTab('samples')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'samples'
                  ? 'bg-accent-gradient text-surfaceDark shadow-neon-cyan'
                  : 'bg-cardGlass border border-borderSubtle text-textMuted hover:text-textLight'
              }`}
            >
              Sample Video Library
            </button>
            <button
              onClick={() => setActiveTab('my_video')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'my_video'
                  ? 'bg-accent-gradient text-surfaceDark shadow-neon-cyan'
                  : 'bg-cardGlass border border-borderSubtle text-textMuted hover:text-textLight'
              }`}
            >
              Analyse My Own Video
            </button>
          </div>
        </div>
      </div>

      {/* SECTION A: SAMPLE RUNNING VIDEO LIBRARY */}
      {activeTab === 'samples' && (
        <div className="space-y-6">
          {/* Data Isolation Disclaimer Alert */}
          <div className="p-4 rounded-2xl bg-cardGlass border border-borderSubtle flex items-start gap-3 text-xs text-textMuted">
            <ShieldCheck className="w-5 h-5 text-accentCyan shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-textLight uppercase tracking-wider block">
                Strict Twin Isolation Guarantee
              </span>
              Sample videos are curated from open biomechanics databases (Health&Gait, Running Injury Clinic) for
              technique benchmarking. Running analysis on sample videos produces{' '}
              <strong className="text-accentCyan">DEMONSTRATION DATA</strong> and will{' '}
              <strong className="text-dangerCoral">NEVER</strong> alter your personal baselines or Digital Twin state.
            </div>
          </div>

          {/* Filters Bar */}
          <div className="space-y-3">
            {/* Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-textDim uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Category:
              </span>
              {categories.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setSelectedCategory(c.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === c.key
                      ? 'bg-accentCyan/20 text-accentCyan border border-accentCyan/40 font-bold'
                      : 'bg-cardDark border border-borderSubtle text-textMuted hover:text-textLight'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Camera Angle Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-textDim uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" />
                Angle:
              </span>
              {cameraAngles.map((a) => (
                <button
                  key={a.key}
                  onClick={() => setSelectedCameraAngle(a.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCameraAngle === a.key
                      ? 'bg-electricTeal/20 text-electricTeal border border-electricTeal/40 font-bold'
                      : 'bg-cardDark border border-borderSubtle text-textMuted hover:text-textLight'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sample Video Grid */}
          {isLoadingSamples ? (
            <div className="py-16 text-center text-xs text-textMuted font-mono flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-accentCyan" />
              <span>Loading public biomechanics datasets...</span>
            </div>
          ) : samples.length === 0 ? (
            <div className="py-12 text-center text-xs text-textMuted font-mono rounded-3xl bg-cardDark border border-borderSubtle">
              No sample videos found matching the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {samples.map((sample) => (
                <div
                  key={sample.id}
                  className="rounded-3xl bg-cardDark border border-borderSubtle hover:border-accentCyan/40 transition-all flex flex-col justify-between overflow-hidden shadow-lg group"
                >
                  {/* Video Preview / Player Area */}
                  <div className="relative aspect-video bg-surfaceDark overflow-hidden">
                    <video
                      src={sample.video_url}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-surfaceDark/80 backdrop-blur-md border border-borderSubtle text-[10px] font-mono text-accentCyan font-bold uppercase">
                      {sample.camera_angle.replace('_', ' ')}
                    </div>
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-surfaceDark/80 backdrop-blur-md border border-borderSubtle text-[10px] font-mono text-textLight">
                      {sample.duration_sec}s • {sample.resolution || '1080p'}
                    </div>
                  </div>

                  {/* Metadata Content */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-textDim bg-surfaceDark px-2 py-0.5 rounded border border-borderSubtle">
                          {sample.category.replace('_', ' ')}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            sample.difficulty_level === 'BEGINNER'
                              ? 'bg-emeraldGreen/15 text-emeraldGreen border border-emeraldGreen/30'
                              : sample.difficulty_level === 'INTERMEDIATE'
                              ? 'bg-accentCyan/15 text-accentCyan border border-accentCyan/30'
                              : 'bg-warningAmber/15 text-warningAmber border border-warningAmber/30'
                          }`}
                        >
                          {sample.difficulty_level}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-textLight group-hover:text-accentCyan transition-colors">
                        {sample.title}
                      </h3>
                      <p className="text-xs text-textMuted mt-1 leading-relaxed line-clamp-2">
                        {sample.description}
                      </p>
                    </div>

                    {/* Dataset Source & Licence */}
                    <div className="pt-2 border-t border-borderSubtle/60 text-[11px] text-textDim space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Source:</span>
                        <span className="font-semibold text-textLight truncate max-w-[180px]">
                          {sample.dataset?.name || 'Health&Gait Open Biomechanics'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Licence:</span>
                        <span className="text-electricTeal truncate max-w-[180px]">
                          {sample.dataset?.licence_type || 'CC-BY 4.0'}
                        </span>
                      </div>
                    </div>

                    {/* Benchmark Metrics Teaser */}
                    {sample.benchmark_metrics && (
                      <div className="grid grid-cols-3 gap-1.5 py-2 px-3 rounded-xl bg-surfaceDark/60 border border-borderSubtle text-center text-[10px] font-mono">
                        <div>
                          <span className="text-textDim block">Cadence</span>
                          <span className="text-accentCyan font-bold">
                            {sample.benchmark_metrics.step_cadence} spm
                          </span>
                        </div>
                        <div>
                          <span className="text-textDim block">Symmetry</span>
                          <span className="text-electricTeal font-bold">
                            {sample.benchmark_metrics.bilateral_symmetry_index}%
                          </span>
                        </div>
                        <div>
                          <span className="text-textDim block">Trunk</span>
                          <span className="text-textLight font-bold">
                            {sample.benchmark_metrics.trunk_inclination_angle}°
                          </span>
                        </div>
                      </div>
                    )}

                    {/* CTA: Run MediaPipe BlazePose on Sample */}
                    <button
                      onClick={() => handleAnalyzeSample(sample)}
                      disabled={analyzingSampleId === sample.id}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accentCyan/15 hover:bg-accentCyan/25 border border-accentCyan/30 text-accentCyan text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                    >
                      {analyzingSampleId === sample.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Extracting Landmarks...</span>
                        </>
                      ) : (
                        <>
                          <Activity className="w-3.5 h-3.5" />
                          <span>Run MediaPipe Analysis</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sample Analysis Results Modal */}
          {sampleAnalysisResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-xl bg-cardDark border border-accentCyan/40 rounded-3xl p-6 md:p-8 shadow-2xl relative space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-borderSubtle">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-accentCyan/15 border border-accentCyan/30 flex items-center justify-center text-accentCyan">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-textLight">
                        Sample Analysis Results
                      </h3>
                      <span className="text-[10px] text-accentCyan font-mono uppercase font-bold tracking-wider">
                        OpenCV & BlazePose Landmark Telemetry
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSampleAnalysisResult(null)}
                    className="text-textDim hover:text-textLight p-1 rounded-lg"
                  >
                    ✕
                  </button>
                </div>

                {/* Prominent Demo Notice */}
                <div className="p-3.5 rounded-xl bg-accentCyan/10 border border-accentCyan/30 text-xs text-accentCyan flex items-center gap-2 font-mono">
                  <span className="w-2 h-2 rounded-full bg-accentCyan animate-ping" />
                  <span>{sampleAnalysisResult.demonstration_notice}</span>
                </div>

                {/* Video Info */}
                <div className="p-3.5 rounded-2xl bg-surfaceDark/60 border border-borderSubtle flex items-center justify-between text-xs">
                  <div>
                    <span className="text-textDim block">Sample Tested</span>
                    <strong className="text-textLight">{sampleAnalysisResult.sample_video_title}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-textDim block">Tracking Quality</span>
                    <strong className="text-emeraldGreen font-mono">
                      {sampleAnalysisResult.quality_score.toFixed(1)}%
                    </strong>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {Object.entries(sampleAnalysisResult.metrics_summary).map(([key, val]: [string, any]) => (
                    <div
                      key={key}
                      className="p-3.5 rounded-2xl bg-cardGlass border border-borderSubtle flex flex-col justify-between"
                    >
                      <span className="text-[11px] font-semibold text-textDim uppercase tracking-wider truncate">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-baseline gap-1 mt-1 font-mono">
                        <span className="text-lg font-bold text-accentCyan">
                          {typeof val === 'object' && val !== null ? val.value : val}
                        </span>
                        <span className="text-[11px] text-textMuted">
                          {typeof val === 'object' && val !== null ? val.unit : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-borderSubtle flex items-center justify-between text-xs text-textMuted">
                  <span>Isolated demonstration record #{sampleAnalysisResult.id.slice(0, 8)}</span>
                  <button
                    onClick={() => setSampleAnalysisResult(null)}
                    className="px-4 py-2 rounded-xl bg-accent-gradient text-surfaceDark font-bold text-xs uppercase tracking-wider"
                  >
                    Close Demo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION B: ANALYSE MY OWN VIDEO */}
      {activeTab === 'my_video' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Analysis Warning / Guidelines */}
          {uploadError && (
            <div className="p-4 rounded-2xl bg-dangerCoral/10 border border-dangerCoral/30 flex items-start gap-3 text-xs text-dangerCoral">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="block font-bold">Upload Warning</strong>
                <span>{uploadError}</span>
              </div>
            </div>
          )}

          <div className="p-6 rounded-2xl bg-cardDark border border-borderSubtle">
            <h3 className="text-sm font-bold text-textLight mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-accentCyan" />
              <span>Personal Video Recording Guidelines (Mobile & Desktop)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-textMuted">
              <div className="p-3.5 rounded-xl bg-cardGlass border border-borderSubtle/60">
                <span className="font-bold text-textLight block mb-1">1. Sagittal Lateral View</span>
                Position camera perpendicular to the runner at hip height for accurate trunk and knee angles.
              </div>
              <div className="p-3.5 rounded-xl bg-cardGlass border border-borderSubtle/60">
                <span className="font-bold text-textLight block mb-1">2. Full Body Framing</span>
                Ensure shoulders, hips, knees, and feet remain visible throughout the full movement cycle.
              </div>
              <div className="p-3.5 rounded-xl bg-cardGlass border border-borderSubtle/60">
                <span className="font-bold text-textLight block mb-1">3. Duration & Lighting</span>
                Record 3–15 seconds at 30fps or 60fps under even illumination with minimal background blur.
              </div>
            </div>
          </div>

          {/* Video Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center p-10 md:p-14 rounded-3xl border-2 border-dashed transition-all cursor-pointer ${
              dragOver
                ? 'border-accentCyan bg-accentCyan/10 shadow-neon-cyan'
                : selectedFile
                ? 'border-emeraldGreen/50 bg-cardDark shadow-lg'
                : 'border-borderSubtle hover:border-accentCyan/40 bg-cardDark/70 hover:bg-cardDark'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/x-msvideo,video/*,.mp4,.mov,.avi"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-cardGlass border border-accentCyan/30 text-accentCyan shadow-neon-cyan mb-4">
              {selectedFile ? (
                <FileCheck className="w-8 h-8 text-emeraldGreen" />
              ) : (
                <UploadCloud className="w-8 h-8 animate-bounce" />
              )}
            </div>

            {selectedFile ? (
              <div className="text-center">
                <p className="text-base font-bold text-textLight font-mono">{selectedFile.name}</p>
                <p className="text-xs text-accentCyan mt-1">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for landmark extraction
                </p>
                <span className="text-[11px] text-textDim block mt-3 underline">
                  Click to select a different video
                </span>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-base font-bold text-textLight mb-1">
                  Tap to upload running video from mobile or desktop, or{' '}
                  <span className="text-accentCyan underline">browse</span>
                </p>
                <p className="text-xs text-textMuted">Supports MP4 and MOV up to 50MB</p>
              </div>
            )}
          </div>

          {/* Video Preview Player */}
          {videoPreviewUrl && (
            <div className="p-4 rounded-3xl bg-cardDark border border-borderSubtle space-y-2">
              <span className="text-xs font-bold text-textDim uppercase tracking-wider block">
                Video Preview
              </span>
              <video
                src={videoPreviewUrl}
                controls
                playsInline
                className="w-full max-h-72 rounded-2xl object-contain bg-surfaceDark"
              />
            </div>
          )}

          {/* Processing Progress Bar */}
          {isProcessing && (
            <div className="p-6 rounded-2xl bg-cardDark border border-accentCyan/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-accentCyan flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{pipelineStep}</span>
                </span>
                <span className="font-mono text-textLight font-bold">{uploadProgress}%</span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-surfaceDark overflow-hidden border border-borderSubtle">
                <div
                  className="h-full bg-accent-gradient transition-all duration-300"
                  style={{ width: `${Math.max(uploadProgress, 20)}%` }}
                />
              </div>

              <p className="text-[11px] text-textMuted font-mono">
                Pipeline: Video Ingestion → OpenCV Inspection → BlazePose 33 Landmarks → Baseline Update → Digital Twin State Increment
              </p>
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={handleUploadAndAnalyze}
            disabled={!selectedFile || isProcessing}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-accent-gradient text-surfaceDark font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-neon-cyan active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Personal Movement Kinematics...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-surfaceDark" />
                <span>Start Personal Biomechanical Analysis</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
export default TrainingLabPage;
