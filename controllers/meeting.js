
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
  } catch(err) {
    console.error(err);
    return Boom.internal();
  }
};

module.exports = {
  generateTokenForMeeting
};