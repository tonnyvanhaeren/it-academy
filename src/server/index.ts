// src/index.ts
import { createBaseApp } from './app'
import { authRoutes } from './routes/authRoutes'
import { usersRoutes } from './routes/usersRoutes'
import { testRoutes } from './routes/testRoutes'
import { teacherRoutes } from './routes/teachersRoutes'

export const app = createBaseApp()
  // routes
  .use(authRoutes)
  .use(usersRoutes)
  .use(testRoutes)
  .use(teacherRoutes)


