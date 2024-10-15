const express = require('express');
const router = express.Router();
const Board = require('../models/Board'); 

// Endpoint to get boards created by a specific user
router.get('/created-by', async (request, response) => {
  try {
    const userId = request.query.userId;
    console.log(userId);

    // Find boards where the specified user is the creator
    const boardsCreated = await Board.find({ 'creator._id': userId });

    // Send the array of boards as the response
    response.json(boardsCreated);
  } catch (error) {
    console.error('Error retrieving boards:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/member-of', async (request, response) => {
  try {
    const userId = request.query.userId;

    console.log('userId:', userId);

    // Find boards where the specified user is a member
    const boardsAssociated = await Board.find({
      users: {
        $elemMatch: { _id: userId, role: { $ne: 'Admin' } }
      }
    });


    // Send the array of boards as the response
    response.json(boardsAssociated);
  } catch (error) {
    console.error('Error retrieving boards associated with user:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
