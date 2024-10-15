const express = require('express');
const router = express.Router();
const Board = require('../models/Board'); // Import your Board model
const Drawing = require('../models/Drawing');

// Define a route to create a new whiteboard
router.post('/create-whiteboard', async (request, response) => {
    try {
      // Extract relevant data from the request body
      const { boardName, creatorId, creatorName } = request.body;
      console.log(boardName);  
      console.log(creatorId);  
      console.log(creatorName);
      // Create a new Board document with initial properties
      const newBoard = new Board({
        name: boardName,           // Board name
        creator: {
          _id: creatorId,           // Creator's ID
          name: creatorName,       // Creator's name
        },
        timestamp: Date.now(),     // Timestamp (current time)
        users: [{
          _id: creatorId,
          name: creatorName,
          role: 'Admin', // Set creator's permissions (e.g., 'readwrite')
        }],
      });
      
  
      // Save the new board to MongoDB
      const createdBoard = await newBoard.save();
  
      // Respond with the created board data
      response.json(createdBoard);
    } catch (error) {
      // Handle errors
      console.error('Error creating whiteboard:', error);
      response.status(500).json({ error: 'Internal Server Error' });
    }
  });
  // Server-side route to handle board deletion
router.post('/delete-whiteboard', async (request, response) => {
  try {
    const boardId = request.body.boardId;
    console.log(boardId);
    // Find the board by ID
    const board = await Board.findById(boardId);

    if (!board) {
        // Board not found
        return response.status(404).json({ error: 'Board not found' });
    }

    // Delete all drawings related to the board
    await Drawing.deleteMany({ _id: { $in: board.drawings } });

    // Remove the board from the database
    const deletedBoard = await Board.findOneAndDelete({_id: boardId }); 

    if (!deletedBoard) {
        // Deletion failed
        return response.status(500).json({ error: 'Board deletion failed' });
    }

    // Board and associated drawings deleted successfully
    response.status(204).end();
} catch (error) {
    // Handle errors
    console.error('Error deleting board and associated drawings:', error);
    response.status(500).json({ error: 'Internal Server Error' });
}
});

router.post('/join-whiteboard', async (request, response) => {
  try {
    const { boardId, userId, userName } = request.body;

    const updatedBoard = await Board.findByIdAndUpdate(
      boardId,
      {
        $addToSet: {
          users: {
            _id: userId,
            name: userName,
            role: "Viewer",
          },
        },
      },
      { new: true }
    );

    response.status(204).end();
  } catch (error) {
    console.error('Error adding user to board:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});
router.post('/remove-member', async (request, response) => {
  try {
    const userId = request.query.userId;
    const boardId = request.query.boardId;

    const updatedBoard = await Board.findByIdAndUpdate(
      boardId,
      { $pull: { users: { _id: userId } } },
      { new: true, select: 'users' }
    );

    response.status(200).json(updatedBoard.users);
  } catch (error) {
    console.error('Error removing member:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

// Change role of a member on a board
router.post('/change-role', async (request, response) => {
  try {
    const userId = request.query.userId;
    const newRole = request.query.role;
    const boardId = request.query.boardId;
    console.log(userId);

    const updatedBoard = await Board.findByIdAndUpdate(
      boardId,
      { $set: { 'users.$[elem].role': newRole } },
      { new: true, arrayFilters: [{ 'elem._id': userId }] }
    );
    console.log('Updated Board:', updatedBoard.users);

    response.status(200).json(updatedBoard.users);
  } catch (error) {
    console.error('Error changing role:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});
  
// Export the router
module.exports = router;
