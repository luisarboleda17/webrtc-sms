
module.exports = {
  /**
   * Sanitize received sms message strings
   * @param message
   * @returns {*}
   */
  sanitizeMessage: message => {
    return message ? message.trim() : null; // TODO: Add stronger sanitizer
  }
};