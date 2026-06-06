import { embed, embedMany } from 'ai';
import { createVoyage } from '../src/voyage-provider';
import type { VoyageMultimodalEmbeddingOptions } from '../src/voyage-multimodal-embedding-settings';

const voyage = createVoyage({
  apiKey: process.env.VOYAGE_API_KEY,
});

export const getBase64Image = async (url: string) => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return `data:image/jpeg;base64,${base64}`;
};

async function imageEmbeddingExamples() {
  console.log('🔀 Voyage AI Image Embedding Examples');
  const imageModel = voyage.imageEmbeddingModel('voyage-multimodal-3');

  // Image-only embeddings: pass an empty string per value and put the images
  // in providerOptions.voyage.content (one entry per value, same order).
  const embedding = await embed({
    model: imageModel,
    value: '',
    providerOptions: {
      voyage: {
        content: [
          [
            {
              type: 'image_base64',
              image_base64: await getBase64Image(
                'https://i.ibb.co/r5w8hG8/beach2.jpg',
              ),
            },
          ],
        ],
      } satisfies VoyageMultimodalEmbeddingOptions,
    },
  });
  console.log(embedding);

  console.log('✅ One image per embedding');
  const basicCombinations = await embedMany({
    model: imageModel,
    values: ['', ''],
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
              type: 'image_base64',
              image_base64: await getBase64Image(
                'https://i.ibb.co/r5w8hG8/beach2.jpg',
              ),
            },
          ],
        ],
      } satisfies VoyageMultimodalEmbeddingOptions,
    },
  });
  for (const [index, embedding] of basicCombinations.embeddings.entries()) {
    console.log(`Embedding ${index + 1}:`, embedding.length);
  }

  console.log('✅ Multiple images in one embedding');
  const multiImage = await embedMany({
    model: imageModel,
    values: [''],
    providerOptions: {
      voyage: {
        content: [
          [
            {
              type: 'image_url',
              image_url: 'https://i.ibb.co/nQNGqL0/beach1.jpg',
            },
            {
              type: 'image_base64',
              image_base64: await getBase64Image(
                'https://i.ibb.co/r5w8hG8/beach2.jpg',
              ),
            },
          ],
        ],
      } satisfies VoyageMultimodalEmbeddingOptions,
    },
  });
  for (const [index, embedding] of multiImage.embeddings.entries()) {
    console.log(`Embedding ${index + 1}:`, embedding.length);
  }
}

imageEmbeddingExamples().catch(console.error);
