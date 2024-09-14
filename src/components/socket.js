import io from 'socket.io-client';
import { BASE_URL } from './Apiconstants';

const socket = io(BASE_URL);

export default socket;