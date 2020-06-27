
const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');

const {webhooks: webhooksControllers} = require('../controllers');

module.exports = [
  {
    method: 'POST',
    path: '/webhooks/poll',
    options: {
      validate: {
        payload: Joi.object({
          msisdn: Joi.string().min(4).required(),
          to: Joi.string().min(4).required(),
          messageId: Joi.string().required(),
          text: Joi.alternatives().try(
            Joi.string().min(1).trim().pattern(new RegExp('^.*join\\sme.*$')),
            Joi.string().valid('yes', 'no').insensitive()
          ).required(),
          type: Joi.string().valid('text').required(),
          "api-key": Joi.string().min(4).required(),
        }).options({ allowUnknown: true, stripUnknown: true, errors: { escapeHtml: true } }).required()
      }
    },
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
        } else if (messageText === 'yes' || messageText === 'no') {
          return webhooksControllers.answerPollRequest(request, h);
        } else {
          return Boom.badRequest('Unrecognized action');
        }
      } else {
        return Boom.unauthorized();
      }
    }
  }
];