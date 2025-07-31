import type { EmbeddingModelV2Embedding } from '@ai-sdk/provider';
import { createTestServer } from '@ai-sdk/provider-utils/test';
import { createVoyage } from './voyage-provider';
import type {
  MultimodalEmbeddingInput,
  ImageEmbeddingInput,
  TextEmbeddingInput,
} from './voyage-multimodal-embedding-model';

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

describe('Multimodal Embedding Model', () => {
  const multimodalEmbeddingModel = provider.multimodalEmbeddingModel(
    'voyage-multimodal-3',
  );

  function prepareMultimodalJsonResponse({
    embeddings = dummyEmbeddings,
    usage = {
      text_tokens: 10,
      image_pixels: 1024,
      total_tokens: 1034,
    },
    headers,
  }: {
    embeddings?: EmbeddingModelV2Embedding[];
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

  describe('String input transformation', () => {
    it('should transform simple text strings for multimodal model', async () => {
      prepareMultimodalJsonResponse();

      const testValues = ['sunny day at the beach', 'rainy day in the city'];
      await multimodalEmbeddingModel.doEmbed({ values: testValues });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody.inputs).toStrictEqual([
        {
          content: [
            {
              type: 'text',
              text: 'sunny day at the beach',
            },
          ],
        },
        {
          content: [
            {
              type: 'text',
              text: 'rainy day in the city',
            },
          ],
        },
      ]);
    });
  });

  describe('TextEmbeddingInput transformation', () => {
    it('should transform TextEmbeddingInput objects with single text', async () => {
      prepareMultimodalJsonResponse();

      const testValues = [
        { text: 'This is a test' },
        { text: 'Another test text' },
      ];
      await multimodalEmbeddingModel.doEmbed({ values: testValues });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody.inputs).toStrictEqual([
        {
          content: [
            {
              type: 'text',
              text: 'This is a test',
            },
          ],
        },
        {
          content: [
            {
              type: 'text',
              text: 'Another test text',
            },
          ],
        },
      ]);
    });

    it('should transform TextEmbeddingInput objects with text arrays', async () => {
      prepareMultimodalJsonResponse();

      const testValues: TextEmbeddingInput[] = [
        { text: ['First text', 'Second text'] },
        { text: ['Single array text'] },
      ];
      await multimodalEmbeddingModel.doEmbed({ values: testValues });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody.inputs).toStrictEqual([
        {
          content: [
            {
              type: 'text',
              text: 'First text',
            },
            {
              type: 'text',
              text: 'Second text',
            },
          ],
        },
        {
          content: [
            {
              type: 'text',
              text: 'Single array text',
            },
          ],
        },
      ]);
    });

    it('should transform string TextEmbeddingInput', async () => {
      prepareMultimodalJsonResponse();

      const testValues: TextEmbeddingInput[] = [
        'Simple text string',
        'Another text string',
      ];
      await multimodalEmbeddingModel.doEmbed({ values: testValues });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody.inputs).toStrictEqual([
        {
          content: [
            {
              type: 'text',
              text: 'Simple text string',
            },
          ],
        },
        {
          content: [
            {
              type: 'text',
              text: 'Another text string',
            },
          ],
        },
      ]);
    });
  });

  describe('ImageEmbeddingInput transformation', () => {
    it('should transform image URL inputs with single images', async () => {
      prepareMultimodalJsonResponse();

      const testValues: ImageEmbeddingInput[] = [
        { image: 'https://example.com/image1.jpg' },
        { image: 'https://example.com/image2.png' },
      ];
      await multimodalEmbeddingModel.doEmbed({ values: testValues });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody.inputs).toStrictEqual([
        {
          content: [
            {
              type: 'image_url',
              image_url: 'https://example.com/image1.jpg',
            },
          ],
        },
        {
          content: [
            {
              type: 'image_url',
              image_url: 'https://example.com/image2.png',
            },
          ],
        },
      ]);
    });

    it('should transform image URL inputs with multiple images', async () => {
      prepareMultimodalJsonResponse();

      const testValues: ImageEmbeddingInput[] = [
        {
          image: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
          ],
        },
        { image: ['https://example.com/image3.png'] },
      ];
      await multimodalEmbeddingModel.doEmbed({ values: testValues });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody.inputs).toStrictEqual([
        {
          content: [
            {
              type: 'image_url',
              image_url: 'https://example.com/image1.jpg',
            },
            {
              type: 'image_url',
              image_url: 'https://example.com/image2.jpg',
            },
          ],
        },
        {
          content: [
            {
              type: 'image_url',
              image_url: 'https://example.com/image3.png',
            },
          ],
        },
      ]);
    });

    it('should transform base64 image inputs', async () => {
      prepareMultimodalJsonResponse();

      const testValues: ImageEmbeddingInput[] = [
        { image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...' },
        { image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...' },
      ];
      await multimodalEmbeddingModel.doEmbed({ values: testValues });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody.inputs).toStrictEqual([
        {
          content: [
            {
              type: 'image_base64',
              image_base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...',
            },
          ],
        },
        {
          content: [
            {
              type: 'image_base64',
              image_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
            },
          ],
        },
      ]);
    });
  });

  describe('MultimodalEmbeddingInput transformation', () => {
    it('should transform multimodal inputs with text and image arrays', async () => {
      prepareMultimodalJsonResponse();

      const testValues: MultimodalEmbeddingInput[] = [
        {
          text: ['This is a banana.', 'It is yellow.'],
          image: ['https://example.com/banana.jpg'],
        },
      ];
      await multimodalEmbeddingModel.doEmbed({ values: testValues });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody.inputs).toStrictEqual([
        {
          content: [
            {
              type: 'text',
              text: 'This is a banana.',
            },
            {
              type: 'text',
              text: 'It is yellow.',
            },
            {
              type: 'image_url',
              image_url: 'https://example.com/banana.jpg',
            },
          ],
        },
      ]);
    });

    it('should transform multimodal inputs with mixed content', async () => {
      prepareMultimodalJsonResponse();

      const testValues: MultimodalEmbeddingInput[] = [
        {
          text: ['First text'],
          image: [
            'https://example.com/image1.jpg',
            'data:image/jpeg;base64,/9j/4AAQ...',
          ],
        },
        {
          text: ['Second text', 'Third text'],
        },
      ];
      await multimodalEmbeddingModel.doEmbed({ values: testValues });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody.inputs).toStrictEqual([
        {
          content: [
            {
              type: 'text',
              text: 'First text',
            },
            {
              type: 'image_url',
              image_url: 'https://example.com/image1.jpg',
            },
            {
              type: 'image_base64',
              image_base64: 'data:image/jpeg;base64,/9j/4AAQ...',
            },
          ],
        },
        {
          content: [
            {
              type: 'text',
              text: 'Second text',
            },
            {
              type: 'text',
              text: 'Third text',
            },
          ],
        },
      ]);
    });

    it('should handle pre-formatted content items', async () => {
      prepareMultimodalJsonResponse();

      const testValues: MultimodalEmbeddingInput[] = [
        {
          content: [
            { type: 'text', text: 'Pre-formatted text' },
            { type: 'image_url', image_url: 'https://example.com/image.jpg' },
            {
              type: 'image_base64',
              image_base64: 'data:image/jpeg;base64,/9j/4AAQ...',
            },
          ],
        },
      ];
      await multimodalEmbeddingModel.doEmbed({ values: testValues });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody.inputs).toStrictEqual([
        {
          content: [
            {
              type: 'text',
              text: 'Pre-formatted text',
            },
            {
              type: 'image_url',
              image_url: 'https://example.com/image.jpg',
            },
            {
              type: 'image_base64',
              image_base64: 'data:image/jpeg;base64,/9j/4AAQ...',
            },
          ],
        },
      ]);
    });

    it('should handle mixed MultimodalEmbeddingInput types', async () => {
      prepareMultimodalJsonResponse();

      const testValues: MultimodalEmbeddingInput[] = [
        'Simple text',
        { text: 'Object text' },
        { image: 'https://example.com/image.jpg' },
        ['Multiple', 'texts', 'in', 'array'],
        {
          text: ['Mixed content text'],
          image: ['https://example.com/content-image.jpg'],
        },
      ];
      await multimodalEmbeddingModel.doEmbed({ values: testValues });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody.inputs).toStrictEqual([
        {
          content: [
            {
              type: 'text',
              text: 'Simple text',
            },
          ],
        },
        {
          content: [
            {
              type: 'text',
              text: 'Object text',
            },
          ],
        },
        {
          content: [
            {
              type: 'image_url',
              image_url: 'https://example.com/image.jpg',
            },
          ],
        },
        {
          content: [
            {
              type: 'text',
              text: 'Multiple',
            },
            {
              type: 'text',
              text: 'texts',
            },
            {
              type: 'text',
              text: 'in',
            },
            {
              type: 'text',
              text: 'array',
            },
          ],
        },
        {
          content: [
            {
              type: 'text',
              text: 'Mixed content text',
            },
            {
              type: 'image_url',
              image_url: 'https://example.com/content-image.jpg',
            },
          ],
        },
      ]);
    });

    it('should auto-detect image URLs vs text in string inputs', async () => {
      prepareMultimodalJsonResponse();

      const testValues: MultimodalEmbeddingInput[] = [
        'https://example.com/image.jpg',
        'https://example.com/photo.png',
        'This is regular text',
        'data:image/jpeg;base64,/9j/4AAQ...',
      ];
      await multimodalEmbeddingModel.doEmbed({ values: testValues });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody.inputs).toStrictEqual([
        {
          content: [
            {
              type: 'image_url',
              image_url: 'https://example.com/image.jpg',
            },
          ],
        },
        {
          content: [
            {
              type: 'image_url',
              image_url: 'https://example.com/photo.png',
            },
          ],
        },
        {
          content: [
            {
              type: 'text',
              text: 'This is regular text',
            },
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

    it('should handle arrays of mixed text and images', async () => {
      prepareMultimodalJsonResponse();

      const testValues: MultimodalEmbeddingInput[] = [
        [
          'Product title',
          'Product description',
          'https://example.com/product.jpg',
          'Additional details',
        ],
      ];
      await multimodalEmbeddingModel.doEmbed({ values: testValues });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody.inputs).toStrictEqual([
        {
          content: [
            {
              type: 'text',
              text: 'Product title',
            },
            {
              type: 'text',
              text: 'Product description',
            },
            {
              type: 'image_url',
              image_url: 'https://example.com/product.jpg',
            },
            {
              type: 'text',
              text: 'Additional details',
            },
          ],
        },
      ]);
    });
  });

  describe('API integration', () => {
    it('should extract embeddings from response', async () => {
      prepareMultimodalJsonResponse();

      const testValues: string[] = ['test text'];
      const { embeddings } = await multimodalEmbeddingModel.doEmbed({
        values: testValues,
      });

      expect(embeddings).toStrictEqual(dummyEmbeddings);
    });

    it('should expose raw response headers', async () => {
      prepareMultimodalJsonResponse({
        headers: { 'test-header': 'test-value' },
      });

      const testValues: string[] = ['test text'];
      const { response } = await multimodalEmbeddingModel.doEmbed({
        values: testValues,
      });

      expect(response?.headers).toStrictEqual({
        'content-length': '239',
        'content-type': 'application/json',
        'test-header': 'test-value',
      });
    });

    it('should pass model and settings correctly', async () => {
      prepareMultimodalJsonResponse();

      const voyage = createVoyage({
        baseURL: 'https://api.voyage.ai/v1',
        apiKey: 'test-api-key',
      });

      const model = voyage.multimodalEmbeddingModel('voyage-multimodal-3');

      const testValues: string[] = ['test text'];
      await model.doEmbed({
        values: testValues,
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
      const customUsage = {
        text_tokens: 15,
        image_pixels: 2048,
        total_tokens: 2063,
      };
      prepareMultimodalJsonResponse({ usage: customUsage });

      const testValues: string[] = ['test text'];
      const { usage } = await multimodalEmbeddingModel.doEmbed({
        values: testValues,
      });

      expect(usage).toStrictEqual({
        tokens: 2063,
      });
    });

    it('should pass custom headers', async () => {
      prepareMultimodalJsonResponse();

      const voyage = createVoyage({
        baseURL: 'https://api.voyage.ai/v1',
        apiKey: 'test-api-key',
        headers: {
          'Custom-Header': 'test-header',
        },
      });

      const model = voyage.multimodalEmbeddingModel('voyage-multimodal-3');
      const testValues: string[] = ['test'];
      await model.doEmbed({ values: testValues });

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

  function prepareImageJsonResponse({
    embeddings = dummyEmbeddings,
    usage = {
      image_pixels: 1024,
      total_tokens: 1024,
    },
    headers,
  }: {
    embeddings?: EmbeddingModelV2Embedding[];
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

  describe('Image model specific behavior', () => {
    it('should handle string image URLs for image model', async () => {
      prepareImageJsonResponse();

      const testValues: string[] = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.png',
      ];
      await imageEmbeddingModel.doEmbed({ values: testValues });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody.inputs).toStrictEqual([
        {
          content: [
            {
              type: 'image_url',
              image_url: 'https://example.com/image1.jpg',
            },
          ],
        },
        {
          content: [
            {
              type: 'image_url',
              image_url: 'https://example.com/image2.png',
            },
          ],
        },
      ]);
    });

    it('should handle string base64 images for image model', async () => {
      prepareImageJsonResponse();

      const testValues: string[] = [
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
      ];
      await imageEmbeddingModel.doEmbed({ values: testValues });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody.inputs).toStrictEqual([
        {
          content: [
            {
              type: 'image_base64',
              image_base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...',
            },
          ],
        },
        {
          content: [
            {
              type: 'image_base64',
              image_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
            },
          ],
        },
      ]);
    });

    it('should handle ImageEmbeddingInput objects with single images', async () => {
      prepareImageJsonResponse();

      const testValues: ImageEmbeddingInput[] = [
        { image: 'https://example.com/image1.jpg' },
        { image: 'data:image/jpeg;base64,/9j/4AAQ...' },
      ];
      await imageEmbeddingModel.doEmbed({ values: testValues });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody.inputs).toStrictEqual([
        {
          content: [
            {
              type: 'image_url',
              image_url: 'https://example.com/image1.jpg',
            },
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

    it('should handle ImageEmbeddingInput objects with multiple images', async () => {
      prepareImageJsonResponse();

      const testValues: ImageEmbeddingInput[] = [
        {
          image: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
          ],
        },
        { image: ['data:image/jpeg;base64,/9j/4AAQ...'] },
      ];
      await imageEmbeddingModel.doEmbed({ values: testValues });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody.inputs).toStrictEqual([
        {
          content: [
            {
              type: 'image_url',
              image_url: 'https://example.com/image1.jpg',
            },
            {
              type: 'image_url',
              image_url: 'https://example.com/image2.jpg',
            },
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

    it('should handle array inputs for multiple images as one embedding', async () => {
      prepareImageJsonResponse();

      const testValues: ImageEmbeddingInput[] = [
        [
          'https://example.com/product-front.jpg',
          'https://example.com/product-side.jpg',
          'https://example.com/product-back.jpg',
        ],
        [
          'data:image/jpeg;base64,/9j/4AAQ...',
          'https://example.com/image2.jpg',
        ],
      ];
      await imageEmbeddingModel.doEmbed({ values: testValues });

      const requestBody = await server.calls[0]?.requestBodyJson;
      expect(requestBody.inputs).toStrictEqual([
        {
          content: [
            {
              type: 'image_url',
              image_url: 'https://example.com/product-front.jpg',
            },
            {
              type: 'image_url',
              image_url: 'https://example.com/product-side.jpg',
            },
            {
              type: 'image_url',
              image_url: 'https://example.com/product-back.jpg',
            },
          ],
        },
        {
          content: [
            {
              type: 'image_base64',
              image_base64: 'data:image/jpeg;base64,/9j/4AAQ...',
            },
            {
              type: 'image_url',
              image_url: 'https://example.com/image2.jpg',
            },
          ],
        },
      ]);
    });

    it('should reject text input for image model', async () => {
      prepareImageJsonResponse();

      const testValues = [{ text: 'This should fail' }];

      await expect(
        imageEmbeddingModel.doEmbed({ values: testValues as any }),
      ).rejects.toThrow('Text content not supported in image embedding model');
    });

    it('should reject mixed text and image input for image model', async () => {
      prepareImageJsonResponse();

      const testValues = [
        { text: ['Text'], image: ['https://example.com/image.jpg'] },
      ];

      await expect(
        imageEmbeddingModel.doEmbed({ values: testValues as any }),
      ).rejects.toThrow('Text content not supported in image embedding model');
    });

    it('should extract embeddings correctly', async () => {
      prepareImageJsonResponse();

      const testValues: string[] = ['https://example.com/image.jpg'];
      const { embeddings } = await imageEmbeddingModel.doEmbed({
        values: testValues,
      });

      expect(embeddings).toStrictEqual(dummyEmbeddings);
    });

    it('should handle image-specific usage information', async () => {
      const customUsage = {
        image_pixels: 4096,
        total_tokens: 4096,
      };
      prepareImageJsonResponse({ usage: customUsage });

      const testValues: string[] = ['https://example.com/image.jpg'];
      const { usage } = await imageEmbeddingModel.doEmbed({
        values: testValues,
      });

      expect(usage).toStrictEqual({
        tokens: 4096,
      });
    });
  });
});
