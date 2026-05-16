const { execSync } = require('child_process');

async function start() {
  try {
    console.log('Running database migrations...');
    execSync('npx drizzle-kit push --schema=shared/schema.ts', { stdio: 'inherit' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
  
  try {
    await import('./dist/index.js');
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
