module.exports = {
  apps: [
    {
      name: 'paceplan-api',
      script: 'dist/server.js',
      cwd: '/var/www/paceplan/apps/api',
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
