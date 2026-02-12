import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'

// import { authGuardPlugin } from './plugins/auth-guard'
import { authGuardPlugin } from './plugins/auth-guard-plugin'
import { ForbiddenError, UnauthorizedError, ValidationError } from './errorClasses/errors';
import { NotFoundErrorWithEmail, NotFoundErrorWithId } from './errorClasses/errors';

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


      if (error instanceof NotFoundErrorWithEmail) {
        set.status = 404;
        return {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        };
      } else if (error instanceof NotFoundErrorWithId) {
        set.status = 404;
        return {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        };
      } else if (error instanceof ValidationError) {
        set.status = 422;
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
          },
        };
      } else if (error instanceof UnauthorizedError) {
        set.status = 401;
        return {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: error.message,
          },
        };
      } else if (error instanceof ForbiddenError) {
        set.status = 401;
        return {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: error.message,
          },
        };
      }
      else {
        set.status = 500;
        return {
          success: false,
          error: {
            code: "SERVER_ERROR",
            message: "An unexpected error occurred.",
          },
        };
      }
    });




// .onError(({ code, error, set }) => {
//   if (code === 'VALIDATION') {
//     set.status = 422;
//     // Maak een lijst van fouten met je eigen meldingen



//     const customErrors = error.all.map(err => {
//       console.log('Err : ', err)
//       const path = Array.isArray(err.path) ? err.path.join('.') : err.path.slice(1);
//       const schemaError = err.schema?.error;
//       return {
//         path,
//         message: schemaError || err.message
//       };
//     });
//     return {
//       status: 422,
//       errors: customErrors
//     };
//   }
// })
export type BaseApp = ReturnType<typeof createBaseApp>

