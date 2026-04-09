import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import { initializeSocket } from './socket.js';

dotenv.config();

const server = http.createServer(app);
initializeSocket(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});