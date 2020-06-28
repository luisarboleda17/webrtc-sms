
module.exports = {
  env: 'test',
  nexmo: {
    sendSmsEnabled: false,
    apiKey: '12345',
    apiSecret: '12345',
    senderPhoneNumber: '123456789'
  },
  poll: {
    pollCreateKeyword: 'join me',
    pollCreationInstructions: 'Please respond with Yes or No if you can join me!'
  }
};