// models/Drawing.js
const mongoose = require('mongoose');
var subSchema = mongoose.Schema([{
  x: Number,
  y: Number,
}], { _id : false });
const drawingSchema = new mongoose.Schema({
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
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

const Drawing = mongoose.model('Drawing', drawingSchema);

module.exports = Drawing;
