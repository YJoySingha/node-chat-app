import { Router } from 'express'
import { RouteNames } from './routeNames'
import {
  onlineUserNotification,
} from '../controllers'

export const notificationRouter = (router: Router) => {
  router.post(RouteNames.NOTIFICATION.notifyOnlineUser.path, onlineUserNotification)
  return router
}