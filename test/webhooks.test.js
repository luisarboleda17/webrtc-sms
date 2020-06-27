
const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const { afterEach, beforeEach, test, experiment } = exports.lab = Lab.script();

const createApp = require('../app');
const testConfig = require('./config');

experiment('Webhooks ', () => {
  let server;
  const hostPhoneNumber = '50712345678';

  beforeEach(() => {
    server = createApp(testConfig);
  });

  afterEach(async () => await server.stop());

  experiment('Route integrity', () => {
    test('An invalid API key is received, then receive unauthorized', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/webhooks/poll',
        payload: {
          "msisdn": hostPhoneNumber,
          "to": server.settings.app.nexmo.senderPhoneNumber,
          "messageId": "16000002B6F4AC14",
          "text": "Dear friends, will you join me at 8pm?",
          "type": "text",
          "keyword": "DEAR",
          "api-key": `${server.settings.app.nexmo.apiKey}1`,
          "message-timestamp": "2020-06-27 05:46:16"
        }
      });
      expect(response.statusCode).to.equal(401);
    });

    test('A valid API key and an invalid receiver is received, then receive unauthorized', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/webhooks/poll',
        payload: {
          "msisdn": hostPhoneNumber,
          "to": `${server.settings.app.nexmo.senderPhoneNumber}123`,
          "messageId": "16000002B6F4AC14",
          "text": "Dear friends, will you join me at 8pm?",
          "type": "text",
          "keyword": "DEAR",
          "api-key": server.settings.app.nexmo.apiKey,
          "message-timestamp": "2020-06-27 05:46:16"
        }
      });
      expect(response.statusCode).to.equal(401);
    });
  });

  experiment('Create a poll', () => {
    test('A valid API key is received and join me command is included, then receive success', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/webhooks/poll',
        payload: {
          "msisdn": hostPhoneNumber,
          "to": server.settings.app.nexmo.senderPhoneNumber,
          "messageId": "16000002B6F4AC14",
          "text": "Dear friends, will you join me at 8pm?",
          "type": "text",
          "keyword": "DEAR",
          "api-key": server.settings.app.nexmo.apiKey,
          "message-timestamp": "2020-06-27 05:46:16"
        }
      });
      expect(response.statusCode).to.equal(200);
    });

    test('A valid API key is received and join me command is not included, then receive bad request', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/webhooks/poll',
        payload: {
          "msisdn": hostPhoneNumber,
          "to": server.settings.app.nexmo.senderPhoneNumber,
          "messageId": "16000002B6F4AC14",
          "text": "Testing if this API it's vulnerable.",
          "type": "text",
          "keyword": "DEAR",
          "api-key": server.settings.app.nexmo.apiKey,
          "message-timestamp": "2020-06-27 05:46:16"
        }
      });
      expect(response.statusCode).to.equal(400);
    });
  });
});
