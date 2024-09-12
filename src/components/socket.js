import io from 'socket.io-client';
import { BASE_URL, BASE_URL_CLOUD } from './Apiconstants';

const socket = io(BASE_URL);

export default socket;