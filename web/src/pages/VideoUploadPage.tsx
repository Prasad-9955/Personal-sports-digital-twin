import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  Video,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  FileCheck,
  Camera,
  Play,
} from 'lucide-react';
import { api } from '../api/client';
import { useTwin } from '../context/TwinContext';

export const VideoUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshOverview } = useTwin();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedFormats = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];

  const handleFileSelect = (file: File) => {
    // Validate format
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['mp4', 'mov', 'avi'].includes(ext || '')) {
      setErrorMessage('Unsupported video format. Please upload MP4, MOV, or AVI.');
      return;
    }

    // Validate size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage('Video exceeds the maximum size limit of 50MB.');
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setUploadProgress(0);
    setPipelineStep('Uploading video to backend storage...');

    try {
      // 1. Upload video
      const session = await api.sessions.upload(selectedFile, (pct) => {
        setUploadProgress(pct);
        if (pct === 100) {
          setPipelineStep('Video uploaded. Running BlazePose 33-landmark estimation across frames...');
        }
      });

      // 2. Trigger Authoritative Processing with polling recovery
      setPipelineStep('Extracting joint kinematics (trunk, knees, symmetry) with MediaPipe BlazePose...');
      
      let processed: any = null;
      try {
        processed = await api.sessions.process(session.id);
      } catch (procErr: any) {
        // If request timed out or was interrupted, poll session status directly
        setPipelineStep('Finalizing kinematic calculations & Digital Twin state...');
        for (let attempt = 0; attempt < 30; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          try {
            const check = await api.sessions.getById(session.id);
            if (check.processing_status === 'COMPLETED' || check.processing_status === 'REJECTED' || check.processing_status === 'FAILED') {
              processed = check;
              break;
            }
          } catch (_) {
            // Keep polling
          }
        }

        if (!processed) {
          throw procErr;
        }
      }

      if (processed.processing_status === 'REJECTED') {
        setIsProcessing(false);
        setErrorMessage(
          processed.error_message ||
            'Video rejected: insufficient pose tracking quality. Please ensure the athlete is fully visible.'
        );
        return;
      }

      if (processed.processing_status === 'FAILED') {
        setIsProcessing(false);
        setErrorMessage(processed.error_message || 'Video processing encountered an issue on the server.');
        return;
      }

      setPipelineStep('Updating Personal Baseline & Digital Twin Version...');
      await refreshOverview();

      // 3. Navigate to Session Detail
      navigate(`/sessions/${processed.id}`);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'An error occurred during video analysis.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-textLight">
          Analyze Movement Video
        </h2>
        <p className="text-xs text-textMuted mt-1">
          Upload athlete motion video for automated 33-landmark kinematic extraction and digital
          twin evolution
        </p>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-dangerCoral/10 border border-dangerCoral/30 flex items-start gap-3 text-xs text-dangerCoral">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-bold">Analysis Warning</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Guidelines Card */}
      <div className="p-6 rounded-2xl bg-cardDark border border-borderSubtle">
        <h3 className="text-sm font-bold text-textLight mb-3 flex items-center gap-2">
          <Camera className="w-4 h-4 text-accentCyan" />
          <span>Biomechanical Recording Guidelines</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-textMuted">
          <div className="p-3.5 rounded-xl bg-cardGlass border border-borderSubtle/60">
            <span className="font-bold text-textLight block mb-1">1. Sagittal (Lateral) View</span>
            Position camera perpendicular to the runner for accurate sagittal trunk and knee flexion angles.
          </div>
          <div className="p-3.5 rounded-xl bg-cardGlass border border-borderSubtle/60">
            <span className="font-bold text-textLight block mb-1">2. Full Body Framing</span>
            Ensure shoulders, hips, knees, and ankles remain in the camera frame throughout the movement cycle.
          </div>
          <div className="p-3.5 rounded-xl bg-cardGlass border border-borderSubtle/60">
            <span className="font-bold text-textLight block mb-1">3. Duration & Lighting</span>
            Record 3–15 seconds at 30fps or 60fps under bright, even illumination with minimal background clutter.
          </div>
        </div>
      </div>

      {/* Dropzone Container */}
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
              Click to choose a different video
            </span>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-base font-bold text-textLight mb-1">
              Drop sports movement video here, or <span className="text-accentCyan underline">browse</span>
            </p>
            <p className="text-xs text-textMuted">Supports MP4, MOV, AVI up to 50MB</p>
          </div>
        )}
      </div>

      {/* Upload & Processing Progress Bar */}
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
              style={{ width: `${Math.max(uploadProgress, 15)}%` }}
            />
          </div>

          <p className="text-[11px] text-textMuted font-mono">
            Pipeline: Video Ingestion → OpenCV Inspection → BlazePose 33 Landmarks → Baseline Update → Digital Twin State Monotonic Increment
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
            <span>Processing Movement Kinematics...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-surfaceDark" />
            <span>Start Biomechanical Analysis</span>
          </>
        )}
      </button>
    </div>
  );
};
