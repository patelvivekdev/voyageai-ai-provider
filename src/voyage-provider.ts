import type {
  EmbeddingModelV1,
  LanguageModelV1,
  ProviderV1,
} from '@ai-sdk/provider';
import {
  type FetchFunction,
  loadApiKey,
  withoutTrailingSlash,
} from '@ai-sdk/provider-utils';
import { VoyageEmbeddingModel } from './voyage-embedding-model';
import type {
  VoyageEmbeddingModelId,
  VoyageEmbeddingSettings,
} from './voyage-embedding-settings';

export interface VoyageProvider extends ProviderV1 {
  (
    modelId: VoyageEmbeddingModelId,
    settings?: VoyageEmbeddingSettings,
  ): EmbeddingModelV1<string>;

  /**
  @deprecated Use `textEmbeddingModel()` instead.
     */
  embedding(
    modelId: VoyageEmbeddingModelId,
    settings?: VoyageEmbeddingSettings,
  ): EmbeddingModelV1<string>;

  /**
  @deprecated Use `textEmbeddingModel()` instead.
     */
  textEmbedding(
    modelId: VoyageEmbeddingModelId,
    settings?: VoyageEmbeddingSettings,
  ): EmbeddingModelV1<string>;

  textEmbeddingModel: (
    modelId: VoyageEmbeddingModelId,
    settings?: VoyageEmbeddingSettings,
  ) => EmbeddingModelV1<string>;
}

export interface VoyageProviderSettings {
  /**
  Use a different URL prefix for API calls, e.g. to use proxy servers.
  The default prefix is `https://api.voyageai.com/v1`.
     */
  baseURL?: string;

  /**
  API key that is being send using the `Authorization` header.
  It defaults to the `VOYAGE_API_KEY` environment variable.
     */
  apiKey?: string;

  /**
  Custom headers to include in the requests.
       */
  headers?: Record<string, string>;

  /**
  Custom fetch implementation. You can use it as a middleware to intercept requests,
  or to provide a custom fetch implementation for e.g. testing.
      */
  fetch?: FetchFunction;
}

/**
  Create a Voyage AI provider instance.
   */
export function createVoyage(
  options: VoyageProviderSettings = {},
): VoyageProvider {
  const baseURL =
    withoutTrailingSlash(options.baseURL) ?? 'https://api.voyageai.com/v1';

  const getHeaders = () => ({
    Authorization: `Bearer ${loadApiKey({
      apiKey: options.apiKey,
      environmentVariableName: 'VOYAGE_API_KEY',
      description: 'Voyage',
    })}`,
    ...options.headers,
  });

  const createEmbeddingModel = (
    modelId: VoyageEmbeddingModelId,
    settings: VoyageEmbeddingSettings = {},
  ) =>
    new VoyageEmbeddingModel(modelId, settings, {
      provider: 'voyage.embedding',
      baseURL,
      headers: getHeaders,
      fetch: options.fetch,
    });

  const provider = function (
    modelId: VoyageEmbeddingModelId,
    settings?: VoyageEmbeddingSettings,
  ) {
    if (new.target) {
      throw new Error(
        'The Voyage model function cannot be called with the new keyword.',
      );
    }

    return createEmbeddingModel(modelId, settings);
  };

  provider.embedding = createEmbeddingModel;
  provider.textEmbedding = createEmbeddingModel;
  provider.textEmbeddingModel = createEmbeddingModel;

  provider.chat = provider.languageModel = (): LanguageModelV1 => {
    throw new Error('languageModel method is not implemented.');
  };

  return provider as VoyageProvider;
}

/**
  Default Voyage provider instance.
   */
export const voyage = createVoyage();
