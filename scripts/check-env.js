const requiredEnvVars = [
    'PORT',
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