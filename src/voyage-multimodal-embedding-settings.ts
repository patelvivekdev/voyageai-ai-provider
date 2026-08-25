import { z } from 'zod/v4';

export type VoyageMultimodalEmbeddingModelId =
  'voyage-multimodal-3.5' | 'voyage-multimodal-3' | (string & {});

/**
 * A single multimodal content part, mirroring the Voyage multimodal
 * embeddings API content items.
 *
 * https://docs.voyageai.com/reference/multimodal-embeddings-api
 */
const voyageMultimodalContentPart = z.union([
  z.object({ type: z.literal('text'), text: z.string() }),
  z.object({ type: z.literal('image_url'), image_url: z.string() }),
  z.object({ type: z.literal('image_base64'), image_base64: z.string() }),
]);

export type VoyageMultimodalContentPart = z.infer<
  typeof voyageMultimodalContentPart
>;

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

  /**
   * Per-value multimodal content parts for embedding non-text content
   * (images). Each entry corresponds to the embedding value at the same
   * index and its parts are merged after the text value in the request.
   * Use `null` for entries that are text-only.
   *
   * The array length must match the number of values being embedded.
   *
   * https://docs.voyageai.com/reference/multimodal-embeddings-api
   */
  content: z
    .array(z.array(voyageMultimodalContentPart).min(1).nullable())
    .optional(),
});

export type VoyageMultimodalEmbeddingOptions = z.infer<
  typeof voyageMultimodalEmbeddingOptions
>;
