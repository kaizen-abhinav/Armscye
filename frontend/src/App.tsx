import React, { useState, useEffect } from 'react';
import { Product, TryOnResult, SystemHealth, AppMode, FittingStep } from './types';
import { Header } from './components/Header';
import { WelcomeView } from './components/WelcomeView';
import { CustomerPhotoView } from './components/CustomerPhotoView';
import { GarmentSelectionView } from './components/GarmentSelectionView';
import { TryOnProcessingView } from './components/TryOnProcessingView';
import { TryOnResultView } from './components/TryOnResultView';
import { RecommendationsSection } from './components/RecommendationsSection';
import { CatalogueView } from './components/CatalogueView';

export const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('welcome');
  const [fittingStep, setFittingStep] = useState<FittingStep>('photo');

  // Catalogue & System state
  const [products, setProducts] = useState<Product[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);

  // Fitting session state
  const [customerPhotoFile, setCustomerPhotoFile] = useState<File | null>(null);
  const [customerPhotoUrl, setCustomerPhotoUrl] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [tryOnResult, setTryOnResult] = useState<TryOnResult | null>(null);
  const [tryOnError, setTryOnError] = useState<string | null>(null);

  // Recommendations state
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isRecsLoading, setIsRecsLoading] = useState(false);

  // Load products & system health
  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setSystemHealth(data);
      }
    } catch (err) {
      console.error('Health check failed:', err);
    }
  };

  useEffect(() => {
    loadProducts();
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch similar recommendations whenever product is selected
  const fetchRecommendations = async (productId: string) => {
    setIsRecsLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}/similar`);
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setIsRecsLoading(false);
    }
  };

  // Photo Selection
  const handlePhotoSelected = (file: File | null, previewUrl: string) => {
    setCustomerPhotoFile(file);
    setCustomerPhotoUrl(previewUrl);
  };

  const handleContinueToGarment = () => {
    if (customerPhotoUrl) {
      // Auto-select first product if none selected
      if (!selectedProduct && products.length > 0) {
        setSelectedProduct(products[0]);
      }
      setFittingStep('garment');
    }
  };

  // Trigger Try-On Execution
  const handleStartTryOn = async (numTimesteps = 20) => {
    if (!selectedProduct || !customerPhotoUrl) return;

    setFittingStep('processing');
    setTryOnError(null);

    try {
      const formData = new FormData();
      formData.append('productId', selectedProduct.id);
      formData.append('numTimesteps', String(numTimesteps));
      formData.append('segmentationFree', 'true');

      if (customerPhotoFile) {
        formData.append('customerPhoto', customerPhotoFile);
      } else if (customerPhotoUrl) {
        formData.append('customerPhotoUrl', customerPhotoUrl);
      }

      const res = await fetch('/api/try-ons', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.status === 'failed') {
        const msg = data.error || data.detail || 'Virtual Try-On inference failed.';
        setTryOnError(msg);
        return;
      }

      setTryOnResult(data);
      if (data.customerPhotoUrl) {
        setCustomerPhotoUrl(data.customerPhotoUrl);
        setCustomerPhotoFile(null); // Switch to server-persisted session URL
      }

      setFittingStep('result');
      fetchRecommendations(selectedProduct.id);
    } catch (err: any) {
      console.error('Try-on network error:', err);
      setTryOnError(err.message || 'Network error connecting to try-on server.');
    }
  };

  // Switching garments
  const handleTryAnother = () => {
    setFittingStep('garment');
  };

  // Clear session
  const handleClearSession = async () => {
    try {
      await fetch('/api/session', { method: 'DELETE' });
    } catch (e) {
      console.warn('Session cleanup call failed:', e);
    }

    setCustomerPhotoFile(null);
    setCustomerPhotoUrl(null);
    setSelectedProduct(null);
    setTryOnResult(null);
    setTryOnError(null);
    setRecommendations([]);
    setFittingStep('photo');
    setMode('welcome');
  };

  // From Catalogue: directly try on product
  const handleTryOnFromCatalogue = (product: Product) => {
    setSelectedProduct(product);
    setMode('fitting');
    if (customerPhotoUrl) {
      setFittingStep('garment');
    } else {
      setFittingStep('photo');
    }
  };

  const hasActiveSession = Boolean(customerPhotoUrl || tryOnResult);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        mode={mode}
        onSelectMode={(m) => setMode(m)}
        systemHealth={systemHealth}
        hasActiveSession={hasActiveSession}
        onClearSession={handleClearSession}
      />

      <main className="flex-1">
        {mode === 'welcome' && (
          <WelcomeView
            onEnterFitting={() => {
              setMode('fitting');
              if (customerPhotoUrl && selectedProduct) {
                setFittingStep('garment');
              } else if (customerPhotoUrl) {
                setFittingStep('garment');
              } else {
                setFittingStep('photo');
              }
            }}
            onEnterCatalogue={() => setMode('catalogue')}
          />
        )}

        {mode === 'fitting' && (
          <div>
            {fittingStep === 'photo' && (
              <CustomerPhotoView
                currentPhotoUrl={customerPhotoUrl}
                onPhotoSelected={handlePhotoSelected}
                onContinue={handleContinueToGarment}
              />
            )}

            {fittingStep === 'garment' && customerPhotoUrl && (
              <GarmentSelectionView
                products={products}
                customerPhotoUrl={customerPhotoUrl}
                selectedProduct={selectedProduct}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onBackToPhoto={() => setFittingStep('photo')}
                onStartTryOn={handleStartTryOn}
              />
            )}

            {fittingStep === 'processing' && selectedProduct && customerPhotoUrl && (
              <TryOnProcessingView
                customerPhotoUrl={customerPhotoUrl}
                product={selectedProduct}
                error={tryOnError}
                onRetry={() => handleStartTryOn()}
                onChooseAnother={() => setFittingStep('garment')}
              />
            )}

            {fittingStep === 'result' && tryOnResult && customerPhotoUrl && (
              <>
                <TryOnResultView
                  result={tryOnResult}
                  customerPhotoUrl={customerPhotoUrl}
                  onTryAnother={handleTryAnother}
                  onClearSession={handleClearSession}
                  onSelectSimilarProduct={(p) => {
                    setSelectedProduct(p);
                    handleStartTryOn();
                  }}
                />

                {/* Recommendations Section */}
                <RecommendationsSection
                  recommendations={recommendations}
                  currentProductId={selectedProduct?.id || ''}
                  onSelectProduct={(p) => {
                    setSelectedProduct(p);
                    handleStartTryOn();
                  }}
                  isLoading={isRecsLoading}
                />
              </>
            )}
          </div>
        )}

        {mode === 'catalogue' && (
          <CatalogueView
            products={products}
            onRefreshProducts={loadProducts}
            onTryOnProduct={handleTryOnFromCatalogue}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 space-y-1">
          <p className="font-medium text-slate-700">
            MirrorFit AI — Built for AIBoomi Startup Weekend Kochi 2026
          </p>
          <p>
            Powered by <strong>FASHN VTON v1.5</strong> (Apache-2.0) • DWPose ONNX • Local RTX 4050 GPU (bf16)
          </p>
        </div>
      </footer>
    </div>
  );
};
