import mongoose, { Document, Schema } from 'mongoose';

export enum MessageType {
  TEXT =  'text',
  AUDIO = 'audio',
  FILE = 'file',
  VIDEO = 'video',
  IMAGE = 'image'
}
interface MessageAttributes {
  from: string;
  to: string;
  content: string;
  file_name: string;
  file_size: string;
  isRead?: boolean;
  type: MessageType;
  timestamp?: Date;
}

interface MessageDocument extends MessageAttributes, Document {}

const messageSchema = new Schema<MessageDocument>({
  from: { type: String, required: true },
  to: { type: String, required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  file_name: { type: String, required: false},
  file_size: { type: String, required: false },
  type: {type: String, enum: Object.values(MessageType),default: MessageType.TEXT },
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model<MessageDocument>('Message', messageSchema);

export { Message, MessageAttributes };
