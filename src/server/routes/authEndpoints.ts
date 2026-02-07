import { Elysia, t } from 'elysia';
import { LoginDto, RegisterDto } from '../dtos/auth.dto'
import { AuthService } from '../services/authServices';
import { clearAuthCookies, createAccessToken, createRefreshToken, getRefreshToken, refreshAccessToken, setAuthCookies } from '../utils/authUtils';


const authService = await AuthService.getInstance();

// Types
type UserRole = 'student' | 'teacher' | 'admin';

// Elysia app
const authApp = new Elysia({ prefix: '/auth' })
  .post('/register', async ({ body }) => {
    return authService.register(body);
  },
    {
      body: RegisterDto,
      detail: { tags: ["Auth"] },
    })
  .post('/login', async ({ body, cookie: { accessToken, refreshToken } }) => {
    // get user and check password
    const { id, email, role } = await authService.login(body);

    accessToken.value = await createAccessToken(id, email, role as UserRole);
    refreshToken.value = await createRefreshToken(id);

    // Configure cookie attributes
    accessToken.set({
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15 // 15 minutes
    })

    refreshToken.set({
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return { success: true, accessToken: accessToken };
  }, {
    body: LoginDto,
    detail: { tags: ["Auth"] }
  })
  .post('/refresh', async () => {
    refreshAccessToken();
  }, {
    detail: { tags: ["Auth"] }
  }
  )
  .post('/logout', ({ cookie, cookie: { accessToken, refreshToken } }) => {
    accessToken.remove()
    refreshToken.remove()

    // Equivalent alternative
    delete cookie.accessToken
    delete cookie.refreshToken
    return { success: true };
  }, {
    detail: { tags: ["Auth"] }
  });

export default authApp;
