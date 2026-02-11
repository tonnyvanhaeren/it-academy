import { password } from 'bun';
import { z } from 'zod';

type UserParams = z.infer<typeof UserParamsSchema>
export type RegisterUserBody = z.infer<typeof registerBodySchema>

const UserParamsSchema = z.object({
  id: z.coerce.number().int().positive()
})

export const registerBodySchema = z.object({
  firstname: z.string().min(2, 'Firstname moet minstens 2 karakters zijn'),
  lastname: z.string().min(2, 'Lastname moet minstens 2 karakters zijn'),
  email: z.email('Ongeldig e-mailadres'),
  password: z.string().min(8, 'Wachtwoord moet minstens 8 karakters zijn'),
  mobile: z
    .string()
    .regex(
      /^\+32 \d{3} \d{2} \d{2} \d{2}$/,
      "mobile moet zijn als '+32 000 00 00 00'"
    ),
  role: z.enum(['student', 'teacher', 'admin'])
})

export const userResponseSchema = z.object({
  success: z.literal(true),
  user: z.object({
    id: z.number(),
    firstname: z.string(),
    lastname: z.string(),
    email: z.string(),
    mobile: z.string(),
    role: z.enum(['student', 'teacher', 'admin'])
  })
})

export const error422Schema = z.object({
  success: z.literal(false),
  status: z.literal(422),
  message: z.string()
})