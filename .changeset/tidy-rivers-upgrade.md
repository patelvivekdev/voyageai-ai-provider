---
'voyage-ai-provider': major
---

Upgrade to AI SDK 7 and its V4 provider specification. The package now requires
Node.js 22 or newer and is distributed as ESM only. Provider objects and
embedding and reranking models now expose `specificationVersion: 'v4'`, making
Voyage compatible with AI SDK provider registries and `customProvider`.
