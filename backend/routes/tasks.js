const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Notification = require('../models/Notification');

// Create a new task
router.post('/', async (req, res) => {
    const { title, description, priority, due, assignee, createdBy, status } = req.body;
    try {
        const task = new Task({ title, description, priority, due, assignee, createdBy, status });
        await task.save();
        const notification = new Notification({
            user: assignee,
            message: `You were assigned a new task: "${title}" due on ${due}.`,
        });
        await notification.save();
        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a task
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        await Task.deleteOne({ _id: req.params.id });
        await Notification.deleteMany({ message: { $regex: `task: "${task.title}"` } });
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        task.status = req.body.status || task.status;
        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;