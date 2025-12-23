import {
  type EmbeddingModelV3,
  TooManyEmbeddingValuesForCallError,
} from '@ai-sdk/provider';
import {
  combineHeaders,
  createJsonResponseHandler,
  type FetchFunction,
  parseProviderOptions,
  postJsonToApi,
} from '@ai-sdk/provider-utils';

import {
  voyageMultimodalEmbeddingOptions,
  type VoyageMultimodalEmbeddingModelId,
} from '@/voyage-multimodal-embedding-settings';
import { voyageFailedResponseHandler } from '@/voyage-error';
import { z } from 'zod/v4';

type VoyageEmbeddingConfig = {
  baseURL: string;
  fetch?: FetchFunction;
  headers: () => Record<string, string | undefined>;
  provider: string;
};

// Basic input types

// URL or base64 image
export type ImageInput = string;

// Text
export type TextInput = string;

// Core content structure that mirrors the API
export type ContentItem =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: string }
  | { type: 'image_base64'; image_base64: string };

// For batching multiple content items into a single embedding
export type MultimodalContent = {
  text?: TextInput[];
  image?: ImageInput[];
};

// Text embedding model inputs
export type TextEmbeddingInput =
  | TextInput // Single text
  | TextInput[] // Multiple texts as one embedding
  | { text: TextInput | TextInput[] }; // Alternative format (single or multiple texts)

// Image embedding model inputs
export type ImageEmbeddingInput =
  | ImageInput // Single image
  | ImageInput[] // Multiple images as one embedding
  | { image: ImageInput | ImageInput[] }; // Alternative format (single or multiple images)

// Multimodal embedding model inputs
export type MultimodalEmbeddingInput =
  | TextInput // Single text
  | ImageInput // Single image
  | TextInput[] // Multiple texts as one embedding
  | ImageInput[] // Multiple images as one embedding
  | MultimodalContent // Mixed content with explicit structure
  | { text: TextInput | TextInput[] } // Alternative format (single or multiple texts)
  | { image: ImageInput | ImageInput[] } // Alternative format (single or multiple images)
  | { content: ContentItem[] }; // Pre-formatted content items

// API-compatible types for Voyage multimodal embeddings
export type VoyageMultimodalContentItem =
  | {
      type: 'text';
      text: string;
    }
  | {
      type: 'image_url';
      image_url: string;
    }
  | {
      type: 'image_base64';
      image_base64: string;
    };

export type VoyageMultimodalInput = {
  content: VoyageMultimodalContentItem[];
};

export class MultimodalEmbeddingModel implements EmbeddingModelV3 {
  readonly specificationVersion = 'v3';
  readonly modelId: VoyageMultimodalEmbeddingModelId;
  readonly modelType: 'multimodal' | 'image';

  private readonly config: VoyageEmbeddingConfig;

  get provider(): string {
    return this.config.provider;
  }

  get maxEmbeddingsPerCall(): number {
    return 128;
  }

  get supportsParallelCalls(): boolean {
    return false;
  }

  constructor(
    modelId: VoyageMultimodalEmbeddingModelId,
    config: VoyageEmbeddingConfig,
    modelType: 'multimodal' | 'image',
  ) {
    this.modelId = modelId;
    this.config = config;
    this.modelType = modelType;
  }

  private transformInputs(values: string[]): VoyageMultimodalInput[] {
    return values.map((value) => this.transformSingleInput(value));
  }

  private transformSingleInput(value: string): VoyageMultimodalInput {
    // Try to parse as JSON first (for complex types serialized as strings)
    let parsedValue: unknown = value;
    try {
      parsedValue = JSON.parse(value);
    } catch {
      // Not JSON, treat as plain string
    }

    // Handle string inputs (plain strings or after JSON parsing)
    if (typeof parsedValue === 'string') {
      if (this.modelType === 'image') {
        // For image model, treat strings as image URLs or base64
        return this.createImageContent(parsedValue);
      }
      // For multimodal model, treat strings as text unless they look like images
      if (this.isImageString(parsedValue)) {
        return this.createImageContent(parsedValue);
      }
      return this.createTextContent(parsedValue);
    }

    // Handle array inputs
    if (Array.isArray(parsedValue)) {
      return this.transformArrayInput(parsedValue);
    }

    // Handle object inputs
    const input = parsedValue as Record<string, unknown>;

    // Handle pre-formatted content items { content: ContentItem[] }
    if (input.content && Array.isArray(input.content)) {
      return this.transformContentArray(input.content);
    }

    // Handle MultimodalContent format { text?: string[], image?: string[] }
    if (input.text || input.image) {
      return this.transformMultimodalContent(input);
    }

    // Fallback: treat as text if it's a primitive value (only for multimodal)
    if (this.modelType === 'multimodal') {
      return this.createTextContent(String(parsedValue));
    }

    throw new Error(
      `Unsupported input format for ${this.modelType} model: ${JSON.stringify(parsedValue)}`,
    );
  }

  private transformArrayInput(array: unknown[]): VoyageMultimodalInput {
    const contentItems: VoyageMultimodalContentItem[] = [];

    for (const item of array) {
      if (typeof item === 'string') {
        if (this.isImageString(item)) {
          contentItems.push(this.createImageContentItem(item));
        } else {
          if (this.modelType === 'image') {
            throw new Error(
              'Text content not supported in image embedding model',
            );
          }
          contentItems.push({ type: 'text', text: item });
        }
      } else {
        throw new Error('Array items must be strings');
      }
    }

    return { content: contentItems };
  }

  private transformContentArray(content: unknown[]): VoyageMultimodalInput {
    const contentItems: VoyageMultimodalContentItem[] = [];

    for (const item of content) {
      const contentItem = item as Record<string, unknown>;

      // Handle pre-formatted API items
      if (
        contentItem.type &&
        (contentItem.text || contentItem.image_url || contentItem.image_base64)
      ) {
        contentItems.push(contentItem as VoyageMultimodalContentItem);
        continue;
      }

      // Handle legacy format with text and image arrays
      if (contentItem.text && Array.isArray(contentItem.text)) {
        if (this.modelType === 'image') {
          throw new Error(
            'Text content not supported in image embedding model',
          );
        }
        for (const textItem of contentItem.text) {
          contentItems.push({ type: 'text', text: String(textItem) });
        }
      }

      if (contentItem.image && Array.isArray(contentItem.image)) {
        for (const imageItem of contentItem.image) {
          const imageStr = String(imageItem);
          contentItems.push(this.createImageContentItem(imageStr));
        }
      }

      // Handle individual properties
      if (typeof contentItem.text === 'string') {
        if (this.modelType === 'image') {
          throw new Error(
            'Text content not supported in image embedding model',
          );
        }
        contentItems.push({ type: 'text', text: contentItem.text });
      }

      if (typeof contentItem.image === 'string') {
        contentItems.push(this.createImageContentItem(contentItem.image));
      }
    }

    return { content: contentItems };
  }

  private transformMultimodalContent(
    input: Record<string, unknown>,
  ): VoyageMultimodalInput {
    const contentItems: VoyageMultimodalContentItem[] = [];

    // Handle text array or single text
    if (input.text !== undefined) {
      if (this.modelType === 'image') {
        throw new Error('Text content not supported in image embedding model');
      }

      if (Array.isArray(input.text)) {
        for (const textItem of input.text) {
          contentItems.push({ type: 'text', text: String(textItem) });
        }
      } else if (typeof input.text === 'string') {
        contentItems.push({ type: 'text', text: input.text });
      }
    }

    // Handle image array or single image
    if (input.image !== undefined) {
      if (Array.isArray(input.image)) {
        for (const imageItem of input.image) {
          const imageStr = String(imageItem);
          contentItems.push(this.createImageContentItem(imageStr));
        }
      } else if (typeof input.image === 'string') {
        contentItems.push(this.createImageContentItem(input.image));
      }
    }

    return { content: contentItems };
  }

  private createTextContent(text: string): VoyageMultimodalInput {
    return {
      content: [{ type: 'text', text }],
    };
  }

  private createImageContent(image: string): VoyageMultimodalInput {
    return {
      content: [this.createImageContentItem(image)],
    };
  }

  private createImageContentItem(image: string): VoyageMultimodalContentItem {
    return this.isBase64Image(image)
      ? { type: 'image_base64', image_base64: image }
      : { type: 'image_url', image_url: image };
  }

  private isImageString(str: string): boolean {
    return this.isBase64Image(str) || this.isImageUrl(str);
  }

  private isImageUrl(str: string): boolean {
    try {
      const url = new URL(str);
      return /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(url.pathname);
    } catch {
      return false;
    }
  }

  private isBase64Image(image: string): boolean {
    return image.startsWith('data:image/') && image.includes(';base64,');
  }

  async doEmbed({
    abortSignal,
    values,
    headers,
    providerOptions,
  }: Parameters<EmbeddingModelV3['doEmbed']>[0]): Promise<
    Awaited<ReturnType<EmbeddingModelV3['doEmbed']>>
  > {
    const embeddingOptions = await parseProviderOptions({
      provider: 'voyage',
      providerOptions,
      schema: voyageMultimodalEmbeddingOptions,
    });
    if (values.length > this.maxEmbeddingsPerCall) {
      throw new TooManyEmbeddingValuesForCallError({
        maxEmbeddingsPerCall: this.maxEmbeddingsPerCall,
        modelId: this.modelId,
        provider: this.provider,
        values,
      });
    }
    // Transform the user input to the expected format for API
    // https://docs.voyageai.com/reference/multimodal-embeddings-api
    const transformedInputs = this.transformInputs(values);

    const {
      responseHeaders,
      value: response,
      rawValue,
    } = await postJsonToApi({
      abortSignal,
      body: {
        inputs: transformedInputs,
        model: this.modelId,
        input_type: embeddingOptions?.inputType,
        truncation: embeddingOptions?.truncation,
        output_encoding: embeddingOptions?.outputEncoding,
      },
      failedResponseHandler: voyageFailedResponseHandler,
      fetch: this.config.fetch,
      headers: combineHeaders(this.config.headers(), headers),
      successfulResponseHandler: createJsonResponseHandler(
        voyageMultimodalEmbeddingResponseSchema,
      ),
      url: `${this.config.baseURL}/multimodalembeddings`,
    });

    return {
      embeddings: response.data.map((item) => item.embedding),
      usage: response.usage
        ? { tokens: response.usage.total_tokens }
        : undefined,
      response: { headers: responseHeaders, body: rawValue },
      warnings: [],
    };
  }
}

const voyageMultimodalEmbeddingResponseSchema = z.object({
  data: z.array(
    z.object({
      object: z.literal('embedding'),
      embedding: z.array(z.number()),
      index: z.number(),
    }),
  ),
  usage: z.object({
    text_tokens: z.number().nullish(),
    image_pixels: z.number().nullish(),
    total_tokens: z.number(),
  }),
  model: z.string(),
});
