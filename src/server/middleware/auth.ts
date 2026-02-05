// src/middleware/auth.ts
import type { Elysia } from 'elysia'
import type { JwtAuthContext } from '../plugins/jwt-auth'

type SetLike = {
  status: number | string
}

/**
 * Compatibility middleware for older routes that expect `checkAuth`.
 *
 * Prefer using `authGuard` macro from `src/server/plugins/auth-guard.ts` for new routes.
 */
export const authMiddleware = () => <T extends Elysia>(app: T) =>
  app.derive(ctx => ({
    checkAuth: async (roles: string[] = []) => {
      const { auth, set } = ctx as unknown as JwtAuthContext & { set: SetLike }

      if (!auth || !auth.userId) {
        set.status = 401
        throw new Error('Niet geautoriseerd: Ongeldige sessie')
      }

      if (roles.length > 0) {
        const role = auth.role
        if (!role || !roles.includes(role)) {
          set.status = 403
          throw new Error('Verboden: Onvoldoende rechten')
        }
      }

      return auth
    }
  }))