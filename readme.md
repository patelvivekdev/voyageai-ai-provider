# AI SDK - Voyage AI Provider

<div align="center">
<a href="https://www.npmjs.com/package/voyage-ai-provider"><img src="https://img.shields.io/npm/v/voyage-ai-provider"/><a>
<a href="https://www.npmjs.com/package/voyage-ai-provider"><img src="https://img.shields.io/npm/dm/voyage-ai-provider"/><a>
<a href="https://github.com/patelvivekdev/voyageai-ai-provider/actions/workflows/CI.yml"><img src="https://github.com/patelvivekdev/voyageai-ai-provider/actions/workflows/CI.yml/badge.svg"/><a>
<a href="https://deepwiki.com/patelvivekdev/voyageai-ai-provider"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki"></a>
</div>
<br>

## Introduction

The Voyage AI Provider is a provider for the AI SDK. It provides a simple interface to the Voyage AI API.

## Installation

```bash
npm install voyage-ai-provider

# or

yarn add voyage-ai-provider

# or

pnpm add voyage-ai-provider

# or

bun add voyage-ai-provider
```

## Configuration

The Voyage AI Provider requires an API key to be configured. You can obtain an API key by signing up at [Voyage AI](https://www.voyageai.com).

add the following to your `.env` file:

```bash
VOYAGE_API_KEY=your-api-key
```

## Usage

### Text Embedding

```typescript
import { voyage } from 'voyage-ai-provider';
import { embedMany } from 'ai';

const embeddingModel = voyage.textEmbeddingModel('voyage-3-lite');

export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  // Generate chunks from the input value
  const chunks = value.split('\n');

  // Optional: You can also split the input value by comma
  // const chunks = value.split('.');

  // Or you can use LLM to generate chunks(summarize) from the input value

  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};
```

### How to pass additional settings to the model

The settings object should contain the settings you want to add to the model. You can find the available settings for the model in the Voyage API documentation: https://docs.voyageai.com/reference/embeddings-api

```typescript
const voyage = createVoyage({
  apiKey: process.env.VOYAGE_API_KEY,
});

// Initialize the embedding model
const embeddingModel = voyage.textEmbeddingModel(
  'voyage-3-lite',
  // adding settings
  {
    inputType: 'document',
    outputDimension: '1024', // the new model voyage-code-3, voyage-3-large has 4 different output dimensions: 256, 512, 1024 (default), 2048
    outputDtype: 'float',
  },
);
```

### Image Embedding

#### Example 1: Embed a single image as single embedding

```typescript
import { voyage, ImageEmbeddingInput } from 'voyage-ai-provider';
import { embedMany } from 'ai';

const imageModel = voyage.imageEmbeddingModel('voyage-multimodal-3');

const { embeddings } = await embedMany<ImageEmbeddingInput>({
  model: imageModel,
  values: [
    {
      image:
        'https://raw.githubusercontent.com/voyage-ai/voyage-multimodal-3/refs/heads/main/images/banana_200_x_200.jpg',
    },
    {
      image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...',
    },
  ],
  // or you can pass the array of images url and base64 string directly
  // values: [
  //   'https://raw.githubusercontent.com/voyage-ai/voyage-multimodal-3/refs/heads/main/images/banana_200_x_200.jpg',
  //   'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...',
  // ],
});
```

#### Example 2: Embed multiple images as single embedding

```typescript
import { voyage, ImageEmbeddingInput } from 'voyage-ai-provider';
import { embedMany } from 'ai';

const imageModel = voyage.imageEmbeddingModel('voyage-multimodal-3');

const { embeddings } = await embedMany<ImageEmbeddingInput>({
  model: imageModel,
  values: [
    {
      image: [
        'https://raw.githubusercontent.com/voyage-ai/voyage-multimodal-3/refs/heads/main/images/banana_200_x_200.jpg',
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...',
      ],
    },
  ],
});
```

#### Example 3: Embed multiple images as multiple embeddings

```typescript
import { voyage, ImageEmbeddingInput } from 'voyage-ai-provider';
import { embedMany } from 'ai';

const imageModel = voyage.imageEmbeddingModel('voyage-multimodal-3');

const { embeddings } = await embedMany<ImageEmbeddingInput>({
  model: imageModel,
  values: [
    {
      image:
        'https://raw.githubusercontent.com/voyage-ai/voyage-multimodal-3/refs/heads/main/images/banana_200_x_200.jpg',
    },
    {
      image: [
        'https://raw.githubusercontent.com/voyage-ai/voyage-multimodal-3/refs/heads/main/images/banana_200_x_200.jpg',
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...',
      ],
    },
  ],
});
```

> [!TIP]
> If you are getting error for image url not found, convert image to base64 and pass the base64 string to the image array.
> The value should be a Base64-encoded image in the data URL format data:[<mediatype>];base64,<data>.
> Currently supported mediatypes are: image/png, image/jpeg, image/webp, and image/gif.

### Multi-modal Embedding

#### Example 1: Embed multiple texts and images as single embedding

```typescript
import { voyage, MultimodalEmbeddingInput } from 'voyage-ai-provider';
import { embedMany } from 'ai';

const multimodalModel = voyage.multimodalEmbeddingModel('voyage-multimodal-3');

const { embeddings } = await embedMany<MultimodalEmbeddingInput>({
  model: multimodalModel,
  values: [
    {
      text: ['Hello, world!', 'This is a banana'],
      image: [
        'https://raw.githubusercontent.com/voyage-ai/voyage-multimodal-3/refs/heads/main/images/banana_200_x_200.jpg',
      ],
    },
    {
      text: ['Hello, coders!', 'This is a coding test'],
      image: ['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...'],
    },
  ],
});
```

> [!NOTE]
> The following constraints apply to the values list:
> The list must not contain more than 1,000 values.
> Each image must not contain more than 16 million pixels or be larger than 20 MB in size.
> With every 560 pixels of an image being counted as a token, each input in the list must not exceed 32,000 tokens, and the total number of tokens across all inputs must not exceed 320,000.

## Voyage embedding models:

| Model                 | Context Length (tokens) | Embedding Dimension            |
| --------------------- | ----------------------- | ------------------------------ |
| voyage-3.5            | 32,000                  | 1024 (default), 256, 512 2048  |
| voyage-3.5-lite       | 32,000                  | 1024 (default), 256, 512 2048  |
| voyage-3-large        | 32,000                  | 1024 (default), 256, 512, 2048 |
| voyage-3              | 32,000                  | 1024                           |
| voyage-3-lite         | 32,000                  | 512                            |
| voyage-code-3         | 32,000                  | 1024 (default), 256, 512, 2048 |
| voyage-finance-2      | 32,000                  | 1024                           |
| voyage-multilingual-2 | 32,000                  | 1024                           |
| voyage-law-2          | 16,000                  | 1024                           |
| voyage-code-2         | 16,000                  | 1536                           |

> [!WARNING]
> The older models are deprecated and will be removed in the future.
> Use the latest models instead.
> https://docs.voyageai.com/docs/embeddings

## Multi-modal Embedding

| Model               | Context Length (tokens) | Embedding Dimension |
| ------------------- | ----------------------- | ------------------- |
| voyage-multimodal-3 | 32,000                  | 1024                |

## Authors

- [patelvivekdev](https://patelvivek.dev)
