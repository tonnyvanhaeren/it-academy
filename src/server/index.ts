// src/index.ts
import { createBaseApp } from './app'
import { authRoutes } from './routes/auth'
import { usersRoutes } from './routes/users'
import { otherRoutes } from './routes/other'

export const app = createBaseApp()
  // routes
  .use(authRoutes)
  .use(usersRoutes)
  .use(otherRoutes)

