export type ModelCategory = 'tops' | 'bottoms' | 'one-pieces';
export type GarmentPhotoType = 'flat-lay' | 'model';

export interface Product {
  id: string;
  name: string;
  modelCategory: ModelCategory;
  displayCategory: string;
  price: number;
  colour: string;
  sizes: string[];
  tags: string[];
  imageUrl: string;
  garmentPhotoType: GarmentPhotoType;
  available: boolean;
  createdAt: string;
  updatedAt: string;
  score?: number;
  reason?: string;
  reasons?: string[];
}

export interface TryOnResult {
  id: string;
  status: 'completed' | 'failed' | 'processing';
  productId: string;
  customerPhotoUrl: string;
  resultImageUrl?: string;
  inferenceTime?: number;
  product?: Product;
  createdAt: string;
  error?: string;
}

export interface SystemHealth {
  status: string;
  database: string;
  vtonService: {
    status: string;
    model_loaded?: boolean;
    device?: string;
    cuda_available?: boolean;
    vram_free_gb?: number;
    vram_total_gb?: number;
    error?: string;
  };
}

export type AppMode = 'welcome' | 'fitting' | 'catalogue';
export type FittingStep = 'photo' | 'garment' | 'processing' | 'result';
