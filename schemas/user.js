const mongoose = require('mongoose');

const { Schema } = mongoose;
const userSchema = new Schema({
  name: {
    //몽구스 자료형: String, Number, Date, Buffer, Boolean, Mixed, ObjectId, Array (몽고디비와 조금 다름)
    type: String,
    required: true,
    unique: true, //고유값
  },
  age: {
    type: Number,
    required: true,
  },
  married: {
    type: Boolean,
    required: true,
  },
  comment: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);