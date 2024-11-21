const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    section: String,
    questionText: String,
    options: [String],
    correctAnswer: String,
    type: String, // logical, numerical, etc.
});

const testSchema = new mongoose.Schema({
    name: String,
    description: String,
    questions: [questionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    totalSections: Number,
});

module.exports = mongoose.model('Test', testSchema);
