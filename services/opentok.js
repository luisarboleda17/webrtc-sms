
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

/**
 * Generate an OpenTok token to a session
 * @param apiKey
 * @param apiSecret
 * @param sessionId
 * @param role
 * @param expirationTime
 * @param name
 * @returns {*}
 */
const generateToken = (
  apiKey,
  apiSecret,
  sessionId,
  role='subscriber',
  expirationTime= (new Date().getTime() / 1000)+(7 * 24 * 60 * 60),
  name=null
) => {
  const opentok = new OpenTok(apiKey, apiSecret);
  return opentok.generateToken(sessionId, {role: role, expireTime: expirationTime, data: `name=${name}`});
};

module.exports = {
  createSession,
  generateToken
};