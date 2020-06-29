
const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');

const { meeting: meetingControllers } = require('../controllers');

module.exports = [
  {
    method: 'POST',
    path: '/meeting/{meetingId}/token',
    options: {
      validate: {
        params: Joi.object({
          meetingId: Joi.string().trim().min(5).required()
        }).options({ allowUnknown: false, errors: { escapeHtml: true } }).required(),
        failAction: async (request, h, err) => {
          if (request.server.settings.app.env === 'dev' || request.server.settings.app.env === 'local') {
            console.error(err);
          }
          return Boom.badRequest();
        }
      }
    },
    handler: meetingControllers.generateTokenForMeeting
  },
  {
    method: 'GET',
    path: '/meeting/{meetingId}/friends',
    options: {
      validate: {
        params: Joi.object({
          meetingId: Joi.string().trim().min(5).required()
        }).options({ allowUnknown: false, errors: { escapeHtml: true } }).required(),
        failAction: async (request, h, err) => {
          if (request.server.settings.app.env === 'dev' || request.server.settings.app.env === 'local') {
            console.error(err);
          }
          return Boom.badRequest();
        }
      }
    },
    handler: meetingControllers.getMeetingFriends
  }
];