import type { BaseApp } from '../app'
import { t } from 'elysia';
import { LoginDto, RegisterDto } from '@/dto/auth.dto'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwtUtils';
import { AuthService } from '../services/authServices';
import { HttpError } from '../errors/http-error';
import { Optional } from '@sinclair/typebox';


const authService = await AuthService.getInstance();

// Export as a plugin so it inherits the parent app's context typings
// (e.g. `auth`, `issueTokens`, `setAuthCookies`) when mounted via `.use(...)`.
export const authRoutes = <T extends BaseApp>(app: T) =>
  app.group('/auth', app =>
    app
      .post('/login', async ({ body, cookie }) => {
        const user = await authService.login(body)

        const accessToken = await signAccessToken({ sub: user.id, email: user.email, role: user.role });
        const refreshToken = await signRefreshToken({ sub: user.email });

        cookie.access.set({
          value: accessToken,
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 15 * 60 // 15 minuten
        })

        cookie.refresh.set({
          value: refreshToken,
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 // 7 days
        })


        return { ok: true };
      },
        {
          body: LoginDto,
          response: {
            200: t.Object({ ok: t.Boolean() }),
            401: t.Object({
              message: t.String(),
              code: t.String(),
              status: t.String()
            }),
            404: t.Object({
              message: t.String(),
              code: t.String(),
              status: t.String()
            })
          },
          detail: { tags: ["Auth"], description: 'Set access and refresh cookies when successfull' },
        })
      .post('/register', async ({ body, set }) => {
        const user = await authService.register(body);

        set.status = 201
        set.headers['location'] = `/users/id/${user.id}`

        return { user }
      },
        {
          body: RegisterDto,
          response: {
            201: t.Object({
              user: t.Object({
                id: t.String(), email: t.String(), firstname: t.String(), lastname: t.String(), mobile: t.String(), role: t.String(), createdAt: t.String()
              })
            }),
            409: t.Object({
              message: t.String(),
              code: t.String(),
              status: t.String()
            }),
            422: t.Object({
              message: t.String(),
              code: t.String(),
              status: t.String()
            })
          },
          detail: { tags: ["Auth"] },
        })
      .post('/refresh', async ({ cookie: { refresh } }) => {
        const rawToken = refresh.value

        if (rawToken === undefined || (typeof rawToken !== 'string')) {
          throw new HttpError("No Refresh cookie || bad formatted", {
            status: 401,
            code: "INVALID_CREDENTIALS",
          });
        }

        const payload = await verifyRefreshToken(rawToken);
        console.log("Payload", payload)

        // check if user exists
        // recreate new refresh and access token and make cookies


        // if (!auth?.refreshPayload) {
        //   set.status = 401
        //   return { ok: false, message: 'No valid refresh token' }
        // }

        // const { sub, role, email } = auth.refreshPayload
        // const tokens = await issueTokens({ sub, email, role })
        // setAuthCookies(tokens)

        return { ok: true }
      },
        { detail: { tags: ["Auth"] }, })
      .post('/logout', ({ cookie: { access, refresh } }) => {
        access.remove();
        refresh.remove();

        return
      }, {

        detail: { tags: ["Auth"] },
      })
  )
