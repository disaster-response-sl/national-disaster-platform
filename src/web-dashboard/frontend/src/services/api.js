import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });

export const fetchDisasters = () => API.get('/api/disasters');
export const sendSOS = (data) => API.post('/api/sos', data);
