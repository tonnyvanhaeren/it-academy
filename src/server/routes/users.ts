// src/routes/users.ts
import type { BaseApp } from '../app'

export const usersRoutes = <T extends BaseApp>(app: T) =>
  app.group('/users', app =>
    app
      // any logged-in user
      .get(
        '/me',
        ({ auth }) => ({
          userId: auth!.userId,
          role: auth!.role
        }),
        {
          authGuard: {}
        }
      )
      // admin-only route
      .get(
        '/admin',
        ({ auth }) => `admin panel for ${auth!.userId}`,
        {
          authGuard: {
            roles: ['admin']
          }
        }
      )
  )
