import { Server as SocketIOServer, Socket } from 'socket.io';
import { Message } from '../models/Message';
import { verifyJwtAndGetUserId } from './verifyJwtAndGetUserId';
import { SocketEvents } from './socketEvents';
import { Request, Response } from 'express';

const onlineUsers: Record<
  string,
  { socket: Socket; userId: string; online: boolean }
> = {};

export const initChat = (io: SocketIOServer) => {
  io.on('connection', async (socket: Socket) => {
    console.log('A user connected:', socket.id);

    const jwt = socket.handshake.query.jwt as string;
    try {
      const userId = await verifyJwtAndGetUserId(jwt);

      if (!userId) {
        console.log('JWT verification failed');
        socket.disconnect();
        return;
      }

      onlineUsers[userId] = { socket, userId, online: true };
      io.emit(SocketEvents.UpdateUsers, Object.keys(onlineUsers));

      socket.on(SocketEvents.Disconnect, () => {
        const user = onlineUsers[userId];
        if (user) {
          user.online = false;
          io.emit(SocketEvents.UpdateUsers, Object.keys(onlineUsers));
        }
      });

      socket.on(
        SocketEvents.SendMessage,
        async (data: { to: string; content: string }) => {
          console.log('SendMessage', data);
          const { to, content } = data;
          const message = new Message({ from: userId, to, content });
          await message.save();

          const recipientSocket = onlineUsers[to]?.socket;
          if (recipientSocket) {
            recipientSocket.emit(SocketEvents.ReceiveMessage, {
              from: userId,
              content,
            });
          }
        }
      );

      socket.on(
        SocketEvents.GetMessages,
        async (data: { withUser: string }) => {
          console.log('getMessage',data)
          const { withUser } = data;
          const messages = await Message.find({
            $or: [
              { from: userId, to: withUser },
              { from: withUser, to: userId },
            ],
          })
            .sort({ timestamp: 1 })
            .skip(0)
            .limit(10)
            .exec();
            console.log('MessageHistory',messages)
          socket.emit(SocketEvents.MessageHistory, { withUser, messages });
        }
      );
    } catch (error) {
      console.error('JWT verification failed:', error);
      socket.disconnect();
    }
  });

  console.log('listeners', io.listeners('connection'));
};
