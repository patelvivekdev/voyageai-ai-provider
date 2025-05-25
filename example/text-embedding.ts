import type { TextEmbeddingInput } from '../src';
import type { VoyageEmbeddingOptions } from '../src/voyage-embedding-settings';
import type { VoyageMultimodalEmbeddingOptions } from '../src/voyage-multimodal-embedding-settings';
import { createVoyage } from '../src/voyage-provider';
import { embed, embedMany } from 'ai';

const voyage = createVoyage({
  apiKey: process.env.VOYAGE_API_KEY,
});

// Example usage for text embeddings using both embedding models

async function textEmbeddingExamples() {
  console.log('📝 Voyage AI Text Embedding Examples');

  const textModel = voyage.textEmbeddingModel('voyage-3-lite');

  const embedding = await embed<TextEmbeddingInput>({
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

  const simpleTexts = await embedMany<TextEmbeddingInput>({
    model: textModel,
    values: [
      'The quick brown fox jumps over the lazy dog',
      'Artificial intelligence is transforming the world',
      'Machine learning enables computers to learn without being explicitly programmed',
    ],
  });
  for (const [index, embedding] of simpleTexts.embeddings.entries()) {
    console.log(`Index: ${index}`);
    console.log(`Embedding: ${embedding}`);
    console.log(`Length: ${embedding.length}`);
    console.log(`--------------------------------`);
  }

  console.log('\n🔀 Multimodal Model - Text Only Usage:');

  const multimodalModel = voyage.multimodalEmbeddingModel(
    'voyage-multimodal-3',
  );

  const singleTexts = await embedMany<TextEmbeddingInput>({
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
    console.log(`Index: ${index}`);
    console.log(`Embedding: ${embedding}`);
    console.log(`Length: ${embedding.length}`);
    console.log(`--------------------------------`);
  }

  const groupedTexts = await embedMany<TextEmbeddingInput>({
    model: multimodalModel,
    values: [
      // E-commerce product: title + description + features
      [
        'Premium Wireless Bluetooth Headphones',
        'Experience superior sound quality with active noise cancellation',
        'Battery life: 30 hours, Quick charge: 15 min = 3 hours playback',
        'Compatible with iOS, Android, and all Bluetooth devices',
      ],
      // Blog post: title + summary + tags
      [
        'The Future of Artificial Intelligence in Healthcare',
        'Exploring how AI is revolutionizing medical diagnosis and treatment',
        'Tags: AI, healthcare, machine learning, medical technology, innovation',
      ],
      // Job listing: title + company + description
      [
        'Senior Software Engineer - Full Stack',
        'TechCorp Inc. - Leading technology company',
        'Build scalable web applications using React, Node.js, and cloud technologies',
        'Requirements: 5+ years experience, strong problem-solving skills',
      ],
    ],
  });
  for (const [index, embedding] of groupedTexts.embeddings.entries()) {
    console.log(`Index: ${index}`);
    console.log(`Embedding: ${embedding}`);
    console.log(`Length: ${embedding.length}`);
    console.log(`--------------------------------`);
  }
}

textEmbeddingExamples().catch(console.error);
