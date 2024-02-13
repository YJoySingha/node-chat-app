import express, { Request, Response } from 'express';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server } from 'http';
import cors from 'cors';
import router from './routes';
import { initChat } from './chat';
import { initMongo } from './lib/mongo';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = process.env.PORT

app.use(cors());

initMongo();

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!');
});

app.use('/api/v1', router);

const httpServer = new Server(app);

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
  },
});
initChat(io);
