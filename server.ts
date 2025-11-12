import dotenv from 'dotenv';
import http from 'http';
import app from './src/app';
import logger from './src/logger';
import config from './src/config';

dotenv.config();
const server = http.createServer(app);

server.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});

export default server;
