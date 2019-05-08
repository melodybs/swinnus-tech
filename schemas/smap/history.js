const mongoose = require('mongoose');

const { Schema } = mongoose;

const smapHistorySchema = new Schema({
  query: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SmapHistory', smapHistorySchema, 'smap_historys');