
const Nexmo = require('nexmo');

/**
 * Send SMS to phone number
 * @param apiKey
 * @param apiSecret
 * @param sender
 * @param to
 * @param message
 * @returns {Promise<unknown>}
 */
const sendSMS = (apiKey, apiSecret, sender, to, message) => new Promise(
  (resolve, reject) => {
    const nexmo = new Nexmo({apiKey: apiKey, apiSecret: apiSecret});
    nexmo.message.sendSms(sender, to, message, (error, response) => {
      if (error) return reject(error);
      resolve(response);
    });
  }
);

module.exports = {
  sendSMS
};