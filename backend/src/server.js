import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/database.js';
import { exec } from 'child_process';

const server = app.listen(env.port, async () => {
  console.log(`BHOOMISETU backend listening on port ${env.port}`);
  
  try {
    const projectCount = await prisma.project.count();
    if (projectCount === 0) {
      console.log('Database is empty. Running auto-seed to populate initial data...');
      exec('npm run prisma:seed', (err, stdout, stderr) => {
        if (err) console.error('Auto-seed failed:', err);
        else console.log('Auto-seed complete:', stdout);
      });
    }
  } catch (err) {
    console.error('Error checking database status:', err);
  }
});

// Force event loop to stay alive (workaround for strange exit behavior)
setInterval(() => {}, 1000 * 60 * 60); // 1 hour keep-alive

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${env.port} is already in use. Please kill the process or stop the Docker container running on this port.`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

server.on('close', () => {
    console.log('Server socket closed unexpectedly.');
});

process.on('exit', (code) => {
    console.log(`Process is exiting with code: ${code}`);
});

async function shutdown(signal) {
  console.log(`\n${signal} received, shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Backend shutdown complete.');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
