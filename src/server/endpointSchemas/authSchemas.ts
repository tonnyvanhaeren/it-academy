// server/endpointSchemas/authSchemas

import { t } from 'elysia';


export const loginSchema = t.Object({
  email: t.String({
    format: 'email',
    error: 'Vul een geldig e-mailadres in, bijvoorbeeld: antonius@voorbeeld.com'
  }),
  password: t.String({
    minLength: 8,
    error: 'Het wachtwoord moet minimaal 8 karakters lang zijn'
  })
})

const role = t.Optional(t.Union([t.Literal("student"), t.Literal("teacher"), t.Literal("admin")]))

export const registerSchema = t.Object({
  firstname: t.String({ minLength: 2, error: "Voornaam moet minstens 2 characters lang zijn" }),
  lastname: t.String({ minLength: 2, error: "Familienaam moet minstens 2 characters lang zijn" }),
  email: t.String({
    format: 'email',
    error: 'Vul een geldig e-mailadres in, bijvoorbeeld: antonius@voorbeeld.com'
  }),
  mobile: t.String({
    pattern: '^\\+32\\s\\d{3}\\s\\d{2}\\s\\d{2}\\s\\d{2}$', error: "mobile moet zijn als '+32 000 00 00 00'"
  }),
  password: t.String({
    minLength: 8,
    error: 'Het wachtwoord moet minstens 8 karakters lang zijn'
  })
})

// TypeScript-type afleiden uit het schema
export type LoginType = typeof loginSchema.static;
export type RegisterType = typeof registerSchema.static;
export type RoleType = typeof role.static;