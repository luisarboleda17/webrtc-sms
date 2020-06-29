
module.exports = (mongoose, options) => {
  const Schema = mongoose.Schema;

  const meetingSchema = new Schema(
    {
      hostNumber: { type: String, trim: true, index: true, required: true },
      members: [{ type: String, trim: true, index: true, required: true }],
      openTokSessionId: { type: String, index: true, required: true },
    },
    options
  );

  return mongoose.model('meeting', meetingSchema);
};