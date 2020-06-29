
const Nexmo = require('nexmo');
const Boom = require('@hapi/boom');
const { BitlyClient } = require('bitly');

const { group: Group, meeting: Meeting } = require('../models');
const { opentok, group: groupService, meeting: meetingService } = require('../services');

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
  // const bitlyConfig = request.server.settings.app.bitly;

  const nexmo = new Nexmo({
    apiKey: nexmoConfig.apiKey,
    apiSecret: nexmoConfig.apiSecret
  }, {debug: request.server.app.env === 'local'});
  // const bitly = BitlyClient(bitlyConfig.accessToken, {});

  const hostNumber = request.payload['msisdn'];
  const messageText = request.payload['text'];
  const invitationMessage = `${messageText}. ${pollConfig.pollCreationInstructions}`;

  try {
    const friendsNumbers = await groupService.getFriendsByPhoneNumber(hostNumber); // Get friends numbers from database
    const session = await opentok.createSession(opentokConfig.apiKey, opentokConfig.apiSecret);

    // Create meeting
    const newMeeting = new Meeting({hostNumber, friends: friendsNumbers, openTokSessionId: session.sessionId});
    await newMeeting.save();

    // TODO: Add this process to a queue
    if (nexmoConfig.sendSmsEnabled) {
      // Send message to number's friends
      friendsNumbers.forEach(phoneNumber => nexmo.message.sendSms(
        nexmoConfig.senderPhoneNumber,
        phoneNumber,
        invitationMessage,
        (error, response) => {
          if (error) {
            // TODO: Handle send error. Resend SMS to meet host
          }
        }
      ));
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

  const nexmo = new Nexmo({
    apiKey: nexmoConfig.apiKey,
    apiSecret: nexmoConfig.apiSecret
  }, {debug: request.server.app.env === 'local'});

  const answer = request.payload['text'];
  const friendPhone = request.payload['msisdn'];
  const meetingAccepted = answer.toLowerCase() === 'yes';
  const hostResponseMessage = meetingAccepted ? `${friendPhone} ${pollConfig.acceptAnswer}` : `${friendPhone} ${pollConfig.declineAnswer}`;

  try {
    const meeting = await meetingService.getMeetingByFriendPhoneNumber(friendPhone);
    const hostPhoneNumber = meeting.hostNumber;

    // Send invitation link
    if (meetingAccepted) {
      const videoRoomInvitationMessage = `You can join entering to this link: https://meet.jit.si/${meeting._id}`; // TODO: Retrieve url from created video room
      nexmo.message.sendSms(
        nexmoConfig.senderPhoneNumber,
        friendPhone,
        videoRoomInvitationMessage,
        (error, response) => {
          if (error) {
            // TODO: Handle send error.
          }
        }
      );
    }

    // Send answer back to host TODO: Add to queue
    nexmo.message.sendSms(
      nexmoConfig.senderPhoneNumber,
      hostPhoneNumber,
      hostResponseMessage,
      (error, response) => {
        if (error) {
          // TODO: Handle send error.
        }
      }
    );

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