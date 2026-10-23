import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Search, Filter, Trash2, Sparkles, Tag, ShoppingBag } from 'lucide-react';
import { AddProductModal } from './AddProductModal';

interface CatalogueViewProps {
  products: Product[];
  onRefreshProducts: () => void;
  onTryOnProduct: (product: Product) => void;
}

export const CatalogueView: React.FC<CatalogueViewProps> = ({
  products,
  onRefreshProducts,
  onTryOnProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [colourFilter, setColourFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const colours = Array.from(new Set(products.map((p) => p.colour))).filter(Boolean);

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'all' && p.modelCategory !== categoryFilter) return false;
    if (colourFilter !== 'all' && p.colour !== colourFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCategory = p.displayCategory.toLowerCase().includes(q);
      const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchCategory && !matchTags) return false;
    }
    return true;
  });

  const handleDelete = async (e: React.MouseEvent, productId: string, productName: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to remove "${productName}" from the catalogue?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        onRefreshProducts();
      }
    } catch (err) {
      console.error('Delete product error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            <ShoppingBag className="w-4 h-4 text-slate-600" />
            Store Inventory
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-900">
            Garment Catalogue
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your store's physical garments available for customer virtual try-on.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-center px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Garment</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by garment title, style, or fabric tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Colour dropdown */}
          {colours.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Colour:</span>
              <select
                value={colourFilter}
                onChange={(e) => setColourFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Category:
          </span>
          {[
            { id: 'all', label: 'All Items' },
            { id: 'tops', label: 'Tops & Kurtas' },
            { id: 'bottoms', label: 'Bottoms & Trousers' },
            { id: 'one-pieces', label: 'One-Pieces & Sets' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                categoryFilter === cat.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400">
            Showing {filteredProducts.length} of {products.length} garments
          </span>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Image */}
              <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                  <span className="px-2 py-0.5 rounded-md bg-white/95 text-slate-800 text-[10px] font-semibold tracking-wider uppercase backdrop-blur shadow-sm">
                    {p.displayCategory}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono backdrop-blur">
                    {p.garmentPhotoType}
                  </span>
                </div>

                <button
                  onClick={(e) => handleDelete(e, p.id, p.name)}
                  title="Remove from catalogue"
                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center backdrop-blur shadow-sm transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-emerald-800 transition-colors">
                  {p.name}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <div className="font-serif font-bold text-slate-900 text-base">
                    ₹{p.price.toLocaleString('en-IN')}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{p.colour}</span>
                </div>

                <div className="mt-2 text-[11px] text-slate-500">
                  Sizes: <span className="font-medium text-slate-700">{p.sizes.join(', ')}</span>
                </div>

                {/* Tags */}
                {p.tags && p.tags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {p.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-0.5"
                      >
                        <Tag className="w-2 h-2 text-slate-400" />
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Direct Try-On Action */}
            <div className="p-4 pt-0">
              <button
                onClick={() => onTryOnProduct(p)}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Try On in Fitting Room</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">No products found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Try adjusting your search criteria or add a new product to your catalogue.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold"
          >
            Add Garment Now
          </button>
        </div>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={onRefreshProducts}
      />
    </div>
  );
};
