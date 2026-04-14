module.exports = {
  apps: [
    {
      name: "curator-crm",
      script: "node_modules/.bin/next",
      args: "start -p 3000",
      cwd: "/home/user/curator-crm",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      watch: false,
      instances: 1,
      exec_mode: "fork",
    },
  ],
};
