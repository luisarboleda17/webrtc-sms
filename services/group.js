
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

/**
 * Add friend to group
 * @param hostPhone
 * @param friendPhone
 * @param friendName
 * @returns {Promise<unknown>}
 */
const addFriendToGroup = (hostPhone, friendPhone, friendName) => new Promise(
  (resolve, reject) => {
    Group.findOneAndUpdate(
      {hostNumber: hostPhone},
      {$push: { friends: { name: friendName, number: friendPhone } }},
      {upsert: true, new: true},
      (err, group) => {
        if (err) return reject(err);
        resolve(group);
    });
  }
);

module.exports = {
  getFriendsByPhoneNumber,
  addFriendToGroup
};