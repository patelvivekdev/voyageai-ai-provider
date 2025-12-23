import type { FlexibleSchema } from '@ai-sdk/provider-utils';
import { lazySchema, zodSchema } from '@ai-sdk/provider-utils';
import { z } from 'zod/v4';

// https://docs.voyageai.com/docs/reranker
export type VoyageRerankingModelId =
  | 'rerank-2.5'
  | 'rerank-2.5-lite'
  | 'rerank-2'
  | 'rerank-lite-2'
  | 'rerank-1'
  | 'rerank-lite-1'
  | (string & {});

export type VoyageRerankingOptions = {
  /**
   * Whether to return the documents in the response. Defaults to false.
   *
   * If false, the API will return a list of {"index", "relevance_score"} where "index" refers to
   * the index of a document within the input list.
   * If true, the API will return a list of {"index", "document", "relevance_score"} where "document"
   * is the corresponding document from the input list.
   *
   * @default false
   */
  returnDocuments?: boolean;

  /**
   * Whether to truncate the input to satisfy the "context length limit" on the query
   * and the documents. Defaults to true.
   *
   * If true, the query and documents will be truncated to fit within the context length limit,
   * before processed by the reranker model.
   *
   * If false, an error will be raised when the query exceeds 8,000 tokens for rerank-2.5
   * and rerank-2.5-lite; 4,000 tokens for rerank-2; 2,000 tokens for rerank-2-lite and rerank-1;
   * and 1,000 tokens for rerank-lite-1, or the sum of the number of tokens in the query and the
   * number of tokens in any single document exceeds 32,000 for rerank-2.5 and rerank-2.5-lite;
   * 16,000 for rerank-2; 8,000 for rerank-2-lite and rerank-1; and 4,000 for rerank-lite-1.
   *
   * @default true
   */
  truncation?: boolean;
};

export const voyageRerankingOptionsSchema: FlexibleSchema<VoyageRerankingOptions> =
  lazySchema(() =>
    zodSchema(
      z.object({
        returnDocuments: z.boolean().optional(),
        truncation: z.boolean().optional(),
      }),
    ),
  );
