// src/plugins/jwt-auth.ts
import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'

export type JwtAuthPayload = {
  sub: string
  email: string,
  role?: string
  [key: string]: unknown
}

export type JwtAuthContext = {
  auth: {
    userId: string
    role?: string
    email: string
    accessToken?: string
    refreshToken?: string
    accessPayload?: JwtAuthPayload
    refreshPayload?: JwtAuthPayload
  } | null
  issueTokens: (payload: JwtAuthPayload) => Promise<{
    accessToken: string
    refreshToken: string
  }>
  setAuthCookies: (tokens: {
    accessToken: string
    refreshToken: string
  }) => void
  clearAuthCookies: () => void
}

export type JwtAuthPluginOptions = {
  accessSecret: string,
  refreshSecret: string,
  accessCookieName?: string
  refreshCookieName?: string
  jwtName?: string
  accessTokenExpiresInSec?: number
  refreshTokenExpiresInSec?: number
  cookieDomain?: string
  cookieSecure?: boolean
}

/**
 * Global JWT + cookie plugin:
 * - wires @elysiajs/jwt
 * - parses access/refresh cookies into `auth`
 * - exposes helpers: issueTokens, setAuthCookies, clearAuthCookies
 */
export const jwtAuthPlugin = ({
  accessSecret,
  refreshSecret,
  accessCookieName = 'accessToken',
  refreshCookieName = 'refreshToken',
  accessTokenExpiresInSec = 15 * 60,
  refreshTokenExpiresInSec = 7 * 24 * 60 * 60,
  cookieDomain,
  cookieSecure = true
}: JwtAuthPluginOptions) =>
  new Elysia({ name: 'jwt-auth' })
    .use(jwt({ name: 'accessJwt', secret: accessSecret }))
    .use(jwt({ name: 'refreshJwt', secret: refreshSecret }))
    .derive({ as: 'global' }, async (ctx): Promise<JwtAuthContext> => {
      const { accessJwt, refreshJwt, cookie } = ctx as any

      const accessToken = cookie[accessCookieName]?.value as string | undefined
      const refreshToken = cookie[refreshCookieName]?.value as string | undefined

      let auth: JwtAuthContext['auth'] = null

      if (accessToken || refreshToken) {
        auth = {
          userId: '',
          email: '',
          role: undefined,
          accessToken,
          refreshToken,
          accessPayload: undefined,
          refreshPayload: undefined
        }

        if (accessToken) {
          const payload = (await accessJwt.verify(accessToken)) as JwtAuthPayload | false
          if (payload) {
            auth.userId = String(payload.sub)
            auth.email = payload.email
            auth.role = payload.role
            auth.accessPayload = payload
          }
        }

        if (!auth.accessPayload && refreshToken) {
          const payload = (await accessJwt.verify(refreshToken)) as JwtAuthPayload | false
          if (payload) {
            auth.userId = String(payload.sub)
            auth.email = payload.email
            auth.role = payload.role
            auth.refreshPayload = payload
          }
        }

        if (!auth.accessPayload && !auth.refreshPayload) {
          auth = null
        }
      }

      const issueTokens: JwtAuthContext['issueTokens'] = async payload => {
        const accessToken = await accessJwt.sign(payload, {
          exp: Math.floor(Date.now() / 1000) + accessTokenExpiresInSec
        })
        const refreshToken = await refreshJwt.sign(payload, {
          exp: Math.floor(Date.now() / 1000) + refreshTokenExpiresInSec
        })
        return { accessToken, refreshToken }
      }

      const setAuthCookies: JwtAuthContext['setAuthCookies'] = tokens => {
        const { accessToken, refreshToken } = tokens

        cookie[accessCookieName].value = accessToken
        cookie[accessCookieName].httpOnly = true
        cookie[accessCookieName].sameSite = 'Lax'
        cookie[accessCookieName].path = '/'
        cookie[accessCookieName].secure = cookieSecure
        cookie[accessCookieName].maxAge = accessTokenExpiresInSec
        if (cookieDomain) cookie[accessCookieName].domain = cookieDomain

        cookie[refreshCookieName].value = refreshToken
        cookie[refreshCookieName].httpOnly = true
        cookie[refreshCookieName].sameSite = 'Lax'
        cookie[refreshCookieName].path = '/'
        cookie[refreshCookieName].secure = cookieSecure
        cookie[refreshCookieName].maxAge = refreshTokenExpiresInSec
        if (cookieDomain) cookie[refreshCookieName].domain = cookieDomain
      }

      const clearAuthCookies: JwtAuthContext['clearAuthCookies'] = () => {
        cookie[accessCookieName].remove()
        cookie[refreshCookieName].remove()
      }

      // don’t force Unauthorized here, just expose `auth`
      // guards/auth routes will decide what to do
      return {
        auth,
        issueTokens,
        setAuthCookies,
        clearAuthCookies
      }
    })
    .as('global')
