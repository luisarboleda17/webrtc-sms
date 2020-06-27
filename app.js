
const Hapi = require('@hapi/hapi');
const routes = require('./routes');

const defaultConfig = require('./config');

/**
 * Create and set Hapi app
 * @param config
 */
module.exports = (config = null) => {
  const app = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    app: config || {
      ...defaultConfig,
      env: process.env.ENV || 'dev'
    }
  });

  // Add requests logging
  app.events.on('response', request => console.log(`${request.info.remoteAddress}: ${request.method.toUpperCase()} ${request.path} --> ${request.response.statusCode}`));

  // Register routes
  app.route(routes);

  return app;
}