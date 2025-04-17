const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get notifications for a user
router.get('/:user', async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.params.user });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; // Must export the router