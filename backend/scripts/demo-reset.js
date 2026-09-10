import { execSync } from 'node:child_process';
import { prisma } from '../src/config/database.js';

async function resetDemo() {
    if (process.env.DEMO_MODE !== 'true') {
        console.error('ERROR: Reset is only allowed in DEMO_MODE=true');
        process.exit(1);
    }

    if (process.env.NODE_ENV === 'production') {
        console.error('ERROR: Cannot reset in production environment');
        process.exit(1);
    }

    console.log('Initiating demo reset...');

    try {
        console.log('Wiping existing data and preserving schema...');
        // Execute prisma db push with --force-reset
        execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
        
        console.log('Reloading deterministic seed data...');
        execSync('npx prisma db seed', { stdio: 'inherit' });

        console.log('Demo reset completed successfully.');
    } catch (error) {
        console.error('Demo reset failed:', error);
        process.exit(1);
    }
}

resetDemo();
