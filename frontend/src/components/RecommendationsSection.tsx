import React from 'react';
import { Product } from '../types';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface RecommendationsSectionProps {
  recommendations: Product[];
  currentProductId: string;
  onSelectProduct: (product: Product) => void;
  isLoading: boolean;
}

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  recommendations,
  currentProductId,
  onSelectProduct,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700 mb-2" />
        <p className="text-xs text-slate-500">Matching catalogue alternatives…</p>
      </div>
    );
  }

  const items = recommendations.filter((p) => p.id !== currentProductId);
  if (items.length === 0) return null;

  return (
    <section className="py-10 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Catalogue Matching
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">
              Recommended Alternatives
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-sm">
            Curated from real in-store stock based on category, palette harmony, and price range.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {product.reason && (
                    <div className="absolute top-2 left-2 right-2 bg-emerald-950/80 backdrop-blur text-white text-[10px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">{product.reason}</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {product.displayCategory} • {product.colour}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1 line-clamp-1 group-hover:text-emerald-800 transition-colors">
                    {product.name}
                  </h3>
                  <div className="mt-2 text-base font-serif font-bold text-slate-900">
                    ₹{product.price.toLocaleString('en-IN')}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Sizes: {product.sizes.join(', ')}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => onSelectProduct(product)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm group-hover:shadow"
                >
                  <span>Try This Outfit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
