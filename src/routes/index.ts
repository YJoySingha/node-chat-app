import express from 'express'
const router = express.Router()

import { chatSystemRouter } from './chat'
import { userRouter } from './user'

chatSystemRouter(router);
userRouter(router);
export default router
 