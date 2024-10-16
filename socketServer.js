const socketIO = require('socket.io');
const Board = require('./models/Board');
const Drawing = require('./models/Drawing'); 
const Message = require('./models/Message');
const UndoAction = require('./models/UndoAction');

function initializeSocketServer(server) {
  const io = socketIO(server);

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinWhiteboard', async (whiteboardId) => {
      try {
        // Fetch the board data from MongoDB using whiteboardId
        const board = await Board.findById(whiteboardId);
    
        if (!board) {
          console.error('Board not found:', whiteboardId);
          return;
        }
        const drawings = await Drawing.find({ board: whiteboardId });
        if (!drawings) {
          console.log('No Drawings:', whiteboardId);
          return;
        }
    
        // Emit an event with the fetched data to the user who just joined
        socket.emit('boardData', drawings);
        // Join the room after fetching the data
        socket.join(whiteboardId);
      } catch (error) {
        console.error('Error fetching board data:', error);
      }
    });

    // Handle drawing events within a whiteboard room
  socket.on('draw', async (data) => {
  const roomsArray = Array.from(socket.rooms);
  const whiteboardId = roomsArray[1];
  try {
    // Fetch the board from MongoDB
    const board = await Board.findById(whiteboardId);
    console.log(whiteboardId);
    if (!board) {
      console.error('Board not found:', whiteboardId);
      return;
    }

    // Create a new Drawing document with the drawing data
    const newDrawing = new Drawing({
      board: whiteboardId,
      color: data.color,
      brushThickness: data.brushThickness,
      alpha: data.alpha,
      moveTo: data.moveTo,
      points: data.points,
    });
    const savedDrawing = await newDrawing.save();
    // Update the board by pushing the new drawing to the drawings array
    board.drawings.push(newDrawing);

    // Save the updated board to MongoDB
    const updatedBoard = await board.save();

    // Broadcast the drawing data to all connected clients except the sender
    socket.to(whiteboardId).emit('draw', data);

    console.log('Drawing saved to MongoDB:', savedDrawing);
  } catch (error) {
    console.error('Error handling draw event:', error);
  }
});
socket.on('undo', async () => {
  const roomsArray = Array.from(socket.rooms);
  const whiteboardId = roomsArray[1];

  try {
    const board = await Board.findById(whiteboardId);
    console.log(board);
    // Find the latest drawing for the board
    if (board && board.drawings.length > 0) {
      // Get the last drawing ID from the array
    const latestDrawingId = board.drawings[board.drawings.length - 1];
    const latestDrawing = await Drawing.findById(latestDrawingId);

    if (latestDrawing) {
      // Save undo action to the undo/redo table
      const undoAction = new UndoAction({
        board: whiteboardId,
        drawing: latestDrawing._id,
        actionType: 'undo',
        color: latestDrawing.color,
        brushThickness: latestDrawing.brushThickness,
        alpha: latestDrawing.alpha,
        moveTo: latestDrawing.moveTo,
        points: latestDrawing.points,
      });
      await undoAction.save();
      board.drawings.pull({ _id: latestDrawing._id });
      const saveResult = await board.save();
      console.log('Board save result:', saveResult);

      // Remove the latest drawing from the board
      const deleteResult = await Drawing.deleteOne({ _id: latestDrawing._id });
      console.log(deleteResult);
      // Broadcast the undo event to all connected clients except the sender
      socket.to(whiteboardId).emit('undo');
      console.log('Undoing');
    }
  }
  } catch (error) {
    console.error('Error handling undo event:', error);
  }
});

socket.on('redo', async () => {
  const roomsArray = Array.from(socket.rooms);
  const whiteboardId = roomsArray[1];

  try {
      // Find the latest undo action for the board
      const latestUndoAction = await UndoAction.findOne({
          board: whiteboardId,
          actionType: 'undo',
      }, null, { sort: { createdAt: -1 } });
      console.log(latestUndoAction);

      if (!latestUndoAction) {
          console.log('No undo action found for redo.');
          return;
      }

      // Create a new drawing instead of trying to reuse the ID
      const undoneDrawing = new Drawing({
          board: whiteboardId,
          color: latestUndoAction.color,
          brushThickness: latestUndoAction.brushThickness,
          alpha: latestUndoAction.alpha,
          moveTo: latestUndoAction.moveTo,
          points: latestUndoAction.points,
      });

      // Save the new drawing
      await undoneDrawing.save();
      
      // Add the undone drawing back to the board
      const board = await Board.findById(whiteboardId);
      board.drawings.push(undoneDrawing._id); // Use the new ID
      await board.save();
      
      // Broadcast the redo event to all connected clients except the sender
      socket.to(whiteboardId).emit('redo');
      console.log('Redoing');
  } catch (error) {
      console.error('Error handling redo event:', error);
  }
});



  socket.on('joinChat', async (boardId) => {
    try {
        // Fetch existing messages for the specified board from the database
        const existingMessages = await Message.find({ board: boardId });

        // Emit the existing messages to the user who just joined
        socket.emit('existingMessages', existingMessages);
        console.log(existingMessages);
    } catch (error) {
        console.error('Error fetching existing messages:', error);
    }
  });
    // Listen for the "messageSent" event
  socket.on('messageSent', async (messageData) => {
    const roomsArray = Array.from(socket.rooms);
    const whiteboardId = roomsArray[1];
    try {
      // Create a new message using the Message model
      const newMessage = new Message({
        board: whiteboardId,
        content: messageData.content,
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        timestamp: new Date()
      });

      // Save the message to MongoDB
      await newMessage.save();

      // Broadcast the new message to all connected clients
      io.emit('newMessage', newMessage);
      console.log(newMessage);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
}

module.exports = initializeSocketServer;
