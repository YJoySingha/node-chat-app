import { Router } from 'express'
import { RouteNames } from './routeNames'
import {
  getChatMessages,
  deleteChatMessage,
} from '../controllers'

export const chatSystemRouter = (router: Router) => {
  router.get(RouteNames.CHAT.getChatMessages.path, getChatMessages)
  router.delete(RouteNames.CHAT.deleteChatMessage.path, deleteChatMessage)
  return router
}
