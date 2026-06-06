---
'voyage-ai-provider': major
---

Rework multimodal/image embeddings to follow the AI SDK convention used by the
official providers (e.g. Google), and align the provider with the non-deprecated
`ProviderV3` surface.

**Breaking changes**

- Removed the `embed`/`embedMany` typed-input generics. The AI SDK no longer
  supports `embedMany<ImageEmbeddingInput>(...)`; `values` is always `string[]`.
  The exported `TextEmbeddingInput`, `ImageEmbeddingInput`, and
  `MultimodalEmbeddingInput` types have been removed.
- Multimodal and image content is now passed through
  `providerOptions.voyage.content` — an array aligned to `values` by index, where
  each entry is the non-text parts merged with the text in `values[i]` (use
  `null` for text-only entries, and an empty string value for image-only
  embeddings). This replaces the previous approach of serializing complex objects
  into the `values` array.
- `imageEmbeddingModel` and `multimodalEmbeddingModel` are now equivalent (Voyage
  exposes a single multimodal endpoint). The image-specific input validation has
  been removed.

**New / fixed**

- Added the non-deprecated `embeddingModel` property to the provider and marked
  `textEmbeddingModel` as `@deprecated` (closes #8).
- Exported `VoyageMultimodalContentPart` for typing `content` entries.
- Added the latest model IDs: `voyage-4-large`, `voyage-4`, `voyage-4-lite`
  (text) and `voyage-multimodal-3.5` (multimodal), all verified against the live
  API. `voyage-4-nano` is intentionally omitted — it is an open-weight model and
  is not served by the Voyage API.
- Fixed the reranker model id `rerank-lite-2` → `rerank-2-lite` to match the
  Voyage API/docs.
