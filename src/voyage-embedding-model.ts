import {
  type EmbeddingModelV2,
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
  voyageEmbeddingOptions,
  type VoyageEmbeddingModelId,
} from '@/voyage-embedding-settings';
import { voyageFailedResponseHandler } from '@/voyage-error';

type VoyageEmbeddingConfig = {
  provider: string;
  baseURL: string;
  headers: () => Record<string, string | undefined>;
  fetch?: FetchFunction;
};

export class VoyageEmbeddingModel implements EmbeddingModelV2<string> {
  readonly specificationVersion = 'v2';
  readonly modelId: VoyageEmbeddingModelId;

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

  constructor(modelId: VoyageEmbeddingModelId, config: VoyageEmbeddingConfig) {
    this.modelId = modelId;
    this.config = config;
  }

  async doEmbed({
    abortSignal,
    values,
    headers,
    providerOptions,
  }: Parameters<EmbeddingModelV2<string>['doEmbed']>[0]): Promise<
    Awaited<ReturnType<EmbeddingModelV2<string>['doEmbed']>>
  > {
    const embeddingOptions = await parseProviderOptions({
      provider: 'voyage',
      providerOptions,
      schema: voyageEmbeddingOptions,
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
        input: values,
        model: this.modelId,
        input_type: embeddingOptions?.inputType,
        truncation: embeddingOptions?.truncation,
        output_dimension: embeddingOptions?.outputDimension,
        output_dtype: embeddingOptions?.outputDtype,
      },
      failedResponseHandler: voyageFailedResponseHandler,
      fetch: this.config.fetch,
      headers: combineHeaders(this.config.headers(), headers),
      successfulResponseHandler: createJsonResponseHandler(
        voyageTextEmbeddingResponseSchema,
      ),
      url: `${this.config.baseURL}/embeddings`,
    });

    return {
      embeddings: response.data.map((item) => item.embedding),
      usage: response.usage
        ? { tokens: response.usage.total_tokens }
        : undefined,
      response: { headers: responseHeaders, body: rawValue },
    };
  }
}

// minimal version of the schema, focussed on what is needed for the implementation
// this approach limits breakages when the API changes and increases efficiency
const voyageTextEmbeddingResponseSchema = z.object({
  data: z.array(z.object({ embedding: z.array(z.number()) })),
  usage: z.object({ total_tokens: z.number() }).nullish(),
});
