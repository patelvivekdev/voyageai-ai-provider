import type { EmbeddingModelV4Embedding } from '@ai-sdk/provider';
import { createTestServer } from '@ai-sdk/test-server/with-vitest';
import { createVoyage } from './voyage-provider';

const dummyEmbeddings = [
  [0.1, 0.2, 0.3, 0.4, 0.5],
  [0.6, 0.7, 0.8, 0.9, 1],
];

const provider = createVoyage({
  baseURL: 'https://api.voyage.ai/v1',
  apiKey: 'test-api-key',
});

const server = createTestServer({
  'https://api.voyage.ai/v1/multimodalembeddings': {},
});

function prepareJsonResponse({
  embeddings = dummyEmbeddings,
  usage = {
    text_tokens: 10,
    image_pixels: 1024,
    total_tokens: 1034,
  },
  headers,
}: {
  embeddings?: EmbeddingModelV4Embedding[];
  usage?: {
    text_tokens?: number;
    image_pixels?: number;
    total_tokens: number;
  };
  headers?: Record<string, string>;
} = {}) {
  server.urls['https://api.voyage.ai/v1/multimodalembeddings'].response = {
    type: 'json-value',
    headers,
    body: {
      data: embeddings.map((embedding, i) => ({
        object: 'embedding',
        embedding,
        index: i,
      })),
      usage,
      model: 'voyage-multimodal-3',
    },
  };
}

describe('Multimodal Embedding Model', () => {
  const multimodalEmbeddingModel = provider.multimodalEmbeddingModel(
    'voyage-multimodal-3',
  );

  describe('text values', () => {
    it('should send each text value as a single content part', async () => {
      prepareJsonResponse();

      await multimodalEmbeddingModel.doEmbed({
        values: ['sunny day at the beach', 'rainy day in the city'],
      });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody.inputs).toStrictEqual([
        { content: [{ type: 'text', text: 'sunny day at the beach' }] },
        { content: [{ type: 'text', text: 'rainy day in the city' }] },
      ]);
    });
  });

  describe('multimodal content (providerOptions.voyage.content)', () => {
    it('should merge a text value with its image content part', async () => {
      prepareJsonResponse();

      await multimodalEmbeddingModel.doEmbed({
        values: ['a beautiful sunset over the beach'],
        providerOptions: {
          voyage: {
            content: [
              [
                {
                  type: 'image_url',
                  image_url: 'https://example.com/beach.jpg',
                },
              ],
            ],
          },
        },
      });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody.inputs).toStrictEqual([
        {
          content: [
            { type: 'text', text: 'a beautiful sunset over the beach' },
            { type: 'image_url', image_url: 'https://example.com/beach.jpg' },
          ],
        },
      ]);
    });

    it('should support image-only entries via empty-string values', async () => {
      prepareJsonResponse();

      await multimodalEmbeddingModel.doEmbed({
        values: ['', ''],
        providerOptions: {
          voyage: {
            content: [
              [{ type: 'image_url', image_url: 'https://example.com/a.jpg' }],
              [
                {
                  type: 'image_base64',
                  image_base64: 'data:image/png;base64,iVBOR...',
                },
              ],
            ],
          },
        },
      });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody.inputs).toStrictEqual([
        {
          content: [
            { type: 'image_url', image_url: 'https://example.com/a.jpg' },
          ],
        },
        {
          content: [
            {
              type: 'image_base64',
              image_base64: 'data:image/png;base64,iVBOR...',
            },
          ],
        },
      ]);
    });

    it('should support multiple content parts in a single embedding', async () => {
      prepareJsonResponse();

      await multimodalEmbeddingModel.doEmbed({
        values: ['product photos'],
        providerOptions: {
          voyage: {
            content: [
              [
                {
                  type: 'image_url',
                  image_url: 'https://example.com/front.jpg',
                },
                {
                  type: 'image_url',
                  image_url: 'https://example.com/back.jpg',
                },
              ],
            ],
          },
        },
      });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody.inputs).toStrictEqual([
        {
          content: [
            { type: 'text', text: 'product photos' },
            { type: 'image_url', image_url: 'https://example.com/front.jpg' },
            { type: 'image_url', image_url: 'https://example.com/back.jpg' },
          ],
        },
      ]);
    });

    it('should treat null content entries as text-only', async () => {
      prepareJsonResponse();

      await multimodalEmbeddingModel.doEmbed({
        values: ['text with image', 'text only'],
        providerOptions: {
          voyage: {
            content: [
              [{ type: 'image_url', image_url: 'https://example.com/a.jpg' }],
              null,
            ],
          },
        },
      });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody.inputs).toStrictEqual([
        {
          content: [
            { type: 'text', text: 'text with image' },
            { type: 'image_url', image_url: 'https://example.com/a.jpg' },
          ],
        },
        { content: [{ type: 'text', text: 'text only' }] },
      ]);
    });

    it('should throw when content length does not match values length', async () => {
      prepareJsonResponse();

      await expect(
        multimodalEmbeddingModel.doEmbed({
          values: ['one', 'two'],
          providerOptions: {
            voyage: {
              content: [
                [{ type: 'image_url', image_url: 'https://example.com/a.jpg' }],
              ],
            },
          },
        }),
      ).rejects.toThrow(
        'The number of multimodal content entries (1) must match the number of values (2).',
      );
    });
  });

  describe('API integration', () => {
    it('should extract embeddings from response', async () => {
      prepareJsonResponse();

      const { embeddings } = await multimodalEmbeddingModel.doEmbed({
        values: ['test text'],
      });

      expect(embeddings).toStrictEqual(dummyEmbeddings);
    });

    it('should expose raw response headers', async () => {
      prepareJsonResponse({
        headers: { 'test-header': 'test-value' },
      });

      const { response } = await multimodalEmbeddingModel.doEmbed({
        values: ['test text'],
      });

      expect(response?.headers).toStrictEqual({
        'content-length': '239',
        'content-type': 'application/json',
        'test-header': 'test-value',
      });
    });

    it('should pass model and settings correctly', async () => {
      prepareJsonResponse();

      const model = provider.multimodalEmbeddingModel('voyage-multimodal-3');

      await model.doEmbed({
        values: ['test text'],
        providerOptions: {
          voyage: {
            inputType: 'document',
            truncation: false,
            outputEncoding: 'base64',
          },
        },
      });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody).toMatchObject({
        model: 'voyage-multimodal-3',
        input_type: 'document',
        truncation: false,
        output_encoding: 'base64',
      });
    });

    it('should handle usage information', async () => {
      prepareJsonResponse({
        usage: {
          text_tokens: 15,
          image_pixels: 2048,
          total_tokens: 2063,
        },
      });

      const { usage } = await multimodalEmbeddingModel.doEmbed({
        values: ['test text'],
      });

      expect(usage).toStrictEqual({ tokens: 2063 });
    });

    it('should pass custom headers', async () => {
      prepareJsonResponse();

      const voyage = createVoyage({
        baseURL: 'https://api.voyage.ai/v1',
        apiKey: 'test-api-key',
        headers: {
          'Custom-Header': 'test-header',
        },
      });

      const model = voyage.multimodalEmbeddingModel('voyage-multimodal-3');
      await model.doEmbed({ values: ['test'] });

      const requestHeaders = await server.calls[0]?.requestHeaders;
      expect(requestHeaders).toStrictEqual({
        authorization: 'Bearer test-api-key',
        'content-type': 'application/json',
        'custom-header': 'test-header',
      });
    });
  });
});

describe('Image Embedding Model', () => {
  const imageEmbeddingModel = provider.imageEmbeddingModel(
    'voyage-multimodal-3',
  );

  it('should send image content parts with empty-string values', async () => {
    prepareJsonResponse();

    await imageEmbeddingModel.doEmbed({
      values: ['', ''],
      providerOptions: {
        voyage: {
          content: [
            [
              {
                type: 'image_url',
                image_url: 'https://example.com/image1.jpg',
              },
            ],
            [
              {
                type: 'image_base64',
                image_base64: 'data:image/jpeg;base64,/9j/4AAQ...',
              },
            ],
          ],
        },
      },
    });

    const requestBody = await server.calls[0]?.requestBodyJson;
    expect(requestBody.inputs).toStrictEqual([
      {
        content: [
          { type: 'image_url', image_url: 'https://example.com/image1.jpg' },
        ],
      },
      {
        content: [
          {
            type: 'image_base64',
            image_base64: 'data:image/jpeg;base64,/9j/4AAQ...',
          },
        ],
      },
    ]);
  });

  it('should support multiple images in a single embedding', async () => {
    prepareJsonResponse();

    await imageEmbeddingModel.doEmbed({
      values: [''],
      providerOptions: {
        voyage: {
          content: [
            [
              { type: 'image_url', image_url: 'https://example.com/front.jpg' },
              { type: 'image_url', image_url: 'https://example.com/back.jpg' },
            ],
          ],
        },
      },
    });

    const requestBody = await server.calls[0]?.requestBodyJson;
    expect(requestBody.inputs).toStrictEqual([
      {
        content: [
          { type: 'image_url', image_url: 'https://example.com/front.jpg' },
          { type: 'image_url', image_url: 'https://example.com/back.jpg' },
        ],
      },
    ]);
  });

  it('should extract embeddings correctly', async () => {
    prepareJsonResponse();

    const { embeddings } = await imageEmbeddingModel.doEmbed({
      values: [''],
      providerOptions: {
        voyage: {
          content: [
            [{ type: 'image_url', image_url: 'https://example.com/image.jpg' }],
          ],
        },
      },
    });

    expect(embeddings).toStrictEqual(dummyEmbeddings);
  });
});
