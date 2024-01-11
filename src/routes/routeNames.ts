export const RouteNames = {
  CHAT: {
    getChatMessages: {
      method: 'GET',
      path: '/chats'
    },

    deleteChatMessage: {
      method: 'DELETE',
      path: '/chats/:messageId'
    },
    
    isReadMessage: {
      method: 'POST',
      path: '/chats/:messageId'
    },

    getUserListByFrom:{
      method: 'GET',
      path: '/users-list'
    }
  },
  USER: {
    getUser: {
      method: 'GET',
      path: '/user-info'
    }
  },
}
