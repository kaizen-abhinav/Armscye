import React, { useState } from 'react';
import { TryOnResult, Product } from '../types';
import { Sparkles, ArrowLeft, Download, RotateCcw, Check, Tag, ShieldAlert } from 'lucide-react';

interface TryOnResultViewProps {
  result: TryOnResult;
  customerPhotoUrl: string;
  onTryAnother: () => void;
  onClearSession: () => void;
  onSelectSimilarProduct: (product: Product) => void;
}

export const TryOnResultView: React.FC<TryOnResultViewProps> = ({
  result,
  customerPhotoUrl,
  onTryAnother,
  onClearSession,
}) => {
  const [viewMode, setViewMode] = useState<'tryon' | 'split' | 'original'>('tryon');
  const product = result.product;

  const handleDownload = () => {
    if (!result.resultImageUrl) return;
    const a = document.createElement('a');
    a.href = result.resultImageUrl;
    a.download = `mirrorfit-${product?.name.toLowerCase().replace(/\s+/g, '-') || 'tryon'}.png`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={onTryAnother}
          className="text-xs sm:text-sm text-slate-700 hover:text-slate-900 font-semibold px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Try Another Garment</span>
        </button>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setViewMode('original')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              viewMode === 'original' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-600'
            }`}
          >
            Original Photo
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              viewMode === 'split' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-600'
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setViewMode('tryon')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              viewMode === 'tryon' ? 'bg-white text-emerald-800 font-semibold shadow-sm' : 'text-slate-600'
            }`}
          >
            Virtual Fitting
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="text-xs text-slate-700 hover:text-slate-900 font-medium px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Save Image</span>
          </button>
          <button
            onClick={onClearSession}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 flex items-center gap-1.5 transition-colors border border-rose-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Session</span>
          </button>
        </div>
      </div>

      {/* Main Results Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        {/* Left: Image Canvas */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6">
          {viewMode === 'split' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
                  Original Customer Photo
                </div>
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={customerPhotoUrl}
                    alt="Original Photo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2 text-center flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Virtual Try-On Result
                </div>
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 border border-emerald-300 shadow-md">
                  <img
                    src={result.resultImageUrl}
                    alt="Try-On Result"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="relative aspect-[3/4] max-w-lg mx-auto rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md flex items-center justify-center">
              <img
                src={viewMode === 'original' ? customerPhotoUrl : result.resultImageUrl}
                alt={viewMode === 'original' ? 'Original Photo' : 'Try-On Result'}
                className="w-full h-full object-contain"
              />

              <div className="absolute top-4 left-4 bg-emerald-800/90 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>{viewMode === 'original' ? 'Original Photo' : 'FASHN VTON Result'}</span>
              </div>

              {result.inferenceTime && (
                <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[11px] font-mono px-2.5 py-1 rounded-lg backdrop-blur">
                  ⚡ {result.inferenceTime}s inference
                </div>
              )}
            </div>
          )}

          {/* Mandatory Disclaimer Box */}
          <div className="mt-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed">
              <strong>Disclaimer:</strong> AI-generated visual preview. Appearance may differ slightly from the physical garment under in-store lighting; this preview does not guarantee physical fit or exact sizing measurements.
            </p>
          </div>
        </div>

        {/* Right: Selected Product Details & Actions */}
        <div className="lg:col-span-4 space-y-6">
          {product && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                  {product.displayCategory} • {product.modelCategory}
                </span>
                <h3 className="text-2xl font-serif font-bold text-slate-900 mt-2">
                  {product.name}
                </h3>
                <div className="text-2xl font-serif font-bold text-emerald-800 mt-2">
                  ₹{product.price.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Garment Image Thumbnail */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-14 h-18 object-cover rounded-lg border border-slate-200"
                />
                <div className="text-xs">
                  <div className="font-semibold text-slate-800">Source Garment</div>
                  <div className="text-slate-500 capitalize">{product.colour} • {product.garmentPhotoType}</div>
                  <div className="text-emerald-700 font-medium mt-0.5">In Stock</div>
                </div>
              </div>

              {/* Available Sizes */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Available In-Store Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Style & Fabric
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3 text-slate-400" />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <button
                  onClick={onTryAnother}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Try Another Garment</span>
                </button>
                <p className="text-[11px] text-center text-slate-400">
                  Keeps your current photo for instant 1-click retry.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
