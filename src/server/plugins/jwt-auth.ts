// src/plugins/jwt-auth.ts
import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'

export type JwtAuthPayload = {
  sub: string
  role?: string
  [key: string]: unknown
}

export type JwtAuthContext = {
  auth: {
    userId: string
    role?: string
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
  jwtSecret: string
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
  jwtSecret,
  accessCookieName = 'accessToken',
  refreshCookieName = 'refreshToken',
  jwtName = 'jwt',
  accessTokenExpiresInSec = 15 * 60,
  refreshTokenExpiresInSec = 7 * 24 * 60 * 60,
  cookieDomain,
  cookieSecure = true
}: JwtAuthPluginOptions) =>
  new Elysia({ name: 'jwt-auth' })
    .use(
      jwt({
        name: jwtName,
        secret: jwtSecret
      })
    )
    .derive({ as: 'global' }, async (ctx): Promise<JwtAuthContext> => {
      const { [jwtName]: jwtHelper, cookie, set } = ctx as any

      const accessToken = cookie[accessCookieName]?.value as string | undefined
      const refreshToken = cookie[refreshCookieName]?.value as string | undefined

      let auth: JwtAuthContext['auth'] = null

      if (accessToken || refreshToken) {
        auth = {
          userId: '',
          role: undefined,
          accessToken,
          refreshToken,
          accessPayload: undefined,
          refreshPayload: undefined
        }

        if (accessToken) {
          const payload = (await jwtHelper.verify(accessToken)) as JwtAuthPayload | false
          if (payload) {
            auth.userId = String(payload.sub)
            auth.role = payload.role
            auth.accessPayload = payload
          }
        }

        if (!auth.accessPayload && refreshToken) {
          const payload = (await jwtHelper.verify(refreshToken)) as JwtAuthPayload | false
          if (payload) {
            auth.userId = String(payload.sub)
            auth.role = payload.role
            auth.refreshPayload = payload
          }
        }

        if (!auth.accessPayload && !auth.refreshPayload) {
          auth = null
        }
      }

      const issueTokens: JwtAuthContext['issueTokens'] = async payload => {
        const accessToken = await jwtHelper.sign(payload, {
          exp: Math.floor(Date.now() / 1000) + accessTokenExpiresInSec
        })
        const refreshToken = await jwtHelper.sign(payload, {
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
        if (cookieDomain) cookie[accessCookieName].domain = cookieDomain

        cookie[refreshCookieName].value = refreshToken
        cookie[refreshCookieName].httpOnly = true
        cookie[refreshCookieName].sameSite = 'Lax'
        cookie[refreshCookieName].path = '/'
        cookie[refreshCookieName].secure = cookieSecure
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
