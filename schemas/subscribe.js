const mongoose = require('mongoose');
const User = require('./user');

const subscribeSchema = new mongoose.Schema(
    {
        subscribe: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        channelName: {
            type: String,
            required: true,
        },
    },
    { timestamps: true },
    { versionKey: false }
);

module.exports = mongoose.model('Subscribe', subscribeSchema);
