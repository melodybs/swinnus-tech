const mongoose = require('mongoose');

const { Schema } = mongoose;
const schatRoomSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  max: {
    type: Number,
    required: true,
    default: 10,
    min: 2,
  },
  owner: {
    type: String,
    required: true,
  },
  password: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//강제 이름 설정이 싫다면 세번째 인자로 설정 가능
module.exports = mongoose.model('SchatRoom', schatRoomSchema, 'schat_rooms');