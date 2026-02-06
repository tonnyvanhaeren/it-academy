import { t } from "elysia";

export const RegisterDto = t.Object({
  email: t.String({ format: "email", error: "Invalid email format" }),
  firstname: t.String({ minLength: 2, error: "Firstname must be at least 2 characters" }),
  lastname: t.String({ minLength: 2, error: "Lastname must be at least 2 characters" }),
  mobile: t.String({ minLength: 1, error: "Mobile is required" }),
  password: t.String({ minLength: 8, error: "Password must be at least 8 characters" }),
  role: t.Optional(t.Union([t.Literal("student"), t.Literal("teacher"), t.Literal("admin")])),
});

export const LoginDto = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8 }),
});

export const ResponseUserDto = t.Object ({
  id: t.String({}),
  email: t.String({ format: "email", error: "Invalid email format" }),
  role: t.Optional(t.Union([t.Literal("student"), t.Literal("teacher"), t.Literal("admin")])),
})