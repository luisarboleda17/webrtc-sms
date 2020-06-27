
const Nexmo = require('nexmo');
const boom = require('@hapi/boom');

const nexmoConfig = require('../config/nexmo');
const smsConfig = require('../config/sms');
const {sanitizeMessage} = require('../utils/sanitize');

/**
 * Handle poll inbound sms webhook
 * @param request
 * @param h
 */
const pollInboundSMS = (request, h) => {
  const nexmo = new Nexmo({
    apiKey: nexmoConfig.apiKey,
    apiSecret: nexmoConfig.apiSecret
  }, {debug: process.env.ENV === 'local'});
  const userPhone = request.payload['msisdn'];
  const messageId = request.payload['messageId'];
  const messageText = sanitizeMessage(request.payload['text']);
  const receivedApiKey = request.payload['api-key'];

  const friendsNumbers = ['50766734913']; // TODO: Get phone numbers from data source

  // Validate if same api key - TODO: Remove when signature verification is enabled
  if (receivedApiKey === nexmoConfig.apiKey) {

    // Validate if it's a join me command
    if (messageText && messageText === 'join me') { // TODO: Change validation
      const invitationMessage = `${messageText}. ${smsConfig.pollCreationInstructions}`;

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

      return {status: 'poll_scheduled'};
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