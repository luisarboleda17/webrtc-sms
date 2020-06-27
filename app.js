
const Hapi = require('@hapi/hapi');

/**
 * Create and set Hapi app
 * @returns {*}
 */
module.exports = () => {
  const app = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    app: {
      name: process.env.APP_NAME || '',
      env: process.env.ENV || 'dev'}
  });

  // Add requests logging
  app.events.on('response', request => console.log(`${request.info.remoteAddress}: ${request.method.toUpperCase()} ${request.path} --> ${request.response.statusCode}`));

  return app;
}