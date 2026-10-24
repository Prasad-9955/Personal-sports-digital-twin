import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surfaceDark flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-cardDark border border-dangerCoral/40 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-dangerCoral/15 text-dangerCoral border border-dangerCoral/30 flex items-center justify-center mx-auto shadow-neon-coral">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-textLight">Something went wrong</h2>
            <p className="text-xs text-textMuted leading-relaxed">
              An unexpected error occurred while rendering this page:
            </p>
            <div className="p-3 rounded-xl bg-surfaceDark border border-borderSubtle text-[11px] font-mono text-dangerCoral overflow-x-auto text-left">
              {this.state.error?.message || 'Unknown runtime error'}
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-gradient text-surfaceDark font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-neon-cyan"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload</span>
              </button>
              <button
                onClick={() => (window.location.href = '/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cardGlass border border-borderSubtle text-textLight font-bold text-xs uppercase tracking-wider hover:bg-cardGlass/80 transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
