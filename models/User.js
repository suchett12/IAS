const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: 'student' }, // 'admin' or 'student'
    profile: {
        age: Number,
        education: String,
    },
    testsTaken: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }]
});

module.exports = mongoose.model('User', userSchema);
