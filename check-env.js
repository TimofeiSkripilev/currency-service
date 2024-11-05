const dotenv = require('dotenv');
const path = require('path');

function loadEnvFile() {
  const envDir = path.join(__dirname, '.');
  
  if (process.env.NODE_ENV === 'production') {
    dotenv.config({ path: path.join(envDir, '.env') });
    console.log('Loading production environment variables from .env');
  } else {
    dotenv.config({ path: path.join(envDir, '.env.local') });
    console.log('Loading local environment variables from .env.local');
  }
}

loadEnvFile();

const requiredEnvVars = [
    'API_PORT',
    'API_HOST',
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET',
    'REDIS_URL'
  ];

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      console.error(`Required environment variable ${envVar} is not set.`);
      process.exit(1);
    }
  });