module.exports = {
    apps: [{
      name: 'ingren-application',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: '3000' // or whatever port you want to use
      }
    }]
  }
