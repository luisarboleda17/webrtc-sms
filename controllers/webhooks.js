
const Boom = require('@hapi/boom');

const { group: Group, meeting: Meeting } = require('../models');
const { opentok, group: groupService, meeting: meetingService, nexmo: nexmoService, bitly: bitlyService } = require('../services');

/**
 * Handle create poll from SMS
 * @param request
 * @param h
 * @returns {{data: boolean}}
 */
const createPollFromSMS = async (request, h) => {
  const pollConfig = request.server.settings.app.poll;
  const nexmoConfig = request.server.settings.app.nexmo;
  const opentokConfig = request.server.settings.app.opentok;
  const bitlyConfig = request.server.settings.app.bitly;

  const hostNumber = request.payload['msisdn'];
  const messageText = request.payload['text'];
  const invitationMessage = `${messageText}. ${pollConfig.pollCreationInstructions}`;

  try {
    const friendsNumbers = await groupService.getFriendsByPhoneNumber(hostNumber); // Get friends numbers from database
    const session = await opentok.createSession(opentokConfig.apiKey, opentokConfig.apiSecret);

    // Create meeting
    const newMeeting = new Meeting({hostNumber, friends: friendsNumbers, openTokSessionId: session.sessionId});
    await newMeeting.save();

    // Create meeting link
    let meetingUrl = `${pollConfig.hostUrl}${newMeeting._id}`;
    console.log(meetingUrl);
    try {
      meetingUrl = await bitlyService.shortUrl(bitlyConfig.accessToken, meetingUrl);
    } catch(err) {
      console.error('Error shortening url.', err);
    }
    await meetingService.setMeetingUrl(newMeeting._id, meetingUrl); // Save meeting url

    // TODO: Add this process to a queue
    if (nexmoConfig.sendSmsEnabled) {
      friendsNumbers.forEach(async phoneNumber => {
        await nexmoService.sendSMS(nexmoConfig.apiKey, nexmoConfig.apiSecret, nexmoConfig.senderPhoneNumber, phoneNumber, invitationMessage);
      });
    }
    return {data: true};
  } catch(err) {
    console.error(err);
    return Boom.internal();
  }
};

/**
 * Handle meet request answer
 * @param request
 * @param h
 * @returns {{data: boolean}}
 */
const answerPollRequest = async (request, h) => {
  const nexmoConfig = request.server.settings.app.nexmo;
  const pollConfig = request.server.settings.app.poll;

  const answer = request.payload['text'];
  const friendPhone = request.payload['msisdn'];
  const meetingAccepted = answer.toLowerCase() === 'yes';
  const hostResponseMessage = meetingAccepted ? `${friendPhone} ${pollConfig.acceptAnswer}` : `${friendPhone} ${pollConfig.declineAnswer}`;

  try {
    const meeting = await meetingService.getMeetingByFriendPhoneNumber(friendPhone);
    const hostPhoneNumber = meeting.hostNumber;

    // Send invitation link
    if (meetingAccepted) {
      // TODO: Do not expose internal ids
      const videoRoomInvitationMessage = `You can join entering to this link: ${meeting.meetingURL}`;
      if (nexmoConfig.sendSmsEnabled) {
        await nexmoService.sendSMS(nexmoConfig.apiKey, nexmoConfig.apiSecret, nexmoConfig.senderPhoneNumber, friendPhone, videoRoomInvitationMessage);
      }
    }

    // Send SMS back
    if (nexmoConfig.sendSmsEnabled) {
      await nexmoService.sendSMS(nexmoConfig.apiKey, nexmoConfig.apiSecret, nexmoConfig.senderPhoneNumber, hostPhoneNumber, hostResponseMessage);
    }

    return {data: true};
  } catch(err) {
    console.error(err);
    return Boom.internal();
  }
};

module.exports = {
  createPollFromSMS,
  answerPollRequest
};