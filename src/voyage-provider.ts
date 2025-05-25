import type {
  EmbeddingModelV2,
  ImageModelV2,
  LanguageModelV2,
  ProviderV2,
} from '@ai-sdk/provider';
import {
  type FetchFunction,
  loadApiKey,
  withoutTrailingSlash,
} from '@ai-sdk/provider-utils';
import { VoyageEmbeddingModel } from './voyage-embedding-model';
import type { VoyageEmbeddingModelId } from './voyage-embedding-settings';
import type { VoyageMultimodalEmbeddingModelId } from './voyage-multimodal-embedding-settings';
import {
  MultimodalEmbeddingModel,
  type ImageEmbeddingInput,
  type MultimodalEmbeddingInput,
} from './voyage-multimodal-embedding-model';

export interface VoyageProvider extends ProviderV2 {
  (modelId: VoyageEmbeddingModelId): EmbeddingModelV2<string>;

  textEmbeddingModel: (
    modelId: VoyageEmbeddingModelId,
  ) => EmbeddingModelV2<string>;

  imageEmbeddingModel: (
    modelId: VoyageMultimodalEmbeddingModelId,
  ) => EmbeddingModelV2<ImageEmbeddingInput>;

  multimodalEmbeddingModel: (
    modelId: VoyageMultimodalEmbeddingModelId,
  ) => EmbeddingModelV2<MultimodalEmbeddingInput>;
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

  const createImageEmbeddingModel = (
    modelId: VoyageMultimodalEmbeddingModelId,
  ) =>
    new MultimodalEmbeddingModel(
      modelId,
      {
        provider: 'voyage.image.embedding',
        baseURL,
        headers: getHeaders,
        fetch: options.fetch,
      },
      'image',
    );

  const createMultimodalEmbeddingModel = (
    modelId: VoyageMultimodalEmbeddingModelId,
  ) =>
    new MultimodalEmbeddingModel(
      modelId,
      {
        provider: 'voyage.multimodal.embedding',
        baseURL,
        headers: getHeaders,
        fetch: options.fetch,
      },
      'multimodal',
    );

  const provider = function (modelId: VoyageEmbeddingModelId) {
    if (new.target) {
      throw new Error(
        'The Voyage model function cannot be called with the new keyword.',
      );
    }

    return createEmbeddingModel(modelId);
  };

  provider.textEmbeddingModel = createEmbeddingModel;
  provider.imageEmbeddingModel = createImageEmbeddingModel;
  provider.multimodalEmbeddingModel = createMultimodalEmbeddingModel;

  provider.chat = provider.languageModel = (): LanguageModelV2 => {
    throw new Error('languageModel method is not implemented.');
  };
  provider.imageModel = (): ImageModelV2 => {
    throw new Error('imageModel method is not implemented.');
  };

  return provider as VoyageProvider;
}

/**
  Default Voyage provider instance.
   */
export const voyage = createVoyage();
