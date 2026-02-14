import type { BaseApp } from '../app'
import { t } from 'elysia'

export const testRoutes = <T extends BaseApp>(app: T) =>
  app.group('/test', app =>
    app
      .get('/public', ({ }) => {
        return { ok: true }
      }, {
        response: {
          200: t.Object({
            ok: t.Boolean()
          })
        },
        auth: false,
        detail: { tags: ["Tests"] },
      })
      .get('/admin', ({ requireRole, userId, role }) => {
        requireRole('admin')
        return { userId, role }
      }, {
        auth: true,
        detail: { tags: ["Tests"] },
      })
      .get('/teacher', ({ requireRole, userId, role }) => {
        requireRole('teacher')
        return { userId, role }
      }, {
        auth: true,
        detail: { tags: ["Tests"] },
      })
      .get('/student', ({ requireRole, userId, role }) => {
        requireRole('student')
        return { userId, role }
      }, {
        auth: true,
        detail: { tags: ["Tests"] },
      })
  )

