
const Nexmo = require('nexmo');
const boom = require('@hapi/boom');

const {sanitizeMessage} = require('../utils/sanitize');

/**
 * Handle poll inbound sms webhook
 * @param request
 * @param h
 */
const pollInboundSMS = (request, h) => {
  const nexmoConfig = request.server.app.nexmo;
  const pollConfig = request.server.app.poll;
  const nexmo = new Nexmo({
    apiKey: nexmoConfig.apiKey,
    apiSecret: nexmoConfig.apiSecret
  }, {debug: request.server.app.env === 'local'});

  const userPhone = request.payload['msisdn'];
  const messageId = request.payload['messageId'];
  const messageText = sanitizeMessage(request.payload['text']);
  const receivedApiKey = request.payload['api-key'];

  const friendsNumbers = ['50766734913']; // TODO: Get phone numbers from data source

  // Validate if same api key - TODO: Remove when signature verification is enabled
  if (receivedApiKey === nexmoConfig.apiKey) {

    // Validate if it's a join me command
    if (messageText && messageText.toLowerCase().includes(pollConfig.pollCreateKeyword)) {
      const invitationMessage = `${messageText}. ${pollConfig.pollCreationInstructions}`;

      // Send message to group of people TODO: Add this process to Redis queue
      friendsNumbers.forEach(phoneNumber => nexmo.message.sendSms(
        nexmoConfig.senderPhoneNumber,
        phoneNumber,
        invitationMessage,
        (error, response) => {
          if (error) {
            // TODO: Handle send error. Resend SMS to meet host
          }
        }
      ));

      return {data: true};
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