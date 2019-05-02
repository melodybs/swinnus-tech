const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;
const commentSchema = new Schema({
  commenter: {
    //User 스키마의 사용자 ObjectId가 들어 간다는 의미
    type: ObjectId,
    required: true,
    ref: 'User',
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//model 메서드는 첫번째 인자로 컬렉션이름 생성. 첫 글자를 소문자로 만들고 복수형으로 만듬
//Comment -> comments 컬렉션, 싫다면 세번째 인자로 컬렉션 이름을 주면 됨.
module.exports = mongoose.model('Comment', commentSchema);