import type { VoyageRerankingOptions } from '../src/reranking/voyage-reranking-options';
import { createVoyage } from '../src/voyage-provider';
import { rerank } from 'ai';

const voyage = createVoyage({
  apiKey: process.env.VOYAGE_API_KEY,
});

const result = await rerank({
  model: voyage.reranking('rerank-2.5'),
  documents: ['sunny day at the beach', 'rainy day in the city'],
  topN: 1,
  query: 'talk about rain',
  providerOptions: {
    voyage: {
      returnDocuments: true,
      truncation: true,
    } satisfies VoyageRerankingOptions,
  },
});

console.log('Reranking:', result.ranking);
