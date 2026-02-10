// src/routes/users.ts
import type { BaseApp } from '../app'
import { t } from 'elysia';
import { HttpError } from '../errors/http-error';
import { UserService } from '../services/userServices';
import { formatMongooseDate, isValidObjectId } from '../utils/databaseUtils'

const userService = await UserService.getInstance();

export const usersRoutes = <T extends BaseApp>(app: T) =>
  app.group('/users', app =>
    app
      .get('/me', async ({ requireRole, userId, role }) => {
        const res = requireRole('student')
        if (!userId) { }

        const user = await userService.getUserById(userId!);

        return {
          user: {
            id: user._id.toString(),
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            mobile: user.mobile,
            role: user.role,
            createdAt: formatMongooseDate(user.createdAt)
          }
        };
      },
        {
          auth: true,
          response: {
            200: t.Object({
              user: t.Object({
                id: t.String(),
                email: t.String(),
                firstname: t.String(),
                lastname: t.String(),
                mobile: t.String(),
                role: t.String(),
                createdAt: t.String()
              })
            }),
            401: t.Object({
              message: t.String(),
              code: t.String(),
              status: t.String()
            }),
            404: t.Object({
              message: t.String(),
              code: t.String(),
              status: t.String()
            }),
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
          users:
            users.map(user => ({
              id: user._id.toString(),
              firstname: user.firstname,
              lastname: user.lastname,
              email: user.email,
              mobile: user.mobile,
              role: user.role,
              createdAt: formatMongooseDate(user.createdAt)
            })),
          totaal: users.length,
        }
      },
        {
          auth: true,
          response: {
            401: t.Object({
              message: t.String(),
              code: t.String(),
              status: t.String()
            }),
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
      .get('/id/:id', async ({ requireRole, userId, role, params: { id } }) => {
        const res = requireRole('admin')

        if (!isValidObjectId(id)) {
          throw new HttpError("Malformed ObjectID parameter", {
            status: 422,
            code: "OBJECT ID BAD FORMAT",
          });
        }

        const user = await userService.getUserById(id);
        return {
          user: {
            id: user._id.toString(),
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            mobile: user.mobile,
            role: user.role,
            createdAt: formatMongooseDate(user.createdAt)
          }
        }

      }, {
        auth: true,
        params: t.Object({
          id: t.String()
        }),
        response: {
          401: t.Object({
            message: t.String(),
            code: t.String(),
            status: t.String()
          }),
          422: t.Object({
            message: t.String(),
            code: t.String(),
            status: t.String()
          }),
          404: t.Object({
            message: t.String(),
            code: t.String(),
            status: t.String()
          }),
          200: t.Object({
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
        },
        detail: {
          description: 'Haal een user op met het id ...',
          tags: ["Users"],
        }

      }
      )
  )
