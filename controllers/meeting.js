
const Boom = require('@hapi/boom');

const { meeting: meetingService, opentok: openTokService } = require('../services');

/**
 * Generate client token for meeting session
 * @param request
 * @param h
 * @returns {Promise<Boom<unknown>|{data: {token: *}}>}
 */
const generateTokenForMeeting = async (request, h) => {
  const opentokConfig = request.server.settings.app.opentok;
  const meetingId = request.params.meetingId;

  try {
    const meeting = await meetingService.getMeetingById(meetingId);

    if (meeting) {
      const token = await openTokService.generateToken(
        opentokConfig.apiKey,
        opentokConfig.apiSecret,
        meeting.openTokSessionId,
        'publisher'
      );
      return {
        data: {
          token,
          sessionId: meeting.openTokSessionId,
          apiKey: opentokConfig.apiKey
        }
      };
    } else {
      return Boom.notFound();
    }
  } catch(err) {
    console.error(err);
    return Boom.internal();
  }
};

/**
 * Get friend's info of meeting
 * @param request
 * @param h
 * @returns {Promise<Boom<unknown>|{data: {phone: *, name: *, accepted: (null|{type: BooleanConstructor, required: boolean})}[]}>}
 */
const getMeetingFriends = async (request, h) => {
  const meetingId = request.params.meetingId;

  try {
    const meeting = await meetingService.getMeetingById(meetingId);

    if (meeting) {
      return {
        data: meeting.friends.map(friend => ({
          name: friend.name,
          phone: friend.number,
          accepted: friend.accepted
        }))
      };
    } else {
      return Boom.notFound();
    }
  } catch(err) {
    console.error(err);
    return Boom.internal();
  }
};

module.exports = {
  generateTokenForMeeting,
  getMeetingFriends
};