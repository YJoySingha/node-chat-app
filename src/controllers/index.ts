import mongoose from "mongoose";
import { Message } from "../models/Message";
import { Request, Response } from 'express';
import axios from 'axios';

export const getUserInfo = async( req:Request, res:Response) =>{
  try {

    const authToken = req.headers['ii-token'];
    const apiUrl = `${process.env.API_BASE_URL}/user-info`;

    const headers = {
      'ii-token': authToken,
    };

    const response = await axios.get(apiUrl, { headers });

    return  res.json({ user: response.data });
  } catch (error) {
    return res.status(500).json(error);
  }
} 

export const getChatMessages = async( req:Request, res:Response) =>{
  const { userId, withUser }  = req.body;
  try {
    
    const result = await Message.find({ 
      $or: [
        { from: userId, to: withUser },
        { from: withUser, to: userId },
      ],
     })
     .sort({ timestamp: 1 })
            .skip(0)
            .limit(10)
            .exec();

    return res.status(200).json(result);
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