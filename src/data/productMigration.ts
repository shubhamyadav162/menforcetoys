import { products } from './products';
import { DatabaseProduct, ProductInsert, CategoryInsert } from '../types/database';
import { convertToDatabaseProduct } from '../types/product';

// Define initial categories for the NP Wellness
const initialCategories: CategoryInsert[] = [
  {
    name: {
      en: "Vibrators",
      hi: "वाइब्रेटर"
    },
    slug: "vibrators",
    description: {
      en: "Premium vibrating toys for enhanced pleasure",
      hi: "बढ़ी हुई प्लेजर के लिए प्रीमियम वाइब्रेटिंग टॉयज़"
    },
    sort_order: 1,
    is_active: true
  },
  {
    name: {
      en: "Dildos",
      hi: "डिल्डो"
    },
    slug: "dildos",
    description: {
      en: "Realistic and fantasy dildos in various sizes",
      hi: "विभिन्न आकारों में यथार्थवादी और काल्पनिक डिल्डो"
    },
    sort_order: 2,
    is_active: true
  },
  {
    name: {
      en: "Masturbators",
      hi: "मास्टरबेटर"
    },
    slug: "masturbators",
    description: {
      en: "Male pleasure devices and strokers",
      hi: "पुरुषों के प्लेजर डिवाइस और स्ट्रोकर"
    },
    sort_order: 3,
    is_active: true
  },
  {
    name: {
      en: "Lubricants",
      hi: "ल्यूब्रिकेंट"
    },
    slug: "lubricants",
    description: {
      en: "Water-based and silicone lubricants for smooth experience",
      hi: "चिकने अनुभव के लिए वॉटर-बेस्ड और सिलिकॉन ल्यूब्रिकेंट"
    },
    sort_order: 4,
    is_active: true
  },
  {
    name: {
      en: "Anal Toys",
      hi: "एनल टॉयज़"
    },
    slug: "anal-toys",
    description: {
      en: "Butt plugs, beads and anal training kits",
      hi: "बट प्लग, बीड्स और एनल ट्रेनिंग किट्स"
    },
    sort_order: 5,
    is_active: true
  },
  {
    name: {
      en: "Couples Toys",
      hi: "कपल्स टॉयज़"
    },
    slug: "couples-toys",
    description: {
      en: "Toys designed for couples to enjoy together",
      hi: "साथ में आनंद लेने के लिए डिज़ाइन किए गए कपल्स टॉयज़"
    },
    sort_order: 6,
    is_active: true
  },
  {
    name: {
      en: "Bondage & BDSM",
      hi: "बॉन्डेज और बीडीएसएम"
    },
    slug: "bondage-bdsm",
    description: {
      en: "Restraints, whips and BDSM accessories",
      hi: "रिस्ट्रेंट्स, व्हिप्स और बीडीएसएम एक्सेसरीज़"
    },
    sort_order: 7,
    is_active: true
  }
];

// Category mapping for existing products
const categoryMapping: { [key: string]: string } = {
  "stretchable-toy": "masturbators",
  "realistic-toy": "dildos",
  "vibrator": "vibrators",
  "lubricant": "lubricants"
};

// Convert existing products to database format
export const migrateProductsToDatabase = (): ProductInsert[] => {
  return products.map((product, index) => {
    const dbProduct = convertToDatabaseProduct(product);

    // Map to proper category
    const categorySlug = categoryMapping[product.id] || 'masturbators';

    return {
      category_id: categorySlug, // Will be resolved to actual category ID
      sku: `NP-${String(index + 1).padStart(3, '0')}-${product.id.toUpperCase()}`,
      name: dbProduct.name,
      description: dbProduct.description,
      short_description: dbProduct.short_description,
      price: dbProduct.price, // Already in paise
      compare_price: product.price === 499 ? 79900 : // ₹799 for ₹499 product
                   product.price === 999 ? 149900 :  // ₹1499 for ₹999 product
                   product.price === 1499 ? 199900 : // ₹1999 for ₹1499 product
                   product.price === 199 ? 29900 :   // ₹299 for ₹199 product
                   undefined,
      cost_price: Math.round(dbProduct.price * 0.4), // 40% of selling price
      weight: product.id === 'vibrator' ? 150 : // 150g for vibrator
              product.id === 'stretchable-toy' ? 200 : // 200g for stretchable toy
              product.id === 'realistic-toy' ? 300 : // 300g for realistic toy
              100, // 100g for lubricants
      materials: {
        en: product.specs,
        hi: product.specs
      },
      features: product.specs.map(spec => ({ name: spec, value: true })),
      tags: [categorySlug, 'adult-wellness', 'discreet-shipping'],
      status: 'active' as const,
      is_discreet: true, // All products are discreet
      requires_age_verification: true,
      view_count: 0,
      rating: 0,
      review_count: 0
    };
  });
};

// Generate product images data
export const generateProductImages = () => {
  return products.map((product, index) => ({
    product_id: product.id, // Will be mapped to actual UUID
    image_url: product.image,
    alt_text: {
      en: `${product.name.en} - NP Wellness Store`,
      hi: `${product.name.hi} - एनपी वेलनेस`
    },
    image_type: 'main' as const,
    sort_order: 1,
    is_active: true
  }));
};

// Generate inventory data
export const generateInventoryData = () => {
  return products.map((product) => ({
    product_id: product.id, // Will be mapped to actual UUID
    quantity: product.id === 'vibrator' ? 25 : // Popular vibrator
             product.id === 'stretchable-toy' ? 50 : // Popular stretchable toy
             product.id === 'realistic-toy' ? 30 : // Medium stock
             100, // High stock for lubricants
    reserved_quantity: 0,
    available_quantity: product.id === 'vibrator' ? 25 :
                        product.id === 'stretchable-toy' ? 50 :
                        product.id === 'realistic-toy' ? 30 :
                        100,
    reorder_level: 10,
    reorder_quantity: 50,
    cost_per_unit: Math.round(product.price * 0.4), // 40% of selling price
    location: 'Mumbai Warehouse',
    batch_number: `BATCH-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
  }));
};

// SQL migration script
export const generateMigrationSQL = (): string => {
  const categories = initialCategories.map((cat, index) => `(
    '${genUUID()}',
    '${JSON.stringify(cat.name).replace(/'/g, "''")}',
    '${cat.slug}',
    '${JSON.stringify(cat.description).replace(/'/g, "''")}',
    ${cat.sort_order},
    ${cat.is_active},
    NOW(),
    NOW()
  )`).join(',\n    ');

  const products = migrateProductsToDatabase().map((product, index) => `(
    '${genUUID()}',
    '${product.category_id}',
    '${product.sku}',
    '${JSON.stringify(product.name).replace(/'/g, "''")}',
    '${JSON.stringify(product.description).replace(/'/g, "''")}',
    '${JSON.stringify(product.short_description).replace(/'/g, "''")}',
    ${product.price},
    ${product.compare_price || 'NULL'},
    ${product.cost_price || 'NULL'},
    ${product.weight || 'NULL'},
    '${JSON.stringify(product.materials).replace(/'/g, "''")}',
    '${JSON.stringify(product.features).replace(/'/g, "''")}',
    ARRAY[${product.tags.map(tag => `'${tag}'`).join(', ')}],
    '${product.status}',
    ${product.is_discreet},
    ${product.requires_age_verification},
    ${product.view_count},
    ${product.rating},
    ${product.review_count},
    NOW(),
    NOW()
  )`).join(',\n    ');

  return `
-- NP Wellness Store - Product Migration SQL
-- Run this in your Supabase SQL Editor

-- Insert Categories
INSERT INTO categories (
  id, name, slug, description, sort_order, is_active, created_at, updated_at
) VALUES
    ${categories};

-- Insert Products
INSERT INTO products (
  id, category_id, sku, name, description, short_description,
  price, compare_price, cost_price, weight, materials, features,
  tags, status, is_discreet, requires_age_verification,
  view_count, rating, review_count, created_at, updated_at
) VALUES
    ${products};

-- Insert Product Images
INSERT INTO product_images (
  id, product_id, image_url, alt_text, image_type, sort_order, is_active, created_at
)
SELECT
  gen_random_uuid(),
  p.id,
  '${products[0]?.image_url || ''}', -- Update with actual image URLs
  '{"en": "Product Image", "hi": "उत्पाद छवि"}',
  'main',
  1,
  true,
  NOW()
FROM products p;

-- Insert Inventory Records
INSERT INTO inventory (
  id, product_id, quantity, reserved_quantity, available_quantity,
  reorder_level, reorder_quantity, location, last_stock_update, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  p.id,
  CASE
    WHEN p.sku LIKE '%VIBRATOR%' THEN 25
    WHEN p.sku LIKE '%STRETCHABLE%' THEN 50
    WHEN p.sku LIKE '%REALISTIC%' THEN 30
    ELSE 100
  END,
  0,
  CASE
    WHEN p.sku LIKE '%VIBRATOR%' THEN 25
    WHEN p.sku LIKE '%STRETCHABLE%' THEN 50
    WHEN p.sku LIKE '%REALISTIC%' THEN 30
    ELSE 100
  END,
  10,
  50,
  'Mumbai Warehouse',
  NOW(),
  NOW(),
  NOW()
FROM products p;

-- Verify Migration
SELECT
  'Categories' as table_name, COUNT(*) as record_count FROM categories
UNION ALL
SELECT
  'Products' as table_name, COUNT(*) as record_count FROM products
UNION ALL
SELECT
  'Product Images' as table_name, COUNT(*) as record_count FROM product_images
UNION ALL
SELECT
  'Inventory' as table_name, COUNT(*) as record_count FROM inventory;
`;
};

// Helper function to generate UUID (for migration script)
function genUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Export migration data
export const initialCategoriesData = initialCategories;
export const migratedProducts = migrateProductsToDatabase();
export const productImagesData = generateProductImages();
export const inventoryData = generateInventoryData();
export const migrationSQL = generateMigrationSQL();