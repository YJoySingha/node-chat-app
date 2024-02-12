import { Server as SocketIOServer, Socket } from 'socket.io';
import { Message, MessageType } from '../models/Message';
import { verifyToken } from './verifyToken';
import { SocketEvents } from './socketEvents';
import { Request, Response } from 'express';
import * as redis from 'redis';
import { promisify } from 'util'; 
import { notifyUser } from '../controllers';

const onlineUsers: Record<
  string,
  { socket: Socket; userId: string; online: boolean }
> = {};

const redisClient = redis.createClient({
  host: process.env.REDIS_URL,
  port: parseInt(process.env.REDIS_PORT),
} as any);

redisClient.connect().then(() => {
  console.log('redis success')
}).catch((error) => {
  console.error('Error connecting to Redis:', error);
});

const setAsync = promisify(redisClient.set).bind(redisClient);

export const initChat = async (io: SocketIOServer) => {

  io.on('connection', async (socket: Socket) => {
    console.log('A user connected:', socket.id);

    const token = socket.handshake.query.token as string;
    try {
      const result = await verifyToken(token);
      const userId = result.data.data.id;

      if (!userId) {
        console.log('JWT verification failed');
        socket.disconnect();
        return;
      }

      onlineUsers[userId] = { socket, userId, online: true };
      io.emit(SocketEvents.UpdateUsers, Object.keys(onlineUsers));

      // Store online users in Redis with proper error handling
      socket.on(SocketEvents.Disconnect, async () => {
        delete onlineUsers[userId]
        io.emit(SocketEvents.UpdateUsers, Object.keys(onlineUsers));

        // Update online users in Redis after disconnection
        await setAsync('onlineUsers', JSON.stringify(Object.keys(onlineUsers)));
      });

      socket.on(
        SocketEvents.SendMessage,
        async (data: { to: string; content: string, file_name: string, file_size: string, type: MessageType }) => {
          const { to, content, type, file_name, file_size } = data;

          notifyUser({
            by_user_id:userId,
            for_user_id: to

          }).then(()=>{
            console.log('message sent')
          }).catch(err=> {
            console.log('Error occurred', err.message)
          })
          const message = new Message({ from: userId, to, content, type, file_name, file_size });

          try {
            await message.save();
            // Store message in Redis
            const messagesss = await redisClient.rPush(`messages:${to}:${userId}`, JSON.stringify(message));
            const recipientSocket = onlineUsers[to]?.socket;

            if (recipientSocket) {
              console.log(`Found socket for ${to} -> ${{ recipientSocket }}`)
              recipientSocket.emit(SocketEvents.ReceiveMessage, {
                from: userId,
                content,
                file_name,
                file_size,
                type
              });
            } else {
              console.log('Recipient socket not found');
            }
          }
          catch (messageError) {
            console.error('Error saving message to MongoDB:', messageError);
          }

        });

      socket.on(SocketEvents.GetMessages, async (data: { withUser: string }) => {
        // console.log('getMessage', data);
        const { withUser } = data;

        try {
          // Retrieve messages from MongoDB
          const mongoDBMessages = await Message.find({
            $or: [
              { from: userId, to: withUser },
              { from: withUser, to: userId },
            ],
          })
            .sort({ timestamp: 1 })
            .skip(0)
            .limit(10)
            .exec();

          // Retrieve messages from Redis List
          const redisMessages = await redisClient.lRange(`messages:${userId}:${withUser}`, 0, -1);

          // Parse Redis messages
          const parsedRedisMessages = redisMessages.map((messageString) => JSON.parse(messageString));

          // Combine MongoDB and Redis messages
          const allMessages = [...mongoDBMessages, ...parsedRedisMessages];

          socket.emit(SocketEvents.MessageHistory, { withUser, messages: allMessages });
        } catch (error) {
          console.error('Error fetching messages:', error);
          socket.emit(SocketEvents.MessageHistory, { withUser, messages: [] });
        }
      });

    } catch (error) {
      console.error('JWT verification failed:', error);
      socket.disconnect();
    }
  });

  console.log('listeners', io.listeners('connection'));
};
