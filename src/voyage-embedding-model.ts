import {
  EmbeddingModelV1,
  TooManyEmbeddingValuesForCallError,
} from '@ai-sdk/provider';
import {
  createJsonResponseHandler,
  postJsonToApi,
} from '@ai-sdk/provider-utils';
import { z } from 'zod';

import {
  VoyageEmbeddingModelId,
  VoyageEmbeddingSettings,
} from '@/voyage-embedding-settings';
import { voyageFailedResponseHandler } from '@/voyage-error';
import { encode } from 'punycode';

type VoyageEmbeddingConfig = {
  baseURL: string;
  fetch?: typeof fetch;
  headers: () => Record<string, string | undefined>;
  provider: string;
};

export class VoyageEmbeddingModel implements EmbeddingModelV1<string> {
  readonly specificationVersion = 'v1';
  readonly modelId: VoyageEmbeddingModelId;

  private readonly config: VoyageEmbeddingConfig;
  private readonly settings: VoyageEmbeddingSettings;

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
    modelId: VoyageEmbeddingModelId,
    settings: VoyageEmbeddingSettings,
    config: VoyageEmbeddingConfig,
  ) {
    this.modelId = modelId;
    this.settings = settings;
    this.config = config;
  }

  async doEmbed({
    abortSignal,
    values,
  }: Parameters<EmbeddingModelV1<string>['doEmbed']>[0]): Promise<
    Awaited<ReturnType<EmbeddingModelV1<string>['doEmbed']>>
  > {
    if (values.length > this.maxEmbeddingsPerCall) {
      throw new TooManyEmbeddingValuesForCallError({
        maxEmbeddingsPerCall: this.maxEmbeddingsPerCall,
        modelId: this.modelId,
        provider: this.provider,
        values,
      });
    }

    const { responseHeaders, value: response } = await postJsonToApi({
      abortSignal,
      body: {
        input: values,
        model: this.modelId,
        input_type: this.settings.inputType,
        encoding_format: this.settings.encodingFormat,
        truncation: this.settings.truncation,
      },
      failedResponseHandler: voyageFailedResponseHandler,
      fetch: this.config.fetch,
      headers: this.config.headers(),
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
      rawResponse: { headers: responseHeaders },
    };
  }
}

// minimal version of the schema, focussed on what is needed for the implementation
// this approach limits breakages when the API changes and increases efficiency
const voyageTextEmbeddingResponseSchema = z.object({
  data: z.array(z.object({ embedding: z.array(z.number()) })),
  usage: z.object({ total_tokens: z.number() }).nullish(),
});
