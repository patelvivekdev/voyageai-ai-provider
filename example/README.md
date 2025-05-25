# Voyage AI Embedding Examples

This directory contains comprehensive examples for all three types of embedding models provided by the Voyage AI provider:

- **Text Embeddings**: Traditional text-only embedding model
- **Image Embeddings**: Image-only embedding model
- **Multimodal Embeddings**: Combined text and image embedding model

## 📁 File Structure

```
example/
├── README.md                      # This file
├── index.ts                       # Main demo comparing all models
├── text-embedding-examples.ts     # Text embedding examples
├── image-embedding-examples.ts    # Image embedding examples
└── multimodal-embedding-examples.ts # Multimodal embedding examples
```

## 🚀 Quick Start

### Prerequisites

1. Install dependencies:

```bash
npm install
```

2. Set up your API key:

```bash
export VOYAGE_API_KEY="your-api-key-here"
```

### Running Examples

#### Run All Examples (Recommended for first time)

```bash
npm run example
# or
npx tsx example/index.ts
```

#### Run Specific Example Files

```bash
# Text embeddings only
npx tsx example/text-embedding-examples.ts

# Image embeddings only
npx tsx example/image-embedding-examples.ts

# Multimodal embeddings only
npx tsx example/multimodal-embedding-examples.ts
```

## 📝 Text Embeddings

**File**: `text-embedding-examples.ts`

### When to Use

- Processing only text content
- Building traditional text search systems
- Maximum text processing performance needed
- Working with existing text-only pipelines

### Example Patterns

```typescript
import { createVoyage } from '../src/voyage-provider';

const voyage = createVoyage({ apiKey: process.env.VOYAGE_API_KEY });

// Regular text embedding model
const textModel = voyage.textEmbeddingModel('voyage-3');

// Simple text embeddings
await textModel.doEmbed({
  values: ['Product description text', 'Another product description'],
});

// Multimodal model for text (more flexible)
const multimodalModel = voyage.multimodalEmbeddingModel('voyage-multimodal-3');

// Single texts
await multimodalModel.doEmbed({
  values: ['Single text description'],
});

// Multiple texts as one embedding
await multimodalModel.doEmbed({
  values: [
    [
      'Product title',
      'Product description',
      'Product features',
      'Product benefits',
    ],
  ],
});

// Object format for clarity
await multimodalModel.doEmbed({
  values: [
    {
      text: ['Structured product information', 'With multiple text components'],
    },
  ],
});
```

### Real-World Use Cases

- E-commerce product descriptions
- Customer support knowledge base
- Content management systems
- Legal document processing
- Educational content

## 📸 Image Embeddings

**File**: `image-embedding-examples.ts`

### When to Use

- Processing only image content
- Building visual search systems
- Product image similarity matching
- Content-based image recommendations

### Example Patterns

```typescript
const imageModel = voyage.imageEmbeddingModel('voyage-multimodal-3');

// Single images
await imageModel.doEmbed({
  values: [
    'https://example.com/product1.jpg',
    'https://example.com/product2.jpg',
  ],
});

// Multiple images as one embedding (product views)
await imageModel.doEmbed({
  values: [
    [
      'https://example.com/product-front.jpg',
      'https://example.com/product-side.jpg',
      'https://example.com/product-back.jpg',
    ],
  ],
});

// Object format
await imageModel.doEmbed({
  values: [
    {
      image: [
        'https://example.com/gallery-1.jpg',
        'https://example.com/gallery-2.jpg',
      ],
    },
  ],
});

// Base64 images
await imageModel.doEmbed({
  values: ['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...'],
});
```

### Real-World Use Cases

- E-commerce product catalogs
- Real estate property photos
- Art and design portfolios
- Medical imaging
- Fashion and retail catalogs
- Food and recipe visualization

## 🔀 Multimodal Embeddings

**File**: `multimodal-embedding-examples.ts`

### When to Use

- Need to combine text and images
- Building comprehensive search systems
- Processing rich media content
- Want maximum flexibility and future-proofing

### Example Patterns

```typescript
const multimodalModel = voyage.multimodalEmbeddingModel('voyage-multimodal-3');

// Simple text + image pairs
await multimodalModel.doEmbed({
  values: [
    {
      text: ['Premium wireless headphones'],
      image: ['https://example.com/headphones.jpg'],
    },
  ],
});

// Multiple texts with single image
await multimodalModel.doEmbed({
  values: [
    {
      text: [
        'Product name',
        'Product description',
        'Key features',
        'Price and availability',
      ],
      image: ['https://example.com/product.jpg'],
    },
  ],
});

// Single text with multiple images
await multimodalModel.doEmbed({
  values: [
    {
      text: ['Complete apartment tour'],
      image: [
        'https://example.com/living-room.jpg',
        'https://example.com/kitchen.jpg',
        'https://example.com/bedroom.jpg',
      ],
    },
  ],
});

// Rich multimodal content
await multimodalModel.doEmbed({
  values: [
    {
      text: [
        'Tesla Model S Electric Vehicle',
        'Luxury electric sedan with autopilot',
        'Range: 405 miles, 0-60 mph in 3.1 seconds',
        'Starting at $94,990',
      ],
      image: [
        'https://example.com/tesla-exterior.jpg',
        'https://example.com/tesla-interior.jpg',
        'https://example.com/tesla-dashboard.jpg',
      ],
    },
  ],
});

// Mixed content types in one call
await multimodalModel.doEmbed({
  values: [
    'Text only content',
    'https://example.com/image-only.jpg',
    ['Multiple', 'texts', 'as', 'array'],
    {
      text: ['Structured content'],
      image: ['https://example.com/structured.jpg'],
    },
  ],
});
```

### Real-World Use Cases

- E-commerce product listings (text + images)
- Real estate listings (descriptions + photos)
- News articles (text + supporting images)
- Recipe content (instructions + photos)
- Educational materials (explanations + diagrams)
- Medical cases (notes + imaging)

## 🎯 Model Comparison

| Feature            | Text Model       | Image Model        | Multimodal Model |
| ------------------ | ---------------- | ------------------ | ---------------- |
| **Text Input**     | ✅ Optimized     | ❌ Not supported   | ✅ Supported     |
| **Image Input**    | ❌ Not supported | ✅ Optimized       | ✅ Supported     |
| **Combined Input** | ❌ Not supported | ❌ Not supported   | ✅ Optimized     |
| **Performance**    | Fastest for text | Fastest for images | Balanced         |
| **Flexibility**    | Text only        | Images only        | Maximum          |
| **Future-proof**   | Limited          | Limited            | High             |

## 🛠️ Advanced Patterns

### Batch Processing

```typescript
// Efficient batch processing
const batchValues = [
  'Text content 1',
  'https://example.com/image1.jpg',
  { text: ['Mixed 1'], image: ['https://example.com/mixed1.jpg'] },
  // ... more items
];

await multimodalModel.doEmbed({ values: batchValues });
```

### Error Handling

```typescript
try {
  await multimodalModel.doEmbed({ values: [...] });
} catch (error) {
  if (error.message.includes('Too many')) {
    // Handle batch size limit
  } else {
    // Handle other errors
  }
}
```

### Performance Optimization

```typescript
// Chunk large batches
const chunks = [];
for (let i = 0; i < largeArray.length; i += 100) {
  chunks.push(largeArray.slice(i, i + 100));
}

for (const chunk of chunks) {
  await model.doEmbed({ values: chunk });
}
```

## 🔄 Migration Guide

### From Text-Only to Multimodal

#### Step 1: Direct Replacement

```typescript
// Before
const textModel = voyage.textEmbeddingModel('voyage-3');
await textModel.doEmbed({ values: ['text'] });

// After (backward compatible)
const multimodalModel = voyage.multimodalEmbeddingModel('voyage-multimodal-3');
await multimodalModel.doEmbed({ values: ['text'] });
```

#### Step 2: Add Images

```typescript
// Enhanced with images
await multimodalModel.doEmbed({
  values: [
    {
      text: ['Product description'],
      image: ['https://example.com/product.jpg'],
    },
  ],
});
```

#### Step 3: Rich Content

```typescript
// Full multimodal content
await multimodalModel.doEmbed({
  values: [
    {
      text: [
        'Complete product information',
        'Detailed specifications',
        'Customer reviews',
      ],
      image: [
        'https://example.com/main-product.jpg',
        'https://example.com/product-details.jpg',
      ],
    },
  ],
});
```

## 📊 Performance Tips

1. **Choose the Right Model**:

   - Text model for text-only use cases
   - Image model for image-only use cases
   - Multimodal model for mixed or future-proof scenarios

2. **Batch Processing**:

   - Process multiple items in single calls
   - Respect rate limits and batch size limits
   - Monitor performance and adjust accordingly

3. **Content Optimization**:

   - Keep text descriptions focused and relevant
   - Use high-quality, representative images
   - Group related content together

4. **Error Handling**:
   - Implement retry logic for temporary failures
   - Handle batch size limits gracefully
   - Validate inputs before processing

## 🤝 Contributing

To add new examples:

1. Choose the appropriate file based on embedding type
2. Add your example with clear comments
3. Include real-world context and use cases
4. Test the example works correctly
5. Update this README if needed

## 📞 Support

For questions about these examples or the Voyage AI provider:

- Check the main README.md for general usage
- Review the test files for additional patterns
- Open an issue for bugs or feature requests
