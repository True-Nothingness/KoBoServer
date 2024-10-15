// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  content: {
    type: String,
    required: true,
    max: 255
  },
  senderId: {
    type: String,
    required: true
  },
  senderName:{
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
