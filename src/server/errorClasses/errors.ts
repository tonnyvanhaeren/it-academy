import { Elysia, t } from 'elysia';

// Schema voor een individuele error
const SingleErrorSchema = t.Object({
  path: t.String(),
  message: t.String(),
});

// Schema voor de error response
// 'errors' kan nu zowel een enkel object als een array van objecten zijn
export const defaultErrorSchema = t.Object({
  success: t.Boolean(),
  code: t.String(),
  errors: t.Union([
    SingleErrorSchema,                // Enkelvoudige error
    t.Array(SingleErrorSchema),    // Meervoudige errors
  ]),
});

// Voorbeeld van hoe je dit type kunt gebruiken


export const OldErrorSchema = t.Object({
  success: t.Literal(false),
  error: t.Object({
    code: t.String(),       // Bijv. "NOT_FOUND", "VALIDATION_ERROR"
    message: t.String(),   // Beschrijving van de error
  })
})

export const exErrorSchema = t.Object({
  success: t.Literal(false),
  error: t.Object({
    code: t.String(),
    message: t.String(),
    details: t.Optional(
      t.Array(
        t.Object({
          field: t.String(),
          issue: t.String(),
        })
      )
    ),
  }),
});

// 404
export class NotFoundErrorWithId extends Error {
  constructor(entityType: string, id: string) {
    super(`${entityType} met ID ${id} niet gevonden.`);
    this.name = "NotFoundError";
  }
}

// 404
export class NotFoundErrorWithEmail extends Error {
  constructor(entityType: string, email: string) {
    super(`${entityType} met Email ${email} niet gevonnden.`);
    this.name = "NotFoundError";
  }
}

//422
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

//401
export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(`${message}.`);
    this.name = "UnauthorizedError";
  }
}

//403
export class ForbiddenError extends Error {
  constructor(role: string) {
    super(`U hebt GEEN ${role} Rechten.`);
    this.name = "ForbiddenError";
  }
}

//409
export class ConflictError extends Error {
  constructor(entityType: string, field: string, value: string) {
    super(`${entityType} met ${field} '${value}' bestaat reeds.`);
    this.name = "ConflictError";
  }
}

export class ConflictEmailOrMobileError extends Error {
  constructor(message: string) {
    super(`User met ${message} is reeds geregisteerd.`);
    this.name = "ConflictError";
  }
}
