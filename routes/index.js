
const healthcheckRoutes = require('./healtcheck');
const webhooksRoutes = require('./webhooks');
const meetingRoutes = require('./meeting');

module.exports = [].concat(
  healthcheckRoutes,
  webhooksRoutes,
  meetingRoutes
);