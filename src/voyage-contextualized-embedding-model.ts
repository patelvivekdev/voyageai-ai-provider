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
import { z } from 'zod/v4';

import {
  voyageContextualizedEmbeddingOptions,
  type VoyageContextualizedEmbeddingModelId,
} from '@/voyage-contextualized-embedding-settings';
import { voyageFailedResponseHandler } from '@/voyage-error';

type VoyageContextualizedEmbeddingConfig = {
  provider: string;
  baseURL: string;
  headers: () => Record<string, string | undefined>;
  fetch?: FetchFunction;
};

export class VoyageContextualizedEmbeddingModel implements EmbeddingModelV3 {
  readonly specificationVersion = 'v3';
  readonly modelId: VoyageContextualizedEmbeddingModelId;

  private readonly config: VoyageContextualizedEmbeddingConfig;

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
    modelId: VoyageContextualizedEmbeddingModelId,
    config: VoyageContextualizedEmbeddingConfig,
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
      schema: voyageContextualizedEmbeddingOptions,
    });

    if (values.length > this.maxEmbeddingsPerCall) {
      throw new TooManyEmbeddingValuesForCallError({
        maxEmbeddingsPerCall: this.maxEmbeddingsPerCall,
        modelId: this.modelId,
        provider: this.provider,
        values,
      });
    }

    const {
      responseHeaders,
      value: response,
      rawValue,
    } = await postJsonToApi({
      abortSignal,
      body: {
        inputs: [values],
        model: this.modelId,
        input_type: embeddingOptions?.inputType,
        output_dimension: embeddingOptions?.outputDimension,
        output_dtype: embeddingOptions?.outputDtype,
      },
      failedResponseHandler: voyageFailedResponseHandler,
      fetch: this.config.fetch,
      headers: combineHeaders(this.config.headers(), headers),
      successfulResponseHandler: createJsonResponseHandler(
        voyageContextualizedTextEmbeddingResponseSchema,
      ),
      url: `${this.config.baseURL}/contextualizedembeddings`,
    });

    return {
      embeddings: response.data[0]?.data.map((item) => item.embedding) || [],
      usage: response.usage
        ? { tokens: response.usage.total_tokens }
        : undefined,
      response: { headers: responseHeaders, body: rawValue },
      warnings: [],
    };
  }
}

// minimal version of the schema, focussed on what is needed for the implementation
// this approach limits breakages when the API changes and increases efficiency
const voyageContextualizedTextEmbeddingResponseSchema = z.object({
  data: z.array(
    z.object({ data: z.array(z.object({ embedding: z.array(z.number()) })) }),
  ),
  usage: z.object({ total_tokens: z.number() }).nullish(),
});
