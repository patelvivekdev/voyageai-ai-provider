export type VoyageEmbeddingModelId =
  | 'voyage-3'
  | 'voyage-3-lite'
  | 'voyage-finance-2'
  | 'voyage-multilingual-2'
  | 'voyage-law-2'
  | 'voyage-code-2'

  // Older models
  | 'voyage-large-2-instruct'
  | 'voyage-large-2'
  | 'voyage-2'
  | 'voyage-02'
  | 'voyage-01'
  | 'voyage-lite-01'
  | (string & NonNullable<unknown>);

export interface VoyageEmbeddingSettings {
  /**
   * The input type for the embeddings. Defaults to "query".
   * For query, the prompt is "Represent the query for retrieving supporting documents: ".
   * For document, the prompt is "Represent the document for retrieval: ".
   */

  inputType?: 'query' | 'document';

  /**
   * Format in which the embeddings are encoded. We support two options:
   * If not specified (defaults to null): the embeddings are represented as lists of floating-point numbers;
   * base64: the embeddings are compressed to base64 encodings.
   */
  encodingFormat?: 'base64';

  /**
   *  Whether to truncate the input texts to fit within the context length.
   */
  truncation?: boolean;
}
