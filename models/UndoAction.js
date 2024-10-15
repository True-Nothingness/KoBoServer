// models/UndoAction.js
const mongoose = require('mongoose');
var subSchema = mongoose.Schema([{
    x: Number,
    y: Number,
  }], { _id : false });
const undoSchema = new mongoose.Schema({
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
    },
    drawing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drawing',
    },
    actionType: {
      type: String, // 'undo' or 'redo'
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    color: {
        type: Number,
        required: true,
      },
      brushThickness: {
        type: Number,
        required: true,
      },
      alpha: {
        type: Number,
        required: true,
      },
      moveTo: {
        x: Number,
        y: Number,
      },
      points: [subSchema],
  });
  
  const UndoAction = mongoose.model('UndoAction', undoSchema);
  
  module.exports = UndoAction;  