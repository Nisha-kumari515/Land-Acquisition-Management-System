import { app } from './src/app.js';
import { env } from './src/config/env.js';

process.on('uncaughtException', err => console.log('UNCAUGHT EXCEPTION:', err));
process.on('unhandledRejection', err => console.log('UNHANDLED REJECTION:', err));
process.on('exit', code => console.log('EXITING WITH CODE:', code));

const server = app.listen(env.port, () => {
  console.log(`Listening on ${env.port}`);
});

server.on('error', err => console.log('SERVER ERROR:', err));
server.on('close', () => console.log('SERVER CLOSED'));
