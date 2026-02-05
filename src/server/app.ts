import { Elysia } from 'elysia'
import openapi, { fromTypes } from '@elysiajs/openapi'
import { jwtAuthPlugin } from './plugins/jwt-auth'
import { authGuardPlugin } from './plugins/auth-guard'

export const createBaseApp = () =>
  new Elysia({ prefix: 'api' })
    .use(openapi({ references: fromTypes() }))
    .use(
      jwtAuthPlugin({
        jwtSecret: process.env.JWT_SECRET!,
        accessCookieName: 'accessToken',
        refreshCookieName: 'refreshToken'
      })
    )
    .use(authGuardPlugin())

export type BaseApp = ReturnType<typeof createBaseApp>

