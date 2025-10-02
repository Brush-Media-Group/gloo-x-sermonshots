module.exports = {
  apps: [
    {
      name: "gloo-x-sermonshots-api",
      cwd: "./api",
      script: "dist/src/main.js",
      instances: "2",       // or 1 for single instance
      exec_mode: "cluster",   // or "fork" if you prefer
      env: {
        NODE_ENV: "production",
        PORT: 3001            // must match your Nginx proxy
      },
      env_file: "./api/.env" 
    },
    {
      name: "gloo-x-sermonshots-app",
      cwd: "./app",
      script: "build/index.js",
      instances: "1",       // or 1 for single instance
      exec_mode: "fork",   // or "fork" if you prefer
      env: {
        NODE_ENV: "production",
        PORT: 5174            // must match your Nginx proxy
      },
      env_file: "./app/.env" 
    }
  ]
};