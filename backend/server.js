import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { db, initDatabase } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.API_PORT || '8000', 10);
const VTON_SERVICE_URL = process.env.VTON_SERVICE_URL || 'http://127.0.0.1:8001';
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');
const GENERATED_DIR = path.resolve(__dirname, '../generated');

// Ensure directories exist
fs.mkdirSync(path.join(UPLOADS_DIR, 'products'), { recursive: true });
fs.mkdirSync(path.join(UPLOADS_DIR, 'customers'), { recursive: true });
fs.mkdirSync(GENERATED_DIR, { recursive: true });

// Initialize SQLite DB
initDatabase();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static assets
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/generated', express.static(GENERATED_DIR));

// Setup multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'garmentImage') {
      cb(null, path.join(UPLOADS_DIR, 'products'));
    } else {
      cb(null, path.join(UPLOADS_DIR, 'customers'));
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are accepted.'));
    }
  },
});

/* ----------------- System & Health Routes ----------------- */

app.get('/api/health', async (req, res) => {
  let vtonStatus = { status: 'unreachable', error: null };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const resp = await fetch(`${VTON_SERVICE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (resp.ok) {
      vtonStatus = await resp.json();
    } else {
      vtonStatus = { status: 'error', statusCode: resp.status };
    }
  } catch (err) {
    vtonStatus = { status: 'unreachable', error: err.message };
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'connected',
    vtonService: vtonStatus,
  });
});

/* ----------------- Catalogue Routes ----------------- */

app.get('/api/products', (req, res) => {
  try {
    const { q, category, colour, minPrice, maxPrice } = req.query;
    let query = 'SELECT * FROM products WHERE available = 1';
    const params = [];

    if (q) {
      query += ' AND (name LIKE ? OR tags LIKE ? OR displayCategory LIKE ?)';
      const term = `%${q}%`;
      params.push(term, term, term);
    }
    if (category) {
      query += ' AND modelCategory = ?';
      params.push(category);
    }
    if (colour) {
      query += ' AND LOWER(colour) = LOWER(?)';
      params.push(colour);
    }
    if (minPrice) {
      query += ' AND price >= ?';
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(Number(maxPrice));
    }

    query += ' ORDER BY createdAt DESC';
    const products = db.prepare(query).all(...params).map((p) => ({
      ...p,
      available: Boolean(p.available),
      sizes: JSON.parse(p.sizes || '[]'),
      tags: JSON.parse(p.tags || '[]'),
    }));

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({
      ...product,
      available: Boolean(product.available),
      sizes: JSON.parse(product.sizes || '[]'),
      tags: JSON.parse(product.tags || '[]'),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product', details: err.message });
  }
});

app.post('/api/products', upload.single('garmentImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Garment image is required' });
    }

    const {
      name,
      modelCategory,
      displayCategory,
      price,
      colour,
      sizes,
      tags,
      garmentPhotoType,
    } = req.body;

    if (!name || !modelCategory || !price || !colour) {
      return res.status(400).json({ error: 'Missing required product attributes' });
    }

    const validCategories = ['tops', 'bottoms', 'one-pieces'];
    if (!validCategories.includes(modelCategory)) {
      return res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
    }

    const id = `prod-${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();
    const imageUrl = `/uploads/products/${req.file.filename}`;

    const sizesArr = typeof sizes === 'string' ? sizes.split(',').map((s) => s.trim()).filter(Boolean) : (sizes || ['M', 'L']);
    const tagsArr = typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : (tags || []);

    const newProduct = {
      id,
      name: name.trim(),
      modelCategory,
      displayCategory: (displayCategory || modelCategory).trim(),
      price: parseFloat(price),
      colour: colour.trim(),
      sizes: JSON.stringify(sizesArr),
      tags: JSON.stringify(tagsArr),
      imageUrl,
      garmentPhotoType: garmentPhotoType === 'model' ? 'model' : 'flat-lay',
      available: 1,
      createdAt: now,
      updatedAt: now,
    };

    db.prepare(`
      INSERT INTO products (
        id, name, modelCategory, displayCategory, price, colour, sizes, tags, imageUrl, garmentPhotoType, available, createdAt, updatedAt
      ) VALUES (
        @id, @name, @modelCategory, @displayCategory, @price, @colour, @sizes, @tags, @imageUrl, @garmentPhotoType, @available, @createdAt, @updatedAt
      )
    `).run(newProduct);

    res.status(201).json({
      ...newProduct,
      available: true,
      sizes: sizesArr,
      tags: tagsArr,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product', details: err.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
});

/* ----------------- Try-On Routes ----------------- */

app.post('/api/try-ons', upload.single('customerPhoto'), async (req, res) => {
  try {
    const { productId, customerPhotoUrl, numTimesteps, segmentationFree } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) {
      return res.status(404).json({ error: 'Selected product not found in catalogue' });
    }

    // Determine customer photo path
    let personFilePath = null;
    let finalCustomerPhotoUrl = null;

    if (req.file) {
      personFilePath = req.file.path;
      finalCustomerPhotoUrl = `/uploads/customers/${req.file.filename}`;
    } else if (customerPhotoUrl) {
      // Reuse existing session photo
      finalCustomerPhotoUrl = customerPhotoUrl;
      const cleanPath = customerPhotoUrl.startsWith('/') ? customerPhotoUrl.slice(1) : customerPhotoUrl;
      personFilePath = path.resolve(__dirname, '..', cleanPath);
    } else {
      return res.status(400).json({ error: 'Customer photo is required (file upload or customerPhotoUrl)' });
    }

    if (!fs.existsSync(personFilePath)) {
      return res.status(400).json({ error: 'Customer photo file could not be located on server' });
    }

    // Garment image path
    const garmentCleanPath = product.imageUrl.startsWith('/') ? product.imageUrl.slice(1) : product.imageUrl;
    const garmentFilePath = path.resolve(__dirname, '..', garmentCleanPath);

    if (!fs.existsSync(garmentFilePath)) {
      return res.status(500).json({ error: `Garment image file not found on server at: ${garmentFilePath}` });
    }

    console.log(`[TryOn] Starting inference for product ${product.name} (${product.modelCategory})`);

    // Prepare FormData for python service
    const personBuffer = fs.readFileSync(personFilePath);
    const garmentBuffer = fs.readFileSync(garmentFilePath);

    const formData = new FormData();
    formData.append('person_image', new Blob([personBuffer], { type: 'image/png' }), 'person.png');
    formData.append('garment_image', new Blob([garmentBuffer], { type: 'image/png' }), 'garment.png');
    formData.append('category', product.modelCategory);
    formData.append('garment_photo_type', product.garmentPhotoType || 'flat-lay');
    formData.append('num_timesteps', String(numTimesteps || 20));
    formData.append('guidance_scale', '1.5');
    formData.append('seed', '42');
    formData.append('segmentation_free', segmentationFree !== 'false' ? 'true' : 'false');

    const tryOnId = `tryon-${crypto.randomBytes(6).toString('hex')}`;
    const startTime = Date.now();

    const vtonResponse = await fetch(`${VTON_SERVICE_URL}/tryon`, {
      method: 'POST',
      body: formData,
    });

    if (!vtonResponse.ok) {
      let errorDetail = 'VTON service error';
      try {
        const errJson = await vtonResponse.json();
        errorDetail = errJson.detail || JSON.stringify(errJson);
      } catch {
        errorDetail = await vtonResponse.text();
      }

      console.error(`[TryOn] Inference error from VTON service (${vtonResponse.status}):`, errorDetail);

      // Record failed tryon in DB
      db.prepare(`
        INSERT INTO tryons (id, productId, customerPhotoUrl, resultImageUrl, status, inferenceTime, errorMessage, createdAt)
        VALUES (?, ?, ?, NULL, 'failed', 0, ?, ?)
      `).run(tryOnId, productId, finalCustomerPhotoUrl, errorDetail, new Date().toISOString());

      return res.status(vtonResponse.status).json({
        id: tryOnId,
        status: 'failed',
        error: errorDetail,
        productId,
      });
    }

    // Save generated image
    const arrayBuffer = await vtonResponse.arrayBuffer();
    const resultBuffer = Buffer.from(arrayBuffer);
    const resultFilename = `${tryOnId}.png`;
    const resultFilePath = path.join(GENERATED_DIR, resultFilename);

    fs.writeFileSync(resultFilePath, resultBuffer);

    const inferenceSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
    const resultImageUrl = `/generated/${resultFilename}`;
    const nowIso = new Date().toISOString();

    db.prepare(`
      INSERT INTO tryons (id, productId, customerPhotoUrl, resultImageUrl, status, inferenceTime, errorMessage, createdAt)
      VALUES (?, ?, ?, ?, 'completed', ?, NULL, ?)
    `).run(tryOnId, productId, finalCustomerPhotoUrl, resultImageUrl, parseFloat(inferenceSeconds), nowIso);

    console.log(`[TryOn] Completed in ${inferenceSeconds}s: ${resultImageUrl}`);

    res.json({
      id: tryOnId,
      status: 'completed',
      productId,
      customerPhotoUrl: finalCustomerPhotoUrl,
      resultImageUrl,
      inferenceTime: parseFloat(inferenceSeconds),
      product: {
        ...product,
        available: Boolean(product.available),
        sizes: JSON.parse(product.sizes || '[]'),
        tags: JSON.parse(product.tags || '[]'),
      },
      createdAt: nowIso,
    });
  } catch (err) {
    console.error('[TryOn] Unexpected exception:', err);
    res.status(500).json({ error: 'Virtual try-on processing failed', details: err.message });
  }
});

app.get('/api/try-ons/:id', (req, res) => {
  try {
    const tryon = db.prepare('SELECT * FROM tryons WHERE id = ?').get(req.params.id);
    if (!tryon) {
      return res.status(404).json({ error: 'Try-on result not found' });
    }
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(tryon.productId);
    res.json({
      ...tryon,
      product: product ? {
        ...product,
        available: Boolean(product.available),
        sizes: JSON.parse(product.sizes || '[]'),
        tags: JSON.parse(product.tags || '[]'),
      } : null,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch try-on result', details: err.message });
  }
});

/* ----------------- Recommendations Routes ----------------- */

app.get('/api/products/:id/similar', (req, res) => {
  try {
    const current = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!current) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const currentTags = JSON.parse(current.tags || '[]');
    const currentColour = current.colour.toLowerCase();

    // Query other active products
    const candidates = db.prepare('SELECT * FROM products WHERE id != ? AND available = 1').all(req.params.id);

    const scored = candidates.map((p) => {
      let score = 0;
      const reasons = [];
      const pTags = JSON.parse(p.tags || '[]');
      const pColour = p.colour.toLowerCase();

      // Same model category
      if (p.modelCategory === current.modelCategory) {
        score += 30;
        reasons.push(`Same ${p.displayCategory || p.modelCategory} category`);
      }

      // Same colour or complementary
      if (pColour === currentColour) {
        score += 25;
        reasons.push(`Matching ${p.colour} shade`);
      }

      // Shared tags
      const commonTags = pTags.filter((t) => currentTags.includes(t));
      if (commonTags.length > 0) {
        score += commonTags.length * 10;
        reasons.push(`Matches style: ${commonTags.slice(0, 2).join(', ')}`);
      }

      // Price proximity (within 30%)
      const priceDiff = Math.abs(p.price - current.price) / current.price;
      if (priceDiff <= 0.35) {
        score += 15;
        reasons.push(`Similar price point (₹${p.price.toLocaleString('en-IN')})`);
      }

      return {
        ...p,
        available: Boolean(p.available),
        sizes: JSON.parse(p.sizes || '[]'),
        tags: pTags,
        score,
        reason: reasons[0] || `Popular in ${p.displayCategory}`,
        reasons,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    res.json(scored.slice(0, 4));
  } catch (err) {
    res.status(500).json({ error: 'Failed to get similar recommendations', details: err.message });
  }
});

app.post('/api/recommendations', (req, res) => {
  try {
    const { occasion, budget, colours = [], size, category } = req.body;
    let query = 'SELECT * FROM products WHERE available = 1';
    const params = [];

    if (category) {
      query += ' AND modelCategory = ?';
      params.push(category);
    }
    if (budget) {
      query += ' AND price <= ?';
      params.push(Number(budget));
    }

    const items = db.prepare(query).all(...params);

    const results = items.map((p) => {
      const pTags = JSON.parse(p.tags || '[]');
      const pSizes = JSON.parse(p.sizes || '[]');
      let score = 10;
      const reasons = [];

      if (budget && p.price <= budget) {
        reasons.push(`Within ₹${budget} budget`);
        score += 20;
      }

      if (colours.length > 0 && colours.some((c) => p.colour.toLowerCase().includes(c.toLowerCase()))) {
        reasons.push(`Matching preferred color`);
        score += 20;
      }

      if (occasion && pTags.some((t) => t.toLowerCase().includes(occasion.toLowerCase()))) {
        reasons.push(`Ideal for ${occasion}`);
        score += 25;
      }

      if (size && pSizes.includes(size)) {
        reasons.push(`Available in size ${size}`);
        score += 15;
      }

      return {
        ...p,
        available: Boolean(p.available),
        sizes: pSizes,
        tags: pTags,
        score,
        reason: reasons[0] || 'Curated store recommendation',
        reasons,
      };
    });

    results.sort((a, b) => b.score - a.score);
    res.json(results.slice(0, 6));
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate recommendations', details: err.message });
  }
});

/* ----------------- Session Cleanup Route ----------------- */

app.delete('/api/session', (req, res) => {
  try {
    // Delete temporary customer uploaded photos (keep demo-model.webp)
    const customerDir = path.join(UPLOADS_DIR, 'customers');
    if (fs.existsSync(customerDir)) {
      const files = fs.readdirSync(customerDir);
      for (const file of files) {
        if (file !== 'demo-model.webp') {
          try {
            fs.unlinkSync(path.join(customerDir, file));
          } catch (e) {
            console.warn('Could not unlink customer file:', file, e.message);
          }
        }
      }
    }

    // Delete generated try-on output images
    if (fs.existsSync(GENERATED_DIR)) {
      const genFiles = fs.readdirSync(GENERATED_DIR);
      for (const file of genFiles) {
        try {
          fs.unlinkSync(path.join(GENERATED_DIR, file));
        } catch (e) {
          console.warn('Could not unlink generated file:', file, e.message);
        }
      }
    }

    // Clear tryon records
    db.prepare('DELETE FROM tryons').run();

    console.log('[Session] Cleaned up temporary customer session files.');
    res.json({ success: true, message: 'Customer session and temporary files cleared.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear session', details: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MirrorFit AI Backend running at http://0.0.0.0:${PORT}`);
  console.log(`Connected to VTON service at: ${VTON_SERVICE_URL}`);
});
