
const healthcheckRoutes = require('./healtcheck');
const webhooksRoutes = require('./webhooks');

module.exports = [].concat(
  healthcheckRoutes,
  webhooksRoutes
);