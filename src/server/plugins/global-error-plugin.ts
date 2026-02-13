import { Elysia, t } from 'elysia'

import { ConflictEmailOrMobileError, ConflictError, ForbiddenError, NotFoundErrorWithEmail, NotFoundErrorWithId, UnauthorizedError } from '../errorClasses/errors';

export function globalErrorPlugin(app: Elysia) {
  return app.onError(({ code, error, set }) => {
    if (code === 'VALIDATION') {
      set.status = 422;
      console.log(error)
      console.log('Value error path :  ', error.valueError?.path)
      console.log('Value error path :  ', error.valueError?.schema.error)
      // Maak een lijst van fouten met je eigen meldingen
      const customErrors = error.all.map(err => {
        // Ensure that err.path is an array before calling join
        const path = Array.isArray(err.path) ? err.path.join('.') : String(err.path).slice(1);

        console.log('path ', path)
        const schemaError = err.schema.error;
        return {
          'field': path,
          message: schemaError || err.message
        };
      });

      return {
        success: false,
        //status: 422,
        errors: customErrors
      };
    }

    // 2. NotFoundError (404)
    else if (error instanceof NotFoundErrorWithEmail) {
      set.status = 404;
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      };
    }
    else if (error instanceof NotFoundErrorWithId) {
      set.status = 404;
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      };
    }
    // 3. UnauthorizedError (401)
    else if (error instanceof UnauthorizedError) {
      set.status = 401;
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: error.message,
        },
      };
    }
    // 3.1 Forbidden 403 
    else if (error instanceof ForbiddenError) {
      set.status = 401;
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: error.message,
        },
      };
    }
    // 3.1 Conflict 409
    else if (error instanceof ConflictError) {
      set.status = 401;
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: error.message,
        },
      };
    }
    else if (error instanceof ConflictEmailOrMobileError) {
      set.status = 401;
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: error.message,
        },
      };
    }
    // else if (error instanceof ValidationError) {
    //   set.status = 401;
    //   return {
    //     success: false,
    //     error: {
    //       code: 'UNAUTHORIZED',
    //       message: error.message,
    //     },
    //   };
    // }
    // 4. ParseError (400, bijv. JSON parse-fouten)
    else if (code === 'PARSE') {
      set.status = 400;
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: 'Ongeldige JSON-indeling.',
        },
      };
    }
    // 5. Onverwachte errors (500)
    else {
      set.status = 500;
      console.error('Onverwachte error:', error); // Log voor debugging
      return {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Er is een onverwachte fout opgetreden.',
        },
      };
    }
  });
}