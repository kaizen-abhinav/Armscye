import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace('sqlite:///', '')
  : path.join(__dirname, '../data/mirrorfit.db');

const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      modelCategory TEXT NOT NULL CHECK(modelCategory IN ('tops', 'bottoms', 'one-pieces')),
      displayCategory TEXT NOT NULL,
      price REAL NOT NULL,
      colour TEXT NOT NULL,
      sizes TEXT NOT NULL,
      tags TEXT NOT NULL,
      imageUrl TEXT NOT NULL,
      garmentPhotoType TEXT NOT NULL CHECK(garmentPhotoType IN ('flat-lay', 'model')),
      available INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tryons (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      customerPhotoUrl TEXT NOT NULL,
      resultImageUrl TEXT,
      status TEXT NOT NULL,
      inferenceTime REAL,
      errorMessage TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  const countRow = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (countRow.count === 0) {
    seedInitialProducts();
  }
}

function seedInitialProducts() {
  const insert = db.prepare(`
    INSERT INTO products (
      id, name, modelCategory, displayCategory, price, colour, sizes, tags, imageUrl, garmentPhotoType, available, createdAt, updatedAt
    ) VALUES (
      @id, @name, @modelCategory, @displayCategory, @price, @colour, @sizes, @tags, @imageUrl, @garmentPhotoType, @available, @createdAt, @updatedAt
    )
  `);

  const now = new Date().toISOString();

  const seedData = [
    {
      id: 'prod-001',
      name: 'Emerald Heritage Silk Kurta',
      modelCategory: 'tops',
      displayCategory: 'Kurta',
      price: 1899,
      colour: 'Green',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      tags: JSON.stringify(['festive', 'silk', 'royal', 'wedding']),
      imageUrl: '/uploads/products/emerald-kurta.webp',
      garmentPhotoType: 'flat-lay',
      available: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-002',
      name: 'Saffron Handloom Cotton Kurta',
      modelCategory: 'tops',
      displayCategory: 'Kurta',
      price: 1299,
      colour: 'Yellow',
      sizes: JSON.stringify(['M', 'L', 'XL', 'XXL']),
      tags: JSON.stringify(['cotton', 'summer', 'casual', 'ethnic']),
      imageUrl: '/uploads/products/saffron-kurta.webp',
      garmentPhotoType: 'flat-lay',
      available: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-003',
      name: 'Midnight Regal Blue Kurta',
      modelCategory: 'tops',
      displayCategory: 'Kurta',
      price: 2499,
      colour: 'Blue',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      tags: JSON.stringify(['festive', 'embroidered', 'evening', 'party']),
      imageUrl: '/uploads/products/midnight-kurta.webp',
      garmentPhotoType: 'flat-lay',
      available: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-004',
      name: 'Maroon Jacquard Nehru Jacket',
      modelCategory: 'tops',
      displayCategory: 'Nehru Jacket',
      price: 2199,
      colour: 'Red',
      sizes: JSON.stringify(['38', '40', '42', '44']),
      tags: JSON.stringify(['festive', 'jacket', 'traditional', 'wedding']),
      imageUrl: '/uploads/products/maroon-jacket.webp',
      garmentPhotoType: 'flat-lay',
      available: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-005',
      name: 'Ivory Mandarin Collar Linen Shirt',
      modelCategory: 'tops',
      displayCategory: 'Shirt',
      price: 1599,
      colour: 'White',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      tags: JSON.stringify(['formal', 'linen', 'smart-casual', 'summer']),
      imageUrl: '/uploads/products/ivory-shirt.webp',
      garmentPhotoType: 'flat-lay',
      available: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-006',
      name: 'Official FASHN Textured Knit Top',
      modelCategory: 'tops',
      displayCategory: 'Knitwear',
      price: 1399,
      colour: 'Cream',
      sizes: JSON.stringify(['S', 'M', 'L']),
      tags: JSON.stringify(['casual', 'knit', 'modern', 'sample']),
      imageUrl: '/uploads/products/fashn-sample-top.webp',
      garmentPhotoType: 'flat-lay',
      available: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-007',
      name: 'Charcoal Slim-Fit Chino Trousers',
      modelCategory: 'bottoms',
      displayCategory: 'Trousers',
      price: 1799,
      colour: 'Grey',
      sizes: JSON.stringify(['30', '32', '34', '36']),
      tags: JSON.stringify(['formal', 'office', 'stretch', 'versatile']),
      imageUrl: '/uploads/products/charcoal-trousers.webp',
      garmentPhotoType: 'flat-lay',
      available: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-008',
      name: 'Beige Pure Linen Casual Pants',
      modelCategory: 'bottoms',
      displayCategory: 'Pants',
      price: 1499,
      colour: 'Beige',
      sizes: JSON.stringify(['30', '32', '34', '36']),
      tags: JSON.stringify(['casual', 'summer', 'breathable', 'relaxed']),
      imageUrl: '/uploads/products/beige-linen-pants.webp',
      garmentPhotoType: 'flat-lay',
      available: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-009',
      name: 'Deep Indigo Selvedge Denim Jeans',
      modelCategory: 'bottoms',
      displayCategory: 'Jeans',
      price: 1999,
      colour: 'Blue',
      sizes: JSON.stringify(['30', '32', '34', '36']),
      tags: JSON.stringify(['casual', 'denim', 'rugged', 'classic']),
      imageUrl: '/uploads/products/indigo-denim.webp',
      garmentPhotoType: 'flat-lay',
      available: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-010',
      name: 'Crimson Anarkali Gown with Zari Trim',
      modelCategory: 'one-pieces',
      displayCategory: 'Anarkali Dress',
      price: 3499,
      colour: 'Red',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      tags: JSON.stringify(['festive', 'wedding', 'party', 'gold-trim']),
      imageUrl: '/uploads/products/crimson-anarkali.webp',
      garmentPhotoType: 'flat-lay',
      available: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-011',
      name: 'Olive Indo-Western Fusion Jumpsuit',
      modelCategory: 'one-pieces',
      displayCategory: 'Jumpsuit',
      price: 2899,
      colour: 'Green',
      sizes: JSON.stringify(['S', 'M', 'L']),
      tags: JSON.stringify(['modern', 'fusion', 'evening', 'party']),
      imageUrl: '/uploads/products/olive-jumpsuit.webp',
      garmentPhotoType: 'flat-lay',
      available: 1,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const insertMany = db.transaction((items) => {
    for (const item of items) insert.run(item);
  });

  insertMany(seedData);
  console.log(`Seeded ${seedData.length} initial products into catalogue database.`);
}
