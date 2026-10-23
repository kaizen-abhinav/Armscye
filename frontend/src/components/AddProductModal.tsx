import React, { useState, useRef } from 'react';
import { X, Upload, Sparkles, AlertCircle } from 'lucide-react';
import { ModelCategory, GarmentPhotoType } from '../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onProductAdded,
}) => {
  const [name, setName] = useState('');
  const [modelCategory, setModelCategory] = useState<ModelCategory>('tops');
  const [displayCategory, setDisplayCategory] = useState('Kurta');
  const [price, setPrice] = useState('');
  const [colour, setColour] = useState('Green');
  const [sizes, setSizes] = useState<string[]>(['M', 'L', 'XL']);
  const [tags, setTags] = useState('festive, cotton, heritage');
  const [garmentPhotoType, setGarmentPhotoType] = useState<GarmentPhotoType>('flat-lay');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 15 * 1024 * 1024) {
      setError('Image must be under 15 MB.');
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError(null);
  };

  const handleSizeToggle = (size: string) => {
    if (sizes.includes(size)) {
      setSizes(sizes.filter((s) => s !== size));
    } else {
      setSizes([...sizes, size]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload a garment image.');
      return;
    }
    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!price || isNaN(Number(price))) {
      setError('Please enter a valid price in INR.');
      return;
    }
    if (sizes.length === 0) {
      setError('Please select at least one available size.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('garmentImage', file);
      formData.append('name', name.trim());
      formData.append('modelCategory', modelCategory);
      formData.append('displayCategory', displayCategory.trim() || modelCategory);
      formData.append('price', price);
      formData.append('colour', colour.trim());
      formData.append('sizes', sizes.join(','));
      formData.append('tags', tags);
      formData.append('garmentPhotoType', garmentPhotoType);

      const resp = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });

      if (!resp.ok) {
        const errJson = await resp.json();
        throw new Error(errJson.error || 'Failed to save product');
      }

      onProductAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creating product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-serif font-bold text-xl text-slate-900">
              Add Store Garment
            </h3>
            <p className="text-xs text-slate-500">
              Upload a product photo to add to the fitting catalogue.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Garment Image Upload */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Garment Photography *
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer bg-slate-50 hover:bg-emerald-50/30 transition-colors"
            >
              {preview ? (
                <div className="flex items-center gap-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-20 h-24 object-cover rounded-xl border border-slate-200"
                  />
                  <div className="text-left text-xs text-slate-600">
                    <p className="font-semibold text-slate-900">{file?.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click to replace photo</p>
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-700">Click to upload garment photo</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG, WebP up to 15 MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Photo type: flat-lay vs model */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Photo Input Type
              </label>
              <select
                value={garmentPhotoType}
                onChange={(e) => setGarmentPhotoType(e.target.value as GarmentPhotoType)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              >
                <option value="flat-lay">flat-lay (Garment shot without person)</option>
                <option value="model">model (Garment worn on model)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                FASHN Model Category *
              </label>
              <select
                value={modelCategory}
                onChange={(e) => {
                  const val = e.target.value as ModelCategory;
                  setModelCategory(val);
                  if (val === 'tops') setDisplayCategory('Kurta');
                  else if (val === 'bottoms') setDisplayCategory('Trousers');
                  else setDisplayCategory('Anarkali Dress');
                }}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium"
              >
                <option value="tops">tops (Kurtas, Shirts, Jackets)</option>
                <option value="bottoms">bottoms (Trousers, Chinos, Jeans)</option>
                <option value="one-pieces">one-pieces (Dresses, Jumpsuits)</option>
              </select>
            </div>
          </div>

          {/* Name & Display Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Product Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Royal Silk Festive Kurta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Display Label
              </label>
              <input
                type="text"
                placeholder="e.g. Kurta, Nehru Jacket, Chinos"
                value={displayCategory}
                onChange={(e) => setDisplayCategory(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Price & Colour */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Price (INR ₹) *
              </label>
              <input
                type="number"
                placeholder="1899"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Colour *
              </label>
              <input
                type="text"
                placeholder="e.g. Green, Navy, Maroon"
                value={colour}
                onChange={(e) => setColour(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Available Sizes *
            </label>
            <div className="flex flex-wrap gap-2">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '38', '40'].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => handleSizeToggle(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    sizes.includes(s)
                      ? 'bg-emerald-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Tags / Fabric / Occasion (comma-separated)
            </label>
            <input
              type="text"
              placeholder="festive, silk, royal, wedding"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
