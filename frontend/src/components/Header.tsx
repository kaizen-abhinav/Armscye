import React from 'react';
import { Sparkles, Shirt, Database, Cpu, RotateCcw } from 'lucide-react';
import { AppMode, SystemHealth } from '../types';

interface HeaderProps {
  mode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  systemHealth: SystemHealth | null;
  hasActiveSession: boolean;
  onClearSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onSelectMode,
  systemHealth,
  hasActiveSession,
  onClearSession,
}) => {
  const isVtonHealthy = systemHealth?.vtonService?.status === 'healthy';
  const deviceName = systemHealth?.vtonService?.device || 'Checking...';
  const vramFree = systemHealth?.vtonService?.vram_free_gb;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onSelectMode('welcome')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Shirt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold tracking-tight text-slate-900">
                MirrorFit
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Smart Indian Apparel Fitting</p>
          </div>
        </div>

        {/* Center Navigation */}
        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => onSelectMode('fitting')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'fitting'
                ? 'bg-white text-emerald-800 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Fitting Room
          </button>
          <button
            onClick={() => onSelectMode('catalogue')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'catalogue'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-slate-600" />
            Store Catalogue
          </button>
        </nav>

        {/* Right Section: Hardware Badge & Session Clear */}
        <div className="flex items-center gap-3">
          {/* Active Session Indicator */}
          {hasActiveSession && (
            <button
              onClick={onClearSession}
              title="Clear temporary session photo and results"
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Session</span>
            </button>
          )}

          {/* GPU / Model Status Badge */}
          <div
            title={`FASHN VTON Engine: ${isVtonHealthy ? 'Loaded & Ready' : 'Service degraded'}${
              vramFree !== undefined ? ` • ${vramFree} GB VRAM free` : ''
            }`}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
              isVtonHealthy
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isVtonHealthy ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isVtonHealthy ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline font-mono truncate max-w-[130px]">
                {deviceName.replace('NVIDIA GeForce ', '')}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-1 rounded">
                bf16
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
