import { Elysia, t } from 'elysia'

import { ConflictEmailOrMobileError, ConflictError, ForbiddenError, NotFoundErrorWithEmail, NotFoundErrorWithId, UnauthorizedError } from '../errorClasses/errors';

export function globalErrorPlugin(app: Elysia) {
  return app.onError(({ code, error, set }) => {
    if (code === 'VALIDATION') {
      set.status = 422;

      // Maak een lijst van fouten met je eigen meldingen
      const customErrors = error.all.map(err => {
        // Ensure that err.path is an array before calling join
        const path = Array.isArray(err.path) ? err.path.join('.') : String(err.path).slice(1);

        const schemaError = err.schema.error;
        return {
          'field': path,
          message: schemaError || err.message
        };
      });

      return {
        success: false,
        code: 'VALIDATION_ERROR',
        errors: customErrors
      };
    }

    // 2. NotFoundError (404)
    else if (error instanceof NotFoundErrorWithEmail) {
      set.status = 404;
      return {
        success: false,
        code: 'NOT_FOUND',
        error: {
          message: error.message,
        },
      };
    }
    else if (error instanceof NotFoundErrorWithId) {
      set.status = 404;
      return {
        success: false,
        code: 'NOT_FOUND',
        error: {
          message: error.message,
        },
      };
    }
    // 3. UnauthorizedError (401)
    else if (error instanceof UnauthorizedError) {
      set.status = 401;
      return {
        success: false,
        code: 'UNAUTHORIZED',
        error: {
          message: error.message,
        },
      };
    }
    // 3.1 Forbidden 403 
    else if (error instanceof ForbiddenError) {
      set.status = 403;
      return {
        success: false,
        code: 'FORBIDDEN',
        error: {
          message: error.message,
        },
      };
    }
    // 3.1 Conflict 409
    else if (error instanceof ConflictError) {
      set.status = 409;
      return {
        success: false,
        code: 'CONFLICT_EMAIL',
        error: {
          message: error.message,
        },
      };
    }
    else if (error instanceof ConflictEmailOrMobileError) {
      set.status = 409;
      return {
        success: false,
        code: 'CONFLICT_EMAIL_OF_MOBILE',
        error: {
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
        code: 'PARSE_ERROR',
        error: {
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
        code: 'SERVER_ERROR',
        error: {
          message: 'Er is een onverwachte fout opgetreden.',
        },
      };
    }
  });
}