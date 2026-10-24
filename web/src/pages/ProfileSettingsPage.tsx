import React, { useState, useEffect } from 'react';
import {
  User,
  Activity,
  Dumbbell,
  ShieldCheck,
  Server,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { SystemHealth } from '../types';

export const ProfileSettingsPage: React.FC = () => {
  const { athlete, refreshAthlete, logout } = useAuth();

  const [formData, setFormData] = useState({
    display_name: athlete?.display_name || '',
    sport: athlete?.sport || 'running',
    experience_level: athlete?.experience_level || 'intermediate',
    height_cm: athlete?.height_cm?.toString() || '',
    weight_kg: athlete?.weight_kg?.toString() || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    if (athlete) {
      setFormData({
        display_name: athlete.display_name,
        sport: athlete.sport,
        experience_level: athlete.experience_level,
        height_cm: athlete.height_cm?.toString() || '',
        weight_kg: athlete.weight_kg?.toString() || '',
      });
    }
    api.health.check().then(setHealth).catch(() => null);
  }, [athlete]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await api.auth.updateMe({
        display_name: formData.display_name.trim(),
        sport: formData.sport,
        experience_level: formData.experience_level,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
      });
      await refreshAthlete();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      alert(`Failed to save profile: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-textLight">
          Athlete Profile & Settings
        </h2>
        <p className="text-xs text-textMuted mt-1">
          Manage your biometric profile and digital twin system preferences
        </p>
      </div>

      {/* Athlete Hero Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-cardDark border border-borderSubtle shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-accent-gradient flex items-center justify-center text-surfaceDark shadow-neon-cyan shrink-0">
          <User className="w-10 h-10 font-bold" />
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h3 className="text-xl font-bold text-textLight">
              {athlete?.display_name || 'Athlete'}
            </h3>
            <span className="px-3 py-0.5 rounded-full bg-accentCyan/15 text-accentCyan text-xs font-bold font-mono uppercase tracking-wider self-center sm:self-auto">
              {athlete?.sport || 'Running'}
            </span>
            <span className="px-3 py-0.5 rounded-full bg-emeraldGreen/15 text-emeraldGreen text-xs font-bold font-mono uppercase tracking-wider self-center sm:self-auto">
              {athlete?.experience_level || 'Intermediate'}
            </span>
          </div>
          <p className="text-xs text-textDim font-mono">Athlete ID: {athlete?.id}</p>
        </div>
      </div>

      {/* Editable Form */}
      <div className="p-6 md:p-8 rounded-3xl bg-cardDark border border-borderSubtle shadow-xl">
        <h3 className="text-base font-bold text-textLight mb-5 flex items-center gap-2">
          <Activity className="w-4 h-4 text-accentCyan" />
          <span>Biometric & Movement Parameters</span>
        </h3>

        {saveSuccess && (
          <div className="mb-5 p-3 rounded-xl bg-emeraldGreen/15 border border-emeraldGreen/30 text-emeraldGreen text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile successfully updated and synchronized with Digital Twin!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-textLight uppercase tracking-wider mb-1.5">
              Athlete Handle
            </label>
            <input
              type="text"
              required
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-surfaceDark border border-borderSubtle focus:border-accentCyan text-textLight text-xs outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-textLight uppercase tracking-wider mb-1.5">
                Sport Discipline
              </label>
              <select
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surfaceDark border border-borderSubtle focus:border-accentCyan text-textLight text-xs outline-none"
              >
                <option value="running">Distance Running</option>
                <option value="sprinting">Sprinting & Hurdles</option>
                <option value="jumping">Jumping & Agility</option>
                <option value="athletics">General Athletics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textLight uppercase tracking-wider mb-1.5">
                Experience Level
              </label>
              <select
                value={formData.experience_level}
                onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surfaceDark border border-borderSubtle focus:border-accentCyan text-textLight text-xs outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="elite">Elite / Collegiate</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-textLight uppercase tracking-wider mb-1.5">
                Height (cm)
              </label>
              <input
                type="number"
                value={formData.height_cm}
                onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                placeholder="178"
                className="w-full px-4 py-2.5 rounded-xl bg-surfaceDark border border-borderSubtle focus:border-accentCyan text-textLight text-xs outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textLight uppercase tracking-wider mb-1.5">
                Weight (kg)
              </label>
              <input
                type="number"
                value={formData.weight_kg}
                onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                placeholder="70"
                className="w-full px-4 py-2.5 rounded-xl bg-surfaceDark border border-borderSubtle focus:border-accentCyan text-textLight text-xs outline-none font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-gradient text-surfaceDark font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-neon-cyan active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Update Profile</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* System Technical Architecture */}
      <div className="p-6 md:p-8 rounded-3xl bg-cardDark border border-borderSubtle shadow-xl">
        <h3 className="text-base font-bold text-textLight mb-4 flex items-center gap-2">
          <Server className="w-4 h-4 text-electricTeal" />
          <span>System Architecture & Integration Specs</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-cardGlass border border-borderSubtle">
            <span className="text-textDim text-[10px] uppercase font-mono block">Vision Engine</span>
            <span className="font-bold text-textLight">Google MediaPipe BlazePose (33 Landmarks)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-cardGlass border border-borderSubtle">
            <span className="text-textDim text-[10px] uppercase font-mono block">Video Ingestion</span>
            <span className="font-bold text-textLight">OpenCV VideoCapture (FPS & Duration Guardrails)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-cardGlass border border-borderSubtle">
            <span className="text-textDim text-[10px] uppercase font-mono block">Authoritative API</span>
            <span className="font-bold text-textLight">FastAPI (Python 3.13) + PostgreSQL ORM</span>
          </div>

          <div className="p-3.5 rounded-xl bg-cardGlass border border-borderSubtle">
            <span className="text-textDim text-[10px] uppercase font-mono block">AI Coaching Model</span>
            <span className="font-bold text-textLight">Google Gemini 3.8 Flash (Structured Outputs)</span>
          </div>
        </div>
      </div>

      {/* Sign Out Action */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dangerCoral/10 hover:bg-dangerCoral/20 border border-dangerCoral/30 text-dangerCoral font-bold text-xs uppercase tracking-wider transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Athlete Profile</span>
        </button>
      </div>
    </div>
  );
};
