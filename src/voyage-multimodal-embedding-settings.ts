import { z } from 'zod';

export type VoyageMultimodalEmbeddingModelId =
  | 'voyage-multimodal-3'
  | (string & {});

export const voyageMultimodalEmbeddingOptions = z.object({
  /**
   * Type of the input.
   * Defaults to "query".
   *
   * When input_type is specified as "query" or "document", Voyage automatically prepends a prompt
   * to your inputs before vectorize them, creating vectors more tailored for retrieval/search tasks.
   *
   * For retrieval/search purposes where a query is used to search through documents, we recommend
   * specifying whether your inputs are queries or documents. Since inputs can be multimodal,
   * "queries" and "documents" can be text, images, or an interleaving of both modalities.
   *
   * For transparency, the following prompts are prepended:
   * - For "query": "Represent the query for retrieving supporting documents: "
   * - For "document": "Represent the document for retrieval: "
   */

  inputType: z.enum(['query', 'document']).optional(),

  /**
   * The data type for the resulting output embeddings.
   *
   * Defaults to null.
   *
   * - If null, the embeddings are represented as a list of floating-point numbers.
   * - If base64, the embeddings are represented as a Base64-encoded NumPy array of single-precision floats.
   *
   * https://docs.voyageai.com/docs/faq#what-is-quantization-and-output-data-types
   */
  outputEncoding: z.enum(['base64']).optional(),

  /**
   *  Whether to truncate the input texts to fit within the context length.
   *
   *  Defaults to true.
   */
  truncation: z.boolean().optional(),
});

export type VoyageMultimodalEmbeddingOptions = z.infer<
  typeof voyageMultimodalEmbeddingOptions
>;
