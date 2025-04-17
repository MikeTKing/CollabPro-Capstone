const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

// Get comments for a task
router.get('/:taskId', async (req, res) => {
    try {
        const comments = await Comment.find({ taskId: req.params.taskId });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a comment
router.post('/', async (req, res) => {
    const { text, taskId, createdBy } = req.body;
    try {
        const comment = new Comment({ text, taskId, createdBy });
        await comment.save();

        const notification = new Notification({
            user: createdBy,
            message: `A new comment was added: "${text}"`
        });
        await notification.save();

        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; // Must export the router