import { z } from 'zod/v4';

export type VoyageContextualizedEmbeddingModelId =
  | 'voyage-context-3'
  | (string & NonNullable<unknown>);

export const voyageContextualizedEmbeddingOptions = z.object({
  /**
   * The input type for the embeddings. Defaults to "query".
   * For query, the prompt is "Represent the query for retrieving supporting documents: ".
   * For document, the prompt is "Represent the document for retrieval: ".
   */

  inputType: z.enum(['query', 'document']).optional(),

  // /**
  //  * Format in which the embeddings are encoded. We support two options:
  //  * If not specified (defaults to null): the embeddings are represented as lists of floating-point numbers;
  //  * base64: the embeddings are compressed to base64 encodings.
  //  */
  // encodingFormat?: 'base64';

  /**
   * The number of dimensions for the resulting output embeddings.
   *
   * If not specified (defaults to null), the resulting output embeddings dimension is the default for the model.
   * `voyage-code-3` supports the following `outputDimension` values: 2048, 1024 (default), 512, and 256.
   * `voyage-3-large` supports the following `outputDimension` values: 2048, 1024 (default), 512, and 256.
   *
   * please refer to the model documentation for the supported values.
   * https://docs.voyageai.com/docs/embeddings
   */
  outputDimension: z.number().optional(),

  /**
   * The data type for the resulting output embeddings.
   *
   * Defaults to 'float'.
   *
   * Other options: 'int8', 'uint8', 'binary', 'ubinary'.
   * - 'float' is supported by all models.
   * - 'float': Each returned embedding is a list of 32-bit (4-byte) single-precision floating-point numbers.
   * - 'int8', 'uint8', 'binary', and 'ubinary' are supported by 'voyage-code-3'.
   * - 'int8' and 'uint8': Each returned embedding is a list of 8-bit (1-byte) integers ranging from -128 to 127 and 0 to 255, respectively.
   * - 'binary' and 'ubinary': Each returned embedding is a list of 8-bit integers that represent bit-packed, quantized single-bit embedding values:
   *   'int8' for 'binary' and 'uint8' for 'ubinary'.
   *   The length of the returned list of integers is 1/8 of outputDimension (which is the actual dimension of the embedding).
   *   The 'binary' type uses the offset binary method.
   *
   * https://docs.voyageai.com/docs/faq#what-is-quantization-and-output-data-types
   */
  outputDtype: z
    .enum(['float', 'int8', 'uint8', 'binary', 'ubinary'])
    .optional(),
});

export type VoyageContextualizedEmbeddingOptions = z.infer<
  typeof voyageContextualizedEmbeddingOptions
>;
