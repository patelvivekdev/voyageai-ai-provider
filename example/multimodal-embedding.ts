import { createVoyage } from '../src/voyage-provider';
import type { VoyageMultimodalEmbeddingOptions } from '../src/voyage-multimodal-embedding-settings';
import { embed, embedMany } from 'ai';

const voyage = createVoyage({
  apiKey: process.env.VOYAGE_API_KEY,
});

async function multimodalEmbeddingExamples() {
  console.log('🔀 Voyage AI Multimodal Embedding Examples');
  const multimodalModel = voyage.multimodalEmbeddingModel(
    'voyage-multimodal-3',
  );

  // A single text value paired with an image via providerOptions.voyage.content.
  const embedding = await embed({
    model: multimodalModel,
    value: 'A beautiful sunset over the beach',
    providerOptions: {
      voyage: {
        content: [
          [
            {
              type: 'image_url',
              image_url: 'https://i.ibb.co/r5w8hG8/beach2.jpg',
            },
          ],
        ],
      } satisfies VoyageMultimodalEmbeddingOptions,
    },
  });
  console.log(embedding);

  console.log('✅ Text + image per embedding');
  const basicCombinations = await embedMany({
    model: multimodalModel,
    values: ['A beautiful sunset over the beach'],
    providerOptions: {
      voyage: {
        content: [
          [
            {
              type: 'image_url',
              image_url: 'https://i.ibb.co/r5w8hG8/beach2.jpg',
            },
          ],
        ],
      } satisfies VoyageMultimodalEmbeddingOptions,
    },
  });
  for (const [index, embedding] of basicCombinations.embeddings.entries()) {
    console.log(`Embedding ${index + 1}:`, embedding.length);
  }

  console.log('✅ Single text with multiple images');
  const singleTextMultiImage = await embedMany({
    model: multimodalModel,
    values: ['A beautiful sunset over the beach'],
    providerOptions: {
      voyage: {
        content: [
          [
            {
              type: 'image_url',
              image_url: 'https://i.ibb.co/nQNGqL0/beach1.jpg',
            },
            {
              type: 'image_url',
              image_url: 'https://i.ibb.co/r5w8hG8/beach2.jpg',
            },
          ],
        ],
      } satisfies VoyageMultimodalEmbeddingOptions,
    },
  });
  for (const [index, embedding] of singleTextMultiImage.embeddings.entries()) {
    console.log(`Embedding ${index + 1}:`, embedding.length);
  }

  console.log(
    '✅ Multiple text + image embeddings (content aligned to values)',
  );
  const richMultimodal = await embedMany({
    model: multimodalModel,
    values: [
      'Golden sunset over ocean waves on sandy beach.',
      'Vibrant sunset over tropical beach and ocean.',
    ],
    providerOptions: {
      voyage: {
        content: [
          [
            {
              type: 'image_url',
              image_url: 'https://i.ibb.co/nQNGqL0/beach1.jpg',
            },
          ],
          [
            {
              type: 'image_url',
              image_url: 'https://i.ibb.co/r5w8hG8/beach2.jpg',
            },
          ],
        ],
      } satisfies VoyageMultimodalEmbeddingOptions,
    },
  });
  for (const [index, embedding] of richMultimodal.embeddings.entries()) {
    console.log(`Embedding ${index + 1}:`, embedding.length);
  }
}

multimodalEmbeddingExamples().catch(console.error);
