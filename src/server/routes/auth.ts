import type { BaseApp } from '../app'
import { LoginDto, RegisterDto } from '@/dto/auth.dto'
import { AuthService } from '../services/authServices';

const authService = await AuthService.getInstance();

// Export as a plugin so it inherits the parent app's context typings
// (e.g. `auth`, `issueTokens`, `setAuthCookies`) when mounted via `.use(...)`.
export const authRoutes = <T extends BaseApp>(app: T) =>
  app.group('/auth', app =>
    app
      .post('/login',
        async ({ body, issueTokens, setAuthCookies, set }) => {
          const { email, password } = body;
          const user = await authService.login(body)

          const tokens = await issueTokens({
            sub: user.id,
            email: user.email,
            role: user.role
          })

          setAuthCookies(tokens)

          return { ok: true }
        },
        {
          body: LoginDto,
          detail: { tags: ["Auth"] },
        })
      .post('/register', async ({ body }) => {
        return authService.register(body);
      },
        {
          body: RegisterDto,
          detail: { tags: ["Auth"] },
        })
      .post('/refresh', async ({ auth, issueTokens, setAuthCookies, set }) => {
        if (!auth?.refreshPayload) {
          set.status = 401
          return { ok: false, message: 'No valid refresh token' }
        }

        const { sub, role, email } = auth.refreshPayload
        const tokens = await issueTokens({ sub, email, role })
        setAuthCookies(tokens)

        return { ok: true }
      }, { detail: { tags: ["Auth"] }, })
      .post('/logout', ({ clearAuthCookies }) => {
        clearAuthCookies()
        return { ok: true }
      }, {
        detail: { tags: ["Auth"] },
      })
  )
