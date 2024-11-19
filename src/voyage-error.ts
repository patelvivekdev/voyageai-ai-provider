import { createJsonErrorResponseHandler } from '@ai-sdk/provider-utils';
import { z } from 'zod';

const voyageErrorDataSchema = z.object({
  error: z.object({
    code: z.string().nullable(),
    message: z.string(),
    param: z.any().nullable(),
    type: z.string(),
  }),
});

export type VoyageErrorData = z.infer<typeof voyageErrorDataSchema>;

export const voyageFailedResponseHandler = createJsonErrorResponseHandler({
  errorSchema: voyageErrorDataSchema,
  errorToMessage: (data) => data.error.message,
});
