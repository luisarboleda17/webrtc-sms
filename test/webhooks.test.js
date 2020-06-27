
const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const { afterEach, beforeEach, test, experiment } = exports.lab = Lab.script();

const createApp = require('../app');
const testConfig = require('./config');

experiment('Webhooks', () => {
  let server;
  const hostPhoneNumber = '50712345678';

  beforeEach(() => {
    server = createApp(testConfig);
  });

  afterEach(async () => await server.stop());

  experiment('Route validation', () => {
    experiment('Input validation - Assuming that API key and receiver phone number valid', () => {
      test('Missing payload, then receive bad request', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/webhooks/poll',
          payload: null
        });
        expect(response.statusCode).to.equal(400);
      });

      test('Invalid sender phone number, then receive bad request', async () => {
        const mockNumbers = ['123', null, '1', 12, 50712345678, '000', undefined];
        for (const msisdn of mockNumbers) {
          const response = await server.inject({
            method: 'POST',
            url: '/webhooks/poll',
            payload: {
              "msisdn": msisdn,
              "to": server.settings.app.nexmo.senderPhoneNumber,
              "messageId": "16000002B6F4AC14",
              "text": "Dear friends, will you join me at 8pm?",
              "type": "text",
              "keyword": "DEAR",
              "api-key": server.settings.app.nexmo.apiKey,
              "message-timestamp": "2020-06-27 05:46:16"
            }
          });
          expect(response.statusCode).to.equal(400);
        }
      });

      test('Invalid messageId, then receive bad request', async () => {
        const mockIds = [null, undefined, '', 21321, 2341234324, 32473217463];
        for (const messageId of mockIds) {
          const response = await server.inject({
            method: 'POST',
            url: '/webhooks/poll',
            payload: {
              "msisdn": hostPhoneNumber,
              "to": server.settings.app.nexmo.senderPhoneNumber,
              "messageId": messageId,
              "text": "Dear friends, will you join me at 8pm?",
              "type": "text",
              "keyword": "DEAR",
              "api-key": server.settings.app.nexmo.apiKey,
              "message-timestamp": "2020-06-27 05:46:16"
            }
          });
          expect(response.statusCode).to.equal(400);
        }
      });

      test('Invalid text, then receive bad request', async () => {
        const mockTexts = ['  ', null, undefined, '42+*^^43//(/', '9378//<>>', 'Testing if its possible'];
        for (const text of mockTexts) {
          const response = await server.inject({
            method: 'POST',
            url: '/webhooks/poll',
            payload: {
              "msisdn": hostPhoneNumber,
              "to": server.settings.app.nexmo.senderPhoneNumber,
              "messageId": "16000002B6F4AC14",
              "text": text,
              "type": "text",
              "keyword": "DEAR",
              "api-key": server.settings.app.nexmo.apiKey,
              "message-timestamp": "2020-06-27 05:46:16"
            }
          });
          expect(response.statusCode).to.equal(400);
        }
      });

      test('Invalid type, then receive bad request', async () => {
        const mockTypes = ['binary', 'message', null, undefined, '6787i//***^'];
        for (const type of mockTypes) {
          const response = await server.inject({
            method: 'POST',
            url: '/webhooks/poll',
            payload: {
              "msisdn": hostPhoneNumber,
              "to": server.settings.app.nexmo.senderPhoneNumber,
              "messageId": "16000002B6F4AC14",
              "text": "Dear friends, will you join me at 8pm?",
              "type": type,
              "keyword": "DEAR",
              "api-key": server.settings.app.nexmo.apiKey,
              "message-timestamp": "2020-06-27 05:46:16"
            }
          });
          expect(response.statusCode).to.equal(400);
        }
      });

      test('Invalid API key, then receive bad request', async () => {
        const mockAPIKeys = [null, undefined, ''];
        for (const apiKey of mockAPIKeys) {
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
              "api-key": apiKey,
              "message-timestamp": "2020-06-27 05:46:16"
            }
          });
          expect(response.statusCode).to.equal(400);
        }
      });
    });

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

  experiment('Answer to a poll request', () => {
    test('A valid API key and a positive answer is received, then receive success', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/webhooks/poll',
        payload: {
          "msisdn": hostPhoneNumber,
          "to": server.settings.app.nexmo.senderPhoneNumber,
          "messageId": "16000002B6F4AC14",
          "text": "yes",
          "type": "text",
          "keyword": "DEAR",
          "api-key": server.settings.app.nexmo.apiKey,
          "message-timestamp": "2020-06-27 05:46:16"
        }
      });
      expect(response.statusCode).to.equal(200);
    });

    test('A valid API key and a negative answer is received, then receive success', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/webhooks/poll',
        payload: {
          "msisdn": hostPhoneNumber,
          "to": server.settings.app.nexmo.senderPhoneNumber,
          "messageId": "16000002B6F4AC14",
          "text": "No",
          "type": "text",
          "keyword": "DEAR",
          "api-key": server.settings.app.nexmo.apiKey,
          "message-timestamp": "2020-06-27 05:46:16"
        }
      });
      expect(response.statusCode).to.equal(200);
    });

    test('A valid API key and another answer is received, then receive bad request', async () => {
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
