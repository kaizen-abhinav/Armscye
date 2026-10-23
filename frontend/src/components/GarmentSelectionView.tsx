import React, { useState } from 'react';
import { Product, ModelCategory } from '../types';
import { Sparkles, Filter, Check, ArrowLeft, Tag, Info } from 'lucide-react';

interface GarmentSelectionViewProps {
  products: Product[];
  customerPhotoUrl: string;
  selectedProduct: Product | null;
  onSelectProduct: (product: Product) => void;
  onBackToPhoto: () => void;
  onStartTryOn: (numTimesteps: number) => void;
}

export const GarmentSelectionView: React.FC<GarmentSelectionViewProps> = ({
  products,
  customerPhotoUrl,
  selectedProduct,
  onSelectProduct,
  onBackToPhoto,
  onStartTryOn,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedColour, setSelectedColour] = useState<string>('all');
  const [timesteps, setTimesteps] = useState<number>(20);

  const colours = Array.from(new Set(products.map((p) => p.colour))).filter(Boolean);

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.modelCategory !== selectedCategory) return false;
    if (selectedColour !== 'all' && p.colour !== selectedColour) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Banner: Step Indicator & Session Customer Thumbnail */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-16 sm:w-16 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
            <img
              src={customerPhotoUrl}
              alt="Customer Session"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-emerald-700/90 text-white text-[9px] font-semibold text-center py-0.5">
              Active
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              Step 2 of 3
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 mt-1">
              Select Garment to Try On
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pick any outfit from the store catalogue. Your active photo will be dressed.
            </p>
          </div>
        </div>

        <button
          onClick={onBackToPhoto}
          className="self-start sm:self-center text-xs text-slate-600 hover:text-slate-900 font-medium px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Change Customer Photo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Product Grid with Filters */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Category:
              </span>
              {[
                { id: 'all', label: 'All Garments' },
                { id: 'tops', label: 'Tops & Kurtas' },
                { id: 'bottoms', label: 'Bottoms & Trousers' },
                { id: 'one-pieces', label: 'Dresses & Sets' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === tab.id
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Colour filter */}
            {colours.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Colour:</span>
                <select
                  value={selectedColour}
                  onChange={(e) => setSelectedColour(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="all">All Colours</option>
                  {colours.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            {filteredProducts.map((p) => {
              const isSelected = selectedProduct?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  className={`group relative bg-white rounded-2xl border transition-all cursor-pointer overflow-hidden flex flex-col ${
                    isSelected
                      ? 'border-emerald-600 ring-2 ring-emerald-500/30 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow'
                  }`}
                >
                  {/* Image container */}
                  <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <span className="px-2 py-0.5 rounded-md bg-white/90 text-slate-700 text-[10px] font-semibold tracking-wider uppercase backdrop-blur shadow-sm">
                        {p.displayCategory}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-3.5 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-1 group-hover:text-emerald-800 transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {p.colour} • Sizes: {p.sizes.join(', ')}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                        ₹{p.price.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
                          isSelected
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'text-slate-500 group-hover:text-emerald-700'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <p className="text-slate-500 text-sm">No garments found matching current filter.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedColour('all');
                }}
                className="mt-3 text-xs text-emerald-700 font-semibold underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* Right: Selected Outfit Detail & Try On Launcher */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-serif font-bold text-slate-900 text-lg mb-4">
              Fitting Selection
            </h3>

            {selectedProduct ? (
              <div className="space-y-4">
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur">
                    Photo input: {selectedProduct.garmentPhotoType}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-base">
                    {selectedProduct.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Category: <span className="font-medium text-slate-700">{selectedProduct.displayCategory}</span> ({selectedProduct.modelCategory})
                  </p>
                  <div className="mt-2 text-xl font-serif font-bold text-slate-900">
                    ₹{selectedProduct.price.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Tags */}
                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {selectedProduct.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Quality / Speed Setting */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-700">Diffusion Timesteps:</span>
                    <span className="text-xs font-mono font-semibold text-emerald-800">
                      {timesteps} steps {timesteps === 20 ? '(Fast ~34s)' : '(Quality ~50s)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTimesteps(20)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                        timesteps === 20
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      ⚡ 20 (Recommended)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimesteps(30)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                        timesteps === 30
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      ✨ 30 (Enhanced)
                    </button>
                  </div>
                </div>

                {/* Try On Button */}
                <button
                  onClick={() => onStartTryOn(timesteps)}
                  className="w-full py-4 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-lg shadow-emerald-900/10 hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200 transition-transform group-hover:rotate-12" />
                  <span>Try On This Outfit</span>
                </button>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs text-slate-500">
                  Click any garment from the catalogue to preview details and start fitting.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
