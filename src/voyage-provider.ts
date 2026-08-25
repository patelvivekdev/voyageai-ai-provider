import type {
  EmbeddingModelV4,
  ImageModelV4,
  LanguageModelV4,
  ProviderV4,
  RerankingModelV4,
} from '@ai-sdk/provider';
import {
  type FetchFunction,
  loadApiKey,
  withoutTrailingSlash,
} from '@ai-sdk/provider-utils';
import { VoyageEmbeddingModel } from './voyage-embedding-model';
import type { VoyageEmbeddingModelId } from './voyage-embedding-settings';
import type { VoyageMultimodalEmbeddingModelId } from './voyage-multimodal-embedding-settings';
import { MultimodalEmbeddingModel } from './voyage-multimodal-embedding-model';
import type { VoyageRerankingModelId } from './reranking/voyage-reranking-options';
import { VoyageRerankingModel } from './reranking/voyage-reranking-model';

export interface VoyageProvider extends ProviderV4 {
  (modelId: VoyageEmbeddingModelId): EmbeddingModelV4;

  embeddingModel: (modelId: VoyageEmbeddingModelId) => EmbeddingModelV4;

  /**
   * @deprecated Use `embeddingModel` instead. `textEmbeddingModel` is kept for
   * backwards compatibility and points to the same implementation.
   */
  textEmbeddingModel: (modelId: VoyageEmbeddingModelId) => EmbeddingModelV4;

  /**
   * Multimodal (text and/or image) embeddings.
   *
   * Voyage exposes a single multimodal endpoint, so `imageEmbeddingModel` and
   * `multimodalEmbeddingModel` are equivalent. Pass text in `values` and images
   * via `providerOptions.voyage.content`.
   */
  multimodalEmbeddingModel: (
    modelId: VoyageMultimodalEmbeddingModelId,
  ) => EmbeddingModelV4;

  /**
   * Alias for {@link VoyageProvider.multimodalEmbeddingModel} — both use the
   * `voyage-multimodal-3` model and the same multimodal endpoint.
   */
  imageEmbeddingModel: (
    modelId: VoyageMultimodalEmbeddingModelId,
  ) => EmbeddingModelV4;

  reranking: (modelId: VoyageRerankingModelId) => RerankingModelV4;

  rerankingModel: (modelId: VoyageRerankingModelId) => RerankingModelV4;
}

export interface VoyageProviderSettings {
  /**
   * Use a different URL prefix for API calls, e.g. to use proxy servers.
   * The default prefix is `https://api.voyageai.com/v1`.
   *
   * @see https://docs.voyageai.com/reference
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

  const createEmbeddingModel = (modelId: VoyageEmbeddingModelId) =>
    new VoyageEmbeddingModel(modelId, {
      provider: 'voyage.embedding',
      baseURL,
      headers: getHeaders,
      fetch: options.fetch,
    });

  const createMultimodalEmbeddingModel = (
    modelId: VoyageMultimodalEmbeddingModelId,
  ) =>
    new MultimodalEmbeddingModel(modelId, {
      provider: 'voyage.multimodal.embedding',
      baseURL,
      headers: getHeaders,
      fetch: options.fetch,
    });

  const createRerankingModel = (modelId: VoyageRerankingModelId) =>
    new VoyageRerankingModel(modelId, {
      provider: 'voyage.reranking',
      baseURL,
      headers: getHeaders,
      fetch: options.fetch,
    });

  const provider = function (modelId: VoyageEmbeddingModelId) {
    if (new.target) {
      throw new Error(
        'The Voyage model function cannot be called with the new keyword.',
      );
    }

    return createEmbeddingModel(modelId);
  };

  provider.embeddingModel = createEmbeddingModel;
  provider.textEmbeddingModel = createEmbeddingModel;
  provider.multimodalEmbeddingModel = createMultimodalEmbeddingModel;
  provider.imageEmbeddingModel = createMultimodalEmbeddingModel;
  provider.specificationVersion = 'v4' as const;

  provider.chat = provider.languageModel = (): LanguageModelV4 => {
    throw new Error('languageModel method is not implemented.');
  };
  provider.imageModel = (): ImageModelV4 => {
    throw new Error('imageModel method is not implemented.');
  };

  provider.reranking = createRerankingModel;
  provider.rerankingModel = createRerankingModel;

  return provider as VoyageProvider;
}

/**
  Default Voyage provider instance.
   */
export const voyage = createVoyage();
