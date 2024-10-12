const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    date: String,
    time: String,
    venue: String,
    ticketNumber: String
});

module.exports = mongoose.model('Event', eventSchema);
