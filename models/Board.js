// models/Board.js
const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  creator: {
    _id: String,
    name: String,
  },
  users: [{ 
    _id: String, 
    name: String,
    role: String 
  }], // Array of users with their roles
  drawings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drawing',
  }],
});

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;