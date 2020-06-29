
const { meeting: Meeting } = require('../models');

/**
 * Get host number by friend phone number
 * @param friendPhoneNumber
 * @returns {Promise<unknown>}
 */
const getMeetingByFriendPhoneNumber = (friendPhoneNumber) => new Promise(
  (resolve, reject) => {
    Meeting.findOne({friends: friendPhoneNumber}, {}, { sort: { 'created_at' : -1 } }, (err, meeting) => {
      if (err) return reject(err);
      resolve(meeting);
    });
  }
);

module.exports = {
  getMeetingByFriendPhoneNumber
};