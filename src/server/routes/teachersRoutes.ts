import type { BaseApp } from '../app'

export const teacherRoutes = <T extends BaseApp>(app: T) =>
  app.group('/teachers', app =>
    app.get('/', ({ requireRole, userId, role }) => {
      requireRole('teacher')

      return {
        userId,
        role,
        data: 'teacher dashboard'
      }
    }, {
      auth: true,
      detail: {
        tags: ["Teachers"]
      }
    })
  )
