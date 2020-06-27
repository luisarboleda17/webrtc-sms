
const Nexmo = require('nexmo');

/**
 * Handle create poll from SMS
 * @param request
 * @param h
 * @returns {{data: boolean}}
 */
const createPollFromSMS = (request, h) => {
  const pollConfig = request.server.settings.app.poll;
  const nexmoConfig = request.server.settings.app.nexmo;

  const nexmo = new Nexmo({
    apiKey: nexmoConfig.apiKey,
    apiSecret: nexmoConfig.apiSecret
  }, {debug: request.server.app.env === 'local'});

  const messageText = request.payload['text'];
  const invitationMessage = `${messageText}. ${pollConfig.pollCreationInstructions}`;

  const friendsNumbers = ['50766734913']; //Assuming we get phones from a data source TODO: Get phone numbers from data source

  // Only send SMS if it's enabled
  if (nexmoConfig.sendSmsEnabled) {
    // Send message to number's friends TODO: Add this process to a queue
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
  }

  return {data: true};
};

module.exports = {
  createPollFromSMS
};