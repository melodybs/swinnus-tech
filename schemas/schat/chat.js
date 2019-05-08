const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;
const schatChatSchema = new Schema({
  room: {
    type: ObjectId,
    required: true,
    ref: 'SchatRoom',
  },
  user: {
    type: String,
    required: true,
  },
  chat: String,
  gif: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SchatChat', schatChatSchema, 'schat_chats');