import React from 'react';
import { Product } from '../types';
import { Sparkles, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

interface TryOnProcessingViewProps {
  customerPhotoUrl: string;
  product: Product;
  error: string | null;
  onRetry: () => void;
  onChooseAnother: () => void;
}

export const TryOnProcessingView: React.FC<TryOnProcessingViewProps> = ({
  customerPhotoUrl,
  product,
  error,
  onRetry,
  onChooseAnother,
}) => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-center">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12">
        {error ? (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Virtual Try-On Could Not Be Completed
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto mb-4">
                The inference service encountered an issue while generating this preview.
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 max-w-lg mx-auto text-left overflow-auto">
                {error}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={onRetry}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Inference
              </button>
              <button
                onClick={onChooseAnother}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm border border-slate-300 flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Choose Another Garment
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Visual Pairing: Customer + Garment */}
            <div className="flex items-center justify-center gap-4 sm:gap-8">
              <div className="relative w-28 h-36 sm:w-36 sm:h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                <img
                  src={customerPhotoUrl}
                  alt="Customer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 inset-x-2 bg-black/60 text-white text-[10px] py-0.5 rounded text-center backdrop-blur">
                  Your Photo
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-sm animate-pulse">
                  <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider mt-2">
                  Dressing
                </span>
              </div>

              <div className="relative w-28 h-36 sm:w-36 sm:h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 inset-x-2 bg-black/60 text-white text-[10px] py-0.5 rounded text-center backdrop-blur truncate px-1">
                  {product.name}
                </span>
              </div>
            </div>

            {/* Status Text & Spinner */}
            <div>
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">
                Creating your virtual fitting preview…
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Running FASHN VTON v1.5 diffusion pipeline on NVIDIA GeForce RTX 4050 GPU in bfloat16 precision.
              </p>
            </div>

            {/* Pipeline Stage Indicators */}
            <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5">
              <div className="flex items-center gap-3 text-xs text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Extracting whole-body pose via DWPose ONNX</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" style={{ animationDelay: '0.4s' }} />
                <span>Maskless segmentation-free garment synthesis</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" style={{ animationDelay: '0.8s' }} />
                <span>Preserving posture, fabric folds & drape details</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Inference typically takes ~34 seconds. Please keep this screen open.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
