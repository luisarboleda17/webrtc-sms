
const OpenTok = require('opentok');

/**
 * Create an OpenTok session using Promises
 * @param apiKey
 * @param apiSecret
 * @returns {Promise<unknown>}
 */
const createSession = (apiKey, apiSecret) => new Promise(
  (resolve, reject) => {
    const opentok = new OpenTok(apiKey, apiSecret);
    opentok.createSession({mediaMode:"routed"}, (err, session) => {
      if (err) return reject(err);
      resolve(session);
    });
  }
);

module.exports = {
  createSession
};