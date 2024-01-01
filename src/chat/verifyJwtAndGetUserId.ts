import { Request, Response } from 'express';
import axios from 'axios';

export const verifyJwtAndGetUserId = async (jwt) => {

  try {

    const apiUrl = `${process.env.API_BASE_URL}/user-info`;

    const headers = {
      'ii-token': jwt,
    };

    const response = await axios.get(apiUrl, { headers });
    return response.data.data.id

  } catch (error) {
    console.log(error)
    throw new Error('Validation failed' + error.message)
  }

};
