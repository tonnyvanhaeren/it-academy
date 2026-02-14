// src/routes/users.ts
import type { BaseApp } from '../app'
import { t } from 'elysia';
import { UserService } from '../services/userServices';
import { objectIdSchema, userSchema } from '../endpointSchemas/userSchemas';
import { defaultErrorSchema } from '../errorClasses/errors';

const userService = await UserService.getInstance();

export const usersRoutes = <T extends BaseApp>(app: T) =>
  app.group('/users', app =>
    app
      .get('/me', async ({ userId }) => {
        return { user: await userService.getUserById(userId!) }
      },
        {
          auth: true, // protected route
          response: {
            200: userSchema,
            401: defaultErrorSchema,
            404: defaultErrorSchema
          },
          detail: {
            description: 'Haal mijn gegevens op',
            tags: ["Users"]
          }
        }
      )
      .get('/', async ({ requireRole, userId, role }) => {
        const res = requireRole('admin')
        // if (res) return res
        const users = await userService.getAllUsers();

        return {
          users: users,
          totaal: users.length
        }
      },
        {
          auth: true,
          response: {
            401: defaultErrorSchema,
            403: defaultErrorSchema,
            200: t.Object({
              users: t.Array(t.Object({
                id: t.String(),
                email: t.String(),
                firstname: t.String(),
                lastname: t.String(),
                mobile: t.String(),
                role: t.String(),
                createdAt: t.String()
              })),
              totaal: t.Number(),
            })
          },
          detail: {
            description: 'Haal alle user op',
            tags: ["Users"]
          }
        }
      )
      .get('/id/:id', async ({ requireRole, params: { id } }) => {
        const res = requireRole('admin')

        return { user: await userService.getUserById(id) }
      }, {
        auth: true,
        params: objectIdSchema,
        response: {
          200: userSchema,
          401: defaultErrorSchema,
          422: defaultErrorSchema,
          404: defaultErrorSchema
        },
        detail: {
          description: 'Haal een user op met het id ...',
          tags: ["Users"],
        }
      }
      )
  )
