import React from 'react';
import { Sparkles, ShoppingBag, ShieldCheck, Zap, Layers, ArrowRight } from 'lucide-react';
import { AppMode } from '../types';

interface WelcomeViewProps {
  onEnterFitting: () => void;
  onEnterCatalogue: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onEnterFitting,
  onEnterCatalogue,
}) => {
  return (
    <div className="py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Event Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          AIBoomi Startup Weekend Kochi 2026 • MVP v1.0
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl font-serif font-bold text-slate-900 tracking-tight leading-[1.15] mb-6">
          Virtual Fitting Room for <br className="hidden sm:inline" />
          <span className="text-emerald-800 underline decoration-emerald-300 underline-offset-8">
            Modern Indian Apparel
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 font-normal max-w-2xl mx-auto mb-10 leading-relaxed">
          Preview how ethnic kurtas, shirts, jackets, and trousers look on you in seconds — powered by the open-source <strong>FASHN VTON v1.5</strong> diffusion pipeline.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onEnterFitting}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-base shadow-lg shadow-emerald-900/10 hover:shadow-xl transition-all flex items-center justify-center gap-3 group"
          >
            <span>Enter Virtual Fitting Room</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={onEnterCatalogue}
            className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-medium text-base border border-slate-300 hover:border-slate-400 shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-slate-600" />
            <span>Manage Store Catalogue</span>
          </button>
        </div>

        {/* Value Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base mb-2">Real FASHN VTON v1.5</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Authentic pixel-space diffusion inference running on your local RTX 4050 GPU in bfloat16. No generic hallucinated mockups.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base mb-2">Switch Garments Instantly</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Upload your photo once per fitting session. Browse multiple kurtas, jackets, and pants without re-capturing your photo.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base mb-2">Privacy & Temporary Storage</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Photos are stored strictly in temporary session buffers and purged upon session reset. Never used for identification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
