
const Hapi = require('@hapi/hapi');
const routes = require('./routes');

const defaultConfig = require('./config');

/**
 * Create and set Hapi app
 * @param config
 */
module.exports = (config = null) => {
  const appConfig = config || {
    ...defaultConfig,
    name: process.env.APP_NAME || '',
    env: process.env.ENV || 'dev'
  };
  const app = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    routes: { cors: { origin: ['http://localhost:3000'] } },
    app: appConfig,
  });

  // Add requests logging
  if (appConfig.env !== 'dev' && appConfig.env !== 'test') {
    app.events.on('response', request => console.log(`${request.info.remoteAddress}: ${request.method.toUpperCase()} ${request.path} --> ${request.response.statusCode}`));
  }

  // Register routes
  app.route(routes);

  return app;
}