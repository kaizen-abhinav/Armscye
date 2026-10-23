# Armscye / MirrorFit AI — REST API Documentation

Base URL (Application Backend): `http://localhost:8000` (or `http://localhost:5173/api` via Vite Proxy)  
Inference Service URL: `http://localhost:8001`

---

## 1. System Health & Diagnostics

### `GET /api/health`
Returns health telemetry for the application backend, SQLite database, and the upstream FASHN VTON GPU inference service.

#### Response `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2026-10-23T19:23:57.613Z",
  "database": "connected",
  "vtonService": {
    "status": "healthy",
    "model_loaded": true,
    "device": "NVIDIA GeForce RTX 4050 Laptop GPU",
    "cuda_available": true,
    "vram_free_gb": 1.11,
    "vram_total_gb": 5.64,
    "weights_dir": "/path/to/weights"
  }
}
```

---

## 2. Store Catalogue API

### `GET /api/products`
Lists all available products with optional query filtering.

#### Query Parameters
- `q` (string): Text search matching name, displayCategory, or tags.
- `category` (string): Filter by model category: `tops`, `bottoms`, or `one-pieces`.
- `colour` (string): Exact colour filter (e.g., `Green`, `Blue`, `Red`).
- `minPrice` (number): Minimum price in INR.
- `maxPrice` (number): Maximum price in INR.

#### Response `200 OK`
```json
[
  {
    "id": "prod-001",
    "name": "Emerald Heritage Silk Kurta",
    "modelCategory": "tops",
    "displayCategory": "Kurta",
    "price": 1899,
    "colour": "Green",
    "sizes": ["S", "M", "L", "XL"],
    "tags": ["festive", "silk", "royal", "wedding"],
    "imageUrl": "/uploads/products/emerald-kurta.webp",
    "garmentPhotoType": "flat-lay",
    "available": true,
    "createdAt": "2026-10-23T17:23:44.361Z",
    "updatedAt": "2026-10-23T17:23:44.361Z"
  }
]
```

### `GET /api/products/:id`
Retrieves metadata for a specific product by its ID.

### `POST /api/products`
Adds a new garment product to the store catalogue.

#### Request (`multipart/form-data`)
- `garmentImage` (file, required): Garment photo (JPEG, PNG, or WebP).
- `name` (string, required): Product title.
- `modelCategory` (string, required): `tops`, `bottoms`, or `one-pieces`.
- `displayCategory` (string): Display label (e.g. `Kurta`, `Nehru Jacket`, `Chinos`).
- `price` (number, required): Price in INR.
- `colour` (string, required): Primary colour.
- `sizes` (comma-separated string or array): e.g. `S,M,L,XL`.
- `tags` (comma-separated string): e.g. `festive, silk, royal`.
- `garmentPhotoType` (string): `flat-lay` or `model`.

#### Response `201 Created`
```json
{
  "id": "prod-a1b2c3d4",
  "name": "Saffron Handloom Kurta",
  "modelCategory": "tops",
  "displayCategory": "Kurta",
  "price": 1299,
  "colour": "Yellow",
  "sizes": ["M", "L", "XL"],
  "tags": ["cotton", "summer", "ethnic"],
  "imageUrl": "/uploads/products/1729729800-abc123.webp",
  "garmentPhotoType": "flat-lay",
  "available": true
}
```

### `DELETE /api/products/:id`
Deletes a product from the database.

---

## 3. Virtual Try-On API

### `POST /api/try-ons`
Performs an end-to-end virtual try-on inference. Accepts either a freshly uploaded customer photo OR a pre-existing session photo URL (`customerPhotoUrl`) to allow trying multiple garments without re-uploading.

#### Request (`multipart/form-data` or `application/json`)
- `productId` (string, required): ID of the garment in the catalogue.
- `customerPhoto` (file, optional if `customerPhotoUrl` is provided): Customer photo.
- `customerPhotoUrl` (string, optional if `customerPhoto` is provided): URL of previously uploaded customer photo.
- `numTimesteps` (number, optional): `20` (fast ~34s) or `30` (quality ~50s). Default: `20`.
- `segmentationFree` (string, optional): `"true"` or `"false"`. Default: `"true"`.

#### Response `200 OK`
```json
{
  "id": "tryon-8c94feb7c99f",
  "status": "completed",
  "productId": "prod-001",
  "customerPhotoUrl": "/uploads/customers/demo-model.webp",
  "resultImageUrl": "/generated/tryon-8c94feb7c99f.png",
  "inferenceTime": 38.17,
  "product": {
    "id": "prod-001",
    "name": "Emerald Heritage Silk Kurta",
    "modelCategory": "tops",
    "displayCategory": "Kurta",
    "price": 1899,
    "colour": "Green",
    "sizes": ["S", "M", "L", "XL"]
  },
  "createdAt": "2026-10-23T17:27:22.808Z"
}
```

### `DELETE /api/session`
Cleans up temporary customer photos and generated preview files from the server, wiping session records from SQLite.

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Customer session and temporary files cleared."
}
```

---

## 4. Recommendations API

### `GET /api/products/:id/similar`
Returns similar alternatives from the store catalogue based on deterministic attribute matching (matching category, colour harmony, tags, and price proximity).

#### Response `200 OK`
```json
[
  {
    "id": "prod-004",
    "name": "Maroon Jacquard Nehru Jacket",
    "modelCategory": "tops",
    "displayCategory": "Nehru Jacket",
    "price": 2199,
    "colour": "Red",
    "score": 65,
    "reason": "Same Nehru Jacket category",
    "reasons": [
      "Same Nehru Jacket category",
      "Matches style: festive, wedding",
      "Similar price point (₹2,199)"
    ]
  }
]
```

### `POST /api/recommendations`
Accepts structured preferences (`occasion`, `budget`, `colours`, `size`, `category`) and returns ranked catalogue items with explanations.
