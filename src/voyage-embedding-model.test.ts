import type { EmbeddingModelV1Embedding } from '@ai-sdk/provider';
import { createTestServer } from '@ai-sdk/provider-utils/test';
import { createVoyage } from './voyage-provider';

const dummyEmbeddings = [
  [0.1, 0.2, 0.3, 0.4, 0.5],
  [0.6, 0.7, 0.8, 0.9, 1],
];
const testValues = ['sunny day at the beach', 'rainy day in the city'];

const provider = createVoyage({
  baseURL: 'https://api.voyage.ai/v1',
  apiKey: 'test-api-key',
});
const model = provider('voyage-3-lite');
const server = createTestServer({
  'https://api.voyage.ai/v1/embeddings': {},
});

describe('doEmbed', () => {
  function prepareJsonResponse({
    embeddings = dummyEmbeddings,
    usage = {
      prompt_tokens: 4,
      total_tokens: 12,
    },
    headers,
  }: {
    embeddings?: EmbeddingModelV1Embedding[];
    usage?: { prompt_tokens: number; total_tokens: number };
    headers?: Record<string, string>;
  } = {}) {
    server.urls['https://api.voyage.ai/v1/embeddings'].response = {
      type: 'json-value',
      headers,
      body: {
        object: 'list',
        data: embeddings.map((embedding, i) => ({
          object: 'embedding',
          embedding,
          index: i,
        })),
        model: 'voyage-3-lite',
        normalized: true,
        encoding_format: 'float',
        usage,
      },
    };
  }

  it('should extract embedding', async () => {
    prepareJsonResponse();

    const { embeddings } = await model.doEmbed({ values: testValues });

    expect(embeddings).toStrictEqual(dummyEmbeddings);
  });

  it('should expose the raw response headers', async () => {
    prepareJsonResponse({
      headers: { 'test-header': 'test-value' },
    });

    const { rawResponse } = await model.doEmbed({ values: testValues });

    expect(rawResponse?.headers).toStrictEqual({
      'content-length': '272',
      // default headers:
      'content-type': 'application/json',

      // custom header
      'test-header': 'test-value',
    });
  });

  it('should pass the model and the values', async () => {
    prepareJsonResponse();

    await model.doEmbed({ values: testValues });

    expect(await server.calls[0]?.requestBody).toStrictEqual({
      input: testValues,
      model: 'voyage-3-lite',
    });
  });

  it('should pass custom headers', async () => {
    prepareJsonResponse();

    const voyage = createVoyage({
      baseURL: 'https://api.voyage.ai/v1',
      apiKey: 'test-api-key',
      headers: {
        'Custom-Provider-Header': 'provider-header-value',
      },
    });

    await voyage.textEmbeddingModel('voyage-3-lite').doEmbed({
      values: testValues,
      headers: {
        'Custom-Request-Header': 'request-header-value',
      },
    });

    const requestHeaders = server.calls[0]?.requestHeaders;

    expect(requestHeaders).toStrictEqual({
      authorization: 'Bearer test-api-key',
      'content-type': 'application/json',
      'custom-provider-header': 'provider-header-value',
      'custom-request-header': 'request-header-value',
    });
  });

  it('should pass the settings', async () => {
    prepareJsonResponse();

    const voyage = createVoyage({
      baseURL: 'https://api.voyage.ai/v1',
      apiKey: 'test-api-key',
    });

    await voyage
      .textEmbeddingModel('voyage-3-code', {
        inputType: 'document',
        // encodingFormat: 'base64',
        outputDimension: 2048,
        outputDtype: 'int8',
      })
      .doEmbed({
        values: testValues,
      });

    const requestBody = await server.calls[0]?.requestBody;

    expect(requestBody).toStrictEqual({
      input: testValues,
      model: 'voyage-3-code',
      input_type: 'document',
      // encoding_format: 'base64',
      output_dimension: 2048,
      output_dtype: 'int8',
    });
  });
});
