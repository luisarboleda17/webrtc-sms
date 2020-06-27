
const Nexmo = require('nexmo');
const boom = require('@hapi/boom');

const nexmoConfig = require('../config/nexmo');
const {sanitizeMessage} = require('../utils/sanitize');

/**
 * Handle poll inbound sms webhook
 * @param request
 * @param h
 */
const pollInboundSMS = (request, h) => {
  const nexmo = new Nexmo({
    apiKey: nexmoConfig.apiKey
  });
  const userPhone = request.payload['msisdn'];
  const messageId = request.payload['messageId'];
  const messageText = sanitizeMessage(request.payload['text']);
  const receivedApiKey = request.payload['api-key'];

  // Validate if same api key - TODO: Remove when signature verification is enabled
  if (receivedApiKey === nexmoConfig.apiKey) {
    if (messageText && messageText === 'join me') { // TODO: Change validation
      return 'OK';
    } else {
      return boom.badRequest('Unrecognized message');
    }
  } else {
    return boom.unauthorized('Invalid API Key');
  }
};

module.exports = {
  pollInboundSMS
};