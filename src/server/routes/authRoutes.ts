import type { BaseApp } from '../app'
import { t } from 'elysia';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwtUtils';
import { AuthService } from '../services/authServices';
import { HttpError } from '../errors/http-error';

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


        return;
      },
        {
          body: t.Object({
            email: t.String({
              format: 'email',
              error: 'Vul een geldig e-mailadres in, bijvoorbeeld: antonius@voorbeeld.com'
            }),
            password: t.String({
              minLength: 8,
              error: 'Het wachtwoord moet minimaal 8 karakters lang zijn'
            })
          }),
          response: {
            200: t.Void(),
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
            422: t.Object({
              message: t.String(),
              code: t.String(),
              status: t.String()
            }),
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
          body: t.Object({
            email: t.String({ format: "email", error: 'Email is noodzakelijk' }),
            firstname: t.String({ minLength: 2, error: "Voornaam moet minstens 2 karakter lan zijn" }),
            lastname: t.String({ minLength: 2, error: "familienaam moet minstens 2 karakter lan zijn" }),
            mobile: t.String({
              pattern: '^\\+32\\s\\d{3}\\s\\d{2}\\s\\d{2}\\s\\d{2}$', error: "mobile moet zijn als '+32 000 00 00 00'"
            }),
            password: t.String({ minLength: 8, error: 'Wachtwoord moet minstens 8 karakters lang zijn' }),
          }),
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
      .post('/refresh', async ({ cookie }) => {
        const rawToken = cookie.refresh.value

        // if (rawToken === undefined || (typeof rawToken !== 'string')) {
        //   throw new HttpError("No Refresh cookie || bad formatted", {
        //     status: 401,
        //     code: "INVALID_CREDENTIALS",
        //   });
        // }

        const payload = await verifyRefreshToken(rawToken);

        const user = await authService.getUserByEmail(payload.sub!);

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

        return
      },
        {
          cookie: t.Object({
            access: t.Optional(t.String()),
            refresh: t.String(
              { minLength: 180, error: 'Refresh token is verplicht' }
            ),
          }),
          response: {
            204: t.Void(),
            422: t.Object({}),
            401: t.Object({
              message: t.String(),
              code: t.String(),
              status: t.String()
            }),
          },
          detail: {
            tags: ["Auth"],
            description: 'Set new access & refresh cookies if recent Refresh is valid'
          },
        })
      .post('/logout', ({ cookie: { access, refresh } }) => {
        access.remove();
        refresh.remove();

        return
      }, {
        response: {
          200: t.Void()
        },
        detail: { tags: ["Auth"] },
      })
  )
