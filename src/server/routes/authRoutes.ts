import type { BaseApp } from '../app'
import { t } from 'elysia';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwtUtils';
import { AuthService } from '../services/authServices';
import { cookieSchema } from '../endpointSchemas/cookieSchemas';
import { loginSchema, registerSchema } from '../endpointSchemas/authSchemas';
import { defaultErrorSchema } from '../errorClasses/errors';

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
          body: loginSchema,
          response: {
            200: t.Void(),
            401: defaultErrorSchema,
            404: defaultErrorSchema,
            422: defaultErrorSchema,
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
          body: registerSchema,
          response: {
            201: t.Object({
              user: t.Object({
                id: t.String(), email: t.String(), firstname: t.String(), lastname: t.String(), mobile: t.String(), role: t.String(), createdAt: t.String()
              })
            }),
            409: defaultErrorSchema,
            422: defaultErrorSchema,
          },
          detail: { tags: ["Auth"] },
        })
      .post('/refresh', async ({ cookie }) => {
        const { refresh } = cookie

        const payload = await verifyRefreshToken(refresh.value);
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
          cookie: cookieSchema,
          response: {
            204: t.Void(),
            422: t.Object({}),
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
