import { Elysia, t } from 'elysia'
import { verifyAccessToken } from '../utils/jwtUtils';
//import { HttpError } from "../errors/http-error";
import { ForbiddenError, UnauthorizedError } from '../errorClasses/errors';


type Role = 'student' | 'teacher' | 'admin'

export const authGuardPlugin = new Elysia()
  .macro('auth', {
    cookie: t.Object({
      access: t.Optional(t.String())
    }),
    async resolve({ cookie, status }) {
      const access = cookie.access.value

      if (!access) {
        throw new UnauthorizedError('Access Cookie is required');
      }

      // verify accessToken
      // get payload out accessToken
      let payload = await verifyAccessToken(access);
      // use the role
      let { sub, email, role } = payload;

      // Helper om per route een rol af te dwingen
      function requireRole(required: Role | Role[]) {
        // admin mag alles → nooit blokkeren
        if (role === 'admin') return

        const requiredList = Array.isArray(required) ? required : [required]
        if (!requiredList.includes(role)) {

          throw new ForbiddenError(requiredList[0]);
        }
      }

      return {
        userId: sub,
        role,
        requireRole
      }
    }
  })
