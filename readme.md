# AI SDK - Voyage AI Provider

<div align="center">
<a href="https://www.npmjs.com/package/voyage-ai-provider"><img src="https://img.shields.io/npm/v/voyage-ai-provider"/><a>
<a href="https://www.npmjs.com/package/voyage-ai-provider"><img src="https://img.shields.io/npm/dm/voyage-ai-provider"/><a>
<a href="https://github.com/patelvivekdev/voyageai-ai-provider/actions/workflows/CI.yml"><img src="https://github.com/patelvivekdev/voyageai-ai-provider/actions/workflows/CI.yml/badge.svg"/><a>
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

The Voyage AI Provider requires an API key to be configured. You can obtain an API key by signing up at [Voyage](https://voyageai.com).

add the following to your `.env` file:

```bash
VOYAGE_API_KEY=your-api-key
```

## Usage

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

## Authors

- [patelvivekdev](https://patelvivek.dev)
