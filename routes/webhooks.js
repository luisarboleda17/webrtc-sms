
const {webhooks: webhooksControllers} = require('../controllers');

module.exports = [
  {
    method: 'POST',
    path: '/webhooks/poll',
    handler: webhooksControllers.pollInboundSMS
  }
];