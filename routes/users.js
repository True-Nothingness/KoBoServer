const express = require('express');
const User = require('./../models/User');
const router = express.Router();
const verifyToken = require('./../middlewares/verifyToken')

router.get('/', verifyToken, (request, response) => {
  const userEmail = request.query.email;
  if (!userEmail) {
    return response.status(400).json({ error: 'Email is required' });
}

User.findOne({ email: userEmail })
    .then(function (user) {
        if (!user) {
            return response.status(404).json({ error: 'User not found' });
        }
        response.json(user);
    })
    .catch((error) => {
        console.error(error);
        response.status(500).json({ error: 'Internal Server Error' });
    });
});
module.exports = router;
