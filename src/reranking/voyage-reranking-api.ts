import { lazySchema, zodSchema } from '@ai-sdk/provider-utils';
import { z } from 'zod/v4';

// https://docs.voyageai.com/reference/reranker-api
export type VoyageRerankingInput = {
  model: string;
  query: string;
  documents: string[];
  top_k: number | undefined;
  return_documents: boolean;
  truncation: boolean;
};

export const voyageRerankingResponseSchema = lazySchema(() =>
  zodSchema(
    z.object({
      object: z.literal('list'),
      data: z.array(
        z.object({
          relevance_score: z.number(),
          index: z.number(),
        }),
      ),
      model: z.string(),
      usage: z.object({
        total_tokens: z.number(),
      }),
    }),
  ),
);
