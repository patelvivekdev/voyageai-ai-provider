import { embed, embedMany } from 'ai';
import { createVoyage } from '../src/voyage-provider';
import type { VoyageEmbeddingOptions } from '../src/voyage-embedding-settings';
import type { VoyageMultimodalEmbeddingOptions } from '../src/voyage-multimodal-embedding-settings';

const voyage = createVoyage({
  apiKey: process.env.VOYAGE_API_KEY,
});

// Example usage for text embeddings using both embedding models

async function textEmbeddingExamples() {
  console.log('📝 Voyage AI Text Embedding Examples');

  const textModel = voyage.textEmbeddingModel('voyage-3-lite');

  const embedding = await embed({
    model: textModel,
    value: 'The quick brown fox jumps over the lazy dog',
    providerOptions: {
      voyage: {
        inputType: 'query',
      } satisfies VoyageEmbeddingOptions,
    },
  });
  console.log(embedding);

  console.log('\n🔤 Regular Text Embedding Model:');

  const simpleTexts = await embedMany({
    model: textModel,
    values: [
      'The quick brown fox jumps over the lazy dog',
      'Artificial intelligence is transforming the world',
      'Machine learning enables computers to learn without being explicitly programmed',
    ],
  });
  for (const [index, embedding] of simpleTexts.embeddings.entries()) {
    console.log(`Index: ${index}, Length: ${embedding.length}`);
  }

  console.log('\n🔀 Multimodal Model - Text Only Usage:');

  const multimodalModel = voyage.multimodalEmbeddingModel(
    'voyage-multimodal-3',
  );

  const singleTexts = await embedMany({
    model: multimodalModel,
    values: [
      'Customer service inquiry about product return',
      'Technical support request for software installation',
      'Sales question about pricing and availability',
    ],
    providerOptions: {
      voyage: {
        inputType: 'query',
      } satisfies VoyageMultimodalEmbeddingOptions,
    },
  });
  for (const [index, embedding] of singleTexts.embeddings.entries()) {
    console.log(`Index: ${index}, Length: ${embedding.length}`);
  }
}

textEmbeddingExamples().catch(console.error);
