import { t } from "elysia";

export const RegisterDto = t.Object({
  email: t.String({ format: "email", error: 'Email is noodzakelijk' }),
  firstname: t.String({ minLength: 2, error: "Firstname must be at least 2 characters" }),
  lastname: t.String({ minLength: 2, error: "Lastname must be at least 2 characters" }),
  mobile: t.String({
    pattern: '^\\+32\\s\\d{3}\\s\\d{2}\\s\\d{2}\\s\\d{2}$', error: "mobile moet zijn als '+32 000 00 00 00'"
  }),
  password: t.String({ minLength: 8, error: 'Wachtwoord moet minstens 8 karakters lang zijn' }),
  role: t.Optional(t.Union([t.Literal("student"), t.Literal("teacher"), t.Literal("admin")])),
});

export const LoginDto = t.Object({
  email: t.String({ format: "email", error: 'Email is noodzakelijk' }),
  password: t.String({ minLength: 8, error: 'Wachtwoord moet minstens 8 karakters lang zijn' }),
});

export const ResponseUserDto = t.Object({
  id: t.String({}),
  email: t.String({ format: "email", error: "Invalid email format" }),
  role: t.Optional(
    t.Union([t.Literal("student"), t.Literal("teacher"), t.Literal("admin")])
  ),
})