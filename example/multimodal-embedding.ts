import type { MultimodalEmbeddingInput } from '../src';
import { createVoyage } from '../src/voyage-provider';
import { embed, embedMany } from 'ai';
const voyage = createVoyage({
  apiKey: process.env.VOYAGE_API_KEY,
});

async function multimodalEmbeddingExamples() {
  console.log('🔀 Voyage AI Multimodal Embedding Examples');
  const multimodalModel = voyage.multimodalEmbeddingModel(
    'voyage-multimodal-3',
  );

  const embedding = await embed<MultimodalEmbeddingInput>({
    model: multimodalModel,
    value: {
      text: ['A beautiful sunset over the beach'],
      image: ['https://i.ibb.co/r5w8hG8/beach2.jpg'],
    },
  });

  console.log(embedding);

  console.log('✅ Basic combinations');
  const basicCombinations = await embedMany<MultimodalEmbeddingInput>({
    model: multimodalModel,
    values: [
      {
        text: ['A beautiful sunset over the beach'],
        image: ['https://i.ibb.co/r5w8hG8/beach2.jpg'],
      },
    ],
  });
  for (const [index, embedding] of basicCombinations.embeddings.entries()) {
    console.log(`Embedding ${index + 1}:`);
    console.log(embedding.length);
  }

  console.log('✅ Single text with multiple images');
  const singleTextMultiImage = await embedMany<MultimodalEmbeddingInput>({
    model: multimodalModel,
    values: [
      {
        text: ['A beautiful sunset over the beach'],
        image: [
          'https://i.ibb.co/nQNGqL0/beach1.jpg',
          'https://i.ibb.co/r5w8hG8/beach2.jpg',
        ],
      },
    ],
  });
  for (const [index, embedding] of singleTextMultiImage.embeddings.entries()) {
    console.log(`Embedding ${index + 1}:`);
    console.log(embedding.length);
  }

  console.log('✅ Rich content with comprehensive text and image data');
  const richMultimodal = await embedMany<MultimodalEmbeddingInput>({
    model: multimodalModel,
    values: [
      {
        text: ['Golden sunset over ocean waves on sandy beach.'],
        image: ['https://i.ibb.co/nQNGqL0/beach1.jpg'],
      },
      {
        text: ['Vibrant sunset over tropical beach and ocean.'],
        image: ['https://i.ibb.co/r5w8hG8/beach2.jpg'],
      },
    ],
  });
  for (const [index, embedding] of richMultimodal.embeddings.entries()) {
    console.log(`Embedding ${index + 1}:`);
    console.log(embedding.length);
  }
}

multimodalEmbeddingExamples().catch(console.error);
