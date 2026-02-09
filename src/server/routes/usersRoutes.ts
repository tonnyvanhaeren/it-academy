// src/routes/users.ts
import type { BaseApp } from '../app'

export const usersRoutes = <T extends BaseApp>(app: T) =>
  app.group('/users', app =>
    app
      // any logged-in user
      .get('/me', ({ requireRole, userId, role }) => {
        const res = requireRole('student')
        // if (res) return res

        return { userId, role }
      },
        {
          auth: true,
          detail: {
            tags: ["Users"]
          }
        }
      )
  )
