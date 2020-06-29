
const { group: Group } = require('../models');

/**
 * Get friends by host phone number
 * @param phoneNumber
 * @returns {Promise<unknown>}
 */
const getFriendsByPhoneNumber = (phoneNumber) => new Promise(
  (resolve, reject) => {
    Group.findOne({hostNumber: phoneNumber}, (err, group) => {
      if (err) return reject(err);
      resolve(group.friends);
    });
  }
);

module.exports = {
  getFriendsByPhoneNumber
};