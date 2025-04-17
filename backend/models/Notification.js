const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: String, required: true }, // For now, store username; later, use ObjectId
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);