// src/routes/auth.ts
import { t } from 'elysia'
import type { BaseApp } from '../app'

// fake users
const users = [
  { id: '1', email: 'admin@example.com', password: 'admin', role: 'admin' },
  { id: '2', email: 'user@example.com', password: 'user', role: 'user' }
]

const findUserByEmail = (email: string) => users.find(u => u.email === email)

// Export as a plugin so it inherits the parent app's context typings
// (e.g. `auth`, `issueTokens`, `setAuthCookies`) when mounted via `.use(...)`.
export const authRoutes = <T extends BaseApp>(app: T) =>
  app.group('/auth', app =>
    app
      .post(
        '/login',
        async ({ body, issueTokens, setAuthCookies, set }) => {
          const user = findUserByEmail(body.email)
          if (!user || user.password !== body.password) {
            set.status = 401
            return { ok: false, message: 'Invalid credentials' }
          }

          const tokens = await issueTokens({
            sub: user.id,
            role: user.role
          })
          setAuthCookies(tokens)

          return { ok: true }
        },
        {
          body: t.Object({
            email: t.String(),
            password: t.String()
          })
        }
      )
      .post('/refresh', async ({ auth, issueTokens, setAuthCookies, set }) => {
        if (!auth?.refreshPayload) {
          set.status = 401
          return { ok: false, message: 'No valid refresh token' }
        }

        const { sub, role } = auth.refreshPayload
        const tokens = await issueTokens({ sub, role })
        setAuthCookies(tokens)

        return { ok: true }
      })
      .post('/logout', ({ clearAuthCookies }) => {
        clearAuthCookies()
        return { ok: true }
      })
  )
