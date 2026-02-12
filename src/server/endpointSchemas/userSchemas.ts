// server/endpointSchemas/authSchemas

import { t } from 'elysia';


// Regex voor MongoDB ObjectId (24-karakter lange hexadecimale string)
const ObjectIdPattern = '^[0-9a-fA-F]{24}$';

// Schema voor MongoDB ObjectId
export const objectIdSchema = t.Object({
  id: t.String({
    pattern: ObjectIdPattern,
    error: 'Ongeldig MongoDB ObjectId in URI params',
  })
})

export const UserId = t.Object({
  userId: t.String({
    minLength: 24,
    error: 'UserId must be string'
  })
})

export const responseUserSchema = t.Object({
  user: t.Object({
    id: t.String(),
    email: t.String(),
    firstname: t.String(),
    lastname: t.String(),
    mobile: t.String(),
    role: t.String(),
    createdAt: t.String()
  })
})

export const responseUsersSchema = t.Array(
  t.Object({
    user: t.Object({
      id: t.String(),
      email: t.String(),
      firstname: t.String(),
      lastname: t.String(),
      mobile: t.String(),
      role: t.String(),
      createdAt: t.String()
    })
  })
)

export type ResponseUserSchema = typeof responseUserSchema.static;
export type ResponseUsersSchema = typeof responseUsersSchema.static;
export type ObjectIdSchema = typeof objectIdSchema.static;
