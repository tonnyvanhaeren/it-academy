// src/index.ts
import { createBaseApp } from './app'
import { authRoutes } from './routes/auth'
import { usersRoutes } from './routes/users'
import { otherRoutes } from './routes/other'
import { teacherRoutes } from './routes/teachers'

export const app = createBaseApp()
  // routes
  .use(authRoutes)
  .use(usersRoutes)
  .use(otherRoutes)
  .use(teacherRoutes)

