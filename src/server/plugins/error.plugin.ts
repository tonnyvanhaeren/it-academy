import { Elysia } from "elysia";
import { HttpError } from "../errors/http-error";
export const errorPlugin = new Elysia({ name: "error-plugin" })
  .error({ HttpError })
  .onError(({ code, error, status }) => {
    if (code === "HttpError") {
      return error.toResponse();
    }
    if (code === "VALIDATION") {
      return Response.json(
        {
          error: "Validation failed",
          code: "VALIDATION_ERROR",
          details: error.all,
        },
        { status: 400 }
      );
    }
    // Default error handling
    return Response.json(
      { error: "Internal Server Error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  });