module.exports = {
  apps: [
    {
      name: "gloo-x-sermonshots-api",
      script: "api/dist/src/main.js",
      instances: "2",       // or 1 for single instance
      exec_mode: "cluster",   // or "fork" if you prefer
      env: {
        NODE_ENV: "production",
        PORT: 3001            // must match your Nginx proxy
      }
    },
    {
      name: "gloo-x-sermonshots-app",
      script: "app/build/index.js",
      instances: "2",       // or 1 for single instance
      exec_mode: "cluster",   // or "fork" if you prefer
      env: {
        NODE_ENV: "production",
        PORT: 5174            // must match your Nginx proxy
      }
    }
  ]
};