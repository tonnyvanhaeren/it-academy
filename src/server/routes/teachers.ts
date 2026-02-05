import type { BaseApp } from '../app'

export const teacherRoutes = <T extends BaseApp>(app: T) =>
  app.group('/teachers', group =>
    group.get(
      '/',
      () => 'Lijst met docenten',
      {
        authGuard: {
          roles: ['admin']
        }
      }
    )
  )