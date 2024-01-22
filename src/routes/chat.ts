import { Router } from 'express'
import { RouteNames } from './routeNames'
import {
  getChatMessages,
  deleteChatMessage,
  readMessage,
  getUsersByFrom,
  getUserDetailsChat,
} from '../controllers'
import { verifyToken } from '../chat/verifyToken'

const auth = async (req, res, next) => {
  try {
    const authToken = req.headers['ii-token'];
    const headers = {
      'ii-token': authToken,
    };

    const result = await verifyToken(authToken)
    req.body.userId = result.data.data.id;

    next();
  } catch (error) {
    res.status(401).json('Invalid token')
  }
}

export const chatSystemRouter = (router: Router) => {
  router.get(RouteNames.CHAT.getChatMessages.path,auth, getChatMessages)
  router.delete(RouteNames.CHAT.deleteChatMessage.path,auth, deleteChatMessage)
  router.post(RouteNames.CHAT.isReadMessage.path,auth, readMessage)
  router.get(RouteNames.CHAT.getUserListByFrom.path,auth, getUsersByFrom)
  router.get(RouteNames.CHAT.getUserDetailsChat.path,auth, getUserDetailsChat)
  return router
}
