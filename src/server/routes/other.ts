// src/routes/other.ts
import type { BaseApp } from '../app'

export const otherRoutes = <T extends BaseApp>(app: T) =>
  app
    .get('/public', () => 'public route')
    .get(
      '/private',
      ({ auth }) => `hello ${auth!.userId}`,
      {
        authGuard: {}
      }
    )
