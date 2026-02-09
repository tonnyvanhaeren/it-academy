import { Elysia } from 'elysia'
import openapi, { fromTypes } from '@elysiajs/openapi'
// import { authGuardPlugin } from './plugins/auth-guard'
import { authGuardPlugin } from './plugins/auth-guard-plugin'


export const createBaseApp = () =>

  new Elysia({ prefix: 'api' })
    .use(openapi({ references: fromTypes() }))
    .use(authGuardPlugin)

export type BaseApp = ReturnType<typeof createBaseApp>

