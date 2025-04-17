const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    due: { type: String, required: true },
    assignee: { type: String, required: true },
    createdBy: { type: String, required: true },
    status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], required: true },
});

module.exports = mongoose.model('Task', taskSchema);