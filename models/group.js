
module.exports = (mongoose, options) => {
  const Schema = mongoose.Schema;

  const groupSchema = new Schema(
    {
      hostNumber: { type: String, trim: true, unique: true, index: true, required: true },
      friends: [{ type: String, trim: true }],
    },
    options
  );

  return mongoose.model('group', groupSchema);
};