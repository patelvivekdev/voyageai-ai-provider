# Voyage AI Embedding Examples

This directory contains comprehensive examples for all three types of embedding models provided by the Voyage AI provider:

- **Text Embeddings**: Traditional text-only embedding model
- **Image Embeddings**: Image-only embedding model
- **Multimodal Embeddings**: Combined text and image embedding model

## 📁 File Structure

```
example/
├── README.md                      # This file
├── text-embedding.ts              # Text embedding examples
├── image-embedding.ts             # Image embedding examples
└── multimodal-embedding.ts        # Multimodal embedding examples
```

## 🚀 Quick Start

### Prerequisites

1. Install dependencies:

```bash
bun install
```

2. Set up your API key:

```bash
export VOYAGE_API_KEY="your-api-key-here"
```

### Running Examples

```bash
# Text embeddings only
bun run text-embedding.ts

# Image embeddings only
bun run image-embedding.ts

# Multimodal embeddings only
bun run multimodal-embedding.ts
```

## 📝 Text Embeddings

**File**: `text-embedding.ts`

### When to Use

- Processing only text content
- Building traditional text search systems
- Maximum text processing performance needed
- Working with existing text-only pipelines

### Example Patterns

```typescript
import { createVoyage } from '../src/voyage-provider';
import { embedMany } from 'ai';

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
await embedMany({
  model: multimodalModel,
  values: ['Single text description'],
});

// Multiple texts as one embedding
await embedMany({
  model: multimodalModel,
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
await embedMany({
  model: multimodalModel,
  values: [
    {
      text: ['Structured product information', 'With multiple text components'],
    },
  ],
});
```

## 📸 Image Embeddings

**File**: `image-embedding.ts`

### When to Use

- Processing only image content
- Building visual search systems
- Product image similarity matching
- Content-based image recommendations

### Example Patterns

```typescript
const imageModel = voyage.imageEmbeddingModel('voyage-multimodal-3');

// Single images
await embedMany({
  model: imageModel,
  values: [
    'https://example.com/product1.jpg',
    'https://example.com/product2.jpg',
  ],
});

// Multiple images as one embedding (product views)
await embedMany({
  model: imageModel,
  values: [
    [
      'https://example.com/product-front.jpg',
      'https://example.com/product-side.jpg',
      'https://example.com/product-back.jpg',
    ],
  ],
});

// Object format
await embedMany({
  model: imageModel,
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
await embedMany({
  model: imageModel,
  values: ['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...'],
});
```

## 🔀 Multimodal Embeddings

**File**: `multimodal-embedding.ts`

### When to Use

- Need to combine text and images
- Building comprehensive search systems
- Processing rich media content
- Want maximum flexibility and future-proofing

### Example Patterns

```typescript
const multimodalModel = voyage.multimodalEmbeddingModel('voyage-multimodal-3');

// Simple text + image pairs
await embedMany({
  model: multimodalModel,
  values: [
    {
      text: ['Premium wireless headphones'],
      image: ['https://example.com/headphones.jpg'],
    },
  ],
});

// Multiple texts with single image
await embedMany({
  model: multimodalModel,
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
await embedMany({
  model: multimodalModel,
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
await embedMany({
  model: multimodalModel,
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
await embedMany({
  model: multimodalModel,
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

## 🎯 Model Comparison

| Feature            | Text Model       | Image Model        | Multimodal Model |
| ------------------ | ---------------- | ------------------ | ---------------- |
| **Text Input**     | ✅ Optimized     | ❌ Not supported   | ✅ Supported     |
| **Image Input**    | ❌ Not supported | ✅ Optimized       | ✅ Supported     |
| **Combined Input** | ❌ Not supported | ❌ Not supported   | ✅ Optimized     |
| **Performance**    | Fastest for text | Fastest for images | Balanced         |
| **Flexibility**    | Text only        | Images only        | Maximum          |
| **Future-proof**   | Limited          | Limited            | High             |
