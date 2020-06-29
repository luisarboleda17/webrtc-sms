
const { meeting: Meeting } = require('../models');

/**
 * Get host number by friend phone number
 * @param friendPhoneNumber
 * @returns {Promise<unknown>}
 */
const getMeetingByFriendPhoneNumber = (friendPhoneNumber) => new Promise(
  (resolve, reject) => {
    Meeting.findOne({'friends.number': friendPhoneNumber}, {}, { sort: { 'created_at' : -1 } }, (err, meeting) => {
      if (err) return reject(err);
      resolve(meeting);
    });
  }
);

/**
 * Set meeting url by
 * @param meetingId
 * @param meetingUrl
 * @returns {Promise<unknown>}
 */
const setMeetingUrl = (meetingId, meetingUrl) => new Promise(
  (resolve, reject) => {
    Meeting.findByIdAndUpdate(meetingId, {meetingURL: meetingUrl}, {new: false}, (err, meeting) => {
      if (err) return reject(err);
      resolve(meeting);
    });
  }
);

/**
 * Get meeting by id
 * @param meetingId
 * @returns {Promise<unknown>}
 */
const getMeetingById = meetingId => new Promise(
  (resolve, reject) => {
    Meeting.findById(meetingId, (err, meeting) => {
      if (err) return reject(err);
      resolve(meeting);
    });
  }
);

module.exports = {
  getMeetingByFriendPhoneNumber,
  setMeetingUrl,
  getMeetingById
};