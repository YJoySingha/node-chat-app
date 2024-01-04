import { Request, Response } from 'express';
import axios from 'axios';

export const verifyToken = async (jwt) => {

  try {  

    const apiUrl = `${process.env.II_API_URL}/user-info`;

    const headers = {
      'ii-token': jwt,
    };

    const response = await axios.get(apiUrl, { headers });

    return response;

  } catch (error) {
    console.log(error)
    throw new Error('Validation failed' + error.message)
  }

};