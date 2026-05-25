module.exports = {
  apps: [
    {
      name: 'tts-web-app',
      script: './server.js',
      cwd: './frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      
      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 3010
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3010
      },

      // Restart handling to gracefully handle connection drops
      max_restarts: 10,
      restart_delay: 5000, // Wait 5 seconds before restarting
      
      // Logging configuration
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      error_file: '../logs/err.log',
      out_file: '../logs/out.log',
      merge_logs: true
    }
  ]
};
