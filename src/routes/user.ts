import { Router } from 'express'
import { RouteNames } from './routeNames'
import {
  getUserInfo,
} from '../controllers'

export const userRouter = (router: Router) => {
  router.get(RouteNames.USER.getUser.path, getUserInfo)
  return router
}