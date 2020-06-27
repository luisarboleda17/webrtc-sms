
const Boom = require('@hapi/boom');

const {webhooks: webhooksControllers} = require('../controllers');

module.exports = [
  {
    method: 'POST',
    path: '/webhooks/poll',
    handler: (request, h) => {
      const nexmoConfig = request.server.settings.app.nexmo;
      const receivedApiKey = request.payload['api-key'];
      const receiverPhoneNumber = request.payload['to'];

      // Validate API key
      if (receivedApiKey === nexmoConfig.apiKey && receiverPhoneNumber === nexmoConfig.senderPhoneNumber) {
        const pollConfig = request.server.settings.app.poll;
        const messageText = request.payload['text'].toLowerCase();

        // Route to controller
        if (messageText.includes(pollConfig.pollCreateKeyword)) {
          return webhooksControllers.createPollFromSMS(request, h);
        } else {
          return Boom.badRequest('Unrecognized action');
        }
      } else {
        return Boom.unauthorized();
      }
    }
  }
];