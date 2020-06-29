
const { BitlyClient } = require('bitly');

/**
 * Short url
 * @param accessToken
 * @param url
 * @returns {Promise<string>}
 */
const shortUrl = async (accessToken, url) => {
  const bitly = new BitlyClient(accessToken);
  const response = await bitly.shorten(url);
  return response.link;
};

module.exports = {
  shortUrl
};