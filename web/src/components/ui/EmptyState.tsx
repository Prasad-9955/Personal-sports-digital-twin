import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  message,
  actionText,
  onAction,
  children,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl bg-cardDark/80 border border-borderSubtle shadow-xl backdrop-blur-sm">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-accentCyan/20 blur-xl animate-pulse" />
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-cardGlass border border-accentCyan/30 text-accentCyan shadow-neon-cyan">
          <Icon className="w-8 h-8" />
        </div>
      </div>
      <h3 className="text-lg md:text-xl font-bold text-textLight tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-sm text-textMuted max-w-md leading-relaxed mb-6">
        {message}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-accent-gradient text-surfaceDark font-semibold text-sm hover:opacity-90 transition-all shadow-neon-cyan active:scale-95"
        >
          {actionText}
        </button>
      )}
      {children}
    </div>
  );
};
