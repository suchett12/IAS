const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
    answers: [String],  // User's answers
    timeSpent: [Number],  // Time spent on each question (in seconds)
    switches: [Number],  // Number of switches per question
    score: Number
});

module.exports = mongoose.model('TestResult', testResultSchema);
