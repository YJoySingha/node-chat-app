import express from 'express'
const router = express.Router()

import { chatSystemRouter } from './chat'
import { userRouter } from './user'
import { notificationRouter } from './notification'

chatSystemRouter(router);
userRouter(router);
notificationRouter(router);
export default router
 