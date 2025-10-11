import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env';

const createClient = (): AxiosInstance => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (env.apiToken) {
    const authToken = Buffer.from(`${env.username}:${env.apiToken}`).toString('base64');
    headers.Authorization = `Basic ${authToken}`;
  }

  return axios.create({
    baseURL: env.baseUrl,
    headers,
  });
};

export const client = createClient();
