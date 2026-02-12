// server/endpointSchemas/cookieSchemas

import { t } from 'elysia';

export const cookieSchema = t.Object({
  access: t.Optional(t.String()),
  refresh: t.String({ minLength: 180, error: 'Refresh token is verplicht' }),
});

// TypeScript-type afleiden uit het schema
export type CookieType = typeof cookieSchema.static;
