module.exports = {
  apps: [
    {
      name: "emrider-backend",
      script: "server.js",
      cwd: "/var/www/emrider/backend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
