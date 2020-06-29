
const Boom = require('@hapi/boom');

const { group: Group, meeting: Meeting } = require('../models');
const { opentok, group: groupService, meeting: meetingService, nexmo: nexmoService, bitly: bitlyService } = require('../services');

/**
 * Add user to group of friends
 * @param request
 * @param h
 * @returns {Promise<{data: boolean}|Boom<unknown>>}
 */
const addUserToGroup = async (request, h) => {
  const nexmoConfig = request.server.settings.app.nexmo;

  const hostNumber = request.payload['msisdn'];
  const messageText = request.payload['text'];

  const messageMatch = messageText.match(/^Add\s([a-zA-Z]+)?\s(.*)?$/i);
  const friendName = messageMatch[1];
  const friendPhone = messageMatch[2].replace(/[- )\s(\+]/gi, '');

  const backMessage = `${friendName} (${messageMatch[2]}) added to your list.`;

  try {
    await groupService.addFriendToGroup(hostNumber, friendPhone, friendName);

    // Inform user back
    await nexmoService.sendSMS(nexmoConfig.apiKey, nexmoConfig.apiSecret, nexmoConfig.senderPhoneNumber, hostNumber, backMessage);

    return {data: true};
  } catch(err) {
    console.error(err);
    return Boom.internal();
  }
};

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
  const invitationMessage = `${messageText}. ${pollConfig.pollCreationInstructions}. +${nexmoConfig.senderPhoneNumber}`;

  try {
    const friendsNumbers = await groupService.getFriendsByPhoneNumber(hostNumber); // Get friends numbers from database
    const session = await opentok.createSession(opentokConfig.apiKey, opentokConfig.apiSecret);

    // Create meeting
    const newMeeting = new Meeting({
      hostNumber,
      friends: friendsNumbers.map(friend => ({name: friend.name, number: friend.number, accepted: null})),
      openTokSessionId: session.sessionId
    });
    await newMeeting.save();

    // Create meeting link
    let meetingUrl = `${pollConfig.hostUrl}${newMeeting._id}`;
    try {
      meetingUrl = await bitlyService.shortUrl(bitlyConfig.accessToken, meetingUrl);
    } catch(err) {
      console.error('Error shortening url.', err);
    }
    await meetingService.setMeetingUrl(newMeeting._id, meetingUrl); // Save meeting url

    // TODO: Add this process to a queue and fix promise ignored
    if (nexmoConfig.sendSmsEnabled) {
      friendsNumbers.forEach(async friend => {
        await nexmoService.sendSMS(nexmoConfig.apiKey, nexmoConfig.apiSecret, nexmoConfig.senderPhoneNumber, friend.number, invitationMessage);
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

  try {
    const meeting = await meetingService.getMeetingByFriendPhoneNumber(friendPhone);
    const hostPhoneNumber = meeting.hostNumber;
    const friendInfo = meeting.friends.find(friend => friend.number === friendPhone);
    const friendMessageHeader = friendInfo && friendInfo.name ? `${friendInfo.name} (${friendPhone})` : friendPhone;

    const hostResponseMessage = meetingAccepted ? `${friendMessageHeader} ${pollConfig.acceptAnswer}` : `${friendMessageHeader} ${pollConfig.declineAnswer}`;

    // Send invitation link
    if (meetingAccepted) {
      // TODO: Do not expose internal ids
      const videoRoomInvitationMessage = `You can join entering to this link: ${meeting.meetingURL}`;
      if (nexmoConfig.sendSmsEnabled) {
        await nexmoService.sendSMS(nexmoConfig.apiKey, nexmoConfig.apiSecret, nexmoConfig.senderPhoneNumber, friendPhone, videoRoomInvitationMessage);
      }
    }

    // Save answer
    await meetingService.setFriendAnswer(meeting._id, friendPhone, meetingAccepted);

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
  addUserToGroup,
  createPollFromSMS,
  answerPollRequest
};
