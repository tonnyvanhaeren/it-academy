// src/plugins/auth-guard.ts
import { Elysia } from 'elysia'
import type { JwtAuthContext } from './jwt-auth'

export type Role = string

type SetLike = {
  status: number | string
}

export type RoleGuardOptions = {
  roles?: Role[]
  allowRefreshOnly?: boolean
}

const ensureAuthenticated = ({
  auth,
  set
}: {
  auth: JwtAuthContext['auth']
  set: SetLike
}) => {
  if (!auth || !auth.userId) {
    set.status = 'Unauthorized'
    throw new Error('Authentication required')
  }
}

const ensureRole = ({
  auth,
  set,
  roles,
  allowRefreshOnly
}: {
  auth: JwtAuthContext['auth']
  set: SetLike
  roles?: Role[]
  allowRefreshOnly?: boolean
}) => {
  ensureAuthenticated({ auth, set })

  if (!allowRefreshOnly && !auth?.accessPayload) {
    set.status = 'Forbidden'
    throw new Error('Valid access token required')
  }

  if (!roles || roles.length === 0) return

  const userRole = auth?.role
  if (!userRole || !roles.includes(userRole)) {
    set.status = 'Forbidden'
    throw new Error('Insufficient role')
  }
}

/**
 * Provides macro: `authGuard` in route/group options.
 */
export const authGuardPlugin = () =>
  new Elysia({ name: 'auth-guard' }).macro({
    authGuard:
      (opts?: RoleGuardOptions) =>
      ({
        beforeHandle(ctx) {
          const { auth, set } = ctx as unknown as JwtAuthContext & { set: SetLike }
          ensureRole({
            auth,
            set,
            roles: opts?.roles,
            allowRefreshOnly: opts?.allowRefreshOnly
          })
        }
      })
  })
