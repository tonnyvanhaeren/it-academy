// src/routes/users.ts
import type { BaseApp } from '../app'
import { HttpError } from '../errors/http-error';
import { UserService } from '../services/userServices';
import { formatMongooseDate, isValidObjectId } from '../utils/databaseUtils'


const userService = await UserService.getInstance();

export const usersRoutes = <T extends BaseApp>(app: T) =>
  app.group('/users', app =>
    app
      // any logged-in user
      .get('/me', ({ requireRole, userId, role }) => {
        const res = requireRole('student')
        // if (res) return res

        return { userId, role }
      },
        {
          auth: true,
          detail: {
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
              id: user._id,
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
          detail: {
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
            id: user._id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            mobile: user.mobile,
            role: user.role,
            createdAt: formatMongooseDate(user.createdAt)
          }
        };

      }, {
        auth: true,
        detail: {
          tags: ["Users"]
        }
      })
  )
