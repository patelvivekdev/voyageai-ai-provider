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

Version 5 targets AI SDK 7 and requires Node.js 22 or newer. It is distributed
as an ESM-only package.

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

const embeddingModel = voyage.embeddingModel('voyage-3-lite');

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
const embeddingModel = voyage.embeddingModel(
  'voyage-3-lite',
  // adding settings
  {
    inputType: 'document',
    outputDimension: '1024', // the new model voyage-code-3, voyage-3-large has 4 different output dimensions: 256, 512, 1024 (default), 2048
    outputDtype: 'float',
  },
);
```

### Image & Multi-modal Embedding

Multimodal and image embeddings both use the `voyage-multimodal-3` model and the
same `/multimodalembeddings` endpoint. Following the AI SDK convention (and the
official providers such as Google), the `embed`/`embedMany` `values` array holds
the **text** for each embedding, and any non-text content (images) is passed via
`providerOptions.voyage.content`.

`content` is an array aligned to `values` by index: `content[i]` are the extra
parts merged with the text in `values[i]`. Its length must equal `values.length`.
Use `null` for entries that are text-only. For an image-only embedding, pass an
empty string (`''`) for that value.

Each content part is one of:

- `{ type: 'text', text: string }`
- `{ type: 'image_url', image_url: string }`
- `{ type: 'image_base64', image_base64: string }`

#### Example 1: A single image per embedding (image-only)

```typescript
import {
  voyage,
  type VoyageMultimodalEmbeddingOptions,
} from 'voyage-ai-provider';
import { embedMany } from 'ai';

const imageModel = voyage.imageEmbeddingModel('voyage-multimodal-3');

const { embeddings } = await embedMany({
  model: imageModel,
  values: ['', ''], // one empty string per image-only embedding
  providerOptions: {
    voyage: {
      content: [
        [
          {
            type: 'image_url',
            image_url:
              'https://raw.githubusercontent.com/voyage-ai/voyage-multimodal-3/refs/heads/main/images/banana_200_x_200.jpg',
          },
        ],
        [
          {
            type: 'image_base64',
            image_base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...',
          },
        ],
      ],
    } satisfies VoyageMultimodalEmbeddingOptions,
  },
});
```

#### Example 2: Multiple images in a single embedding

```typescript
import {
  voyage,
  type VoyageMultimodalEmbeddingOptions,
} from 'voyage-ai-provider';
import { embedMany } from 'ai';

const imageModel = voyage.imageEmbeddingModel('voyage-multimodal-3');

const { embeddings } = await embedMany({
  model: imageModel,
  values: [''],
  providerOptions: {
    voyage: {
      content: [
        [
          {
            type: 'image_url',
            image_url:
              'https://raw.githubusercontent.com/voyage-ai/voyage-multimodal-3/refs/heads/main/images/banana_200_x_200.jpg',
          },
          {
            type: 'image_base64',
            image_base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...',
          },
        ],
      ],
    } satisfies VoyageMultimodalEmbeddingOptions,
  },
});
```

#### Example 3: Text and images combined per embedding

```typescript
import {
  voyage,
  type VoyageMultimodalEmbeddingOptions,
} from 'voyage-ai-provider';
import { embedMany } from 'ai';

const multimodalModel = voyage.multimodalEmbeddingModel('voyage-multimodal-3');

const { embeddings } = await embedMany({
  model: multimodalModel,
  values: ['This is a banana', 'This is a coding test'],
  providerOptions: {
    voyage: {
      content: [
        [
          {
            type: 'image_url',
            image_url:
              'https://raw.githubusercontent.com/voyage-ai/voyage-multimodal-3/refs/heads/main/images/banana_200_x_200.jpg',
          },
        ],
        [
          {
            type: 'image_base64',
            image_base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...',
          },
        ],
      ],
    } satisfies VoyageMultimodalEmbeddingOptions,
  },
});
```

> [!TIP]
> If you are getting an error for an image URL not found, convert the image to base64 and pass it as an `image_base64` part instead.
> The value should be a Base64-encoded image in the data URL format `data:[<mediatype>];base64,<data>`.
> Currently supported mediatypes are: image/png, image/jpeg, image/webp, and image/gif.

> [!NOTE]
> The following constraints apply to the values list:
> The list must not contain more than 1,000 values.
> Each image must not contain more than 16 million pixels or be larger than 20 MB in size.
> With every 560 pixels of an image being counted as a token, each input in the list must not exceed 32,000 tokens, and the total number of tokens across all inputs must not exceed 320,000.

## Voyage embedding models:

| Model                 | Context Length (tokens) | Embedding Dimension            |
| --------------------- | ----------------------- | ------------------------------ |
| voyage-4-large        | 32,000                  | 1024 (default), 256, 512, 2048 |
| voyage-4              | 32,000                  | 1024 (default), 256, 512, 2048 |
| voyage-4-lite         | 32,000                  | 1024 (default), 256, 512, 2048 |
| voyage-code-3         | 32,000                  | 1024 (default), 256, 512, 2048 |
| voyage-finance-2      | 32,000                  | 1024                           |
| voyage-law-2          | 16,000                  | 1024                           |
| voyage-code-2         | 16,000                  | 1536                           |
| voyage-3-large        | 32,000                  | 1024 (default), 256, 512, 2048 |
| voyage-3.5            | 32,000                  | 1024 (default), 256, 512, 2048 |
| voyage-3.5-lite       | 32,000                  | 1024 (default), 256, 512, 2048 |
| voyage-3              | 32,000                  | 1024                           |
| voyage-3-lite         | 32,000                  | 512                            |
| voyage-multilingual-2 | 32,000                  | 1024                           |

> [!WARNING]
> The older models are deprecated and will be removed in the future.
> Use the latest models instead.
> https://docs.voyageai.com/docs/embeddings

## Multi-modal Embedding Models

| Model                 | Context Length (tokens) | Embedding Dimension            |
| --------------------- | ----------------------- | ------------------------------ |
| voyage-multimodal-3.5 | 32,000                  | 1024 (default), 256, 512, 2048 |
| voyage-multimodal-3   | 32,000                  | 1024                           |

### Reranking

Reranking helps improve search results by reordering documents based on their relevance to a query.

```typescript
import { voyage } from 'voyage-ai-provider';
import { rerank } from 'ai';

const rerankingModel = voyage.reranking('rerank-2.5');

const result = await rerank({
  model: rerankingModel,
  query: 'talk about rain',
  documents: [
    'sunny day at the beach',
    'rainy day in the city',
    'snowy mountain peak',
  ],
  topN: 2,
});
```

#### How to pass additional settings to the reranking model

The settings object should contain the settings you want to add to the model. You can find the available settings for the model in the Voyage API documentation: https://docs.voyageai.com/reference/reranker-api

```typescript
import { voyage, type VoyageRerankingOptions } from 'voyage-ai-provider';
import { rerank } from 'ai';

const rerankingModel = voyage.reranking('rerank-2.5');

const result = await rerank({
  model: rerankingModel,
  query: 'talk about rain',
  documents: [
    'sunny day at the beach',
    'rainy day in the city',
    'snowy mountain peak',
  ],
  topN: 2,
  providerOptions: {
    voyage: {
      returnDocuments: true, // Return documents in the response
      truncation: true, // Truncate inputs to fit context length
    } satisfies VoyageRerankingOptions,
  },
});
```

> [!NOTE]
> The following constraints apply to reranking:
>
> - Query token limits: rerank-2.5 and rerank-2.5-lite (8,000), rerank-2 (4,000), rerank-2-lite and rerank-1 (2,000), rerank-lite-1 (1,000)
> - Query + document token limits: rerank-2.5 and rerank-2.5-lite (32,000), rerank-2 (16,000), rerank-2-lite and rerank-1 (8,000), rerank-lite-1 (4,000)
> - If `truncation` is set to `false`, an error will be raised when these limits are exceeded

## Voyage Reranking Models

| Model           | Query Token Limit | Query + Document Token Limit |
| --------------- | ----------------- | ---------------------------- |
| rerank-2.5      | 8,000             | 32,000                       |
| rerank-2.5-lite | 8,000             | 32,000                       |
| rerank-2        | 4,000             | 16,000                       |
| rerank-2-lite   | 2,000             | 8,000                        |
| rerank-1        | 2,000             | 8,000                        |
| rerank-lite-1   | 1,000             | 4,000                        |

> [!TIP]
> Use `rerank-2.5` or `rerank-2.5-lite` for the best performance and accuracy.
> Older models (rerank-2, rerank-2-lite, rerank-1, rerank-lite-1) are available but may have lower performance.
> https://docs.voyageai.com/docs/reranker

## Authors

- [patelvivekdev](https://patelvivek.dev)
