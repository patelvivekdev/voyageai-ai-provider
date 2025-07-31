import { createVoyage, type ImageEmbeddingInput } from '../src';
import { voyageEmbeddingOptions } from '../src/voyage-embedding-settings';
import { voyageMultimodalEmbeddingOptions } from '../src/voyage-multimodal-embedding-settings';
import { embed, embedMany } from 'ai';
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

  const embedding = await embed<ImageEmbeddingInput>({
    model: imageModel,
    value: await getBase64Image('https://i.ibb.co/r5w8hG8/beach2.jpg'),
  });
  console.log(embedding);

  console.log('✅ One image in one embedding');
  const basicCombinations = await embedMany<ImageEmbeddingInput>({
    model: imageModel,
    values: [
      {
        image: 'https://i.ibb.co/nQNGqL0/beach1.jpg',
      },
      {
        image: await getBase64Image('https://i.ibb.co/r5w8hG8/beach2.jpg'),
      },
    ],

    // or
    // values: [
    //   'https://i.ibb.co/nQNGqL0/beach1.jpg',
    //   await getBase64Image('https://i.ibb.co/r5w8hG8/beach2.jpg'),
    // ],
  });

  for (const [index, embedding] of basicCombinations.embeddings.entries()) {
    console.log(`Embedding ${index + 1}:`);
    console.log(embedding.length);
  }

  console.log('✅ Multiple images in one embedding');
  const multiImage = await embedMany<ImageEmbeddingInput>({
    model: imageModel,
    values: [
      {
        image: [
          'https://i.ibb.co/nQNGqL0/beach1.jpg',
          await getBase64Image('https://i.ibb.co/r5w8hG8/beach2.jpg'),
        ],
      },
    ],
  });

  for (const [index, embedding] of multiImage.embeddings.entries()) {
    console.log(`Embedding ${index + 1}:`);
    console.log(embedding.length);
  }

  console.log('✅ Multiple embeddings with multiple images');
  const richMultimodal = await embedMany<ImageEmbeddingInput>({
    model: imageModel,
    values: [
      {
        image: [
          'https://i.ibb.co/nQNGqL0/beach1.jpg',
          await getBase64Image('https://i.ibb.co/r5w8hG8/beach2.jpg'),
        ],
      },
      {
        image: [
          'https://i0.wp.com/blog.voyageai.com/wp-content/uploads/2024/11/Slide-1.png',
        ],
      },
    ],
  });
  for (const [index, embedding] of richMultimodal.embeddings.entries()) {
    console.log(`Embedding ${index + 1}:`);
    console.log(embedding.length);
  }
}

imageEmbeddingExamples().catch(console.error);
