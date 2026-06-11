---
'voyage-ai-provider': patch
---

Fix package entry points so CommonJS consumers resolve the emitted CJS build and bundlers can read the ESM `module` field.
