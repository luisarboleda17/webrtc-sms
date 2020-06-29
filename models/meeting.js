
module.exports = (mongoose, options) => {
  const Schema = mongoose.Schema;

  const meetingSchema = new Schema(
    {
      hostNumber: { type: String, trim: true, index: true, required: true },
      friends: [{ type: String, trim: true, index: true, required: true }],
      openTokSessionId: { type: String, required: true },
      meetingURL: { type: String, index: true, required: false}
    },
    options
  );

  return mongoose.model('meeting', meetingSchema);
};