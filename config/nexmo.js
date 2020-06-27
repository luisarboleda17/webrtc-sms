
/**
 * Set Nexmo configurations
 * @type {{API_KEY}}
 */
module.exports = {
  sendSmsEnabled: process.env.SEND_SMS_ENABLED === '1',
  apiKey: process.env.NEXMO_API_KEY,
  apiSecret: process.env.NEXMO_API_SECRET,
  senderPhoneNumber: process.env.NEXMO_PHONE_NUMBER
};