
// 404
export class NotFoundErrorWithId extends Error {
  constructor(entityType: string, id: string) {
    super(`${entityType} met ID ${id} niet gevonden.`);
    this.name = "NotFoundError";
  }
}

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
    super(`U hebt niet de nodige role :  ${role}.`);
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
    super(`User met ${message} bestaat reeds.`);
    this.name = "ConflictError";
  }
}
