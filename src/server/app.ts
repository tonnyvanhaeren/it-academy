import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'


import { authGuardPlugin } from './plugins/auth-guard-plugin'
import { globalErrorPlugin } from './plugins/global-error-plugin';

export const createBaseApp = () =>
  new Elysia({ prefix: 'api' })
    .use(swagger({
      documentation: {
        info: {
          title: 'Mijn IT Academy API',
          version: '1.0.0',
          description: 'Duidelijke documentatie voor alle endpoints',
        },
      },
    }))
    .use(authGuardPlugin)
    .use(globalErrorPlugin)

export type BaseApp = ReturnType<typeof createBaseApp>

