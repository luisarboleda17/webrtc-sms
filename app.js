
const Hapi = require('@hapi/hapi');
const routes = require('./routes');

const config = require('./config');

/**
 * Create and set Hapi app
 * @param config
 */
module.exports = (config = null) => {
  const defaultConfig = config || {
    ...config,
    env: process.env.ENV || 'dev'
  };
  const app = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    app: defaultConfig
  });

  // Add requests logging
  app.events.on('response', request => console.log(`${request.info.remoteAddress}: ${request.method.toUpperCase()} ${request.path} --> ${request.response.statusCode}`));

  // Register routes
  app.route(routes);

  return app;
}