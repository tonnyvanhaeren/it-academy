import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'

// import { authGuardPlugin } from './plugins/auth-guard'
import { authGuardPlugin } from './plugins/auth-guard-plugin'


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
    .onError(({ code, error, set }) => {
      if (code === 'VALIDATION') {
        set.status = 422;
        // Maak een lijst van fouten met je eigen meldingen



        const customErrors = error.all.map(err => {
          console.log('Err : ', err)
          const path = Array.isArray(err.path) ? err.path.join('.') : err.path.slice(1);
          const schemaError = err.schema?.error;
          return {
            path,
            message: schemaError || err.message
          };
        });
        return {
          status: 422,
          errors: customErrors
        };
      }
    })
export type BaseApp = ReturnType<typeof createBaseApp>

