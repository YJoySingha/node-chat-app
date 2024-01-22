import mongoose from "mongoose";
import { Message } from "../models/Message";
import { Request, Response } from 'express';
import axios from 'axios';

const getApiInfo = (req: Request): any=> {
  const apiUrl = `${process.env.II_API_URL}/user-info`;
  const authToken = req.headers['ii-token'];

  const headers = {
    'ii-token': authToken,
  };

  return {
    apiUrl,
    headers
  }
}

export const getUserInfo = async( req:Request, res:Response) =>{
  try {  

    const {
      apiUrl, headers
    } = getApiInfo(req)
    const response = await axios.get(apiUrl, { headers });

    return  res.json({ user: response.data });
  } catch (error) {
    return res.status(500).json(error);
  }
} 

export const getChatMessages = async( req:Request, res:Response) =>{
  const { userId }  = req.body;
  console.log({userId})
  const withUser = req.query.withUser;

  const authToken = req.headers['ii-token'];
  const apiUrl = `${process.env.II_API_URL}/user-details-chat`;
  const headers = {
    'ii-token': authToken,
  };

  try {
    const skip = req?.query?.skip as string || 0;
    const params = { user_ids: [withUser, userId].join(',') };
    const response = await axios.get(apiUrl, { headers, params: { user_ids:`${withUser}, ${userId}` } });


    const result = await Message.find({ 
      $or: [
        { from: userId, to: withUser },
        { from: withUser, to: userId },
      ],
     })
     .sort({ timestamp: 1 })
            .skip(skip as number)
            .exec();

    
    return res.status(200).json({
      result,
      userData: response.data.data
    });
  } catch (error) {
    return res.status(500).json(error);
  }
} 

export const getUsersByFrom = async (req: Request, res: Response) => {

  const { userId }  = req.body;

  try {
    const userList = await Message.distinct('from', { to: userId });
    const userListTo = await Message.distinct('to', { from: userId });
    const combinedUserList = [...userList, ...userListTo];
    const uniqueUserList = Array.from(new Set(combinedUserList));

    return res.status(200).json({ userList: uniqueUserList });
  } catch (error) {
    return res.status(500).json(error);
  }
}

export const deleteChatMessage = async (req:Request, res:Response) => {
  try {

    const messageId = req.params.messageId

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      
     const  message = 'Invalid message ID format';
     return res.status(400).json(message);
    }

    const deletedMessage = await Message.findByIdAndDelete(messageId)

    if (!deletedMessage) {
      const  message = 'Message not found';
      return res.status(400).json(message);
    }

    const  message = 'Successfully deleted';
    return res.status(200).json(message);
  } catch (error) {
    return res.status(500).json(error);
  }
}

export const readMessage = async (req:Request, res:Response) => {
  try {

    const messageId = req.params.messageId

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      
     const  message = 'Invalid message ID format';
     return res.status(400).json(message);
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { $set: { isRead: true } },
      { new: true }
    );

    if (!updatedMessage) {
      const message = 'Message not found';
      return res.status(400).json(message);
    }

    const  message = 'Successfully marked as read';
    return res.status(200).json(message);
  } catch (error) {
    return res.status(500).json(error);
  }
}

export const getUserDetailsChat = async( req:Request, res:Response) =>{
  try {  

    const authToken = req.headers['ii-token'];
    const apiUrl = `${process.env.II_API_URL}/user-details-chat`;

    const headers = {
      'ii-token': authToken,
    };

    const user_ids = req.query.user_ids;
    if (!user_ids) {
      return res.status(400).json({ error: 'Kindly provide user_ids' });
    }

    const response = await axios.get(apiUrl, { headers, params: { user_ids } });

    return  res.json({ user: response.data });
  } catch (error) {
    return res.status(500).json(error);
  }
} 