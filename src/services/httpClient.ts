// httpClient.ts
import axios from 'axios';

export const httpClient = axios.create({
  baseURL: 'https://at4hm6e5ab.execute-api.us-east-1.amazonaws.com', // ← URL corrigida
});