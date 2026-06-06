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
  type VoyageMultimodalContentPart,
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

// API-compatible input for the Voyage multimodal embeddings endpoint.
// https://docs.voyageai.com/reference/multimodal-embeddings-api
type VoyageMultimodalInput = {
  content: VoyageMultimodalContentPart[];
};

export class MultimodalEmbeddingModel implements EmbeddingModelV3 {
  readonly specificationVersion = 'v3';
  readonly modelId: VoyageMultimodalEmbeddingModelId;

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
  ) {
    this.modelId = modelId;
    this.config = config;
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

    const multimodalContent = embeddingOptions?.content;

    if (
      multimodalContent != null &&
      multimodalContent.length !== values.length
    ) {
      throw new Error(
        `The number of multimodal content entries (${multimodalContent.length}) must match the number of values (${values.length}).`,
      );
    }

    // Merge each text value with its per-index content parts (images), the
    // same way the Google provider merges text with multimodal parts.
    // https://docs.voyageai.com/reference/multimodal-embeddings-api
    const inputs: VoyageMultimodalInput[] = values.map((value, index) => {
      const valueParts = multimodalContent?.[index];
      const textPart: VoyageMultimodalContentPart[] = value
        ? [{ type: 'text', text: value }]
        : [];
      return {
        content:
          valueParts != null
            ? [...textPart, ...valueParts]
            : [{ type: 'text', text: value }],
      };
    });

    const {
      responseHeaders,
      value: response,
      rawValue,
    } = await postJsonToApi({
      abortSignal,
      body: {
        inputs,
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
