// src/routes/users.ts
import type { BaseApp } from '../app'

export const usersRoutes = <T extends BaseApp>(app: T) =>
  app.group('/users', app =>
    app
      // any logged-in user
      .get('/me',
        ({ auth }) => ({
          userId: auth!.userId,
          role: auth!.role
        }),
        {
          authGuard: {},
          detail: { tags: ["Auth"] },
        }
      )
      // admin-only route
      .get('/admin',
        ({ auth }) => `admin panel for ${auth!.userId}`,
        {
          authGuard: {
            roles: ['admin'],

          },
          detail: { tags: ["Auth"] },
        }
      )
      // admin-only route
      .get('/teacher',
        ({ auth }) => `admin panel for ${auth!.userId}`,
        {
          authGuard: {
            roles: ['teacher'],

          },
          detail: { tags: ["Auth"] },
        }
      )
  )
